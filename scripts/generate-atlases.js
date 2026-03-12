#!/usr/bin/env node
/**
 * ATLAS GENERATOR UTILITY
 * 
 * This script documents the process for generating texture atlas files
 * and their JSON frame data for TRAP.
 * 
 * Prerequisites:
 * - npm install spritesmith sharp
 * 
 * Usage:
 *   node generate-atlases.js
 * 
 * Note: This generates the JSON structure. Actual PNG atlas files
 * should be created using a tool like TexturePacker, Shoebox, or
 * manually combining sprites in an image editor.
 */

import fs from 'fs';
import path from 'path';

const ATLAS_CONFIG = {
    tiles: {
        width: 256,
        height: 256,
        sprites: [
            { name: 'tile-street', w: 32, h: 32 },
            { name: 'tile-sidewalk', w: 32, h: 32 },
            { name: 'tile-alley', w: 32, h: 32 },
            { name: 'tile-concrete-cracked', w: 32, h: 32 },
            { name: 'tile-dirty-floor', w: 32, h: 32 },
            { name: 'tile-wood-floor', w: 32, h: 32 },
            { name: 'tile-wall-brick', w: 32, h: 32 },
            { name: 'tile-wall-interior', w: 32, h: 32 }
        ]
    },
    'ui-hud': {
        width: 256,
        height: 128,
        sprites: [
            { name: 'hud-panel-bar', w: 256, h: 32 },
            { name: 'ui-panel', w: 128, h: 128 },
            { name: 'icon-raw-materials', w: 32, h: 32 },
            { name: 'icon-product', w: 32, h: 32 }
        ]
    },
    'player-main': {
        width: 256,
        height: 128,
        sprites: [
            // Walk cycle (8 directions x 2 frames = 16)
            { name: 'walk-down-1', w: 32, h: 32 },
            { name: 'walk-down-2', w: 32, h: 32 },
            { name: 'walk-up-1', w: 32, h: 32 },
            { name: 'walk-up-2', w: 32, h: 32 },
            { name: 'walk-left-1', w: 32, h: 32 },
            { name: 'walk-left-2', w: 32, h: 32 },
            { name: 'walk-right-1', w: 32, h: 32 },
            { name: 'walk-right-2', w: 32, h: 32 },
            // Portraits (5)
            { name: 'portrait-happy', w: 32, h: 32 },
            { name: 'portrait-neutral', w: 32, h: 32 },
            { name: 'portrait-hurt', w: 32, h: 32 },
            { name: 'portrait-angry', w: 32, h: 32 },
            { name: 'portrait-dead', w: 32, h: 32 },
            // Battle states (5)
            { name: 'battle-idle', w: 32, h: 32 },
            { name: 'battle-attack', w: 32, h: 32 },
            { name: 'battle-defend', w: 32, h: 32 },
            { name: 'battle-hurt', w: 32, h: 32 },
            { name: 'battle-dead', w: 32, h: 32 }
        ]
    },
    npcs: {
        width: 256,
        height: 128,
        sprites: [
            { name: 'npc-vendor', w: 32, h: 32 },
            { name: 'npc-buyer', w: 32, h: 32 },
            { name: 'npc-rival', w: 32, h: 32 },
            { name: 'npc-police', w: 32, h: 32 },
            { name: 'npc-shop-owner', w: 32, h: 32 },
            { name: 'npc-corrupt-cop', w: 32, h: 32 }
        ]
    },
    enemies: {
        width: 256,
        height: 128,
        sprites: [
            { name: 'gangster-idle', w: 32, h: 32 },
            { name: 'gangster-defeat', w: 32, h: 32 },
            { name: 'thug-idle', w: 32, h: 32 },
            { name: 'thug-attack', w: 32, h: 32 },
            { name: 'thug-hurt', w: 32, h: 32 },
            { name: 'boss-idle', w: 32, h: 32 },
            { name: 'boss-attack', w: 32, h: 32 },
            { name: 'boss-hurt', w: 32, h: 32 },
            { name: 'boss-defeat', w: 32, h: 32 },
            { name: 'enforcer-idle', w: 32, h: 32 },
            { name: 'enforcer-attack', w: 32, h: 32 },
            { name: 'enforcer-defeat', w: 32, h: 32 }
        ]
    },
    'ui-combat': {
        width: 512,
        height: 256,
        sprites: [
            { name: 'combat-frame', w: 512, h: 256 },
            { name: 'hp-bar-player', w: 256, h: 16 },
            { name: 'hp-bar-enemy', w: 256, h: 16 },
            { name: 'xp-bar', w: 256, h: 8 },
            { name: 'damage-numbers', w: 64, h: 32 },
            { name: 'health-potion', w: 32, h: 32 },
            { name: 'run-button', w: 64, h: 32 },
            { name: 'victory-screen', w: 256, h: 256 },
            { name: 'defeat-screen', w: 256, h: 256 }
        ]
    },
    skills: {
        width: 256,
        height: 64,
        sprites: [
            { name: 'luck-card-shark', w: 32, h: 32 },
            { name: 'luck-escape-artist', w: 32, h: 32 },
            { name: 'luck-fast-talk', w: 32, h: 32 },
            { name: 'luck-fortune', w: 32, h: 32 },
            { name: 'luck-game-of-chance', w: 32, h: 32 },
            { name: 'luck-lucky-break', w: 32, h: 32 },
            { name: 'ability-toughness', w: 32, h: 32 },
            { name: 'ability-unbreakable', w: 32, h: 32 },
            { name: 'ability-last-stand', w: 32, h: 32 },
            { name: 'ability-iron-fist', w: 32, h: 32 },
            { name: 'ability-berserk', w: 32, h: 32 },
            { name: 'ability-power-strike', w: 32, h: 32 },
            { name: 'intuition-intimidate', w: 32, h: 32 },
            { name: 'intuition-deadly-precision', w: 32, h: 32 },
            { name: 'intuition-sneak', w: 32, h: 32 },
            { name: 'intuition-street-sense', w: 32, h: 32 },
            { name: 'intuition-shadow-walk', w: 32, h: 32 },
            { name: 'intuition-lockpick', w: 32, h: 32 }
        ]
    },
    'status-effects': {
        width: 128,
        height: 64,
        sprites: [
            { name: 'status-burn', w: 32, h: 32 },
            { name: 'status-freeze', w: 32, h: 32 },
            { name: 'status-poison', w: 32, h: 32 }
        ]
    }
};

