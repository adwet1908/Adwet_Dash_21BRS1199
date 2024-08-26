function renderBoard() {
    const boardDiv = document.getElementById('board');
    boardDiv.innerHTML = ''; // Clear previous board

    gameState.board.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const cellDiv = document.createElement('div');
            cellDiv.classList.add('cell');

            // Check if there is a piece and display it
            if (cell) {
                cellDiv.innerText = `${cell.player}-${cell.type}`;
            }

            // Highlight the selected piece
            if (gameState.selectedPiece && gameState.selectedPiece.row === rowIndex && gameState.selectedPiece.col === colIndex) {
                cellDiv.classList.add('selected');
            }

            cellDiv.onclick = () => handleCellClick(rowIndex, colIndex); // Make cells clickable
            boardDiv.appendChild(cellDiv);
        });
    });

    console.log('Board rendered:', gameState.board); // Debugging line
}

function updateMessage() {
    const messageDiv = document.getElementById('message');
    messageDiv.innerText = `Current Player: ${gameState.currentTurn}`;
}

function updateMoveHistory() {
    const moveHistoryDiv = document.getElementById('move-history');
    moveHistoryDiv.innerHTML = '<h3>Move History</h3><ul>';
    gameState.moveHistory.forEach(move => {
        moveHistoryDiv.innerHTML += `<li>${move}</li>`;
    });
    moveHistoryDiv.innerHTML += '</ul>';
}
