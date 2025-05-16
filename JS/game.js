
import {
    player,
    animationFrames,
    characterSprite,
    enemy,
    enemySprite,
} from './character.js';

// CANVAS SETUP
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Player's initial health and score
let playerHealth = 3;
let score = 0; // Initialize score to 0

// Retrieve username from localStorage and set a default if not logged in
const username = localStorage.getItem('username') || "Guest";
console.log("Logged in username:", username);

// // Game Over, Try Again, Carrot, and Heart images
const heartImage = new Image();
heartImage.src = './GameImages/heart.png';

const gameOverImage = new Image();
gameOverImage.src = './GameImages/gameover.png';

const tryAgainButtonImage = new Image();
tryAgainButtonImage.src = './GameImages/tryagainbutton.png';

const carrotImage = new Image();
carrotImage.src = './GameImages/carrotpowerup.png';

let isGameOver = false; // Flag to indicate game-over state

// KEYS OBJECT
const keys = {};

// Resize canvas to fit window
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Ensure player stays within bounds after resize
    if (player.x > canvas.width) player.x = canvas.width - player.width;
    if (player.y > canvas.height) player.y = canvas.height - player.height;
}

// Set initial canvas size and adjust on window resize
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Slashing and health variables
const slashRange = 70; // Extended range for slashing, so it doesn't interfere with collision
const collisionRange = 30; // Shorter range for health reduction on direct collision

// Key handling for movement and slashing
window.addEventListener("keydown", function (e) {
    if (!isGameOver) { // Disable controls if game is over
        keys[e.key] = true;
        if ((e.key === 'e' || e.key === 'E') && !player.isSlashing) {
            executeSlash(); // Trigger slashing on "E" key press
        }
    }
});

window.addEventListener("keyup", function (e) {
    if (!isGameOver) { // Disable controls if game is over
        delete keys[e.key];
        if (e.key === 'e' || e.key === 'E') {
            // Exit slashing state when "E" key is released
            player.isSlashing = false;
            player.currentAnimation = 'idle';
        } else if (!player.isSlashing) {
            player.moving = false;
        }
    }
});

// BACKGROUND IMAGE
const background = new Image();
background.src = "./GameImages/gamebackground.png";

// Ensure all images are loaded before starting game
let imagesLoaded = 0;
const totalImages = 3;

function checkImagesLoaded() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        animate();
    }
}

characterSprite.onload = checkImagesLoaded;
enemySprite.onload = checkImagesLoaded;
background.onload = checkImagesLoaded;

// PLAYER FRAME HANDLING FUNCTION
let playerFrameCounter = 0;
const playerFrameRate = 10;

function handlePlayerFrame() {
    playerFrameCounter++;
    if (playerFrameCounter >= playerFrameRate) {
        player.frameX++;
        const currentAnim = animationFrames.player[player.currentAnimation];
        if (player.frameX >= currentAnim[player.direction].totalFrames) {
            player.frameX = 0;
        }
        playerFrameCounter = 0;
    }
}

// ENEMY FRAME HANDLING FUNCTION
let enemyFrameCounter = 0;
const enemyFrameRate = 10;

function handleEnemyFrame() {
    enemyFrameCounter++;
    if (enemyFrameCounter >= enemyFrameRate) {
        enemy.frameX++;
        if (enemy.frameX >= animationFrames.enemy.walk[enemy.direction].totalFrames) {
            enemy.frameX = 0;
        }
        enemyFrameCounter = 0;
    }
}

// Function to draw player hearts/health on the screen
function drawHearts() {
    const heartWidth = 40, heartHeight = 40, margin = 10;
    for (let i = 0; i < playerHealth; i++) {
        ctx.drawImage(heartImage, 20 + (i * (heartWidth + margin)), 20, heartWidth, heartHeight);
    }
}

// Function to draw the score and username
function drawScoreAndUsername() {
    ctx.font = "24px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(`Score: ${score}`, canvas.width - 120, 40); // Display score in upper right corner
    ctx.fillText(`Player: ${username}`, canvas.width / 2 - 60, 40); // Display username in the center
}

