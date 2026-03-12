const fs = require('fs');
const path = require('path');
const https = require('https');

const secrets = JSON.parse(fs.readFileSync('/root/.openclaw/secrets.json', 'utf8'));
const API_KEY = secrets.openai_api_key;
const SPRITES_DIR = '/root/.openclaw/workspace/projects/trap/assets/sprites/player';

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
  // Try a different approach - describe the pose without "dead" or "knocked"
  const prompt = "48x48 pixel art, side view, character lying low to ground, gritty underworld aesthetic, dark hoodie, urban character, pixel art game sprite, horizontal pose";
  
    try {
    await generateImage(prompt, "battle-dead.png");
      } catch (err) {
    console.error('Failed:', err.message);
  }
}

main().catch(console.error);