import * as THREE from '../js/three.js';
import { DragControls } from '../js/dragcontrols.js';
import { Swamp, Forest, Mountain, Island, Plains } from './lands.js';

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

const cardTypes = {
    0: "forest",
    1: "island",
    2: "mountain",
    3: "plains",
    4: "swamp",
    5: "back"
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

// TO-DO:
// class GameState to have all these structures?
// plus calculate state changes such as winning...
var playerHand = [];
var playerBattlefield = [];
var playerGraveyard = [];

var opponentHand = [];
var opponentBattlefield = [];
var opponentGraveyard = [];

var browserCards = [];
var stack = null;
var selected = null;

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );



function animate() {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
};

animate();

const playerControls = new DragControls( playerHand, camera, renderer.domElement );
playerControls.deactivate();
playerControls.activate();

playerControls.addEventListener( 'dragend', function ( event ) {
    //console.log(event.object)
    if (event.object.position.y > 0.0){
        event.object.material.color.setHex( 0xFFFFFF )
        event.object.scale.set(1.5, 1.5, 1);
        event.object.position.set(4, 0, 0);
        let idx = playerHand.indexOf(event.object);
        //console.log(playerHand.map(el => el.cardType));
        stack = playerHand.splice(idx, 1)[0];
        //console.log(playerHand.map(el => el.cardType));
        socket.emit('cardPlayed', {
            gameUUID: matchInfo.gameUUID,
            player: playerNum,
            card: event.object.cardType,
            index: idx
        });
    }
        
    else
        event.object.position.set(event.object.originalPosition.x, event.object.originalPosition.y, event.object.originalPosition.z);
});

playerControls.addEventListener( 'drag', function ( event ) {
    if (event.object.position.y > 0.0)
        event.object.material.color.setHex( 0xFFBF00 );
    else if (event.object.position.y <= 0.0)
        event.object.material.color.setHex( 0xFFFFFF );
});

const browserControls = new DragControls( browserCards, camera, renderer.domElement );
browserControls.deactivate();
browserControls.activate();

browserControls.addEventListener( 'dragend', function ( event ) {
    event.object.material.color.setHex( 0xFFFFFF );
    selected = event.object.cardType;
    // TO-DO: treat as selected?
    console.log(selected);
    browserCards.length = 0;
    console.log(selected);

});

browserControls.addEventListener( 'drag', function ( event ) {
    event.object.material.color.setHex( 0xFF0000 )
});


function createOpponentHand(hand) {
    for (let index = 0; index < 5; index++) {
        const geometry = new THREE.BoxGeometry( .7, 1.0, 0.05 );
        const material = new THREE.MeshBasicMaterial( { map: textures[5] } );
        const card = new THREE.Mesh( geometry, material );
        card.position.set(-2+index, 3, 0);

        scene.add( card );
        opponentHand.push(card);
    }
}

function createPlayerHand(hand) {
    for (let index = 0; index < hand.length; index++) {
        const geometry = new THREE.BoxGeometry( .7, 1.0, 0.05 );
        const material = new THREE.MeshBasicMaterial( { map: textures[hand[index]] } );
        const card = new THREE.Mesh( geometry, material );
        card.position.set(-2+index, -3, 0);
        card.originalPosition = JSON.parse(JSON.stringify(card.position));
        card.cardType = hand[index];
        card.clickable = false; // for later when applying effects

        scene.add( card );
        playerHand.push(card);
    }

    

    // controls.addEventListener( 'click', function ( event ) {
    //     if (!event.object.clickable)
    //         return;
    // });
}

// receives list of cards for player to pick
// graveyards, hands, battlefields...
function showCardList(cards, listType) {
    // to show message describing what to do
    switch (listType) {
        case 'graveyard':
            break;
        case 'hand':
            break;
        case 'battlefield':
            break;
    }

    let numCards = cards.length;
    for (let index = 0; index < cards.length; index++) {
        cards[index].scale.set(1.5, 1.5, 1);
        cards.clickable = true;
        cards[index].position.set(index - numCards / 2, 0, 0);
        browserCards.push(cards[index]);
    }
    // after select clear browserCards?
}


