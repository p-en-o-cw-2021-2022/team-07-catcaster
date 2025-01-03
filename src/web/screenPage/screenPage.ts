import { Planet } from '../js/planet.js';
import { Scene, Vector3, Color } from 'three';
import { allPlanets, cats, createPlanet, conAdd, controllers, controllers_count } from './animationMain.js';
import { Portal } from '../js/portal.js';
import { findNeighborsVoronoi } from './voronoi.js';
import { Cat } from '../js/cat.js';
import { commandDir } from 'yargs';
const debug = <HTMLButtonElement>document.getElementById('debug-info');
const gyrodata =  <HTMLElement>document.getElementById('gyrodatas');
const screenstate = <HTMLDivElement>document.getElementById('Screen-state');
const websocketState = <HTMLDivElement>document.getElementById('Websocket-state');
const catsdata = <HTMLDivElement>document.getElementById('catsdata');

screenstate.innerHTML = 'Free';
websocketState.innerHTML = 'Starting Websocket...';

gyrodata.hidden = true;
catsdata.hidden = true;

debug.addEventListener('click',  function() {

    catsdata.hidden = !catsdata.hidden;

});

const myId = <HTMLDivElement>document.getElementById('receiver-id');
let controllerId: string | null = null;
let latestControllerID: string | null = null;