// Function to execute the slashing mechanic
function executeSlash() {
    player.isSlashing = true;
    player.currentAnimation = 'slash';
    player.frameX = 0;

    // Check for enemy within slashing range
    if (detectSlashCollision() && enemy.alive) {
        killEnemy();  // Kill the enemy if in range
    }
}

// Function to detect collision between player and enemy for health reduction
function detectPlayerEnemyCollision() {
    const playerRight = player.x + player.width;
    const playerBottom = player.y + player.height;
    const enemyRight = enemy.x + enemy.width;
    const enemyBottom = enemy.y + enemy.height;

    return (
        player.x < enemyRight + collisionRange &&
        playerRight + collisionRange > enemy.x &&
        player.y < enemyBottom + collisionRange &&
        playerBottom + collisionRange > enemy.y
    );
}

// Function to detect if enemy is within slashing range
function detectSlashCollision() {
    const playerRight = player.x + player.width;
    const playerBottom = player.y + player.height;
    const enemyRight = enemy.x + enemy.width;
    const enemyBottom = enemy.y + enemy.height;

    return (
        player.x < enemyRight + slashRange &&
        playerRight + slashRange > enemy.x &&
        player.y < enemyBottom + slashRange &&
        playerBottom + slashRange > enemy.y
    );
}

// Function to handle enemy death and increase score
function killEnemy() {
    enemy.alive = false;
    score += 10; // Increase score by 10 points for each kill

    // Increase enemy speed by 1 for every 20 points scored
    enemy.speed = 3 + Math.floor(score / 50);

    // Save score to localStorage associated with the username
    const scores = JSON.parse(localStorage.getItem("scores")) || {};
    scores[username] = score;
    localStorage.setItem("scores", JSON.stringify(scores));

    enemy.x = -100; // Move enemy off-canvas
    enemy.y = -100;

    setTimeout(spawnEnemy, 500); // Spawn a new enemy after a brief delay
}

// Function to check for player health reduction on direct collision
function checkHealthOnCollision() {
    if (detectPlayerEnemyCollision() && enemy.alive) {
        playerHealth--; // Reduce health on direct collision
        console.log("Player health reduced:", playerHealth);

        if (playerHealth <= 0) {
            console.log("Game Over");
            handleGameOver();
        }

        // Respawn enemy after health collision
        enemy.alive = false;
        spawnEnemy();
    }
}



// Function to handle game-over, display game-over screen, and manage score update
function handleGameOver() {
    isGameOver = true; // Disable controls

    // Update the top score in localStorage if current score is higher
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(user => user.username === username);

    if (user) {
        const previousTopScore = user.topScore || 0;
        if (score > previousTopScore) {
            user.topScore = score; // Update the user's top score
            console.log(`Updating top score for ${username}. Previous: ${previousTopScore}, New: ${score}`);
            localStorage.setItem("users", JSON.stringify(users)); // Save updated users back to localStorage
        } else {
            console.log(`Top score remains the same for ${username}. Current: ${previousTopScore}, New: ${score}`);
        }
    } else {
        console.warn("User not found. Cannot update score.");
    }

    // Draw game over screen centered
    const gameOverWidth = 1000;
    const gameOverHeight = 800;
    ctx.drawImage(gameOverImage, canvas.width / 2 - gameOverWidth / 2, canvas.height / 2 - gameOverHeight / 2, gameOverWidth, gameOverHeight); // Centering the game over image

    // Draw try again button centered just below the game over screen
    const tryAgainWidth = 400; // Width of the button
    const tryAgainHeight = 300; // Height of the button
    const tryAgainX = canvas.width / 2 - tryAgainWidth / 2;
    const tryAgainY = (canvas.height / 2 + (gameOverHeight / 2) - 250);

    ctx.drawImage(tryAgainButtonImage, tryAgainX, tryAgainY, tryAgainWidth, tryAgainHeight); // Centering the try again button

    // Add click event for "Try Again" button
    canvas.addEventListener("click", handleTryAgain);
}



