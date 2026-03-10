#!/usr/bin/env python3
"""Generate sprite images for all 12 gang suppliers using DALL-E."""

import os
import json
import openai
from pathlib import Path

# Load API key
with open(os.path.expanduser("~/.openclaw/secrets.json")) as f:
    secrets = json.load(f)
    openai.api_key = secrets["openai_api_key"]

# Base output directory
BASE_DIR = Path("/root/.openclaw/workspace/projects/trap/assets/sprites/suppliers")

# Character definitions with detailed prompts
CHARACTERS = {
    "TheDon": {
        "description": "Stocky Italian man in his 60s, silver hair slicked back, immaculate tailored black suit, gold pinky ring, grandfatherly smile that doesn't reach his eyes, pixel art style, 32x32 sprite",
        "walk_down": "pixel art sprite, side view, walking animation frame, old mafia boss walking forward, tailored suit, gold ring visible, determined old man",
        "walk_up": "pixel art sprite, back view, walking animation frame, old mafia boss walking away, silver hair, tailored suit, hands moving",
        "walk_left": "pixel art sprite, left side view, walking animation frame, old mafia boss walking left, profile, expensive suit, gold ring",
        "walk_right": "pixel art sprite, right side view, walking animation frame, old mafia boss walking right, profile, expensive suit, gold ring",
        "portrait_neutral": "pixel art portrait, 32x32, old Italian mafia boss, neutral expression, silver slicked hair, black suit, gold pinky ring, grandfatherly but cold smile",
        "portrait_angry": "pixel art portrait, 32x32, old Italian mafia boss, angry expression, piercing eyes, silver hair, showing displeasure, intimidating",
        "portrait_happy": "pixel art portrait, 32x32, old Italian mafia boss, friendly smile that doesn't reach eyes, silver hair, grandfatherly facade",
        "portrait_suspicious": "pixel art portrait, 32x32, old mafia boss, suspicious narrowed eyes, calculating expression, silver hair, examining you",
        "portrait_threatening": "pixel art portrait, 32x32, old mafia boss, cold threatening glare, ice in eyes, silent rage, dangerous"
    },
    "Viper": {
        "description": "Sleek Asian woman mid-30s, black hair in sharp angles, snake tattoos on neck and arms, green clothing, cat-likepose, pixel art",
        "walk_down": "pixel art sprite, walking animation frame, Asian woman with sharp black hair, snake tattoos visible, green outfit, moving forward, sleek cat-like walk",
        "walk_up": "pixel art sprite, back view, Asian woman walking away, sharp angular black hair, green clothing, tattoos on neck",
        "walk_left": "pixel art sprite, left profile, Asian woman walking left, snake arm tattoo visible, green sleek outfit, graceful",
        "walk_right": "pixel art sprite, right profile, Asian woman walking right, sharp black hair, green clothing, serpentine movement",
        "portrait_neutral": "pixel art portrait, sleek Asian woman, neutral expression, sharp angular black hair, snake tattoo on neck, green attire, cold calculating eyes",
        "portrait_angry": "pixel art portrait, angry Asian woman, sharp black hair, intense glare, snake tattoos visible, green, furious expression",
        "portrait_happy": "pixel art portrait, smirking Asian woman, sharp angular black hair, green, sinister smile, confident, collecting secrets",
        "portrait_suspicious": "pixel art portrait, suspicious Asian woman, narrowed eyes, sharp black hair, green, assessing, analyzing",
        "portrait_threatening": "pixel art portrait, threatening viper-like woman, sharp black hair, cold deadly gaze, green, strike ready pose"
    },
    "Rook": {
        "description": "Towering bald black man, heavy build, crown-themed jewelry, scars on knuckles, regal streetwise look, pixel art",
        "walk_down": "pixel art sprite, walking animation frame, huge bald black man, muscular, crown necklace, walking forward, guardian of the block",
        "walk_up": "pixel art sprite, back view, giant bald man walking away, crown jewelry, massive build, protective stance",
        "walk_left": "pixel art sprite, left side, huge bald man walking left, crown themed jewelry, powerful build, loyal protector",
        "walk_right": "pixel art sprite, right side, huge bald man walking right, crown chain, massive frame, guardian energy",
        "portrait_neutral": "pixel art portrait, towering bald black man, neutral expression, crown necklace, scars on knuckles, protective steady gaze",
        "portrait_angry": "pixel art portrait, angry giant bald man, crown jewelry, furious expression, massive intimidating presence, battle ready",
        "portrait_happy": "pixel art portrait, smiling giant bald man, crown themed jewelry, warm expression, loyal protector energy",
        "portrait_suspicious": "pixel art portrait, suspicious towering man, crown jewelry, narrowed eyes, assessing threat, strategic mind",
        "portrait_threatening": "pixel art portrait, threatening guardian, crown jewelry, fists clenched, scarred knuckles, territorial chess player"
    },
    "Ghost": {
        "description": "Pale woman with ghostly white hair, dark circles under eyes, always in black, ethereal smoke-like presence, pixel art",
        "walk_down": "pixel art sprite, walking animation frame, pale ghostly woman, white hair, all black clothing, moving like smoke, ethereal",
        "walk_up": "pixel art sprite, back view, ghostly woman walking away, white pale hair, dark clothing, disappearing into shadows",
        "walk_left": "pixel art sprite, left profile, ghost woman walking left, pale white hair, black clothes, silent movement",
        "walk_right": "pixel art sprite, right profile, ghost woman walking right, white hair, black outfit, appearing from nowhere",
        "portrait_neutral": "pixel art portrait, ghostly pale woman, deadpan neutral expression, white anemic hair, dark circles under eyes, all black, ethereal mysterious",
        "portrait_angry": "pixel art portrait, angry ghost woman, pale white hair, dark circles, black clothing, cold fury, terrifying stillness",
        "portrait_happy": "pixel art portrait, ghost woman with slight deadpan smile, white hair, black, rare moment of humor, eerie",
        "portrait_suspicious": "pixel art portrait, suspicious ghostly woman, white hair, narrowed eyes, black attire, watching silently, analyzing",
        "portrait_threatening": "pixel art portrait, terrifying ghost woman, white hair standing up, black eyes, appearing from shadows, death approaching"
    },
    "Iron": {
        "description": "Burly white man mid-40s, beard, perpetual grease stains, arms like tree trunks, leather and steel biker aesthetic, mechanic, pixel art",
        "walk_down": "pixel art sprite, walking animation frame, huge burly white man with beard, leather biker jacket, grease stains, mechanical vibe, walking forward",
        "walk_up": "pixel art sprite, back view, massive bearded man walking away, leather vest, steel buckles, mechanic build",
        "walk_left": "pixel art sprite, left side, bearded biker walking left, leather and steel, muscular arms, grease stained",
        "walk_right": "pixel art sprite, right side, bearded biker walking right, leather jacket, mechanical build, tool belt hints",
        "portrait_neutral": "pixel art portrait, burly bearded white man, neutral expression, leather biker aesthetic, grease stains on hands, mechanical stare",
        "portrait_angry": "pixel art portrait, angry massive biker, thick beard, furious expression, leather, ready to fix problems with tools",
        "portrait_happy": "pixel art portrait, grinning bearded biker, leather jacket, grease stains, mechanical metaphor speaker, satisfied",
        "portrait_suspicious": "pixel art portrait, suspicious mechanic, bearded, narrowed eyes under heavy brow, analyzing like machine, leather",
        "portrait_threatening": "pixel art portrait, threatening biker enforcer, huge beard, clenched fists, steel attitude, mechanical precision"
    },
    "Fang": {
        "description": "Skinny African-American man, gold teeth, quick movements, scavenged clothing from various crews, slippery opportunist, pixel art",
        "walk_down": "pixel art sprite, walking animation frame, skinny black man, gold teeth visible, mismatched scavenged clothes, fast shuffling walk, opportunistic",
        "walk_up": "pixel art sprite, back view, thin man walking away, various crew patches on clothes, looking for exits",
        "walk_left": "pixel art sprite, left profile, skinny man walking left, gold teeth, shifty eyes, scavenger clothing",
        "walk_right": "pixel art sprite, right profile, slippery man walking right, gold teeth, quick movements, looking for main chance",
        "portrait_neutral": "pixel art portrait, skinny black man, neutral shifty expression, gold teeth visible, mismatched scavenged clothing, opportunistic gaze",
        "portrait_angry": "pixel art portrait, angry skinny man, gold teeth bared, agitated, fast talking, defensive",
        "portrait_happy": "pixel art portrait, grinning man with gold teeth, greedy smile, scavenger outfit, deals on mind",
        "portrait_suspicious": "pixel art portrait, suspicious scheming man, gold teeth, narrowed eyes, looking for angle, calculating",
        "portrait_threatening": "pixel art portrait, threatening desperate man, gold teeth, aggressive stance, cornered animal energy"
    },
    "Storm": {
        "description": "Latina woman, wild curly hair, tattoos covering arms, always moving, nervous chaotic energy, pixel art",
        "walk_down": "pixel art sprite, walking animation frame, Latina woman with wild curly hair, arm tattoos visible, energetic chaotic walk, moving constantly",
        "walk_up": "pixel art sprite, back view, wild-haired woman walking away, tattoos on arms, energetic chaotic movement",
        "walk_left": "pixel art sprite, left side, Latina woman walking left, wild hair, tattoos, bouncing with energy",
        "walk_right": "pixel art sprite, right side, woman walking right, curly wild hair, tattooed arms, unpredictable",
        "portrait_neutral": "pixel art portrait, Latina woman, restless neutral expression, wild curly hair, arm tattoos, vibrating with energy",
        "portrait_angry": "pixel art portrait, furious Latina woman, wild hair, tattoos, hot-headed expression, explosive anger",
        "portrait_happy": "pixel art portrait, energetic Latina woman, wild curly hair, tattoos, chaotic happy grin, electric energy",
        "portrait_suspicious": "pixel art portrait, paranoid jittery woman, wild hair, tattoos, looking around nervously, plans changing",
        "portrait_threatening": "pixel art portrait, storm of fury, wild hair standing up, tattoos flexed, explosive dangerous energy"
    },
    "Shade": {
        "description": "Androgynous Asian man, youthful looks, hooded eyes, always in shadows, phone in hand, information broker, pixel art",
        "walk_down": "pixel art sprite, walking animation frame, androgynous Asian man, youthful, hooded clothing, phone in hand, mysterious, walking in shadows",
        "walk_up": "pixel art sprite, back view, hooded Asian man walking away, hidden in shadows, phone glowing, mysterious",
        "walk_left": "pixel art sprite, left profile, hooded man walking left, shadows, phone, whispering, info broker",
        "walk_right": "pixel art sprite, right profile, man walking right, hooded, shadows, dealing in rumors, phone active",
        "portrait_neutral": "pixel art portrait, androgynous Asian man, neutral mysterious expression, hooded eyes, shadows, always on phone, knowing everything",
        "portrait_angry": "pixel art portrait, angry info broker, hooded eyes, shadows, furious, secrets threatened",
        "portrait_happy": "pixel art portrait, smirking shadow broker, hood up, pleased with info leverage, whispering secrets",
        "portrait_suspicious": "pixel art portrait, suspicious secretive man, narrow hooded eyes, shadows, analyzing, calculating value",
        "portrait_threatening": "pixel art portrait, dangerous info broker, shadows, deadly serious, knows your secrets, leverage"
    },
    "Blaze": {
        "description": "Red-haired white man, burned scar on left side of face, muscular, fire-themed clothing, hot-tempered, pixel art",
        "walk_down": "pixel art sprite, walking animation frame, red-haired white man, burn scar on face, muscular, fire-themed clothes, aggressive walk",
        "walk_up": "pixel art sprite, back view, red-haired man walking away, burn scar, fire jacket, angry energy",
        "walk_left": "pixel art sprite, left profile, red-haired man walking left, burn scar visible, fire-themed, hot-tempered",
        "walk_right": "pixel art sprite, right profile, red-haired man walking right, scar, fire clothing, burning bridges",
        "portrait_neutral": "pixel art portrait, red-haired white man, scarred face, fire-themed clothing, hot-tempered look, burn mark visible",
        "portrait_angry": "pixel art portrait, furious redhead, burn scar, fire in eyes, aggressive, explosive temper, dangerous",
        "portrait_happy": "pixel art portrait, red-haired man with wild grin, burn scar, fire gear, chaos lover, destructive joy",
        "portrait_suspicious": "pixel art portrait, suspicious redhead, burn scar, narrowed eyes, looking for enemies, ready to burn",
        "portrait_threatening": "pixel art portrait, blazing fury, red hair, burn scar twisted, fire-themed, ready to burn everything"
    },
    "Frost": {
        "description": "Pale Russian man, buzz cut, ice-blue eyes, intimidating stillness, dark coats, runs hard substances, pixel art",
        "walk_down": "pixel art sprite, walking animation frame, pale Russian man, buzz cut, ice blue eyes, dark coat, cold moving presence, still and dangerous",
        "walk_up": "pixel art sprite, back view, Russian man walking away, buzz cut, dark coat, cold aura, silent",
        "walk_left": "pixel art sprite, left profile, pale Russian walking left, buzz cut, dark clothing, European cold stare",
        "walk_right": "pixel art sprite, right profile, Russian man walking right, buzz cut, dark coat, icy presence",
        "portrait_neutral": "pixel art portrait, pale Russian man, buzz cut, ice blue eyes, neutral cold expression, dark coat, intimidating stillness",
        "portrait_angry": "pixel art portrait, furious Russian man, ice blue eyes burning cold, buzz cut, terrifying frozen rage",
        "portrait_happy": "pixel art portrait, cold Russian with slight ice smile, buzz cut, rarely shows emotion, dark coat",
        "portrait_suspicious": "pixel art portrait, suspicious Russian, buzz cut, cold calculating stare, assessing, dangerous",
        "portrait_threatening": "pixel art portrait, deadly Russian ice, buzz cut, freezing stare, dark coat, never loses composure, kill mode"
    },
    "Razor": {
        "description": "Tough black woman, dreads, multiple visible blades, scar tissue on hands, impatient, weapon dealer, pixel art",
        "walk_down": "pixel art sprite, walking animation frame, tough black woman with dreads, visible blades, scar tissue on hands, confident weapon dealer walk",
        "walk_up": "pixel art sprite, back view, dreadlocked woman walking away, carrying weapons, tough, no patience",
        "walk_left": "pixel art sprite, left profile, armed woman walking left, dreads, blades visible, ready for action",
        "walk_right": "pixel art sprite, right profile, weapon dealer walking right, dreads, sharp, dangerous",
        "portrait_neutral": "pixel art portrait, tough black woman, dreads, neutral expression, visible blades, scar tissue on hands, no patience for fools",
        "portrait_angry": "pixel art portrait, furious dreadlocked woman, blades, scar tissue, angry, explosive temper, dangerous weapons",
        "portrait_happy": "pixel art portrait, smirking armed woman, dreads, confident, weapons dealer satisfied, sharp smile",
        "portrait_suspicious": "pixel art portrait, suspicious weapon dealer, dreads, narrowed eyes, assessing threat, blades ready",
        "portrait_threatening": "pixel art portrait, razor dangerous, dreads wild, blades drawn, scar tissue, deadly serious, attacks first"
    },
    "Byte": {
        "description": "Young Asian man, skinny, glasses, neon green hair highlights, always has laptop, pale from no sunlight, hacker, pixel art",
        "walk_down": "pixel art sprite, walking animation frame, skinny young Asian man, glasses, neon green hair highlights, carrying laptop, pale, cyberpunk walk",
        "walk_up": "pixel art sprite, back view, pale hacker walking away, green hair highlights, laptop bag, tech vibe",
        "walk_left": "pixel art sprite, left profile, skinny Asian walking left, glasses, green highlights, laptop, socially awkward",
        "walk_right": "pixel art sprite, right profile, young man walking right, green hair, glasses, pale, digital dealer",
        "portrait_neutral": "pixel art portrait, young Asian man, glasses, neon green hair highlights, neutral expression, pale from no sunlight, laptop nearby, genius hacker",
        "portrait_angry": "pixel art portrait, angry hacker, green hair, glasses, furious at system breach, pale, typing furiously",
        "portrait_happy": "pixel art portrait, excited young hacker, green hair, glasses, grin, breakthrough achieved, pale glowing screen",
        "portrait_suspicious": "pixel art portrait, suspicious cyberpunk, green hair, glasses, narrowed eyes, scanning for threats, paranoia",
        "portrait_threatening": "pixel art portrait, dangerous hacker, green hair wild, glasses, dark screen behind, digital warfare ready"
    }
}

