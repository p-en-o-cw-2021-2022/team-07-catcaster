var id = <HTMLDivElement>document.getElementById('sender-id');
var screenId = <HTMLDivElement>document.getElementById('receiver-id');
var connectiondiv = <HTMLDivElement>document.getElementById('connection-div');

id.innerHTML = getIdController();
eventHandlersController();

function getIdController(){
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const id: any = urlParams.get('id');
    return id;
}

function eventHandlersController() {
    let url = 'ws://localhost:3000/catcaster/controller/' + id.innerHTML;

    const websocket = new WebSocket(url);
    console.log("Starting Websocket connection...")

    websocket.onopen = (event) => {
        console.log('Connection established.');
        websocket.send(JSON.stringify({client: 'controller', id: id.innerHTML}));
    };

    websocket.onmessage = (message:any) => {
        let mes = JSON.parse(message.data);
        console.log('received message from : ', mes.id, '  |  client is: ', mes.client);
        if (mes.client == 'connect'){
            connectiondiv.innerHTML = 'connect';
        }
        if(mes.client == 'screen'){
            screenId.innerHTML += mes.id;
        }
    };
};
