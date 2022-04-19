import jsQR from 'jsqr';
import { Point } from 'jsqr/dist/locator';
import { findNeighborsVoronoi } from './voronoi.js';

const single_screen_button = <HTMLButtonElement>document.getElementById('single-screen-button');
const multiple_screen_button = <HTMLButtonElement>document.getElementById('multiple-screen-button');
const video = <HTMLVideoElement>document.getElementById('video');
const canvas : HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('canvas');
const take_photo = <HTMLButtonElement>document.getElementById('take-photo');
let number: number;


single_screen_button.addEventListener('click',  function() {
    /* server code */
});

function send_multiscreen(){
    const url = 'wss' + window.location.href.substr(5);

    const websocket = new WebSocket(url);
    console.log('Starting Websocket connection...');

    websocket.onopen = () => {
        console.log('Connection established.');
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const id: string | null = urlParams.get('id');
        websocket.send(JSON.stringify({client: 'multi-screen', id: id}));
    };

    websocket.onmessage = (message:WebSocketMessage) => {
        const mes = <Message>JSON.parse(message.data);
        console.log('received message from : ', mes.id, '  |  client is: ', mes.client);

    };
}

take_photo.addEventListener('click', function() {
    try {
        //Scan camera for locations and contents of QR codes
        const qrlocations = QR(number);

        console.log(qrlocations);

        //Create voronoi triangulation, neighbours contains edges
        const neighbours = findNeighborsVoronoi(qrlocations);

        console.log(neighbours);

        /* server code */
    } catch {
        console.log('Something went wrong, try taking a clearer photo.');
    }
});



// eslint-disable-next-line @typescript-eslint/no-misused-promises
multiple_screen_button.addEventListener('click', async function() {

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

    send_multiscreen();

    //Start camera
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    video.srcObject = stream;

    take_photo.style.visibility = 'visible';


});

//returns an array containing tuples of all found QR codes {x, y, id}
//Tries to find the given number of QR codes one at a time
//If a QR code is found, it is removed from the image so others can be found
//If not enough QR codes can be found (due to inaccuracies), take a new image, try again
function QR(number: number) {
    //Draw camera on canvas to get image data
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
    if (imageData === null || imageData === undefined) {
        throw new Error('imageData was null');
    }
    const data = imageData.data;

    const qrlocations: { x: number; y: number; id: string}[] = [];
    let current_number = 0;

    //Search image until the desired number of QR codes is found
    while (current_number < number) {

        const qr = jsQR(data.slice(), canvas.width, canvas.height, {inversionAttempts: 'dontInvert'});

        //If the scan fails, create a new image, try again
        if (qr === null) {
            const qrlocs: { x: number; y: number; id: string}[] = QR(number);
            return qrlocs;

        }

        const topLeftCorner: Point = qr.location.topLeftCorner;
        const bottomRightCorner: Point = qr.location.bottomRightCorner;
        const middle_location_x: number = (topLeftCorner.x +bottomRightCorner.x)/2;
        const middle_location_y: number = (topLeftCorner.y+bottomRightCorner.y)/2;

        const id: string = qr.data;
        const middle_location: {x: number, y: number, id: string} = {x: middle_location_x, y: middle_location_y, id: id};
        qrlocations.push(middle_location);


        const topRightCorner: Point = qr.location.topRightCorner;
        const bottomLeftCorner: Point = qr.location.bottomLeftCorner;

        const topLeftFinderPattern = qr.location.topLeftFinderPattern;
        const topRightFinderPattern = qr.location.topRightFinderPattern;
        const bottomLeftFinderPattern = qr.location.bottomLeftFinderPattern;


        //Hide found QR code on current image
        for (let x = Math.round(topLeftCorner.x); x <= Math.round(topLeftFinderPattern.x*2-topLeftCorner.x); x++) {
            for (let y = Math.round(topLeftCorner.y); y <= Math.round(topLeftFinderPattern.y*2-topLeftCorner.y); y++) {
                for (let i = 0; i < 4; i++) {
                    data[4*canvas.width*y+4*x+i] = 255;
                }
            }
        }

        for (let x = Math.round(topRightCorner.x-2*(topRightCorner.x-topRightFinderPattern.x)); x <= Math.round(topRightCorner.x); x++) {
            for (let y = Math.round(topRightCorner.y); y <= Math.round((topRightFinderPattern.y-topRightCorner.y)*2+topRightCorner.y); y++) {
                for (let i = 0; i < 4; i++) {
                    data[4*canvas.width*y+4*x+i] = 255;
                }
            }
        }

        for (let x = Math.round(bottomLeftCorner.x); x <= Math.round(bottomLeftFinderPattern.x*2-bottomLeftCorner.x); x++) {
            for (let y = Math.round(bottomLeftCorner.y-2*(bottomLeftCorner.y-bottomLeftFinderPattern.y)); y <= Math.round(bottomLeftCorner.y); y++) {
                for (let i = 0; i < 4; i++) {
                    data[4*canvas.width*y+4*x+i] = 255;
                }
            }
        }
        current_number++;
    }

    return qrlocations;
}
