import * as THREE from 'three';
import { Scene, Vector3 } from 'three';
import { Cat } from '../js/cat.js';
import { setInnerText } from '../js/dom-util.js';
import { askPermissionIfNeeded } from '../js/motion-events.js';
import { Planet } from '../js/planet.js';


// Initialize animation scene and camera
const scene = new THREE.Scene();
scene.background = new THREE.Color('white');
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 10;
// camera.rotateX(-Math.PI/2);

// Initialize renderer
const renderer = new THREE.WebGLRenderer();
const scaleFactor = 1; // Scale factor for the resolution of window
renderer.setSize( window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio * scaleFactor);
document.body.appendChild( renderer.domElement );

// Create planet and cat objects with default values
const dt = 0.01;

const planet: Planet = new Planet(scene, 0, 5, 10, [0,0,0]);
const planet2: Planet = new Planet(scene, 1, 5, 10, [10,0,0]);
planet.addNeighbour(planet2, new Vector3(3,0,0));
planet2.addNeighbour(planet, new Vector3(-3,0,0));
//const cat: Cat = new Cat(scene, 0, 0.5, planet);
//planet.setCat(cat);
let cats = [];

function animate() {
    const jumpdata = document.getElementById('jump')?.innerText;
    // if (jumpdata === 'true') {
    //     cat.jump = true;
    // } else {
    //     cat.jump = false;
    // }
    let i = 5;
    while (i>0) {
        const gyrodata = document.getElementById('gyrodata_' + i)?.innerText;
        if (typeof gyrodata !== 'undefined') {
            if(cats.length<i){
                eval('const cat' + i + ': Cat = new Cat(scene, 0, 0.5, planet);');
                planet.setCat(eval('cat'+i));
                cats.push(eval('cat'+i));
            }
            if (gyrodata !== '') {
                const datalist = gyrodata!.split(' ');
                const beta = datalist[0];
                const gamma = datalist[1];
                console.log(beta);
                console.log(gamma);
                eval('cat'+i).xF = Number(gamma);
                eval('cat'+i).yF = Number(beta);
            }
            eval('cat'+i).updatePosition(dt);
            renderer.render( scene, camera );
            setInnerText('xF', eval('cat'+i).xF);
            setInnerText('yF', eval('cat'+i).yF);
            setInnerText('xP', eval('cat'+i).position.x.toFixed(3));
            setInnerText('yP', eval('cat'+i).position.y.toFixed(3));
            setInnerText('zP', eval('cat'+i).position.z.toFixed(3));
            setInnerText('angle', [planet.alpha, planet.beta, planet.gamma].toString());
        
            requestAnimationFrame( animate );
        }
        i--;
    }
}

// function update(e: KeyboardEvent) {

//     switch(e.key) {
//     case 'd' :
//         // cat.updateForce('x', cat.xF + 5);
//         cat.xVel += 1;
//         break;
//     case 's' :
//         // cat.updateForce('y', cat.yF - 5);
//         cat.yVel -= 1;
//         break;
//     case 'w' :
//         // cat.updateForce('y', cat.yF + 5);
//         cat.yVel += 1;
//         break;
//     case 'a' :
//         // cat.updateForce('x', cat.xF - 5);
//         cat.xVel -= 1;
//         break;
//     }
// }

function update2(e: DeviceOrientationEvent) {
    let i = 5;
    while (i>0) {
        const gyrodata = document.getElementById('gyrodata_' + i)?.innerText;
        if (typeof gyrodata !== 'undefined') {
            eval('cat'+i).updateForce('x', e.gamma!);
            eval('cat'+i).updateForce('y', -e.beta!);
            }
        }
        i--;
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

//document.addEventListener('keypress', update);
window.addEventListener('touchend', firstTouch);
animate();