interface Message {
    'id': string;
    'client': string;
    'data': {[key: string]: [number, Planet[]]}
    'jdata': [string, number, Cat, number]
    'joins': [string, string]
    'mode': string;
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

function createHTML(controllerid: string) {
    const catinfo = <HTMLButtonElement>document.getElementById(controllerid + '-info');
    const catdiv = <HTMLDivElement>document.getElementById(controllerid);
    if(catinfo != null && catdiv != null){
        catinfo.hidden = false;
        catinfo.disabled = false;
        catdiv.hidden = true;
    }
    else {
        const but = document.createElement('button');
        catsdata.appendChild(but);
        but.type = 'button';
        but.id = controllerid + '-info';
        but.innerHTML = 'Controller: ' + controllerid;

        const div = document.createElement('div');
        catsdata.appendChild(div);
        div.id = controllerid;

        const p1 = document.createElement('p');
        p1.innerHTML = 'X-force: ';
        div.appendChild(p1);
        const span1 = document.createElement('span');
        p1.appendChild(span1);
        span1.id = controllerid + '-xF';

        const p2 = document.createElement('p');
        p2.innerHTML = 'Y-force: ';
        div.appendChild(p2);
        const span2 = document.createElement('span');
        p2.appendChild(span2);
        span2.id = controllerid + '-yF';

        const p3 = document.createElement('p');
        p3.innerHTML = 'Jump: ';
        div.appendChild(p3);
        const span3 = document.createElement('span');
        p3.appendChild(span3);
        span3.id = controllerid + '-Jump';

        const p4 = document.createElement('p');
        p4.innerHTML = 'X-coord: ';
        div.appendChild(p4);
        const span4 = document.createElement('span');
        p4.appendChild(span4);
        span4.id = controllerid + '-xP';

        const p5 = document.createElement('p');
        p5.innerHTML = 'Y-coord: ';
        div.appendChild(p5);
        const span5 = document.createElement('span');
        p5.appendChild(span5);
        span5.id = controllerid + '-yP';

        const p6 = document.createElement('p');
        p6.innerHTML = 'Beta-angle: ';
        div.appendChild(p6);
        const span6 = document.createElement('span');
        p6.appendChild(span6);
        span6.id = controllerid + '-beta';

        const p7 = document.createElement('p');
        p7.innerHTML = 'Gamma-angle: ';
        div.appendChild(p7);
        const span7 = document.createElement('span');
        p7.appendChild(span7);
        span7.id = controllerid + '-gamma';

        div.hidden = true;

        but.onclick =  function() {

            div.hidden = !div.hidden;

        };
        but.disabled = true;
    }
}

export function sendMessage(mesclient: string, mesdata: (string | number | Cat)[]) {
    console.log('going to jump');
    websocket.send(JSON.stringify({client : mesclient, data : mesdata, id: myId.innerHTML}));
    console.log('jumped here');
}

function colorCreation(id: string): THREE.ColorRepresentation | undefined {
    let hash: number = 5381;

    for (let i = 0; i < id.length; i++) {
        hash = ((hash << 5) + hash) + id.charCodeAt(i); /* hash * 33 + c */
    }

    const r = (hash & 0xFF0000) >> 16;
    const g = (hash & 0x00FF00) >> 8;
    const b = hash & 0x0000FF;

    return '#' + ('0' + r.toString(16)).substr(-2) + ('0' + g.toString(16)).substr(-2) + ('0' + b.toString(16)).substr(-2);
}

function randomColorCreation(id: number = Math.floor((Math.random() * 1000000))): THREE.ColorRepresentation | undefined {
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

let websocket = new WebSocket(url);
console.log('Starting Websocket connection...');

websocket.onopen = () => {
    console.log('Connection established.');
    websocket.send(JSON.stringify({client: 'screen', id: myId.innerHTML}));
    websocketState.innerHTML = 'Connected';
};

websocket.onmessage = (message:WebSocketMessage) => {
    const mes = <Message>JSON.parse(message.data);
    console.log('received message from : ', mes.id, '  |  client is: ', mes.client);
    if(mes.client === 'controller') {
        controllerId = mes.id;
        latestControllerID = mes.id[mes.id.length-1];
    }
    /*
    if(mes.client === 'disconnect' && mes.id === myId.innerHTML) {
        console.log('Illegal ID, removing websocket connection.');
        websocket.close();
    }*/
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
        while(allPlanets.length < 3) {
            createPlanet(allPlanets.length+1);
        }
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
                const destCoordinates = getPortalCoordinates(neighbor, planet);
                const portal = new Portal(myId.innerHTML, portalCoordinates, neighborID);
                portal.addDestiny(destCoordinates);
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
        const catid = mes.joins[1];
        createHTML(catid!);
        const catinfo = <HTMLButtonElement>document.getElementById(catid! + '-info');
        catinfo.style.backgroundColor = colorCreation(catid!)!.toString();
        conAdd();
        const plan = allPlanets[Math.floor(Math.random() * allPlanets.length)];
        if(mes.joins[0] === myId.innerHTML) {
            const cat = new Cat(catid!, plan.radius, plan);
            console.log(allPlanets);
            catinfo.disabled = false;
            plan.setCat(cat);
            cats.push(cat);
            websocket.send(JSON.stringify({client: 'catColor', catcol: cat, id: myId.innerHTML}));
        } else {
            cats.push(undefined);
        }
    }
    if(mes.client === 'jumpmessage') {
        const [otherScreen, otherPlanetID, otherFakeCat, catIndex] = mes.jdata;
        if(otherScreen === myId.innerHTML) {
            for(const planet of allPlanets) {
                if(planet.id === Number(otherPlanetID)) {
                    const cat = new Cat(otherFakeCat.id, otherFakeCat.radius, planet, otherFakeCat.mass);
                    planet.setCat(cat);
                    const catinfo = <HTMLButtonElement>document.getElementById(otherFakeCat.id + '-info');
                    const catdiv = <HTMLDivElement>document.getElementById(otherFakeCat.id);
                    catinfo.disabled = false;
                    catdiv.hidden = true;
                    cat.positionOnPlanet = new Vector3(0, 0, 0);
                    cats[catIndex] = cat;
                }
            }
        } else {
            const catinfo = <HTMLButtonElement>document.getElementById(otherFakeCat.id + '-info');
            const catdiv = <HTMLDivElement>document.getElementById(otherFakeCat.id);
            catinfo.disabled = true;
            catdiv.hidden = true;
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
                portal.addDestiny(fakePortal.destCoordinates);
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
    if(mes.client === '__ping__') {
        websocket.send(JSON.stringify({client: '__pong__', id: myId.innerHTML}));
    }
    if(mes.client === 'screenState') {
        console.log('screenstate ontvangen');
        if(mes.mode === 'Catcaster') {
            screenstate.innerHTML = 'Game';
        }
        if(mes.mode === 'Free') {
            screenstate.innerHTML = 'Free';
        }
    }
    if(mes.client === 'delcat') {
        const catinfo = <HTMLButtonElement>document.getElementById(mes.id + '-info');
        const catdiv = <HTMLDivElement>document.getElementById(mes.id);
        catinfo.hidden = true;
        catdiv.hidden = true;
        for (let i=0; i< cats.length; i++) {
                const cat = cats[i];
                if ((cat !== undefined) && (cats[i]?.id === mes.id)) {
                    const planet = cats[i]?.planet;
                    planet?.cats.delete(mes.id);
                    if (cat.mesh !== undefined) {
                        planet?.scene.remove(cat.mesh);
                    }
                    cats[i] = undefined;
                }
        }
    }
};

websocket.onclose = () => {
    console.log('Connection lost, attempting to reconnect...'); //ADD TO HTML PAGE !!!!
    window.location.href = '/catcaster/error/';
};

if (getIdScreen() !== null) {
    myId.innerHTML = <string>getIdScreen();
}

export {myId, controllerId};
