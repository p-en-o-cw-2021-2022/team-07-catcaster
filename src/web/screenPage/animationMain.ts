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
const light = new THREE.AmbientLight(); // soft white light
scene.add( light );
scene.background = new THREE.Color(0x919bab);
// const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
// camera.position.z = 10;
const cats : Cat[] = [];
const catsData : HTMLElement[][] = [];
let controllers_count = 0;
const camera = new THREE.OrthographicCamera( window.innerWidth/-40, window.innerWidth / 40, window.innerHeight / 40, window.innerHeight / -40, -50, 50 );
// camera.position.y = -10;
// camera.rotateX(Math.PI/4);

// Initialize renderer
const renderer = new THREE.WebGLRenderer();
const scaleFactor = 1; // Scale factor for the resolution of window
renderer.setSize( window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio * scaleFactor);
renderer.domElement.style.zIndex = '-1';
renderer.domElement.style.position = 'absolute';
renderer.domElement.style.top = '0';
document.body.appendChild( renderer.domElement );

//-------------------------------------------------------------------------------------
export const allPlanets : Planet[] = [];
const screenCount = 1;
const maxPlanets = 3*screenCount;
const minPlanets = 1;
// let noOfPlanets = Math.floor(Math.random() * (maxPlanets-minPlanets+1)+minPlanets);
const noOfPlanets = 3;
for (let planetID = 1; planetID <= noOfPlanets; planetID++) {
    const [planet_x, planet_y, planet_r] = generatePlanetCoo();
    const planet: Planet = new Planet(scene, planetID, planet_r, 10, [planet_x,planet_y,0]);
    allPlanets.push(planet);
    console.log('Created planet at: ', String([planet_x, planet_y, planet_r]));
}
for (let i = 0, len = allPlanets.length; i < len; i++) {
    const shortestPlanet: Planet | null = allPlanets[i].seekShortestPlanet(allPlanets);

    if (shortestPlanet !== null) {

        const my: Vector3 = allPlanets[i].coordinates;
        const your: Vector3 = shortestPlanet.coordinates;
        const myPlanetR = allPlanets[i].radius;
        const yourPlanetR = shortestPlanet.radius;
        const myShortestVectorNormalized = new Vector3(your.x-my.x, your.y-my.y, your.z-my.z).normalize();
        console.log('normalized vector: ', myShortestVectorNormalized);
        console.log('not normalized vector: ', new Vector3(your.x-my.x, your.y-my.y, your.z-my.z));
        allPlanets[i].addNeighbour(shortestPlanet, myShortestVectorNormalized.multiplyScalar(myPlanetR-2));
        const yourShortestVectorNormalized = new Vector3(my.x-your.x, my.y-your.y, my.z-your.z).normalize();
        shortestPlanet.addNeighbour(allPlanets[i], yourShortestVectorNormalized.multiplyScalar(yourPlanetR-2));
    }
}

function generatePlanetCoo() : number[] {
    const max_r = 280;
    const min_r = 120;
    const planet_r = Math.floor(Math.random() * (max_r-min_r+1)+min_r);

    const max_x_window = window.innerWidth/2 - 80;
    const planet_x = Math.ceil(Math.random() * (max_x_window-planet_r)) * (Math.round(Math.random()) ? 1 : -1);

    const max_y_window = window.innerHeight/2;
    const planet_y = Math.ceil(Math.random() * (max_y_window-planet_r)) * (Math.round(Math.random()) ? 1 : -1);

    if(!isValidPosition(planet_x, planet_y, planet_r)) {
        return generatePlanetCoo();
    } else {
        return [planet_x, planet_y, planet_r];
    }
}

function isValidPosition(thisX:number, thisY:number, thisR:number) {
    let isValid = true;
    for (let i = 0, len = allPlanets.length; i < len; i++) {
        const planetRadius = allPlanets[i].radius;
        const p: Vector3 = allPlanets[i].coordinates;
        const distance = Math.sqrt(Math.pow(thisX-p.x, 2)+Math.pow(thisY-p.y, 2));
        if (distance-(thisR+planetRadius)<0) {
            isValid = false;
        }
    }
    return isValid;
}
//-------------------------------------------------------------------------------------

// Create planet and cat objects with default values
const dt = 0.05;
// const planet: Planet = new Planet(scene, 0, 5, 10, [0,0,0]);
// const planet2: Planet = new Planet(scene, 1, 5, 10, [10,0,0]);
// planet.addNeighbour(planet2, new Vector3(3,0,0));
// planet2.addNeighbour(planet, new Vector3(-3,0,0));
renderer.render( scene, camera );

function addCat() {
    const controllers = document.getElementById('controllers')!.children;
    const id = (controllers[controllers_count - 1] as HTMLParagraphElement).innerText;
    const cat: Cat = new Cat(scene, parseInt(id, 16), allPlanets[0].radius, allPlanets[0]);
    console.log(allPlanets);
    allPlanets[0].setCat(cat);
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
        // setDebugInfo();
    }
    requestAnimationFrame(animate);
}

// function update(e: KeyboardEvent) {
//     switch(e.key) {
//     case 'd' :
//         // cat.updateForce('x', cat.xF + 5);
//         cats[0].xVel += 1;
//         break;
//     case 's' :
//         // cat.updateForce('y', cat.yF - 5);
//         cats[0].yVel -= 1;
//         break;
//     case 'w' :
//         // cat.updateForce('y', cat.yF + 5);
//         cats[0].yVel += 1;
//         break;
//     case 'a' :
//         // cat.updateForce('x', cat.xF - 5);
//         cats[0].xVel -= 1;
//         break;
//     case 'l' :
//         // cat.updateForce('x', cat.xF + 5);
//         cat2.xVel += 1;
//         break;
//     case 'k' :
//         // cat.updateForce('y', cat.yF - 5);
//         cat2.yVel -= 1;
//         break;
//     case 'i' :
//         // cat.updateForce('y', cat.yF + 5);
//         cat2.yVel += 1;
//         break;
//     case 'j' :
//         // cat.updateForce('x', cat.xF - 5);
//         cat2.xVel -= 1;
//         break;
//     }
// }

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

// function setDebugInfo() {

//     setInnerText('xF', cat.xF);
//     setInnerText('yF', cat.yF);
//     setInnerText('xP', cat.positionOnPlanet.x.toFixed(3));
//     setInnerText('yP', cat.positionOnPlanet.y.toFixed(3));
//     setInnerText('zP', cat.positionOnPlanet.z.toFixed(3));
//     setInnerText('angle', [planet.alpha * (180/Math.PI), planet.beta* (180/Math.PI), planet.gamma* (180/Math.PI)].toString());
//     setInnerText('catPosAngle', [cat.catPositionAngle[0] * (180/Math.PI), cat.catPositionAngle[1] * (180/Math.PI)].toString());

// }

function newController() {
    const controllers = document.getElementById('gyrodatas')?.children;
    if (controllers) {
        if (Math.floor(controllers_count) === controllers_count) {
            catsData.push([<HTMLElement>controllers[controllers_count*2 - 2], <HTMLElement>controllers[controllers_count*2 - 1]]);
            addCat();
        }
    }
}

// document.addEventListener('keypress', update);
window.addEventListener('touchend', firstTouch);
document.getElementById('gyrodatas')?.addEventListener( 'DOMNodeInserted', function ( event ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if( ((event.target!) as any).parentNode.id === 'gyrodatas' ) {
        controllers_count += 0.5;
        newController();
    }
}, false );
animate();