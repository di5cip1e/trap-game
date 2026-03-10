const fs = require('fs');
const path = require('path');
const https = require('https');

// Load API key
const secrets = JSON.parse(fs.readFileSync('/root/.openclaw/secrets.json', 'utf8'));
const API_KEY = secrets.openai_api_key;

const BASE_DIR = '/root/.openclaw/workspace/projects/trap/assets/sprites/suppliers';

// Supplier types with their sprite requirements
const supplierTypes = [
    {
        id: 'mafia',
        name: 'Mafia Boss',
        fullName: 'Don Antonio Moretti',
        description: 'Italian mob boss in formal suit',
        sprites: [
            // Walking sprites - professional, confident
            { prompt: "32x32 pixel art, top-down view, Italian mob boss walking down, dark expensive suit, gold watch, confident stride, urban street background, game sprite", filename: "walk-down.ppm" },
            { prompt: "32x32 pixel art, top-down view, mob boss walking left, pinstripe suit, sunglasses, professional look, pixel art game sprite", filename: "walk-left.ppm" },
            { prompt: "32x32 pixel art, top-down view, organized crime boss walking right, expensive coat, calculating expression, pixel art game sprite", filename: "walk-right.ppm" },
            { prompt: "32x32 pixel art, top-down view, mafia don walking up, suit and tie, gold chain under shirt, urban street, pixel art game sprite", filename: "walk-up.ppm" },
            
            // Battle sprites
            { prompt: "32x32 pixel art, top-down view, Italian mob boss battle idle, fists ready, expensive suit, confident stance, game sprite", filename: "battle-idle.ppm" },
            { prompt: "32x32 pixel art, top-down view, mob boss attacking, powerful punch, suit jacket moving, pixel art game sprite", filename: "battle-attack.ppm" },
            { prompt: "32x32 pixel art, top-down view, mob boss defending, arms up, blocking stance, pixel art game sprite", filename: "battle-defend.ppm" },
            { prompt: "32x32 pixel art, top-down view, mob boss hurt, staggered back, angry expression, pixel art game sprite", filename: "battle-hurt.ppm" },
            { prompt: "32x32 pixel art, top-down view, mob boss defeated, lying on ground, expensive suit torn, pixel art game sprite", filename: "battle-dead.ppm" },
            
            // Portraits - expression, commanding
            { prompt: "128x128 pixel art, face portrait, confident commanding expression, Italian features, expensive suit collar, pixel art style", filename: "portrait-happy.ppm" },
            { prompt: "128x128 pixel art, face portrait, neutral professional expression, calculating eyes, pixel art style", filename: "portrait-neutral.ppm" },
            { prompt: "128x128 pixel art, face portrait, angry threatening expression, intimidating stare, pixel art style", filename: "portrait-angry.ppm" },
            { prompt: "128x128 pixel art, face portrait, injured hurt expression, blood from cut, pixel art style", filename: "portrait-hurt.ppm" },
            { prompt: "128x128 pixel art, face portrait, defeated dead expression, eyes closed, pixel art style", filename: "portrait-dead.ppm" }
        ]
    },
    {
        id: 'bloods',
        name: 'Bloods Capo',
        fullName: 'Vicious O',
        description: 'Bloods gang member with red bandana',
        sprites: [
            { prompt: "32x32 pixel art, top-down view, Bloods gang member walking down, red bandana, red clothes, street ready, urban background, game sprite", filename: "walk-down.ppm" },
            { prompt: "32x32 pixel art, top-down view, Bloods walking left, red beanie, red hoodie, pixel art game sprite", filename: "walk-left.ppm" },
            { prompt: "32x32 pixel art, top-down view, Bloods member walking right, red bandana tied, street style, pixel art game sprite", filename: "walk-right.ppm" },
            { prompt: "32x32 pixel art, top-down view, Bloods walking up, red colors visible, urban street, pixel art game sprite", filename: "walk-up.ppm" },
            
            { prompt: "32x32 pixel art, top-down view, Bloods battle idle, fists up, ready stance, red colors, game sprite", filename: "battle-idle.ppm" },
            { prompt: "32x32 pixel art, top-down view, Bloods attacking, aggressive punch, street fighting style, pixel art", filename: "battle-attack.ppm" },
            { prompt: "32x32 pixel art, top-down view, Bloods defending, arms up, protective stance, pixel art", filename: "battle-defend.ppm" },
            { prompt: "32x32 pixel art, top-down view, Bloods hurt, staggered back, angry expression, pixel art", filename: "battle-hurt.ppm" },
            { prompt: "32x32 pixel art, top-down view, Bloods dead, lying on ground, red colors visible, pixel art", filename: "battle-dead.ppm" },
            
            { prompt: "128x128 pixel art, face portrait, street confident expression, red bandana, tough look, pixel art", filename: "portrait-happy.ppm" },
            { prompt: "128x128 pixel art, face portrait, neutral street expression, looking tough, pixel art style", filename: "portrait-neutral.ppm" },
            { prompt: "128x128 pixel art, face portrait, angry aggressive expression, confrontational, pixel art style", filename: "portrait-angry.ppm" },
            { prompt: "128x128 pixel art, face portrait, hurt injured expression, blood, pixel art style", filename: "portrait-hurt.ppm" },
            { prompt: "128x128 pixel art, face portrait, dead defeated expression, eyes closed, pixel art style", filename: "portrait-dead.ppm" }
        ]
    },
    {
        id: 'crips',
        name: 'Crips Lieutenant',
        fullName: 'Big Blue',
        description: 'Crips gang member with blue colors',
        sprites: [
            { prompt: "32x32 pixel art, top-down view, Crips gang member walking down, blue bandana, blue clothes, calm ready, urban background, game sprite", filename: "walk-down.ppm" },
            { prompt: "32x32 pixel art, top-down view, Crips walking left, blue beanie, blue hoodie, pixel art game sprite", filename: "walk-left.ppm" },
            { prompt: "32x32 pixel art, top-down view, Crips member walking right, blue rag, cool stride, pixel art game sprite", filename: "walk-right.ppm" },
            { prompt: "32x32 pixel art, top-down view, Crips walking up, blue colors, protective posture, pixel art game sprite", filename: "walk-up.ppm" },
            
            { prompt: "32x32 pixel art, top-down view, Crips battle idle, confident stance, blue colors, game sprite", filename: "battle-idle.ppm" },
            { prompt: "32x32 pixel art, top-down view, Crips attacking, powerful punch, street fighting, pixel art", filename: "battle-attack.ppm" },
            { prompt: "32x32 pixel art, top-down view, Crips defending, solid stance, blue visible, pixel art", filename: "battle-defend.ppm" },
            { prompt: "32x32 pixel art, top-down view, Crips hurt, protective stagger, determined, pixel art", filename: "battle-hurt.ppm" },
            { prompt: "32x32 pixel art, top-down view, Crips dead, lying down, blue visible, pixel art", filename: "battle-dead.ppm" },
            
            { prompt: "128x128 pixel art, face portrait, protective confident expression, blue colors, loyal look, pixel art", filename: "portrait-happy.ppm" },
            { prompt: "128x128 pixel art, face portrait, neutral calm expression, watchful eyes, pixel art style", filename: "portrait-neutral.ppm" },
            { prompt: "128x128 pixel art, face portrait, angry protective expression, defensive, pixel art style", filename: "portrait-angry.ppm" },
            { prompt: "128x128 pixel art, face portrait, hurt injured expression, determined, pixel art style", filename: "portrait-hurt.ppm" },
            { prompt: "128x128 pixel art, face portrait, dead defeated expression, eyes closed, pixel art style", filename: "portrait-dead.ppm" }
        ]
    },
    {
        id: 'latinKing',
        name: 'Latin King',
        fullName: 'Rey Sol',
        description: 'Latin King member in gold and black',
        sprites: [
            { prompt: "32x32 pixel art, top-down view, Latin King walking down, gold and black colors, crown symbol, proud stride, urban background, game sprite", filename: "walk-down.ppm" },
            { prompt: "32x32 pixel art, top-down view, Latin King walking left, gold chain, black leather, pixel art game sprite", filename: "walk-left.ppm" },
            { prompt: "32x32 pixel art, top-down view, Latin King walking right, crown tattoo visible, confident, pixel art game sprite", filename: "walk-right.ppm" },
            { prompt: "32x32 pixel art, top-down view, Latin King walking up, gold and black, proud bearing, pixel art game sprite", filename: "walk-up.ppm" },
            
            { prompt: "32x32 pixel art, top-down view, Latin King battle idle, proud stance, gold and black, game sprite", filename: "battle-idle.ppm" },
            { prompt: "32x32 pixel art, top-down view, Latin King attacking, confident punch, royal bearing, pixel art", filename: "battle-attack.ppm" },
            { prompt: "32x32 pixel art, top-down view, Latin King defending, solid stance, protective, pixel art", filename: "battle-defend.ppm" },
            { prompt: "32x32 pixel art, top-down view, Latin King hurt, staggered but proud, determined, pixel art", filename: "battle-hurt.ppm" },
            { prompt: "32x32 pixel art, top-down view, Latin King dead, fallen but dignified, pixel art", filename: "battle-dead.ppm" },
            
            { prompt: "128x128 pixel art, face portrait, proud noble expression, gold and black, dignified, pixel art", filename: "portrait-happy.ppm" },
            { prompt: "128x128 pixel art, face portrait, neutral proud expression, dignified bearing, pixel art style", filename: "portrait-neutral.ppm" },
            { prompt: "128x128 pixel art, face portrait, angry commanding expression, proud fury, pixel art style", filename: "portrait-angry.ppm" },
            { prompt: "128x128 pixel art, face portrait, hurt dignified expression, proud despite pain, pixel art style", filename: "portrait-hurt.ppm" },
            { prompt: "128x128 pixel art, face portrait, dead dignified expression, eyes closed, pixel art style", filename: "portrait-dead.ppm" }
        ]
    },
    {
        id: 'ms13',
        name: 'MS-13',
        fullName: 'La Araña',
        description: 'MS-13 gang member with mara tattoos',
        sprites: [
            { prompt: "32x32 pixel art, top-down view, MS-13 member walking down, dark clothes, serious expression, '18' tattoo visible, urban background, game sprite", filename: "walk-down.ppm" },
            { prompt: "32x32 pixel art, top-down view, MS-13 walking left, tattoos visible, cold stare, pixel art game sprite", filename: "walk-left.ppm" },
            { prompt: "32x32 pixel art, top-down view, MS-13 member walking right, dark colors, menacing, pixel art game sprite", filename: "walk-right.ppm" },
            { prompt: "32x32 pixel art, top-down view, MS-13 walking up, tattoos, focused dangerous, pixel art game sprite", filename: "walk-up.ppm" },
            
            { prompt: "32x32 pixel art, top-down view, MS-13 battle idle, cold stare, ready stance, dangerous, game sprite", filename: "battle-idle.ppm" },
            { prompt: "32x32 pixel art, top-down view, MS-13 attacking, vicious attack, brutal style, pixel art", filename: "battle-attack.ppm" },
            { prompt: "32x32 pixel art, top-down view, MS-13 defending, defensive but aggressive, pixel art", filename: "battle-defend.ppm" },
            { prompt: "32x32 pixel art, top-down view, MS-13 hurt, angry at being hit, more dangerous, pixel art", filename: "battle-hurt.ppm" },
            { prompt: "32x32 pixel art, top-down view, MS-13 dead, brutal end, pixel art", filename: "battle-dead.ppm" },
            
            { prompt: "128x128 pixel art, face portrait, cold serious expression, tattoos, menacing, pixel art", filename: "portrait-happy.ppm" },
            { prompt: "128x128 pixel art, face portrait, neutral cold expression, empty stare, pixel art style", filename: "portrait-neutral.ppm" },
            { prompt: "128x128 pixel art, face portrait, angry dangerous expression, terrifying, pixel art style", filename: "portrait-angry.ppm" },
            { prompt: "128x128 pixel art, face portrait, hurt angry expression, still dangerous, pixel art style", filename: "portrait-hurt.ppm" },
            { prompt: "128x128 pixel art, face portrait, dead expression, cold eyes, pixel art style", filename: "portrait-dead.ppm" }
        ]
    },
    {
        id: 'eighteenthStreet',
        name: '18th Street',
        fullName: 'El Diablo',
        description: '18th Street gang member rival to MS-13',
        sprites: [
            { prompt: "32x32 pixel art, top-down view, 18th Street member walking down, dark clothes, rival energy, urban background, game sprite", filename: "walk-down.ppm" },
            { prompt: "32x32 pixel art, top-down view, 18th Street walking left, orange or black, defiant, pixel art game sprite", filename: "walk-left.ppm" },
            { prompt: "32x32 pixel art, top-down view, 18th Street member walking right, competitive stance, pixel art game sprite", filename: "walk-right.ppm" },
            { prompt: "32x32 pixel art, top-down view, 18th Street walking up, rival colors, confident, pixel art game sprite", filename: "walk-up.ppm" },
            
            { prompt: "32x32 pixel art, top-down view, 18th Street battle idle, competitive stance, ready, game sprite", filename: "battle-idle.ppm" },
            { prompt: "32x32 pixel art, top-down view, 18th Street attacking, aggressive, street fighting, pixel art", filename: "battle-attack.ppm" },
            { prompt: "32x32 pixel art, top-down view, 18th Street defending, solid stance, tough, pixel art", filename: "battle-defend.ppm" },
            { prompt: "32x32 pixel art, top-down view, 18th Street hurt, angry but defiant, pixel art", filename: "battle-hurt.ppm" },
            { prompt: "32x32 pixel art, top-down view, 18th Street dead, fallen but tough, pixel art", filename: "battle-dead.ppm" },
            
            { prompt: "128x128 pixel art, face portrait, confident challenging expression, tough look, pixel art", filename: "portrait-happy.ppm" },
            { prompt: "128x128 pixel art, face portrait, neutral defiant expression, competitive, pixel art style", filename: "portrait-neutral.ppm" },
            { prompt: "128x128 pixel art, face portrait, angry aggressive expression, ready to fight, pixel art style", filename: "portrait-angry.ppm" },
            { prompt: "128x128 pixel art, face portrait, hurt defiant expression, still tough, pixel art style", filename: "portrait-hurt.ppm" },
            { prompt: "128x128 pixel art, face portrait, dead expression, tough to the end, pixel art style", filename: "portrait-dead.ppm" }
        ]
    },
    {
        id: 'triad',
        name: 'Triad Boss',
        fullName: 'Dragon Master Chen',
        description: 'Chinese Triad in traditional suit',
        sprites: [
            { prompt: "32x32 pixel art, top-down view, Triad boss walking down, traditional Chinese suit, calculating expression, elegant, urban background, game sprite", filename: "walk-down.ppm" },
            { prompt: "32x32 pixel art, top-down view, Triad walking left, expensive traditional suit, calm demeanor, pixel art game sprite", filename: "walk-left.ppm" },
            { prompt: "32x32 pixel art, top-down view, Triad boss walking right, dragon symbol, sophisticated, pixel art game sprite", filename: "walk-right.ppm" },
            { prompt: "32x32 pixel art, top-down view, Triad walking up, calculating gaze, professional, pixel art game sprite", filename: "walk-up.ppm" },
            
            { prompt: "32x32 pixel art, top-down view, Triad battle idle, calm but dangerous, elegant stance, game sprite", filename: "battle-idle.ppm" },
            { prompt: "32x32 pixel art, top-down view, Triad attacking, precise strike, calculating, pixel art", filename: "battle-attack.ppm" },
            { prompt: "32x32 pixel art, top-down view, Triad defending, professional defense, calm, pixel art", filename: "battle-defend.ppm" },
            { prompt: "32x32 pixel art, top-down view, Triad hurt, surprised but composed, still dangerous, pixel art", filename: "battle-hurt.ppm" },
            { prompt: "32x32 pixel art, top-down view, Triad dead, dignified fall, traditional suit, pixel art", filename: "battle-dead.ppm" },
            
            { prompt: "128x128 pixel art, face portrait, sophisticated calm expression, traditional Chinese features, elegant, pixel art", filename: "portrait-happy.ppm" },
            { prompt: "128x128 pixel art, face portrait, calculating neutral expression, intelligent eyes, pixel art style", filename: "portrait-neutral.ppm" },
            { prompt: "128x128 pixel art, face portrait, angry cold expression, dangerous calculation, pixel art style", filename: "portrait-angry.ppm" },
            { prompt: "128x128 pixel art, face portrait, hurt composed expression, surprised, pixel art style", filename: "portrait-hurt.ppm" },
            { prompt: "128x128 pixel art, face portrait, dead dignified expression, peaceful, pixel art style", filename: "portrait-dead.ppm" }
        ]
    },
    {
        id: 'yakuza',
        name: 'Yakuza Lieutenant',
        fullName: 'Tanaka-san',
        description: 'Japanese Yakuza member sleek and professional',
        sprites: [
            { prompt: "32x32 pixel art, top-down view, Yakuza member walking down, expensive dark suit, slicked hair, professional, urban background, game sprite", filename: "walk-down.ppm" },
            { prompt: "32x32 pixel art, top-down view, Yakuza walking left, traditional suit, elegant, pixel art game sprite", filename: "walk-left.ppm" },
            { prompt: "32x32 pixel art, top-down view, Yakuza member walking right, tattoo under collar, sleek, pixel art game sprite", filename: "walk-right.ppm" },
            { prompt: "32x32 pixel art, top-down view, Yakuza walking up, calculating gaze, professional, pixel art game sprite", filename: "walk-up.ppm" },
            
            { prompt: "32x32 pixel art, top-down view, Yakuza battle idle, ready stance, professional calm, game sprite", filename: "battle-idle.ppm" },
            { prompt: "32x32 pixel art, top-down view, Yakuza attacking, precise strike, deadly, pixel art", filename: "battle-attack.ppm" },
            { prompt: "32x32 pixel art, top-down view, Yakuza defending, solid professional defense, pixel art", filename: "battle-defend.ppm" },
            { prompt: "32x32 pixel art, top-down view, Yakuza hurt, surprised but composed, still dangerous, pixel art", filename: "battle-hurt.ppm" },
            { prompt: "32x32 pixel art, top-down view, Yakuza dead, dignified fall, suit pristine, pixel art", filename: "battle-dead.ppm" },
            
            { prompt: "128x128 pixel art, face portrait, professional calm expression, Japanese features, composed, pixel art", filename: "portrait-happy.ppm" },
            { prompt: "128x128 pixel art, face portrait, neutral professional expression, controlled, pixel art style", filename: "portrait-neutral.ppm" },
            { prompt: "128x128 pixel art, face portrait, angry dangerous expression, controlled fury, pixel art style", filename: "portrait-angry.ppm" },
            { prompt: "128x128 pixel art, face portrait, hurt composed expression, surprised, pixel art style", filename: "portrait-hurt.ppm" },
            { prompt: "128x128 pixel art, face portrait, dead composed expression, dignified, pixel art style", filename: "portrait-dead.ppm" }
        ]
    },
    {
        id: 'irishMob',
        name: 'Irish Mob',
        fullName: "Mick O'Brien",
        description: 'Irish-American mobster red hair beard',
        sprites: [
            { prompt: "32x32 pixel art, top-down view, Irish mobster walking down, red beard, leather jacket, tough looking, urban background, game sprite", filename: "walk-down.ppm" },
            { prompt: "32x32 pixel art, top-down view, Irish mob walking left, red hair, beard, rough style, pixel art game sprite", filename: "walk-left.ppm" },
            { prompt: "32x32 pixel art, top-down view, Irish mobster walking right, Irish features, tough, pixel art game sprite", filename: "walk-right.ppm" },
            { prompt: "32x32 pixel art, top-down view, Irish walking up, red beard prominent, confident, pixel art game sprite", filename: "walk-up.ppm" },
            
            { prompt: "32x32 pixel art, top-down view, Irish mob battle idle, tough stance, ready to fight, game sprite", filename: "battle-idle.ppm" },
            { prompt: "32x32 pixel art, top-down view, Irish mob attacking, brawler style, powerful, pixel art", filename: "battle-attack.ppm" },
            { prompt: "32x32 pixel art, top-down view, Irish mob defending, solid brawler defense, tough, pixel art", filename: "battle-defend.ppm" },
            { prompt: "32x32 pixel art, top-down view, Irish mob hurt, angry but tough, determined, pixel art", filename: "battle-hurt.ppm" },
            { prompt: "32x32 pixel art, top-down view, Irish mob dead, fallen brawler, tough end, pixel art", filename: "battle-dead.ppm" },
            
            { prompt: "128x128 pixel art, face portrait, friendly tough expression, red beard, Irish features, pixel art", filename: "portrait-happy.ppm" },
            { prompt: "128x128 pixel art, face portrait, neutral tough expression, weathered, pixel art style", filename: "portrait-neutral.ppm" },
            { prompt: "128x128 pixel art, face portrait, angry brawler expression, dangerous, pixel art style", filename: "portrait-angry.ppm" },
            { prompt: "128x128 pixel art, face portrait, hurt tough expression, still defiant, pixel art style", filename: "portrait-hurt.ppm" },
            { prompt: "128x128 pixel art, face portrait, dead expression, eyes closed, pixel art style", filename: "portrait-dead.ppm" }
        ]
    },
    {
        id: 'hellsAngels',
        name: 'Hells Angels',
        fullName: 'Skullcrusher',
        description: 'Biker with leather vest and colors',
        sprites: [
            { prompt: "32x32 pixel art, top-down view, Hells Angels member walking down, leather vest with colors, biker gear, rough, urban background, game sprite", filename: "walk-down.ppm" },
            { prompt: "32x32 pixel art, top-down view, biker walking left, leather jacket, denim, tough, pixel art game sprite", filename: "walk-left.ppm" },
            { prompt: "32x32 pixel art, top-down view, Hells Angels member walking right, biker boots, confident, pixel art game sprite", filename: "walk-right.ppm" },
            { prompt: "32x32 pixel art, top-down view, biker walking up, leather colors visible, biker vibe, pixel art game sprite", filename: "walk-up.ppm" },
            
            { prompt: "32x32 pixel art, top-down view, biker battle idle, rough stance, ready, leather visible, game sprite", filename: "battle-idle.ppm" },
            { prompt: "32x32 pixel art, top-down view, biker attacking, brutal brawler style, powerful, pixel art", filename: "battle-attack.ppm" },
            { prompt: "32x32 pixel art, top-down view, biker defending, solid tough defense, leather, pixel art", filename: "battle-defend.ppm" },
            { prompt: "32x32 pixel art, top-down view, biker hurt, angry tough, still dangerous, pixel art", filename: "battle-hurt.ppm" },
            { prompt: "32x32 pixel art, top-down view, biker dead, fallen but tough, leather colors, pixel art", filename: "battle-dead.ppm" },
            
            { prompt: "128x128 pixel art, face portrait, rough friendly expression, beard, leather, tough biker, pixel art", filename: "portrait-happy.ppm" },
            { prompt: "128x128 pixel art, face portrait, neutral rough expression, weathered, pixel art style", filename: "portrait-neutral.ppm" },
            { prompt: "128x128 pixel art, face portrait, angry dangerous expression, confronting, pixel art style", filename: "portrait-angry.ppm" },
            { prompt: "128x128 pixel art, face portrait, hurt tough expression, angry, pixel art style", filename: "portrait-hurt.ppm" },
            { prompt: "128x128 pixel art, face portrait, dead expression, eyes closed, pixel art style", filename: "portrait-dead.ppm" }
        ]
    }
];