def generate_sprite(client, character, sprite_type, prompt, output_path):
    """Generate a single sprite using DALL-E."""
    full_prompt = f"{prompt}, video game sprite, retro pixel art, 32x32 pixel resolution style, crisp edges, limited color palette, game asset"
    
    print(f"Generating: {character}/{sprite_type}")
    
    response = client.images.generate(
        model="dall-e-3",
        prompt=full_prompt,
        size="1024x1024",
        quality="standard",
        n=1
    )
    
    image_url = response.data[0].url
    
    # Download and save the image
    import urllib.request
    urllib.request.urlretrieve(image_url, output_path)
    print(f"Saved: {output_path}")
    
    return output_path

def main():
    client = openai.OpenAI()
    
    generated = 0
    total = 0
    
    for char_name, sprites in CHARACTERS.items():
        char_dir = BASE_DIR / char_name
        
        for sprite_type, prompt in sprites.items():
            total += 1
            
            # Determine subdirectory
            if sprite_type.startswith("walk"):
                subdir = sprite_type
            else:
                subdir = "portrait"
            
            sprite_dir = char_dir / subdir
            sprite_dir.mkdir(parents=True, exist_ok=True)
            
            # Output filename
            output_file = sprite_dir / f"{sprite_type}.png"
            
            # Skip if exists
            if output_file.exists():
                print(f"Skipping existing: {output_file}")
                generated += 1
                continue
            
            try:
                generate_sprite(client, char_name, sprite_type, prompt, str(output_file))
                generated += 1
            except Exception as e:
                print(f"Error generating {char_name}/{sprite_type}: {e}")
    
    print(f"\nGenerated {generated}/{total} sprites")

if __name__ == "__main__":
    main()