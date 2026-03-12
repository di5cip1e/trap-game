/**
 * TRAP Animated Sprite Generator
 * 
 * Generates placeholder animated sprites using HTML5 Canvas.
 * Creates silhouette-based sprites that can be replaced with proper pixel art later.
 * 
 * Usage: node generate-animated.js
 * 
 * Art Direction: Mirren
 * 2D/3D Modeling: Prism
 */

const fs = require('fs');
const path = require('path');

// Ensure output directory exists
const OUTPUT_DIR = path.join(__dirname, 'sprites');
const PLAYER_DIR = path.join(OUTPUT_DIR, 'player');
const NPC_DIR = path.join(OUTPUT_DIR, 'npcs');
const OBJ_DIR = path.join(OUTPUT_DIR, 'objects');

function ensureDirectories() {
    [OUTPUT_DIR, PLAYER_DIR, NPC_DIR, OBJ_DIR].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
                    }
    });
}

// Color palette from VISION.md
const COLORS = {
    // Primary
    asphaltBlack: '#0a0a0a',
    stormGray: '#2d2d2d',
    burntOrange: '#8b4513',
    neonAmber: '#ffaa00',
    neonTeal: '#00ffcc',
    // Secondary
    dangerRed: '#cc2222',
    graffitiPink: '#ff00aa',
    moldGreen: '#334433',
    steelBlue: '#334455',
    // Skin tones
    skinLight: '#e8c4a0',
    skinMedium: '#d4a574',
    skinDark: '#a67c52',
    // Character colors
    player: '#1a1a1a',
    police: '#1a2a4a',
    corruptCop: '#334455',
    rival: '#222222',
    buyer: '#4a4a4a',
    vendor: '#2d5a2d',
    shopOwner: '#2a2a3a',
    // Object colors
    cardboard: '#a08060',
    metal: '#4a4a5a',
    wood: '#3a2a1a'
};

/**
 * Creates a canvas with the given dimensions
 */
function createCanvas(width, height) {
    // We'll generate raw PNG data
    // For a simple implementation, we'll create a basic sprite structure
    return {
        width,
        height,
        pixels: Buffer.alloc(width * height * 4) // RGBA
    };
}

/**
 * Sets a pixel to a specific color
 */
function setPixel(canvas, x, y, color) {
    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return;
    
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    const idx = (y * canvas.width + x) * 4;
    canvas.pixels[idx] = r;
    canvas.pixels[idx + 1] = g;
    canvas.pixels[idx + 2] = b;
    canvas.pixels[idx + 3] = 255; // Alpha
}

/**
 * Fills a rectangle on the canvas
 */
function fillRect(canvas, x, y, w, h, color) {
    for (let dy = 0; dy < h; dy++) {
        for (let dx = 0; dx < w; dx++) {
            setPixel(canvas, x + dx, y + dy, color);
        }
    }
}

/**
 * Draws a simple humanoid silhouette
 */
