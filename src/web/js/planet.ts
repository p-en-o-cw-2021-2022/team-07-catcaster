import * as THREE from 'three';
import { Euler, Plane, Scene, Vector, Vector3 } from 'three';
import { Cat } from './cat.js';
import { Portal } from './portal.js';
export class Planet {

    id: number;
    radius: number;
    coordinates: Vector3;
    cats: Map<string, Cat>;
    friction: number;
    alpha:number = 0;
    beta:number = 0;
    gamma:number = 0;
    g = -9.8;
    MAX_ANGLE: number = Math.PI/4;
    mesh: THREE.Mesh;
    circle: THREE.CylinderGeometry;
    portals: Portal[];
    neighbours: Map<number, Planet>;
    object3dGroup: THREE.Group;
    scene: Scene;

    constructor(scene: Scene, id: number, radius: number, friction: number, coordinates: number[] = [0,0,0]) {
        this.id = id;
        this.coordinates = new Vector3(coordinates[0], coordinates[1], coordinates[2]);
        this.radius = radius;
        this.friction = friction;
        this.neighbours = new Map<number, Planet>();
        this.cats = new Map<string, Cat>();
        this.portals = new Array<Portal>();
        this.circle = new THREE.CylinderGeometry( this.radius, this.radius, 5, 32 );
        this.circle.rotateX(Math.PI * 0.5);
        this.mesh = new THREE.Mesh( this.circle, new THREE.MeshNormalMaterial() );
        this.object3dGroup = new THREE.Group();
        this.object3dGroup.add(this.mesh);
        this.object3dGroup.position.add(this.coordinates);
        scene.add( this.object3dGroup );
        this.scene = scene;
    }

    addPortal(portal: Portal) {
        const color = portal.color;
        this.portals.push(portal);
        // Coords need to be cloned because Vector3 methods are in place
        const planetCoords = this.coordinates.clone();
        const portalCoords = portal.myCoordinates.clone();
        planetCoords.multiplyScalar(-1);
        portalCoords.add(planetCoords); // Calculate portal coords relative to planet center
        const circleGeom = new THREE.CircleGeometry( this.radius/4, 32 );
        const portalMesh = new THREE.Mesh(circleGeom, new THREE.MeshLambertMaterial( { color: color } ));
        this.object3dGroup.add(portalMesh);
        portalMesh.position.copy(portalCoords); // Move the portal relative to the group center
        portalMesh.position.add(new Vector3(0,0,5)); // Move the portal a bit forward to prevent clipping
    }


    // Add a new neighbouring planet if not already added.
    // Portal vector is relative to center of the neightbour planet
    // addNeighbour(newNeighbour: Planet, portalVector: Vector3) {
    //     if (!this.neighbours.has(newNeighbour.id)) {
    //         this.neighbours.set(newNeighbour.id, newNeighbour);
    //         const x = this.coordinates[0];
    //         const y = this.coordinates[1];
    //         const z = this.coordinates[2];
    //         const portalCoords = new Vector3(x,y,z);
    //         console.log('portalvetor: ', portalVector)
    //         console.log('portalcoordinates: ', portalCoords)
    //         this.portals.set(newNeighbour.id, portalVector.add(portalCoords));
    //     }
    // }

    setAngle(axis: string, angle: number) {

        if (!this.isValidAngle(angle)) {
            return;
        }
        switch(axis) {
        case 'alpha':
            this.alpha = angle;
            break;
        case 'beta':
            this.beta = angle;
            break;
        case 'gamma':
            this.gamma = angle;
            break;
        }
    }

    isValidAngle(angle: number): boolean {
        if(angle >= -this.MAX_ANGLE && angle <= this.MAX_ANGLE) {
            return true;
        }
        return false;
    }

    setCat(cat:Cat) {
        if (!this.cats.has(cat.id)) {
            // this.cat = cat;
            this.cats.set(cat.id, cat);
        }
    }

    seekShortestPlanet(allPlanets: Planet[]) {
        const my: Vector3 = this.coordinates;
        let shortestDistance: number = Number.POSITIVE_INFINITY;
        let shortestPlanet: Planet | null = null;
        for (let i = 0, len = allPlanets.length; i < len; i++) {
            const your: Vector3= allPlanets[i].coordinates;
            const distance = Math.pow(my.x-your.x, 2) + Math.pow(my.y-your.y, 2);
            if ((distance < shortestDistance) && (distance !== 0)) {
                shortestDistance = distance;
                shortestPlanet = allPlanets[i];
            }
        }
        if (shortestDistance !== Number.POSITIVE_INFINITY) {
            return shortestPlanet;
        } else {
            return null;
        }
    }

    updateAngles(dt: number) {

        // TODO: Make this work with the Map of cats
        // update gamma x
        let xRatio: number = 0;
        let yRatio: number = 0;

        for (const cat of this.cats.values()) {
            xRatio += (cat.positionOnPlanet.x) / this.radius;
            yRatio += (cat.positionOnPlanet.y) / this.radius;
        }

        if (this.cats.size > 0 ) {
            // Adjust ratio scaling so that it doesn't exceed 1
            xRatio = xRatio / this.cats.size;
            yRatio = yRatio / this.cats.size;
        }

        this.gamma = this.MAX_ANGLE * xRatio;
        this.beta = -this.MAX_ANGLE * yRatio;

        this.object3dGroup.rotation.copy(new Euler(this.beta, this.gamma));

        for (const cat of this.cats.values()) {
            cat.updateAngle();
        }
    }

    checkTP(cat: Cat): Portal | undefined {
        const tmp = (cat.positionOnPlanet).clone(); // Current cat checking.
        tmp.add(this.coordinates);
        for (const entry of this.portals) {
            const portalVec3 = entry.myCoordinates;
            if(tmp.distanceTo(portalVec3) <= this.radius/4) {
                console.log(entry);
                return entry;
            }
        }
        return;
        // this.cats.delete(cat.id);
        // // Send teleport message over websocket
        // if (entry.otherScreen != myScreen) {
        //     const url = 'wss' + window.location.href.substr(5);
        //     const websocket = new WebSocket(url);
        //     const jumpmessage = [entry.otherScreen, entry.otherPlanetID, cat];
        //     websocket.send(JSON.stringify({client: 'jump-message', data: jumpmessage}));
        // }
        // else {
        //     console.log('myscreen!');
        //     for(const planet of allPlanets) {
        //         if(planet.id == entry.otherPlanetID){
        //             cat.setPlanet(planet);
        //             planet.setCat(cat);
        //             const x = planet.coordinates.x;
        //             const y = planet.coordinates.y;
        //             cat.positionOnPlanet = new Vector3(x, y, 0);
        //         }
        //     }
        // }
        // }
        // }
    }
}
