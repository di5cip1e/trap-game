#!/usr/bin/env node
/**
 * Environmental Object Generator for Trap Game
 * Uses DALL-E to generate 32x32 or 48x48 pixel art sprites
 */

import { readFileSync } from 'fs';
import path from 'path';

// Load API key from secrets
const secrets = JSON.parse(readFileSync('/root/.openclaw/secrets.json', 'utf8'));
const OPENAI_API_KEY = secrets.openai_api_key;

const OUTPUT_DIR = '/root/.openclaw/workspace/projects/trap/assets/sprites/objects/environment/';

// Color palette from VISION.md
const PALETTE = {
  asphaltBlack: '#0a0a0a',
  stormGray: '#2d2d2d',
  burntOrange: '#8b4513',
  neonAmber: '#ffaa00',
  neonTeal: '#00ffcc',
  bloodRed: '#cc2222',
  graffitiPink: '#ff00aa',
  moldGreen: '#334433',
  steelBlue: '#334455'
};

// List of objects to generate - grouped by category
const OBJECTS = {
  // Street/Urban Objects
  street: [
    { name: 'street-lamp', prompt: 'Top-down view of a street lamp, dark metal post with glowing light casting pool of yellow light, pixel art style, gritty urban, 48x48' },
    { name: 'fire-hydrant', prompt: 'Top-down view of a red fire hydrant, dark gray concrete around it, pixel art style, gritty urban, 48x48' },
    { name: 'trash-can-metal', prompt: 'Top-down view of a metal trash can, dark gray with rust spots, pixel art style, gritty urban, 48x48' },
    { name: 'dumpster-closed', prompt: 'Top-down view of a large green dumpster, closed lid, pixel art style, gritty urban, 48x48' },
    { name: 'dumpster-open', prompt: 'Top-down view of an open dumpster, trash overflowing, pixel art style, gritty urban, 48x48' },
    { name: 'cardboard-box-scattered', prompt: 'Top-down view of scattered cardboard boxes, worn and dirty, pixel art style, gritty urban, 48x48' },
    { name: 'shopping-cart', prompt: 'Top-down view of a metal shopping cart, pixel art style, gritty urban, 48x48' },
    { name: 'park-bench', prompt: 'Top-down view of a park bench, metal and wood, pixel art style, gritty urban, 48x48' },
    { name: 'newspaper-stand', prompt: 'Top-down view of a newspaper stand, glass and metal, pixel art style, gritty urban, 48x48' },
    { name: 'phone-booth', prompt: 'Top-down view of an old phone booth, red payphone inside, pixel art style, gritty urban, 48x48' },
    { name: 'mailbox', prompt: 'Top-down view of a blue US mailbox, street side, pixel art style, gritty urban, 48x48' },
    { name: 'traffic-cone', prompt: 'Top-down view of an orange traffic cone, pixel art style, gritty urban, 48x48' },
    { name: 'barricade', prompt: 'Top-down view of a wooden barricade, construction style, pixel art style, gritty urban, 48x48' },
    { name: 'fence-section', prompt: 'Top-down view of a chain-link fence section, pixel art style, gritty urban, 48x48' },
    { name: 'guard-rail', prompt: 'Top-down view of a metal guard rail, pixel art style, gritty urban, 48x48' },
    { name: 'pothole', prompt: 'Top-down view of a pothole in asphalt, dark cracked center, pixel art style, gritty urban, 48x48' },
  ],
  // Vehicles (parked)
  vehicles: [
    { name: 'car-sedan', prompt: 'Top-down view of a parked sedan car, dark color, pixel art style, gritty urban, 48x48' },
    { name: 'car-suv', prompt: 'Top-down view of a parked SUV, large dark vehicle, pixel art style, gritty urban, 48x48' },
    { name: 'van-cargo', prompt: 'Top-down view of a cargo van, white or gray, pixel art style, gritty urban, 48x48' },
    { name: 'motorcycle', prompt: 'Top-down view of a parked motorcycle, pixel art style, gritty urban, 48x48' },
    { name: 'truck-delivery', prompt: 'Top-down view of a delivery truck, box truck style, pixel art style, gritty urban, 48x48' },
    { name: 'bicycle', prompt: 'Top-down view of a parked bicycle, pixel art style, gritty urban, 48x48' },
  ],
  // Urban Details
  urban: [
    { name: 'graffiti-wall', prompt: 'Top-down view of wall with colorful graffiti art, pink and teal spray paint, pixel art style, gritty urban, 48x48' },
    { name: 'broken-window', prompt: 'Top-down view of broken window shards on ground, pixel art style, gritty urban, 48x48' },
    { name: 'brick-wall', prompt: 'Top-down view of a brick wall section, pixel art style, gritty urban, 48x48' },
    { name: 'faded-paint', prompt: 'Top-down view of wall with faded peeling paint, pixel art style, gritty urban, 48x48' },
    { name: 'steam-vent', prompt: 'Top-down view of a steam vent on sidewalk, rising vapor, pixel art style, gritty urban, 48x48' },
    { name: 'manhole-cover', prompt: 'Top-down view of a circular manhole cover, dark metal, pixel art style, gritty urban, 48x48' },
    { name: 'sprinkler', prompt: 'Top-down view of a lawn sprinkler, spraying water, pixel art style, gritty urban, 48x48' },
    { name: 'pool-water', prompt: 'Top-down view of a puddle of water on ground, reflective, pixel art style, gritty urban, 48x48' },
    { name: 'oil-stain', prompt: 'Top-down view of an oil stain on pavement, dark rainbow slick, pixel art style, gritty urban, 48x48' },
  ],
  // Indoor/Safehouse
  indoor: [
    { name: 'mattress', prompt: 'Top-down view of a worn mattress, stained and dirty, pixel art style, gritty urban, 48x48' },
    { name: 'old-chair', prompt: 'Top-down view of an old wooden chair, worn and broken, pixel art style, gritty urban, 48x48' },
    { name: 'table', prompt: 'Top-down view of a wooden table, scratched and worn, pixel art style, gritty urban, 48x48' },
    { name: 'crates', prompt: 'Top-down view of wooden crates stacked, pixel art style, gritty urban, 48x48' },
    { name: 'barrels', prompt: 'Top-down view of industrial barrels, metal or plastic, pixel art style, gritty urban, 48x48' },
    { name: 'lockers', prompt: 'Top-down view of metal lockers, pixel art style, gritty urban, 48x48' },
    { name: 'safe', prompt: 'Top-down view of a metal safe, pixel art style, gritty urban, 48x48' },
    { name: 'scale', prompt: 'Top-down view of a weighing scale, digital or mechanical, pixel art style, gritty urban, 48x48' },
    { name: 'burner-phone', prompt: 'Top-down view of a cheap burner phone, pixel art style, gritty urban, 48x48' },
    { name: 'cash-pile', prompt: 'Top-down view of a pile of cash money, hundred dollar bills, pixel art style, gritty urban, 48x48' },
  ],
  // Nature
  nature: [
    { name: 'dead-tree', prompt: 'Top-down view of a dead tree stump, bare branches, pixel art style, gritty urban, 48x48' },
    { name: 'bushes', prompt: 'Top-down view of overgrown bushes, pixel art style, gritty urban, 48x48' },
    { name: 'weeds', prompt: 'Top-down view of weeds growing through concrete, pixel art style, gritty urban, 48x48' },
    { name: 'puddle', prompt: 'Top-down view of a small puddle, dark water, pixel art style, gritty urban, 48x48' },
  ]
};

