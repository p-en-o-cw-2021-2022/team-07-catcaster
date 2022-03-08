const id = getId();
websocketEventHandlers();

function getId(){
    let currentUrl = window.location.href;
    let result:string = "";
    for(let i = 0; i < 8;i++){
        let index = currentUrl.length - 8 + i;
        result = result + currentUrl[index];
    };
    return result;
}

function websocketEventHandlers() {
    let url = prompt("Enter websocket server address:");
    if (url == null) {
        return;
    }

    const websocket = new WebSocket(url);
    console.log("Starting Websocket connection...")

    websocket.onopen = (event) => {
        console.log('Connection established.');
        websocket.send(JSON.stringify({client: 'screen', id: id}));
        websocket.send(JSON.stringify({client: 'controller', id: ''}))
    };

    websocket.onmessage = (message:any) => {
        console.log(message.data);
        console.log(typeof(message.data));
        console.log(message.data[10]);
        console.log('received message from : ', message.data.id, '  |  client is: ', message.data.client);
    };
};