import * as THREE from 'three';
import { Plane, Scene, Vector3 } from 'three';
import { Cat } from './cat.js';
export class Planet {

    id: number;
    radius: number;
    coordinates: number[];
    // cats: Map<number, Cat> = new Map();
    cat: Cat | undefined = undefined; // Should be made into a map
    friction: number;
    alpha:number = 0;
    beta:number = 0;
    gamma:number = 0;
    g = -9.8;
    MAX_ANGLE: number = 2 * Math.PI/9;
    animation: THREE.Mesh;
    circle: THREE.CircleGeometry;
    portals: Map<number, Vector3>;
    neighbours: Map<number, Planet>;

    constructor(scene: Scene, id: number, radius: number, friction: number, coordinates: number[] = [0,0,0]) {
        this.id = id;
        this.coordinates = coordinates;
        this.radius = radius;
        this.friction = friction;
        this.neighbours = new Map<number, Planet>();
        this.portals = new Map<number, Vector3>();

        this.portals.set(1, new Vector3(3,0,0)); //FIX Make it be set in the add neighbour

        this.circle = new THREE.CircleGeometry( this.radius, 32 );
        this.circle.translate(coordinates[0], coordinates[1], coordinates[2]);
        this.animation = new THREE.Mesh( this.circle, new THREE.MeshNormalMaterial() );
        scene.add( this.animation );
    }

    // Add a new neighbouring planet if not already added.
    addNeighbour(newNeighbour: Planet) {
        if (!this.neighbours.has(newNeighbour.id)) {
            this.neighbours.set(newNeighbour.id, newNeighbour);
        }
    }

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
        this.cat = cat;
    }

    updateAngles() {

        const oldGamma = this.gamma;
        const oldBeta = this.beta;

        // update gamma x
        this.gamma = this.MAX_ANGLE * (this.cat!.position.x / this.radius);
        // update beta y
        this.beta = -this.MAX_ANGLE * (this.cat!.position.y / this.radius);

        const dgamma = oldGamma - this.gamma;
        const dbeta = oldBeta - this.beta;

        this.circle.rotateX(-dbeta);
        this.circle.rotateY(-dgamma);
    }

    checkTP() {
        const tmp = this.cat?.position; // Current cat checking.
        // TODO Add logic to handle multiple cats

        for (const entry of this.portals.entries()) {
            const planetId = entry[0];
            const portalVec3 = entry[1];

            if(tmp!.distanceTo(portalVec3) <= 1) {
                const neighbour: Planet = this.neighbours.get(planetId)!;
                this.cat!.setPlanet(neighbour);
                const x = neighbour.coordinates[0];
                const y = neighbour.coordinates[1];
                const z = neighbour.coordinates[2];
                neighbour.setCat(this.cat!);
                this.cat!.position = new Vector3(x,y,z);
                this.cat = undefined;
            }
        }
    }
}
