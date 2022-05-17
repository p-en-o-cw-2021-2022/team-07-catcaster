/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import ws, { WebSocketServer } from 'ws';
import { QRlocation } from '../web/controllerPage/start-screen-main';
import { Planet } from '../web/js/planet';
import { Portal } from '../web/js/portal';
import { database } from './index';
import { findNeighborsVoronoi } from './voronoi.js';
import { Scene, Vector2Tuple, Vector3 } from 'three';
import { z } from 'zod';

const multiScreenData:{[key: string]: [number, Planet[]]} = {};
let qrlocations: QRlocation[] = [];
let tm: any;
let it: any;
const IDTimers: any = {};
let mode: any = null;

function ping(id: string) {
    if (tm === undefined) {
        tm = setTimeout(function () {
            database.removeID(id);
            console.log('connection with ID: ' + id + ' timed out.\r\n removing ID from database...');
        }, 600000);
        IDTimers[id] = tm;
    } else if (database.doesIdExist(id) && tm._destroyed === true) {
        tm = setTimeout(function () {
            database.removeID(id);
            console.log('connection with ID: ' + id + ' timed out.\r\n removing ID from database...');
        }, 600000);
        IDTimers[id] = tm;
    }
    return tm;
}
function pong(tm: any, id: string) {
    if (IDTimers[id] == tm) {
        clearTimeout(tm);
    }
}

export function websocketEventHandlers(websocket: ws.Server) {

    websocket.on('connection', (ws : ws.WebSocket) => {

        console.log('Connection established.');


        ws.on('message', (message) => {
            const mes : any = <string>JSON.parse(message.toString());
            console.log('Received message from: ', mes.id, ' mes: ', mes.client);
            const controllerid = database.getControllerIds();
            const screenid = database.getScreenIds();
            const id = <string>mes.id;
            //Het id dat door de client wordt doorgestuurd moet reeds bestaan.
            if (!database.doesIdExist(mes.id)) {
                console.log('Received ID is not in the database, closing connection to client.');
                ws.send(JSON.stringify({client : 'disconnect', id : mes.id}));
            }
            switch (mes.client) {
            case 'screen':
                console.log('Newly connected ID is from a screen.');
                //start ping-pong process
                it = setInterval(() => {
                    ws.send(JSON.stringify({client: '__ping__'}));
                    tm = ping(id);
                }, 20000);

                //ws.send(JSON.stringify({type: 'ControllerID', id: mes.id}));
                break;

            case 'controller':
                console.log('Newly connected ID is from a controller.');

                websocket.clients.forEach(function(client) {
                    client.send(JSON.stringify({client: 'screenState', mode: 'Catcaster'}));
                });

                //Send the controller the ID of the screen, as to establish a webRTC connection
                websocket.clients.forEach(function(client) {
                    client.send(JSON.stringify({client: 'controller', id:controllerid}));
                });
                for(const sid of screenid) {
                    ws.send(JSON.stringify({client : 'screen', id : sid}));
                }

                setTimeout(() => {ws.send(JSON.stringify({client : 'connect', id : 0}));}, 500);
                //start ping-pong process
                it = setInterval(() => {
                    ws.send(JSON.stringify({client: '__ping__'}));
                    tm = ping(id);
                }, 20000);

                break;

            case 'multi-screen':
                mode = 'multiscreen'
                websocket.clients.forEach((client) => {
                    client.send(JSON.stringify({client : 'multi-screen'}));
                });
                ws.send(JSON.stringify({client: 'multiscreen-send'}));
                break;

            case 'single-screen':
                mode = 'singlescreen'
                websocket.clients.forEach((client) => {
                    client.send(JSON.stringify({client : 'singleScreen'}));
                });
                break;
            
            case 'get-mode':
                ws.send(JSON.stringify({client: 'mode', mode: mode}));
                break;
            
            case 'jump-message':
                console.log('jumpmessage received.');
                websocket.clients.forEach((client) => {
                    client.send(JSON.stringify({client : 'jumpmessage', jdata: mes.data}));
                });
                break;
            case 'catColor':
                setTimeout(() => {                
                    console.log('catColor received.');
                    console.log(mes.catcol.id, mes.catcol.color);
                    websocket.clients.forEach((client) => {
                        client.send(JSON.stringify({client : 'catColor', id : 'k', catcol : mes.catcol}));
                    });
                } , 1000);
                break;
            case 'join':
                const screens = database.getScreenIds();
                const screen = screens[Math.floor(Math.random() * screens.length)];
                websocket.clients.forEach((client) => {
                    client.send(JSON.stringify({client : 'addCat', joins : [screen, mes.id]}));
                });
                break;

            case 'qrlocations':
                console.log('qrlocations ontvangen', mes.data);
                qrlocations = mes.data;
                const portals = createPortals();
                console.log('portals added: ', portals);
                websocket.clients.forEach((client) => {
                    client.send(JSON.stringify({client : 'portal', data : multiScreenData}));
                });
                break;

            case 'screenMultiData':
                const planets: Planet[] = [];
                for (const fakePlanet of mes.planets) {
                    const scene = new Scene();
                    const planet = new Planet(scene, fakePlanet.id, fakePlanet.radius, fakePlanet.friction, [fakePlanet.coordinates.x, fakePlanet.coordinates.y, 0]);
                    planets.push(planet);
                }
                multiScreenData[id] = [mes.innerHeight, planets];
                break;

            case 'endgame':
                console.log('The game was ended.');
                const cids:Array<string> = database.getControllerIds();
                cids.forEach(element => {
                    database.removeID(element);
                });
                websocket.clients.forEach((client) => {
                    client.send(JSON.stringify({client : 'endgame'}));
                });
                mode = null;
                break;
            case 'nbcontrollers':
                const controllerids = database.getControllerIds();
                ws.send(JSON.stringify({client: controllerids}));
                break;

            case '__pong__':
                pong(tm, id);
                break;
            case 'delcat':
                websocket.clients.forEach((client) => {
                    client.send(JSON.stringify({client : 'delcat', id: mes.id}));
                });
                break;
            }
        });
    });

    websocket.on('close', () => {
        console.log('Websocket connection closed.');
    });
}

