import * as THREE from 'three';
import { Scene, Vector3 } from 'three';
import { boolean } from 'yargs';
import { Planet } from './planet';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { Portal } from './portal';

export class Cat {

    id: number;
    mass: number;
    radius: number;
    positionOnPlanet: Vector3;
    xF: number = 0;
    yF: number = 0;
    xVel: number = 0;
    yVel: number = 0;
    jump: boolean = false;
    planet: Planet;
    sphere: THREE.SphereGeometry;
    mesh: THREE.Object3D | undefined;
    catPositionAngle: number[];
    color: THREE.ColorRepresentation | undefined;

    constructor(id: number, radius: number, planet: Planet, mass: number = 10) {
        this.id = id;
        this.mass = mass;
        this.radius = radius;
        this.positionOnPlanet = new Vector3(0, 0, 0);
        this.planet = planet;
        this.sphere = new THREE.SphereGeometry( 3, 32, 16 );
        const color = this.generateColor(id);
        this.color = color;
        const material = new THREE.MeshLambertMaterial( { color: color } ); // This should be taken in as a constructor argument, but might break things when that happens
        this.mesh = new THREE.Mesh( this.sphere, material);
        this.catPositionAngle = [0,0];
        const scene = planet.scene;
        scene.add( this.mesh );
    }


    setPlanet(planet: Planet) {
        this.planet = planet;
    }

    updateForce(axis: string, force: number) {

        switch(axis) {
        case 'x':
            this.xF = force;
            break;
        case 'y':
            this.yF = force;
            break;
        }
    }

    updateVelocity(dt: number): Portal | undefined {
        const accX: number = (this.xF + this.planet.gamma *1.5)/this.mass;
        const accY: number = -(this.yF+ this.planet.beta*1.5)/this.mass;

        this.positionOnPlanet.x += this.xVel * dt + (1/2) * accX * dt ** 2;
        this.positionOnPlanet.y += this.yVel * dt + (1/2) * accY * dt ** 2;

        this.xVel += accX * dt;
        this.yVel += accY * dt;

        // const tmp = new Vector3(xPos, yPos, this.position.z);

        if (!this.isValidPos(this.positionOnPlanet)) {
            this.xVel = 0;
            this.yVel = 0;
            this.xF = 0;
            this.yF = 0;
            this.positionOnPlanet = new Vector3(0,0,0);
            return;
        }

        if (this.jump) {
            return this.planet.checkTP(this);
        }
        return;
    }

    // Updates the relative position of cat on planet
    updateAngle() {

        const copyVector = this.positionOnPlanet.clone();

        // const normalVectorY = new Vector3(0,1,0);
        // copyVector.applyAxisAngle(new Vector3(0,1,0), this.planet.gamma);
        // copyVector.applyAxisAngle(new Vector3(1,0,0), this.planet.beta);

        copyVector.applyAxisAngle(new Vector3(0,1,0), this.planet.gamma);
        copyVector.applyAxisAngle(new Vector3(1,0,0), this.planet.beta);

        const absPosition = copyVector.add(this.planet.coordinates);
        this.mesh!.position.copy(copyVector);

    }

    // Check if the given position is on planet
    isValidPos(vector: Vector3): boolean {
        // vector.distanceTo(new Vector3(0,0,0)) <= this.planet.radius;
        // const xCond = Math.abs(vector.x) <= this.planet.radius;
        // const yCond = Math.abs(vector.y) <= this.planet.radius;
        // const zCond = Math.abs(vector.z) <= this.planet.radius * Math.sin(this.planet.MAX_ANGLE);

        return vector.distanceTo(new Vector3(0,0,0)) <= this.planet.radius;
    }

    generateColor(id: number): THREE.ColorRepresentation | undefined {

        let hash: number = 5381;

        for (let i = 0; i < id.toString().length; i++) {
            hash = ((hash << 5) + hash) + id.toString().charCodeAt(i); /* hash * 33 + c */
        }

        const r = (hash & 0xFF0000) >> 16;
        const g = (hash & 0x00FF00) >> 8;
        const b = hash & 0x0000FF;

        return '#' + ('0' + r.toString(16)).substr(-2) + ('0' + g.toString(16)).substr(-2) + ('0' + b.toString(16)).substr(-2);
    }
}




// calcFriction(axis: string, force: number):number {

//     let angle = 0;
//     let vel = 0;
//     switch(axis) {
//     case 'x':
//         angle = this.planet.gamma;
//         vel = this.xVel;
//         break;
//     case 'y':
//         angle = this.planet.beta;
//         vel = this.yVel;
//         break;
//     case 'z':
//         angle = this.planet.alpha;
//         break;
//     }

//     if ( vel < 0) {
//         return this.planet.friction * -this.planet.g * Math.cos(angle) * this.mass;
//     } else if ( vel > 0) {
//         return -this.planet.friction * -this.planet.g * Math.cos(angle) * this.mass;
//     } else {
//         return 0;
//     }
// }