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



take_photo.addEventListener('click',  async function() {
    //Scan camera for locations and contents of QR codes
    const qrlocations = QR(number);

    //console.log(qrlocations);

    //Create voronoi triangulation, neighbours contains edges
    const neighbours = findNeighborsVoronoi(qrlocations);

    //console.log(neighbours);

    /* server code */
});



multiple_screen_button.addEventListener('click', async function() {

    //Enter amount of screens
    number = parseInt(prompt('Enter the amount of QR codes:')!);
    while (number < 2) {
        number = parseInt(prompt('Please enter more than one screen:')!);
    }

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
    const data = imageData!.data;

    const qrlocations: { x: number; y: number; id: string}[] = [];
    let current_number = 0;


    //Search image until the desired number of QR codes is found
    while (current_number < number) {

        const qr = jsQR(data.slice(), canvas.width, canvas.height, {inversionAttempts: 'dontInvert'});

        //If the scan fails, create a new image, try again
        if (qr == null) {
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