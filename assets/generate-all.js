const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: 'YOUR_OPENAI_KEY_HERE'
});

const ASSETS_DIR = '/root/.openclaw/workspace/projects/trap/assets';

// Color palette for reference in prompts
const COLORS = {
  asphaltBlack: '#0a0a0a',
  stormGray: '#2d2d2d',
  neonAmber: '#ffaa00',
  neonTeal: '#00ffcc',
  dangerRed: '#cc2222'
};

// Asset definitions with detailed prompts
const assets = [
  // Player Sprites (32x32 top-down pixel art)
  {
    name: 'player-top-down.png',
    prompt: 'Top-down pixel art sprite of a male underworld character, dark hoodie, casting shadows, gritty urban style, 32x32 pixels, dark color palette with neon amber accents, game-ready sprite sheet, clean edges, video game asset'
  },
  {
    name: 'male-char.png',
    prompt: 'Character creation icon for male underworld character, top-down view, dark hoodie, subtle shadow, 32x32 pixel art, game UI icon style, gritty aesthetic'
  },
  {
    name: 'female-char.png',
    prompt: 'Character creation icon for female underworld character, top-down view, dark jacket, subtle shadow, 32x32 pixel art, game UI icon style, gritty aesthetic'
  },
  
  // NPCs (32x32 top-down)
  {
    name: 'npc-police.png',
    prompt: 'Top-down pixel art NPC of a police officer, blue uniform visible, badge on chest, authoritative pose, 32x32, gritty game sprite, urban underworld aesthetic'
  },
  {
    name: 'npc-corrupt-cop.png',
    prompt: 'Top-down pixel art NPC of a corrupt police officer, wearing sunglasses, gold chain visible, shady expression, 32x32, gritty game sprite, underworld criminal aesthetic with neon teal accent'
  },
  {
    name: 'npc-rival.png',
    prompt: 'Top-down pixel art NPC of a rival gang member, neon pink stripes on jacket, menacing look, 32x32, gritty game sprite, danger red accent colors'
  },
  {
    name: 'npc-buyer.png',
    prompt: 'Top-down pixel art NPC of a nervous buyer, casual hoodie, nervous body language, looking around suspiciously, 32x32, gritty game sprite'
  },
  {
    name: 'npc-vendor.png',
    prompt: 'Top-down pixel art NPC of a street vendor with a small stand, colorful items displayed, 32x32, gritty urban game sprite, small cart or table prop'
  },
  {
    name: 'npc-shop-owner.png',
    prompt: 'Top-down pixel art NPC of a shop owner standing behind counter, looking attentive, 32x32, gritty game sprite, underworld shop aesthetic'
  },
  
  // Tiles (32x32 seamless)
  {
    name: 'tile-street.png',
    prompt: 'Seamless tileable top-down texture of cracked asphalt, urban street, dark gray with cracks and wear, 32x32 pixels, game tile, gritty urban aesthetic'
  },
  {
    name: 'tile-sidewalk.png',
    prompt: 'Seamless tileable top-down texture of broken concrete sidewalk, cracks and debris, 32x32 pixels, game tile, urban decay'
  },
  {
    name: 'tile-wall-brick.png',
    prompt: 'Tileable side-view brick wall texture with graffiti art, urban alley aesthetic, dark reds and grays with neon amber spray paint, 32x32, game tile'
  },
  {
    name: 'tile-concrete-cracked.png',
    prompt: 'Seamless tileable top-down texture of warehouse floor, cracked concrete, dark and dusty, 32x32 pixels, game tile, industrial aesthetic'
  },
  {
    name: 'tile-wood-floor.png',
    prompt: 'Seamless tileable top-down texture of worn wooden floorboards, dark wood grain, slightly dirty, 32x32 pixels, game tile, underground hideout aesthetic'
  },
  {
    name: 'tile-alley.png',
    prompt: 'Seamless tileable top-down texture of dark alley with trash and debris, shadows, 32x32 pixels, game tile, gritty underworld aesthetic'
  },
  {
    name: 'tile-dumpster.png',
    prop: true,
    prompt: 'Top-down game sprite of a dumpster in an alley, metal container, dirty and worn, 32x32 pixels, game prop, urban trash container'
  },
  {
    name: 'tile-dirty-floor.png',
    prompt: 'Seamless tileable top-down texture of dirty interior floor, stained concrete, grime and wear, 32x32 pixels, game tile, seedy interior'
  },
  {
    name: 'tile-wall-interior.png',
    prompt: 'Tileable side-view of interior wall, dirty plaster or Panel, gray-brown tones, 32x32, game tile, abandoned building aesthetic'
  },
  
  // Objects
  {
    name: 'cardboard-box.png',
    prop: true,
    prompt: 'Top-down game sprite of a cardboard box, brown cardboard, slightly worn, storage prop, 32x32 pixels, safehouse item'
  },
  {
    name: 'storage-unit.png',
    prop: true,
    prompt: 'Top-down or isometric game sprite of a storage unit door, metal rolling door, industrial lock, 64x64 pixels scaled to icon, gritty underworld aesthetic'
  },
  {
    name: 'workstation.png',
    prop: true,
    prompt: 'Top-down game sprite of a work table with supplies, tools and materials spread out, 48x48 pixels, gritty safehouse crafting station'
  },
  
  // UI
  {
    name: 'hud-panel-bar.png',
    prompt: 'Game UI element, horizontal HUD panel bar, dark semi-transparent background with neon teal border trim, 256x32 pixels, sleek game interface'
  },
  {
    name: 'ui-panel.png',
    prompt: 'Game UI panel background, dark semi-transparent overlay with subtle border, 128x128 pixels, modern game interface style, neon amber accent'
  },
  
  // Icons (16x16)
  {
    name: 'icon-product.png',
    prompt: 'Tiny game icon of product (bag of drugs/substances), small packet or bag silhouette, 16x16 pixels, UI icon style, underworld commodity'
  },
  {
    name: 'icon-raw-materials.png',
    prompt: 'Tiny game icon of raw materials, small bundle or ingredients, 16x16 pixels, UI icon style, supplies for production'
  },
  
  // Background
  {
    name: 'background-creation.png',
    prompt: 'Full screen game background for character creation screen, dark gritty underworld cityscape silhouette, neon amber and neon teal lighting accents, atmospheric fog, 1920x1080, digital art'
  }
];

async function generateImage(asset, index) {
  console.log(`[${index + 1}/${assets.length}] Generating ${asset.name}...`);
  
  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: asset.prompt,
      size: '1024x1024',
      quality: 'standard',
      n: 1
    });
    
    const imageUrl = response.data[0].url;
    console.log(`  Image URL received, downloading...`);
    
    // Download the image
    const imageResponse = await fetch(imageUrl);
    const buffer = await imageResponse.arrayBuffer();
    
    const filepath = path.join(ASSETS_DIR, asset.name);
    fs.writeFileSync(filepath, Buffer.from(buffer));
    
    console.log(`  ✓ Saved to ${filepath}`);
    return true;
  } catch (error) {
    console.error(`  ✗ Error generating ${asset.name}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🎨 Starting DALL-E 3 asset generation...\n');
  console.log(`Target directory: ${ASSETS_DIR}\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < assets.length; i++) {
    const result = await generateImage(assets[i], i);
    if (result) {
      successCount++;
    } else {
      failCount++;
    }
    // Add a small delay between requests to avoid rate limiting
    if (i < assets.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log(`\n✅ Generation complete!`);
  console.log(`   Success: ${successCount}/${assets.length}`);
  console.log(`   Failed: ${failCount}/${assets.length}`);
}

main().catch(console.error);