
const myId = <HTMLDivElement>document.getElementById('receiver-id');
myId.innerHTML = getIdScreen();
let controllerId = null;
eventHandlersScreen();

function getIdScreen() {
    const currentUrl = window.location.href;
    let result:string = '';
    for(let i = 0; i < 8;i++) {
        const index = currentUrl.length - 8 + i;
        result = result + currentUrl[index];
    }
    return result;
}

function eventHandlersScreen() {
    const url = 'wss' + window.location.href.substr(5);

    const websocket = new WebSocket(url);
    console.log('Starting Websocket connection...');

    websocket.onopen = (event) => {
        console.log('Connection established.');
        websocket.send(JSON.stringify({client: 'screen', id: myId.innerHTML}));
    };

    websocket.onmessage = (message:any) => {
        const mes = JSON.parse(message.data);
        console.log('received message from : ', mes.id, '  |  client is: ', mes.client);
        if(mes.client == 'controller') {
            controllerId = mes.id;
        }
    };
}

export {myId, controllerId};