// Function to restart the game on "Try Again"
function handleTryAgain(event) {
    const clickX = event.clientX;
    const clickY = event.clientY;

    // Check if "Try Again" button was clicked
    const tryAgainWidth = 400; // Width of the button
    const tryAgainHeight = 300; // Height of the button
    const tryAgainX = canvas.width / 2 - tryAgainWidth / 2;
    const tryAgainY = (canvas.height / 2 + (800 / 2) - 250); 

    if (
        clickX >= tryAgainX &&
        clickX <= tryAgainX + tryAgainWidth &&
        clickY >= tryAgainY &&
        clickY <= tryAgainY + tryAgainHeight
    ) {
        // Reload the page to reset the game completely
        location.reload();
    }
}


// Function to render the player
function drawPlayer() {
    const currentAnim = animationFrames.player[player.currentAnimation];
    let frameY = currentAnim[player.direction]?.frameY || 0;

    ctx.drawImage(
        characterSprite,
        player.width * player.frameX, frameY * player.height,
        player.width, player.height,
        player.x, player.y,
        150, 180
    );

    if (player.isSlashing) {
        player.frameX++;
        if (player.frameX >= currentAnim.totalFrames) {
            player.frameX = 0;
        }
    }
}

// Function to render the enemy
function drawEnemy() {
    if (enemy.alive) {
        const frameY = animationFrames.enemy.walk[enemy.direction].frameY;
        ctx.drawImage(
            enemySprite,
            enemy.width * enemy.frameX, frameY * enemy.height,
            enemy.width, enemy.height,
            enemy.x, enemy.y,
            150, 180
        );
    }
}

// PLAYER MOVEMENT FUNCTION
function movePlayer() {
    if (player.isSlashing || isGameOver) return; // Stop movement during slashing or game over
    player.moving = false;

    if (keys["ArrowUp"] && player.y > 0) {
        player.y -= player.speed;
        player.direction = 'up';
        player.moving = true;
    }
    if (keys["ArrowDown"] && player.y < canvas.height - player.height) {
        player.y += player.speed;
        player.direction = 'down';
        player.moving = true;
    }
    if (keys["ArrowLeft"] && player.x > 0) {
        player.x -= player.speed;
        player.direction = 'left';
        player.moving = true;
    }
    if (keys["ArrowRight"] && player.x < canvas.width - player.width) {
        player.x += player.speed;
        player.direction = 'right';
        player.moving = true;
    }

    player.currentAnimation = player.moving ? 'run' : 'idle';
    handlePlayerFrame();
}

// ENEMY MOVEMENT FUNCTION
function moveEnemy() {
    if (enemy.alive && !isGameOver) {
        switch (enemy.direction) {
            case 'right': enemy.x += enemy.speed; break;
            case 'left': enemy.x -= enemy.speed; break;
            case 'down': enemy.y += enemy.speed; break;
            case 'up': enemy.y -= enemy.speed; break;
        }

        handleEnemyFrame();

        if (
            enemy.x > canvas.width || enemy.x < -enemy.width ||
            enemy.y > canvas.height || enemy.y < -enemy.height
        ) {
            enemy.alive = false;
            spawnEnemy();
        }
    }
}

// SPAWN ENEMY FUNCTION
function spawnEnemy() {
    // Reset enemy position and status to make it alive again
    const spawnEdge = Math.floor(Math.random() * 4);

    switch (spawnEdge) {
        case 0: enemy.x = -enemy.width; enemy.y = Math.random() * (canvas.height - enemy.height); enemy.direction = 'right'; break;
        case 1: enemy.x = canvas.width; enemy.y = Math.random() * (canvas.height - enemy.height); enemy.direction = 'left'; break;
        case 2: enemy.x = Math.random() * (canvas.width - enemy.width); enemy.y = -enemy.height; enemy.direction = 'down'; break;
        case 3: enemy.x = Math.random() * (canvas.width - enemy.width); enemy.y = canvas.height; enemy.direction = 'up'; break;
    }

    enemy.alive = true;  // Set enemy to alive
    enemy.frameX = 0;    // Reset frame for new enemy
}

