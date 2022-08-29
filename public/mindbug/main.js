const socket = io();

const $window = $(window);
const $usernameInput = $('.usernameInput'); // Input for username
const $loginPage = $('.login.page');        // The login page

// Prompt for setting a username
let username;
let connected = false;
let $currentInput = $usernameInput.focus();


// Prevents input from having injected markup
const cleanInput = (input) => {
    return $('<div/>').text(input).html();
}

$window.keydown(event => {
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
        setUsername();
        $($window).off("keydown");
    }
});

// Sets the client's username
const setUsername = () => {
    username = cleanInput($usernameInput.val().trim());

    // If the username is valid
    if (username) {
        $loginPage.fadeOut();
        $loginPage.off('click');

        // Tell the server your username
        socket.emit('add user', username);
        $( "#match" ).show();
    }
}

// Whenever the server emits 'login'
socket.on('login', (data) => {
    connected = true;
    //alert('you have been connected');
});

socket.on('disconnect', () => {
    connected = true;
    //alert('you have been disconnected');
});

socket.on('match found', (matchInfo) => {
    sessionStorage.setItem("username", username);
    sessionStorage.setItem("matchInfo", JSON.stringify(matchInfo));
    
    window.location = '/mindbug/game.html';
});

// MATCHMAKING
$( "#match" ).click(function(e) {
    //e.target.style.display = "none";
    $(this).hide();
    $( "#cancel" ).show();
    
    findMatch();
});

const findMatch = () => {
    if (connected) {
        // tell server to execute 'new message' and send along one parameter
        socket.emit('matchmaking', username);
        // TODO: change to find match screen (with cancel button)
    }
}

$( "#cancel" ).click(function(e) {
    //e.target.style.display = "none";
    $(this).hide();
    $( "#match" ).show();
    
    cancelFindMatch();
});

const cancelFindMatch = () => {
    if (connected) {
        // tell server to execute 'new message' and send along one parameter
        socket.emit('cancel matchmaking', username);
        // TODO: change to find match screen (with cancel button)
    }
}



