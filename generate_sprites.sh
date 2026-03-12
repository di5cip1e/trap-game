#!/bin/bash
# Generate sprites using DALL-E via curl

API_KEY="sk_REDACTED-38PHSQyZmZXxouZM8yFSTxyQ62ahQoZ5d2BKxXmWskJNceb2Iqi2De4RAlubiDspfm9RjXE5CXT3BlbkFJNwZ8cw0zmzCMHQqgLdQVzphld6rz4HK9ODVZOQ-DgMjN2D5DxjssTDGZd0Lmfx2zR9Z_nGM2wA"
BASE_DIR="/root/.openclaw/workspace/projects/trap/assets/sprites/suppliers"

# Character prompts (key, prompt)
declare -A PROMPTS

# The Don
PROMPTS["TheDon/walk_down"]="pixel art sprite, side view, walking animation frame, old mafia boss walking forward, tailored suit, gold ring visible, determined old man"
PROMPTS["TheDon/walk_up"]="pixel art sprite, back view, walking animation frame, old mafia boss walking away, silver hair, tailored suit"
PROMPTS["TheDon/walk_left"]="pixel art sprite, left side view, old mafia boss walking left, profile, expensive suit, gold ring"
PROMPTS["TheDon/walk_right"]="pixel art sprite, right side view, old mafia boss walking right, profile, expensive suit"
PROMPTS["TheDon/portrait_neutral"]="pixel art portrait, old Italian mafia boss, neutral expression, silver slicked hair, black suit, gold pinky ring"
PROMPTS["TheDon/portrait_angry"]="pixel art portrait, old mafia boss, angry expression, silver hair, intimidating"
PROMPTS["TheDon/portrait_happy"]="pixel art portrait, old mafia boss, grandfatherly smile that doesnt reach eyes, silver hair"
PROMPTS["TheDon/portrait_suspicious"]="pixel art portrait, old mafia boss, suspicious narrowed eyes, calculating"
PROMPTS["TheDon/portrait_threatening"]="pixel art portrait, old mafia boss, cold threatening glare, silent dangerous"

# Viper
PROMPTS["Viper/walk_down"]="pixel art sprite, Asian woman walking forward, sharp angular black hair, snake tattoos, green outfit, cat-like walk"
PROMPTS["Viper/walk_up"]="pixel art sprite, Asian woman walking away, sharp black hair, green clothing, snake tattoos on neck"
PROMPTS["Viper/walk_left"]="pixel art sprite, Asian woman walking left, snake arm tattoo, green sleek outfit, graceful serpentine"
PROMPTS["Viper/walk_right"]="pixel art sprite, Asian woman walking right, sharp black hair, green, serpentine movement"
PROMPTS["Viper/portrait_neutral"]="pixel art portrait, sleek Asian woman, neutral cold expression, sharp angular black hair, snake tattoo on neck"
PROMPTS["Viper/portrait_angry"]="pixel art portrait, angry Asian woman, sharp black hair, snake tattoos, furious"
PROMPTS["Viper/portrait_happy"]="pixel art portrait, smirking Asian woman, sharp black hair, green, sinister smile"
PROMPTS["Viper/portrait_suspicious"]="pixel art portrait, suspicious Asian woman, sharp black hair, green, analyzing"
PROMPTS["Viper/portrait_threatening"]="pixel art portrait, threatening viper woman, sharp black hair, cold deadly gaze, strike ready"

# Rook
PROMPTS["Rook/walk_down"]="pixel art sprite, huge bald black man walking forward, muscular, crown necklace, guardian of the block"
PROMPTS["Rook/walk_up"]="pixel art sprite, giant bald man walking away, crown jewelry, massive protective build"
PROMPTS["Rook/walk_left"]="pixel art sprite, huge bald man walking left, crown themed jewelry, powerful loyal protector"
PROMPTS["Rook/walk_right"]="pixel art sprite, huge bald man walking right, crown chain, massive guardian"
PROMPTS["Rook/portrait_neutral"]="pixel art portrait, towering bald black man, neutral protective expression, crown necklace, scars on knuckles"
PROMPTS["Rook/portrait_angry"]="pixel art portrait, angry giant bald man, crown jewelry, furious intimidating"
PROMPTS["Rook/portrait_happy"]="pixel art portrait, smiling giant bald man, crown jewelry, warm loyal"
PROMPTS["Rook/portrait_suspicious"]="pixel art portrait, suspicious towering man, crown jewelry, narrowed eyes, strategic"
PROMPTS["Rook/portrait_threatening"]="pixel art portrait, threatening guardian, crown jewelry, fists clenched, territorial"

