/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import * as THREE from 'three';
import { Cat } from '../js/cat.js';
import { setInnerText } from '../js/dom-util.js';
import { Planet } from '../js/planet.js';

const dt = 0.01;

// Create planet and cat objects with default values
const planet = new Planet(0, 5, 10);
const cat = new Cat(0, 0.5, planet);

// Initialize animation scene and camera
const scene = new THREE.Scene();
scene.background = new THREE.Color('white');
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 10;
camera.position.y = -10;
camera.rotateX(Math.PI/4);

// Initialize renderer
const renderer = new THREE.WebGLRenderer();
const scaleFactor = 1; // Scale factor for the resolution of window
renderer.setSize( window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio * scaleFactor);
document.body.appendChild( renderer.domElement );

// Initialize planet animation as a circle
const circle = new THREE.Mesh( new THREE.CircleGeometry( planet.radius, 32 ), new THREE.MeshNormalMaterial() );
scene.add( circle );

// Initialize cat animation as a sphere
const sphere = new THREE.Mesh( new THREE.SphereGeometry( 0.5, 32, 16 ), new THREE.MeshNormalMaterial());
scene.add( sphere );


function animate() {
    cat.updatePosition(dt);
    circle.rotation.x = planet.gamma;
    circle.rotation.y = planet.beta;
    sphere.position.copy(cat.position);
    requestAnimationFrame( animate ); // can be disabled while using deviceOrientationEvent
    renderer.render( scene, camera );
}

function update(e: KeyboardEvent) {

    switch(e.key) {
    case 'd' :
        cat.updateForce('x', cat.xF + 5);
        break;
    case 's' :
        cat.updateForce('y', cat.yF - 5);
        break;
    case 'w' :
        cat.updateForce('y', cat.yF + 5);
        break;
    case 'a' :
        cat.updateForce('x', cat.xF - 5);
        break;
    }

    setInnerText('xF', cat.xF);
    setInnerText('yF', cat.yF);
    setInnerText('pos', cat.position.toArray().toString());
    setInnerText('angle', [planet.alpha, planet.beta, planet.gamma].toString());
    // planet.updateAngles();
}

document.addEventListener('keypress', update);
animate();

// function update(e: KeyboardEvent) {
//     switch(e.key) {
//     case 's' :
//         planet.setAngle('gamma', planet.gamma + 0.08);
//         break;
//     case 'a' :
//         planet.setAngle('beta', planet.beta - 0.08);
//         break;
//     case 'd' :
//         planet.setAngle('beta', planet.beta + 0.08);
//         break;
//     case 'w' :
//         planet.setAngle('gamma', planet.gamma - 0.08);
//         break;
//     }

//     animate();
// }