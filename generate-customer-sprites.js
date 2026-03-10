const fs = require('fs');
const path = require('path');
const https = require('https');

// Load API key
const secrets = JSON.parse(fs.readFileSync('/root/.openclaw/secrets.json', 'utf8'));
const API_KEY = secrets.openai_api_key;

const BASE_DIR = '/root/.openclaw/workspace/projects/trap/assets/sprites/npcs';

// Customer types with their sprite requirements
const customerTypes = [
    {
        type: 'junkie',
        name: 'Junkie',
        description: 'Desperate, shaky, will do anything for a fix',
        sprites: [
            // Walking sprites - nervous, hunched figure
            { prompt: "32x32 pixel art, top-down view, skinny desperate character walking down, dirty clothes, shaky posture, urban street background, game sprite, pixel art style", filename: "walk-down.ppm" },
            { prompt: "32x32 pixel art, top-down view, nervous character walking left, hunched shoulders, dirty hoodie, pixel art game sprite", filename: "walk-left.ppm" },
            { prompt: "32x32 pixel art, top-down view, nervous character walking right, dirty clothes, looking around nervously, pixel art game sprite", filename: "walk-right.ppm" },
            { prompt: "32x32 pixel art, top-down view, desperate character walking up, messy hair, threadbare clothing, urban street, pixel art game sprite", filename: "walk-up.ppm" },
            
            // Portraits - desperate, shaky, varied emotions
            { prompt: "128x128 pixel art, face portrait, desperate pleading expression, sweating, wide desperate eyes, messy unwashed face, pixel art style", filename: "portrait-desperate.ppm" },
            { prompt: "128x128 pixel art, face portrait, nervous shaking expression, anxious, jittery, pixel art style", filename: "portrait-nervous.ppm" },
            { prompt: "128x128 pixel art, face portrait, sad tearful expression, defeated, hopeless, pixel art style", filename: "portrait-sad.ppm" },
            { prompt: "128x128 pixel art, face portrait, angry frustrated expression, desperate anger, pixel art style", filename: "portrait-angry.ppm" },
            { prompt: "128x128 pixel art, face portrait, blank expression, zoned out, pixel art style", filename: "portrait-neutral.ppm" }
        ]
    },
    {
        type: 'casual',
        name: 'Casual User',
        description: 'Weekend user, middle-class',
        sprites: [
            // Walking - normal relaxed posture
            { prompt: "32x32 pixel art, top-down view, average guy walking down, casual clothes t-shirt and jeans, relaxed posture, urban street background, game sprite", filename: "walk-down.ppm" },
            { prompt: "32x32 pixel art, top-down view, casual guy walking left, hoodie or jacket, normal posture, pixel art game sprite", filename: "walk-left.ppm" },
            { prompt: "32x32 pixel art, top-down view, casual guy walking right, relaxed clothes, pixel art game sprite", filename: "walk-right.ppm" },
            { prompt: "32x32 pixel art, top-down view, regular guy walking up, everyday clothes, street background, pixel art game sprite", filename: "walk-up.ppm" },
            
            // Portraits
            { prompt: "128x128 pixel art, face portrait, friendly neutral expression, average looking person, casual, pixel art style", filename: "portrait-neutral.ppm" },
            { prompt: "128x128 pixel art, face portrait, happy smile, relaxed, weekend vibe, pixel art style", filename: "portrait-happy.ppm" },
            { prompt: "128x128 pixel art, face portrait, slightly tired expression, monday morning vibes, pixel art style", filename: "portrait-tired.ppm" },
            { prompt: "128x128 pixel art, face portrait, curious expression, looking around, pixel art style", filename: "portrait-curious.ppm" },
            { prompt: "128x128 pixel art, face portrait, content expression, satisfied, pixel art style", filename: "portrait-content.ppm" }
        ]
    },
    {
        type: 'party-guy',
        name: 'Party Guy',
        description: 'Wealthy, spends big at night',
        sprites: [
            // Walking - flashy, confident
            { prompt: "32x32 pixel art, top-down view, flashy party guy walking down, designer clothes, gold accessories, confident swagger, urban nightclub background, game sprite", filename: "walk-down.ppm" },
            { prompt: "32x32 pixel art, top-down view, wealthy party guy walking left, flashy jacket, sunglasses, urban street, pixel art game sprite", filename: "walk-left.ppm" },
            { prompt: "32x32 pixel art, top-down view, clubber walking right, flashy outfit, gold chain, pixel art game sprite", filename: "walk-right.ppm" },
            { prompt: "32x32 pixel art, top-down view, confident guy walking up, designer clothes, party vibe, pixel art game sprite", filename: "walk-up.ppm" },
            
            // Portraits
            { prompt: "128x128 pixel art, face portrait, flashy confident smile, gold teeth, party vibe, pixel art style", filename: "portrait-happy.ppm" },
            { prompt: "128x128 pixel art, face portrait, party expression, excited, energetic, pixel art style", filename: "portrait-excited.ppm" },
            { prompt: "128x128 pixel art, face portrait, cool sunglasses look, confident, looking cool, pixel art style", filename: "portrait-cool.ppm" },
            { prompt: "128x128 pixel art, face portrait,partying expression, slightly intoxicated happy, pixel art style", filename: "portrait-party.ppm" },
            { prompt: "128x128 pixel art, face portrait, looking for fun, excited expression, pixel art style", filename: "portrait-expectant.ppm" }
        ]
    },
    {
        type: 'hipster',
        name: 'Hipster',
        description: 'Thinks they\'re above the street life',
        sprites: [
            // Walking - distinctive, indie
            { prompt: "32x32 pixel art, top-down view, hipster walking down, thick glasses, beard, flannel shirt, vintage clothes, urban street background, game sprite", filename: "walk-down.ppm" },
            { prompt: "32x32 pixel art, top-down view, indie hipster walking left, vintage jacket, skinny jeans, pixel art game sprite", filename: "walk-left.ppm" },
            { prompt: "32x32 pixel art, top-down view, bearded hipster walking right, interesting fashion, pixel art game sprite", filename: "walk-right.ppm" },
            { prompt: "32x32 pixel art, top-down view, distinctive looking guy walking up, unique style, pixel art game sprite", filename: "walk-up.ppm" },
            
            // Portraits
            { prompt: "128x128 pixel art, face portrait, superior smirking expression, thinking they're better than everyone, pixel art style", filename: "portrait-smug.ppm" },
            { prompt: "128x128 pixel art, face portrait, ironic expression, hipster glasses, pixel art style", filename: "portrait-ironic.ppm" },
            { prompt: "128x128 pixel art, face portrait, bored expression, too cool, pixel art style", filename: "portrait-bored.ppm" },
            { prompt: "128x128 pixel art, face portrait, judgmental expression, looking down on others, pixel art style", filename: "portrait-judgmental.ppm" },
            { prompt: "128x128 pixel art, face portrait, artistic expression, deep in thought, pixel art style", filename: "portrait-thoughtful.ppm" }
        ]
    },
    {
        type: 'old-head',
        name: 'Old Head',
        description: 'Been in the game forever, wise',
        sprites: [
            // Walking - slow, experienced
            { prompt: "32x32 pixel art, top-down view, older experienced man walking down, grey hair, veteran leather jacket, wise presence, urban street background, game sprite", filename: "walk-down.ppm" },
            { prompt: "32x32 pixel art, top-down view, old school guy walking left, experienced look, weathered face, pixel art game sprite", filename: "walk-left.ppm" },
            { prompt: "32x32 pixel art, top-down view, veteran walking right, confident slow pace, pixel art game sprite", filename: "walk-right.ppm" },
            { prompt: "32x32 pixel art, top-down view, older man walking up, seen it all, calm demeanor, pixel art game sprite", filename: "walk-up.ppm" },
            
            // Portraits
            { prompt: "128x128 pixel art, face portrait, wise knowing smile, older experienced face, seen it all, pixel art style", filename: "portrait-wise.ppm" },
            { prompt: "128x128 pixel art, face portrait, serious expression, old school, weathered but sharp, pixel art style", filename: "portrait-serious.ppm" },
            { prompt: "128x128 pixel art, face portrait, grandfatherly kindness, warm, pixel art style", filename: "portrait-kind.ppm" },
            { prompt: "128x128 pixel art, face portrait, skeptical expression, seen many things, pixel art style", filename: "portrait-skeptical.ppm" },
            { prompt: "128x128 pixel art, face portrait, stoic expression, calm and collected, pixel art style", filename: "portrait-stoic.ppm" }
        ]
    },
    {
        type: 'cop',
        name: 'Undercover Cop',
        description: 'Buys to entrap players - looks normal but dangerous',
        sprites: [
            // Walking - looks normal, casual clothes
            { prompt: "32x32 pixel art, top-down view, undercover plainclothes cop walking down, looks like normal civilian, casual clothes, urban street background, game sprite", filename: "walk-down.ppm" },
            { prompt: "32x32 pixel art, top-down view, undercover detective walking left, looks ordinary, pixel art game sprite", filename: "walk-left.ppm" },
            { prompt: "32x32 pixel art, top-down view, plainclothes officer walking right, blending in, pixel art game sprite", filename: "walk-right.ppm" },
            { prompt: "32x32 pixel art, top-down view, undercover walking up, unremarkable appearance, pixel art game sprite", filename: "walk-up.ppm" },
            
            // Portraits - normal looking but suspicious
            { prompt: "128x128 pixel art, face portrait, neutral expression, plain ordinary face, forgettable, pixel art style", filename: "portrait-neutral.ppm" },
            { prompt: "128x128 pixel art, face portrait, friendly expression, trying too hard to seem normal, pixel art style", filename: "portrait-friendly.ppm" },
            { prompt: "128x128 pixel art, face portrait, slightly nervous expression, pretending to be casual, pixel art style", filename: "portrait-nervous.ppm" },
            { prompt: "128x128 pixel art, face portrait, serious expression, authority in eyes, pixel art style", filename: "portrait-serious.ppm" },
            { prompt: "128x128 pixel art, face portrait, observant expression, watching closely, pixel art style", filename: "portrait-observant.ppm" }
        ]
    },
    {
        type: 'gangbanger',
        name: 'Gangbanger',
        description: 'Buys for the crew - dangerous, bulk orders',
        sprites: [
            // Walking - tough, threatening
            { prompt: "32x32 pixel art, top-down view, tough gang member walking down, menacing aura, bandana, urban street background, game sprite", filename: "walk-down.ppm" },
            { prompt: "32x32 pixel art, top-down view, street tough walking left, aggressive posture, pixel art game sprite", filename: "walk-left.ppm" },
            { prompt: "32x32 pixel art, top-down view, crew member walking right, intimidating, pixel art game sprite", filename: "walk-right.ppm" },
            { prompt: "32x32 pixel art, top-down view, rough character walking up, looking for trouble, pixel art game sprite", filename: "walk-up.ppm" },
            
            // Portraits
            { prompt: "128x128 pixel art, face portrait, tough angry expression, menacing, pixel art style", filename: "portrait-angry.ppm" },
            { prompt: "128x128 pixel art, face portrait, mean expression, don't mess with me, pixel art style", filename: "portrait-mean.ppm" },
            { prompt: "128x128 pixel art, face portrait, serious expression, business mode, pixel art style", filename: "portrait-serious.ppm" },
            { prompt: "128x128 pixel art, face portrait, suspicious expression, watching everyone, pixel art style", filename: "portrait-suspicious.ppm" },
            { prompt: "128x128 pixel art, face portrait, cold expression, no emotion, pixel art style", filename: "portrait-cold.ppm" }
        ]
    },
    {
        type: 'tourist',
        name: 'Tourist',
        description: 'Out of towner looking for a good time - easy money',
        sprites: [
            // Walking - lost, out of place
            { prompt: "32x32 pixel art, top-down view, lost tourist walking down, tourist clothes like hawaiian shirt, camera around neck, looking around confused, urban street, game sprite", filename: "walk-down.ppm" },
            { prompt: "32x32 pixel art, top-down view, tourist walking left, out of place clothing, backpack, pixel art game sprite", filename: "walk-left.ppm" },
            { prompt: "32x128 pixel art, top-down view, visitor walking right, confused tourist, pixel art game sprite", filename: "walk-right.ppm" },
            { prompt: "32x32 pixel art, top-down view, tourist walking up, looking for directions, pixel art game sprite", filename: "walk-up.ppm" },
            
            // Portraits - naive, excited, lost
            { prompt: "128x128 pixel art, face portrait, excited amazed expression, wide eyes, amazed by everything, pixel art style", filename: "portrait-amazed.ppm" },
            { prompt: "128x128 pixel art, face portrait, confused expression, lost tourist, where am I, pixel art style", filename: "portrait-confused.ppm" },
            { prompt: "128x128 pixel art, face portrait, nervous expression, out of comfort zone, pixel art style", filename: "portrait-nervous.ppm" },
            { prompt: "128x128 pixel art, face portrait, happy excited expression, having an adventure, pixel art style", filename: "portrait-excited.ppm" },
            { prompt: "128x128 pixel art, face portrait, naive innocent expression, doesn't know the danger, pixel art style", filename: "portrait-naive.ppm" }
        ]
    }
];

// Helper to call DALL-E 3
async function generateImage(prompt, filepath) {
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
                                fs.writeFileSync(filepath, buffer);
                                console.log(`✓ Saved: ${path.basename(filepath)}`);
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
    console.log('Generating customer sprites for Trap game...\n');
    
    for (const customer of customerTypes) {
        const spriteDir = path.join(BASE_DIR, customer.type);
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(spriteDir)) {
            fs.mkdirSync(spriteDir, { recursive: true });
        }
        
        console.log(`\n=== Generating ${customer.name} sprites ===`);
        
        for (const sprite of customer.sprites) {
            try {
                const filepath = path.join(spriteDir, sprite.filename);
                console.log(`Generating: ${sprite.filename}`);
                await generateImage(sprite.prompt, filepath);
                // Rate limiting - wait between requests
                await new Promise(r => setTimeout(r, 2000));
            } catch (err) {
                console.error(`Failed to generate ${sprite.filename}:`, err.message);
            }
        }
    }
    
    console.log('\n✓ All customer sprite generation complete!');
    console.log('\nNote: Remember to convert PPM files to PNG for web use.');
}

main().catch(console.error);