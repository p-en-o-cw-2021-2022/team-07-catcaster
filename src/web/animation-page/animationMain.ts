/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { askPermissionIfNeeded } from '../js/motion-events.js';
import { setInnerText, clearCanvas } from '../js/dom-util.js';
import { Planet } from '../js/planet.js';
import { PassThrough } from 'stream';
import { agent } from 'supertest';


const canvas = document.getElementById( 'canvas' ) as HTMLCanvasElement;

// Scale canvas width and height
canvas.height = innerHeight - (innerHeight/6);
canvas.width = innerWidth - (innerWidth/8);
const ctx = canvas.getContext( '2d' ) as CanvasRenderingContext2D;
ctx.translate(0, canvas.height);
ctx.scale(1, -1);

const planet:Planet = new Planet(0, [canvas.width/2, canvas.height/2], 100);

function updateCanvas(e: DeviceOrientationEvent) {

    clearCanvas(canvas, ctx);

    setInnerText('gamma', e.gamma);
    setInnerText('beta', -e.beta!);

    planet.update([e.gamma!, -e.beta!]);
    drawPlanet(planet);

}

function drawPlanet(planet:Planet) {

    const radiuses: number[] = planet.calcAnimationRadiuses();
    const ellipseAngle: number = planet.calcAnimationAngle();

    setInnerText('planetCoordinates', planet.coordinates.toString());
    //setInnerText('animationRadiuses', radiuses.toString());
    setInnerText('ellipseAngle', Math.round(ellipseAngle));

    ctx.beginPath();
    ctx.ellipse(planet.coordinates[0], planet.coordinates[1], Math.abs(radiuses[0]), Math.abs(radiuses[1]), ellipseAngle, 0, 2 * Math.PI);
    ctx.stroke();

}

function firstTouch() {
    window.removeEventListener('touchend', firstTouch);
    // note the 'void' ignores the promise result here...
    void askPermissionIfNeeded().then(v => {
        const { ok, msg } = v;
        setInnerText('dm_status', msg);
        if (ok) {
            window.addEventListener('deviceorientation', updateCanvas);
        }
    });
}


function updateDebug(e: KeyboardEvent) {

    document.removeEventListener('keypress', updateDebug);

    setInnerText('gamma', planet.angle[0]);
    setInnerText('beta', planet.angle[1]);

    clearCanvas(canvas, ctx);

    const tmp = planet.angle;

    if (e.key === 's') {
        planet.update([tmp[0], tmp[1] - 5]);
    } else if (e.key === 'a') {
        planet.update([tmp[0] - 5, tmp[1]]);
    } else if (e.key === 'd') {
        planet.update([tmp[0] + 5, tmp[1]]);
    } else if (e.key === 'w') {
        planet.update([tmp[0], tmp[1] + 5]);
    }

    drawPlanet(planet);
    document.addEventListener('keypress', updateDebug);

}

window.addEventListener('touchend', firstTouch);
document.addEventListener('keypress', updateDebug);


