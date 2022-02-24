/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { askPermissionIfNeeded } from '../js/motion-events.js';
import { setInnerText, drawLine, scaleArray, drawGraph, clearCanvas } from '../js/dom-util.js';
import { maxHeaderSize } from 'http';


const canvas = document.getElementById( 'canvas' ) as HTMLCanvasElement;

// Scale canvas width and height
canvas.height = innerHeight - (innerHeight/6);
canvas.width = innerWidth - (innerWidth/8);
const ctx = canvas.getContext( '2d' ) as CanvasRenderingContext2D;
ctx.translate(0, canvas.height);
ctx.scale(1, -1);
const catMassa: number = 10;
let catVelocity: number = 0;
const dt:number = 0.1;
const planetRadius = 100;
let planetAngle:number = 0;
let catPosOnPlanet: number = 0;

function updateCanvas(e: DeviceOrientationEvent) {

    clearCanvas(canvas, ctx);

    setInnerText('angle', e.gamma);

    const force = e.gamma!;
    planetAngle = -(Math.atan((catMassa * -9.8) / catPosOnPlanet) + Math.PI/2);
    const acc = (force/catMassa);
    //+ (catMassa * -9.8) * Math.sin(planetAngle);

    const tmpV = catVelocity + acc * dt;
    const tmpX = catPosOnPlanet + tmpV * dt + (1/2) * acc * dt**2;

    if (tmpX <= -100) {
        catVelocity = 0;
        catPosOnPlanet = -100;

    } else if (tmpX > 100 ) {
        catVelocity = 0;
        catPosOnPlanet = 100;
    } else {
        catVelocity = tmpV;
        catPosOnPlanet = tmpX;
    }

    setInnerText('posPlanet', catPosOnPlanet);
    setInnerText('planetAngle', planetAngle);

    let x = 1;

    if (catPosOnPlanet >= 0) {
        x = 1;
    } else {
        x = -1;
    }

    const posOnCanvas: number[] = [canvas.width/2 + catPosOnPlanet * Math.cos(planetAngle) * x, canvas.height/2 + catPosOnPlanet * Math.sin(planetAngle) * x];

    ctx.beginPath();
    ctx.ellipse(canvas.width/2, canvas.height/2, 100, 30, planetAngle, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(posOnCanvas[0], posOnCanvas[1], 10, 0, Math.PI * 2, false);
    ctx.fillStyle = 'black';
    ctx.fill();

}

function firstTouch() {
    window.removeEventListener('touchend', firstTouch);
    // note the 'void' ignores the promise result here...
    void askPermissionIfNeeded().then(v => {
        const { ok, msg } = v;
        setInnerText('dm_status', msg);
        if (ok) {window.addEventListener('deviceorientation', updateCanvas);}
    });
}

window.addEventListener('touchend', firstTouch);
