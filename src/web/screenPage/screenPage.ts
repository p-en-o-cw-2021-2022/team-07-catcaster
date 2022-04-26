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
        if(mes.client == 'multi-screen'){
            console.log('Received message');
            const qrcode = <HTMLImageElement>document.getElementById('qrcode');
            qrcode.src = 'https://chart.googleapis.com/chart?cht=qr&chl=' + getIdScreen() + '&chs=160x160&chld=L|0';
        }
    };
}

if (getIdScreen() !== null) {
    myId.innerHTML = <string>getIdScreen();
}
eventHandlersScreen();

export {myId, controllerId};
