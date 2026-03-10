/**
 * TRAP Game Asset Generator - "The Underworld" Style
 * Generates gritty pixel-art assets using HTML5 Canvas
 * 
 * Run with: node generator.js
 * Output: Generates .png files in the assets directory
 */

const fs = require('fs');
const path = require('path');

// Color palette from VISION.md
const COLORS = {
    // Primary
    asphaltBlack: '#0a0a0a',
    stormGray: '#2d2d2d',
    burntOrange: '#8b4513',
    neonAmber: '#ffaa00',
    neonTeal: '#00ffcc',
    // Secondary
    danger: '#cc2222',
    graffitiPink: '#ff00aa',
    moldGreen: '#334433',
    steelBlue: '#334455',
    // UI
    panelBg: '#1a1a1a',
    panelBorder: '#333333',
    textPrimary: '#e0e0e0',
    textSecondary: '#888888',
    // Additional
    darkGray: '#1a1a1a',
    mediumGray: '#444444',
    lightGray: '#666666',
    white: '#ffffff',
    brown: '#5c3d2e',
    cardboard: '#8b7355',
    cardboardDark: '#5c4a3a',
    brick: '#6b3a3a',
    brickDark: '#4a2a2a',
    concrete: '#3a3a3a',
    concreteLight: '#4a4a4a',
    sidewalk: '#4a4a4a',
    sidewalkLight: '#5a5a5a',
    wood: '#5c3d2e',
    woodDark: '#3d2a1e',
    woodLight: '#7a5a4a',
    skin: '#c4a080',
    skinDark: '#a08060',
    policeBlue: '#1a2a4a',
    policeGold: '#c9a830',
    hoodBlack: '#1a1a1a',
    hoodGray: '#333333',
};

// Helper: Create canvas
function createCanvas(width, height) {
    const { createCanvas: cc } = require('canvas');
    return cc(width, height);
}

// Helper: Get context and set up pixel art
function setupContext(ctx) {
    ctx.imageSmoothingEnabled = false;
}

// Draw a pixel (1x1 rectangle)
function drawPixel(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
}

// Fill area with color
function fillArea(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

// Add noise/texture to area
function addNoise(ctx, x, y, w, h, baseColor, intensity = 0.15) {
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);
    
    for (let i = 0; i < w * h * intensity; i++) {
        const px = x + Math.floor(Math.random() * w);
        const py = y + Math.floor(Math.random() * h);
        const variation = Math.random() > 0.5 ? 20 : -20;
        const nr = Math.max(0, Math.min(255, r + variation));
        const ng = Math.max(0, Math.min(255, g + variation));
        const nb = Math.max(0, Math.min(255, b + variation));
        ctx.fillStyle = `rgb(${nr},${ng},${nb})`;
        ctx.fillRect(px, py, 1, 1);
    }
}

// ==================== TILE GENERATORS ====================

