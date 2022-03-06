//requestID();
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
    };

    websocket.onmessage = (message) => {
        console.log('received message : ', message);
    };

};

async function requestID(){
    let response = await fetch("/catcaster/screen/", {
        method : 'POST',
        headers : {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: ''
    });

    if (response.ok) {
        let id = await response.json();
        //window.location.href = '/catcaster/screen/'+id;
    };
    
};
