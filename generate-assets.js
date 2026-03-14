#!/usr/bin/env node
// TRAP Game - DALL-E Image Generator
// Uses OpenAI Image API with gpt-image-1 model

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load API key from secrets
let apiKey;
try {
    const secrets = JSON.parse(readFileSync('/root/.openclaw/secrets.json', 'utf8'));
    apiKey = secrets.openai_api_key;
} catch (e) {
    console.error('Failed to load API key from secrets.json');
    process.exit(1);
}

const ASSETS_DIR = join(__dirname, 'assets', 'generated');

// Ensure directory exists
try {
    mkdirSync(ASSETS_DIR, { recursive: true });
} catch (e) {}

// Asset list with proper prompts matching TRAP game style
const ASSETS = [
    // Phase 2 - Armor Sets (20 items)
    { name: 'armor-leather', prompt: 'Leather armor chest piece, dark urban crime game style, isometric view, transparent background, PNG, gritty underworld aesthetic' },
    { name: 'armor-leather-helmet', prompt: 'Leather armor helmet, dark urban crime game style, isometric view, transparent background, PNG, gritty underworld aesthetic' },
    { name: 'armor-leather-pants', prompt: 'Leather armor pants, dark urban crime game style, isometric view, transparent background, PNG, gritty underworld aesthetic' },
    { name: 'armor-kevlar', prompt: 'Kevlar bulletproof vest, dark urban crime game style, isometric view, transparent background, PNG, gritty underworld aesthetic' },
    { name: 'armor-kevlar-helmet', prompt: 'Tactical kevlar helmet, dark urban crime game style, isometric view, transparent background, PNG, gritty underworld aesthetic' },
    { name: 'armor-kevlar-pants', prompt: 'Tactical kevlar pants, dark urban crime game style, isometric view, transparent background, PNG, gritty underworld aesthetic' },
    { name: 'armor-military', prompt: 'Military combat armor chest piece, dark urban crime game style, isometric view, transparent background, PNG, gritty underworld aesthetic' },
    { name: 'armor-military-helmet', prompt: 'Military combat helmet, dark urban crime game style, isometric view, transparent background, PNG, gritty underworld aesthetic' },
    { name: 'armor-military-pants', prompt: 'Military combat pants, dark urban crime game style, isometric view, transparent background, PNG, gritty underworld aesthetic' },
    { name: 'armor-trenchcoat', prompt: 'Long trenchcoat armor, dark urban crime game style, isometric view, transparent background, PNG, gritty underworld aesthetic' },
    { name: 'boots-steel', prompt: 'Steel-toed combat boots, dark urban crime game style, isometric view, transparent background, PNG, gritty underworld aesthetic' },
    { name: 'boots-tactical', prompt: 'Tactical military boots, dark urban crime game style, isometric view, transparent background, PNG, gritty underworld aesthetic' },
    { name: 'gloves-leather', prompt: 'Leather combat gloves, dark urban crime game style, isometric view, transparent background, PNG, gritty underworld aesthetic' },
    { name: 'gloves-tactical', prompt: 'Tactical gloves with knuckle protection, dark urban crime game style, isometric view, transparent background, PNG, gritty underworld aesthetic' },
    { name: 'mask-bandana', prompt: 'Crime lord bandana mask, dark urban crime game style, isometric view, transparent background, PNG, gritty underworld aesthetic' },
    { name: 'mask-balaclava', prompt: 'Balaclava ski mask, dark urban crime game style, isometric view, transparent background, PNG, gritty underworld aesthetic' },
    { name: 'sunglasses-tactical', prompt: 'Tactical sunglasses, dark urban crime game style, isometric view, transparent background, PNG, gritty underworld aesthetic' },
    { name: 'holster', prompt: 'Hip holster for weapon, dark urban crime game style, isometric view, transparent background, PNG, gritty underworld aesthetic' },
    { name: 'armor-rare', prompt: 'Rare reinforced armor chest piece, dark urban crime game style, isometric view, transparent background, PNG, gritty underworld aesthetic' },
    { name: 'armor-legendary', prompt: 'Legendary tactical armor set, dark urban crime game style, isometric view, transparent background, PNG, gritty underworld aesthetic' },
];

async function generateImage(prompt, outputPath) {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'dall-e-3',
            prompt: prompt,
            size: '1024x1024',
            quality: 'standard',
            response_format: 'b64_json',
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const base64 = data.data[0].b64_json;
    const imageBuffer = Buffer.from(base64, 'base64');
    
    writeFileSync(outputPath, imageBuffer);
    console.log(`✓ Saved: ${outputPath}`);
}

async function main() {
    console.log('TRAP Game - Asset Generator (GPT Image API)\n');
    console.log(`Output directory: ${ASSETS_DIR}\n`);

    for (const asset of ASSETS) {
        const outputPath = join(ASSETS_DIR, `${asset.name}.png`);
        
        if (existsSync(outputPath)) {
            console.log(`⏭ Skipping existing: ${asset.name}.png`);
            continue;
        }
        
        console.log(`Generating: ${asset.name}.png`);
        
        try {
            await generateImage(asset.prompt, outputPath);
            // Rate limiting - wait between requests
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
            console.error(`✗ Failed: ${asset.name} - ${error.message}`);
        }
    }
    
    console.log('\nDone!');
}

main();