/**
 * Generate JSON frame data for an atlas
 * This creates the JSON file that Phaser needs to parse atlas frames
 */
function generateAtlasJSON(atlasName, config) {
    const frames = {};
    let x = 0;
    let y = 0;
    let rowHeight = 0;
    const padding = 2; // 2px padding between sprites

    config.sprites.forEach((sprite, index) => {
        // Wrap to next row if needed
        if (x + sprite.w > config.width) {
            x = 0;
            y += rowHeight + padding;
            rowHeight = 0;
        }

        frames[sprite.name] = {
            frame: { x: x, y: y, w: sprite.w, h: sprite.h },
            rotated: false,
            trimmed: false,
            spriteSourceSize: { x: 0, y: 0, w: sprite.w, h: sprite.h },
            sourceSize: { w: sprite.w, h: sprite.h }
        };

        x += sprite.w + padding;
        rowHeight = Math.max(rowHeight, sprite.h);
    });

    return {
        frames: frames,
        meta: {
            app: 'TRAP Atlas Generator',
            version: '1.0',
            image: `${atlasName}.png`,
            format: 'RGBA8888',
            size: { w: config.width, h: config.height },
            scale: 1
        }
    };
}

// Generate all atlas JSON files
const outputDir = './assets/atlases';

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

Object.entries(ATLAS_CONFIG).forEach(([name, config]) => {
    const json = generateAtlasJSON(name, config);
    const filename = path.join(outputDir, `${name}.json`);
    fs.writeFileSync(filename, JSON.stringify(json, null, 2));
    });

