import { Matrix3, Vector, Vector3 } from 'three';
import { Cat } from './cat.js';

export class Planet {

    id: number;
    angle: number[];
    coordinates: number[];
    cats: Map<number, Cat> = new Map();
    radius: number;
    maxAngles: [number[], number[]] = [[-60, 60], [-60, 60]];
    x: Vector3;
    y: Vector3;
    animationAngle: number = 0;

    constructor(id: number, coordinates: number[], radius: number) {
        this.id = id;
        this.angle = [0,0,0];
        this.coordinates = coordinates;
        this.radius = radius;
        this.x = new Vector3(radius, 0, 0);
        this.y = new Vector3(0,radius,0);
    }

    addCat(id:number, mass:number) {
        this.cats.set(id, new Cat(id, mass));
    }

    update(angles:number[]): void {
        if(angles[0] > -60 && angles[0] <= 60 && angles[1] > -60 && angles[1] <= 60 && angles[2] > -60 && angles[2] <= 60) {
            this.angle = angles;
        }
    }

    updateVectors() {

        const beta = (this.angle[1] / 180) * Math.PI;
        const gamma = (this.angle[2] / 180) * Math.PI;

        // const betaRotationMatrix = new Matrix3().set( Math.cos(beta), 0, Math.sin(beta) , 0, 1, 0, -Math.sin(beta), 0, Math.cos(beta));
        // const gammaRotationMatrix = new Matrix3().set(1, 0, 0, 0, Math.cos(gamma), -Math.sin(gamma), 0, Math.sin(gamma), Math.cos(gamma));

        const tmpX = new Vector3(100,0,0);
        tmpX.applyAxisAngle(new Vector3(0, 1, 0), gamma);
        tmpX.applyAxisAngle(new Vector3(1, 0, 0), beta);
        const tmpY = new Vector3(0, 100, 0);
        tmpY.applyAxisAngle(new Vector3(0, 1, 0), gamma);
        tmpY.applyAxisAngle(new Vector3(1, 0, 0), beta);

        this.x = tmpX;
        this.y = tmpY;
        this.animationAngle = this.x.projectOnPlane(new Vector3(0, 0, 1)).angleTo(new Vector3(1,0,0));
    }

    toDegrees(radian: number) {
        return (radian / Math.PI) * 180;
    }

    toRadians(degree: number) {
        return (degree / 180) * Math.PI;
    }

}
