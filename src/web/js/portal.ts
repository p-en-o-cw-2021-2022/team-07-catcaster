import { ColorRepresentation, Vector3 } from 'three';


export class Portal {
    otherScreen: string;
    myCoordinates: Vector3;
    otherPlanetID: number;
    color: ColorRepresentation | undefined;

    constructor(otherScreen: string, myCoordinates: Vector3, otherPlanetID: number) {
        this.otherScreen = otherScreen;
        this.myCoordinates  = myCoordinates;
        this.otherPlanetID = otherPlanetID;
        this.color = 0xfffff;
    }

    addColor(color: ColorRepresentation | undefined) {
        this.color = color;
    }

}