const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 300;
canvas.height = 600;

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = canvas.width / COLS;

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let currentTetromino = getRandomTetromino();
let currentPosition = { x: 3, y: 0 };
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;

document.getElementById('high-score').innerText = `High Score: ${highScore}`;

// Funkcija za crtanje bloka
function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

// Funkcija za crtanje tetromina
function drawTetromino() {
    currentTetromino.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                drawBlock(currentPosition.x + x, currentPosition.y + y, currentTetromino.color);
            }
        });
    });
}

// Funkcija za crtanje cijele table
function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    board.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                drawBlock(x, y, 'cyan');
            }
        });
    });
}

// Funkcija za slučajni izbor tetromina
function getRandomTetromino() {
    const tetrominoes = [
        { shape: [[1, 1, 1, 1]], color: 'cyan' },        // I
        { shape: [[1, 1], [1, 1]], color: 'yellow' },     // O
        { shape: [[0, 1, 0], [1, 1, 1]], color: 'purple' }, // T
        { shape: [[1, 0, 0], [1, 1, 1]], color: 'orange' }, // L
        { shape: [[0, 0, 1], [1, 1, 1]], color: 'blue' },   // J
        { shape: [[0, 1, 1], [1, 1, 0]], color: 'green' },  // S
        { shape: [[1, 1, 0], [0, 1, 1]], color: 'red' },    // Z
    ];
    return tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
}

// Funkcija za pomjeranje tetromina prema dole
function moveDown() {
    if (!collision(0, 1, currentTetromino)) {
        currentPosition.y++;
    } else {
        merge();
        currentTetromino = getRandomTetromino();
        currentPosition = { x: 3, y: 0 };
        if (collision(0, 0, currentTetromino)) {
            alert('Game Over');
            resetGame();
        }
    }
    draw();
}

// Funkcija za crtanje cijele igre
function draw() {
    drawBoard();
    drawTetromino();
}

// Funkcija za provjeru kolizije
function collision(xOffset, yOffset, shape) {
    return shape.shape.some((row, y) => {
        return row.some((cell, x) => {
            if (cell) {
                const newX = currentPosition.x + x + xOffset;
                const newY = currentPosition.y + y + yOffset;
                return (
                    newX < 0 ||
                    newX >= COLS ||
                    newY >= ROWS ||
                    board[newY] && board[newY][newX] !== 0
                );
            }
            return false;
        });
    });
}

// Funkcija za spajanje tetromina sa tablom
function merge() {
    currentTetromino.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                board[currentPosition.y + y][currentPosition.x + x] = cell;
            }
        });
    });
    removeLines();
}

// Funkcija za uklanjanje kompletiranih linija
function removeLines() {
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
            score += 10;
            document.getElementById('score').innerText = `Score: ${score}`;
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('highScore', highScore);
                document.getElementById('high-score').innerText = `High Score: ${highScore}`;
            }
        }
    }
}

// Funkcija za resetovanje igre
function resetGame() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    score = 0;
    document.getElementById('score').innerText = `Score: ${score}`;
    currentTetromino = getRandomTetromino();
    currentPosition = { x: 3, y: 0 };
}

// Pokretanje igre
resetGame();
setInterval(moveDown, 1000);

document.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' && !collision(-1, 0, currentTetromino)) {
        currentPosition.x--;
    } else if (event.key === 'ArrowRight' && !collision(1, 0, currentTetromino)) {
        currentPosition.x++;
    } else if (event.key === 'ArrowDown') {
        moveDown();
    } else if (event.key === 'ArrowUp') {
        rotateTetromino();
    }
    draw();
});

// Funkcija za rotaciju tetromina
function rotateTetromino() {
    const rotatedTetromino = currentTetromino.shape[0].map((_, index) =>
        currentTetromino.shape.map(row => row[index]).reverse()
    );

    if (!collision(0, 0, { shape: rotatedTetromino })) {
        currentTetromino.shape = rotatedTetromino;
    }
}
