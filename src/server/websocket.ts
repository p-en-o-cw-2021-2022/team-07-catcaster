/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import ws, { WebSocketServer } from 'ws';
import { database } from './index';
import { z } from 'zod';

const multiScreenData:{ [key: string]: Array<string> } = {};

export function websocketEventHandlers(websocket:ws.Server) {

    websocket.on('connection', (ws : ws.WebSocket) => {

        console.log('Connection established.');


        ws.on('message', (message) => {
            const mes : any = <string>JSON.parse(message.toString());
            console.log('Received message from: ', mes.id);
            const controllerid = database.getControllerIds();
            const screenid = database.getScreenIds();
            const id = <string>mes.id;

            switch (mes.client) {
            case 'screen':
                console.log('Newly connected ID is from a screen.');

                //Het id dat door de client wordt doorgestuurd moet reeds bestaan.
                if (!database.doesIdExist(mes.id)) {
                    console.log('Received ID is not in the database, closing connection to client.');
                    ws.send(JSON.stringify({client : 'disconnect', id : mes.id}));
                }
                //ws.send(JSON.stringify({type: 'ControllerID', id: mes.id}));
                break;

            case 'controller':
                console.log('Newly connected ID is from a controller.');

                //Het id dat door de client wordt doorgestuurd moet reeds bestaan.
                if (!database.doesIdExist(mes.id)) {
                    console.log('Received ID is not in the database, closing connection to client.');
                    ws.send(JSON.stringify({client : 'disconnect', id : mes.id}));
                }

                //Send the controller the ID of the screen, as to establish a webRTC connection
                websocket.clients.forEach(function(client) {
                    client.send(JSON.stringify({client: 'controller', id:controllerid}));
                });
                for(const sid of screenid) {
                    ws.send(JSON.stringify({client : 'screen', id : sid}));
                }
                setTimeout(() => {ws.send(JSON.stringify({client : 'connect', id : 0}));}, 500);
                break;

            case 'multi-screen':
                if (!database.doesIdExist(mes.id)){
                    console.log('Received ID is not in the database, closing connection to client.');
                    ws.send(JSON.stringify({client : 'disconnect', id : mes.id}))
                }
                websocket.clients.forEach((client) => {
                    client.send(JSON.stringify({client : 'multi-screen'}));
                });
                ws.send(JSON.stringify({client: 'multiscreen-send'}))

            case 'qrlocations':
                console.log('received qr data',mes.data);
                console.log('ABCD');
                websocket.clients.forEach((client) => {
                    client.send(JSON.stringify({client : 'multi-screen'}));
                });
                break;

            case 'screenMultiData':
                multiScreenData[id] = [mes.innerHeight, mes.planets];
                console.log(multiScreenData);
            }

            
        });
    });

    websocket.on('close', () => {
        console.log('Websocket connection closed.');
    });
}

function ping(clients: any) {
    clients.forEach(function(client: any) {
        client.send(JSON.stringify({client: '__ping__'}));

    });
}