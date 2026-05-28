// DOM Elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const startBtn = document.getElementById('startBtn');
const endGameBtn = document.getElementById('endGameBtn');
const startScreen = document.getElementById('startScreen');
const pauseScreen = document.getElementById('pauseScreen');
const powerIndicator = document.getElementById('powerIndicator');
const powerTimer = document.getElementById('powerTimer');
const startScreenHighScore = document.getElementById('startScreenHighScore');

// Load Sprites
const playerImg = new Image();
playerImg.src = 'assets/player.png';
const bugImg = new Image();
bugImg.src = 'assets/bug.png';
const coffeeImg = new Image();
coffeeImg.src = 'assets/coffee.png';

// Optional Sound Effects (uncomment and add audio files if available)
// const hitSound = new Audio('assets/hit.mp3');
// const powerupSound = new Audio('assets/powerup.mp3');
// const gameoverSound = new Audio('assets/gameover.mp3');

// Game Objects
const player = {
  x: canvas.width / 2 - 25,
  y: canvas.height / 2 - 25,
  width: 50,
  height: 50,
  speed: 5,
  dx: 0,
  dy: 0
};

// Game State
const bugs = [];
const powerUps = [];
let baseBugSpeed = 2;
let score = 0;
let highScore = localStorage.getItem('codeBugHighScore') || 0;
let gameOver = false;
let gameActive = false;
let paused = false;
let animationId;
let imagesLoaded = 0;
let powerUpActive = false;
let powerUpEndTime = 0;
const POWER_UP_DURATION = 5000;

// Initialize high score display
highScoreElement.textContent = highScore;
startScreenHighScore.textContent = `🏆 High Score: ${highScore}`;

// Image Load Check
function checkImagesLoaded() {
  imagesLoaded++;
  if (imagesLoaded === 3) {
    console.log('All images loaded');
  }
}

playerImg.onload = checkImagesLoaded;
bugImg.onload = checkImagesLoaded;
coffeeImg.onload = checkImagesLoaded;

// Create flash overlay
const flashOverlay = document.createElement('div');
flashOverlay.className = 'screen-flash';
document.body.appendChild(flashOverlay);

// Drawing Functions
function drawPlayer() {
  if (powerUpActive) {
    ctx.shadowColor = '#3498db';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }
  ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
  ctx.shadowBlur = 0;
}

function drawBugs() {
  bugs.forEach(bug => {
    ctx.drawImage(bugImg, bug.x, bug.y, bug.width, bug.height);
  });
}

function drawPowerUps() {
  powerUps.forEach(powerUp => {
    ctx.shadowColor = '#2ecc71';
    ctx.shadowBlur = 15;
    ctx.drawImage(coffeeImg, powerUp.x, powerUp.y, powerUp.width, powerUp.height);
    ctx.shadowBlur = 0;
  });
}

// Game Logic
function update() {
  if (!gameActive || paused) {
    animationId = requestAnimationFrame(update);
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Move player
  player.x += player.dx;
  player.y += player.dy;
  
  // Boundary checks
  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));

  // Spawn objects with increased spawn rate based on score
  const spawnRate = Math.min(0.03 + (score / 1000), 0.08);
  if (Math.random() < spawnRate) {
    spawnBug();
  }
  if (Math.random() < 0.005) {
    spawnPowerUp();
  }

  // Calculate current bug speed (scales with score)
  const speedMultiplier = 1 + Math.floor(score / 10) * 0.1;
  const currentBugSpeed = baseBugSpeed * speedMultiplier;

  // Update bugs
  for (let i = bugs.length - 1; i >= 0; i--) {
    const bug = bugs[i];
    const speed = powerUpActive ? currentBugSpeed * 0.4 : currentBugSpeed;
    bug.y += speed;

    if (checkCollision(player, bug)) {
      // Hit effect
      flashOverlay.style.display = 'block';
      setTimeout(() => {
        flashOverlay.style.display = 'none';
      }, 300);
      
      // hitSound?.play().catch(() => {});
      gameOver = true;
      gameActive = false;
    }

    if (bug.y > canvas.height) {
      bugs.splice(i, 1);
      score++;
      scoreElement.textContent = score;
      
      // Update high score
      if (score > highScore) {
        highScore = score;
        localStorage.setItem('codeBugHighScore', highScore);
        highScoreElement.textContent = highScore;
      }
    }
  }

  // Update power-ups
  for (let i = powerUps.length - 1; i >= 0; i--) {
    const powerUp = powerUps[i];
    powerUp.y += 2;

    if (checkCollision(player, powerUp)) {
      powerUps.splice(i, 1);
      activatePowerUp();
      // powerupSound?.play().catch(() => {});
      
      // Power-up collection effect
      ctx.shadowColor = '#2ecc71';
      ctx.shadowBlur = 30;
      drawPlayer();
      ctx.shadowBlur = 0;
    }

    if (powerUp.y > canvas.height) {
      powerUps.splice(i, 1);
    }
  }

  // Check power-up expiration
  if (powerUpActive && Date.now() > powerUpEndTime) {
    powerUpActive = false;
    powerIndicator.style.display = 'none';
  }

  // Update power-up timer display
  if (powerUpActive) {
    const remaining = powerUpEndTime - Date.now();
    const percent = Math.max(0, (remaining / POWER_UP_DURATION) * 100);
    powerTimer.style.setProperty('--timer-width', `${percent}%`);
  }

  // Draw everything
  drawPowerUps();
  drawPlayer();
  drawBugs();

  // Draw power-up timer if active
  if (powerUpActive) {
    ctx.fillStyle = '#3498db';
    ctx.font = '12px Courier New';
    ctx.fillText('☕ POWER-UP', 10, 20);
  }

  if (!gameOver && gameActive) {
    animationId = requestAnimationFrame(update);
  } else if (gameOver) {
    endGame();
  }
}

