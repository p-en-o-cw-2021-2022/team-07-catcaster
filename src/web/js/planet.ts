import { Cat } from './cat.js';
export class Planet {

    id: number;
    radius: number;
    coordinates: number[];
    // cats: Map<number, Cat> = new Map();
    cat: Cat | undefined = undefined;
    friction: number;
    alpha = 0;
    beta = 0;
    gamma = 0;
    g = -9.8;
    MAX_ANGLE: number = 2 * Math.PI/9;

    constructor(id: number, radius: number, friction: number, coordinates: number[] = [0,0,0]) {
        this.id = id;
        this.coordinates = coordinates;
        this.radius = radius;
        this.friction = friction;
    }

    // addCat(id:number, mass:number) {
    //     this.cats.set(id, new Cat(id, mass, this));
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

    private isValidAngle(angle: number): boolean {
        if(angle >= -this.MAX_ANGLE && angle <= this.MAX_ANGLE) {
            return true;
        }
        return false;
    }

    setCat(cat:Cat) {
        this.cat = cat;
    }

    updateAngles() {

        // update gamma x
        this.gamma = this.MAX_ANGLE * (this.cat!.position.x / this.radius);

        // update beta y
        this.beta = -this.MAX_ANGLE * (this.cat!.position.y / this.radius);
    }

}
