import { throws } from 'assert';
import { Cat } from './cat.js';

export class Planet {

    id: number;
    angle: number[];
    coordinates: number[];
    cats: Map<number, Cat> = new Map();
    radius: number;
    maxAngles: [number[], number[]] = [[-60, 60], [-60, 60]];

    constructor(id: number, coordinates: number[], radius: number) {
        this.id = id;
        this.angle = [0,0];
        this.coordinates = coordinates;
        this.radius = radius;
    }

    addCat(id:number, mass:number) {
        this.cats.set(id, new Cat(id, mass));
    }

    update(angles:number[]): void {
        if (angles[0] >= this.maxAngles[0][0] && angles[0] <= this.maxAngles[0][1] && angles[1] >= this.maxAngles[1][0] && angles[1] <= this.maxAngles[1][1]) {
            this.angle = angles;
        }
    }

    calcAnimationAngle(): number {

        // return Math.atan((this.radius * 1 / (1 + Math.abs(this.angle[0]/90)))/(this.radius * 1 / (1 + Math.abs(this.angle[1]/90)))) * 180;
        //return Math.atan((this.radius * Math.sin((this.angle[1] / 180) * Math.PI))/ (this.radius * Math.sin((this.angle[0] / 180) * Math.PI)));

        // if (this.angle[1] > 0 && this.angle[0] > 0) {
        //     return -Math.atan(this.angle[0] / this.angle[1]);
        // } else {
        //     return -Math.atan(this.angle[0] / this.angle[1]) + 180;
        // }
        return 0;

        //const tmp = Math.sqrt((Math.sin((this.angle[1] / 180) * Math.PI)) ** 2 + ( Math.sin((this.angle[0] / 180) * Math.PI)) ** 2);

        // if (this.angle[0] >= 0 && this.angle[1] >= 0) {
        // return this.toDegrees(-Math.atan(this.angle[0] / this.angle[1]));
        // } else if (this.angle[1] >= 0 && this.angle[0] < 0) {
        //     return -Math.atan(this.angle[0] / this.angle[1]);
        // } else if (this.angle[1] < 0 && this.angle[0] < 0) {
        //     return -Math.atan(this.angle[0] / this.angle[1]) + 180;
        // } else {
        //     return -Math.atan(this.angle[0] / this.angle[1]) + 360;
        // }
    }
    calcAnimationRadiuses(): number[] {
    //  return [this.radius * 1 / (1 + Math.abs(this.angle[0]/90)), this.radius * 1 / (1 + Math.abs(this.angle[1]/90))];
        return [this.radius * Math.cos((this.angle[0] / 180) * Math.PI) , this.radius * Math.cos((this.angle[1] / 180) * Math.PI)];
        // if (this.angle[1] > 0) {
        //return [this.radius, this.radius * Math.cos((this.angle[1] / 180) * Math.PI)];
        // } else {
        //     return [this.radius * Math.cos((this.angle[0] / 180) * Math.PI), this.radius];
        // }

    }

    toDegrees(radian: number) {
        return (radian / Math.PI) * 180;
    }
}