//CARROT POWERUP
let carrot = {
    x: 0,
    y: 0,
    width: 50,
    height: 50,
    isActive: false
};

let isImmune = false; // Flag to track immunity duration
const immunityDuration = 5000; // 5 seconds in milliseconds

// FUNCTION TO SPAWN CARROT RANDOMLY
function spawnCarrot() {
    if (!carrot.isActive) { // Only spawn if the carrot is not active
        // Set the position of the carrot randomly within the canvas
        carrot.x = Math.random() * (canvas.width - carrot.width);
        carrot.y = Math.random() * (canvas.height - carrot.height);
        carrot.isActive = true; // Set the carrot as active
        console.log("A carrot has spawned at:", carrot.x, carrot.y);
    }
}

// FUNCTION TO DRAW CARROT
function drawCarrot() {
    if (carrot.isActive) {
        ctx.drawImage(carrotImage, carrot.x, carrot.y, carrot.width, carrot.height);
    }
}

// CARROT COLLISION WITH PLAYER
function checkCarrotCollision() {
    const playerRight = player.x + player.width;
    const playerBottom = player.y + player.height;
    const carrotRight = carrot.x + carrot.width;
    const carrotBottom = carrot.y + carrot.height;

    // Check if player collides with the carrot
    if (carrot.isActive && // Ensure the carrot is active before checking collision
        player.x < carrotRight &&
        playerRight > carrot.x &&
        player.y < carrotBottom &&
        playerBottom > carrot.y
    ) {
        // Carrot collected
        score += 30; // Increase score by 30
        console.log("Carrot collected! Score:", score);
        carrot.isActive = false; // Deactivate carrot

        // Set immunity for 5 seconds
        isImmune = true;
        console.log("Player is immune to enemy collisions for 5 seconds!");

        // Set a timeout to remove immunity after 5 seconds
        setTimeout(() => {
            isImmune = false;
            console.log("Player is no longer immune to enemy collisions.");
        }, immunityDuration);
    }
}

// ENEMY COLLISION CHECK
function checkEnemyCollision() {
    if (isImmune) return; // Exit if player is immune

    const playerRight = player.x + player.width;
    const playerBottom = player.y + player.height;

    const enemyRight = enemy.x + enemy.width;
    const enemyBottom = enemy.y + enemy.height;

    if (
        player.x < enemyRight &&
        playerRight > enemy.x &&
        player.y < enemyBottom &&
        playerBottom > enemy.y
    ) {
        playerHealth--; // Reduce health
        console.log("Enemy collision! Life remaining:", playerHealth);
        // You can call respawn enemy logic here if needed
    }
}


// MAIN ANIMATION FUNCTION
function animate() {
    if (isGameOver) {
        handleGameOver(); // Display game over screen
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    movePlayer();
    drawPlayer();

    if (enemy.alive) {
        moveEnemy();
        drawEnemy();
    }

    drawHearts();
    drawScoreAndUsername();
    checkHealthOnCollision();

    // Check for carrot collision and draw the carrot
    checkCarrotCollision(); // Check if player collects the carrot
    drawCarrot(); // Draw the carrot on the canvas

    checkEnemyCollision(); // Check if player collides with enemy

    requestAnimationFrame(animate);
}

// Set an initial timeout to spawn the first carrot after 10 seconds
setTimeout(() => {
    spawnCarrot(); // Spawn the first carrot after 10 seconds
    // Set an interval for spawning carrots every 10 seconds thereafter
    setInterval(spawnCarrot, 10000); // Spawn every 10 seconds
}, 10000);

// ENEMY ROAR AUDIO
function play() {
    var audio = new Audio('https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3');
    audio.play();
}

// BACKGROUND MUSIC
const backgroundMusic = document.getElementById('background-music');

// Play the music when the game starts
function playBackgroundMusic() {
    backgroundMusic.volume = 0.5; // Set volume to 50%
    backgroundMusic.play().catch(error => {
        console.error("Error playing audio:", error); // Log any errors
    });
}

// Starting the game by spawning enemy
spawnEnemy();
play();
playBackgroundMusic();
