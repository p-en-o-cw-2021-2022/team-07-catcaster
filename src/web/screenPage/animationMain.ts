import { loadavg } from 'os';
import * as THREE from 'three';
import { Mesh, MeshBasicMaterial, MeshNormalMaterial, Scene, Vector3 } from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { Cat } from '../js/cat.js';
import { setInnerText } from '../js/dom-util.js';
import { askPermissionIfNeeded } from '../js/motion-events.js';
import { Planet } from '../js/planet.js';

// Initialize animation scene and camera
const scene = new THREE.Scene();
scene.background = new THREE.Color('white');
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
// const camera = new THREE.OrthographicCamera( window.innerWidth/-2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 50 );
camera.position.z = 10;
// camera.position.y = 10;
// camera.rotateX(-Math.PI/4);

// Initialize renderer
const renderer = new THREE.WebGLRenderer();
const scaleFactor = 1; // Scale factor for the resolution of window
renderer.setSize( window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio * scaleFactor);
document.body.appendChild( renderer.domElement );



// Create planet and cat objects with default values
const dt = 0.01;

const planet: Planet = new Planet(scene, 0, 5, 10, [0,0,0]);
// const planet2: Planet = new Planet(scene, 1, 5, 10, [10,0,0]);
// planet.addNeighbour(planet2, new Vector3(3,0,0));
// planet2.addNeighbour(planet, new Vector3(-3,0,0));
const cat: Cat = new Cat(scene, 0, 0.5, planet);
// const cat2: Cat = new Cat(scene, 1, 0.5, planet);
// cat2.position = new Vector3(4, 0, 0.5);
planet.setCat(cat);
// planet.setCat(cat2);

function animate() {
    // const jumpdata = document.getElementById('jump')?.innerText;
    // if (jumpdata === 'true') {
    //     cat.jump = true;
    // } else {
    //     cat.jump = false;
    // }
    // const gyrodata = document.getElementById('gyro-data')?.innerText;
    // if (gyrodata !== '') {
    //     const datalist = gyrodata!.split(' ');
    //     const beta = datalist[0];
    //     const gamma = datalist[1];
    //     console.log(beta);
    //     console.log(gamma);
    //     cat.xF = Number(gamma);
    //     cat.yF = Number(beta);
    // }
    cat.updatePosition(dt);
    renderer.render( scene, camera );
    setDebugInfo();
    requestAnimationFrame( animate );
}

function update(e: KeyboardEvent) {

    switch(e.key) {
    case 'd' :
        // cat.updateForce('x', cat.xF + 5);
        cat.xVel += 1;
        break;
    case 's' :
        // cat.updateForce('y', cat.yF - 5);
        cat.yVel -= 1;
        break;
    case 'w' :
        // cat.updateForce('y', cat.yF + 5);
        cat.yVel += 1;
        break;
    case 'a' :
        // cat.updateForce('x', cat.xF - 5);
        cat.xVel -= 1;
        break;
    }
}

function update2(e: DeviceOrientationEvent) {
    cat.updateForce('x', e.gamma!);
    cat.updateForce('y', -e.beta!);
}

function firstTouch() {
    window.removeEventListener('touchend', firstTouch);
    // note the 'void' ignores the promise result here...
    void askPermissionIfNeeded().then(v => {
        const { ok, msg } = v;
        setInnerText('dm_status', msg);
        if (ok) {window.addEventListener('deviceorientation', update2);}
    });
}

function setDebugInfo() {

    setInnerText('xF', cat.xF);
    setInnerText('yF', cat.yF);
    setInnerText('xP', cat.position.x.toFixed(3));
    setInnerText('yP', cat.position.y.toFixed(3));
    setInnerText('zP', cat.position.z.toFixed(3));
    setInnerText('angle', [planet.alpha, planet.beta, planet.gamma].toString());

}

document.addEventListener('keypress', update);
window.addEventListener('touchend', firstTouch);
// loadModel();
animate();

// function loadModel() {


//     const loader = new OBJLoader();

//     // load a resource
//     loader.load('/web/models/cat2.obj',
//     // called when resource is loaded
//         ( object ) => {
//             object.position.copy(new Vector3(0,0,0));
//             object.scale.set(0.25 ,0.25 ,0.25);
//             object.traverse(function(child) {
//                 if ((child instanceof THREE.Mesh) && child !== undefined) {
//                     child.material.color = 'red';
//                 }
//             });

//         },
//         // called when loading is in progresses
//         ( xhr ) => {

//             console.log( (  (String) (xhr.loaded / xhr.total * 100 )) + '% loaded' );

//         },
//         // called when loading has errors
//         ( error ) => {

//             console.log( 'An error happened' );

//         }
//     );


// }