function spawnBug() {
  bugs.push({
    x: Math.random() * (canvas.width - 30),
    y: -30,
    width: 30,
    height: 30,
    speed: baseBugSpeed + Math.random() * 3
  });
}

function spawnPowerUp() {
  powerUps.push({
    x: Math.random() * (canvas.width - 20),
    y: -20,
    width: 20,
    height: 20
  });
}

function activatePowerUp() {
  powerUpActive = true;
  powerUpEndTime = Date.now() + POWER_UP_DURATION;
  powerIndicator.style.display = 'flex';
}

function checkCollision(obj1, obj2) {
  return (
    obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y
  );
}

// Event Listeners
document.addEventListener('keydown', (e) => {
  if (!gameActive || paused) return;
  
  if (e.key === 'ArrowLeft') player.dx = -player.speed;
  if (e.key === 'ArrowRight') player.dx = player.speed;
  if (e.key === 'ArrowUp') player.dy = -player.speed;
  if (e.key === 'ArrowDown') player.dy = player.speed;
  
  // Pause with P key
  if (e.key.toLowerCase() === 'p') {
    togglePause();
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') player.dx = 0;
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') player.dy = 0;
});

function togglePause() {
  if (!gameActive || gameOver) return;
  
  paused = !paused;
  pauseScreen.style.display = paused ? 'flex' : 'none';
}

// Game Controls
function resetGame() {
  bugs.length = 0;
  powerUps.length = 0;
  score = 0;
  scoreElement.textContent = score;
  gameOver = false;
  gameActive = true;
  paused = false;
  powerUpActive = false;
  powerIndicator.style.display = 'none';
  pauseScreen.style.display = 'none';
  player.x = canvas.width / 2 - 25;
  player.y = canvas.height / 2 - 25;
  player.dx = 0;
  player.dy = 0;
  
  cancelAnimationFrame(animationId);
  update();
}

function endGame() {
  cancelAnimationFrame(animationId);
  gameActive = false;
  
  // gameoverSound?.play().catch(() => {});
  
  ctx.fillStyle = 'rgba(15, 31, 26, 0.9)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = '#e74c3c';
  ctx.font = '30px Courier New';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 30);
  
  ctx.fillStyle = '#ecf0f1';
  ctx.font = '20px Courier New';
  ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
  ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 40);
  
  // Show start screen after delay
  setTimeout(() => {
    startScreen.style.display = 'flex';
    startScreenHighScore.textContent = `🏆 High Score: ${highScore}`;
  }, 2000);
}

// Button Event Listeners
startBtn.addEventListener('click', () => {
  startScreen.style.display = 'none';
  resetGame();
});

endGameBtn.addEventListener('click', () => {
  if (gameActive && !gameOver && confirm('End current game?')) {
    gameOver = true;
    gameActive = false;
    endGame();
  }
});

// Initialize
startScreen.style.display = 'flex';
powerIndicator.style.display = 'none';
pauseScreen.style.display = 'none';

// Add CSS for power timer animation
const style = document.createElement('style');
style.textContent = `
  .power-timer::after {
    width: var(--timer-width, 100%);
  }
`;
document.head.appendChild(style);