function drawHumanoid(canvas, x, y, color, frame = 0, direction = 'down', isWalking = false) {
    const bobOffset = isWalking ? Math.sin(frame * Math.PI / 4) * 2 : 0;
    
    // Head (circle-ish)
    const headSize = 8;
    for (let dy = -headSize; dy <= headSize; dy++) {
        for (let dx = -headSize; dx <= headSize; dx++) {
            if (dx * dx + dy * dy <= headSize * headSize) {
                setPixel(canvas, x + dx, y + dy + bobOffset, color);
            }
        }
    }
    
    // Body (rectangle)
    const bodyWidth = 10;
    const bodyHeight = 14;
    const bodyY = y + headSize + 2 + bobOffset;
    fillRect(canvas, x - bodyWidth/2, bodyY, bodyWidth, bodyHeight, color);
    
    // Legs (two rectangles, animate based on walk frame)
    const legWidth = 4;
    const legHeight = 10;
    const legY = bodyY + bodyHeight;
    
    if (isWalking) {
        // Walking animation - alternate legs
        const leftLegOffset = Math.sin(frame * Math.PI / 2) * 3;
        const rightLegOffset = Math.cos(frame * Math.PI / 2) * 3;
        
        fillRect(canvas, x - 5 + leftLegOffset, legY, legWidth, legHeight, color);
        fillRect(canvas, x + 1 + rightLegOffset, legY, legWidth, legHeight, color);
    } else {
        // Standing
        fillRect(canvas, x - 5, legY, legWidth, legHeight, color);
        fillRect(canvas, x + 1, legY, legWidth, legHeight, color);
    }
    
    // Arms (simple rectangles)
    const armWidth = 3;
    const armHeight = 10;
    const armY = bodyY + 2;
    
    if (isWalking) {
        const armSwing = Math.sin(frame * Math.PI / 2) * 4;
        fillRect(canvas, x - bodyWidth/2 - armWidth - 2, armY + armSwing, armWidth, armHeight, color);
        fillRect(canvas, x + bodyWidth/2 + 2, armY - armSwing, armWidth, armHeight, color);
    } else {
        fillRect(canvas, x - bodyWidth/2 - armWidth - 2, armY, armWidth, armHeight, color);
        fillRect(canvas, x + bodyWidth/2 + 2, armY, armWidth, armHeight, color);
    }
    
    // Shadow beneath feet
    const shadowColor = '#00000088';
    for (let dx = -8; dx <= 8; dx++) {
        for (let dy = 0; dy < 3; dy++) {
            const alpha = 1 - Math.abs(dx) / 8;
            if (alpha > 0) {
                const shadowX = x + dx;
                const shadowY = y + 28 + dy;
                setPixel(canvas, shadowX, shadowY, shadowColor);
            }
        }
    }
}

/**
 * Draws a battle pose sprite (side view)
 */
function drawBattlePose(canvas, x, y, color, pose = 'idle', frame = 0) {
    const frameOffset = frame * 2;
    
    switch (pose) {
        case 'idle':
            // Standing stance, slight breathing
            const breathe = Math.sin(frame * Math.PI / 2) * 2;
            // Body
            fillRect(canvas, x + 10, y + 8 + breathe, 14, 20, color);
            // Head
            for (let dy = -6; dy <= 6; dy++) {
                for (let dx = -6; dx <= 6; dx++) {
                    if (dx * dx + dy * dy <= 36) {
                        setPixel(canvas, x + 17 + dx, y + 4 + dy, COLORS.skinMedium);
                    }
                }
            }
            // Arms down
            fillRect(canvas, x + 4, y + 10 + breathe, 6, 14, color);
            fillRect(canvas, x + 24, y + 10 + breathe, 6, 14, color);
            // Legs
            fillRect(canvas, x + 8, y + 28, 6, 14, color);
            fillRect(canvas, x + 20, y + 28, 6, 14, color);
            break;
            
        case 'attack':
            // Punching motion
            const punchExtend = frame < 2 ? frame * 8 : (4 - frame) * 4;
            // Body
            fillRect(canvas, x + 12, y + 8, 12, 20, color);
            // Head
            for (let dy = -6; dy <= 6; dy++) {
                for (let dx = -6; dx <= 6; dx++) {
                    if (dx * dx + dy * dy <= 36) {
                        setPixel(canvas, x + 18 + dx, y + 4 + dy, COLORS.skinMedium);
                    }
                }
            }
            // Back arm
            fillRect(canvas, x + 2, y + 12, 8, 6, color);
            // Punching arm
            fillRect(canvas, x + 20, y + 12, 8 + punchExtend, 6, color);
            // Legs (lunging)
            fillRect(canvas, x + 6, y + 28, 8, 12, color);
            fillRect(canvas, x + 18, y + 26, 8, 14, color);
            break;
            
        case 'defend':
            // Arms up, crouching
            // Body (crouched)
            fillRect(canvas, x + 10, y + 14, 14, 16, color);
            // Head
            for (let dy = -6; dy <= 6; dy++) {
                for (let dx = -6; dx <= 6; dx++) {
                    if (dx * dx + dy * dy <= 36) {
                        setPixel(canvas, x + 17 + dx, y + 8 + dy, COLORS.skinMedium);
                    }
                }
            }
            // Arms up blocking
            fillRect(canvas, x + 4, y + 4, 6, 16, color);
            fillRect(canvas, x + 24, y + 4, 6, 16, color);
            // Legs (bent)
            fillRect(canvas, x + 6, y + 30, 6, 10, color);
            fillRect(canvas, x + 20, y + 30, 6, 10, color);
            break;
            
        case 'hurt':
            // Recoil backward
            const recoil = frame < 2 ? frame * 6 : (4 - frame) * 3;
            // Body (leaning back)
            fillRect(canvas, x + 8 - recoil, y + 10, 14, 18, color);
            // Head
            for (let dy = -6; dy <= 6; dy++) {
                for (let dx = -6; dx <= 6; dx++) {
                    if (dx * dx + dy * dy <= 36) {
                        setPixel(canvas, x + 15 - recoil + dx, y + 4 + dy, COLORS.dangerRed);
                    }
                }
            }
            // Arms (flailing)
            fillRect(canvas, x - recoil, y + 8, 10, 4, color);
            fillRect(canvas, x + 20 - recoil, y + 6, 10, 4, color);
            // Legs
            fillRect(canvas, x + 6, y + 28, 6, 12, color);
            fillRect(canvas, x + 18, y + 28, 6, 12, color);
            break;
            
        case 'dead':
            // Lying on ground
            // Body (horizontal)
            fillRect(canvas, x + 4, y + 20, 30, 10, color);
            // Head
            for (let dy = -5; dy <= 5; dy++) {
                for (let dx = -5; dx <= 5; dx++) {
                    if (dx * dx + dy * dy <= 25) {
                        setPixel(canvas, x + 6 + dx, y + 18 + dy, COLORS.skinDark);
                    }
                }
            }
            // X eyes
            setPixel(canvas, x + 4, y + 18, '#000000');
            setPixel(canvas, x + 5, y + 17, '#000000');
            setPixel(canvas, x + 6, y + 18, '#000000');
            setPixel(canvas, x + 5, y + 19, '#000000');
            setPixel(canvas, x + 8, y + 18, '#000000');
            setPixel(canvas, x + 9, y + 17, '#000000');
            setPixel(canvas, x + 10, y + 18, '#000000');
            setPixel(canvas, x + 9, y + 19, '#000000');
            // Arms (on ground)
            fillRect(canvas, x + 10, y + 28, 14, 4, color);
            // Legs
            fillRect(canvas, x + 30, y + 20, 6, 8, color);
            break;
    }
}

