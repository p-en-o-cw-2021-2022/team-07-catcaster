import * as THREE from 'three';
import { Vector3 } from 'three';
import { Planet } from './planet';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { Portal } from './portal';


export class Cat {

    id: string;
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
    loader = new OBJLoader();


    constructor(id: string, radius: number, planet: Planet, mass: number = 10) {
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
        // scene.add( this.mesh );
        // load a resource
        this.loader.load(
            // resource URL
            'cat2.obj',
            // called when resource is loaded
            ( object ) => {
                console.log('Object is loaded');
                object.traverse(function(child) {
                    if (child instanceof THREE.Mesh) {
                        child.material = material;
                    }
                });
                object.scale.copy(new THREE.Vector3(0.5, 0.5, 0.5));
                this.mesh = object;

                scene.add( object );

            },
            // called when loading is in progresses
            function ( xhr ) {

                console.log( ( xhr.loaded / xhr.total * 100 ));

            },
            // called when loading has errors
            function ( ) {

                console.log( 'An error happened' );

            }
        );
    }


    setPlanet(planet: Planet) {
        this.planet = planet;
    }

    updateForce(axis: string, force: number) {

        switch (axis) {
        case 'x':
            this.xF = force;
            break;
        case 'y':
            this.yF = force;
            break;
        }
    }

    updateVelocity(dt: number, allPlanets: Planet[]): Portal | undefined {
        const accX: number = (this.xF + this.planet.gamma *1.5)/this.mass;
        const accY: number = -(this.yF+ this.planet.beta*1.5)/this.mass;

        this.positionOnPlanet.x += this.xVel * dt + (1 / 2) * accX * dt ** 2;
        this.positionOnPlanet.y += this.yVel * dt + (1 / 2) * accY * dt ** 2;

        this.xVel += accX * dt;
        this.yVel += accY * dt;

        // const tmp = new Vector3(xPos, yPos, this.position.z);

        if (!this.isValidPos(this.positionOnPlanet)) {
            this.xVel = 0;
            this.yVel = 0;
            this.xF = 0;
            this.yF = 0;
            this.planet.cats.delete(this.id);
            const newPlanet = allPlanets[Math.floor(Math.random()*allPlanets.length)];
            this.planet = newPlanet;
            this.planet.setCat(this);
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

        copyVector.applyAxisAngle(new Vector3(0, 1, 0), this.planet.gamma);
        copyVector.applyAxisAngle(new Vector3(1, 0, 0), this.planet.beta);

        this.mesh?.position.copy(copyVector);
        this.mesh?.rotation.copy(this.planet.object3dGroup.rotation.clone());
        this.mesh?.rotateOnAxis(new Vector3(1,0,0), Math.PI/2);

    }

    // Check if the given position is on planet
    isValidPos(vector: Vector3): boolean {

        return vector.distanceTo(new Vector3(0, 0, 0)) <= this.planet.radius;
    }

    generateColor(id: string): THREE.ColorRepresentation | undefined {

        let hash: number = 5381;

        for (let i = 0; i < id.length; i++) {
            hash = ((hash << 5) + hash) + id.charCodeAt(i); /* hash * 33 + c */
        }

        const r = (hash & 0xFF0000) >> 16;
        const g = (hash & 0x00FF00) >> 8;
        const b = hash & 0x0000FF;

        return '#' + ('0' + r.toString(16)).substr(-2) + ('0' + g.toString(16)).substr(-2) + ('0' + b.toString(16)).substr(-2);
    }
}


