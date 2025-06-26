import { initCamera, updateCamera, updateCameraToBounds, transform, camera } from './modules/camera.js';
import { rocket, initRocket, updateRocket, drawRocket, createExhaustParticles } from './modules/rocket.js';
import { createPolygons, drawPolygons } from './modules/polygon.js';
import { createStars, drawStars } from './modules/stars.js';
import { particles, createParticles, updateParticles, drawParticles } from './modules/particles.js';
import { initControls, keys, updateMobilePanelButtons } from './modules/controls.js';
import { checkCollisions } from './modules/collision.js';
import { resizeCanvas } from './modules/utils.js';
import { bgColor, lineColor, polyFillColor } from './modules/colors.js';
//
// Initialize canvas
const canvas = document.getElementById('gameCanvas');
export const ctx = canvas.getContext('2d');

// Set canvas dimensions to window size
window.addEventListener('resize', () => resizeCanvas(canvas));
resizeCanvas(canvas);

// Initialize game objects.
initRocket();
const levels = createPolygons();
let currentLevel = 0;
const stars = createStars(300, 4000);
initCamera(canvas.width, canvas.height, rocket);
initControls();

// Game state
let gameRunning = false;
let lastTimestamp = 0;
let panelOpened = false; // Add this flag

export const rocketStartLocations = [
    { x: 2000, y: 900 },
    { x: 1900, y: 2100 },
    { x: 2000, y: 500 },
    { x: 2600, y: 1200 },
    { x: 2000, y: 900 },
    { x: 2000, y: 900 },
    { x: 2000, y: 900 },
    { x: 2000, y: 900 },
    { x: 2000, y: 900 },
    { x: 2000, y: 900 }
];
startGame();

function startGame() {
    gameRunning = true;
    rocket.score = 0;
    const start = rocketStartLocations[(currentLevel+1)%levels.length];
    rocket.x = start.x;
    rocket.y = start.y;
    lastTimestamp = performance.now();
    requestAnimationFrame(gameLoop);
    updateMobilePanelButtons(); // <-- Add this line
}

function restartGame() {
    gameRunning = true;
    lastTimestamp = performance.now();
    requestAnimationFrame(gameLoop);
    updateMobilePanelButtons(); // <-- Add this line
}


function resetGame(){
	const start = rocketStartLocations[(currentLevel+1)%levels.length]; // You can change the index as needed
    rocket.x = start.x;
    rocket.y = start.y;
    rocket.mx = 0;
    rocket.my = 0;
    rocket.rotation = 0;
    rocket.score = 0;
    particles.length = 0;
    lastTimestamp = performance.now();
}

function crashed(){
    gameRunning = false;
   // startButton.textContent = 'Restart Level';
     // Show custom modal instead of alert
    const modal = document.getElementById('level-modal');
    const message = document.getElementById('level-modal-message');
    message.textContent = `Crashed!`;
    modal.style.display = 'flex';

    // Only reset when OK is clicked
    const okBtn = document.getElementById('level-modal-ok');
    okBtn.textContent = 'Try Again'
    okBtn.onclick = () => {
        modal.style.display = 'none';
        resetGame();
        startGame();
    };
}

function outOfBounds(){
    gameRunning = false;
   // startButton.textContent = 'Restart Level';
     // Show custom modal instead of alert
    const modal = document.getElementById('level-modal');
    const message = document.getElementById('level-modal-message');
    message.textContent = `Out of Bounds!`;
    modal.style.display = 'flex';

    // Only reset when OK is clicked
    const okBtn = document.getElementById('level-modal-ok');
    okBtn.textContent = 'Try Again'
    okBtn.onclick = () => {
        modal.style.display = 'none';
        resetGame();
        startGame();
    };
}

// Game loop
function gameLoop(timestamp) {
    if (!gameRunning) {
        updateReturnLabel();
        return;
    }

    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    // Update game state, pass crashed as callback
    updateRocket(keys, deltaTime, outOfBounds);

    // Only continue if gameRunning (not crashed)
    if (!gameRunning) {
        updateReturnLabel();
        return;
    }

    updateCameraToBounds(levels, currentLevel, rocket, canvas);
    createExhaustParticles(rocket, particles);
    updateParticles(particles);

    // Check collisions
    checkCollisions(rocket, levels[(currentLevel+1)%levels.length], particles, crashed, levelWon);

    // Increase score over time
    rocket.score += deltaTime * 0.001;

    // Render
    render();

    // Open the panel and pause after the first frame
    if (!panelOpened) {
        panelOpened = true;
        setTimeout(() => {
            openPanel();
            updateMobilePanelButtons();
        }, 100);
        return;
    }

    updateReturnLabel();
    requestAnimationFrame(gameLoop);
}

// Render function
function render() {
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transforms
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawPolygons(levels[(currentLevel+1)%levels.length], ctx);
    drawParticles(particles, ctx);
    drawRocket(ctx);
}

function levelWon() {
    gameRunning = false;
    //startButton.textContent = 'Next Level';
    // Show custom modal instead of alert
    const modal = document.getElementById('level-modal');
    const message = document.getElementById('level-modal-message');
    message.textContent = `Level won!`;
    modal.style.display = 'flex';

    // Only reset when OK is clicked
    const okBtn = document.getElementById('level-modal-ok');
    okBtn.textContent = 'Next Level'

    okBtn.onclick = () => {
        modal.style.display = 'none';
        currentLevel++;
        resetGame();
        startGame();
    };
}

const sidePanel = document.getElementById('side-panel');
const returnLabel = document.getElementById('return-label');

function isPC() {
    return window.matchMedia('(pointer: fine) and (hover: hover)').matches;
}

function getGameRunning() {
    return gameRunning;
}

function updateReturnLabel() {
    if (gameRunning && !sidePanel.classList.contains('open') && isPC()) {
        returnLabel.style.display = 'block';
    } else {
        returnLabel.style.display = 'none';
    }
}

function openPanel() {
    sidePanel.classList.add('open');
    gameRunning = false;
    updateReturnLabel();
    updateMobilePanelButtons(); // <-- Add this line
}

function closePanel() {
    sidePanel.classList.remove('open');
    if (!gameRunning) {
        restartGame();
    }
    updateReturnLabel();
    updateMobilePanelButtons(); // <-- Add this line
}

// Initialize controls ONCE, before game loop starts
initControls({
    sidePanel,
    openPanel,
    closePanel,
    updateReturnLabel,
    gameRunningGetter: getGameRunning,
    startGame,
    isPC: isPC()
});

// Listen for WASD keys to close the panel and resume the game (PC only)
window.addEventListener('keydown', (e) => {
    if (sidePanel.classList.contains('open')) {
        if (['w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
            closePanel();
        }
    } else {
        // Open the panel and pause the game if SPACE is pressed
        if (e.code === 'Space') {
            openPanel();
        }
    }
});

ctx.font = "bold 24px Racer, Orbitron, sans-serif";
document.documentElement.style.setProperty('--line-color', lineColor);
document.documentElement.style.setProperty('--poly-fill-color', polyFillColor);


