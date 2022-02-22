const jsQR = require('jsqr');

export function decodeQR(pixelarray: Uint8ClampedArray, width: number, height: number) {

    const qrlocations: Array<[[number, number], number]> = [];

    while (jsQR(pixelarray, width, height)) {
        const code = jsQR(pixelarray, width, height);
        const topLeftCorner = code.location.topLeftCorner;
        const bottomRightCorner = code.location.bottomRightCorner;
        const middle_location_x = (topLeftCorner[0]+bottomRightCorner[0])/2;
        const middle_location_y = (topLeftCorner[1]+bottomRightCorner[1])/2;
        const id = code.data;
        const middle_location: [[number, number], number] = [[middle_location_x, middle_location_y], id]
        qrlocations.push(middle_location);

        const topLeftFinderPattern = code.location.topLeftFinderPattern;

        for (let x = topLeftCorner[0]; x <= topLeftFinderPattern[0]; x+4){
            for (let y = topLeftCorner[1]; y <= topLeftFinderPattern[1]; y+4){
                for (let i = 0; i < 4; i++) {
                    pixelarray[4*width*y+4*x+i] = 0;  
                }
            }
        }
    }
    
    return qrlocations;

}
