import * as THREE from '../js/three.js';
import { DragControls } from '../js/dragcontrols.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const texture = new THREE.TextureLoader().load( 'img/chameleon_sniper.png' );

const geometry = new THREE.BoxGeometry( .635, .889, 0.05 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00, map: texture } );
const cube = new THREE.Mesh( geometry, material );
cube.position.set(0, -3, 0);

scene.add( cube );

// const plane = new THREE.Mesh(
//     new THREE.PlaneGeometry(100, 100),
//     new THREE.MeshBasicMaterial({ color: "aqua" })
// );

// plane.position.set(0 , -5 , 0);

// scene.add(plane);


function animate() {
    requestAnimationFrame( animate );

    //cube.rotation.x += 0.01;
    //cube.rotation.y += 0.01;

    renderer.render( scene, camera );
};

animate();

const controls = new DragControls( [ cube ], camera, renderer.domElement );

controls.deactivate();
controls.activate();

controls.addEventListener( 'dragend', function ( event ) {
    console.table(event.object)
	event.object.position.set(0, -3.5, 0);

});
