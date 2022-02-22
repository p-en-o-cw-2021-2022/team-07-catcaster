
import jsQR from 'jsqr';
import { Point } from 'jsqr/dist/locator';
    
    
    const camera_button = <HTMLButtonElement>document.getElementById('start-camera');


    const video = <HTMLVideoElement>document.getElementById("video");
    const click_button = <HTMLButtonElement>document.getElementById('click-photo');
    const canvas : HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('canvas');
    
    camera_button.addEventListener('click', async function() {
           let stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        video.srcObject = stream;
    });
    
    click_button.addEventListener('click', function() {
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
    
        const data = imageData!.data;
        for (let i = 0; i < data.length; i += 4) {
            data[i] ^= 255;     // red
            data[i + 1] ^= 255; // green
            data[i + 2] ^= 255; // blue
           }
    
           // data url of the image
        console.log(data);


        const qrlocations = decodeQR(data, canvas.width, canvas.height);

        console.log(qrlocations);
    });

function decodeQR(pixelarray: Uint8ClampedArray, width: number, height: number) {

    const qrlocations: Array<[[number, number], String]> = [];

    while (jsQR(pixelarray, width, height)) {
        const code = jsQR(pixelarray, width, height);
        const topLeftCorner: Point = code!.location.topLeftCorner;
        const bottomRightCorner: Point = code!.location.bottomRightCorner;
        const middle_location_x = (topLeftCorner.x +bottomRightCorner.x)/2;
        const middle_location_y = (topLeftCorner.y+bottomRightCorner.y)/2;
        const id = code!.data;
        const middle_location: [[number, number], String] = [[middle_location_x, middle_location_y], id]
        qrlocations.push(middle_location);

        const topLeftFinderPattern = code!.location.topLeftFinderPattern;

        for (let x = topLeftCorner.x; x <= topLeftFinderPattern.x; x++){
            for (let y = topLeftCorner.y; y <= topLeftFinderPattern.y; y++){
                for (let i = 0; i < 4; i++) {
                    pixelarray[4*width*y+4*x+i] = 0;  
                }
            }
        }
    }
    
    return qrlocations;

}

    

    
    