function applyCardEffect(card) {
    console.log("APPLYING...");
    console.log(card);
    console.log(cardTypes[card]);
    switch (cardTypes[card]) {
        case 'forest': // Regrowth
            console.log('Returning a card from graveyard to hand.');
            // show graveyard
            showCardList(playerGraveyard);
            // select card (visually)
            // remove from grave
            // put in hand
            break;
        case 'swamp': // Thoughtseize
            console.log('Viewing opponent\'s hand to discard.');
            // show opponent's hand
            showCardList(opponentHand) // need info from server
            // select card (visually)
            // remove from opponent's hand
            // put in graveyard
            break;
        case 'mountain': // Stone Rain
            console.log('Destroying opponent\'s land.');
            // show opponent's battlefield
            showCardList(opponentBattlefield);
            // select card (visually)
            // remove from opponent's battlefield
            // put in graveyard
            break;
        case 'island': // Counter or Draw
            if (card.isCounter) {
                console.log('Countering action.');
                // show player-s own hand
                // select card 
                // put selected card in graveyard
                // put island in graveyard
            } else {
                console.log('Drawing a card.');
                // get new card
            }
            break;
        case 'plains': // Cloudshift
            console.log('Blinking land.');
            // show current battlefield without whites...
            showCardList(playerBattlefield);
            // select card (visually)
            // call this function with "card" value of selected card
            break;
    }
}

function showCounterOptions(card) {
    // Highlight counterable actions or display a confirmation dialog
    // alert(`Opponent played a ${cardTypes[card]}! Use an Island to counter?`);
    console.log(`Opponent played a ${cardTypes[card]}! Use an Island to counter?`);

    // TODO: botoes para confirmar ou counter
    socket.emit('counterAction', {
                gameUUID: matchInfo.gameUUID,
                player: playerNum,
                countered: false,
                card: card
            });
}

function removeMesh(mesh) {
    // Remove the mesh from the scene
    scene.remove(mesh);

    // Dispose of the geometry and material
    if (mesh.geometry) mesh.geometry.dispose();
    if (mesh.material) {
        if (Array.isArray(mesh.material)) {
            mesh.material.forEach(material => material.dispose());
        } else {
            mesh.material.dispose();
        }
    }
}

// updates visually the battlefield of both players
// re-"renders" cards ordered by play order...
function updateBattlefield() {
    let numCards = playerBattlefield.length;
    for (let index = 0; index < playerBattlefield.length; index++) {
        playerBattlefield[index].scale.set(0.75, 0.75, 1);
        playerBattlefield[index].position.set(index - numCards / 2, -1.5, 0);
    }

    numCards = opponentBattlefield.length;
    for (let index = 0; index < opponentBattlefield.length; index++) {
        opponentBattlefield[index].scale.set(0.75, 0.75, 1);
        opponentBattlefield[index].position.set(index - numCards / 2, 1.5, 0);
    }
}

const socket = io();

socket.on('startingHand', (data) => {
    createPlayerHand(data);
    createOpponentHand();
});

socket.on('actionRequest', (data) => {
    // Display UI for opponent to counter the action
    if (data.action === "requestCounter") {
        // Display an option for the player to play an Island card
        showCounterOptions(data.card);
    }

    // TODO: remover alert de cima... e mostrar carta a direita...
    
    let card = opponentHand.splice(data.index, 1)[0];
    removeMesh(card);
});

socket.on('actionConfirmed', (data) => {
    console.log("confirmado")
    // visually removes card from stack 
    // and puts it on the battlefield
    if (stack != null) {
        playerBattlefield.push(stack);
        stack = null;
        updateBattlefield();
    }
    
    // Apply card effects visually 
    applyCardEffect(data.card);
});

socket.on('actionCountered', (data) => {
    // Negate card effects visually 
    negateCardEffect(data.card, data.target);
    // TODO: put card on graveyard
    // TODO: remove cards (island + land) from opponent hand (visual)
});

socket.emit('startGame', {"gameUUID": matchInfo.gameUUID, "player": playerNum});



