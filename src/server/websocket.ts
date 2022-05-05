/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import ws, { WebSocketServer } from 'ws';
import { database } from './index';
import { z } from 'zod';

const multiScreenData:{ [key: string]: Array<string> } = {};
let tm: any
let remTimer: boolean = false;

function pingpong(remTimer: boolean, id: string) {
    if (remTimer === false){
        tm = setTimeout(function () {
            database.removeID(id)
            console.log('connection with ID: ' + id + ' timed out.\r\n removing ID from database...')
        }, 600000)
    }
    else {
        clearTimeout(tm)
    }
}

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

                else {
                    ws.send(JSON.stringify({mode: 'Free'}))
                }
                
                //start ping-pong process
                setInterval(() => {
                    ws.send('__ping__');
                    let remTimer: boolean = false;
                    pingpong(remTimer, id);
                }, 30000)

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
                else {
                    websocket.clients.forEach(function(client) {
                        client.send(JSON.stringify({client: 'controller', id:controllerid}));
                        client.send(JSON.stringify({mode : 'CatCaster'}));
                    });
                    for(const sid of screenid) {
                        ws.send(JSON.stringify({client : 'screen', id : sid}));
                    }
                    setTimeout(() => {ws.send(JSON.stringify({client : 'connect', id : 0}));}, 500);
                }
                setTimeout(() => {ws.send(JSON.stringify({client : 'connect', id : 0}));}, 500);

                //start ping-pong process
                setInterval(() => {
                    ws.send('__ping__');
                    let remTimer: boolean = false;
                    pingpong(remTimer, id);
                }, 30000)
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
                break;

            case 'qrlocations':
                console.log('qrlocations ontvangen')
                console.log(mes.data)
                break;

            case 'screenMultiData':
                multiScreenData[id] = [mes.innerHeight, mes.planets];
                //console.log(multiScreenData);
                break;

            case 'endgame':
                console.log('The game was ended.');
                websocket.clients.forEach((client) => {
                    client.send(JSON.stringify({client : 'endgame'}));
                });
                break;
                
            case 'nbcontrollers':
                let controllerids = database.getControllerIds();
                ws.send(JSON.stringify({client: controllerids}));
                break;
            
                case 'controller-menu':
                if (!database.doesIdExist(mes.id)) {
                    console.log('Received ID is not in the database, closing connection to client.');
                    ws.send(JSON.stringify({client : 'disconnect', id : mes.id}));
                }
                break;
            
            case '__pong__':
                remTimer = true;
                pingpong(remTimer, id);
                break;
            }
        });
    });

    websocket.on('close', () => {
        console.log('Websocket connection closed.');
    });
}