function createPortals(): Portal[] {
    return generateSites();
}

function findPlanetWithLocalID(planetID: number, screenID: string): Planet {
    for (const planet of multiScreenData[screenID][1]) {
        if(planet.id === planetID) {
            return planet;
        }
    }
    return multiScreenData[screenID][1][0];
}

function findPlanetWithGlobalID(planetID: number, planetsIDs: {[key: number]: [string, number]} ): Planet {
    const screenID = planetsIDs[planetID][0];
    const otherPlanetID = planetsIDs[planetID][1];
    for (const planet of multiScreenData[screenID][1]) {
        if(planet.id === otherPlanetID) {
            return planet;
        }
    }
    return multiScreenData[screenID][1][0];
}

function findScreenCoordinates(id: string): {x: number, y:number} {
    for (const qr of qrlocations) {
        if(qr.id === id) {
            return qr.middle_location;
        }
    }
    return {x: 0, y: 0};
}

function calculatePortalCoordinates(myPlanet: Planet, otherPlanet: Planet, ratio: number, screenCoordinates: Vector3): Vector3 {
    const vector = new Vector3(myPlanet.coordinates.x, myPlanet.coordinates.y, 0);
    vector.multiplyScalar(-1);
    // console.log('mycords*-1: ',  vector);
    // console.log('yourcords: ', otherPlanet.coordinates);
    vector.add(otherPlanet.coordinates);
    // console.log('vector: ', vector);
    vector.normalize();
    console.log('vector: ', vector);
    vector.multiplyScalar(3*myPlanet.radius/4);
    const localPlanetCoordinates = new Vector3();
    const helpVec = new Vector3(screenCoordinates.x, screenCoordinates.y, 0);
    helpVec.multiplyScalar(-1);
    localPlanetCoordinates.addVectors(myPlanet.coordinates, helpVec);
    localPlanetCoordinates.multiplyScalar(1/ratio);
    localPlanetCoordinates.add(vector);
    return localPlanetCoordinates;
}

