# Adwet_Dash_21BRS1199
Here is a complete README.md file with all the necessary details for your GitHub repository:

# Mini Chess Game

Mini Chess Game is a turn-based, chess-like game built with a server-client architecture. The game utilizes WebSockets for real-time communication and features a web-based user interface, allowing two players to play against each other remotely. 

## Features

- *Turn-Based Gameplay*: Strategic game played on a 5x5 grid with unique pieces and movement rules.
- *WebSocket Communication*: Real-time communication between server and clients for seamless gameplay.
- *Player Profiles*: Players can create and save their profiles with names, ratings, and photos.
- *Chat Feature*: In-game chat to communicate with the opponent.
- *Move History*: Track the history of all moves during the game.
- *Rematch and Restart Options*: Easily rematch or restart the game with the provided buttons.
- *Responsive UI*: Clean, responsive user interface for a better user experience.

## Game Rules

1. *Board Setup*:
   - The game is played on a 5x5 grid.
   - Each player controls five pieces: 2 Pawns (P1, P2), Hero1 (H1), Hero2 (H2), and Hero3 (H3).
   
2. *Piece Movement*:
   - *Pawns (P1, P2)*: Move one block in any direction.
   - *Hero1 (H1)*: Moves one or two blocks straight and captures any piece in its path when moving two blocks.
   - *Hero2 (H2)*: Moves one or two blocks diagonally and captures any piece in its path when moving two blocks.
   - *Hero3 (H3)*: Moves two steps straight and one step sideways, capturing only at its final position.
   
3. *Winning Condition*:
   - The game ends when one player eliminates all of their opponent's pieces.

## Getting Started

### Prerequisites

- *Node.js*: Make sure you have Node.js installed on your machine. You can download it from the [Node.js Official Website](https://nodejs.org/).

### Installation

1. *Clone the repository*:
   bash
   git clone https://github.com/yourusername/mini-chess-game.git
   cd mini-chess-game
   

2. *Install server dependencies*:
   bash
   cd server
   npm install
   

3. *(Optional) Install client dependencies*:
   - This step is only necessary if you have additional client-side dependencies. If you are just using plain HTML, CSS, and JavaScript, you can skip this step.
   bash
   cd ../client
   npm install
   

### Running the Game

1. *Start the server*:
   bash
   cd server
   node server.js
   

2. *Open the client in your browser*:
   - Open the index.html file from the client folder in your preferred web browser.

3. *Play the Game*:
   - Open the game in two separate tabs or browsers to play against each other.
   - Follow the on-screen instructions to start playing.

## Usage

- *Player Profile*: Click on the "Player Profile" tab to enter your name, rating, and upload a photo.
- *Game Rules*: Click on the "Game Rules" tab to view the rules of the game.
- *Chat*: Use the chat box to communicate with your opponent during the game.
- *Move History*: View the scrollable move history in the right sidebar.
- *Rematch/Restart*: Use the buttons provided to rematch or restart the game.
