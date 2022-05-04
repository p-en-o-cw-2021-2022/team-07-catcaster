/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import ws, { WebSocketServer } from 'ws';
import { QRlocation } from '../web/controllerPage/start-screen-main';
import { Planet } from '../web/js/planet';
import { Portal } from '../web/js/portal';
import { database } from './index';
import { findNeighborsVoronoi } from '../web/controllerPage/voronoi'
import { Vector2Tuple, Vector3 } from 'three';
import { z } from 'zod';

const multiScreenData:{[key: string]: [number, Planet[]]} = {};
let qrlocations: QRlocation[] = Array();

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
                    if (!database.doesIdExist(mes.id)){
                        console.log('Received ID is not in the database, closing connection to client.');
                        ws.send(JSON.stringify({client : 'disconnect', id : mes.id}));
                    }
                    console.log('selected multi screen');
                    websocket.clients.forEach((client) => {
                        client.send(JSON.stringify({client : 'multi-screen'}));
                    });
                    ws.send(JSON.stringify({client: 'multiscreen-send'}));
                    break;

                case 'qrlocations':
                    console.log('qrlocations ontvangen', mes.data);
                    qrlocations = mes.data;
                    generateSites();
                    break;

                case 'screenMultiData':
                    multiScreenData[id] = [mes.innerHeight, mes.planets];
                    //console.log(multiScreenData);
                    break;
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

function findScreenCoordinates(id: string){
    for (const qr of qrlocations){
        if(qr.id == id){
            return qr.middle_location;
        }
    }
}

function calculatePortalCoordinates(myPlanet: Planet, otherPlanet: Planet, ratio: number, screenCoordinates: Vector3){
    let vector = new Vector3;
    vector.addVectors(otherPlanet.coordinates, myPlanet.coordinates.multiplyScalar(-1));
    vector.normalize();
    vector.multiplyScalar(myPlanet.radius-2);
    let localPlanetCoordinates = new Vector3;
    localPlanetCoordinates.addVectors(myPlanet.coordinates, screenCoordinates.multiplyScalar(-1))
    localPlanetCoordinates.multiplyScalar(1/ratio);
    localPlanetCoordinates.add(vector);
    return localPlanetCoordinates;
}

function generateSites() {
    let ratio = Object();
    let sites: Array<{x: number; y: number; id: string}> = [];
    let planetsIDs: {[key: number]: [string, number]} = {};
    let globalPlanetID = 0;
    for (const qrloc of qrlocations){
        let id = qrloc.id;
        ratio[id] = Math.abs(qrloc.topleft_location.y - qrloc.bottomright_location.y) / multiScreenData[id][0];
        for (const planet of multiScreenData[id][1]){
            planetsIDs[globalPlanetID] = [id, planet.id];
            let globalPlanetCoordinates = new Vector3;
            globalPlanetCoordinates.add(planet.coordinates);
            globalPlanetCoordinates.multiplyScalar(ratio[id]);
            let qrVector = new Vector3;
            qrVector.set(qrloc.middle_location.x, qrloc.middle_location.y, 0);
            globalPlanetCoordinates.add(qrVector);
            planet.coordinates = globalPlanetCoordinates;
            let site: {x: number; y: number; id: string} = {x: planet.coordinates.x, y: planet.coordinates.y, id: globalPlanetID.toString()};
            sites.push(site);
            globalPlanetID++;
        }
    }
    const neighbors = findNeighborsVoronoi(sites);
    // const Portals = Portal[];
    for(const planet of neighbors){
        const myID = planet.id;
        const myPlanet = findPlanet(Number(myID))!;
        const myCoordinates = myPlanet!.coordinates;
        const neighborsToAdd = planet.neighborsOfID;
        for(const neighborToAdd of neighborsToAdd){
            const [otherScreen, otherPlanetID] = planetsIDs[Number(neighborToAdd)];
            const screenID = planetsIDs[Number(myID)][0];
            const otherPlanet = findPlanet(otherPlanetID)!;
            const screenCoordinates = findScreenCoordinates(screenID)!;
            let screenVector = new Vector3;
            screenVector.set(screenCoordinates.x, screenCoordinates.y, 0);
            const portalCoordinates = calculatePortalCoordinates(myPlanet, otherPlanet, ratio[screenID], screenVector);
            const portal = new Portal(otherScreen, portalCoordinates, otherPlanet);
            myPlanet.addPortal(portal);
            console.log(portal);
            
        }
        console.log('planet: ', myPlanet);
    }
}

function ping(clients: any) {
    clients.forEach(function(client: any) {
        client.send(JSON.stringify({client: '__ping__'}));

    });
}