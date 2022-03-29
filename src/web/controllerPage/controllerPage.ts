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
    let url = "wss" + window.location.href.substr(5);

    let websocket = new WebSocket(url);
    console.log("Starting Websocket connection...")

    websocket.onopen = (event) => {
        console.log('Connection established.');
        websocket.send(JSON.stringify({client: 'controller', id: id.innerHTML}));
    };

    websocket.onmessage = (message:any) => {
        let mes = JSON.parse(message.data);
        console.log('received message from : ', mes.id, '  |  client is: ', mes.client);
        if(mes.client == 'disconnect' && mes.id == id.innerHTML){
            console.log('Illegal ID, removing websocket connection.');
            websocket.close();
            window.location.href = '/catcaster/error/'
        }
        if (mes.client == 'connect'){
            connectiondiv.innerHTML = 'connect';
        }
        if(mes.client == 'screen'){
            screenId.innerHTML += mes.id;
        }
    };

    websocket.onclose = (event) => {
        websocket.send(JSON.stringify({client: 'disconnected', id: id.innerHTML}))
        console.log('Connection lost, attempting to reconnect...') //ADD TO HTML PAGE !!!!
        let tries = 0
        while (websocket.readyState == 3 && tries <= 10) {
            websocket = new WebSocket(url);
            tries += 1;
            sleep(50)
        };
        if (websocket.readyState == 1) {
            console.log('Reconnected succesfully.') //ADD TO HTML PAGE !!!!
        }
        else {
            console.log('Reconnection failed, terminating...') //ADD TO HTML PAGE !!!!
        }
    }
};

function sleep(milliseconds: any) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
};
