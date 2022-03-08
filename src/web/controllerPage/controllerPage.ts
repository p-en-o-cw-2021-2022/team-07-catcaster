const id = getIdController();
var screenId = null;
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
        websocket.send(JSON.stringify({client: 'controller', id: id}));
    };

    websocket.onmessage = (message:any) => {
        let mes = JSON.parse(message.data);
        console.log('received message from : ', mes.id, '  |  client is: ', mes.client);
        if(mes.client == 'screen'){
            screenId = mes.id;
        }
    };
};
export {id, screenId}