/**
 * Draws a portrait (face expression)
 */
function drawPortrait(canvas, x, y, expression = 'neutral') {
    const size = 48; // Face radius
    const centerX = x + 64;
    const centerY = y + 64;
    
    // Face (circle)
    for (let dy = -size; dy <= size; dy++) {
        for (let dx = -size; dx <= size; dx++) {
            if (dx * dx + dy * dy <= size * size) {
                setPixel(canvas, centerX + dx, centerY + dy, COLORS.skinMedium);
            }
        }
    }
    
    // Hair/hood (darker frame around face)
    for (let dy = -size - 4; dy <= size + 4; dy++) {
        for (let dx = -size - 4; dx <= size + 4; dx++) {
            const dist = dx * dx + dy * dy;
            if (dist <= (size + 4) * (size + 4) && dist > size * size) {
                setPixel(canvas, centerX + dx, centerY + dy, '#1a1a1a');
            }
        }
    }
    
    // Eyes and expression
    switch (expression) {
        case 'happy':
            // Happy eyes (slightly closed arcs) and smile
            // Eyes
            fillRect(canvas, centerX - 16, centerY - 8, 8, 3, '#222222');
            fillRect(canvas, centerX + 8, centerY - 8, 8, 3, '#222222');
            // Smile
            for (let i = 0; i < 12; i++) {
                const smileY = centerY + 12 + Math.sin(i * Math.PI / 6) * 4;
                setPixel(canvas, centerX - 6 + i, Math.floor(smileY), '#222222');
            }
            break;
            
        case 'neutral':
            // Neutral expression
            // Eyes
            fillRect(canvas, centerX - 18, centerY - 6, 10, 4, '#222222');
            fillRect(canvas, centerX + 8, centerY - 6, 10, 4, '#222222');
            // Eyebrows (slight)
            fillRect(canvas, centerX - 20, centerY - 14, 12, 2, '#3a3a3a');
            fillRect(canvas, centerX + 8, centerY - 14, 12, 2, '#3a3a3a');
            // Mouth (straight line)
            fillRect(canvas, centerX - 8, centerY + 16, 16, 3, '#444444');
            break;
            
        case 'angry':
            // Angry expression
            // Eyes (narrowed)
            fillRect(canvas, centerX - 18, centerY - 4, 10, 4, '#220000');
            fillRect(canvas, centerX + 8, centerY - 4, 10, 4, '#220000');
            // Eyebrows (furrowed)
            fillRect(canvas, centerX - 22, centerY - 12, 14, 4, '#1a1a1a');
            fillRect(canvas, centerX + 8, centerY - 12, 14, 4, '#1a1a1a');
            // Mouth (grimace)
            fillRect(canvas, centerX - 8, centerY + 18, 16, 4, '#330000');
            // Red tint
            for (let dy = -size; dy <= size; dy++) {
                for (let dx = -size; dx <= size; dx++) {
                    if (dx * dx + dy * dy <= size * size) {
                        const idx = ((centerY + dy) * canvas.width + (centerX + dx)) * 4;
                        canvas.pixels[idx] = Math.min(255, canvas.pixels[idx] + 30);
                    }
                }
            }
            break;
            
        case 'hurt':
            // Hurt/injured expression
            // One eye squinted
            fillRect(canvas, centerX - 18, centerY - 6, 10, 4, '#220000');
            fillRect(canvas, centerX + 6, centerY - 8, 4, 6, '#220000');
            // Blood/rash
            for (let i = 0; i < 8; i++) {
                setPixel(canvas, centerX + 20 + (i % 3), centerY + 10 + Math.floor(i / 3), COLORS.dangerRed);
            }
            // Mouth (wince)
            fillRect(canvas, centerX - 6, centerY + 16, 4, 4, '#330000');
            fillRect(canvas, centerX + 6, centerY + 16, 4, 4, '#330000');
            break;
            
        case 'dead':
            // Dead/knocked out
            // X eyes
            for (let i = -2; i <= 2; i++) {
                setPixel(canvas, centerX - 14 + i, centerY - 6 + i, '#000000');
                setPixel(canvas, centerX - 14 + i, centerY - 6 - i, '#000000');
                setPixel(canvas, centerX + 10 + i, centerY - 6 + i, '#000000');
                setPixel(canvas, centerX + 10 + i, centerY - 6 - i, '#000000');
            }
            // Mouth (open)
            fillRect(canvas, centerX - 6, centerY + 14, 12, 6, '#220000');
            // Pale tint
            for (let dy = -size; dy <= size; dy++) {
                for (let dx = -size; dx <= size; dx++) {
                    if (dx * dx + dy * dy <= size * size) {
                        const idx = ((centerY + dy) * canvas.width + (centerX + dx)) * 4;
                        canvas.pixels[idx] = Math.min(255, canvas.pixels[idx] + 40);
                        canvas.pixels[idx + 1] = Math.min(255, canvas.pixels[idx + 1] + 30);
                    }
                }
            }
            break;
    }
}

