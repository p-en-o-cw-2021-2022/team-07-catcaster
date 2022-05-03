/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import ws, { WebSocketServer } from 'ws';
import { QRlocation } from '../web/controllerPage/start-screen-main';
import { Planet } from '../web/js/planet';
import { Portal } from '../web/js/portal';
import { database } from './index';
import { findNeighborsVoronoi } from '../web/controllerPage/voronoi'

const multiScreenData:{[key: string]: [number, Planet[]]} = {};

export function websocketEventHandlers(websocket: ws.Server) {

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

function findPlanet(id: number){
    for (const planet of multiScreenData[id][1]){
        if(planet.id == id){
            return planet;
        }
    }
}

function generateSites(qrlocations: QRlocation[]) {
    let ratio = Object();
    let sites: Array<{x: number; y: number; id: string}> = [];
    let planetsIDs: {[key: number]: [string, number]} = {};
    let globalPlanetID = 0;
    for (const qrloc of qrlocations){
        let id = qrloc.id;
        ratio[id] = Math.abs(qrloc.topleft_location.y - qrloc.bottomright_location.y) / multiScreenData[id][0];
        for (const planet of multiScreenData[id][1]){
            planetsIDs[globalPlanetID] = [id, planet.id];
            planet.coordinates = [qrloc.middle_location.x + planet.coordinates[0] * ratio[id], qrloc.middle_location.y + planet.coordinates[1]*ratio[id], 0];
            let site: {x: number; y: number; id: string} = {x: planet.coordinates[0], y: planet.coordinates[1], id: globalPlanetID.toString()};
            sites.push(site);
            globalPlanetID++;
        }
    }
    const neighbors = findNeighborsVoronoi(sites);
    // const Portals = Portal[];
    for(const planet of neighbors){
        const myID = planet.id;
        const myPlanet = findPlanet(Number(myID))
        const neighborsToAdd = planet.neighborsOfID;
        for(const neighborToAdd of neighborsToAdd){
            const [otherScreen, otherPlanet] = planetsIDs[Number(neighborToAdd)];
            const portalCoordinates = ;
            // neighborToAdd -> int -> local;
            const portal = new Portal(otherScreen, portalCoordinates, otherPlanet);
            for (const planet of multiScreenData[id][1]){
                if(planet.id = myID){

                }
            }
        }
    }
}