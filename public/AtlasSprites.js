/**
 * ATLAS SPRITE REFERENCES
 * 
 * Centralized sprite frame name references for texture atlas usage.
 * When switching to atlas-based loading, use these constants to reference
 * sprites instead of hardcoded strings.
 * 
 * Format: ATLAS_KEY + '.' + FRAME_NAME
 * Example: this.add.image(x, y, 'tiles', ATLAS_FRAMES.TILES.street)
 */

export const ATLAS_KEYS = {
    TILES: 'tiles',
    UI_HUD: 'ui-hud',
    PLAYER_MAIN: 'player-main',
    NPCs: 'npcs',
    ENEMIES: 'enemies',
    UI_COMBAT: 'ui-combat',
    SKILLS: 'skills',
    STATUS_EFFECTS: 'status-effects',
    SUPPLIERS: 'suppliers',
    OBJECTS: 'objects'
};

export const ATLAS_FRAMES = {
    // ==========================================
    // TILES ATLAS
    // ==========================================
    TILES: {
        street: 'tile-street',
        sidewalk: 'tile-sidewalk',
        alley: 'tile-alley',
        concreteCracked: 'tile-concrete-cracked',
        dirtyFloor: 'tile-dirty-floor',
        woodFloor: 'tile-wood-floor',
        wallBrick: 'tile-wall-brick',
        wallInterior: 'tile-wall-interior'
    },
    
    // ==========================================
    // UI-HUD ATLAS
    // ==========================================
    UI_HUD: {
        panelBar: 'hud-panel-bar',
        panel: 'panel',
        iconRaw: 'icon-raw-materials',
        iconProduct: 'icon-product'
    },
    
    // ==========================================
    // PLAYER-MAIN ATLAS
    // ==========================================
    PLAYER: {
        // Walk cycle
        walkDown1: 'walk-down-1',
        walkDown2: 'walk-down-2',
        walkUp1: 'walk-up-1',
        walkUp2: 'walk-up-2',
        walkLeft1: 'walk-left-1',
        walkLeft2: 'walk-left-2',
        walkRight1: 'walk-right-1',
        walkRight2: 'walk-right-2',
        
        // Portraits
        portraitHappy: 'portrait-happy',
        portraitNeutral: 'portrait-neutral',
        portraitHurt: 'portrait-hurt',
        portraitAngry: 'portrait-angry',
        portraitDead: 'portrait-dead',
        
        // Battle states
        battleIdle: 'battle-idle',
        battleAttack: 'battle-attack',
        battleDefend: 'battle-defend',
        battleHurt: 'battle-hurt',
        battleDead: 'battle-dead'
    },
    
    // ==========================================
    // NPCs ATLAS
    // ==========================================
    NPCs: {
        vendor: 'npc-vendor',
        buyer: 'npc-buyer',
        rival: 'npc-rival',
        police: 'npc-police',
        shopOwner: 'npc-shop-owner',
        corruptCop: 'npc-corrupt-cop'
    },
    
    // ==========================================
    // ENEMIES ATLAS
    // ==========================================
    ENEMIES: {
        gangsterIdle: 'gangster-idle',
        gangsterDefeat: 'gangster-defeat',
        thugIdle: 'thug-idle',
        thugAttack: 'thug-attack',
        thugHurt: 'thug-hurt',
        bossIdle: 'boss-idle',
        bossAttack: 'boss-attack',
        bossHurt: 'boss-hurt',
        bossDefeat: 'boss-defeat',
        enforcerIdle: 'enforcer-idle',
        enforcerAttack: 'enforcer-attack',
        enforcerDefeat: 'enforcer-defeat'
    },
    
    // ==========================================
    // UI-COMBAT ATLAS
    // ==========================================
    UI_COMBAT: {
        frame: 'combat-frame',
        hpBarPlayer: 'hp-bar-player',
        hpBarEnemy: 'hp-bar-enemy',
        xpBar: 'xp-bar',
        damageNumbers: 'damage-numbers',
        healthPotion: 'health-potion',
        runButton: 'run-button',
        victoryScreen: 'victory-screen',
        defeatScreen: 'defeat-screen'
    },
    
    // ==========================================
    // SKILLS ATLAS
    // ==========================================
    SKILLS: {
        // Luck skills
        luckCardShark: 'luck-card-shark',
        luckEscapeArtist: 'luck-escape-artist',
        luckFastTalk: 'luck-fast-talk',
        luckFortune: 'luck-fortune',
        luckGameOfChance: 'luck-game-of-chance',
        luckLuckyBreak: 'luck-lucky-break',
        
        // Ability skills
        abilityToughness: 'ability-toughness',
        abilityUnbreakable: 'ability-unbreakable',
        abilityLastStand: 'ability-last-stand',
        abilityIronFist: 'ability-iron-fist',
        abilityBerserk: 'ability-berserk',
        abilityPowerStrike: 'ability-power-strike',
        
        // Intuition skills
        intuitionIntimidate: 'intuition-intimidate',
        intuitionDeadlyPrecision: 'intuition-deadly-precision',
        intuitionSneak: 'intuition-sneak',
        intuitionStreetSense: 'intuition-street-sense',
        intuitionShadowWalk: 'intuition-shadow-walk',
        intuitionLockpick: 'intuition-lockpick'
    },
    
    // ==========================================
    // STATUS EFFECTS ATLAS
    // ==========================================
    STATUS_EFFECTS: {
        burn: 'status-burn',
        freeze: 'status-freeze',
        poison: 'status-poison'
    },
    
    // ==========================================
    // OBJECTS ATLAS
    // ==========================================
    OBJECTS: {
        cardboardBox: 'cardboard-box',
        storageUnit: 'storage-unit',
        dumpster: 'dumpster',
        workstation: 'workstation',
        trashCan: 'trash-can-metal',
        steamVent: 'steam-vent',
        graffitiWall: 'graffiti-wall',
        mailbox: 'mailbox',
        oilStain: 'oil-stain',
        parkBench: 'park-bench',
        safe: 'safe',
        cardboardBoxScattered: 'cardboard-box-scattered',
        lockers: 'lockers',
        deadTree: 'dead-tree',
        pothole: 'pothole',
        weeds: 'weeds',
        barrels: 'barrels',
        barricade: 'barricade',
        motorcycle: 'motorcycle',
        fadedPaint: 'faded-paint',
        bushes: 'bushes',
        shoppingCart: 'shopping-cart',
        manholeCover: 'manhole-cover',
        scale: 'scale',
        puddle: 'puddle',
        streetLamp: 'street-lamp',
        carSuv: 'car-suv',
        mattress: 'mattress',
        cashPile: 'cash-pile',
        sprinkler: 'sprinkler',
        carSedan: 'car-sedan',
        dumpsterOpen: 'dumpster-open',
        dumpsterClosed: 'dumpster-closed',
        bicycle: 'bicycle',
        table: 'table',
        oldChair: 'old-chair',
        guardRail: 'guard-rail',
        newspaperStand: 'newspaper-stand',
        burnerPhone: 'burner-phone',
        brickWall: 'brick-wall',
        truckDelivery: 'truck-delivery',
        crates: 'crates',
        brokenWindow: 'broken-window',
        fireHydrant: 'fire-hydrant',
        trafficCone: 'traffic-cone',
        phoneBooth: 'phone-booth',
        fenceSection: 'fence-section',
        poolWater: 'pool-water',
        vanCargo: 'van-cargo'
    }
};

/**
 * Helper to get sprite key with atlas
 * @param {string} atlasKey - The atlas key (e.g., 'tiles')
 * @param {string} frameName - The frame name (e.g., 'tile-street')
 * @returns {string} - The complete key for add.image()
 */
export function getAtlasSprite(atlasKey, frameName) {
    return { key: atlasKey, frame: frameName };
}

/**
 * Check if an atlas is loaded and available
 * @param {Phaser.Scene} scene - The scene to check
 * @param {string} atlasKey - The atlas key to check
 * @returns {boolean}
 */
export function isAtlasLoaded(scene, atlasKey) {
    return scene.textures.exists(atlasKey);
}
