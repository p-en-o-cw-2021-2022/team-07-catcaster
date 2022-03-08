var id = <HTMLDivElement>document.getElementById('sender-id');
var screenId = <HTMLDivElement>document.getElementById('receiver-id');

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
    let url = prompt("Enter websocket server address:");
    if (url == null) {
        return;
    }

    const websocket = new WebSocket(url);
    console.log("Starting Websocket connection...")

    websocket.onopen = (event) => {
        console.log('Connection established.');
        websocket.send(JSON.stringify({client: 'controller', id: id.innerHTML}));
    };

    websocket.onmessage = (message:any) => {
        let mes = JSON.parse(message.data);
        console.log('received message from : ', mes.id, '  |  client is: ', mes.client);
        if(mes.client == 'screen'){
            screenId.innerHTML = mes.id;
        }
    };
};

