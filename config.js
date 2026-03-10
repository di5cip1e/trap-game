// Game configuration and constants
export const CONFIG = {
    // Screen config
    WIDTH: 1920,
    HEIGHT: 1080,
    
    // Character creation
    TOTAL_STAT_POINTS: 10,
    MIN_STAT: 0,
    MAX_STAT: 10,
    
    // Races available
    RACES: ['African American', 'Caucasian', 'Hispanic', 'Asian', 'Other'],
    
    // Race bonuses definition
    RACE_BONUSES: {
        'African American': {
            statBoosts: { intuition: 2 },
            runnerSuccessBonus: 0.10,  // +10% runner success (reduced bust chance)
            heatResistance: 0          // No heat resistance
        },
        'Caucasian': {
            statBoosts: { luck: 2 },
            runnerSuccessBonus: 0,
            rpsExtraDice: true,         // Extra dice in RPS
            heatResistance: 0
        },
        'Hispanic': {
            statBoosts: { ability: 2 },
            runnerSuccessBonus: 0,
            productionSpeed: 0.20,     // +20% faster production (more yield)
            heatResistance: 0
        },
        'Asian': {
            statBoosts: { intuition: 1 },
            runnerSuccessBonus: 0,
            heatResistance: 0.20,      // +20% heat resistance
            policeSpawnReduction: 0.10, // -10% police spawn rate
            productionSpeed: 0
        },
        'Other': {
            statBoosts: { intuition: 1, ability: 1, luck: 1 },
            runnerSuccessBonus: 0.05,  // +5% to all
            heatResistance: 0.05,
            policeSpawnReduction: 0.05,
            productionSpeed: 0.05,
            rpsExtraDice: false
        }
    },
    
    // Stat descriptions
    STAT_DESCRIPTIONS: {
        intuition: 'Affects awareness, reading situations, and avoiding danger',
        ability: 'Physical capability, speed, and combat effectiveness',
        luck: 'Random events, rare finds, and critical outcomes'
    },
    
    // Gameplay
    TILE_SIZE: 64,
    GRID_WIDTH: 30,
    GRID_HEIGHT: 20,
    
    // Time system
    MINUTES_PER_MOVE: 5,        // Each move = 5 game minutes
    MINUTES_PER_DAY: 1440,      // 24 hours
    DAY_START_HOUR: 6,          // Day starts at 6 AM
    NIGHT_START_HOUR: 22,       // Night starts at 10 PM
    
    // Hustle system
    MAX_HUSTLE: 100,
    HUSTLE_DRAIN_PER_MOVE: 0.5,
    HUSTLE_PASSOUT_PENALTY: 0.1, // 10% of cash
    
    // Rank system
    RANKS: [
        { name: 'Street Rat', minMoney: 0 },
        { name: 'Corner Worker', minMoney: 500 },
        { name: 'Block Captain', minMoney: 2000 },
        { name: 'District Boss', minMoney: 10000 },
        { name: 'Kingpin', minMoney: 50000 }
    ],
    
    // Economy
    RAW_MATERIAL_COST: 50,          // Cost per unit
    PRODUCT_BASE_YIELD: 2,          // Base units created per processing
    PRODUCT_SELL_PRICE: 100,        // Price per unit
    PROCESSING_HUSTLE_COST: 15,     // Hustle cost to process
    PROCESSING_RAW_COST: 1,         // Raw materials needed per batch
    
    // Heat system
    MAX_HEAT: 100,
    HEAT_DECAY_PER_DAY: 10,         // Heat decreases each day
    HEAT_DECAY_PER_SLEEP: 20,       // Heat decreases when sleeping
    HEAT_PENALTY_PER_POINT: 0.005,  // 0.5% less profit per heat point
    HEAT_GAIN_PASSOUT: 25,          // Heat gained when passing out with product
    HEAT_GAIN_PER_SALE: 5,          // Heat gained when selling product
    HEAT_THRESHOLD_POLICE: 50,      // Heat level that triggers police spawn
    
    // Police system
    POLICE_PATROL_SPEED: 100,       // Movement speed in ms
    POLICE_VISION_RANGE: 5,         // Grid tiles for line of sight
    POLICE_CHASE_SPEED: 80,         // Faster when chasing
    POLICE_CATCH_RANGE: 1.5,        // Distance to trigger arrest
    POLICE_BUST_CASH_PENALTY: 0.5,  // 50% cash loss on bust
    POLICE_ESCAPE_HUSTLE_COST: 30,  // Hustle cost to escape
    
    // Buyers
    BUYERS_PER_DAY: 3,              // Number of drop-off points spawned daily

    // Customer Types for the drug dealing system
    CUSTOMER_TYPES: {
        junkie: {
            name: 'Junkie',
            description: 'Desperate, shaky, will do anything for a fix',
            spawnRate: 'common',        // common/uncommon/rare
            priceMultiplier: 0.6,       // Pays 60% of base price (desperate)
            purchaseAmount: 1,          // Usually buys small amounts
            specialBehavior: 'steal',   // May steal from player
            stealChance: 0.15,          // 15% chance to steal
            dialog: [
                "Got anything... anything at all?",
                "I need it so bad, man...",
                "Please, I'll pay whatever you want",
                "*shaking* Just one hit...",
                "I got cash, I got cash! Look!"
            ],
            spriteType: 'junkie'
        },
        casual: {
            name: 'Casual User',
            description: 'Weekend user, middle-class',
            spawnRate: 'common',
            priceMultiplier: 1.0,       // Pays fair price
            purchaseAmount: 2,
            specialBehavior: 'none',
            dialog: [
                "Hey, got any good stuff?",
                "Just getting some for the weekend",
                "What's the quality like today?",
                "I'll take a couple, thanks"
            ],
            spriteType: 'casual'
        },
        partyGuy: {
            name: 'Party Guy',
            description: 'Wealthy, spends big at night',
            spawnRate: 'uncommon',
            priceMultiplier: 1.3,       // Pays 30% premium
            purchaseAmount: 4,          // Buys more
            specialBehavior: 'quality', // Pays extra for quality
            qualityBonus: 0.2,          // 20% extra for quality
            dialog: [
                "Need something for tonight's party!",
                "Got the good stuff? Money's no problem",
                "Hook me up, I got a big night ahead",
                "Premium only, I deserve the best"
            ],
            timePreference: 'night',    // Spawns more at night
            spriteType: 'party-guy'
        },
        hipster: {
            name: 'Hipster',
            description: 'Thinks they\'re above the street life',
            spawnRate: 'common',
            priceMultiplier: 0.9,       // Slightly below market
            purchaseAmount: 1,
            specialBehavior: 'judge',   // Makes comments about quality
            dialog: [
                "Is this... authentic?",
                "I prefer organic, you know what I mean",
                "My dealer usually gets me the artisanal stuff",
                "I mean, I'm not really into this scene, but..."
            ],
            spriteType: 'hipster'
        },
        oldHead: {
            name: 'Old Head',
            description: 'Been in the game forever, wise',
            spawnRate: 'rare',
            priceMultiplier: 1.2,       // Pays well
            purchaseAmount: 3,
            specialBehavior: 'tip',     // Gives tips
            tipChance: 0.25,            // 25% chance to give extra cash
            tipAmount: 50,              // Extra $50 tip
            dialog: [
                "I've seen it all, kid... respect the game",
                "Word of advice: don't mix business with pleasure",
                "You got good stuff? Been around long enough to tell",
                "The game's changed, but the money's still green"
            ],
            spriteType: 'old-head'
        },
        cop: {
            name: 'Undercover Cop',
            description: 'Buys to entrap players - dangerous!',
            spawnRate: 'rare',
            priceMultiplier: 1.0,       // Normal price
            purchaseAmount: 2,
            specialBehavior: 'bust',    // Will arrest if player is caught
            bustTrigger: 'heat',        // More likely to bust in high heat
            hiddenIdentity: true,       // Looks like regular customer
            canBeBribed: true,
            bribeCost: 500,
            dialog: [
                "Hey, I'm looking for something",
                "A friend told me you might have what I need",
                "What's a good price these days?",
                "Just a small amount, for a friend"
            ],
            spriteType: 'cop'
        },
        gangbanger: {
            name: 'Gangbanger',
            description: 'Buys for the crew - bulk orders',
            spawnRate: 'uncommon',
            priceMultiplier: 1.1,       // Pays slightly above market
            purchaseAmount: 5,          // Buys in bulk
            specialBehavior: 'bulk',    // Always wants bulk
            dialog: [
                "I need a good amount for the crew",
                "My people need supplies",
                "Don't mess with me, just give me the product",
                "Got a big order coming, be ready"
            ],
            spriteType: 'gangbanger'
        },
        tourist: {
            name: 'Tourist',
            description: 'Out of towner looking for a good time - easy money',
            spawnRate: 'very_rare',
            priceMultiplier: 1.5,       // Pays 50% premium
            purchaseAmount: 2,
            specialBehavior: 'easy',    // Easy to deal with
            dialog: [
                "So this is where the magic happens?",
                "My buddy told me this is the spot",
                "Whoa, this is kinda intense, man",
                "Like, can you hook a brother up?"
            ],
            spriteType: 'tourist'
        }
    },

    // Spawn rate weights for customers
    CUSTOMER_SPAWN_WEIGHTS: {
        common: 50,
        uncommon: 30,
        rare: 15,
        very_rare: 5
    },
    
    // Rival encounters
    RIVAL_SPAWN_CHANCE: 1,          // Always 1 rival per sector
    RIVAL_PROXIMITY_TRIGGER: 3,     // Grid distance to trigger encounter
    RIVAL_CASH_DROP_MIN: 100,       // Minimum cash on win
    RIVAL_CASH_DROP_MAX: 300,       // Maximum cash on win
    RIVAL_HUSTLE_PENALTY: 0.2,      // 20% hustle loss on defeat
    
    // NPC Relationships
    MAX_LOYALTY: 10,                // Maximum loyalty level
    LOYALTY_THRESHOLD: 5,           // Loyalty needed for perks
    BRIBE_CASH_AMOUNT: 100,         // Cash cost for bribe
    BRIBE_PRODUCT_AMOUNT: 2,        // Product cost for bribe
    BRIBE_CASH_LOYALTY: 1,          // Loyalty gained from cash bribe
    BRIBE_PRODUCT_LOYALTY: 2,       // Loyalty gained from product bribe
    LOYALTY_DECAY_PER_DAY: 1,       // Loyalty decays without interaction
    
    // Safehouse upgrades
    SAFEHOUSE_TIERS: [
        {
            id: 'cardboard',
            name: 'Cardboard Box',
            stashSlots: 2,
            hustleRestore: 1.0,     // 100% restore
            sprite: 'cardboard-box',
            scale: 0.18,
            cost: 0,
            canHireRunners: false
        },
        {
            id: 'storage',
            name: 'Rented Storage Unit',
            stashSlots: 10,
            hustleRestore: 1.0,     // 100% restore
            sprite: 'storage-unit',
            scale: 0.12,
            cost: 500,
            canHireRunners: false
        },
        {
            id: 'apartment',
            name: 'Apartment',
            stashSlots: 20,
            hustleRestore: 1.0,     // 100% restore
            sprite: 'storage-unit',  // Reuse sprite for now
            scale: 0.12,
            cost: 2000,
            canHireRunners: true
        }
    ],
    
    // Runner system
    RUNNER_DAILY_FEE: 150,              // Daily cost to maintain runner
    RUNNER_CUT: 0.10,                   // Runner takes 10% cut
    RUNNER_BUST_BASE_CHANCE: 0.10,     // 10% base chance of getting busted
    RUNNER_INTUITION_REDUCTION: 0.01,  // Each intuition point reduces bust chance by 1%
    
    // Calendar events
    CALENDAR_WEEK_LENGTH: 7,            // Days in a week
    CRACKDOWN_DAY: 7,                   // Day 7 is always crackdown
    CRACKDOWN_POLICE_MULTIPLIER: 2,     // Police spawn twice as often
    CRACKDOWN_HEAT_MULTIPLIER: 2,       // Heat gain doubles
    DROUGHT_DURATION: 2,                // Drought lasts 2 days
    DROUGHT_COST_MULTIPLIER: 2,         // Raw materials cost 2x
    DROUGHT_SELL_MULTIPLIER: 2,         // Product sells for 2x
    DROUGHT_MIN_INTERVAL: 2,            // Min days between droughts
    
    // Equipment
    EQUIPMENT: {
        // Storage
        backpack: {
            name: 'Backpack',
            description: 'Carry more Raw Materials',
            cost: 200,
            type: 'storage',
            rawCapacityBonus: 5,
            productCapacityBonus: 3
        },
        
        // Weapons
        brassKnucks: {
            name: 'Brass Knuckles',
            description: 'Fight better in street confrontations',
            cost: 150,
            type: 'weapon',
            attackBonus: 2
        },
        switchblade: {
            name: 'Switchblade',
            description: 'Deadly in close-quarters combat',
            cost: 350,
            type: 'weapon',
            attackBonus: 4
        },
        pistol: {
            name: 'Pistol',
            description: 'Ranged weapon. Requires ammo to use.',
            cost: 800,
            type: 'weapon',
            attackBonus: 8,
            rangeAttack: true,
            ammoCost: 25  // Cost per shot
        },
        
        // Armor/Defense
        bulletproofVest: {
            name: 'Bulletproof Vest',
            description: 'Reduces damage from police encounters',
            cost: 500,
            type: 'armor',
            damageReduction: 0.3  // 30% damage reduction
        },
        heavyCoat: {
            name: 'Heavy Coat',
            description: 'Reduces heat gain from exposure',
            cost: 250,
            type: 'armor',
            heatReduction: 0.25  // 25% less heat gain
        },
        
        // Utility
        runningShoes: {
            name: 'Running Shoes',
            description: 'Move faster across the city',
            cost: 300,
            type: 'utility',
            speedBonus: 1.5  // 50% faster movement
        },
        binoculars: {
            name: 'Binoculars',
            description: 'See further on the minimap',
            cost: 200,
            type: 'utility',
            visionRangeBonus: 3  // +3 tiles to minimap
        },
        lockpick: {
            name: 'Lockpick Set',
            description: 'Faster safehouse entry',
            cost: 150,
            type: 'utility',
            safehouseEntrySpeed: 2  // 2x faster
        },
        burnerPhone: {
            name: 'Burner Phone',
            description: 'Faster buyer spawns',
            cost: 100,
            type: 'utility',
            buyerSpawnBonus: 0.5  // 50% faster
        },
        
        // Accessories
        goldChain: {
            name: 'Gold Chain',
            description: '+10% to buyer prices',
            cost: 400,
            type: 'accessory',
            priceBonus: 0.10  // 10% more money
        },
        designerSunglasses: {
            name: 'Designer Sunglasses',
            description: 'Reduces police detection chance',
            cost: 350,
            type: 'accessory',
            detectionReduction: 0.2  // 20% harder to detect
        }
    },
    
    // Inventory
    DEFAULT_RAW_CAPACITY: 10,       // Base raw material capacity
    DEFAULT_PRODUCT_CAPACITY: 5,    // Base product capacity
    
    // Colors
    COLORS: {
        primary: '#ffcc00',      // Amber/Gold
        secondary: '#ff6600',    // Orange
        danger: '#ff3333',       // Red
        success: '#66ff66',      // Green
        text: '#ffffff',         // White
        textDark: '#999999',     // Gray
        background: '#1a1a1a',   // Almost black
        panel: '#2a2a2a',        // Dark gray
        hustleHigh: '#66ff66',   // Green (>60%)
        hustleMid: '#ffcc00',    // Yellow (30-60%)
        hustleLow: '#ff3333'     // Red (<30%)
    },

    // Status Effects System
    STATUS_EFFECTS: {
        poisoned: {
            name: 'Poisoned',
            description: 'Takes damage each turn, movement speed reduced',
            duration: 5,              // Turns
            damagePerTurn: 2,         // HP damage per turn
            speedReduction: 0.5,      // 50% speed reduction
            color: '#33cc33',         // Green
            icon: '💀',
            stackable: false,
            mutuallyExclusive: ['onFire', 'frozen']
        },
        slowed: {
            name: 'Slowed',
            description: '50% movement speed for duration',
            duration: 4,
            speedMultiplier: 0.5,     // 50% speed
            color: '#9966ff',         // Purple
            icon: '🐌',
            stackable: false,
            mutuallyExclusive: ['paralyzed', 'frozen']
        },
        paralyzed: {
            name: 'Paralyzed',
            description: 'Cannot move, chance to break on hit',
            duration: 3,
            breakChance: 0.33,        // 33% chance to break when hit
            color: '#ffcc00',         // Yellow
            icon: '⚡',
            stackable: false,
            mutuallyExclusive: ['slowed', 'frozen', 'asleep', 'stunned']
        },
        stunned: {
            name: 'Stunned',
            description: 'Cannot act for 1-2 turns, vulnerable',
            duration: 2,              // Will be randomized 1-2
            vulnerabilityMultiplier: 2, // 2x damage taken
            color: '#ff6600',         // Orange
            icon: '💫',
            stackable: false,
            mutuallyExclusive: ['paralyzed', 'asleep', 'confused']
        },
        bleeding: {
            name: 'Bleeding',
            description: 'Loses health over time, leaves trail',
            duration: 6,
            damagePerTurn: 1,
            color: '#cc0000',         // Dark red
            icon: '🩸',
            stackable: true,          // Can stack for more damage
            mutuallyExclusive: []
        },
        onFire: {
            name: 'On Fire',
            description: 'Takes damage each turn, defense reduced',
            duration: 4,
            damagePerTurn: 3,
            defenseReduction: 0.5,    // 50% defense reduction
            color: '#ff3300',         // Fire red
            icon: '🔥',
            stackable: false,
            mutuallyExclusive: ['poisoned', 'frozen']
        },
        frozen: {
            name: 'Frozen',
            description: 'Cannot move, takes extra damage from next attack',
            duration: 3,
            extraDamageMultiplier: 1.5, // 50% extra damage from next hit
            color: '#00ccff',         // Ice blue
            icon: '❄️',
            stackable: false,
            mutuallyExclusive: ['poisoned', 'slowed', 'paralyzed', 'onFire']
        },
        confused: {
            name: 'Confused',
            description: 'Random movement direction for duration',
            duration: 4,
            color: '#ff66ff',         // Pink
            icon: '🌀',
            stackable: false,
            mutuallyExclusive: ['stunned', 'asleep']
        },
        asleep: {
            name: 'Asleep',
            description: 'Cannot act, wakes on damage',
            duration: 5,
            wakeOnDamage: true,
            color: '#6666ff',         // Blue
            icon: '💤',
            stackable: false,
            mutuallyExclusive: ['paralyzed', 'stunned', 'confused', 'drunk']
        },
        drunk: {
            name: 'Drunk',
            description: 'Accuracy reduced, random target selection',
            duration: 5,
            accuracyReduction: 0.5,   // 50% accuracy
            color: '#cc9933',         // Brown/gold
            icon: '🍺',
            stackable: false,
            mutuallyExclusive: ['asleep']
        },
        charmed: {
            name: 'Charmed',
            description: 'Friendly towards attacker, cannot attack them',
            duration: 4,
            color: '#ff99cc',         // Light pink
            icon: '💕',
            stackable: false,
            mutuallyExclusive: []
        }
    },

    // Player Skills that apply status effects
    PLAYER_SKILLS: {
        poisonDart: {
            name: 'Poison Dart',
            description: 'Apply Poisoned status (damage + slow)',
            statusEffect: 'poisoned',
            statusDuration: 5,
            damage: 5,
            apCost: 2,                // Ability points cost
            unlockCost: 3             // Points to unlock skill
        },
        slash: {
            name: 'Slash',
            description: 'Apply Bleeding status',
            statusEffect: 'bleeding',
            statusDuration: 6,
            damage: 8,
            apCost: 2,
            unlockCost: 2
        },
        fireBreath: {
            name: 'Fire Breath',
            description: 'Apply On Fire status (damage + -defense)',
            statusEffect: 'onFire',
            statusDuration: 4,
            damage: 10,
            apCost: 3,
            unlockCost: 5
        },
        iceShard: {
            name: 'Ice Shard',
            description: 'Apply Frozen status (extra damage from next hit)',
            statusEffect: 'frozen',
            statusDuration: 3,
            damage: 6,
            apCost: 2,
            unlockCost: 4
        },
        stunGrenade: {
            name: 'Stun Grenade',
            description: 'Apply Stunned status (cannot act)',
            statusEffect: 'stunned',
            statusDuration: 2,
            damage: 4,
            apCost: 2,
            unlockCost: 3
        },
        sleepGas: {
            name: 'Sleep Gas',
            description: 'Apply Asleep status',
            statusEffect: 'asleep',
            statusDuration: 5,
            damage: 0,
            apCost: 3,
            unlockCost: 4
        },
        confuseRay: {
            name: 'Confuse Ray',
            description: 'Apply Confused status (random movement)',
            statusEffect: 'confused',
            statusDuration: 4,
            damage: 2,
            apCost: 2,
            unlockCost: 3
        },
        slowShot: {
            name: 'Slow Shot',
            description: 'Apply Slowed status (50% speed)',
            statusEffect: 'slowed',
            statusDuration: 4,
            damage: 3,
            apCost: 1,
            unlockCost: 2
        }
    },

    // Enemy Skills that apply status effects
    ENEMY_SKILLS: {
        // Police skills
        taser: {
            name: 'Taser',
            description: 'Apply Paralyzed status',
            statusEffect: 'paralyzed',
            statusDuration: 3,
            damage: 5,
            accuracy: 0.7
        },
        pepperSpray: {
            name: 'Pepper Spray',
            description: 'Apply Slowed status',
            statusEffect: 'slowed',
            statusDuration: 4,
            damage: 3,
            accuracy: 0.7
        },
        // Rival skills
        knife: {
            name: 'Knife',
            description: 'Apply Bleeding status',
            statusEffect: 'bleeding',
            statusDuration: 6,
            damage: 10,
            accuracy: 0.8
        },
        dirtyTricks: {
            name: 'Dirty Tricks',
            description: 'Apply Confused status',
            statusEffect: 'confused',
            statusDuration: 4,
            damage: 2,
            accuracy: 0.6
        },
        // Corrupt Cop skills
        bribe: {
            name: 'Bribe',
            description: 'Apply Charmed status (won\'t attack)',
            statusEffect: 'charmed',
            statusDuration: 4,
            damage: 0,
            accuracy: 1.0
        }
    },

    // Gang Affiliations - Suppliers for buying supplies
    // These are special vendors you meet in dangerous locations
    GANG_AFFILIATIONS: {
        mafia: {
            id: 'mafia',
            name: 'Mafia Boss',
            fullName: 'Don Antonio Moretti',
            description: 'Classic organized crime, formal wear',
            origin: 'Italian-American',
            color: '#1a1a2e',
            accentColor: '#c70039',
            // Behavior
            productQuality: 1.2,      // Premium - 20% better yield
            priceMultiplier: 1.5,     // Expensive
            reliability: 0.95,        // Very reliable
            dangerLevel: 'medium',    // Medium risk meeting
            minLoyalty: 0,
            // Meeting location
            meetingLocation: 'restaurant',
            meetingArea: 'downtown',
            // Dialog
            greetings: [
                "Ah, a serious businessman. Respect.",
                "The family appreciates your... discretion.",
                "You want quality? I provide only the best.",
                "In my restaurant, we discuss business like gentlemen."
            ],
            dialog: {
                buy: "Yes, the product is excellent. Premium only.",
                loyalty: "You show loyalty. The family remembers friends.",
                warning: "Careful who you trust in this business.",
                threat: "You disappoint me. This is your last warning."
            },
            portrait: 'italian-boss',
            spriteType: 'mafia-boss'
        },
        bloods: {
            id: 'bloods',
            name: 'Bloods Capo',
            fullName: 'Vicious O',
            description: 'Red bandanas, street ready',
            origin: 'West Coast',
            color: '#8b0000',
            accentColor: '#ff0000',
            // Behavior
            productQuality: 1.0,
            priceMultiplier: 1.0,
            reliability: 0.8,
            dangerLevel: 'high',       // Dangerous area
            minLoyalty: 2,
            meetingLocation: 'alley',
            meetingArea: 'hood',
            greetings: [
                "What up, lil homie? You need product?",
                "Aight, let's keep this quick. The set is watching.",
                "You good people? We got that good stuff.",
                "Don't be trippin', just pay and go."
            ],
            dialog: {
                buy: "Good product, fair price. Don't waste my time.",
                loyalty: "You solid. We look out for our own.",
                warning: "Man, don't be acting weird around here.",
                threat: "You ain't from around here, huh? Big mistake."
            },
            portrait: 'bloods-capo',
            spriteType: 'bloods-capo'
        },
        crips: {
            id: 'crips',
            name: 'Crips Lieutenant',
            fullName: 'Big Blue',
            description: 'Blue, blue rag, neighborhood control',
            origin: 'West Coast',
            color: '#00008b',
            accentColor: '#4169e1',
            productQuality: 1.1,
            priceMultiplier: 0.9,     // Volume discount
            reliability: 0.85,
            dangerLevel: 'high',
            minLoyalty: 3,
            meetingLocation: 'parking-lot',
            meetingArea: 'hood',
            greetings: [
                "Crip business is solid. You want in?",
                "We protect our people. You buy big, we got you.",
                "The blue flag flies here. You safe.",
                "Aight, let's move. Product don't sell itself."
            ],
            dialog: {
                buy: "Buy more, save more. That's how we do.",
                loyalty: "You family now. We look after our own.",
                warning: "Don't be snitching, ya feel me?",
                threat: "You crossed the wrong set. Remember that."
            },
            portrait: 'crips-lieutenant',
            spriteType: 'crips-lieutenant'
        },
        latinKing: {
            id: 'latinKing',
            name: 'Latin King',
            fullName: 'Rey Sol',
            description: 'Gold and black, proud',
            origin: 'Latin Gang',
            color: '#ffd700',
            accentColor: '#000000',
            productQuality: 1.0,
            priceMultiplier: 1.0,
            reliability: 0.9,
            dangerLevel: 'medium',
            minLoyalty: 2,
            meetingLocation: 'warehouse',
            meetingArea: 'industrial',
            greetings: [
                "Bienvenido, amigo. You come for the best?",
                "We are the crown. Loyalty above all.",
                "The King collective provides. You are worthy?",
                "Respect the crown, and the crown provides."
            ],
            dialog: {
                buy: "Fair price for quality. We honor our word.",
                loyalty: "You show heart. We are brothers now.",
                warning: "Do not betray the crown's trust.",
                threat: "You shame yourself. The crown does not forget."
            },
            portrait: 'latin-king',
            spriteType: 'latin-king'
        },
        ms13: {
            id: 'ms13',
            name: 'MS-13',
            fullName: 'La Araña',
            description: 'Mara tattoos, serious',
            origin: 'Central American',
            color: '#2f2f2f',
            accentColor: '#ff4500',
            productQuality: 0.9,       // Cheap product
            priceMultiplier: 0.7,      // Very cheap
            reliability: 0.6,          // Unreliable
            dangerLevel: 'extreme',    // Very dangerous
            minLoyalty: 4,
            meetingLocation: 'safehouse',
            meetingArea: 'skid-row',
            greetings: [
                "La Mara doesn't mess around. You know this.",
                "You want cheap? We got the cheapest. No questions.",
                "MS is watching. Don't make me regret this.",
                "Quick transaction. No loose ends."
            ],
            dialog: {
                buy: "Cheap and plenty. What more you want?",
                loyalty: "You survive long enough, maybe we trust.",
                warning: "You actin' sus. We don't like sus.",
                threat: "You signed your death warrant. La Mara don't forget."
            },
            portrait: 'ms13-member',
            spriteType: 'ms13'
        },
        eighteenthStreet: {
            id: 'eighteenthStreet',
            name: '18th Street',
            fullName: 'El Diablo',
            description: '18 tattoo, rival to MS-13',
            origin: 'Central American',
            color: '#8b4513',
            accentColor: '#ffa500',
            productQuality: 0.95,
            priceMultiplier: 0.85,     // Competitive
            reliability: 0.7,
            dangerLevel: 'high',
            minLoyalty: 3,
            meetingLocation: 'tunnel',
            meetingArea: 'underground',
            greetings: [
                "18 Street! We don't back down from anyone.",
                "You want to compete with MS? Smart choice.",
                "Quick deal. We got eyes everywhere.",
                "This is our territory. You lucky we talking."
            ],
            dialog: {
                buy: "Good price. Better than those MS fools.",
                loyalty: "You chose right. 18 Street is family.",
                warning: "Don't be going near MS territory.",
                threat: "You betrayed 18 Street? Bad move."
            },
            portrait: '18th-street-member',
            spriteType: '18th-street'
        },
        triad: {
            id: 'triad',
            name: 'Triad Boss',
            fullName: 'Dragon Master Chen',
            description: 'Traditional suit, calculating',
            origin: 'Chinese',
            color: '#8b0000',
            accentColor: '#ffd700',
            productQuality: 1.3,       // Best quality
            priceMultiplier: 1.4,      // Expensive for quality
            reliability: 0.95,
            dangerLevel: 'medium',
            minLoyalty: 4,
            meetingLocation: 'restaurant',
            meetingArea: 'chinatown',
            greetings: [
                "Welcome, valued associate. We discuss business.",
                "The Dragon Society provides only excellence.",
                "In my establishment, discretion is guaranteed.",
                "You show wisdom in choosing quality."
            ],
            dialog: {
                buy: "The finest product. Our quality is unmatched.",
                loyalty: "You earn respect. The Society remembers.",
                warning: "Discretion is required. No loose talk.",
                threat: "You have disappointed the Dragon. Consequences follow."
            },
            portrait: 'triad-boss',
            spriteType: 'triad-boss'
        },
        yakuza: {
            id: 'yakuza',
            name: 'Yakuza Lieutenant',
            fullName: 'Tanaka-san',
            description: 'Sleek, professional',
            origin: 'Japanese',
            color: '#000000',
            accentColor: '#dc143c',
            productQuality: 1.25,
            priceMultiplier: 1.6,      // Expensive
            reliability: 0.9,
            dangerLevel: 'medium',
            minLoyalty: 3,
            meetingLocation: 'dojo',
            meetingArea: 'downtown',
            greetings: [
                "You honor us with your business.",
                "The Yakuza provides only the finest.",
                "A pleasure to do business. Japanese precision.",
                "Welcome, friend. Let us conduct proper business."
            ],
            dialog: {
                buy: "Top quality. Worth every yen.",
                loyalty: "You are trustworthy. We value such.",
                warning: "Honor must be maintained. Do not shame us.",
                threat: "You bring shame. The blade does not forgive."
            },
            portrait: 'yakuza-lieutenant',
            spriteType: 'yakuza-lieutenant'
        },
        irishMob: {
            id: 'irishMob',
            name: 'Irish Mob',
            fullName: 'Mick O\'Brien',
            description: 'Red hair, beard, tough',
            origin: 'Irish-American',
            color: '#006400',
            accentColor: '#ff0000',
            productQuality: 1.0,
            priceMultiplier: 0.9,
            reliability: 0.8,
            dangerLevel: 'high',
            minLoyalty: 2,
            meetingLocation: 'bar',
            meetingArea: 'southside',
            greetings: [
                "Aye, ready for some business?",
                "The Irish don't mess around. Quality stuff.",
                "Pull up a chair, we got business to discuss.",
                "Ye want the good stuff? We got it."
            ],
            dialog: {
                buy: "Fair prices, good product. That's the Irish way.",
                loyalty: "Ye're good people. We look out for our own.",
                warning: "Don't be going to the fuzz, comprende?",
                threat: "Ye made a big mistake, boyo. Very big."
            },
            portrait: 'irish-mob',
            spriteType: 'irish-mob'
        },
        hellsAngels: {
            id: 'hellsAngels',
            name: 'Hells Angels',
            fullName: 'Skullcrusher',
            description: 'Leather vest, biker gear',
            origin: 'Biker Gang',
            color: '#000000',
            accentColor: '#ff6600',
            productQuality: 1.0,
            priceMultiplier: 1.0,
            reliability: 0.85,
            dangerLevel: 'high',        // Rough area
            minLoyalty: 3,
            meetingLocation: 'clubhouse',
            meetingArea: 'industrial',
            greetings: [
                "Ride in, make it quick.",
                "We don't do small time. You buying big?",
                "The club provides. Pay and don't cause trouble.",
                "You want product? We got plenty. Don't waste it."
            ],
            dialog: {
                buy: "Good product, fair price. Keep it moving.",
                loyalty: "You're solid. The club looks after its own.",
                warning: "Don't be snitchin', ever. That's the rule.",
                threat: "You cross the club? We'll find you. Always do."
            },
            portrait: 'hells-angels',
            spriteType: 'hells-angels'
        }
    },

    // Supplier meeting system config
    SUPPLIER_CONFIG: {
        // How often suppliers become available (in days)
        SUPPLIER_CYCLE_DAYS: 3,
        // Number of suppliers available per cycle
        SUPPLIERS_PER_CYCLE: 3,
        // Loyalty decay for suppliers
        LOYALTY_DECAY_PER_MISS: 1,
        // Maximum suppliers you can maintain relations with
        MAX_ACTIVE_SUPPLIERS: 5,
        // Meeting locations
        LOCATIONS: {
            restaurant: {
                name: 'Restaurant',
                dangerLevel: 'low',
                vibe: 'classy'
            },
            alley: {
                name: 'Alleyway',
                dangerLevel: 'high',
                vibe: 'street'
            },
            'parking-lot': {
                name: 'Parking Lot',
                dangerLevel: 'medium',
                vibe: 'neutral'
            },
            warehouse: {
                name: 'Warehouse',
                dangerLevel: 'medium',
                vibe: 'industrial'
            },
            safehouse: {
                name: 'Safehouse',
                dangerLevel: 'high',
                vibe: 'underground'
            },
            tunnel: {
                name: 'Underground Tunnel',
                dangerLevel: 'high',
                vibe: 'underground'
            },
            dojo: {
                name: 'Dojo',
                dangerLevel: 'low',
                vibe: 'classy'
            },
            bar: {
                name: 'Bar',
                dangerLevel: 'medium',
                vibe: 'rough'
            },
            clubhouse: {
                name: 'Clubhouse',
                dangerLevel: 'high',
                vibe: 'rough'
            }
        }
    }
};
