import * as THREE from 'three';
import { Plane, Scene, Vector3 } from 'three';
import { Cat } from './cat.js';
import { Portal } from './portal.js';
export class Planet {

    id: number;
    radius: number;
    coordinates: number[];
    cats: Map<number, Cat>;
    friction: number;
    alpha:number = 0;
    beta:number = 0;
    gamma:number = 0;
    g = -9.8;
    MAX_ANGLE: number = 2 * Math.PI/9;
    animation: THREE.Mesh;
    circle: THREE.CircleGeometry;
    portals: Portal[];
    neighbours: Map<number, Planet>;

    constructor(scene: Scene, id: number, radius: number, friction: number, coordinates: number[] = [0,0,0]) {
        this.id = id;
        this.coordinates = coordinates;
        this.radius = radius;
        this.friction = friction;
        this.neighbours = new Map<number, Planet>();
        this.cats = new Map<number, Cat>();
        this.portals = new Array();
        this.circle = new THREE.CircleGeometry( this.radius, 32 );
        this.circle.translate(coordinates[0], coordinates[1], coordinates[2]);
        this.animation = new THREE.Mesh( this.circle, new THREE.MeshNormalMaterial() );
        scene.add( this.animation );
    }

    addPortal(portal: Portal){
        this.portals.push(portal);
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
        const [myX, myY, myZ] = this.coordinates;
        let shortestDistance: number = Number.POSITIVE_INFINITY;
        let shortestPlanet: Planet = this;
        for (let i = 0, len = allPlanets.length; i < len; i++) {
            let [yourX, yourY, yourZ] = allPlanets[i].coordinates;
            let distance = Math.pow(myX-yourX, 2) + Math.pow(myY-yourY, 2);
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

    updateAngles() {

        const oldGamma = this.gamma;
        const oldBeta = this.beta;

        //TODO: Make this work with the Map of cats
        // update gamma x
        // this.gamma = this.MAX_ANGLE * (this.cat!.position.x / this.radius);
        // // update beta y
        // this.beta = -this.MAX_ANGLE * (this.cat!.position.y / this.radius);

        const dgamma = oldGamma - this.gamma;
        const dbeta = oldBeta - this.beta;

        this.circle.rotateX(-dbeta);
        this.circle.rotateY(-dgamma);
    }

    checkTP(cat: Cat) {
        const tmp = cat.position; // Current cat checking.
        // TODO Add logic to handle multiple cats

        for (const entry of this.portals) {
            const portalVec3 = entry.myCoordinates;

            if(tmp.distanceTo(portalVec3) <= 120) {
                const neighbour: Planet = entry.otherPlanet;
                cat.setPlanet(neighbour);
                const x = neighbour.coordinates[0];
                const y = neighbour.coordinates[1];
                const z = neighbour.coordinates[2];
                neighbour.setCat(cat);
                cat.position = new Vector3(x,y,z);
                this.cats.delete(cat.id);
            }
        }
    }
}
