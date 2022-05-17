/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import * as THREE from 'three';
import { Vector3 } from 'three';
import { Cat } from '../js/cat.js';
import { setInnerText } from '../js/dom-util.js';
import { askPermissionIfNeeded } from '../js/motion-events.js';
import { Planet } from '../js/planet.js';
import { myId, sendMessage } from './screenPage.js';

// Initialize animation scene and camera
const scene = new THREE.Scene();
const light1 = new THREE.PointLight();
const light2 = new THREE.PointLight();
const light3 = new THREE.PointLight();
const sceneHeight = 500;
const aspectRatio = window.innerWidth/window.innerHeight;
scene.add( light1 );
scene.add( light2 );
scene.add( light3 );
light1.position.set(0, -sceneHeight/2, 100);
light2.position.set(-window.innerWidth/2, sceneHeight/2, 100);
light3.position.set(window.innerWidth/2, sceneHeight/2, 100);
scene.background = new THREE.Color('white');
// scene.background = new THREE.Color(0x919bab);
// const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, -1000, 1000 );
// camera.position.z = 1000;
export const cats : (Cat | undefined )[] = [];
const catsData : HTMLElement[][] = [];
export let controllers_count = 0;
export let controllers = document.getElementById('controllers')!.children;
// const camera = new THREE.OrthographicCamera( window.innerWidth/-20, window.innerWidth / 20, window.innerHeight / 20, window.innerHeight / -20, -100, 100);
const camera = new THREE.OrthographicCamera( -sceneHeight * aspectRatio / 2 , sceneHeight * aspectRatio / 2, sceneHeight / 2, -sceneHeight / 2, -500, 500);
camera.rotateOnAxis(new Vector3(1,0,0), Math.PI/4);
// camera.position.y = -10;
// camera.rotateX(Math.PI/4);

// Initialize renderer
const renderer = new THREE.WebGLRenderer();

const scaleFactor = 0.75; // Scale factor for the resolution of window
renderer.setSize( window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio * scaleFactor);
renderer.domElement.style.zIndex = '-1';
renderer.domElement.style.position = 'relative';
renderer.domElement.style.top = '0';

if (document.getElementById('Game') !== null) {
    document.getElementById('Game')?.appendChild( renderer.domElement );
}

// const planet = new Planet(scene, 0, 20, 0, [0,0,0]);

//-------------------------------------------------------------------------------------
export const allPlanets : Planet[] = [];
// let noOfPlanets = Math.floor(Math.random() * (maxPlanets-minPlanets+1)+minPlanets);
const randomNO = Math.random();
let noOfPlanets;
if(randomNO <= 0.15) {
    noOfPlanets = 2;
} else if(randomNO <= 0.4) {
    noOfPlanets = 4;
} else {
    noOfPlanets = 5;
}
for (let planetID = 1; planetID <= noOfPlanets; planetID++) {
    createPlanet(planetID);
}
// for (let i = 0, len = allPlanets.length; i < len; i++) {
//     const shortestPlanet: Planet | null = allPlanets[i].seekShortestPlanet(allPlanets);

//     if (shortestPlanet !== null) {

//         const my: Vector3 = allPlanets[i].coordinates;
//         const your: Vector3 = shortestPlanet.coordinates;
//         const myPlanetR = allPlanets[i].radius;
//         const yourPlanetR = shortestPlanet.radius;
//         const myShortestVectorNormalized = new Vector3(your.x-my.x, your.y-my.y, your.z-my.z).normalize();
//         console.log('normalized vector: ', myShortestVectorNormalized);
//         console.log('not normalized vector: ', new Vector3(your.x-my.x, your.y-my.y, your.z-my.z));
//         allPlanets[i].addNeighbour(shortestPlanet, myShortestVectorNormalized.multiplyScalar(myPlanetR-2));
//         const yourShortestVectorNormalized = new Vector3(my.x-your.x, my.y-your.y, my.z-your.z).normalize();
//         shortestPlanet.addNeighbour(allPlanets[i], yourShortestVectorNormalized.multiplyScalar(yourPlanetR-2));
//     }
// }

export function createPlanet(planetID: number) {
    const [planet_x, planet_y, planet_r] = generatePlanetCoo();
    const planet: Planet = new Planet(scene, planetID, planet_r, 10, [planet_x,planet_y,0]);
    allPlanets.push(planet);
    console.log('Created planet at: ', String([planet_x, planet_y, planet_r]));
}

