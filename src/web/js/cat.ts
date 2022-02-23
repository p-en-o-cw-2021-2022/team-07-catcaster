
export class Cat {

    id: number;
    mass: number;
    force: number[];
    coordinates: number[];
    velocity: number[];

    constructor(mass: number, id: number) {
        this.id = id;
        this.mass = mass;
        this.force = [0 ,0];
        this.coordinates = [0, 0];
        this.velocity = [0, 0];
    }

    update(newForce: number[]): void {
        // TO-DO later (update coordinbates maybe? using new updated force)
        return;
    }
}
