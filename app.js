// Setup basic express server
const express = require('express');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const crypto = require('crypto');
const port = 5000;
server.listen(port, () => {
    console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static('public'));


var currentGames = {}; // gameId: {...}
var matchMaking = [];
var numUsers = 0;



function prepareGame () {
    var deck1 = [...Array(5)].flatMap((_, i) => Array(10).fill(i)).sort(() => Math.random() - 0.5);
    var hand1 = deck1.splice(0,5);
    var deck2 = [...Array(5)].flatMap((_, i) => Array(10).fill(i)).sort(() => Math.random() - 0.5);
    var hand2 = deck2.splice(0,5);
    
    var gameObj = {
        player1: {
            ready: false,
            deck: deck1,
            hand: hand1,
            grave: []
        },
        player2: {
            ready: false,
            deck: deck2,
            hand: hand2,
            grave: []
        },
    }

    return gameObj;
}

function checkIfPairFound() {
    if (matchMaking.length < 2)
        return;
     
    let newGamePlayers = matchMaking.splice(0, 2);
    let newGameUUID = '';
    
    do {
        newGameUUID = crypto.randomUUID();
    }
    while(newGameUUID in currentGames);
    
    
    let gameInfo = {
        'gameUUID': newGameUUID,
        'player1': newGamePlayers[0].username,
        'player2': newGamePlayers[1].username
    }
    
    newGamePlayers[0].socket.emit('match found', gameInfo);
    newGamePlayers[1].socket.emit('match found', gameInfo);
    
    let gameObj = prepareGame();
    console.log(gameObj);
    currentGames[newGameUUID] = gameObj;
}

io.on('connection', (socket) => {
    let addedUser = false;

    socket.on('matchmaking', (data) => {
        matchMaking.push(
            {
                'username': data, 
                'socket': socket
            });
        
        checkIfPairFound();

    });

    socket.on('cancel matchmaking', (data) => {
        matchMaking = matchMaking.filter( i => i.username != data);
    });

    // when the client emits 'add user', this listens and executes
    socket.on('add user', (username) => {
        if (addedUser) return;
        
        // we store the username in the socket session for this client
        socket.username = username;
        ++numUsers;
        addedUser = true;
        socket.emit('login', {
            numUsers: numUsers
        });
        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers
        });
    });
    
    // when the client emits 'new message', this listens and executes
    // not used... yet (for chat ^.^)
    socket.on('new message', (data) => {
        // we tell the client to execute 'new message'
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: data
        });
    });
    
    // when the user disconnects.. perform this
    socket.on('disconnect', () => {
        console.log(socket.username, "left");
        if (addedUser) {
            --numUsers;
            
            // echo globally that this client has left
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });

    socket.on('startGame', (data) => {
        currentGames[data.gameUUID][data.player]["ready"] = true;
        currentGames[data.gameUUID][data.player]["socket"] = socket;

        if (currentGames[data.gameUUID]["player1"]["ready"] && currentGames[data.gameUUID]["player2"]["ready"]){
            currentGames[data.gameUUID]["player1"]["socket"].emit("startingHand", currentGames[data.gameUUID]["player1"]["hand"])
            currentGames[data.gameUUID]["player2"]["socket"].emit("startingHand", currentGames[data.gameUUID]["player2"]["hand"])
        }

    });
    // // when the client emits 'typing', we broadcast it to others
    // socket.on('typing', () => {
    //     socket.broadcast.emit('typing', {
    //         username: socket.username
    //     });
    // });
    
    // // when the client emits 'stop typing', we broadcast it to others
    // socket.on('stop typing', () => {
    //     socket.broadcast.emit('stop typing', {
    //         username: socket.username
    //     });
    // });

});
