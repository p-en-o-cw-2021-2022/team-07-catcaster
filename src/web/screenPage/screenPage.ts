import { Planet } from '../js/planet.js';

import {allPlanets} from './animationMain.js';
const debug = <HTMLButtonElement>document.getElementById("debug-info");
const xF =  <HTMLParagraphElement>document.getElementById("xF");
const yF =  <HTMLParagraphElement>document.getElementById("yF");
const xP =  <HTMLParagraphElement>document.getElementById("xP");
const yP =  <HTMLParagraphElement>document.getElementById("yP");
const zP =  <HTMLParagraphElement>document.getElementById("zP");
const angle =  <HTMLParagraphElement>document.getElementById("angle");
const catPosAngle =  <HTMLParagraphElement>document.getElementById("catPosAngle");
const acc =  <HTMLParagraphElement>document.getElementById("acc");
const gyrodata =  <HTMLElement>document.getElementById("gyrodata");

debug.addEventListener('click',  function() {
    
    gyrodata.hidden = !gyrodata.hidden;
    
    
    
    
    
    
});

const qr = <HTMLImageElement>document.getElementById('qrcode');

const myId = <HTMLDivElement>document.getElementById('receiver-id');
let controllerId = null;

interface Message {
    'id': string;
    'client': string;
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
            const qrcodelarge = <HTMLImageElement>document.getElementById('qrcodelarge');
            qrcodelarge.src = 'https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=' + String(getIdScreen());

            sendDataforMulti(websocket, allPlanets);

        }
    };

    websocket.onclose = () => {
        window.location.href = '/catcaster/error/'
    }
}

if (getIdScreen() !== null) {
    myId.innerHTML = <string>getIdScreen();
}
eventHandlersScreen();

export {myId, controllerId};
