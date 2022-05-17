import * as THREE from 'three';
import { Euler, MeshLambertMaterial, Scene, Vector3 } from 'three';
import { Planet } from './planet';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { Portal } from './portal';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { text } from 'stream/consumers';

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
    mesh: THREE.Object3D | undefined;
    catPositionAngle: number[];
    color: THREE.ColorRepresentation | undefined;
    textGeometry: TextGeometry | undefined;
    textMesh: THREE.Mesh | undefined;
    loader = new OBJLoader();
    object: string;
    object3dGroup: THREE.Group;


    constructor(id: string, radius: number, planet: Planet, mass: number = 10, object: string = '') {
        this.id = id;
        this.mass = mass;
        this.radius = radius;
        this.positionOnPlanet = new Vector3(0, 0, 0);
        this.planet = planet;
        this.catPositionAngle = [0,0];        
        const color = this.generateColor(id);
        this.color = color;
        const material = new THREE.MeshLambertMaterial( { color: color } ); // This should be taken in as a constructor argument, but might break things when that happens
        this.catPositionAngle = [0,0];
        const scene = planet.scene;
        this.object3dGroup = new THREE.Group();

        const loader = new FontLoader();

        // scene.add( this.mesh );

        // load a resource
        let rnd = id.charCodeAt(0) % 4;
        const catsobj = ['cat.obj','cat2.obj','cat3.obj','cat4.obj'];
        const obj = catsobj[rnd];
        let size = 0.05;
        if(rnd == 0){
            size = 0.075;
        }
        if(rnd == 1){
            size = 0.5;
        }
        if(rnd == 2){
            size = 0.5;
        }
        if(rnd == 3){
            size = 0.4;
        }
        this.object = obj;
        this.loader.load(
            // resource URL
            obj,
            // called when resource is loaded
            ( object ) => {
                console.log('Object is loaded');
                object.traverse(function(child) {
                    if (child instanceof THREE.Mesh) {
                        child.material = material;
                    }
                });
                object.scale.copy(new THREE.Vector3(size, size, size));
                this.object3dGroup.add(object);

            },
            // called when loading is in progresses
            function ( xhr ) {

                console.log( ( xhr.loaded / xhr.total * 100 ));

            },
            // called when loading has errors
            function ( error ) {

                console.log( 'An error happened' );

            }
        );
        loader.load( 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', ( font ) => {

            const textGeo: TextGeometry = new TextGeometry( id , {
                font: font,
                size: 60,
                height: 5,
                curveSegments: 12,
                bevelEnabled: false,
                bevelThickness: 0.5,
                bevelSize: 8,
                bevelOffset: 0,
                bevelSegments: 5
            } );

            this.textGeometry = textGeo;
            this.textGeometry.scale(0.1,0.1,0.1);
            this.textGeometry.translate(-15,0,30);
            this.textGeometry.rotateX(-Math.PI/2);
            this.textMesh = new THREE.Mesh(this.textGeometry, new THREE.MeshLambertMaterial( { color: 'black' }));
            this.object3dGroup.add(this.textMesh);


        } );

        this.mesh = this.object3dGroup;
        scene.add(this.mesh);
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

        copyVector.applyAxisAngle(new Vector3(0, 1, 0), this.planet.gamma);
        copyVector.applyAxisAngle(new Vector3(1, 0, 0), this.planet.beta);

        const absPosition = copyVector.add(this.planet.coordinates);
        this.mesh!.position.copy(copyVector);
        this.mesh!.rotation.copy(this.planet.object3dGroup.rotation.clone());
        this.mesh!.rotateOnAxis(new Vector3(1,0,0), Math.PI/2);

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