/**
 * Saves canvas as PNG using simple format (for placeholder)
 * Note: This creates a minimal valid PNG
 */
function savePNG(canvas, filepath) {
    // For a proper implementation, we'd use a PNG encoder
    // For now, we'll create a simple placeholder message
    // In production, use 'pngjs' or 'canvas' package
    
        
    // Create a simple PPM file as placeholder (easier to generate)
    const ppmPath = filepath.replace('.png', '.ppm');
    const header = `P6\n${canvas.width} ${canvas.height}\n255\n`;
    const headerBuffer = Buffer.from(header, 'ascii');
    
    // Convert RGBA to RGB
    const rgbData = Buffer.alloc(canvas.width * canvas.height * 3);
    for (let i = 0; i < canvas.width * canvas.height; i++) {
        rgbData[i * 3] = canvas.pixels[i * 4];
        rgbData[i * 3 + 1] = canvas.pixels[i * 4 + 1];
        rgbData[i * 3 + 2] = canvas.pixels[i * 4 + 2];
    }
    
    const ppmData = Buffer.concat([headerBuffer, rgbData]);
    fs.writeFileSync(ppmPath, ppmData);
    }

/**
 * Draws cardboard box (animated states)
 */
function drawCardboardBox(canvas, x, y, state = 'idle', frame = 0) {
    const boxColor = COLORS.cardboard;
    const darkBox = '#806040';
    const tapeColor = '#c0a080';
    
    switch (state) {
        case 'idle':
        default:
            // Box body
            fillRect(canvas, x + 8, y + 12, 32, 28, boxColor);
            // Top flaps
            fillRect(canvas, x + 6, y + 8, 12, 8, boxColor);
            fillRect(canvas, x + 30, y + 8, 12, 8, boxColor);
            // Tape
            fillRect(canvas, x + 20, y + 8, 8, 32, tapeColor);
            // Shadow
            fillRect(canvas, x + 6, y + 40, 36, 4, '#00000044');
            break;
            
        case 'damaged':
            // Crushed box
            fillRect(canvas, x + 8, y + 18, 30, 20, boxColor);
            // Bent flaps
            fillRect(canvas, x + 4, y + 14, 10, 6, darkBox);
            fillRect(canvas, x + 34, y + 12, 10, 8, darkBox);
            // Tape (broken)
            fillRect(canvas, x + 20, y + 14, 6, 16, tapeColor);
            // Dents
            fillRect(canvas, x + 12, y + 20, 6, 4, darkBox);
            fillRect(canvas, x + 28, y + 26, 8, 6, darkBox);
            // Shadow
            fillRect(canvas, x + 4, y + 38, 40, 4, '#00000044');
            break;
            
        case 'destroyed':
            // Flattened
            fillRect(canvas, x + 4, y + 30, 40, 10, boxColor);
            // Scattered pieces
            fillRect(canvas, x + 2, y + 28, 8, 4, darkBox);
            fillRect(canvas, x + 38, y + 26, 6, 6, darkBox);
            // Contents visible
            fillRect(canvas, x + 12, y + 32, 12, 6, '#1a1a1a');
            fillRect(canvas, x + 26, y + 30, 10, 8, '#1a1a1a');
            // Shadow
            fillRect(canvas, x + 2, y + 40, 44, 4, '#00000044');
            break;
    }
}

