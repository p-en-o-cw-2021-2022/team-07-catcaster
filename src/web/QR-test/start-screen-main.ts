import jsQR from 'jsqr';
import { Point } from 'jsqr/dist/locator';
import { findNeighborsVoronoi } from './voronoi.js';

const single_screen_button = <HTMLButtonElement>document.getElementById('single-screen-button');
const multiple_screen_button = <HTMLButtonElement>document.getElementById('multiple-screen-button');
const video = <HTMLVideoElement>document.getElementById('video');
const canvas : HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('canvas');
const camera_button = <HTMLButtonElement>document.getElementById('start-camera');


single_screen_button.addEventListener('click',  function() {
    /* server code */
});

camera_button.addEventListener('click',  async function() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    video.srcObject = stream;
});

multiple_screen_button.addEventListener('click', async function() {
    
    //const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    //video.srcObject = stream;

    const number = parseInt(prompt('Enter the amount of QR codes:')!);


    const promise = Promise.resolve(QR(number));
    promise.then(function(val) {
        console.log(val);
        const qrlocations = val;
        const neighbours = findNeighborsVoronoi(qrlocations!);
        console.log(neighbours)
    }).catch((error) => {
        console.log(error);
      });

    //const neighbours = findNeighborsVoronoi(qrlocations);
    //console.log(neighbours)


    /* server code */
});

//returns an Array<[[number, number], [number, number]]>, containing the pairs of neighbors ((x1,y1),(x2,y2)) (edges of voronoi diagram)
async function QR(number: number) {
    let ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
    let imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);

    let data = imageData!.data;
    //const width = imageData!.width;
    //const height = imageData!.height;

    
    //const image: ImageData = new ImageData(data, width, height);
    

    let qrlocations: { x: number; y: number; id: string}[] = new Array()
    let current_number = 0;



    while (current_number < number) {

        let qr = jsQR(data.slice(), canvas.width, canvas.height, {inversionAttempts: 'dontInvert'});

        if (qr == null) {
            QR(number);
            return;
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
        


        for (let x = Math.round(topLeftCorner.x); x <= Math.round(topLeftFinderPattern.x*2-topLeftCorner.x); x++) {
            for (let y = Math.round(topLeftCorner.y); y <= Math.round(topLeftFinderPattern.y*2-topLeftCorner.y); y++) {
                for (let i = 0; i < 4; i++) {
                    data[4*canvas.width*y+4*x+i] = 255;
                //console.log(4*canvas.width*y+4*x+i)
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

        //const image2: ImageData = new ImageData(data, width, height);

        current_number++;
    }

    console.log(qrlocations)
   
    return qrlocations;

    
}