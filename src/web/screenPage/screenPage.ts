import { Planet } from '../js/planet.js';
import { Scene, Vector3, Color } from 'three';
import { allPlanets, cats, conAdd, controllers, controllers_count } from './animationMain.js';
import { Portal } from '../js/portal.js';
import { findNeighborsVoronoi } from './voronoi.js';
import { Cat } from '../js/cat.js';
import { commandDir } from 'yargs';
const debug = <HTMLButtonElement>document.getElementById('debug-info');
const gyrodata =  <HTMLElement>document.getElementById('gyrodatas');

debug.addEventListener('click',  function() {

    gyrodata.hidden = !gyrodata.hidden;

});

const myId = <HTMLDivElement>document.getElementById('receiver-id');
let controllerId: string | null = null;
let controllerId2: string | null = null;

interface Message {
    'id': string;
    'client': string;
    'data': {[key: string]: [number, Planet[]]}
    'jdata': [string, number, Cat, number]
    'joins': [string, string]
}

interface WebSocketMessage {
    'data': string;
}

function getIdScreen(): string | null {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const id: string | null = urlParams.get('id');
    if (id) {
        return id;
    } else {
        return null;
    }
}

function sendDataforMulti(websocket: WebSocket, planets: Array<Planet>) {
    const innerHeight = window.innerHeight;
    const jsonString = JSON.stringify({client: 'screenMultiData', id: myId.innerHTML, innerHeight: innerHeight, planets: planets});
    websocket.send(jsonString);
    console.log('ok');
}

function getPlanet(id: number): Planet {
    for(const planet of allPlanets) {
        if(planet.id === id) {
            return planet;
        }
    }
    return allPlanets[0];
}

function getPortalCoordinates(myPlanet: Planet, otherPlanet: Planet): Vector3 {
    const vector = new Vector3(myPlanet.coordinates.x, myPlanet.coordinates.y, 0);
    vector.multiplyScalar(-1);
    vector.add(otherPlanet.coordinates);
    vector.normalize();
    vector.multiplyScalar(3*myPlanet.radius/4);
    vector.add(myPlanet.coordinates);
    return vector;
}

export function sendMessage(mesclient: string, mesdata: (string | number | Cat)[]) {
    console.log('going to jump');
    websocket.send(JSON.stringify({client : mesclient, data : mesdata}));
    console.log('jumped here');
}

function randomColorCreation(): THREE.ColorRepresentation | undefined {
    const id = Math.floor((Math.random() * 1000000));
    let hash: number = 5381;

    for (let i = 0; i < id.toString().length; i++) {
        hash = ((hash << 5) + hash) + id.toString().charCodeAt(i); /* hash * 33 + c */
    }

    const r = (hash & 0xFF0000) >> 16;
    const g = (hash & 0x00FF00) >> 8;
    const b = hash & 0x0000FF;

    return '#' + ('0' + r.toString(16)).substr(-2) + ('0' + g.toString(16)).substr(-2) + ('0' + b.toString(16)).substr(-2);
}

const url = 'wss' + window.location.href.substr(5);

const websocket = new WebSocket(url);
console.log('Starting Websocket connection...');

websocket.onopen = () => {
    console.log('Connection established.');
    websocket.send(JSON.stringify({client: 'screen', id: myId.innerHTML}));
};