# Ghost
PROMPTS["Ghost/walk_down"]="pixel art sprite, pale ghostly woman walking forward, white hair, black clothing, moving like smoke"
PROMPTS["Ghost/walk_up"]="pixel art sprite, ghostly woman walking away, white pale hair, dark clothes, disappearing"
PROMPTS["Ghost/walk_left"]="pixel art sprite, ghost woman walking left, pale white hair, black, silent movement"
PROMPTS["Ghost/walk_right"]="pixel art sprite, ghost woman walking right, white hair, black, appearing from shadows"
PROMPTS["Ghost/portrait_neutral"]="pixel art portrait, ghostly pale woman, deadpan expression, white anemic hair, dark circles under eyes"
PROMPTS["Ghost/portrait_angry"]="pixel art portrait, angry ghost woman, white hair, cold fury, terrifying"
PROMPTS["Ghost/portrait_happy"]="pixel art portrait, ghost woman with slight deadpan smile, white hair, rare humor"
PROMPTS["Ghost/portrait_suspicious"]="pixel art portrait, suspicious ghost woman, white hair, watching silently"
PROMPTS["Ghost/portrait_threatening"]="pixel art portrait, terrifying ghost woman, white hair, black eyes, death approaching"

# Iron
PROMPTS["Iron/walk_down"]="pixel art sprite, burly white man with beard walking forward, leather biker jacket, grease stains, mechanic"
PROMPTS["Iron/walk_up"]="pixel art sprite, massive bearded man walking away, leather vest, steel buckles"
PROMPTS["Iron/walk_left"]="pixel art sprite, bearded biker walking left, leather and steel, muscular arms"
PROMPTS["Iron/walk_right"]="pixel art sprite, bearded biker walking right, leather jacket, mechanical build"
PROMPTS["Iron/portrait_neutral"]="pixel art portrait, burly bearded white man, neutral expression, leather biker, grease stains"
PROMPTS["Iron/portrait_angry"]="pixel art portrait, angry massive biker, thick beard, furious, leather"
PROMPTS["Iron/portrait_happy"]="pixel art portrait, grinning bearded biker, leather jacket, grease stains"
PROMPTS["Iron/portrait_suspicious"]="pixel art portrait, suspicious mechanic, bearded, narrowed eyes, analyzing"
PROMPTS["Iron/portrait_threatening"]="pixel art portrait, threatening biker, huge beard, clenched fists, steel attitude"

# Fang
PROMPTS["Fang/walk_down"]="pixel art sprite, skinny black man walking forward, gold teeth visible, mismatched clothes, fast walk"
PROMPTS["Fang/walk_up"]="pixel art sprite, thin man walking away, various crew patches, looking for exits"
PROMPTS["Fang/walk_left"]="pixel art sprite, skinny man walking left, gold teeth, shifty eyes, scavenger clothing"
PROMPTS["Fang/walk_right"]="pixel art sprite, slippery man walking right, gold teeth, quick movements"
PROMPTS["Fang/portrait_neutral"]="pixel art portrait, skinny black man, neutral shifty expression, gold teeth, mismatched clothes"
PROMPTS["Fang/portrait_angry"]="pixel art portrait, angry skinny man, gold teeth bared, fast talking, defensive"
PROMPTS["Fang/portrait_happy"]="pixel art portrait, grinning man with gold teeth, greedy smile"
PROMPTS["Fang/portrait_suspicious"]="pixel art portrait, suspicious scheming man, gold teeth, looking for angle"
PROMPTS["Fang/portrait_threatening"]="pixel art portrait, threatening desperate man, gold teeth, cornered animal"

