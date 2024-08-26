const socket = io();

// Initialize the game
socket.on('connect', () => {
    console.log('Connected to server');
    initializeGame();
});

// Listen for game state updates from the server
socket.on('gameState', (gameState) => {
    console.log('Game state received from server:', gameState); // Debugging line
    updateGameState(gameState);
});

// Listen for errors from the server
socket.on('error', (message) => {
    alert(message);
});