function randomColorCreation(): THREE.ColorRepresentation | undefined {
    const id = Math.floor((Math.random() * 1000000));
    let hash: number = 5381;

    for (let i = 0; i < id.toString().length; i++) {
        hash = ((hash << 5) + hash) + id.toString().charCodeAt(i); /* hash * 33 + c */
    }

    const r = (hash & 0xFF0000) >> 16;
    const g = (hash & 0x00FF00) >> 8;
    const b = hash & 0x0000FF;

    return '#' + ('0' + r.toString(16)).substr(-2) + ('0' + g.toString(16)).substr(-2) + ('0' + b.toString(16)).substr(-2);
}

function generateSites(): Portal[] {
    const ratio = Object();
    const sites: {x: number; y: number; id: string}[] = [];
    const planetsIDs: {[key: number]: [string, number]} = {};
    let globalPlanetID = 0;
    for (const qrloc of qrlocations) {
        const id = qrloc.id;
        ratio[id] = Math.abs(qrloc.topleft_location.y - qrloc.bottomright_location.y) / multiScreenData[id][0];
        for (const planet of multiScreenData[id][1]) {
            planetsIDs[globalPlanetID] = [id, planet.id];
            const globalPlanetCoordinates = new Vector3();
            globalPlanetCoordinates.add(planet.coordinates);
            globalPlanetCoordinates.multiplyScalar(ratio[id]);
            const qrVector = new Vector3();
            qrVector.set(qrloc.middle_location.x, qrloc.middle_location.y, 0);
            globalPlanetCoordinates.add(qrVector);
            console.log('localcoords', planet.coordinates, 'multiply', ratio[id], 'add', qrloc.middle_location.x, qrloc.middle_location.y);
            planet.coordinates = globalPlanetCoordinates;
            const site: {x: number; y: number; id: string} = {x: planet.coordinates.x, y: planet.coordinates.y, id: globalPlanetID.toString()};
            sites.push(site);
            globalPlanetID++;
        }
    }
    return generatePortals(sites, planetsIDs, ratio);
}

function generatePortals(sites: {x: number; y: number; id: string}[], planetsIDs: {[key: number]: [string, number]}, ratio = Object()): Portal[] {
    console.log('sites: ', sites);
    const neighbors = findNeighborsVoronoi(sites);
    console.log('neighbors: ', neighbors);
    const portals: Portal[] = [];
    const screenPlanets: [string, Planet][] = [];
    for(const planet of neighbors) {
        const myID = planet.id;
        const myPlanet = findPlanetWithGlobalID(Number(myID), planetsIDs);
        const neighborsToAdd = planet.neighborsOfID;
        const [screenID, myPlanetID] = planetsIDs[Number(myID)];
        screenPlanets.push([screenID, new Planet(new Scene(), myPlanetID, 0, 0, [0,0,0])]);
        for(const neighborToAdd of neighborsToAdd) {
            const [otherScreen, otherPlanetID] = planetsIDs[Number(neighborToAdd)];
            const otherPlanet = findPlanetWithLocalID(otherPlanetID, otherScreen);
            const screenCoordinates = findScreenCoordinates(screenID);
            const screenVector = new Vector3();
            screenVector.set(screenCoordinates.x, screenCoordinates.y, 0);
            const portalCoordinates = calculatePortalCoordinates(myPlanet, otherPlanet, ratio[screenID], screenVector);
            const destCoordinates = calculatePortalCoordinates(otherPlanet, myPlanet, ratio[screenID], screenVector);
            const portal = new Portal(otherScreen, portalCoordinates, otherPlanetID);
            portal.addDestiny(destCoordinates);
            for(const [sID, colorPlanet] of screenPlanets) {
                if(otherScreen == sID) {
                    for(const colorPortal of colorPlanet.portals) {
                        if(colorPortal.otherScreen == screenID && colorPortal.otherPlanetID == myPlanetID && otherPlanetID == colorPlanet.id) {
                            portal.addColor(colorPortal.color);
                        }
                    }
                }
            }
            if(portal.color == 0xfffff) {
                const randomColor = randomColorCreation();
                portal.addColor(randomColor);
            }
            for(let i = screenPlanets.length - 1 ; i >= 0; i--) {
                const [sID, colorPlanet] = screenPlanets[i];
                if(sID == screenID) {
                    colorPlanet.addPortal(portal);
                    break;
                }
            }
            myPlanet.addPortal(portal);
            portals.push(portal);
        }
        console.log('planet: ', myPlanet.coordinates);
    }
    return portals;
}