/**
 * Draws storage unit (animated door)
 */
function drawStorageUnit(canvas, x, y, state = 'closed', frame = 0) {
    const doorColor = COLORS.metal;
    const doorDark = '#3a3a4a';
    const frameColor = '#2a2a2a';
    const lockColor = '#8b7355';
    
    // Frame
    fillRect(canvas, x, y, 64, 64, frameColor);
    
    // Door opening (dark interior)
    fillRect(canvas, x + 4, y + 4, 56, 56, '#0a0a0a');
    
    switch (state) {
        case 'closed':
        default:
            // Roll-up door (closed)
            for (let i = 0; i < 14; i++) {
                fillRect(canvas, x + 4, y + 4 + i * 4, 56, 3, i % 2 === 0 ? doorColor : doorDark);
            }
            // Lock
            fillRect(canvas, x + 28, y + 36, 8, 12, lockColor);
            fillRect(canvas, x + 26, y + 40, 12, 4, '#6a5030');
            break;
            
        case 'opening':
            // Door rolling up (partial)
            const doorHeight = frame * 7; // 0 to 42
            for (let i = 0; i < 14 - frame; i++) {
                const doorY = y + 4 + i * 4;
                if (doorY < y + 4 + doorHeight) {
                    fillRect(canvas, x + 4, doorY, 56, 3, i % 2 === 0 ? doorColor : doorDark);
                }
            }
            // Lock (still visible at bottom until fully open)
            if (doorHeight < 40) {
                fillRect(canvas, x + 28, y + 36, 8, 12, lockColor);
            }
            break;
            
        case 'open':
            // Door fully up (visible at top)
            for (let i = 0; i < 3; i++) {
                fillRect(canvas, x + 4, y + 4 + i * 4, 56, 3, i % 2 === 0 ? doorColor : doorDark);
            }
            // Interior darkness
            // Nothing to add - already black
            break;
            
        case 'closing':
            // Door rolling down (partial)
            const closeProgress = frame;
            const doorTop = closeProgress * 7;
            for (let i = 0; i < 14; i++) {
                const doorY = y + 4 + i * 4;
                if (doorY >= doorTop) {
                    fillRect(canvas, x + 4, doorY, 56, 3, i % 2 === 0 ? doorColor : doorDark);
                }
            }
            // Lock appears as door comes down
            if (doorTop < 40) {
                fillRect(canvas, x + 28, y + 36, 8, 12, lockColor);
            }
            break;
    }
}

