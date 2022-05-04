/* eslint-disable @typescript-eslint/restrict-plus-operands */
import jsQR from 'jsqr';
import { Point } from 'jsqr/dist/locator';
import { findNeighborsVoronoi } from './voronoi.js';

const constraints = { video: { facingMode: 'environment' }, audio: false };
const cameraView = <HTMLVideoElement>document.querySelector('#camera--view');
const cameraOutput = <HTMLImageElement>document.querySelector('#camera--output');
const cameraSensor = <HTMLCanvasElement>document.querySelector('#camera--sensor');
const cameraTrigger = <HTMLButtonElement>document.getElementById('camera--trigger');
const cameraMain = <HTMLElement>document.getElementById('camera');
const single_screen_button = <HTMLButtonElement>document.getElementById('single-screen-button');
const multiple_screen_button = <HTMLButtonElement>document.getElementById('multiple-screen-button');
let number: number;
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const id: string | null = urlParams.get('id');

export class QRlocation {
    id : string;
    middle_location: {x: number, y:number};
    topleft_location: {x: number, y:number};
    bottomright_location: {x: number, y:number};
    neighbours: string[];

    constructor(id: string, middle_location: {x: number, y:number}, topleft_location: {x: number, y:number}, bottomright_location: {x: number, y:number}) {
        this.id = id;
        this.middle_location = middle_location;
        this.bottomright_location = bottomright_location;
        this.topleft_location = topleft_location;
        this.neighbours = [];
    }

    addNeighbour(qrloc: QRlocation){
        this.neighbours.push(qrloc.id)
    }
}
    
single_screen_button.addEventListener('click',  function() {
    window.location.href = '/catcaster/controller/?id=' + id + '&mode=singlescreen';
});

const url = 'wss' + window.location.href.substr(5);

let websocket = new WebSocket(url);
console.log('Starting Websocket connection...');

websocket.onopen = () => {
    console.log('Connection established.');
};

websocket.onmessage = async (message:WebSocketMessage) => {
    const mes = <Message>JSON.parse(message.data);
    console.log('received message from : ', mes.id, '  |  client is: ', mes.client);
    if(mes.client == 'disconnect' && mes.id == id){
        console.log('Illegal ID, removing websocket connection.');
        websocket.close();
        window.location.href = '/catcaster/error/'
    }
};

websocket.onclose = (event) => {
    websocket.send(JSON.stringify({client: 'disconnected', id: id}))
    console.log('Connection lost, attempting to reconnect...') //ADD TO HTML PAGE !!!!
    let tries = 0
    while (websocket.readyState == 3 && tries <= 10) {
        websocket = new WebSocket(url);
        tries += 1;
    };
    if (websocket.readyState == 1) {
        console.log('Reconnected succesfully.') //ADD TO HTML PAGE !!!!
    }
    else {
        console.log('Reconnection failed, terminating...') //ADD TO HTML PAGE !!!!
    }
}


// function send_multiscreen() {
//     const url = 'wss' + window.location.href.substr(5);

//     const websocket = new WebSocket(url);
//     console.log('Starting Websocket connection...');


// single_screen_button.addEventListener('click',  function() {
//     window.location.href = '/catcaster/controller/?id=' + <string>id + '&mode=singlescreen';
// });
// }

function cameraStart() {
    navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function(stream) {
            const track = stream.getTracks()[0];
            cameraView.srcObject = stream;
        })
        .catch(function(error) {
            console.error('Oops. Something is broken.', error);
        });
}

function getQRLocations() {
    try {
        //Scan camera for locations and contents of QR codes
        const qrlocations:Array<QRlocation> = QR(number);
        alert('QR-codes found');
        const sites: {x: number; y: number; id: string}[] = [];

        for (const qrloc of qrlocations) {
            sites.push({x: qrloc.middle_location.x, y: qrloc.middle_location.y, id: qrloc.id});
        }

        //Create voronoi triangulation, neighbours contains edges
        const neighboursPerID = findNeighborsVoronoi(sites);

        for (const qrID of neighboursPerID) {
            let qr: QRlocation;
            let neighbour: QRlocation;
            for (const qrloc of qrlocations) {
                if (qrID.id === qrloc.id) {
                    qr = qrloc;
                }
            }
            for (const neighbourid of qrID.neighborsOfID) {
                for (const qrloc of qrlocations) {
                    if (neighbourid === qrloc.id) {
                        neighbour = qrloc;
                    }
                }
            qr!.addNeighbour(neighbour!);
            }
        }

        websocket.send(JSON.stringify({client:'qrlocations', data: qrlocations}))

        /* server code */
    } catch(e) {
        alert('No QR-codes found\r\n' + e);
    }
}

