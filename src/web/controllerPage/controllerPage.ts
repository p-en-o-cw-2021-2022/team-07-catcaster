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

    const websocket = new WebSocket(url);
    console.log('Starting Websocket connection...');

    websocket.onopen = () => {
        console.log('Connection established.');
        websocket.send(JSON.stringify({client: 'controller', id: id.innerHTML}));
    };

    websocket.onmessage = (message:WebSocketMessage) => {
        const mes = <Message>JSON.parse(message.data);
        console.log('received message from : ', mes.id, '  |  client is: ', mes.client);
        if (mes.client === 'connect') {
            connectiondiv.innerHTML = 'connect';
        }
        if(mes.client === 'screen') {
            screenId.innerHTML += mes.id;
        }
    };
}

if (getIdController() !== null) {
    id.innerHTML = <string>getIdController();
}
eventHandlersController();
