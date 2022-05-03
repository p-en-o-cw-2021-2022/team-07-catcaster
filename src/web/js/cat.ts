import * as THREE from 'three';
import { Scene, Vector3 } from 'three';
import { boolean } from 'yargs';
import { Planet } from './planet';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

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

    constructor(scene: Scene, id: number, radius: number, planet: Planet, mass: number = 10) {
        this.id = id;
        this.mass = mass;
        this.radius = radius;
        this.positionOnPlanet = new Vector3(0, 0, 0);
        this.planet = planet;
        this.sphere = new THREE.SphereGeometry( 1, 32, 16 );
        const material = new THREE.MeshLambertMaterial( { color: 0x0a912a } ); // This should be taken in as a constructor argument, but might break things when that happens
        this.mesh = new THREE.Mesh( this.sphere, material);
        this.catPositionAngle = [0,0];
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

    // Updates the relative position of cat on planet
    updatePosition(dt: number) {

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
            // this.xF = 0;
            // this.yF = 0;
            this.positionOnPlanet = new Vector3(0,0,0);
            return;
        }

        if (this.jump) {
            this.planet.checkTP(this);
        }

        // const oldGamma = this.planet.gamma;
        // const oldBeta = this.planet.beta;

        // const dgamma = oldGamma - this.planet.gamma;
        // const dbeta = oldBeta - this.planet.beta;

        const copyVector = this.positionOnPlanet.clone();

        copyVector.applyAxisAngle(new Vector3(0,1,0), this.planet.gamma);
        copyVector.applyAxisAngle(new Vector3(1,0,0), this.planet.beta);
        // this.positionOnPlanet.applyAxisAngle(new Vector3(0,1,0), -dAngles[0]);
        // this.positionOnPlanet.applyAxisAngle(new Vector3(1,0,0), -dAngles[1]);

        // const absPosition = this.positionOnPlanet.clone().add(this.planet.coordinates);
        const absPosition = copyVector.add(this.planet.coordinates);

        // this.catPositionAngle[0] = this.planet.gamma;
        // this.catPositionAngle[1] = this.planet.beta;

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