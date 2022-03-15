// /* eslint-disable @typescript-eslint/no-unsafe-member-access */
// import { askPermissionIfNeeded } from '../js/motion-events.js';
// import { setInnerText, clearCanvas, drawLine } from '../js/dom-util.js';
// import { Planet } from '../js/planet.js';
// import { Vector3 } from 'three';

// const canvas = document.getElementById( 'canvas' ) as HTMLCanvasElement;

// // Scale canvas width and height
// canvas.height = innerHeight - (innerHeight/6);
// canvas.width = innerWidth - (innerWidth/8);
// const ctx = canvas.getContext( '2d' ) as CanvasRenderingContext2D;
// ctx.translate(0, canvas.height);
// ctx.scale(1, -1);

// const planet:Planet = new Planet(0, [canvas.width/2, canvas.height/2], 100);

// function updateCanvas(e: DeviceOrientationEvent) {

//     clearCanvas(canvas, ctx);

//     setInnerText('gamma', e.gamma);
//     setInnerText('beta', -e.beta!);

//     planet.update([0, -e.beta!, e.gamma!]);
//     drawPlanet(planet);

// }

// function drawPlanet(planet:Planet) {

//     planet.updateVectors();
//     // drawLine(ctx, [planet.coordinates[0], planet.coordinates[1]], [planet.coordinates[0] + planet.x.x, planet.coordinates[1] + planet.x.y]);
//     // drawLine(ctx, [planet.coordinates[0], planet.coordinates[1]], [planet.coordinates[0] + planet.y.x, planet.coordinates[1] + planet.y.y]);

//     setInnerText('planetCoordinates', planet.coordinates.toString());
//     setInnerText('ellipseAngle', Math.round(planet.animationAngle));
//     setInnerText('vectorX', planet.x.toArray().toString());
//     setInnerText('vectorY', planet.y.toArray().toString());

//     ctx.beginPath();
//     ctx.ellipse(planet.coordinates[0], planet.coordinates[1], planet.x.length()*Math.cos(planet.x.angleTo(new Vector3(1,0,0))), planet.y.length()*Math.cos(planet.y.angleTo(new Vector3(0,1,0))), planet.animationAngle, 0, 2 * Math.PI);
//     ctx.stroke();

// }

// function firstTouch() {
//     window.removeEventListener('touchend', firstTouch);
//     // note the 'void' ignores the promise result here...
//     void askPermissionIfNeeded().then(v => {
//         const { ok, msg } = v;
//         setInnerText('dm_status', msg);
//         if (ok) {
//             window.addEventListener('deviceorientation', updateCanvas);
//         }
//     });
// }

// function updateDebug(e: KeyboardEvent) {

//     document.removeEventListener('keypress', updateDebug);

//     clearCanvas(canvas, ctx);

//     const tmp = planet.angle;

//     if (e.key === 's') {
//         planet.update([0, tmp[1] + 5 , tmp[2]]);
//     } else if (e.key === 'a') {
//         planet.update([0, tmp[1], tmp[2] + 5]);
//     } else if (e.key === 'd') {
//         planet.update([0, tmp[1], tmp[2] - 5]);
//     } else if (e.key === 'w') {
//         planet.update([0, tmp[1] - 5, tmp[2]]);
//     }

//     setInnerText('gamma', planet.angle[2]);
//     setInnerText('beta', planet.angle[1]);

//     drawPlanet(planet);

//     document.addEventListener('keypress', updateDebug);

// }

// window.addEventListener('touchend', firstTouch);
// document.addEventListener('keypress', updateDebug);
