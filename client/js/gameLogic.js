let gameState = {
    board: [],
    currentTurn: 'A',
    selectedPiece: null,
    moveHistory: []
};

function initializeGame() {
    gameState.board = Array(5).fill().map(() => Array(5).fill(null));
    gameState.currentTurn = 'A';
    gameState.selectedPiece = null;
    gameState.moveHistory = [];

    renderBoard();
    updateMessage();
    updateMoveHistory();
    console.log('Game initialized on client:', gameState);

    // Load player profile if it exists
    const playerName = localStorage.getItem('playerName');
    const playerRating = localStorage.getItem('playerRating');
    const playerPhoto = localStorage.getItem('playerPhoto');
    if (playerName) document.getElementById('player-name').value = playerName;
    if (playerRating) document.getElementById('player-rating').value = playerRating;
    if (playerPhoto) {
        const photoPreview = document.getElementById('photo-preview');
        photoPreview.src = playerPhoto;
        photoPreview.style.display = 'block';
    }
}

function handleCellClick(row, col) {
    const selectedCell = gameState.board[row][col];
    console.log(`Clicked on cell: (${row}, ${col})`);

    if (!gameState.selectedPiece) {
        if (selectedCell && selectedCell.player === gameState.currentTurn) {
            gameState.selectedPiece = { row, col, piece: selectedCell };
            console.log(`Selected piece: ${selectedCell.type} at (${row}, ${col})`);
            renderBoard();
        }
    } else {
        if (selectedCell && selectedCell.player === gameState.currentTurn) {
            gameState.selectedPiece = { row, col, piece: selectedCell };
            console.log(`Changed selected piece to: ${selectedCell.type} at (${row}, ${col})`);
        } else {
            movePiece(row, col);
        }
        renderBoard();
    }
}

function movePiece(row, col) {
    const from = gameState.selectedPiece;
    console.log(`Attempting to move ${from.piece.type} from (${from.row}, ${from.col}) to (${row}, ${col})`);

    if (isValidMove(from.row, from.col, row, col, from.piece.type)) {
        socket.emit('move', { fromRow: from.row, fromCol: from.col, toRow: row, toCol: col });
        gameState.selectedPiece = null;
    } else {
        alert('Invalid move!');
        gameState.selectedPiece = null;
    }

    renderBoard();
}

function isValidMove(fromRow, fromCol, toRow, toCol, pieceType) {
    console.log(`Validating move for ${pieceType} from (${fromRow}, ${fromCol}) to (${toRow}, ${toCol})`);

    if (toRow < 0 || toRow >= 5 || toCol < 0 || toCol >= 5) return false;

    const targetCell = gameState.board[toRow][toCol];
    if (targetCell && targetCell.player === gameState.currentTurn) return false;

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
                    if (midCell && midCell.player !== gameState.currentTurn) return true;
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
                    if (midCell && midCell.player !== gameState.currentTurn) return true;
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
                
                if (!stepCell || stepCell.player !== gameState.currentTurn) {
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

function updateGameState(newState) {
    gameState = newState;
    renderBoard();
    updateMessage();
    updateMoveHistory();
    console.log('Game state updated on client:', gameState);
}

function updateMoveHistory() {
    const moveHistoryDiv = document.getElementById('move-history').querySelector('ul');
    moveHistoryDiv.innerHTML = '';
    gameState.moveHistory.forEach(move => {
        moveHistoryDiv.innerHTML += `<li>${move}</li>`;
    });
}

function restartGame() {
    socket.emit('restart');
}

function rematch() {
    socket.emit('restart');
}

function sendMessage() {
    const messageInput = document.getElementById('chat-input');
    const message = messageInput.value.trim();
    if (message) {
        socket.emit('chatMessage', message);
        messageInput.value = '';
    }
}

function clearChat() {
    document.getElementById('chat-messages').innerHTML = '';
}

function saveProfile() {
    const playerName = document.getElementById('player-name').value;
    const playerRating = document.getElementById('player-rating').value;
    localStorage.setItem('playerName', playerName);
    localStorage.setItem('playerRating', playerRating);
    alert('Profile saved!');
}

function previewImage() {
    const file = document.getElementById('player-photo').files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const photoPreview = document.getElementById('photo-preview');
            photoPreview.src = e.target.result;
            photoPreview.style.display = 'block';
            localStorage.setItem('playerPhoto', e.target.result);
        };
        reader.readAsDataURL(file);
    }
}

socket.on('chatMessage', (message) => {
    const chatMessagesDiv = document.getElementById('chat-messages');
    const newMessage = document.createElement('p');
    newMessage.textContent = message;
    chatMessagesDiv.appendChild(newMessage);
    chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
});

socket.on('gameEnd', (winner) => {
    document.getElementById('message').textContent = `Player ${winner} wins!`;
});
