/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import * as THREE from 'three';
import { Scene, Vector3 } from 'three';
import { Cat } from '../js/cat.js';
import { setInnerText } from '../js/dom-util.js';
import { askPermissionIfNeeded } from '../js/motion-events.js';
import { Planet } from '../js/planet.js';

interface HTMLJSON {
    string: any;
    'id': string;
}

// Initialize animation scene and camera
const scene = new THREE.Scene();
scene.background = new THREE.Color('white');
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 10;
const cats : Cat[] = [];
const catsData : HTMLElement[][] = [];
let controllers_count = 0;
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
renderer.render( scene, camera );

function addCat() {
    const controllers = document.getElementById('controllers')!.children;
    const id = (controllers[controllers_count - 1] as HTMLParagraphElement).innerText;
    const cat: Cat = new Cat(scene, parseInt(id, 16), 0.5, planet);
    planet.setCat(cat);
    cats.push(cat);
    console.log('Cat added wih id: ' + String(parseInt(id, 16)));
    console.log(catsData);
    console.log(cats);
}

function animate() {
    for (let i = 0, len = cats.length; i < len; i++) {
        const cat = cats[i];
        const jumpdata = catsData[i][1].innerText;
        if (jumpdata === 'true') {
            cat.jump = true;
        } else {
            cat.jump = false;
        }
        const gyrodata = catsData[i][0].innerText;
        if ((gyrodata !== '') || (gyrodata !== undefined)) {
            const datalist = gyrodata?.split(' ');
            const beta = datalist[0];
            const gamma = datalist[1];
            cat.xF = Number(gamma);
            cat.yF = Number(beta);
        }
        cat.updatePosition(dt);
        renderer.render( scene, camera );
        setInnerText('xF', cat.xF);
        setInnerText('yF', cat.yF);
        setInnerText('xP', cat.position.x.toFixed(3));
        setInnerText('yP', cat.position.y.toFixed(3));
        setInnerText('zP', cat.position.z.toFixed(3));
        setInnerText('angle', [planet.alpha, planet.beta, planet.gamma].toString());
    }
    requestAnimationFrame(animate);
}

function update(e: KeyboardEvent) {
    switch(e.key) {
    case 'd' :
        // cat.updateForce('x', cat.xF + 5);
        cats[0].xVel += 1;
        break;
    case 's' :
        // cat.updateForce('y', cat.yF - 5);
        cats[0].yVel -= 1;
        break;
    case 'w' :
        // cat.updateForce('y', cat.yF + 5);
        cats[0].yVel += 1;
        break;
    case 'a' :
        // cat.updateForce('x', cat.xF - 5);
        cats[0].xVel -= 1;
        break;
    }
}

function update2(e: DeviceOrientationEvent) {
    for (let i = 0, len = cats.length; i < len; i++) {
        const cat = cats[i];
        cat.updateForce('x', e.gamma!);
        cat.updateForce('y', -e.beta!);
    }
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

function newController() {
    const controllers = document.getElementById('gyrodatas')?.children;
    if (controllers) {
        if (Math.floor(controllers_count) === controllers_count) {
            catsData.push([<HTMLElement>controllers[controllers_count*2 - 2], <HTMLElement>controllers[controllers_count*2 - 1]]);
            addCat();
        }
    }
}

document.addEventListener('keypress', update);
window.addEventListener('touchend', firstTouch);
document.getElementById('gyrodatas')?.addEventListener( 'DOMNodeInserted', function ( event ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if( ((event.target!) as any).parentNode.id === 'gyrodatas' ) {
        controllers_count += 0.5;
        newController();
    }
}, false );
animate();