const fs = require('fs');
const path = require('path');
const https = require('https');

// Load API key
const secrets = JSON.parse(fs.readFileSync('/root/.openclaw/secrets.json', 'utf8'));
const API_KEY = secrets.openai_api_key;

const SPRITES_DIR = '/root/.openclaw/workspace/projects/trap/assets/sprites/player';

// Ensure directory exists
if (!fs.existsSync(SPRITES_DIR)) {
  fs.mkdirSync(SPRITES_DIR, { recursive: true });
}

// Helper to call DALL-E 3
async function generateImage(prompt, filename) {
  const url = 'https://api.openai.com/v1/images/generations';
  
  const data = JSON.stringify({
    model: 'dall-e-3',
    prompt: prompt,
    n: 1,
    size: '1024x1024'
  });

  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', async () => {
        try {
          const json = JSON.parse(body);
          if (json.data && json.data[0] && json.data[0].url) {
            // Download the image
            const imageUrl = json.data[0].url;
            const imageReq = https.get(imageUrl, (imageRes) => {
              const chunks = [];
              imageRes.on('data', chunk => chunks.push(chunk));
              imageRes.on('end', () => {
                const buffer = Buffer.concat(chunks);
                const filepath = path.join(SPRITES_DIR, filename);
                fs.writeFileSync(filepath, buffer);
                                resolve(filepath);
              });
            });
            imageReq.on('error', reject);
          } else {
            console.error('Error response:', json);
            reject(new Error('No image URL in response'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Player sprite prompts
const playerSprites = [
  // Walking sprites - top-down view, gritty underworld character in dark hoodie
  { prompt: "32x32 pixel art, top-down view, character walking down, gritty underworld aesthetic, dark hoodie silhouette, urban street background, asphalt and neon lighting, game sprite, pixel art style", filename: "walk-down-1.png" },
  { prompt: "32x32 pixel art, top-down view, character walking down frame 2, gritty underworld aesthetic, dark hoodie silhouette, urban street, pixel art game sprite", filename: "walk-down-2.png" },
  { prompt: "32x32 pixel art, top-down view, character walking up, gritty underworld aesthetic, dark hoodie silhouette, urban street background, pixel art game sprite", filename: "walk-up-1.png" },
  { prompt: "32x32 pixel art, top-down view, character walking up frame 2, gritty underworld aesthetic, dark hoodie silhouette, pixel art game sprite", filename: "walk-up-2.png" },
  { prompt: "32x32 pixel art, top-down view, character walking left, gritty underworld aesthetic, dark hoodie silhouette, urban street, pixel art game sprite", filename: "walk-left-1.png" },
  { prompt: "32x32 pixel art, top-down view, character walking left frame 2, gritty underworld aesthetic, dark hoodie silhouette, pixel art game sprite", filename: "walk-left-2.png" },
  { prompt: "32x32 pixel art, top-down view, character walking right, gritty underworld aesthetic, dark hoodie silhouette, urban street, pixel art game sprite", filename: "walk-right-1.png" },
  { prompt: "32x32 pixel art, top-down view, character walking right frame 2, gritty underworld aesthetic, dark hoodie silhouette, pixel art game sprite", filename: "walk-right-2.png" },
  
  // Battle sprites - side view, 48x48 pixel art (avoiding violent language)
  { prompt: "48x48 pixel art, side view, character idle stance, gritty underworld aesthetic, dark hoodie, urban fighter, pixel art game sprite, combat ready pose", filename: "battle-idle.png" },
  { prompt: "48x48 pixel art, side view, character action pose, gritty underworld aesthetic, dark hoodie, urban fighter, pixel art game sprite, dynamic move", filename: "battle-attack.png" },
  { prompt: "48x48 pixel art, side view, character defensive stance, gritty underworld aesthetic, dark hoodie, urban fighter, pixel art game sprite, arms up ready", filename: "battle-defend.png" },
  { prompt: "48x48 pixel art, side view, character wincing, gritty underworld aesthetic, dark hoodie, urban fighter, pixel art game sprite, taking damage", filename: "battle-hurt.png" },
  { prompt: "48x48 pixel art, side view, character knocked down, gritty underworld aesthetic, dark hoodie, urban fighter, pixel art game sprite, on the ground", filename: "battle-dead.png" },
  
  // Portraits - 128x128, gritty underworld character face
  { prompt: "128x128 pixel art, face portrait, smiling, gritty underworld aesthetic, weathered face, urban character, pixel art style", filename: "portrait-happy.png" },
  { prompt: "128x128 pixel art, face portrait, neutral expression, gritty underworld aesthetic, weathered face, urban character, pixel art style", filename: "portrait-neutral.png" },
  { prompt: "128x128 pixel art, face portrait, intense expression, gritty underworld aesthetic, weathered face, determined look, urban character, pixel art style", filename: "portrait-angry.png" },
  { prompt: "128x128 pixel art, face portrait, wincing, gritty underworld aesthetic, weathered face, uncomfortable, urban character, pixel art style", filename: "portrait-hurt.png" },
  { prompt: "128x128 pixel art, face portrait, unconscious, gritty underworld aesthetic, relaxed face, urban character, pixel art style", filename: "portrait-dead.png" }
];

async function main() {
    
  for (const sprite of playerSprites) {
    try {
            await generateImage(sprite.prompt, sprite.filename);
      // Rate limiting - wait between requests
      await new Promise(r => setTimeout(r, 2000));
    } catch (err) {
      console.error(`Failed to generate ${sprite.filename}:`, err.message);
    }
  }
  
  }

main().catch(console.error);