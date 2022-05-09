import * as THREE from 'three';
import { Color, ColorRepresentation, Plane, Scene, Vector3 } from 'three';
import { Cat } from './cat.js';
import { Planet } from './planet';


export class Portal {
    otherScreen: string;
    myCoordinates: Vector3;
    otherPlanetID: number;
    color: ColorRepresentation | undefined;
    // circle: THREE.CircleGeometry;
    // animation: THREE.Mesh;

    constructor(otherScreen: string, myCoordinates: Vector3, otherPlanetID: number) {
        this.otherScreen = otherScreen;
        this.myCoordinates  = myCoordinates;
        this.otherPlanetID = otherPlanetID;
        this.color = 0xfffff;
        // this.circle = new THREE.CircleGeometry(50, 2);
        // this.circle.translate(myCoordinates[0], myCoordinates[1], myCoordinates[2]);
        // this.animation = new THREE.Mesh( this.circle, new THREE.MeshNormalMaterial() );
        // scene.add( this.animation );
    }

    addColor(color: ColorRepresentation | undefined) {
        this.color = color;
    }

}