/**
 * Draws workstation (animated)
 */
function drawWorkstation(canvas, x, y, state = 'idle', frame = 0) {
    const tableColor = COLORS.wood;
    const scaleColor = '#666666';
    const bagColor = '#1a1a1a';
    const ledColor = frame % 2 === 0 ? '#ff0000' : '#00ff00';
    
    // Table
    fillRect(canvas, x + 4, y + 24, 56, 20, tableColor);
    fillRect(canvas, x + 2, y + 20, 4, 24, '#2a1a0a');
    fillRect(canvas, x + 58, y + 20, 4, 24, '#2a1a0a');
    
    switch (state) {
        case 'idle':
        default:
            // Scale
            fillRect(canvas, x + 12, y + 16, 16, 10, scaleColor);
            fillRect(canvas, x + 14, y + 12, 12, 4, scaleColor);
            // Bags
            fillRect(canvas, x + 34, y + 10, 20, 14, bagColor);
            // Burner phone
            fillRect(canvas, x + 8, y + 20, 8, 4, '#333333');
            // LED (off)
            setPixel(canvas, x + 58, y + 26, '#333333');
            break;
            
        case 'working':
            // Working animation
            const workingOffset = Math.sin(frame * Math.PI / 2) * 2;
            
            // Scale (slightly moving)
            fillRect(canvas, x + 12, y + 16 + workingOffset, 16, 10, scaleColor);
            fillRect(canvas, x + 14, y + 12 + workingOffset, 12, 4, scaleColor);
            // Bags
            fillRect(canvas, x + 34, y + 10, 20, 14, bagColor);
            // Hands (simplified as blur)
            fillRect(canvas, x + 16 + workingOffset, y + 14 + workingOffset, 8, 8, COLORS.skinDark);
            // Burner phone
            fillRect(canvas, x + 8, y + 20, 8, 4, '#333333');
            // LED (green when working)
            setPixel(canvas, x + 58, y + 26, '#00ff00');
            break;
            
        case 'alert':
            // Phone ringing, LED flashing
            const ringOffset = frame % 2 === 0 ? 2 : 0;
            
            // Scale
            fillRect(canvas, x + 12, y + 16, 16, 10, scaleColor);
            fillRect(canvas, x + 14, y + 12, 12, 4, scaleColor);
            // Bags
            fillRect(canvas, x + 34, y + 10, 20, 14, bagColor);
            // Phone (vibrating)
            fillRect(canvas, x + 6 + ringOffset, y + 20, 8, 4, '#333333');
            // LED (flashing red)
            setPixel(canvas, x + 58, y + 26, ledColor);
            // Vibration lines
            if (frame % 2 === 0) {
                setPixel(canvas, x + 4, y + 22, '#ff0000');
                setPixel(canvas, x + 16, y + 22, '#ff0000');
            }
            break;
    }
}

// ============================================
// GENERATION FUNCTIONS
// ============================================

function generatePlayerSprites() {
        
    // Player Walking (4 directions × 8 frames)
    const walkFrames = 8;
    const directions = ['down', 'up', 'left', 'right'];
    
    // For each direction, create sprite sheet
    directions.forEach((dir, dirIndex) => {
        const canvas = createCanvas(32 * walkFrames, 32);
        for (let f = 0; f < walkFrames; f++) {
            // Draw character at each frame position
            // Simplified: just draw the same pose with slight variations
            drawHumanoid(canvas, 16 + f * 32, 16, COLORS.player, f, dir, true);
        }
        savePNG(canvas, path.join(PLAYER_DIR, `player-walk-${dir}.png`));
    });
    
    // Player Battle (5 poses × 4 frames)
    const battlePoses = ['idle', 'attack', 'defend', 'hurt', 'dead'];
    battlePoses.forEach((pose, poseIndex) => {
        const canvas = createCanvas(48 * 4, 48);
        for (let f = 0; f < 4; f++) {
            drawBattlePose(canvas, f * 48, 0, COLORS.player, pose, f);
        }
        savePNG(canvas, path.join(PLAYER_DIR, `player-battle-${pose}.png`));
    });
    
    // Player Portraits (5 expressions)
    const expressions = ['happy', 'neutral', 'angry', 'hurt', 'dead'];
    expressions.forEach((expr, exprIndex) => {
        const canvas = createCanvas(128, 128);
        drawPortrait(canvas, 0, 0, expr);
        savePNG(canvas, path.join(PLAYER_DIR, `player-portrait-${expr}.png`));
    });
    
    }

