import { Color } from 'three';
import { Cat } from '../js/cat';

const id = <HTMLDivElement>document.getElementById('sender-id');
const screenId = <HTMLDivElement>document.getElementById('receiver-id');
const connectiondiv = <HTMLDivElement>document.getElementById('connection-div');
const debug_controller = <HTMLButtonElement>document.getElementById('debug-info-controller');
const controller_data =  <HTMLElement>document.getElementById('data');

debug_controller.addEventListener('click',  function() {
    controller_data.hidden = !controller_data.hidden;
});


export interface Message {
    'id': string;
    'client': string;
    'catcol': Cat;
    'mode': string;
}

export interface WebSocketMessage {
    'data': string;
}

function getIdController(): string | null {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const id: string | null = urlParams.get('id');
    if (id) {
        return id;
    } else {
        return null;
    }
}

function eventHandlersController() {

    const url = 'wss' + window.location.href.substr(5);

    let websocket = new WebSocket(url);
    console.log('Starting Websocket connection...');

    websocket.onopen = () => {
        console.log('Connection established.');
        websocket.send(JSON.stringify({client: 'controller', id: id.innerHTML}));
    };

    websocket.onmessage = (message:WebSocketMessage) => {
        const mes = <Message>JSON.parse(message.data);
        console.log('received message from : ', mes.id, '  |  client is: ', mes.client);
        if(mes.client === 'disconnect' && mes.id === id.innerHTML) {
            console.log('Illegal ID, removing websocket connection.');
            websocket.close();
            window.location.href = '/catcaster/error/';
        }
        if (mes.client === 'connect') {
            connectiondiv.innerHTML = 'connect';
        }
        if(mes.client === 'screen') {
            screenId.innerHTML += mes.id;
        }
        if(mes.client === 'catColor') {
            const cat: Cat = mes.catcol;
            if(cat.id == id.innerHTML) {
                const color = cat.color;
                document.body.style.backgroundColor = color!.toString();
            }
        }
        if(mes.client === 'endgame') {
            window.location.href = '/catcaster/endgame/';
        }
        if(mes.client === '__ping__') {
            websocket.send(JSON.stringify({client: '__pong__', id: id.innerHTML}));
        }
    };

    window.onbeforeunload = function() {
        websocket.send(JSON.stringify({client: 'removeCat', id: id.innerHTML}));
    };

    websocket.onclose = () => {
        websocket.send(JSON.stringify({client: 'disconnected', id: id.innerHTML}));
        console.log('Connection lost, attempting to reconnect...'); //ADD TO HTML PAGE !!!!
        let tries = 0;
        while (websocket.readyState === 3 && tries <= 10) {
            websocket = new WebSocket(url);
            tries += 1;
        }
        if (websocket.readyState === 1) {
            console.log('Reconnected succesfully.'); //ADD TO HTML PAGE !!!!
        } else {
            console.log('Reconnection failed, terminating...'); //ADD TO HTML PAGE !!!!
        }
    };
}

if (getIdController() !== null) {
    id.innerHTML = <string>getIdController();
}
eventHandlersController();
