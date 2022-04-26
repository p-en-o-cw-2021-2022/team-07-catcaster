import ws, { WebSocketServer } from 'ws';
import { database } from './index';
import { z } from 'zod';

export function websocketEventHandlers(websocket:ws.Server) {

    websocket.on('connection', (ws : ws.WebSocket) => {

        console.log('Connection established.');

        ws.on('message', (message) => {

            const mes = JSON.parse(message.toString());
            console.log('Received message from: ', mes.id);

            switch (mes.client) {

            case 'screen':
                console.log('Newly connected ID is from a screen.');

                //Het id dat door de client wordt doorgestuurd moet reeds bestaan.
                if (!database.doesIdExist(mes.id)){
                    console.log('Received ID is not in the database, closing connection to client.');
                    ws.send(JSON.stringify({client : 'disconnect', id : mes.id}))
                }
                //ws.send(JSON.stringify({type: 'ControllerID', id: mes.id}));
                break;

            case 'controller':
                console.log('Newly connected ID is from a controller.');

                //Het id dat door de client wordt doorgestuurd moet reeds bestaan.
                if (!database.doesIdExist(mes.id)){
                    console.log('Received ID is not in the database, closing connection to client.');
                    ws.send(JSON.stringify({client : 'disconnect', id : mes.id}))
                }

                //Send the controller the ID of the screen, as to establish a webRTC connection
                const controllerid = database.getControllerIds();
                websocket.clients.forEach(function(client) {
                    client.send(JSON.stringify({client: 'controller', id:controllerid}));
                });
                const screenid = database.getScreenIds();
                for(const sid of screenid) {
                    ws.send(JSON.stringify({client : 'screen', id : sid}));
                }
                setTimeout((event) => {ws.send(JSON.stringify({client : 'connect', id : 0}));}, 500);
                break;

            case 'multi-screen':
                console.log('ABCD')
                websocket.clients.forEach((client) => {
                    client.send(JSON.stringify({client : 'multi-screen'}));
                });
            }
        });
    });

    websocket.on('close', () => {
        console.log('Websocket connection closed.');
    });
}