function generateNPCSprites() {
        
    const npcs = [
        { name: 'police', color: COLORS.police, walkFrames: 6 },
        { name: 'corrupt-cop', color: COLORS.corruptCop, walkFrames: 6 },
        { name: 'rival', color: COLORS.rival, walkFrames: 8 },
        { name: 'buyer', color: COLORS.buyer, walkFrames: 6 },
        { name: 'vendor', color: COLORS.vendor, walkFrames: 6 },
        { name: 'shop-owner', color: COLORS.shopOwner, walkFrames: 6 }
    ];
    
    const directions = ['down', 'up', 'left', 'right'];
    const battlePoses = ['idle', 'attack', 'defend', 'hurt', 'dead'];
    const expressions = ['neutral', 'happy', 'angry', 'hurt', 'dead'];
    
    npcs.forEach(npc => {
                
        // Walking sprites (4 directions × walkFrames)
        const npcDir = path.join(NPC_DIR, npc.name);
        if (!fs.existsSync(npcDir)) {
            fs.mkdirSync(npcDir, { recursive: true });
        }
        
        directions.forEach(dir => {
            const canvas = createCanvas(32 * npc.walkFrames, 32);
            for (let f = 0; f < npc.walkFrames; f++) {
                drawHumanoid(canvas, 16 + f * 32, 16, npc.color, f, dir, true);
            }
            savePNG(canvas, path.join(npcDir, `walk-${dir}.png`));
        });
        
        // Battle sprites (5 poses × 4 frames)
        battlePoses.forEach(pose => {
            const canvas = createCanvas(48 * 4, 48);
            for (let f = 0; f < 4; f++) {
                drawBattlePose(canvas, f * 48, 0, npc.color, pose, f);
            }
            savePNG(canvas, path.join(npcDir, `battle-${pose}.png`));
        });
        
        // Portraits (5 expressions)
        expressions.forEach(expr => {
            const canvas = createCanvas(128, 128);
            drawPortrait(canvas, 0, 0, expr);
            savePNG(canvas, path.join(npcDir, `portrait-${expr}.png`));
        });
        
            });
}

function generateObjectSprites() {
        
    // Cardboard Box (3 states × 4 frames)
    const boxStates = ['idle', 'damaged', 'destroyed'];
    boxStates.forEach(state => {
        const canvas = createCanvas(48 * 4, 48);
        for (let f = 0; f < 4; f++) {
            drawCardboardBox(canvas, f * 48, 0, state, f);
        }
        savePNG(canvas, path.join(OBJ_DIR, `cardboard-box-${state}.png`));
    });
        
    // Storage Unit (4 states × 4 frames)
    const storageStates = ['closed', 'opening', 'open', 'closing'];
    storageStates.forEach(state => {
        const canvas = createCanvas(64 * 4, 64);
        for (let f = 0; f < 4; f++) {
            drawStorageUnit(canvas, f * 64, 0, state, f);
        }
        savePNG(canvas, path.join(OBJ_DIR, `storage-unit-${state}.png`));
    });
        
    // Workstation (3 states × 4 frames)
    const workstationStates = ['idle', 'working', 'alert'];
    workstationStates.forEach(state => {
        const canvas = createCanvas(64 * 4, 48);
        for (let f = 0; f < 4; f++) {
            drawWorkstation(canvas, f * 64, 0, state, f);
        }
        savePNG(canvas, path.join(OBJ_DIR, `workstation-${state}.png`));
    });
        
    }

// ============================================
// MAIN
// ============================================

function main() {
                        
    ensureDirectories();
    
    // Generate all sprites
    generatePlayerSprites();
    generateNPCSprites();
    generateObjectSprites();
    
                                        }

main();