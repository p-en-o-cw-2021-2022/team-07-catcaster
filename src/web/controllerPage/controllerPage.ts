const id = <HTMLDivElement>document.getElementById('sender-id');
const screenId = <HTMLDivElement>document.getElementById('receiver-id');
const connectiondiv = <HTMLDivElement>document.getElementById('connection-div');

interface Message {
    'id': string;
    'client': string;
}

interface WebSocketMessage {
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
    };

    websocket.onclose = () => {
        websocket.send(JSON.stringify({client: 'disconnected', id: id.innerHTML}));
        console.log('Connection lost, attempting to reconnect...'); //ADD TO HTML PAGE !!!!
        let tries = 0;
        while (websocket.readyState === 3 && tries <= 10) {
            websocket = new WebSocket(url);
            tries += 1;
            sleep(50);
        }
        if (websocket.readyState === 1) {
            console.log('Reconnected succesfully.'); //ADD TO HTML PAGE !!!!
        } else {
            console.log('Reconnection failed, terminating...'); //ADD TO HTML PAGE !!!!
        }
    };
}

function sleep(milliseconds: any) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

if (getIdController() !== null) {
    id.innerHTML = <string>getIdController();
}
eventHandlersController();