function generatePlanetCoo() : number[] {
    const max_r = 100;
    const min_r = 50;
    const planet_r = Math.floor(Math.random() * (max_r-min_r+1)+min_r);
    // const max_x_window = window.innerWidth/2 - 80;
    // const max_x_window = 120;
    const max_x_window = aspectRatio * sceneHeight / 2;
    const planet_x = Math.ceil(Math.random() * (max_x_window-planet_r)) * (Math.round(Math.random()) ? 1 : -1);

    // const max_y_window = 100;
    // const max_y_window = window.innerHeight/2;
    const max_y_window = sceneHeight / 2 ;
    const planet_y = Math.ceil(Math.random() * (max_y_window-planet_r)) * (Math.round(Math.random()) ? 1 : -1);

    console.log('Tried planet at: ');
    console.log(planet_x, planet_y, planet_r);

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
const dt = 0.025;
// const planet: Planet = new Planet(scene, 0, 5, 10, [0,0,0]);
// const planet2: Planet = new Planet(scene, 1, 5, 10, [10,0,0]);
// planet.addNeighbour(planet2, new Vector3(3,0,0));
// planet2.addNeighbour(planet, new Vector3(-3,0,0));
renderer.render( scene, camera );

export function conAdd() {
    controllers = document.getElementById('controllers')!.children;
}

// export function addCat() {
//     controllers = document.getElementById('controllers')!.children;
//     const id = (controllers[controllers_count - 1] as HTMLParagraphElement).innerText;

//     // const cat: Cat = new Cat(scene, parseInt(id, 16), allPlanets[0].radius, planet);
//     const plan = allPlanets[Math.floor(Math.random() * allPlanets.length)];
//     const cat: Cat = new Cat(parseInt(id, 16), plan.radius, plan);
//     console.log(allPlanets);
//     allPlanets[0].setCat(cat);
//     // planet.setCat(cat);

//     cats.push(cat);
//     console.log('Cat added wih id: ' + String(parseInt(id, 16)));
//     console.log(catsData);
//     console.log(cats);
// }

function animate() {
    // console.log('cats???', cats, catsData);
    if( cats.length === catsData.length) {
        for (let i = 0, len = cats.length; i < len; i++) {
            const cat = cats[i];
            if(cat !== undefined) {
                const jumpdata = catsData[i][1].innerText;
                if (jumpdata === 'true') {
                    cat.jump = true;
                } else {
                    cat.jump = false;
                }
                const gyrodata = catsData[i][0].innerText;
                if ((gyrodata !== '') && (gyrodata !== undefined)) {
                    const datalist = gyrodata?.split(' ');
                    const beta = datalist[0];
                    const gamma = datalist[1];
                    cat.xF = Number(gamma);
                    cat.yF = Number(beta);
                }
                const portal = cat.updateVelocity(dt, allPlanets);
                if(portal !== undefined) {
                    cat.xVel = 0;
                    cat.yVel = 0;
                    cat.xF = 0;
                    cat.yF = 0;
                    console.log(portal);
                    cat.planet.cats.delete(cat.id);
                    // Send teleport message over websocket
                    if (portal.otherScreen !== myId.innerHTML) {
                        cat.planet.scene.remove(cat.mesh!);
                        cats[i] = undefined;
                        const jumpmessage = [portal.otherScreen, portal.otherPlanetID, cat, i];
                        sendMessage('jump-message', jumpmessage);
                    } else {
                        for(const planet of allPlanets) {
                            if(planet.id === portal.otherPlanetID) {
                                cat.setPlanet(planet);
                                planet.setCat(cat);
                                cat.positionOnPlanet = new Vector3(0, 0, 0);
                                cat.xF = 0;
                                cat.yF = 0;
                                cat.xVel = 0;
                                cat.yVel = 0;
                            }
                        }
                    }
                }
                // setDebugInfo();
            }
        }
    }
    updatePlanets();
    renderer.render( scene, camera );
    for(const cat of cats) {
        if(cat !== undefined) {
            setDebugInfo(cat);
        }
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
        if(cat !== undefined) {
            cat.updateForce('x', e.gamma!);
            cat.updateForce('y', -e.beta!);
        }
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

function setDebugInfo(cat: Cat) {

    setInnerText(cat.id + '-xF', cat.xF);
    setInnerText(cat.id + '-yF', cat.yF);
    setInnerText(cat.id + '-Jump', cat.jump);
    setInnerText(cat.id + '-xP', cat.positionOnPlanet.x.toFixed(3));
    setInnerText(cat.id + '-yP', cat.positionOnPlanet.y.toFixed(3));
    setInnerText(cat.id + '-beta', [cat.planet.beta* (180/Math.PI)].toString());
    setInnerText(cat.id + '-gamma', [cat.planet.gamma* (180/Math.PI)].toString());

}

function newController() {
    const controllers = document.getElementById('gyrodatas')?.children;
    if (controllers) {
        if (Math.floor(controllers_count) === controllers_count) {
            catsData.push([<HTMLElement>controllers[controllers_count*2 - 2], <HTMLElement>controllers[controllers_count*2 - 1]]);
            // addCat();
        }
    }
}

function updatePlanets() {
    for (const planet of allPlanets) {
        planet.updateAngles(dt);
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


