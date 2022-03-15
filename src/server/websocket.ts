import ws, { WebSocketServer } from 'ws';
import { database } from './index';
import { z } from 'zod';

export function websocketEventHandlers(websocket:ws.Server) {

    websocket.on('connection', (ws : ws.WebSocket) => {

        console.log('Connection established.');

        ws.on('message', (message) => {
            const inputcheck = z.object({
                client : z.string(),
                id : z.string().refine((value:any) => database.doesIdExist(value), {
                    message: 'Given ID does not exist.'
                })
            });

            const mes = JSON.parse(message.toString());
            console.log('Received message from: ', mes.id);

            if (mes.succes) {

                switch (mes.client) {

                case 'screen':
                    console.log('Newly connected ID is from a screen.');
                    
                    //Het id dat door de client wordt doorgestuurd moet reeds bestaan.
                    if (!database.doesIdExist(mes.id)){
                        console.log('Received ID is not in the database.');
                        return;
                    }
                    //ws.send(JSON.stringify({type: 'ControllerID', id: mes.id}));
                    break

                case 'controller':
                    console.log('Newly connected ID is from a controller.');

                    //Het id dat door de client wordt doorgestuurd moet reeds bestaan.
                    if (!database.doesIdExist(mes.id)){
                        console.log('Received ID is not in the database.');
                        return;
                    }

                    //Send the controller the ID of the screen, as to establish a webRTC connection
                    let controllerid = database.getControllerIds();
                    websocket.clients.forEach(function(client){
                        client.send(JSON.stringify({client: 'controller', id:controllerid}))
                    });
                    let screenid = database.getScreenIds();
                    for(let sid of screenid!){
                        ws.send(JSON.stringify({client : 'screen', id : sid}))
                    }
                    setTimeout((event) => {ws.send(JSON.stringify({client : 'connect', id : 0}))}, 500);
                    break
                }
            }

            else {
                console.log('Illegal input, closing connection...');
                ws.close();
            }
        })
    });

    websocket.on('close', () => {
        console.log('Websocket connection closed.');
    })
}