import * as THREE from 'three';
import { Plane, Scene, Vector, Vector3 } from 'three';
import { Cat } from './cat.js';
export class Planet {

    id: number;
    radius: number;
    coordinates: Vector3;
    cats: Map<number, Cat>;
    // cat: Cat | undefined = undefined; // Should be removed later
    friction: number;
    alpha:number = 0;
    beta:number = 0;
    gamma:number = 0;
    g = -9.8;
    MAX_ANGLE: number = Math.PI/4;
    mesh: THREE.Mesh;
    circle: THREE.CircleGeometry;
    portals: Map<number, Vector3>;
    neighbours: Map<number, Planet>;

    constructor(scene: Scene, id: number, radius: number, friction: number, coordinates: number[] = [0,0,0]) {
        this.id = id;
        this.coordinates = new Vector3(coordinates[0], coordinates[1], coordinates[2]);
        this.radius = radius;
        this.friction = friction;
        this.neighbours = new Map<number, Planet>();
        this.portals = new Map<number, Vector3>();
        this.cats = new Map<number, Cat>();

        this.circle = new THREE.CircleGeometry( this.radius, 32 );
        this.circle.translate(coordinates[0], coordinates[1], coordinates[2]);
        this.mesh = new THREE.Mesh( this.circle, new THREE.MeshNormalMaterial() );
        scene.add( this.mesh );
    }

    // Add a new neighbouring planet if not already added.
    // Portal vector is relative to center of the neightbour planet
    addNeighbour(newNeighbour: Planet, portalVector: Vector3) {
        if (!this.neighbours.has(newNeighbour.id)) {
            this.neighbours.set(newNeighbour.id, newNeighbour);
            const x = this.coordinates.x;
            const y = this.coordinates.y;
            const z = this.coordinates.z;
            const portalCoords = new Vector3(x,y,z);
            this.portals.set(newNeighbour.id, portalVector.add(portalCoords));
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
        if (!this.cats.has(cat.id)) {
            // this.cat = cat;
            this.cats.set(cat.id, cat);
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

        // Adjust ratio scaling so that it doesn't exceed 1
        xRatio = xRatio / this.cats.size;
        yRatio = yRatio / this.cats.size;

        this.gamma = this.MAX_ANGLE * xRatio;
        this.beta = -this.MAX_ANGLE * yRatio;

        const newCircle = this.circle = new THREE.CircleGeometry( this.radius, 32 );
        this.circle.translate(this.coordinates.x, this.coordinates.y, this.coordinates.z);

        newCircle.rotateX(this.beta);
        newCircle.rotateY(this.gamma);

        this.mesh.geometry.copy(newCircle);

        for (const cat of this.cats.values()) {
            cat.updatePosition(dt);
        }
    }

    checkTP(cat: Cat) {
        const tmp = cat.positionOnPlanet; // Current cat checking.
        // TODO Add logic to handle multiple cats

        for (const entry of this.portals.entries()) {
            const planetId = entry[0];
            const portalVec3 = entry[1];

            if(tmp.distanceTo(portalVec3) <= 2) {
                const neighbour: Planet = this.neighbours.get(planetId)!;
                cat.setPlanet(neighbour);
                const x = neighbour.coordinates.x;
                const y = neighbour.coordinates.y;
                const z = neighbour.coordinates.z;
                neighbour.setCat(cat);
                cat.positionOnPlanet = new Vector3(x,y,z);
                this.cats.delete(cat.id);
            }
        }
    }
}
