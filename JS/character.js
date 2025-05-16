// character.js

export const animationFrames = {
    player: {
        run: {
            up: { frameY: 34, totalFrames: 8 },
            down: { frameY: 36, totalFrames: 8 },
            left: { frameY: 35, totalFrames: 8 },
            right: { frameY: 37, totalFrames: 8 },
        },
        idle: {
            up: { frameY: 22, totalFrames: 2 },
            down: { frameY: 24, totalFrames: 2 },
            left: { frameY: 23, totalFrames: 2 },
            right: { frameY: 25, totalFrames: 2 },
        },
        slash: {
            up: { frameY: 12, totalFrames: 6 },
            down: { frameY: 14, totalFrames: 6 },
            left: { frameY: 13, totalFrames: 6 },
            right: { frameY: 15, totalFrames: 6 },
        },
    },
    enemy: { 
        walk: {
            up: { frameY: 8, totalFrames: 8 },
            down: { frameY: 10, totalFrames: 8 },
            left: { frameY: 9, totalFrames: 8 },
            right: { frameY: 11, totalFrames: 8 },
        } 
    }
};

// Export other game objects (player, enemy) as well
export const player = {
    x: 200,
    y: 300,
    width: 64,
    height: 64,
    frameX: 0,
    speed: 7,
    moving: false,
    currentAnimation: 'idle',
    direction: 'down',
    isSlashing: false,
};

export const enemy = {
    x: 1536,
    y: 300,
    width: 64,
    height: 64,
    frameX: 0,
    speed: 3,
    moving: true,
    alive: true,
    direction: 'left',
};

export const characterSprite = new Image();
characterSprite.src = "./GameImages/character.png";

export const enemySprite = new Image();
enemySprite.src = "./GameImages/enemy.png";
