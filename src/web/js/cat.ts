import * as THREE from 'three';
import { Scene, Vector3 } from 'three';
import { boolean } from 'yargs';
import { Planet } from './planet';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

export class Cat {

    id: number;
    mass: number;
    radius: number;
    position: Vector3;
    xF: number = 0;
    yF: number = 0;
    xVel: number = 0;
    yVel: number = 0;
    jump: boolean = false;
    planet: Planet;
    sphere: THREE.SphereGeometry;
    mesh: THREE.Object3D | undefined;

    constructor(scene: Scene, id: number, radius: number, planet: Planet, mass: number = 10) {
        this.id = id;
        this.mass = mass;
        this.radius = radius;
        this.position = new Vector3(0, 0, radius);
        this.planet = planet;
        this.sphere = new THREE.SphereGeometry( 0.5, 32, 16 );
        this.mesh = new THREE.Mesh( this.sphere, new THREE.MeshNormalMaterial());
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

        const accX: number = (this.xF)/this.mass;
        const accY: number = -(this.yF)/this.mass;

        this.position.x += this.xVel * dt + (1/2) * accX * dt ** 2;
        this.position.y += this.yVel * dt + (1/2) * accY * dt ** 2;

        this.xVel += accX * dt;
        this.yVel += accY * dt;

        // const tmp = new Vector3(xPos, yPos, this.position.z);

        if (!this.isValidPos(this.position)) {
            this.xVel = 0;
            this.yVel = 0;
            // this.xF = 0;
            // this.yF = 0;
            this.position.x = this.planet.coordinates[0];
            this.position.y = this.planet.coordinates[1];
            return;
        }

        if (this.jump) {
            this.planet.checkTP(this);
        }

        // const oldGamma = this.planet.gamma;
        // const oldBeta = this.planet.beta;

        // this.planet.updateAngles();

        // const dgamma = oldGamma - this.planet.gamma;
        // const dbeta = oldBeta - this.planet.beta;

        // this.position.applyAxisAngle(new Vector3(0,1,0), -dgamma);
        // this.position.applyAxisAngle(new Vector3(1,0,0), -dbeta);

        this.mesh!.position.copy(this.position);

    }

    // Check if the given position is on planet
    isValidPos(vector: Vector3): boolean {

        const xCond = Math.abs(vector.x - this.planet.coordinates[0]) <= this.planet.radius;
        const yCond = Math.abs(vector.y - this.planet.coordinates[1]) <= this.planet.radius;
        const zCond = Math.abs(vector.z - this.planet.coordinates[2]) <= this.planet.radius * Math.sin(this.planet.MAX_ANGLE);

        return xCond && yCond && zCond;
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