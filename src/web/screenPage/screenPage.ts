
var myId = <HTMLDivElement>document.getElementById("receiver-id");
myId.innerHTML = getIdScreen();
var controllerId = null;
eventHandlersScreen();

function getIdScreen(){
    let currentUrl = window.location.href;
    let result:string = "";
    for(let i = 0; i < 8;i++){
        let index = currentUrl.length - 8 + i;
        result = result + currentUrl[index];
    };
    return result;
}

function eventHandlersScreen() {
    let url = prompt("Enter websocket server address:");
    if (url == null) {
        return;
    }

    const websocket = new WebSocket(url);
    console.log("Starting Websocket connection...")

    websocket.onopen = (event) => {
        console.log('Connection established.');
        websocket.send(JSON.stringify({client: 'screen', id: myId}));
    };

    websocket.onmessage = (message:any) => {
        let mes = JSON.parse(message.data);
        console.log('received message from : ', mes.id, '  |  client is: ', mes.client);
        if(mes.client == 'controller'){
            controllerId = mes.id;
        }
    };
};

export {myId, controllerId}