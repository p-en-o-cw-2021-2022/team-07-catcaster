requestControllerID();

async function requestControllerID() {
    const response = await fetch('/catcaster/controller/', {
        method : 'POST',
        headers : {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: ''
    });

    if (response.ok) {
        const id = await response.json();
        setTimeout(() => {}, 50);
        const url: string = 'wss' + window.location.href.substr(5);

        const websocket = new WebSocket(url);
        console.log('Starting Websocket connection...');

        websocket.onopen = () => {
            console.log('Connection established.');
            websocket.send(JSON.stringify({client: 'nbcontrollers',id:id}));
        }
        websocket.onmessage = async (message:WebSocketMessage) => {
            const mes = <Message>JSON.parse(message.data);
            if (mes.client.length == 1 || mes.client.length == 0){
                window.location.href = '/catcaster/controller/?id='+id;
            }
            else {
                window.location.href = '/catcaster/menu/?id=' + id;
            }
        };
        
        
    }
}
