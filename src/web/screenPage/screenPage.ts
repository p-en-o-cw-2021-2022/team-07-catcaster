import { Planet } from '../js/planet.js';

import {allPlanets} from './animationMain.js';
const debug = <HTMLButtonElement>document.getElementById("debug-info");
const gyrodata =  <HTMLElement>document.getElementById("gyrodata");
const screenState = <HTMLSpanElement>document.getElementById("screenstate")
const websocketState = <HTMLSpanElement>document.getElementById("websocketstate")

debug.addEventListener('click',  function() {
    
    gyrodata.hidden = !gyrodata.hidden;
    
});

const qr = <HTMLImageElement>document.getElementById('qrcode');

const myId = <HTMLDivElement>document.getElementById('receiver-id');
let controllerId = null;

interface Message {
    mode: string;
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
    websocketState.innerHTML = 'Trying to connect...'

    websocket.onopen = () => {
        console.log('Connection established.');
        websocket.send(JSON.stringify({client: 'screen', id: myId.innerHTML}));
        websocketState.innerHTML = 'Connected'
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
            window.location.href = '/catcaster/error/'
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
        if(mes.mode === 'CatCaster') {
            screenState.innerHTML = 'Game';
        }
        if(mes.mode == 'Free') {
            screenState.innerHTML = 'Free';
        }
    };

    websocket.onclose = () => {
        websocketState.innerHTML = 'Connection closed, trying to reconnect...'
    }
}

if (getIdScreen() !== null) {
    myId.innerHTML = <string>getIdScreen();
}
eventHandlersScreen();

export {myId, controllerId};