# Storm
PROMPTS["Storm/walk_down"]="pixel art sprite, Latina woman walking forward, wild curly hair, arm tattoos, energetic chaotic walk"
PROMPTS["Storm/walk_up"]="pixel art sprite, wild-haired woman walking away, tattoos on arms, nervous energy"
PROMPTS["Storm/walk_left"]="pixel art sprite, Latina woman walking left, wild hair, tattoos, bouncing energy"
PROMPTS["Storm/walk_right"]="pixel art sprite, woman walking right, curly wild hair, tattooed arms, unpredictable"
PROMPTS["Storm/portrait_neutral"]="pixel art portrait, Latina woman, restless expression, wild curly hair, arm tattoos"
PROMPTS["Storm/portrait_angry"]="pixel art portrait, furious Latina woman, wild hair, tattoos, explosive anger"
PROMPTS["Storm/portrait_happy"]="pixel art portrait, energetic Latina woman, wild curly hair, tattoos, electric energy"
PROMPTS["Storm/portrait_suspicious"]="pixel art portrait, paranoid jittery woman, wild hair, tattoos, nervous"
PROMPTS["Storm/portrait_threatening"]="pixel art portrait, storm of fury, wild hair, tattoos, explosive dangerous"

# Shade
PROMPTS["Shade/walk_down"]="pixel art sprite, Asian man walking forward, youthful, hooded clothing, phone, mysterious"
PROMPTS["Shade/walk_up"]="pixel art sprite, hooded Asian man walking away, shadows, phone glowing"
PROMPTS["Shade/walk_left"]="pixel art sprite, hooded man walking left, shadows, phone, whispering"
PROMPTS["Shade/walk_right"]="pixel art sprite, man walking right, hooded, shadows, phone"
PROMPTS["Shade/portrait_neutral"]="pixel art portrait, androgynous Asian man, neutral expression, hooded eyes, shadows, phone"
PROMPTS["Shade/portrait_angry"]="pixel art portrait, angry info broker, hooded eyes, furious"
PROMPTS["Shade/portrait_happy"]="pixel art portrait, smirking shadow broker, hood up, knowing secrets"
PROMPTS["Shade/portrait_suspicious"]="pixel art portrait, suspicious secretive man, narrow eyes, shadows"
PROMPTS["Shade/portrait_threatening"]="pixel art portrait, dangerous info broker, shadows, knows your secrets"

# Blaze
PROMPTS["Blaze/walk_down"]="pixel art sprite, red-haired white man walking forward, burn scar on face, fire-themed clothes, aggressive"
PROMPTS["Blaze/walk_up"]="pixel art sprite, red-haired man walking away, burn scar, fire jacket, angry"
PROMPTS["Blaze/walk_left"]="pixel art sprite, red-haired man walking left, burn scar visible, fire-themed"
PROMPTS["Blaze/walk_right"]="pixel art sprite, red-haired man walking right, scar, fire clothes, burning"
PROMPTS["Blaze/portrait_neutral"]="pixel art portrait, red-haired white man, neutral hot expression, burn scar, fire-themed"
PROMPTS["Blaze/portrait_angry"]="pixel art portrait, furious redhead, burn scar, fire in eyes, explosive"
PROMPTS["Blaze/portrait_happy"]="pixel art portrait, red-haired man with wild grin, burn scar, fire gear"
PROMPTS["Blaze/portrait_suspicious"]="pixel art portrait, suspicious redhead, burn scar, looking for enemies"
PROMPTS["Blaze/portrait_threatening"]="pixel art portrait, blazing fury, red hair, burn scar, ready to burn"

# Frost
PROMPTS["Frost/walk_down"]="pixel art sprite, pale Russian man walking forward, buzz cut, ice blue eyes, dark coat, cold"
PROMPTS["Frost/walk_up"]="pixel art sprite, Russian man walking away, buzz cut, dark coat, cold aura"
PROMPTS["Frost/walk_left"]="pixel art sprite, pale Russian walking left, buzz cut, dark clothing, cold stare"
PROMPTS["Frost/walk_right"]="pixel art sprite, Russian man walking right, buzz cut, dark coat, icy"
PROMPTS["Frost/portrait_neutral"]="pixel art portrait, pale Russian man, buzz cut, ice blue eyes, dark coat, still"
PROMPTS["Frost/portrait_angry"]="pixel art portrait, furious Russian, ice blue eyes, buzz cut, frozen rage"
PROMPTS["Frost/portrait_happy"]="pixel art portrait, cold Russian with slight smile, buzz cut, rarely shows emotion"
PROMPTS["Frost/portrait_suspicious"]="pixel art portrait, suspicious Russian, buzz cut, cold calculating stare"
PROMPTS["Frost/portrait_threatening"]="pixel art portrait, deadly ice Russian, buzz cut, freezing stare, never loses composure"

