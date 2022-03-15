
import jsQR from 'jsqr';
import { Point } from 'jsqr/dist/locator';
import { number, options } from 'yargs';
import {Voronoi} from 'voronoi';


const camera_button = <HTMLButtonElement>document.getElementById('start-camera');
const qr_button = <HTMLButtonElement>document.getElementById('qr-button');
const video = <HTMLVideoElement>document.getElementById('video');
const click_button = <HTMLButtonElement>document.getElementById('click-photo');
const canvas : HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('canvas');
const canvas2 : HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('canvas2');
const graph : HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('graph');

qr_button.addEventListener('click',  function() {
    const qrcode = <HTMLImageElement>document.getElementById('qrcode');
    qrcode.src = 'https://chart.googleapis.com/chart?cht=qr&chl="TESTESTESTESTEST&chs=160x160&chld=L|0';
});
camera_button.addEventListener('click',  async function() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    video.srcObject = stream;
});

click_button.addEventListener('click', function() {
    const number = parseInt(prompt('Enter the amount of QR codes:')!);
    QR(number);
});

function wait(ms: number) {
    return new Promise(r => setTimeout(r, ms));
}


async function QR(number: number) {
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
    //await wait(500);
    const ctx2 = canvas2.getContext('2d');


    const data = imageData!.data;
    const width = imageData!.width;
    const height = imageData!.height;

    /*
    for (let i = 0; i < data.length; i += 4) {
        data[i] ^= 255;     // red
        data[i + 1] ^= 255; // green
        data[i + 2] ^= 255; // blue
    }*/
    const image: ImageData = new ImageData(data, width, height);
    ctx2?.putImageData(image, 0, 0);


    const qrlocations: Array<[[number, number], string]> = [];
    let current_number = 0;



    while (current_number < number) {

        const qr = jsQR(data.slice(), canvas.width, canvas.height, {inversionAttempts: 'dontInvert'});



        if (qr == null) {
        //console.log(current_number)
            QR(number);
            return;
        }

        const topLeftCorner: Point = qr.location.topLeftCorner;
        const bottomRightCorner: Point = qr.location.bottomRightCorner;
        const middle_location_x = (topLeftCorner.x +bottomRightCorner.x)/2;
        const middle_location_y = (topLeftCorner.y+bottomRightCorner.y)/2;
        //console.log(topLeftCorner,bottomRightCorner,middle_location_x,middle_location_y)
        const id = qr.data;
        const middle_location: [[number, number], string] = [[middle_location_x, middle_location_y], id];
        qrlocations.push(middle_location);


        const topRightCorner: Point = qr.location.topRightCorner;
        const bottomLeftCorner: Point = qr.location.bottomLeftCorner;

        const topLeftFinderPattern = qr.location.topLeftFinderPattern;
        const topRightFinderPattern = qr.location.topRightFinderPattern;
        const bottomLeftFinderPattern = qr.location.bottomLeftFinderPattern;
        //console.log(topLeftFinderPattern)


        for (let x = Math.round(topLeftCorner.x); x <= Math.round(topLeftFinderPattern.x*2-topLeftCorner.x); x++) {
            for (let y = Math.round(topLeftCorner.y); y <= Math.round(topLeftFinderPattern.y*2-topLeftCorner.y); y++) {
                for (let i = 0; i < 4; i++) {
                    data[4*canvas.width*y+4*x+i] = 255;
                //console.log(4*canvas.width*y+4*x+i)
                }
            }
        }
        //await wait(2000);
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

        const image2: ImageData = new ImageData(data, width, height);
        ctx2?.putImageData(image2, 0, 0);
        //await wait(2000);



        current_number++;
    }
    console.log(qrlocations);

    const sites = [ {x: 200, y: 200}, {x: 50, y: 250}, {x: 400, y: 100}];
    const neighbors: Array<[[number, number], [number, number]]> = findNeighborsVoronoi(sites);

    drawGraph(graph.getContext('2d')!, sites, neighbors);
    
}

function findNeighborsVoronoi(sites: {x: number;y: number;}[]) {

    const voronoi = new Voronoi();
    const bbox = {xl: 0, xr: 800, yt: 0, yb: 600}; // xl is x-left, xr is x-right, yt is y-top, and yb is y-bottom

    const diagram = voronoi.compute(sites, bbox);
    console.log(diagram.edges);

    const neighbors: Array<[[number, number], [number, number]]> = [];

    for (let i = 0; i < diagram.edges.length; i++) {
        const currentEdge = diagram.edges[i];
        if (currentEdge.lSite != null && currentEdge.rSite != null) {
            const neighborPair: [[number, number], [number, number]] = [[currentEdge.lSite.x, currentEdge.lSite.y], [currentEdge.rSite.x, currentEdge.rSite.y]];
            const reverseNeighborPair: [[number, number], [number, number]] = [[currentEdge.rSite.x, currentEdge.rSite.y], [currentEdge.lSite.x, currentEdge.lSite.y]];
            if (!neighbors.includes(neighborPair) && !neighbors.includes(reverseNeighborPair)) {
                neighbors.push(neighborPair);
            }
        }
    }

    return neighbors;

    
}

function drawGraph(context: CanvasRenderingContext2D, sites: {x: number;y: number;}[], neighbors: Array<[[number, number], [number, number]]>) {
    //draw points
    for (let i = 0; i < sites.length; i++) {
        drawPoint(context, sites[i].x, sites[i].y, i.toString(), "#505050", 5);
    }

    //draw lines
    for (let i = 0; i < neighbors.length; i++) {
        let n1x = neighbors[i][0][0];
        let n1y = neighbors[i][0][1];
        let n2x = neighbors[i][1][0];
        let n2y = neighbors[i][1][1];
        drawLine(context, [n1x, n1y], [n2x, n2y], "#505050", 1);
    }
}

//adapted from: https://dirask.com/posts/JavaScript-how-to-draw-point-on-canvas-element-PpOBLD
function drawPoint(context: CanvasRenderingContext2D, x: number, y: number, label: string, color: string, size: number) {
    if (color == null) {
      color = '#000';
  }
  if (size == null) {
      size = 5;
  }

    // to increase smoothing for numbers with decimal part
    var pointX = Math.round(x);
  var pointY = Math.round(y);

  context.beginPath();
  context.fillStyle = color;
  context.arc(pointX, pointY, size, 0 * Math.PI, 2 * Math.PI);
  context.fill();

    if (label) {
      var textX = pointX;
        var textY = Math.round(pointY - size - 3);
    
      context.font = 'Italic 14px Arial';
      context.fillStyle = color;
      context.textAlign = 'center';
      context.fillText(label, textX, textY);
  }
}

//adapted from: https://www.javascripttutorial.net/web-apis/javascript-draw-line/
function drawLine(ctx: CanvasRenderingContext2D, begin: [number, number], end: [number, number], stroke: string, width: number) {
    if (stroke) {
        ctx.strokeStyle = stroke;
    }

    if (width) {
        ctx.lineWidth = width;
    }

    ctx.beginPath();
    ctx.moveTo(...begin);
    ctx.lineTo(...end);
    ctx.stroke();
}