cameraTrigger.onclick = function() {
    cameraSensor.width = cameraView.videoWidth;
    cameraSensor.height = cameraView.videoHeight;
    cameraSensor.getContext('2d')!.drawImage(cameraView, 0, 0);
    cameraOutput.src = cameraSensor.toDataURL('image/webp');
    cameraOutput.classList.add('taken');
    cameraMain.style.display = 'block';
    cameraView.style.display = 'none';
    cameraTrigger.style.display = 'none';
    
    getQRLocations();
};

window.addEventListener('load', cameraStart, false);


// eslint-disable-next-line @typescript-eslint/no-misused-promises
multiple_screen_button.addEventListener('click', function() {
    cameraMain.style.display = 'block';
    cameraTrigger.style.display = 'block';
    cameraView.style.display = 'block';
    multiple_screen_button.style.display = 'none';
    single_screen_button.style.display = 'none';
    //Enter amount of screens
    let input: string | null = prompt('Enter the amount of QR codes:');
    while (input === null) {
        input = prompt('Enter the amount of QR codes:');
    }

    number = parseInt(input);
    input = null;

    while (number < 2 || number === null || number === undefined) {
        while (input === null) {
            input = prompt('Please enter more than one screen:');
        }
        number = parseInt(input);
    }
    //change qr code
    websocket.send(JSON.stringify({client: 'multi-screen', id: id}));
    window.location.href = '/catcaster/controller/?id='+id+'&mode=multiscreen';
    //Start camera
    // window.location.href = '/catcaster/controller/?id=' + <string>id + '&mode=multiscreen';

    // window.location.href = '/catcaster/controller/?id=' + id + '&mode=multiscreen';
});

//returns an array containing tuples of all found QR codes {x, y, id}
//Tries to find the given number of QR codes one at a time
//If a QR code is found, it is removed from the image so others can be found
//If not enough QR codes can be found (due to inaccuracies), take a new image, try again
function QR(number: number) {
    const imageData = cameraSensor.getContext('2d')!.getImageData(0, 0, cameraSensor.width, cameraSensor.height);
    cameraSensor.getContext('2d')!.drawImage(cameraView, 0, 0);
    if (imageData === null || imageData === undefined) {
        alert('Image not found')
        throw new Error('imageData was null');
    }
    const data = imageData.data;

    const qrlocations: QRlocation[] = [];
    let current_number = 0;

    //Search image until the desired number of QR codes is found
    while (current_number < number) {

        const qr = jsQR(data.slice(), cameraSensor.width, cameraSensor.height, {inversionAttempts: 'dontInvert'});

        //If the scan fails, create a new image, try again
        if (qr === null) {
            const qrlocs: QRlocation[] = QR(number);
            return qrlocs;

        }

        const topLeftCorner: Point = qr.location.topLeftCorner;
        const bottomRightCorner: Point = qr.location.bottomRightCorner;
        const middle_location_x: number = (topLeftCorner.x +bottomRightCorner.x)/2;
        const middle_location_y: number = (topLeftCorner.y+bottomRightCorner.y)/2;

        
        const id: string = qr.data;
        const middle_location: {x: number, y: number} = {x: middle_location_x, y: middle_location_y};
        const qr_init = new QRlocation(id, middle_location, topLeftCorner, bottomRightCorner);
        qrlocations.push(qr_init);


        const topRightCorner: Point = qr.location.topRightCorner;
        const bottomLeftCorner: Point = qr.location.bottomLeftCorner;

        const topLeftFinderPattern = qr.location.topLeftFinderPattern;
        const topRightFinderPattern = qr.location.topRightFinderPattern;
        const bottomLeftFinderPattern = qr.location.bottomLeftFinderPattern;


        //Hide found QR code on current image
        for (let x = Math.round(topLeftCorner.x); x <= Math.round(topLeftFinderPattern.x*2-topLeftCorner.x); x++) {
            for (let y = Math.round(topLeftCorner.y); y <= Math.round(topLeftFinderPattern.y*2-topLeftCorner.y); y++) {
                for (let i = 0; i < 4; i++) {
                    data[4*cameraSensor.width*y+4*x+i] = 255;
                }
            }
        }

        for (let x = Math.round(topRightCorner.x-2*(topRightCorner.x-topRightFinderPattern.x)); x <= Math.round(topRightCorner.x); x++) {
            for (let y = Math.round(topRightCorner.y); y <= Math.round((topRightFinderPattern.y-topRightCorner.y)*2+topRightCorner.y); y++) {
                for (let i = 0; i < 4; i++) {
                    data[4*cameraSensor.width*y+4*x+i] = 255;
                }
            }
        }

        for (let x = Math.round(bottomLeftCorner.x); x <= Math.round(bottomLeftFinderPattern.x*2-bottomLeftCorner.x); x++) {
            for (let y = Math.round(bottomLeftCorner.y-2*(bottomLeftCorner.y-bottomLeftFinderPattern.y)); y <= Math.round(bottomLeftCorner.y); y++) {
                for (let i = 0; i < 4; i++) {
                    data[4*cameraSensor.width*y+4*x+i] = 255;
                }
            }
        }
        current_number++;
    }

    return qrlocations;
}