websocket.onmessage = (message:WebSocketMessage) => {
    const mes = <Message>JSON.parse(message.data);
    console.log('received message from : ', mes.id, '  |  client is: ', mes.client);
    if(mes.client === 'controller') {
        controllerId = mes.id;
        controllerId2 = mes.id[mes.id.length-1];
    }
    if(mes.client === 'disconnect' && mes.id === myId.innerHTML) {
        console.log('Illegal ID, removing websocket connection.');
        websocket.close();
    }
    if(mes.client === 'multi-screen') {
        console.log('Received message');
        let url = window.location.href;
        url = url.slice(0,-19) + 'controller/';
        const qrcodelarge = <HTMLImageElement>document.getElementById('qrcodelarge');
        qrcodelarge.src = 'https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=' + String(getIdScreen());
        const qrcodesmall = <HTMLImageElement>document.getElementById('qrcode');
        qrcodesmall.src = qrcodesmall.src = 'https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=' + url;

        sendDataforMulti(websocket, allPlanets);
    }
    if(mes.client === 'singleScreen') {
        console.log('Single screen selected.');
        const sites: {x: number; y: number; id: string}[] = [];
        for(const planet of allPlanets) {
            const site = {x: planet.coordinates.x, y: planet.coordinates.y, id: planet.id.toString()};
            sites.push(site);
        }
        const neighbors = findNeighborsVoronoi(sites);
        for(const currentPlanet of neighbors) {
            const planetID = Number(currentPlanet.id);
            const planet = getPlanet(planetID);
            const neighborsToAdd = currentPlanet.neighborsOfID;
            for(const neighborToAdd of neighborsToAdd) {
                const neighborID = Number(neighborToAdd);
                const neighbor = getPlanet(neighborID);
                const portalCoordinates = getPortalCoordinates(planet, neighbor);
                const portal = new Portal(myId.innerHTML, portalCoordinates, neighborID);
                let randomColor = randomColorCreation();
                for(const planet of allPlanets) {
                    if(planet.id == neighborID) {
                        for(const neighborPortal of planet.portals) {
                            if(neighborPortal.otherPlanetID == planetID) {
                                randomColor = neighborPortal.color;
                            }
                        }
                    }
                }
                console.log('colorro', randomColor);
                portal.addColor(new Color(randomColor));
                planet.addPortal(portal);
            }
        }
    }
    if(mes.client === 'addCat') {
        console.log(controllerId2);
        if(controllerId2!=null) {
            conAdd();
            // const contID = (controllers[controllers_count - 1] as HTMLParagraphElement).innerText;

            // const cat: Cat = new Cat(scene, parseInt(id, 16), allPlanets[0].radius, planet);
            const plan = allPlanets[Math.floor(Math.random() * allPlanets.length)];
            if(mes.joins[0] === myId.innerHTML){
                const cat: Cat = new Cat(controllerId2, plan.radius, plan);
                console.log(allPlanets);
                plan.setCat(cat);
                // planet.setCat(cat);
    
                cats.push(cat);
                //setTimeout( ()=> websocket.send(JSON.stringify({client: 'catColor', catcol: cat})), 5000);
                websocket.send(JSON.stringify({client: 'catColor', catcol: cat}));
                console.log('Cat added wih id: ' + String(parseInt(mes.joins[1], 16)));
                } else {
                    cats.push(undefined);
                }
            controllerId2 = null;
            }
            else{
                websocket.send(JSON.stringify({client: 'join'}));
            }
    }
    if(mes.client === 'jumpmessage') {
        const [otherScreen, otherPlanetID, otherFakeCat, catIndex] = mes.jdata;
        if(otherScreen === myId.innerHTML) {
            for(const planet of allPlanets) {
                if(planet.id === Number(otherPlanetID)) {
                    const cat = new Cat(otherFakeCat.id, otherFakeCat.radius, planet, otherFakeCat.mass);
                    planet.setCat(cat);
                    cat.positionOnPlanet = new Vector3(0, 0, 0);
                    cats[catIndex] = cat;
                }
            }
        }
    }
    if(mes.client === 'endgame') {
        console.log('The game was ended.');
        window.location.href = '/catcaster/screen/?id=' + <string>getIdScreen();
    }
    if(mes.client === 'portal') {
        console.log('Portals received.');
        const multiScreenData = mes.data;
        const planets: Planet[] = [];
        for (const fakePlanet of multiScreenData[myId.innerHTML][1]) {
            const scene = new Scene();
            const coords = [fakePlanet.coordinates.x, fakePlanet.coordinates.y, fakePlanet.coordinates.z];
            const planet = new Planet(scene, fakePlanet.id, fakePlanet.radius, fakePlanet.friction, coords);
            for(const fakePortal of fakePlanet.portals) {
                const coords: Vector3 = new Vector3(fakePortal.myCoordinates.x, fakePortal.myCoordinates.y, 0);
                const portal = new Portal(fakePortal.otherScreen, coords, fakePortal.otherPlanetID);
                portal.addColor(fakePortal.color);
                planet.addPortal(portal);
            }
            planets.push(planet);
        }
        for(const planet of allPlanets) {
            for(const serverPlanet of planets) {
                if(planet.id === serverPlanet.id) {
                    for(const portal of serverPlanet.portals) {
                        // hier color adden
                        // const randomColor = randomColorCreation();
                        // portal.addColor(randomColor);
                        planet.addPortal(portal);
                        console.log('added portal:', portal);
                    }
                }
            }
            console.log('changedplanet: ', planet);
        }
    }
};

websocket.onclose = () => {
    window.location.href = '/catcaster/error/';
};


if (getIdScreen() !== null) {
    myId.innerHTML = <string>getIdScreen();
}

export {myId, controllerId};
