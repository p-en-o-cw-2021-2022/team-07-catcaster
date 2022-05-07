import { Planet } from '../js/planet.js';
import { Scene } from 'three'
import { allPlanets } from './animationMain.js';
import { Portal } from '../js/portal.js';
const debug = <HTMLButtonElement>document.getElementById('debug-info');
const gyrodata =  <HTMLElement>document.getElementById('gyrodatas');

debug.addEventListener('click',  function() {

    gyrodata.hidden = !gyrodata.hidden;

});

const qr = <HTMLImageElement>document.getElementById('qrcode');

const myId = <HTMLDivElement>document.getElementById('receiver-id');
let controllerId = null;

interface Message {
    'id': string;
    'client': string;
    'data': {[key: string]: [number, Planet[]]}
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

function eventHandlersScreen() {
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
        if(mes.client === 'endgame') {
            console.log('The game was ended.');
            window.location.href = '/catcaster/endgame/';
        }
        if(mes.client == 'portal') {
            console.log('Portals received.');
            const multiScreenData = mes.data;
            const planets: Planet[] = [];
            for (const fakePlanet of multiScreenData[myId.innerHTML][1]) {
                const scene = new Scene();
                const coords = [fakePlanet.coordinates.x, fakePlanet.coordinates.y, fakePlanet.coordinates.z];
                const planet = new Planet(scene, fakePlanet.id, fakePlanet.radius, fakePlanet.friction, coords);
                for(const fakePortal of fakePlanet.portals){
                    const portal = new Portal(fakePortal.otherScreen, fakePortal.myCoordinates, fakePortal.otherPlanet);
                    planet.addPortal(portal);
                }
                planets.push(planet);
            }
            for(const planet of allPlanets) {
                for(const serverPlanet of planets){
                    if(planet.id == serverPlanet.id){
                        for(const portal of serverPlanet.portals){
                            planet.addPortal(portal);
                        }
                    }
                }
                console.log('changedplanet: ', planet);
            }
            // verander ik hier ook de portals in animation.ts
        }
    };

    websocket.onclose = () => {
        window.location.href = '/catcaster/error/';
    };
}

if (getIdScreen() !== null) {
    myId.innerHTML = <string>getIdScreen();
}
eventHandlersScreen();

export {myId, controllerId};
