var id = <HTMLDivElement>document.getElementById('sender-id');
var screenId = <HTMLDivElement>document.getElementById('receiver-id');
var connectiondiv = <HTMLDivElement>document.getElementById('connection-div');

id.innerHTML = getIdController();
eventHandlersController();

function getIdController(){
    let currentUrl = window.location.href;
    let result:string = "";
    for(let i = 0; i < 8;i++){
        let index = currentUrl.length - 8 + i;
        result = result + currentUrl[index];
    };
    return result;
}

function eventHandlersController() {
    let url = prompt()!;
    //'wss://bab5-2a02-2c40-200-b001-00-1-97fd.eu.ngrok.io/catcaster/controller/' + id.innerHTML;

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
