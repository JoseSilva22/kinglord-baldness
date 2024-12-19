import * as THREE from '../js/three.js';
import { DragControls } from '../js/dragcontrols.js';

const scene = new THREE.Scene();

const forest = new THREE.TextureLoader().load( 'img/forest.jpg' );
const island = new THREE.TextureLoader().load( 'img/island.jpg' );
const mountain = new THREE.TextureLoader().load( 'img/mountain.jpg' );
const plains = new THREE.TextureLoader().load( 'img/plains.jpg' );
const swamp = new THREE.TextureLoader().load( 'img/swamp.jpg' );
const back = new THREE.TextureLoader().load( 'img/back.jpg' );

const textures = {
    0: forest,
    1: island,
    2: mountain,
    3: plains,
    4: swamp,
    5: back
};

// TO-DO:
// primeira coisa a fazer ver se o meu username esta nalgum match. 
// se nao -> kickar
// ter um object do tipo username: gameId
// ver se username ja existe quando se faz login

// para remover eventos quando se sai da pagina do jogo
// talvez usar tambem no onDisconnect
// https://socket.io/docs/v4/listening-to-events/


const username = sessionStorage.getItem("username");
const matchInfo = JSON.parse(sessionStorage.getItem("matchInfo"));
const playerNum = matchInfo.player1 === username ? "player1" : "player2"
$("#opponentName").text(matchInfo.player1 === username ? matchInfo.player2 : matchInfo.player1);
$("#playerName").text(username);

var playerHand = [];
var opponentHand = [];

function createOpponentHand(hand) {
    for (let index = 0; index < 5; index++) {
        const geometry = new THREE.BoxGeometry( .7, 1.0, 0.05 );
        const material = new THREE.MeshBasicMaterial( { map: textures[5] } );
        const cube = new THREE.Mesh( geometry, material );
        cube.position.set(-2+index, 3, 0);

        scene.add( cube );
        opponentHand.push(cube);
    }
}

function createPlayerHand(hand) {
    for (let index = 0; index < hand.length; index++) {
        const geometry = new THREE.BoxGeometry( .7, 1.0, 0.05 );
        const material = new THREE.MeshBasicMaterial( { map: textures[hand[index]] } );
        const cube = new THREE.Mesh( geometry, material );
        cube.position.set(-2+index, -3, 0);

        scene.add( cube );
        playerHand.push(cube);
    }

    const controls = new DragControls( playerHand, camera, renderer.domElement );

    controls.deactivate();
    controls.activate();

    controls.addEventListener( 'dragend', function ( event ) {
        console.log(event.object)
        if (event.object.position.y > 0.0)
            alert("PLAYED!")
    	//event.object.position.set(0, -3.5, 0);

    });

    controls.addEventListener( 'drag', function ( event ) {
        
        if (event.object.position.y > 0.0)
            event.object.material.color.setHex( 0xFFBF00 )
        else if (event.object.position.y <= 0.0)
            event.object.material.color.setHex( 0xFFFFFF )
    	//event.object.position.set(0, -3.5, 0);

    });
}

const socket = io();

socket.on('startingHand', (data) => {
    createPlayerHand(data);
    createOpponentHand();
});

socket.emit('startGame', {"gameUUID": matchInfo.gameUUID, "player": playerNum});


const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );





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

// const controls = new DragControls( [ cube ], camera, renderer.domElement );

// controls.deactivate();
// controls.activate();

// controls.addEventListener( 'dragend', function ( event ) {
//     console.log(event.object)
//     if (event.object.position.y > 0.0)
//         alert("PLAYED!")
// 	//event.object.position.set(0, -3.5, 0);

// });