// Create directory if it doesn't exist
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// Download image from URL
function downloadImage(url, filename) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filename);
        
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            } else {
                file.close();
                reject(new Error(`HTTP ${response.statusCode}`));
            }
        }).on('error', (err) => {
            fs.unlink(filename, () => {});
            reject(err);
        });
    });
}

// Generate sprites using DALL-E
async function generateSprites() {
    console.log('Starting supplier sprite generation...\n');
    
    for (const supplier of supplierTypes) {
        console.log(`Generating sprites for ${supplier.name}...`);
        
        const supplierDir = path.join(BASE_DIR, supplier.id);
        ensureDir(supplierDir);
        
        for (const sprite of supplier.sprites) {
            const filepath = path.join(supplierDir, sprite.filename);
            
            // Skip if already exists
            if (fs.existsSync(filepath)) {
                console.log(`  Skipping ${sprite.filename} (exists)`);
                continue;
            }
            
            try {
                console.log(`  Generating ${sprite.filename}...`);
                
                const response = await fetch('https://api.openai.com/v1/images/generations', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${API_KEY}`
                    },
                    body: JSON.stringify({
                        model: 'dall-e-3',
                        prompt: sprite.prompt,
                        size: '1024x1024',
                        quality: 'standard',
                        n: 1
                    })
                });
                
                if (!response.ok) {
                    const error = await response.text();
                    throw new Error(`API error: ${error}`);
                }
                
                const data = await response.json();
                const imageUrl = data.data[0].url;
                
                // Download the image
                await downloadImage(imageUrl, filepath);
                console.log(`    Saved to ${filepath}`);
                
                // Rate limiting - be nice to the API
                await new Promise(resolve => setTimeout(resolve, 2000));
                
            } catch (err) {
                console.error(`    ERROR: ${err.message}`);
            }
        }
        
        console.log(`  Completed ${supplier.name}\n`);
    }
    
    console.log('All supplier sprites generated!');
}

// Run the generator
generateSprites().catch(console.error);