// Flatten all objects
const allObjects = [
  ...OBJECTS.street,
  ...OBJECTS.vehicles,
  ...OBJECTS.urban,
  ...OBJECTS.indoor,
  ...OBJECTS.nature
];


// We'll use a simpler approach - save prompts to a file for later generation
// since DALL-E generation takes time and we need to handle it carefully

const fs = await import('fs');
const https = await import('https');

// Function to generate image using DALL-E
async function generateImage(obj, index) {
    
  const postData = JSON.stringify({
    model: "dall-e-3",
    prompt: obj.prompt,
    n: 1,
    size: "1024x1024"
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.openai.com',
      path: '/v1/images/generations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.data && parsed.data[0] && parsed.data[0].url) {
            resolve(parsed.data[0].url);
          } else if (parsed.error) {
            reject(new Error(parsed.error.message));
          } else {
            reject(new Error('Unexpected response format'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Function to download image and save it
async function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filename);
    
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filename, () => {});
      reject(err);
    });
  });
}

// Generate all objects
const results = [];

for (let i = 0; i < allObjects.length; i++) {
  const obj = allObjects[i];
  const filename = `${OUTPUT_DIR}${obj.name}.png`;
  
  try {
    const imageUrl = await generateImage(obj, i);
    await downloadImage(imageUrl, filename);
        results.push({ name: obj.name, filename: `${obj.name}.png`, success: true });
  } catch (error) {
    console.error(`✗ Failed: ${obj.name} - ${error.message}`);
    results.push({ name: obj.name, filename: `${obj.name}.png`, success: false, error: error.message });
  }
  
  // Rate limiting - wait between requests
  await new Promise(r => setTimeout(r, 2000));
}

// Summary
const successful = results.filter(r => r.success).length;
const failed = results.filter(r => !r.success).length;

if (failed > 0) {
    results.filter(r => !r.success).forEach(r => }

// Write results to JSON for integration
fs.writeFileSync(
  `${OUTPUT_DIR}generated-objects.json`, 
  JSON.stringify(results, null, 2)
);
