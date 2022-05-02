/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
camera.position.z = 800;
// const camera = new THREE.OrthographicCamera( (window.innerWidth / - 2) + 80, (window.innerWidth / 2) - 80, window.innerHeight / 2, window.innerHeight / - 2, 0, 50 );
const cats : Cat[] = [];
const catsData : HTMLElement[][] = [];
let controllers_count = 0;
// camera.rotateX(-Math.PI/2);

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
const allPlanets : Planet[] = [];
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
        const [myX,myY,myZ] = allPlanets[i].coordinates;
        const [yourX,yourY,yourZ] = shortestPlanet.coordinates;
        const myPlanetR = allPlanets[i].radius;
        const yourPlanetR = shortestPlanet.radius;
        const myShortestVectorNormalized = new Vector3(yourX-myX, yourY-myY, yourZ-myZ).normalize();
        console.log('normalized vector: ', myShortestVectorNormalized);
        console.log('not normalized vector: ', new Vector3(yourX-myX, yourY-myY, yourZ-myZ));
        allPlanets[i].addNeighbour(shortestPlanet, myShortestVectorNormalized.multiplyScalar(myPlanetR-2));
        const yourShortestVectorNormalized = new Vector3(myX-yourX, myY-yourY, myZ-yourZ).normalize();
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
        const [p_x,p_y,p_z] = allPlanets[i].coordinates;
        const distance = Math.sqrt(Math.pow(thisX-p_x, 2)+Math.pow(thisY-p_y, 2));
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
        setInnerText('xF', cat.xF);
        setInnerText('yF', cat.yF);
        setInnerText('xP', cat.position.x.toFixed(3));
        setInnerText('yP', cat.position.y.toFixed(3));
        setInnerText('zP', cat.position.z.toFixed(3));
        setInnerText('angle', [allPlanets[0].alpha, allPlanets[0].beta, allPlanets[0].gamma].toString());
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