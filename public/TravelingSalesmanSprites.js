/**
 * Traveling Salesman Sprite Definitions
 * 
 * Sprite requirements for the traveling salesman NPC:
 * - Walking sprites (4 directions): down, left, right, up
 * - Combat sprites
 * - Portrait (5 expressions): happy, suspicious, nervous, angry, deal
 * 
 * The sprite key is: 'npc-traveling-salesman'
 * 
 * Usage:
 * - Place sprite files in: assets/sprites/npcs/traveling-salesman/
 * - Sprite files should be named as follows:
 *   - walk-down.ppm, walk-left.ppm, walk-right.ppm, walk-up.ppm
 *   - combat.ppm
 *   - portrait-happy.ppm, portrait-suspicious.ppm, portrait-nervous.ppm, 
 *     portrait-angry.ppm, portrait-deal.ppm
 * 
 * Placeholder notes:
 * - If actual sprites don't exist yet, the NPCController will fall back to 'npc-vendor' sprite
 * - Sprite scale is defined in CONFIG.SCALE.NPC_VENDOR (0.25)
 * - Portrait scale should be handled separately in UI code
 */

export const TRAVELING_SALESMAN_SPRITES = {
    // Base sprite key
    spriteKey: 'npc-traveling-salesman',
    
    // Walking animations (4 directions)
    walking: {
        down: 'walk-down',
        left: 'walk-left',
        right: 'walk-right',
        up: 'walk-up'
    },
    
    // Combat sprite
    combat: 'combat',
    
    // Portrait expressions (5)
    portraits: {
        happy: 'portrait-happy',
        suspicious: 'portrait-suspicious',
        nervous: 'portrait-nervous',
        angry: 'portrait-angry',
        deal: 'portrait-deal'
    },
    
    // Portrait descriptions for AI generation
    portraitPrompts: {
        happy: "128x128 pixel art, face portrait, friendly conspiratorial smile, shady businessman, pixel art style",
        suspicious: "128x128 pixel art, face portrait, suspicious narrowing eyes, looking around, wary expression, pixel art style",
        nervous: "128x128 pixel art, face portrait, nervous sweating expression, anxious, looking over shoulder, pixel art style",
        angry: "128x128 pixel art, face portrait, angry intimidating expression, don't mess with me, pixel art style",
        deal: "128x128 pixel art, face portrait, closed eye wink, making a deal, scheming smile, pixel art style"
    },
    
    // Walking sprite prompts for AI generation
    walkingPrompts: {
        down: "32x32 pixel art, top-down view, shady traveling salesman walking down, trench coat, mysterious, carrying case, urban street background, game sprite, pixel art style",
        left: "32x32 pixel art, top-down view, mysterious salesman walking left, trench coat, holding briefcase, looking around suspiciously, pixel art game sprite",
        right: "32x32 pixel art, top-down view, traveling vendor walking right, flashy but shady clothes, carrying hidden goods, pixel art game sprite",
        up: "32x32 pixel art, top-down view, discreet figure walking up, trench coat, low profile, urban street, pixel art game sprite"
    },
    
    // Combat sprite prompt
    combatPrompt: "32x32 pixel art, top-down view, combat stance, shady dealer ready to fight, aggressive, pixel art game sprite"
};
