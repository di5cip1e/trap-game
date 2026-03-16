/**
 * Sprite Resize Tool
 * 
 * Resizes DALL-E generated sprites from 1024x1024 down to intended pixel art sizes.
 * DALL-E 3 enforces 1024x1024 minimum, but we need smaller sprites for the game.
 * 
 * Usage: node resize-sprites.js
 */

const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

const BASE_DIR = path.join(__dirname, 'assets', 'sprites', 'npcs');

// Size mappings
const SIZE_MAP = {
    'walk-down.png': 32,
    'walk-left.png': 32,
    'walk-right.png': 32,
    'walk-up.png': 32,
    'portrait-desperate.png': 128,
    'portrait-nervous.png': 128,
    'portrait-sad.png': 128,
    'portrait-angry.png': 128,
    'portrait-neutral.png': 128,
    'portrait-happy.png': 128,
    'portrait-tired.png': 128,
    'portrait-curious.png': 128,
    'portrait-content.png': 128,
    'portrait-excited.png': 128,
    'portrait-cool.png': 128,
    'portrait-party.png': 128,
    'portrait-expectant.png': 128,
    'portrait-smug.png': 128,
    'portrait-ironic.png': 128,
    'portrait-bored.png': 128,
    'portrait-judgmental.png': 128,
    'portrait-thoughtful.png': 128,
    'portrait-wise.png': 128,
    'portrait-serious.png': 128,
    'portrait-kind.png': 128,
    'portrait-skeptical.png': 128,
    'portrait-stoic.png': 128,
    'portrait-friendly.png': 128,
    'portrait-observant.png': 128,
    'portrait-mean.png': 128,
    'portrait-cold.png': 128,
    'portrait-suspicious.png': 128,
    'portrait-amazed.png': 128,
    'portrait-confused.png': 128,
    'portrait-naive.png': 128
};

async function resizeFile(filepath) {
    const filename = path.basename(filepath);
    const targetSize = SIZE_MAP[filename];
    
    if (!targetSize) {
        console.log(`  ⏭ Skipping ${filename} (no resize rule)`);
        return;
    }
    
    try {
        const image = await Jimp.read(filepath);
        
        // Store original size
        const originalWidth = image.getWidth();
        const originalHeight = image.getHeight();
        
        if (originalWidth === targetSize && originalHeight === targetSize) {
            console.log(`  ✓ ${filename} already ${targetSize}x${targetSize}`);
            return;
        }
        
        // Resize with nearest neighbor (pixel art)
        image.resize(targetSize, targetSize, Jimp.RESIZE_NEAREST_NEIGHBOR);
        
        // Overwrite the original file
        await image.writeAsync(filepath);
        
        console.log(`  ✓ ${filename}: ${originalWidth}x${originalHeight} → ${targetSize}x${targetSize}`);
    } catch (err) {
        console.error(`  ✗ Error processing ${filename}:`, err.message);
    }
}

async function processDirectory(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
            await processDirectory(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.png')) {
            await resizeFile(fullPath);
        }
    }
}

async function main() {
    console.log('🎨 Sprite Resize Tool');
    console.log('=====================\n');
    
    if (!fs.existsSync(BASE_DIR)) {
        console.log(`❌ Directory not found: ${BASE_DIR}`);
        console.log('\nMake sure to run the sprite generation scripts first!');
        process.exit(1);
    }
    
    console.log(`📁 Scanning: ${BASE_DIR}\n`);
    
    try {
        await processDirectory(BASE_DIR);
        console.log('\n✅ Resize complete!');
    } catch (err) {
        console.error('\n❌ Error:', err);
        process.exit(1);
    }
}

main();
