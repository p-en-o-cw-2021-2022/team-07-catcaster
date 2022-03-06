import ws from 'ws';

export function websocketEventHandlers(websocket:ws.Server) {

    websocket.on('connection', (ws : ws.WebSocket) => {

        console.log('Connection established.');

        ws.on('message', (message) => {
            console.log('Received message: ', message);
            const mes = JSON.parse(message.toString());
            console.log(mes);

            switch (mes.type) {

            case 'test':
                console.log('Succesfully accepted test message.');
                ws.send(JSON.stringify({answer: "Test successfull"}));
                break
            }

        })
    });

    websocket.on('close', () => {
        console.log('Websocket connection closed.');
    })
}