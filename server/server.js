const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, '../client')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

let gameState = {
    board: [],
    players: {},
    currentTurn: 'A',
    moveHistory: []
};

function initializeGame() {
    gameState.board = Array(5).fill().map(() => Array(5).fill(null));

    gameState.board[0] = [
        { player: 'A', type: 'P1' },
        { player: 'A', type: 'P2' },
        { player: 'A', type: 'H1' },
        { player: 'A', type: 'H2' },
        { player: 'A', type: 'H3' }
    ];

    gameState.board[4] = [
        { player: 'B', type: 'P1' },
        { player: 'B', type: 'P2' },
        { player: 'B', type: 'H1' },
        { player: 'B', type: 'H2' },
        { player: 'B', type: 'H3' }
    ];

    gameState.currentTurn = 'A';
    gameState.moveHistory = [];
    console.log('Game initialized:', JSON.stringify(gameState));
}

function isValidMove(player, fromRow, fromCol, toRow, toCol, pieceType) {
    console.log(`Validating move for ${pieceType} from (${fromRow}, ${fromCol}) to (${toRow}, ${toCol})`);

    if (toRow < 0 || toRow >= 5 || toCol < 0 || toCol >= 5) return false;

    const targetCell = gameState.board[toRow][toCol];
    if (targetCell && targetCell.player === player) return false;

    switch (pieceType) {
        case 'P1':
        case 'P2':
            return Math.abs(toRow - fromRow) <= 1 && Math.abs(toCol - fromCol) <= 1;

        case 'H1':
            if (toRow === fromRow || toCol === fromCol) {
                if (Math.abs(toRow - fromRow) <= 1 && Math.abs(toCol - fromCol) <= 1) return true;

                if (Math.abs(toRow - fromRow) === 2 || Math.abs(toCol - fromCol) === 2) {
                    const midRow = fromRow + (toRow - fromRow) / 2;
                    const midCol = fromCol + (toCol - fromCol) / 2;
                    const midCell = gameState.board[midRow][midCol];
                    if (midCell && midCell.player !== player) return true;
                    if (!midCell) return true;
                }
            }
            break;

        case 'H2':
            if (Math.abs(toRow - fromRow) === Math.abs(toCol - fromCol)) {
                if (Math.abs(toRow - fromRow) === 1) return true;

                if (Math.abs(toRow - fromRow) === 2) {
                    const midRow = fromRow + (toRow - fromRow) / 2;
                    const midCol = fromCol + (toCol - fromCol) / 2;
                    const midCell = gameState.board[midRow][midCol];
                    if (midCell && midCell.player !== player) return true;
                    if (!midCell) return true;
                }
            }
            break;

        case 'H3':
            const dRow = toRow - fromRow;
            const dCol = toCol - fromCol;
            
            if ((Math.abs(dRow) === 2 && Math.abs(dCol) === 1) || (Math.abs(dRow) === 1 && Math.abs(dCol) === 2)) {
                const stepRow = fromRow + (dRow === 2 ? 1 : (dRow === -2 ? -1 : 0));
                const stepCol = fromCol + (dCol === 2 ? 1 : (dCol === -2 ? -1 : 0));
                const stepCell = gameState.board[stepRow][stepCol];
                
                if (!stepCell || stepCell.player !== player) {
                    console.log(`Move valid for H3 from (${fromRow}, ${fromCol}) to (${toRow}, ${toCol})`);
                    return true;
                }
            }
            break;

        default:
            return false;
    }
    return false;
}

function isGameOver() {
    const allPieces = gameState.board.flat().filter(cell => cell !== null);
    const players = allPieces.map(piece => piece.player);
    return players.length === 0 || new Set(players).size === 1;
}

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    let player = Object.keys(gameState.players).length === 0 ? 'A' : 'B';
    gameState.players[socket.id] = player;

    console.log('Player assigned:', player);
    console.log('Players object:', gameState.players);

    if (Object.keys(gameState.players).length === 1) {
        initializeGame();
    }

    socket.emit('gameState', gameState);
    console.log('Game state sent to new client:', JSON.stringify(gameState));

    if (Object.keys(gameState.players).length === 2) {
        io.emit('gameState', gameState);
        console.log('Game state sent to all clients:', JSON.stringify(gameState));
    }

    socket.on('move', (data) => {
        const { fromRow, fromCol, toRow, toCol } = data;
        const player = gameState.players[socket.id];
        const piece = gameState.board[fromRow][fromCol];

        if (gameState.currentTurn !== player) {
            socket.emit('error', 'It is not your turn');
            return;
        }

        if (isValidMove(player, fromRow, fromCol, toRow, toCol, piece.type)) {
            gameState.board[toRow][toCol] = gameState.board[fromRow][fromCol];
            gameState.board[fromRow][fromCol] = null;
            gameState.currentTurn = gameState.currentTurn === 'A' ? 'B' : 'A';

            // Add move to move history
            gameState.moveHistory.push(`${player}-${piece.type} moved from (${fromRow}, ${fromCol}) to (${toRow}, ${toCol})`);

            if (isGameOver()) {
                const winner = gameState.currentTurn === 'A' ? 'B' : 'A';
                io.emit('gameEnd', winner);
                console.log(`Game over. Player ${winner} wins.`);
            } else {
                io.emit('gameState', gameState);
                console.log('Move made and game state updated:', JSON.stringify(gameState));
            }
        } else {
            socket.emit('error', 'Invalid move');
        }
    });

    socket.on('restart', () => {
        initializeGame();
        io.emit('gameState', gameState);
    });

    socket.on('chatMessage', (message) => {
        const player = gameState.players[socket.id];
        const formattedMessage = `Player ${player}: ${message}`;
        io.emit('chatMessage', formattedMessage);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        delete gameState.players[socket.id];
        if (Object.keys(gameState.players).length < 2) initializeGame();
    });
});

server.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