// Street tile (cracked asphalt with puddles)
function generateStreetTile() {
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    setupContext(ctx);
    
    // Base asphalt
    fillArea(ctx, 0, 0, 64, 64, COLORS.asphaltBlack);
    addNoise(ctx, 0, 0, 64, 64, COLORS.asphaltBlack, 0.3);
    
    // Add gray variation patches
    for (let i = 0; i < 8; i++) {
        const px = Math.floor(Math.random() * 60);
        const py = Math.floor(Math.random() * 60);
        const ps = 4 + Math.floor(Math.random() * 8);
        fillArea(ctx, px, py, ps, ps, COLORS.stormGray);
        addNoise(ctx, px, py, ps, ps, COLORS.stormGray, 0.2);
    }
    
    // Cracks
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    
    // Crack 1
    ctx.beginPath();
    ctx.moveTo(5, 32);
    ctx.lineTo(15, 25);
    ctx.lineTo(25, 30);
    ctx.lineTo(35, 20);
    ctx.lineTo(50, 25);
    ctx.stroke();
    
    // Crack 2
    ctx.beginPath();
    ctx.moveTo(20, 5);
    ctx.lineTo(18, 20);
    ctx.lineTo(25, 35);
    ctx.lineTo(22, 50);
    ctx.lineTo(30, 60);
    ctx.stroke();
    
    // Puddle
    ctx.fillStyle = '#1a2a3a';
    ctx.beginPath();
    ctx.ellipse(45, 45, 10, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2a3a4a';
    ctx.beginPath();
    ctx.ellipse(43, 43, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Trash specks
    ctx.fillStyle = '#3a3a3a';
    for (let i = 0; i < 5; i++) {
        const tx = Math.floor(Math.random() * 60);
        const ty = Math.floor(Math.random() * 60);
        ctx.fillRect(tx, ty, 2, 2);
    }
    
    return canvas;
}

// Sidewalk tile (broken concrete with weeds)
function generateSidewalkTile() {
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    setupContext(ctx);
    
    // Base concrete
    fillArea(ctx, 0, 0, 64, 64, COLORS.sidewalk);
    addNoise(ctx, 0, 0, 64, 64, COLORS.sidewalk, 0.25);
    
    // Concrete slab lines
    ctx.strokeStyle = '#3a3a3a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(32, 0);
    ctx.lineTo(32, 64);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 32);
    ctx.lineTo(64, 32);
    ctx.stroke();
    
    // Cracks
    ctx.strokeStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.moveTo(10, 15);
    ctx.lineTo(20, 18);
    ctx.lineTo(18, 25);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(45, 40);
    ctx.lineTo(55, 38);
    ctx.lineTo(58, 45);
    ctx.stroke();
    
    // Broken chunk
    fillArea(ctx, 50, 10, 8, 6, COLORS.sidewalkLight);
    addNoise(ctx, 50, 10, 8, 6, COLORS.sidewalkLight, 0.1);
    
    // Weeds growing through crack
    ctx.fillStyle = COLORS.moldGreen;
    for (let i = 0; i < 4; i++) {
        const wx = 18 + i * 2;
        ctx.fillRect(wx, 25 - i * 2, 1, 3 + i);
        ctx.fillRect(wx + 1, 25 - i * 2, 1, 2 + i);
    }
    
    // Stain
    ctx.fillStyle = '#2a2a2a';
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.ellipse(10, 50, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    
    return canvas;
}

// Brick wall tile
function generateBrickWallTile() {
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    setupContext(ctx);
    
    // Base dark wall
    fillArea(ctx, 0, 0, 64, 64, COLORS.brickDark);
    
    // Brick pattern
    const brickW = 16;
    const brickH = 8;
    for (let row = 0; row < 8; row++) {
        const offset = (row % 2) * 8;
        for (let col = 0; col < 4; col++) {
            const bx = col * 16 + offset;
            const by = row * 8;
            
            // Brick color with variation
            const brightness = Math.random() * 20 - 10;
            const r = Math.min(255, Math.max(0, 107 + brightness));
            const g = Math.min(255, Math.max(0, 58 + brightness));
            const b = Math.min(255, Math.max(0, 58 + brightness));
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(bx + 1, by + 1, 14, 6);
            
            // Brick texture
            addNoise(ctx, bx + 1, by + 1, 14, 6, `rgb(${r},${g},${b})`, 0.15);
        }
    }
    
    // Mortar lines
    ctx.fillStyle = '#2a1a1a';
    for (let row = 0; row <= 8; row++) {
        ctx.fillRect(0, row * 8, 64, 1);
    }
    for (let col = 0; col < 5; col++) {
        ctx.fillRect(col * 16, 0, 1, 64);
    }
    
    // Graffiti tag (small)
    ctx.fillStyle = COLORS.graffitiPink;
    ctx.globalAlpha = 0.7;
    ctx.font = '8px monospace';
    ctx.fillText('XX', 4, 20);
    ctx.globalAlpha = 1;
    
    // Chipping paint
    ctx.fillStyle = '#4a3a3a';
    for (let i = 0; i < 3; i++) {
        const cx = Math.floor(Math.random() * 60);
        const cy = Math.floor(Math.random() * 60);
        ctx.fillRect(cx, cy, 3, 2);
    }
    
    return canvas;
}

// Concrete floor tile (warehouse)
function generateConcreteTile() {
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    setupContext(ctx);
    
    // Base concrete
    fillArea(ctx, 0, 0, 64, 64, COLORS.concrete);
    addNoise(ctx, 0, 0, 64, 64, COLORS.concrete, 0.3);
    
    // Larger patches
    ctx.fillStyle = COLORS.concreteLight;
    for (let i = 0; i < 4; i++) {
        const px = Math.floor(Math.random() * 50);
        const py = Math.floor(Math.random() * 50);
        const ps = 8 + Math.floor(Math.random() * 12);
        ctx.globalAlpha = 0.3;
        ctx.fillRect(px, py, ps, ps);
    }
    ctx.globalAlpha = 1;
    
    // Cracks
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(10, 5);
    ctx.lineTo(15, 20);
    ctx.lineTo(8, 35);
    ctx.lineTo(20, 45);
    ctx.lineTo(15, 60);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(50, 10);
    ctx.lineTo(45, 25);
    ctx.lineTo(55, 40);
    ctx.stroke();
    
    // Stains
    ctx.fillStyle = '#1a1a1a';
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.ellipse(40, 50, 12, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    
    // Oil stain
    ctx.fillStyle = '#0a1520';
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.ellipse(25, 30, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    
    return canvas;
}

// Wood floor tile
function generateWoodFloorTile() {
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    setupContext(ctx);
    
    // Base
    fillArea(ctx, 0, 0, 64, 64, COLORS.woodDark);
    
    // Planks
    const plankW = 16;
    for (let i = 0; i < 4; i++) {
        const x = i * plankW;
        
        // Plank color with variation
        const brightness = (Math.random() - 0.5) * 20;
        const r = Math.min(255, Math.max(0, 92 + brightness));
        const g = Math.min(255, Math.max(0, 61 + brightness));
        const b = Math.min(255, Math.max(0, 46 + brightness));
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, 0, plankW - 1, 64);
        
        // Wood grain
        ctx.fillStyle = COLORS.woodDark;
        for (let g = 0; g < 3; g++) {
            const gy = 10 + g * 20 + Math.random() * 5;
            ctx.fillRect(x + 2, gy, plankW - 4, 1);
        }
        
        // Warp/bow
        if (Math.random() > 0.7) {
            ctx.fillStyle = '#2a1a0e';
            ctx.fillRect(x + 3, 30 + Math.random() * 10, 3, 2);
        }
    }
    
    // Gaps between planks
    ctx.fillStyle = '#0a0505';
    for (let i = 0; i < 4; i++) {
        ctx.fillRect(i * plankW + plankW - 1, 0, 1, 64);
    }
    
    // Wear marks
    ctx.fillStyle = COLORS.woodLight;
    ctx.globalAlpha = 0.2;
    ctx.fillRect(5, 20, 8, 3);
    ctx.fillRect(40, 45, 10, 2);
    ctx.globalAlpha = 1;
    
    // Nail holes
    ctx.fillStyle = '#1a0a05';
    for (let i = 0; i < 3; i++) {
        const nx = 4 + i * 20 + Math.random() * 5;
        const ny = 5 + Math.random() * 54;
        ctx.fillRect(nx, ny, 2, 2);
    }
    
    return canvas;
}

// Alley tile
function generateAlleyTile() {
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    setupContext(ctx);
    
    // Base - dark, dirty
    fillArea(ctx, 0, 0, 64, 64, '#0f0f0f');
    addNoise(ctx, 0, 0, 64, 64, '#0f0f0f', 0.2);
    
    // Wet patches (reflection)
    ctx.fillStyle = '#1a2030';
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.ellipse(20, 40, 15, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    
    // Chain link fence shadow (top)
    ctx.fillStyle = '#1a1a1a';
    for (let i = 0; i < 64; i += 4) {
        ctx.fillRect(i, 0, 1, 15);
        ctx.fillRect(i + 2, 0, 1, 15);
    }
    
    // Dumpster shadow
    ctx.fillStyle = '#050505';
    ctx.fillRect(40, 20, 24, 44);
    
    // Pipes on wall
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(5, 25, 4, 30);
    ctx.fillRect(8, 28, 2, 24);
    
    // Rust on pipes
    ctx.fillStyle = COLORS.burntOrange;
    ctx.fillRect(5, 35, 4, 3);
    ctx.fillRect(5, 45, 3, 2);
    
    // Trash on ground
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(15, 50, 8, 6);
    ctx.fillRect(18, 52, 4, 3);
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(25, 48, 5, 4);
    
    return canvas;
}

// ==================== OBJECT GENERATORS ====================

// Cardboard box
function generateCardboardBox() {
    const canvas = createCanvas(48, 48);
    const ctx = canvas.getContext('2d');
    setupContext(ctx);
    
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(24, 44, 18, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Box body (3D-ish top-down)
    // Back
    ctx.fillStyle = COLORS.cardboardDark;
    ctx.fillRect(8, 14, 32, 28);
    
    // Front
    ctx.fillStyle = COLORS.cardboard;
    ctx.fillRect(8, 20, 32, 22);
    
    // Top flap shadow
    ctx.fillStyle = '#6a5a4a';
    ctx.fillRect(8, 14, 32, 6);
    
    // Tape
    ctx.fillStyle = '#8a7a6a';
    ctx.fillRect(10, 18, 28, 3);
    ctx.fillStyle = '#aaa090';
    ctx.fillRect(11, 18, 26, 1);
    
    // Wear/tea rs
    ctx.fillStyle = '#5a4a3a';
    for (let i = 0; i < 5; i++) {
        const tx = 10 + Math.random() * 25;
        const ty = 24 + Math.random() * 15;
        ctx.fillRect(tx, ty, 3, 1);
    }
    
    // Dirt
    addNoise(ctx, 10, 26, 28, 14, COLORS.cardboard, 0.1);
    
    // Blanket peeking out
    ctx.fillStyle = '#3a4a5a';
    ctx.fillRect(12, 38, 10, 6);
    ctx.fillStyle = '#4a5a6a';
    ctx.fillRect(12, 38, 10, 2);
    
    return canvas;
}

// Storage unit
function generateStorageUnit() {
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    setupContext(ctx);
    
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(32, 60, 28, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Metal door (rolled up style)
    // Door panels
    ctx.fillStyle = '#3a3a4a';
    ctx.fillRect(12, 8, 40, 48);
    
    // Horizontal ridges
    ctx.fillStyle = '#4a4a5a';
    for (let i = 0; i < 6; i++) {
        ctx.fillRect(12, 10 + i * 8, 40, 2);
    }
    
    // Vertical lines (door slats)
    ctx.fillStyle = '#2a2a3a';
    for (let i = 0; i < 10; i++) {
        ctx.fillRect(14 + i * 4, 8, 1, 48);
    }
    
    // Lock mechanism
    ctx.fillStyle = '#5a5a6a';
    ctx.fillRect(28, 30, 8, 12);
    ctx.fillStyle = COLORS.burntOrange;
    ctx.fillRect(30, 32, 4, 4);
    
    // Padlock
    ctx.fillStyle = '#6a6a7a';
    ctx.fillRect(30, 40, 4, 6);
    ctx.fillStyle = '#c9a830';
    ctx.fillRect(29, 42, 6, 2);
    
    // Rust spots
    ctx.fillStyle = COLORS.burntOrange;
    ctx.globalAlpha = 0.6;
    ctx.fillRect(15, 15, 4, 3);
    ctx.fillRect(45, 40, 3, 2);
    ctx.fillRect(20, 50, 5, 3);
    ctx.globalAlpha = 1;
    
    // Floor/ground line
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 56, 64, 8);
    
    return canvas;
}

// Workstation
function generateWorkstation() {
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    setupContext(ctx);
    
    // Table surface
    ctx.fillStyle = COLORS.woodDark;
    ctx.fillRect(4, 20, 56, 36);
    ctx.fillStyle = COLORS.wood;
    ctx.fillRect(4, 20, 56, 4);
    
    // Clutter on table
    // Scale
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(8, 28, 12, 8);
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(10, 26, 8, 4);
    ctx.fillStyle = COLORS.stormGray;
    ctx.fillRect(11, 27, 6, 2);
    
    // Bags (product)
    ctx.fillStyle = '#5a3a5a';
    ctx.fillRect(24, 30, 8, 10);
    ctx.fillRect(25, 28, 6, 3);
    ctx.fillStyle = '#4a2a4a';
    ctx.fillRect(34, 32, 6, 8);
    
    // Burner phone
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(44, 28, 6, 10);
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(45, 29, 4, 6);
    
    // LED light
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(52, 24, 6, 8);
    ctx.fillStyle = COLORS.neonAmber;
    ctx.fillRect(53, 25, 4, 3);
    
    // Papers/documents
    ctx.fillStyle = '#c0b090';
    ctx.fillRect(12, 42, 10, 8);
    ctx.fillStyle = '#d0c0a0';
    ctx.fillRect(14, 44, 8, 4);
    
    // Notes (sticky notes)
    ctx.fillStyle = '#a08050';
    ctx.fillRect(28, 44, 6, 6);
    ctx.fillStyle = '#b09060';
    ctx.fillRect(28, 44, 6, 2);
    
    // Lighter
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(40, 44, 4, 8);
    ctx.fillStyle = COLORS.burntOrange;
    ctx.fillRect(41, 44, 2, 3);
    
    // Coffee cup (stained)
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(50, 40, 6, 8);
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(51, 41, 4, 5);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(52, 44, 2, 2);
    
    // Table edge shadow
    ctx.fillStyle = '#1a0a05';
    ctx.fillRect(4, 56, 56, 4);
    
    return canvas;
}

// ==================== SPRITE GENERATORS ====================

// Player sprite (top-down hoodie)
function generatePlayerSprite(gender = 'male') {
    const canvas = createCanvas(48, 64);
    const ctx = canvas.getContext('2d');
    setupContext(ctx);
    
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(24, 60, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Hoodie body
    ctx.fillStyle = COLORS.hoodBlack;
    ctx.fillRect(12, 16, 24, 36);
    
    // Hood
    ctx.fillStyle = COLORS.hoodGray;
    ctx.fillRect(14, 8, 20, 12);
    
    // Hood opening (face area)
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(18, 12, 12, 6);
    
    // Face (skin)
    ctx.fillStyle = COLORS.skin;
    ctx.fillRect(20, 13, 8, 4);
    
    // Hood shadow inside
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(14, 16, 20, 2);
    
    // Arms
    ctx.fillStyle = COLORS.hoodBlack;
    // Left arm
    ctx.fillRect(8, 20, 6, 24);
    // Right arm
    ctx.fillRect(34, 20, 6, 24);
    
    // Hands
    ctx.fillStyle = COLORS.skin;
    ctx.fillRect(9, 42, 4, 4);
    ctx.fillRect(35, 42, 4, 4);
    
    // Pockets
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(14, 32, 8, 6);
    ctx.fillRect(26, 32, 8, 6);
    
    // Drawstring
    ctx.fillStyle = COLORS.stormGray;
    ctx.fillRect(22, 14, 1, 8);
    ctx.fillRect(25, 14, 1, 8);
    
    // Detail: pocket zip
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(15, 33, 6, 1);
    ctx.fillRect(27, 33, 6, 1);
    
    // Gender-specific tweaks
    if (gender === 'female') {
        // Slightly narrower
        ctx.fillStyle = COLORS.hoodBlack;
        ctx.fillRect(14, 16, 20, 36);
        // Hood slightly smaller
        ctx.fillStyle = COLORS.hoodGray;
        ctx.fillRect(16, 8, 16, 12);
        // Arms thinner
        ctx.fillRect(10, 20, 4, 24);
        ctx.fillRect(34, 20, 4, 24);
    }
    
    return canvas;
}

// NPC: Police
function generateNPCPolice() {
    const canvas = createCanvas(48, 64);
    const ctx = canvas.getContext('2d');
    setupContext(ctx);
    
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(24, 60, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Body - police uniform
    ctx.fillStyle = COLORS.policeBlue;
    ctx.fillRect(14, 20, 20, 32);
    
    // Vest
    ctx.fillStyle = '#1a2030';
    ctx.fillRect(16, 22, 16, 20);
    
    // Badge
    ctx.fillStyle = COLORS.policeGold;
    ctx.fillRect(21, 28, 6, 6);
    ctx.fillStyle = '#a08020';
    ctx.fillRect(22, 29, 4, 4);
    
    // Head
    ctx.fillStyle = COLORS.skin;
    ctx.fillRect(18, 8, 12, 14);
    
    // Hat
    ctx.fillStyle = '#1a2030';
    ctx.fillRect(16, 4, 16, 6);
    ctx.fillRect(14, 8, 20, 2);
    
    // Hat badge
    ctx.fillStyle = COLORS.policeGold;
    ctx.fillRect(22, 5, 4, 2);
    
    // Arms
    ctx.fillStyle = COLORS.policeBlue;
    ctx.fillRect(8, 22, 6, 20);
    ctx.fillRect(34, 22, 6, 20);
    
    // Hands
    ctx.fillStyle = COLORS.skin;
    ctx.fillRect(9, 40, 4, 4);
    ctx.fillRect(35, 40, 4, 4);
    
    // Belt
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(14, 46, 20, 4);
    ctx.fillStyle = COLORS.policeGold;
    ctx.fillRect(22, 46, 4, 4);
    
    // Flashlight
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(6, 28, 4, 8);
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(6, 26, 4, 4);
    
    return canvas;
}

// NPC: Corrupt Cop
function generateNPCCorruptCop() {
    const canvas = createCanvas(48, 64);
    const ctx = canvas.getContext('2d');
    setupContext(ctx);
    
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(24, 60, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Body - same uniform but more casual
    ctx.fillStyle = COLORS.steelBlue;
    ctx.fillRect(14, 20, 20, 32);
    
    // Shirt unbuttoned
    ctx.fillStyle = '#2a3a4a';
    ctx.fillRect(14, 20, 20, 8);
    
    // Gold chain visible
    ctx.fillStyle = COLORS.policeGold;
    ctx.fillRect(20, 28, 8, 2);
    ctx.fillRect(22, 30, 4, 3);
    
    // Head
    ctx.fillStyle = COLORS.skin;
    ctx.fillRect(18, 8, 12, 14);
    
    // Sunglasses
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(19, 12, 10, 4);
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(20, 13, 3, 2);
    ctx.fillRect(25, 13, 3, 2);
    
    // Hat (tilted)
    ctx.fillStyle = '#2a3a4a';
    ctx.fillRect(14, 4, 20, 6);
    ctx.fillRect(12, 8, 24, 2);
    
    // Arms
    ctx.fillStyle = COLORS.steelBlue;
    ctx.fillRect(8, 22, 6, 20);
    ctx.fillRect(34, 22, 6, 20);
    
    // Hands
    ctx.fillStyle = COLORS.skin;
    ctx.fillRect(9, 40, 4, 4);
    ctx.fillRect(35, 40, 4, 4);
    
    // Belt
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(14, 46, 20, 4);
    
    // Fat envelope in pocket
    ctx.fillStyle = '#80a060';
    ctx.fillRect(28, 38, 6, 8);
    
    return canvas;
}

// NPC: Rival
function generateNPCRival() {
    const canvas = createCanvas(48, 64);
    const ctx = canvas.getContext('2d');
    setupContext(ctx);
    
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(24, 60, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Body - flashy
    ctx.fillStyle = '#2a1a2a';
    ctx.fillRect(14, 20, 20, 32);
    
    // Jacket
    ctx.fillStyle = '#1a0a1a';
    ctx.fillRect(12, 22, 24, 28);
    
    // Neon stripe
    ctx.fillStyle = COLORS.graffitiPink;
    ctx.fillRect(12, 30, 2, 12);
    ctx.fillRect(34, 30, 2, 12);
    
    // Head
    ctx.fillStyle = COLORS.skinDark;
    ctx.fillRect(18, 8, 12, 14);
    
    // Bandana
    ctx.fillStyle = COLORS.graffitiPink;
    ctx.fillRect(17, 6, 14, 4);
    
    // Face - aggressive
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(19, 13, 3, 2);
    ctx.fillRect(26, 13, 3, 2);
    
    // Arms
    ctx.fillStyle = '#1a0a1a';
    ctx.fillRect(8, 22, 6, 20);
    ctx.fillRect(34, 22, 6, 20);
    
    // Hands - one with gun silhouette
    ctx.fillStyle = COLORS.skinDark;
    ctx.fillRect(9, 40, 4, 4);
    ctx.fillRect(35, 40, 4, 5);
    
    // Gun outline
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(35, 44, 4, 6);
    
    // Belt
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(14, 46, 20, 4);
    
    return canvas;
}

// NPC: Buyer
function generateNPCBuyer() {
    const canvas = createCanvas(48, 64);
    const ctx = canvas.getContext('2d');
    setupContext(ctx);
    
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(24, 60, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Body - casual
    ctx.fillStyle = '#3a3a4a';
    ctx.fillRect(14, 22, 20, 30);
    
    // Hoodie
    ctx.fillStyle = '#2a2a3a';
    ctx.fillRect(12, 24, 24, 26);
    
    // Head
    ctx.fillStyle = COLORS.skin;
    ctx.fillRect(18, 10, 12, 14);
    
    // Cap (backwards)
    ctx.fillStyle = '#4a4a5a';
    ctx.fillRect(16, 6, 16, 5);
    ctx.fillRect(14, 8, 4, 4);
    
    // Face
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(20, 15, 8, 2);
    
    // Arms
    ctx.fillStyle = '#2a2a3a';
    ctx.fillRect(8, 26, 6, 18);
    ctx.fillRect(34, 26, 6, 18);
    
    // Hands
    ctx.fillStyle = COLORS.skin;
    ctx.fillRect(9, 42, 4, 4);
    ctx.fillRect(35, 42, 4, 4);
    
    // Nervous - shifting weight animation offset (shoulder uneven)
    ctx.fillStyle = '#3a3a4a';
    ctx.fillRect(13, 24, 4, 2);
    
    return canvas;
}

// NPC: Vendor
function generateNPCVendor() {
    const canvas = createCanvas(48, 64);
    const ctx = canvas.getContext('2d');
    setupContext(ctx);
    
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(24, 60, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Body - store owner style
    ctx.fillStyle = '#4a4a5a';
    ctx.fillRect(14, 22, 20, 30);
    
    // Apron
    ctx.fillStyle = '#3a5a4a';
    ctx.fillRect(16, 30, 16, 20);
    
    // Head
    ctx.fillStyle = COLORS.skin;
    ctx.fillRect(18, 8, 12, 14);
    
    // Hair
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(17, 4, 14, 5);
    
    // Face - friendly
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(20, 14, 2, 2);
    ctx.fillRect(26, 14, 2, 2);
    
    // Arms
    ctx.fillStyle = '#4a4a5a';
    ctx.fillRect(8, 24, 6, 20);
    ctx.fillRect(34, 24, 6, 20);
    
    // Hands
    ctx.fillStyle = COLORS.skin;
    ctx.fillRect(9, 42, 4, 4);
    ctx.fillRect(35, 42, 4, 4);
    
    // Counter in front
    ctx.fillStyle = '#5a4a3a';
    ctx.fillRect(10, 48, 28, 8);
    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(10, 48, 28, 2);
    
    return canvas;
}

// NPC: Shop Owner
function generateNPCShopOwner() {
    const canvas = createCanvas(48, 64);
    const ctx = canvas.getContext('2d');
    setupContext(ctx);
    
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(24, 60, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Body - formal but worn
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(14, 22, 20, 30);
    
    // Shirt
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(16, 22, 16, 12);
    
    // Tie (loosened)
    ctx.fillStyle = '#6a3a3a';
    ctx.fillRect(22, 24, 4, 8);
    
    // Head
    ctx.fillStyle = COLORS.skin;
    ctx.fillRect(18, 8, 12, 14);
    
    // Balding
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(18, 4, 12, 4);
    
    // Hair sides
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(17, 6, 3, 4);
    ctx.fillRect(28, 6, 3, 4);
    
    // Glasses
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(19, 13, 4, 3);
    ctx.fillRect(25, 13, 4, 3);
    ctx.fillRect(23, 14, 2, 1);
    
    // Arms
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(8, 24, 6, 20);
    ctx.fillRect(34, 24, 6, 20);
    
    // Hands
    ctx.fillStyle = COLORS.skin;
    ctx.fillRect(9, 42, 4, 4);
    ctx.fillRect(35, 42, 4, 4);
    
    // Cash register in front
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(12, 46, 24, 10);
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(14, 48, 20, 6);
    ctx.fillStyle = COLORS.neonAmber;
    ctx.fillRect(16, 50, 4, 2);
    
    return canvas;
}

// ==================== UI GENERATORS ====================

// HUD Panel Bar
function generateHudPanelBar() {
    const canvas = createCanvas(320, 24);
    const ctx = canvas.getContext('2d');
    setupContext(ctx);
    
    // Main bar background
    ctx.fillStyle = COLORS.panelBg;
    ctx.fillRect(0, 0, 320, 24);
    
    // Top border
    ctx.fillStyle = COLORS.panelBorder;
    ctx.fillRect(0, 0, 320, 2);
    
    // Bottom border
    ctx.fillStyle = COLORS.panelBorder;
    ctx.fillRect(0, 22, 320, 2);
    
    // Rivets
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(8, 8, 4, 4);
    ctx.fillRect(308, 8, 4, 4);
    
    // Inner highlight
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(2, 4, 316, 1);
    
    // Metallic gradient lines
    ctx.fillStyle = '#3a3a3a';
    for (let i = 0; i < 320; i += 16) {
        ctx.fillRect(i, 10, 1, 6);
    }
    
    // Danger strip
    ctx.fillStyle = COLORS.danger;
    ctx.fillRect(0, 0, 4, 24);
    
    return canvas;
}

// UI Panel
function generateUiPanel() {
    const canvas = createCanvas(200, 150);
    const ctx = canvas.getContext('2d');
    setupContext(ctx);
    
    // Panel background
    ctx.fillStyle = COLORS.panelBg;
    ctx.fillRect(0, 0, 200, 150);
    
    // Border
    ctx.fillStyle = COLORS.panelBorder;
    ctx.fillRect(0, 0, 200, 3);
    ctx.fillRect(0, 147, 200, 3);
    ctx.fillRect(0, 0, 3, 150);
    ctx.fillRect(197, 0, 3, 150);
    
    // Inner border
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(3, 3, 194, 2);
    ctx.fillRect(3, 145, 194, 2);
    ctx.fillRect(3, 3, 2, 144);
    ctx.fillRect(195, 3, 2, 144);
    
    // Corner accents
    ctx.fillStyle = COLORS.panelBorder;
    ctx.fillRect(3, 3, 6, 6);
    ctx.fillRect(191, 3, 6, 6);
    ctx.fillRect(3, 141, 6, 6);
    ctx.fillRect(191, 141, 6, 6);
    
    // Screws
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(6, 6, 4, 4);
    ctx.fillRect(190, 6, 4, 4);
    ctx.fillRect(6, 140, 4, 4);
    ctx.fillRect(190, 140, 4, 4);
    
    // Inner shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(10, 15, 180, 125);
    
    // Scanline effect
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    for (let i = 0; i < 150; i += 2) {
        ctx.fillRect(0, i, 200, 1);
    }
    
    return canvas;
}

// ==================== ICON GENERATORS ====================

// Product icon
function generateIconProduct() {
    const canvas = createCanvas(32, 32);
    const ctx = canvas.getContext('2d');
    setupContext(ctx);
    
    // Background circle
    ctx.fillStyle = '#1a1a2a';
    ctx.beginPath();
    ctx.arc(16, 16, 14, 0, Math.PI * 2);
    ctx.fill();
    
    // Bag silhouette
    ctx.fillStyle = '#5a3a5a';
    ctx.fillRect(10, 12, 12, 14);
    
    // Bag top
    ctx.fillStyle = '#4a2a4a';
    ctx.fillRect(10, 10, 12, 4);
    
    // Tie/top
    ctx.fillStyle = '#6a4a6a';
    ctx.fillRect(14, 8, 4, 4);
    
    // Highlight
    ctx.fillStyle = '#7a5a7a';
    ctx.fillRect(12, 14, 2, 6);
    
    // Border
    ctx.strokeStyle = COLORS.neonAmber;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(16, 16, 13, 0, Math.PI * 2);
    ctx.stroke();
    
    return canvas;
}

// Raw materials icon
function generateIconRawMaterials() {
    const canvas = createCanvas(32, 32);
    const ctx = canvas.getContext('2d');
    setupContext(ctx);
    
    // Background circle
    ctx.fillStyle = '#1a1a2a';
    ctx.beginPath();
    ctx.arc(16, 16, 14, 0, Math.PI * 2);
    ctx.fill();
    
    // White powder pile
    ctx.fillStyle = '#d0c0a0';
    ctx.beginPath();
    ctx.moveTo(8, 24);
    ctx.lineTo(16, 10);
    ctx.lineTo(24, 24);
    ctx.closePath();
    ctx.fill();
    
    // Highlights
    ctx.fillStyle = '#e0d0b0';
    ctx.beginPath();
    ctx.moveTo(12, 18);
    ctx.lineTo(16, 10);
    ctx.lineTo(18, 16);
    ctx.closePath();
    ctx.fill();
    
    // Container edge
    ctx.fillStyle = '#3a3a4a';
    ctx.fillRect(6, 22, 20, 4);
    
    // Border
    ctx.strokeStyle = COLORS.steelBlue;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(16, 16, 13, 0, Math.PI * 2);
    ctx.stroke();
    
    return canvas;
}

// ==================== DUMPSTER ====================

function generateDumpster() {
    const canvas = createCanvas(64, 64);
    const ctx = canvas.getContext('2d');
    setupContext(ctx);
    
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(32, 60, 28, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Dumpster body
    ctx.fillStyle = '#2a4a2a';
    ctx.fillRect(8, 16, 48, 40);
    
    // Lid
    ctx.fillStyle = '#3a5a3a';
    ctx.fillRect(6, 12, 52, 8);
    
    // Lid overhang
    ctx.fillStyle = '#2a4a2a';
    ctx.fillRect(4, 16, 56, 4);
    
    // Drain holes
    ctx.fillStyle = '#1a2a1a';
    for (let i = 0; i < 4; i++) {
        ctx.fillRect(12 + i * 10, 45, 4, 2);
    }
    
    // Trash overflow
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(10, 4, 15, 10);
    ctx.fillRect(30, 2, 20, 12);
    ctx.fillRect(40, 6, 12, 8);
    
    // Individual bags
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(12, 6, 10, 8);
    ctx.fillRect(35, 4, 14, 10);
    ctx.fillRect(45, 8, 8, 6);
    
    // Wheels
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(12, 56, 8, 4);
    ctx.fillRect(44, 56, 8, 4);
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(14, 58, 4, 2);
    ctx.fillRect(46, 58, 4, 2);
    
    return canvas;
}

// ==================== BACKGROUND ====================

function generateBackgroundCreation() {
    const canvas = createCanvas(320, 180);
    const ctx = canvas.getContext('2d');
    setupContext(ctx);
    
    // Night sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 180);
    gradient.addColorStop(0, '#0a0a1a');
    gradient.addColorStop(0.5, '#101025');
    gradient.addColorStop(1, '#151530');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 320, 180);
    
    // Stars
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 30; i++) {
        const sx = Math.random() * 320;
        const sy = Math.random() * 80;
        const ss = Math.random() > 0.8 ? 2 : 1;
        ctx.fillRect(sx, sy, ss, ss);
    }
    
    // City silhouette
    ctx.fillStyle = '#080810';
    
    // Buildings
    ctx.fillRect(0, 100, 40, 80);
    ctx.fillRect(35, 80, 30, 100);
    ctx.fillRect(60, 120, 25, 60);
    ctx.fillRect(80, 70, 35, 110);
    ctx.fillRect(110, 90, 30, 90);
    ctx.fillRect(135, 110, 20, 70);
    ctx.fillRect(150, 60, 40, 120);
    ctx.fillRect(185, 85, 25, 95);
    ctx.fillRect(205, 100, 30, 80);
    ctx.fillRect(230, 75, 35, 105);
    ctx.fillRect(260, 95, 25, 85);
    ctx.fillRect(280, 110, 40, 70);
    
    // Building windows (lit)
    ctx.fillStyle = COLORS.neonAmber;
    ctx.globalAlpha = 0.6;
    // Random lit windows
    const windows = [
        [45, 105], [50, 115], [42, 125],
        [90, 85], [95, 95], [100, 90],
        [160, 75], [165, 85], [170, 70],
        [240, 90], [245, 100], [255, 85]
    ];
    windows.forEach(([wx, wy]) => {
        ctx.fillRect(wx, wy, 3, 4);
    });
    
    // Neon sign
    ctx.fillStyle = COLORS.graffitiPink;
    ctx.globalAlpha = 0.8;
    ctx.fillRect(150, 115, 20, 3);
    ctx.fillRect(150, 115, 3, 15);
    
    ctx.globalAlpha = 1;
    
    // Ground
    ctx.fillStyle = '#0a0a10';
    ctx.fillRect(0, 170, 320, 10);
    
    // Street lights glow
    ctx.fillStyle = COLORS.neonAmber;
    ctx.globalAlpha = 0.1;
    ctx.beginPath();
    ctx.arc(70, 180, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(250, 180, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    
    return canvas;
}

const webp = require('webp-converter');

// Helper to save canvas as PNG and WebP
function saveCanvas(canvas, filepath) {
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filepath, buffer);
    
    // Also create WebP version
    const webpPath = filepath.replace('.png', '.webp');
    fs.writeFileSync(webpPath, buffer); // WebP converter can work differently
    webp.cwebp(filepath, webpPath, "-q 80").then(result => {
        // WebP created successfully
    }).catch(err => {
        // If conversion fails, just keep PNG
    });
}

// ==================== MAIN GENERATOR ====================

function generateAllAssets() {
    const assetsDir = __dirname;
    
    console.log('Generating TRAP game assets (Underworld Style)...\n');
    
    // Tiles
    console.log('Generating tiles...');
    saveCanvas(generateStreetTile(), path.join(assetsDir, 'tile-street.png'));
    saveCanvas(generateSidewalkTile(), path.join(assetsDir, 'tile-sidewalk.png'));
    saveCanvas(generateBrickWallTile(), path.join(assetsDir, 'tile-wall-brick.png'));
    saveCanvas(generateConcreteTile(), path.join(assetsDir, 'tile-concrete-cracked.png'));
    saveCanvas(generateWoodFloorTile(), path.join(assetsDir, 'tile-wood-floor.png'));
    saveCanvas(generateAlleyTile(), path.join(assetsDir, 'tile-alley.png'));
    saveCanvas(generateDumpster(), path.join(assetsDir, 'tile-dumpster.png'));
    
    // Additional tiles (aliases/reference in game code)
    saveCanvas(generateConcreteTile(), path.join(assetsDir, 'tile-dirty-floor.png'));
    saveCanvas(generateBrickWallTile(), path.join(assetsDir, 'tile-wall-interior.png'));
    
    // Objects
    console.log('Generating objects...');
    saveCanvas(generateCardboardBox(), path.join(assetsDir, 'cardboard-box.png'));
    saveCanvas(generateStorageUnit(), path.join(assetsDir, 'storage-unit.png'));
    saveCanvas(generateWorkstation(), path.join(assetsDir, 'workstation.png'));
    
    // Player
    console.log('Generating player sprites...');
    saveCanvas(generatePlayerSprite('male'), path.join(assetsDir, 'male-char.png'));
    saveCanvas(generatePlayerSprite('female'), path.join(assetsDir, 'female-char.png'));
    saveCanvas(generatePlayerSprite('male'), path.join(assetsDir, 'player-top-down.png'));
    
    // NPCs
    console.log('Generating NPC sprites...');
    saveCanvas(generateNPCPolice(), path.join(assetsDir, 'npc-police.png'));
    saveCanvas(generateNPCCorruptCop(), path.join(assetsDir, 'npc-corrupt-cop.png'));
    saveCanvas(generateNPCRival(), path.join(assetsDir, 'npc-rival.png'));
    saveCanvas(generateNPCBuyer(), path.join(assetsDir, 'npc-buyer.png'));
    saveCanvas(generateNPCVendor(), path.join(assetsDir, 'npc-vendor.png'));
    saveCanvas(generateNPCShopOwner(), path.join(assetsDir, 'npc-shop-owner.png'));
    
    // UI
    console.log('Generating UI elements...');
    saveCanvas(generateHudPanelBar(), path.join(assetsDir, 'hud-panel-bar.png'));
    saveCanvas(generateUiPanel(), path.join(assetsDir, 'ui-panel.png'));
    
    // Icons
    console.log('Generating icons...');
    saveCanvas(generateIconProduct(), path.join(assetsDir, 'icon-product.png'));
    saveCanvas(generateIconRawMaterials(), path.join(assetsDir, 'icon-raw-materials.png'));
    
    // Background
    console.log('Generating background...');
    saveCanvas(generateBackgroundCreation(), path.join(assetsDir, 'background-creation.png'));
    
    console.log('\n✓ All assets generated successfully!');
    console.log('Output directory:', assetsDir);
}

// Run if executed directly
if (require.main === module) {
    generateAllAssets();
}

module.exports = { generateAllAssets };