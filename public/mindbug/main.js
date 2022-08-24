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
    }
}

// Whenever the server emits 'login'
socket.on('login', (data) => {
    connected = true;
    alert('you have been connected');
});

socket.on('disconnect', () => {
    connected = true;
    alert('you have been disconnected');
});

const findMatch = () => {
    if (connected) {
        // tell server to execute 'new message' and send along one parameter
        socket.emit('matchmaking', username);
    }
}

$( "#match" ).click(function(e) {
    //e.target.style.display = "none";
    $(this).hide();
    $( "#cancel" ).show();
    matchMaking();
});


function matchMaking(){
    findMatch();
    alert("finding opponent!");
}