# Razor
PROMPTS["Razor/walk_down"]="pixel art sprite, tough black woman walking forward, dreads, visible blades, scar tissue, confident"
PROMPTS["Razor/walk_up"]="pixel art sprite, dreadlocked woman walking away, carrying weapons, tough"
PROMPTS["Razor/walk_left"]="pixel art sprite, armed woman walking left, dreads, blades visible"
PROMPTS["Razor/walk_right"]="pixel art sprite, weapon dealer walking right, dreads, sharp dangerous"
PROMPTS["Razor/portrait_neutral"]="pixel art portrait, tough black woman, dreads, neutral expression, visible blades, scar tissue"
PROMPTS["Razor/portrait_angry"]="pixel art portrait, furious dreadlocked woman, blades, scar tissue, angry"
PROMPTS["Razor/portrait_happy"]="pixel art portrait, smirking armed woman, dreads, weapons dealer satisfied"
PROMPTS["Razor/portrait_suspicious"]="pixel art portrait, suspicious weapon dealer, dreads, narrowed eyes"
PROMPTS["Razor/portrait_threatening"]="pixel art portrait, razor dangerous, dreads wild, blades drawn, deadly"

# Byte
PROMPTS["Byte/walk_down"]="pixel art sprite, young Asian man walking forward, glasses, neon green hair, laptop, pale, cyberpunk"
PROMPTS["Byte/walk_up"]="pixel art sprite, pale hacker walking away, green hair, laptop bag"
PROMPTS["Byte/walk_left"]="pixel art sprite, skinny Asian walking left, glasses, green highlights, laptop"
PROMPTS["Byte/walk_right"]="pixel art sprite, young man walking right, green hair, glasses, pale"
PROMPTS["Byte/portrait_neutral"]="pixel art portrait, young Asian man, glasses, neon green hair, pale, neutral expression"
PROMPTS["Byte/portrait_angry"]="pixel art portrait, angry hacker, green hair, glasses, furious at breach"
PROMPTS["Byte/portrait_happy"]="pixel art portrait, excited young hacker, green hair, glasses, breakthrough grin"
PROMPTS["Byte/portrait_suspicious"]="pixel art portrait, suspicious cyberpunk, green hair, glasses, paranoid"
PROMPTS["Byte/portrait_threatening"]="pixel art portrait, dangerous hacker, green hair wild, glasses, dark screen"

for key in "${!PROMPTS[@]}"; do
    prompt="${PROMPTS[$key]}"
    char=$(echo "$key" | cut -d'/' -f1)
    sprite=$(echo "$key" | cut -d'/' -f2)
    
    # Determine subdirectory
    if [[ "$sprite" == portrait_* ]]; then
        subdir="portrait"
        filename="$sprite.png"
    else
        subdir="$sprite"
        filename="$sprite.png"
    fi
    
    dir="$BASE_DIR/$char/$subdir"
    mkdir -p "$dir"
    outfile="$dir/$filename"
    
    if [ -f "$outfile" ]; then
        echo "Skipping $key (exists)"
        continue
    fi
    
    echo "Generating: $key"
    
    full_prompt="$prompt, video game sprite, retro pixel art style, 32x32 pixel resolution, game character"
    
    # Call DALL-E API
    response=$(curl -s -X POST "https://api.openai.com/v1/images/generations" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $API_KEY" \
        -d "{
            \"model\": \"dall-e-3\",
            \"prompt\": \"$full_prompt\",
            \"size\": \"1024x1024\",
            \"quality\": \"standard\",
            \"n\": 1
        }")
    
    # Extract URL
    url=$(echo "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data'][0]['url'])" 2>/dev/null)
    
    if [ -n "$url" ]; then
        # Download image
        curl -s -o "$outfile" "$url"
        echo "Saved: $outfile"
    else
        echo "Error for $key: $response"
    fi
    
    # Rate limit - wait a bit between requests
    sleep 2
done

echo "Done!"