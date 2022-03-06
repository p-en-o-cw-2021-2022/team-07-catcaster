websocketEventHandlers();

function websocketEventHandlers() {
    let url = prompt("Enter websocket server address:");
    if (url == null) {
        return;
    }
    const websocket = new WebSocket(url);

    websocket.onopen = (event) => {
        console.log('connection was established.');
        websocket.send(JSON.stringify({type: 'test', id: 'id'}));
        websocket.close();
    };

    websocket.onmessage = (message) => {
        console.log('received message : ', message);
    };
};