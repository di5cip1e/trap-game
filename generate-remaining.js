const fs = require('fs');
const path = require('path');
const https = require('https');

const secrets = JSON.parse(fs.readFileSync('/root/.openclaw/secrets.json', 'utf8'));
const API_KEY = secrets.openai_api_key;
const SPRITES_DIR = '/root/.openclaw/workspace/projects/trap/assets/sprites/player';

const remainingSprites = [
  // Battle sprites (only ones missing)
  { prompt: "48x48 pixel art, side view, character action pose, gritty underworld aesthetic, dark hoodie, urban fighter, pixel art game sprite, dynamic move", filename: "battle-attack.png" },
  { prompt: "48x48 pixel art, side view, character defensive stance, gritty underworld aesthetic, dark hoodie, urban fighter, pixel art game sprite, arms up ready", filename: "battle-defend.png" },
  { prompt: "48x48 pixel art, side view, character wincing, gritty underworld aesthetic, dark hoodie, urban fighter, pixel art game sprite, taking damage", filename: "battle-hurt.png" },
  { prompt: "48x48 pixel art, side view, character knocked down, gritty underworld aesthetic, dark hoodie, urban fighter, pixel art game sprite, on the ground", filename: "battle-dead.png" },
  
  // Portraits
  { prompt: "128x128 pixel art, face portrait, smiling, gritty underworld aesthetic, weathered face, urban character, pixel art style", filename: "portrait-happy.png" },
  { prompt: "128x128 pixel art, face portrait, neutral expression, gritty underworld aesthetic, weathered face, urban character, pixel art style", filename: "portrait-neutral.png" },
  { prompt: "128x128 pixel art, face portrait, intense expression, gritty underworld aesthetic, weathered face, determined look, urban character, pixel art style", filename: "portrait-angry.png" },
  { prompt: "128x128 pixel art, face portrait, wincing, gritty underworld aesthetic, weathered face, uncomfortable, urban character, pixel art style", filename: "portrait-hurt.png" },
  { prompt: "128x128 pixel art, face portrait, unconscious, gritty underworld aesthetic, relaxed face, urban character, pixel art style", filename: "portrait-dead.png" }
];

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
            const imageUrl = json.data[0].url;
            const imageReq = https.get(imageUrl, (imageRes) => {
              const chunks = [];
              imageRes.on('data', chunk => chunks.push(chunk));
              imageRes.on('end', () => {
                const buffer = Buffer.concat(chunks);
                const filepath = path.join(SPRITES_DIR, filename);
                fs.writeFileSync(filepath, buffer);
                console.log(`✓ Saved: ${filename}`);
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

async function main() {
  console.log('Generating remaining player sprites...\n');
  
  for (const sprite of remainingSprites) {
    try {
      console.log(`Generating: ${sprite.filename}`);
      await generateImage(sprite.prompt, sprite.filename);
      await new Promise(r => setTimeout(r, 2000));
    } catch (err) {
      console.error(`Failed to generate ${sprite.filename}:`, err.message);
    }
  }
  
  console.log('\n✓ All remaining sprites generated!');
}

main().catch(console.error);