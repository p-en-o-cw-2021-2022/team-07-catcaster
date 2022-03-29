const id = <HTMLDivElement>document.getElementById('sender-id');
const screenId = <HTMLDivElement>document.getElementById('receiver-id');
const connectiondiv = <HTMLDivElement>document.getElementById('connection-div');

id.innerHTML = getIdController();
eventHandlersController();

function getIdController() {
    const currentUrl = window.location.href;
    let result:string = '';
    for(let i = 0; i < 8;i++) {
        const index = currentUrl.length - 8 + i;
        result = result + currentUrl[index];
    }
    return result;
}

function eventHandlersController() {
    const url = 'wss' + window.location.href.substr(5);

    const websocket = new WebSocket(url);
    console.log('Starting Websocket connection...');

    websocket.onopen = (event) => {
        console.log('Connection established.');
        websocket.send(JSON.stringify({client: 'controller', id: id.innerHTML}));
    };

    websocket.onmessage = (message:any) => {
        const mes = JSON.parse(message.data);
        console.log('received message from : ', mes.id, '  |  client is: ', mes.client);
        if (mes.client == 'connect') {
            connectiondiv.innerHTML = 'connect';
        }
        if(mes.client == 'screen') {
            screenId.innerHTML += mes.id;
        }
    };
}
