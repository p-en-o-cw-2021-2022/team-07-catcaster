import { WebSocketMessage, Message } from "../controllerPage/controllerPage";

const playButton = <HTMLButtonElement>document.getElementById('play-multi-screen');
const rejoinButton = <HTMLButtonElement>document.getElementById('re-join');
const deleteButton = <HTMLButtonElement>document.getElementById('delete-multi-screen');
let mode: any = null;

const url: string = 'wss' + window.location.href.substr(5);
const websocket = new WebSocket(url);
console.log('Starting Websocket connection...');

websocket.onopen = () => {
    const cid : string|null = getId();
    websocket.send(JSON.stringify({id: cid}));
    console.log('Connection established.');
};

websocket.onmessage = (message:WebSocketMessage) => {
    const mes = <Message>JSON.parse(message.data);
    if (mes.client === 'mode'){
        mode = mes.mode;
    }
    if (mes.client === 'disconnect'){
        console.log('Illegal ID, removing websocket connection.');
        websocket.close();
        window.location.href = '/catcaster/error/';
    }
}

playButton.addEventListener('click', function() {
    const cid : string|null = getId();
    websocket.send(JSON.stringify({client: 'get-mode', id: cid}));
    websocket.send(JSON.stringify({client: 'join', id:cid}));
    setTimeout(() => {
        window.location.href = '/catcaster/controller/?id=' + cid + '&mode=' + mode;
    }, 200)
});

rejoinButton.addEventListener('click', function() {
    const previousid = prompt('What was your ID?');
    websocket.send(JSON.stringify({client: 'get-mode', id: previousid}));
    websocket.send(JSON.stringify({client: 'join', id:previousid}));
    setTimeout(() => {
        window.location.href = '/catcaster/controller/?id=' + previousid + '&mode=' + mode;
    }, 200)
});

deleteButton.addEventListener('click', function() {
    const cid : string|null = getId();
    websocket.send(JSON.stringify({client: 'endgame', id:cid}));
    window.location.href = '/catcaster/endgame/';
});

function getId(): string | null {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const id: string | null = urlParams.get('id');
    if (id) {
        return id;
    } else {
        return null;
    }
}

