// Game configuration and constants
import { NEIGHBORHOODS } from './MapGenerator.js';

// Get neighborhood keys as constants
const NEIGHBORHOOD_KEYS = Object.keys(NEIGHBORHOODS);

export const CONFIG = {
    // Screen config
    WIDTH: 1920,
    HEIGHT: 1080,
    
    // Character creation
    TOTAL_STAT_POINTS: 10,
    MIN_STAT: 0,
    MAX_STAT: 10,
    
    // Neighborhood origins available (using constants from MapGenerator)
    NEIGHBORHOODS: NEIGHBORHOOD_KEYS,
    
    // Get display name for a neighborhood key
    getNeighborhoodName(key) {
        return NEIGHBORHOODS[key]?.name || key;
    },
    
    // Get neighborhood by display name (for backward compatibility)
    getNeighborhoodByName(name) {
        for (const [key, data] of Object.entries(NEIGHBORHOODS)) {
            if (data.name === name) return key;
        }
        return null;
    },
    
    // Neighborhood origin bonuses definition (using display names as fallback keys for display)
    NEIGHBORHOOD_BONUSES: {
        'RIVERSIDE': {
            displayName: 'Riverside',
            statBoosts: { luck: 1, intuition: 1 },
            priceDiscount: 0.15,          // 15% better prices (small town - everyone knows everyone)
            heatResistance: 0.05,          // Familiar faces = less attention
            startingArea: true,            // This is where players start
            isGateway: true,               // Gateway to The Docks
            trainAccess: true              // Can take train to The Docks
        },
        'OLD_TOWN': {
            displayName: 'Old Town',
            statBoosts: { intuition: 2 },
            priceDiscount: 0.10,       // 10% better prices (connections)
            heatResistance: 0,
            rpsExtraDice: true         // Extra edge in negotiations
        },
        'SKID_ROW': {
            displayName: 'Skid Row',
            statBoosts: { ability: 2 },
            runnerSuccessBonus: 0.10,  // +10% runner success (knows the streets)
            heatResistance: 0
        },
        'THE_FLATS': {
            displayName: 'The Flats',
            statBoosts: { luck: 2 },
            runnerSuccessBonus: 0.05,
            heatResistance: 0.10,      // Knows how to lay low
            productionSpeed: 0.10      // Efficient with resources
        },
        'IRONWORKS': {
            displayName: 'Ironworks',
            statBoosts: { ability: 1, intuition: 1 },
            productionSpeed: 0.20,     // +20% production (knows the craft)
            heatResistance: 0
        },
        'THE_HARBOR': {
            displayName: 'The Harbor',
            statBoosts: { intuition: 1, luck: 1 },
            policeSpawnReduction: 0.15, // -15% police spawn rate (knows the waters)
            heatResistance: 0.05
        },
        'THE_MAW': {
            displayName: 'The Maw',
            statBoosts: { intuition: 2 },
            heatResistance: 0.20,      // +20% heat resistance (hidden tunnels)
            policeSpawnReduction: 0.10,
            priceDiscount: 0.05
        },
        'INDUSTRIAL_ZONE': {
            displayName: 'Industrial Zone',
            statBoosts: { ability: 2 },
            productionSpeed: 0.15,
            runnerSuccessBonus: 0.05,
            heatResistance: 0
        },
        'SALVAGE_YARD': {
            displayName: 'Salvage Yard',
            statBoosts: { luck: 1, intuition: 1 },
            runnerSuccessBonus: 0.15,  // +15% runner success (best for runners)
            priceDiscount: 0.05,
            productionSpeed: 0.05
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

    // View culling - tiles outside camera view + buffer won't render
    CULLING_BUFFER: 2,  // Render 2 tiles extra outside viewport

    // ==========================================
    // SPRITE SCALE CONSTANTS (Asset Optimization)
    // ==========================================
    // These define the display scale for each asset type.
    // Optimal sizes: Tiles=64x64, Characters/NPCs=128x128 or 256x256
    // This prevents hardcoded magic numbers in scene files.
    SCALE: {
        // Tiles - should render at exactly TILE_SIZE
        TILE: 1.0,

        // Player sprites (currently 1024x1024, optimal: 256x256)
        PLAYER: 0.25,        // 256px -> ~64px display (or use 0.15 for 1024x1024 source)

        // NPC sprites
        NPC_VENDOR: 0.25,
        NPC_BUYER: 0.25,
        NPC_RIVAL: 0.25,
        NPC_POLICE: 0.25,
        NPC_SHOP_OWNER: 0.25,
        NPC_CORRUPT_COP: 0.25,
        NPC_GANG_MEMBER: 0.25,    // For future gang supplier sprites
        NPC_TRAVELING_SALESMAN: 0.25,  // Traveling salesman NPC

        // Interactive objects
        OBJECT_SMALL: 1.0,        // 64x64 source (cardboard box)
        OBJECT_MEDIUM: 0.5,       // 128x128 source displayed at 64x64
        OBJECT_LARGE: 0.25,       // 256x256 source displayed at 64x64

        // Environment objects with custom scales (from safehouse config)
        CARDBOARD_BOX: 0.18,
        STORAGE_UNIT: 0.12,
        WORKSTATION: 0.12,
        DUMPSTER: 0.12,

        // UI icons - should be 1:1
        ICON: 1.0,
    },
    
    // Time system
    MINUTES_PER_MOVE: 5,        // Each move = 5 game minutes
    MINUTES_PER_DAY: 1440,      // 24 hours
    DAY_START_HOUR: 6,          // Day starts at 6 AM
    NIGHT_START_HOUR: 22,       // Night starts at 10 PM
    
    // Hustle system
    MAX_HUSTLE: 100,
    HUSTLE_DRAIN_PER_MOVE: 0.5,
    HUSTLE_PASSOUT_PENALTY: 0.1, // 10% of cash
    
    // Level system
    MAX_LEVEL: 20,
    
    // Rank system
    RANKS: [
        { name: 'Street Rat', minMoney: 0 },
        { name: 'Corner Worker', minMoney: 500 },
        { name: 'Block Captain', minMoney: 2000 },
        { name: 'District Boss', minMoney: 10000 },
        { name: 'Kingpin', minMoney: 50000 }
    ],
    
    // Economy
    RAW_MATERIAL_COST: 150,         // Cost per unit (was 50)
    PRODUCT_BASE_YIELD: 2,          // Base units created per processing
    PRODUCT_SELL_PRICE: 120,        // Price per unit (was 100) - ~40% profit margin
    PROCESSING_HUSTLE_COST: 15,     // Hustle cost to process
    PROCESSING_RAW_COST: 1,         // Raw materials needed per batch
    
    // Drug Types System
    DRUG_TYPES: {
        // WEED - Entry level, low risk, low reward
        'Weed': {
            rawMaterial: 'Weed Plants',
            buyPrice: 30,
            sellPrice: 80,
            heatGain: 3,
            yield: 2,
            difficulty: 1,
            description: 'Entry-level herb. Easy to move, low heat.',
            category: 'plant'
        },
        // MUSHROOMS - Psychedelic, medium risk
        'Mushrooms': {
            rawMaterial: 'Mushroom Spores',
            buyPrice: 50,
            sellPrice: 150,
            heatGain: 5,
            yield: 1,
            difficulty: 2,
            description: 'Psychedelic trip. Medium profit, medium heat.',
            category: 'psychedelic'
        },
        // COCAINE - Premium powder, high profit
        'Cocaine': {
            rawMaterial: 'Coca Leaves',
            buyPrice: 100,
            sellPrice: 350,
            heatGain: 8,
            yield: 1,
            difficulty: 3,
            description: 'Premium powder. High profit, high heat.',
            category: 'powder'
        },
        // MDMA - Party drug, volume sales
        'MDMA': {
            rawMaterial: 'Methylamine',
            buyPrice: 80,
            sellPrice: 250,
            heatGain: 6,
            yield: 2,
            difficulty: 3,
            description: 'Party drug. Good for bulk sales at clubs.',
            category: 'powder'
        },
        // CRACK - Derived from Cocaine (must process)
        'Crack': {
            rawMaterial: null, // Made from Cocaine, not bought
            buyPrice: 0, // Not bought directly
            sellPrice: 200,
            heatGain: 12,
            yield: 1,
            difficulty: 4,
            requires: 'Cocaine', // Must process from cocaine
            processingCost: 2, // 2 units of cocaine per crack batch
            description: 'Rock form. High heat, high reward. Must process from cocaine.',
            category: 'derived'
        },
        
        // METH - Requires precursors (from traveling salesman)
        'Meth': {
            rawMaterial: null, // Made from precursors, not bought directly
            buyPrice: 0, // Not bought directly
            sellPrice: 300,
            heatGain: 10,
            yield: 1,
            difficulty: 4,
            requires: 'Precursors',
            processingCost: 3, // 3 precursor units per batch
            precursorNames: ['Compound A', 'Compound B'], // Generalized names
            description: 'Crystal meth. High profit, very high heat. Requires precursors from traveling salesman.',
            category: 'synthesized'
        },
        
        // PRECURSORS - Meth ingredients (from specific sources)
        'Precursor A': {
            rawMaterial: null,
            buyPrice: 60,
            sellPrice: 0, // Can't sell, only buy
            heatGain: 2,
            yield: 1,
            difficulty: 1,
            isPrecursor: true,
            forDrug: 'Meth',
            description: 'Meth precursor. Get from traveling salesman or sketchy suppliers.',
            category: 'precursor'
        },
        'Precursor B': {
            rawMaterial: null,
            buyPrice: 45,
            sellPrice: 0,
            heatGain: 2,
            yield: 1,
            difficulty: 1,
            isPrecursor: true,
            forDrug: 'Meth',
            description: 'Meth precursor. Get from traveling salesman or sketchy suppliers.',
            category: 'precursor'
        }
    },
    
    // Default active drug (legacy - now player can have multiple)
    DEFAULT_DRUG: 'Weed',
    
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
            preferredDrug: 'Weed',      // Desperate for anything, but Weed is most accessible
            preferredDrugBonus: 0.2,    // Pays 20% more for preferred drug
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
            preferredDrug: 'Weed',      // Weekend herb user
            preferredDrugBonus: 0.2,   // Pays 20% more for preferred drug
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
            preferredDrug: 'MDMA',      // Party drug - hits hard at clubs
            preferredDrugBonus: 0.2,   // Pays 20% more for preferred drug
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
            preferredDrug: 'Weed',      // Thinks Weed is artisanal and organic
            preferredDrugBonus: 0.2,    // Pays 20% more for preferred drug
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
            preferredDrug: 'Weed',       // Classic, been smoking since the 70s
            preferredDrugBonus: 0.2,    // Pays 20% more for preferred drug
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
            preferredDrug: 'Weed',       // Buys whatever, no real preference
            preferredDrugBonus: 0.2,    // Would pay more for their "cover" preference
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
            purchaseAmount: 5,         // Buys in bulk
            preferredDrug: 'Cocaine',   // Premium product for the crew
            preferredDrugBonus: 0.2,   // Pays 20% more for preferred drug
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
            preferredDrug: 'Weed',      // Classic "I tried it in Amsterdam" tourist
            preferredDrugBonus: 0.2,    // Pays 20% more for preferred drug
            specialBehavior: 'easy',    // Easy to deal with
            dialog: [
                "So this is where the magic happens?",
                "My buddy told me this is the spot",
                "Whoa, this is kinda intense, man",
                "Like, can you hook a brother up?"
            ],
            spriteType: 'tourist'
        },
        travelingSalesman: {
            name: 'Traveling Salesman',
            description: 'Mysterious figure selling rare items and meth precursors',
            spawnRate: 'rare',
            priceMultiplier: 1.8,       // High prices but rare items
            purchaseAmount: 0,          // Doesn't buy - only sells
            preferredDrug: null,        // Vendor - doesn't buy
            preferredDrugBonus: 0,
            specialBehavior: 'vendor',  // Opens a special vendor UI
            isVendor: true,             // Player can buy FROM them
            vendorInventory: [          // Special items only he sells
                'Precursor A',
                'Precursor B'
            ],
            triggersCombat: true,       // Can trigger combat encounter
            combatChance: 0.2,          // 20% chance to attack
            dialog: [
                "Looking for something... special? I got stuff you won't find anywhere else.",
                "Psst... I have precursors. Top quality. Don't ask where from.",
                "You've got good instincts, coming to me. These items are hard to find.",
                "Business is booming. Want in on some exclusive merchandise?",
                "I've been traveling all week. Got some rare items nobody else has."
            ],
            spriteType: 'traveling-salesman'
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
    
    // ==========================================
    // RANDOM ECONOMY EVENTS SYSTEM
    // ==========================================
    // Dynamic events that trigger randomly every 3-7 days
    ECONOMY_EVENTS: {
        // Police Raid: Prices drop, 70% fewer buyers
        POLICE_RAID: {
            name: 'Police Raid',
            description: 'Police raid in progress! Hard to sell, 70% fewer buyers!',
            priceMultiplier: 0.5,        // 50% less money for sales
            heatGainMultiplier: 2.5,     // 2.5x heat gain
            rawCostMultiplier: 1.0,      // Raw materials unchanged
            buyerMultiplier: 0.3,        // 70% fewer buyers
            duration: 2,                 // Lasts 2 days
            affectedArea: 'current',     // Current neighborhood
            color: '#ff4444'
        },
        
        // Gang War: Area locked, no buyers
        GANG_WAR: {
            name: 'Gang War',
            description: 'Gang war! Area locked down, no buyers!',
            priceMultiplier: 0.4,        // 60% less money
            heatGainMultiplier: 1.8,     // More heat
            rawCostMultiplier: 1.5,      // Raw materials 50% more
            buyerMultiplier: 0,          // No buyers at all
            blocksTravel: true,          // Can't travel between neighborhoods
            duration: 2,                 // Lasts 2 days
            affectedArea: 'current',     // Current neighborhood
            color: '#aa0000'
        },
        
        // Drought: Prices 2x, paranoid buyers
        DROUGHT: {
            name: 'Drought',
            description: 'Supply drought! Prices 2x, buyers paranoid!',
            priceMultiplier: 2.0,        // 2x prices
            heatGainMultiplier: 1.2,     // Slightly more heat
            rawCostMultiplier: 2.5,      // Raw materials 2.5x cost
            buyerMultiplier: 0.6,        // 40% fewer buyers (paranoid)
            duration: 3,                 // Lasts 3 days
            affectedArea: 'all',         // Affects all areas
            color: '#cc8800'
        },
        
        // Oversupply: Prices 0.5x
        OVERSUPPLY: {
            name: 'Oversupply',
            description: 'Market flooded! Prices cut in half!',
            priceMultiplier: 0.5,        // 50% less money
            heatGainMultiplier: 0.8,     // Less heat (plenty of supply)
            rawCostMultiplier: 0.6,      // Raw materials 40% cheaper
            buyerMultiplier: 1.2,        // More buyers due to low prices
            duration: 3,                 // Lasts 3 days
            affectedArea: 'all',         // Affects all areas
            color: '#886644'
        },
        
        // Rival Move In: Competition increases, prices drop 30%
        RIVAL_MOVE_IN: {
            name: 'Rival Move In',
            description: 'Rival dealer moved in! Competition fierce, prices down 30%!',
            priceMultiplier: 0.7,        // 30% less money
            heatGainMultiplier: 1.0,     // Heat unchanged
            rawCostMultiplier: 1.0,      // Raw materials unchanged
            buyerMultiplier: 0.8,        // 20% fewer buyers (competition)
            duration: 4,                 // Lasts 4 days
            affectedArea: 'current',     // Current neighborhood
            color: '#ff00ff'
        },
        
        // Tourist Season: Prices 1.5x, more buyers
        TOURIST_SEASON: {
            name: 'Tourist Season',
            description: 'Tourist season! Premium prices, 50% more buyers!',
            priceMultiplier: 1.5,        // 50% better prices
            heatGainMultiplier: 0.7,     // Less heat (tourists = easy targets)
            rawCostMultiplier: 1.2,      // Raw materials 20% more
            buyerMultiplier: 1.5,        // 50% more buyers
            duration: 4,                 // Lasts 4 days
            affectedArea: 'all',         // Affects all areas
            color: '#00ccff'
        },
        
        // Local Holiday: All prices 1.3x
        LOCAL_HOLIDAY: {
            name: 'Local Holiday',
            description: 'Local holiday! Everyone spending, prices up 30%!',
            priceMultiplier: 1.3,        // 30% better prices
            heatGainMultiplier: 0.6,     // Less heat (police celebrating too)
            rawCostMultiplier: 1.0,      // Raw materials unchanged
            buyerMultiplier: 1.3,        // 30% more buyers
            duration: 2,                 // Lasts 2 days
            affectedArea: 'all',         // Affects all areas
            color: '#ffd700'
        },
        
        // Competitor Eliminated: Prices 1.4x
        COMPETITOR_ELIMINATED: {
            name: 'Competitor Eliminated',
            description: 'Rival eliminated! You have the market, prices up 40%!',
            priceMultiplier: 1.4,        // 40% better prices
            heatGainMultiplier: 1.3,     // Slightly more heat (attention)
            rawCostMultiplier: 1.0,      // Raw materials unchanged
            buyerMultiplier: 1.4,        // 40% more buyers (no competition)
            duration: 5,                 // Lasts 5 days
            affectedArea: 'current',     // Current neighborhood
            color: '#00ff00'
        },
        
        // New District Open: New area to sell
        NEW_DISTRICT_OPEN: {
            name: 'New District Open',
            description: 'New district opened for business! Expand your territory!',
            priceMultiplier: 1.0,        // Base prices
            heatGainMultiplier: 0.5,     // Less heat (new area = less scrutiny)
            rawCostMultiplier: 0.9,      // Raw materials 10% cheaper
            buyerMultiplier: 1.6,        // 60% more buyers (new market)
            unlocksNewArea: true,        // Enables selling in new area
            duration: 6,                 // Lasts 6 days
            affectedArea: 'new',         // New neighborhood
            color: '#00ffff'
        },
        
        // Favorable Politics: Police less active
        FAVORABLE_POLITICS: {
            name: 'Favorable Politics',
            description: 'Police focusing elsewhere! Heat builds slower, sell freely!',
            priceMultiplier: 1.2,        // 20% better prices
            heatGainMultiplier: 0.4,     // 60% less heat gain
            rawCostMultiplier: 1.0,      // Raw materials unchanged
            buyerMultiplier: 1.2,        // 20% more buyers (safe to buy)
            policeSpawnMultiplier: 0.3,  // 70% fewer police
            duration: 5,                 // Lasts 5 days
            affectedArea: 'all',         // Affects all areas
            color: '#88ff88'
        },
        
        // Shortage: One random drug is in high demand (2x price)
        SHORTAGE: {
            name: 'Shortage',
            description: 'Supply shortage! One drug 2x price!',
            priceMultiplier: 1.0,        // Base price unchanged (specific drug gets bonus)
            heatGainMultiplier: 1.0,     // Heat unchanged
            rawCostMultiplier: 1.5,      // Raw materials 1.5x cost (scarcity)
            targetDrugMultiplier: 2.0,   // One specific drug sells for 2x
            duration: 3,                 // Lasts 3 days
            affectedArea: 'all',
            color: '#ffaa00'
        },
        
        // Economic Drought: All prices 1.5x (milder than calendar drought)
        ECONOMIC_DROUGHT: {
            name: 'Economic Drought',
            description: 'Market downturn! All prices 1.5x!',
            priceMultiplier: 1.5,        // 50% better prices
            heatGainMultiplier: 1.0,     // Heat unchanged
            rawCostMultiplier: 1.5,      // Raw materials 1.5x
            duration: 2,                 // Lasts 2 days
            affectedArea: 'all',
            color: '#cc8800'
        },
        
        // Boom: All prices 0.7x (good time to buy, sell for less)
        BOOM: {
            name: 'Market Boom',
            description: 'Market booming! Prices drop 30%!',
            priceMultiplier: 0.7,        // 30% less money (oversupply)
            heatGainMultiplier: 0.5,     // Less heat (less risky)
            rawCostMultiplier: 0.7,      // Raw materials 30% cheaper
            duration: 3,                 // Lasts 3 days
            affectedArea: 'all',
            color: '#00cc44'
        }
    },
    
    // Economy event settings
    ECONOMY_EVENT_MIN_DAYS: 3,           // Minimum days between random events
    ECONOMY_EVENT_MAX_DAYS: 7,           // Maximum days between random events
    
    // Equipment
    EQUIPMENT: {
        // ============================================================
        // EQUIPMENT SLOT SYSTEM
        // Slots: hat, shirt, jacket, pants, shoes, accessory1, accessory2, weapon1, weapon2
        // ============================================================
        
        // === STORAGE ===
        backpack: {
            name: 'Backpack',
            description: 'Carry more Raw Materials',
            cost: 200,
            type: 'storage',
            slot: 'storage',
            rawCapacityBonus: 5,
            productCapacityBonus: 3
        },
        
        // === HEAD (Hat) ===
        baseCap: {
            name: 'Base Cap',
            description: 'Basic head protection. Blends in.',
            cost: 50,
            type: 'hat',
            slot: 'hat',
            detectionReduction: 0.05
        },
        fedora: {
            name: 'Fedora',
            description: 'Classy and subtle. -10% detection.',
            cost: 300,
            type: 'hat',
            slot: 'hat',
            detectionReduction: 0.10,
            priceBonus: 0.05
        },
        
        // === TORSO (Shirt) ===
        bulletproofVest: {
            name: 'Bulletproof Vest',
            description: 'Reduces damage from police encounters',
            cost: 500,
            type: 'armor',
            slot: 'shirt',
            damageReduction: 0.3
        },
        leatherJacket: {
            name: 'Leather Jacket',
            description: 'Tough outer layer. -15% damage.',
            cost: 350,
            type: 'armor',
            slot: 'shirt',
            damageReduction: 0.15,
            heatReduction: 0.10
        },
        
        // === OUTER TORSO (Jacket) ===
        heavyCoat: {
            name: 'Heavy Coat',
            description: 'Reduces heat gain from exposure',
            cost: 250,
            type: 'armor',
            slot: 'jacket',
            heatReduction: 0.25
        },
        trenchCoat: {
            name: 'Trench Coat',
            description: 'Professional look. +10% prices, -10% detection.',
            cost: 450,
            type: 'armor',
            slot: 'jacket',
            priceBonus: 0.10,
            detectionReduction: 0.10
        },
        
        // === LEGS (Pants) ===
        cargoPants: {
            name: 'Cargo Pants',
            description: 'Extra storage for supplies.',
            cost: 150,
            type: 'pants',
            slot: 'pants',
            rawCapacityBonus: 2,
            productCapacityBonus: 1
        },
        
        // === FEET (Shoes) ===
        runningShoes: {
            name: 'Running Shoes',
            description: 'Move faster across the city',
            cost: 300,
            type: 'utility',
            slot: 'shoes',
            speedBonus: 1.5
        },
        combatBoots: {
            name: 'Combat Boots',
            description: 'Heavy duty. +25% movement speed.',
            cost: 500,
            type: 'utility',
            slot: 'shoes',
            speedBonus: 1.25
        },
        
        // === ACCESSORY 1 ===
        binoculars: {
            name: 'Binoculars',
            description: 'See further on the minimap',
            cost: 200,
            type: 'utility',
            slot: 'accessory1',
            visionRangeBonus: 3
        },
        burnerPhone: {
            name: 'Burner Phone',
            description: 'Faster buyer spawns',
            cost: 100,
            type: 'utility',
            slot: 'accessory1',
            buyerSpawnBonus: 0.5
        },
        goldChain: {
            name: 'Gold Chain',
            description: '+10% to buyer prices',
            cost: 400,
            type: 'accessory',
            slot: 'accessory1',
            priceBonus: 0.10
        },
        
        // === ACCESSORY 2 ===
        lockpick: {
            name: 'Lockpick Set',
            description: 'Faster safehouse entry',
            cost: 150,
            type: 'utility',
            slot: 'accessory2',
            safehouseEntrySpeed: 2
        },
        designerSunglasses: {
            name: 'Designer Sunglasses',
            description: 'Reduces police detection chance',
            cost: 350,
            type: 'accessory',
            slot: 'accessory2',
            detectionReduction: 0.2
        },
        
        // === WEAPON SLOT 1 (Primary) ===
        brassKnucks: {
            name: 'Brass Knuckles',
            description: 'Fight better in street confrontations',
            cost: 150,
            type: 'weapon',
            slot: 'weapon1',
            attackBonus: 2
        },
        switchblade: {
            name: 'Switchblade',
            description: 'Deadly in close-quarters combat',
            cost: 350,
            type: 'weapon',
            slot: 'weapon1',
            attackBonus: 4
        },
        pistol: {
            name: 'Pistol',
            description: 'Reliable semi-auto pistol. Requires ammo.',
            cost: 800,
            type: 'weapon',
            slot: 'weapon1',
            attackBonus: 8,
            rangeAttack: true,
            ammoCost: 25,
            fireRate: 'semi-auto'
        },
        
        // === AUTOMATIC WEAPONS (Requires automatic_weapons Skill) ===
        machinePistol: {
            name: 'Machine Pistol',
            description: 'Compact automatic weapon. High fire rate.',
            cost: 1500,
            type: 'weapon',
            slot: 'weapon1',
            weaponClass: 'automatic',
            attackBonus: 12,
            rangeAttack: true,
            ammoCost: 35,
            fireRate: 'automatic',
            automaticOnly: true
        },
        smg: {
            name: 'SMG',
            description: 'Submachine gun. Excellent for close quarters.',
            cost: 2500,
            type: 'weapon',
            slot: 'weapon1',
            weaponClass: 'automatic',
            attackBonus: 15,
            rangeAttack: true,
            ammoCost: 40,
            fireRate: 'automatic',
            automaticOnly: true
        },
        assaultRifle: {
            name: 'Assault Rifle',
            description: 'Full-auto assault rifle. Balanced damage and rate.',
            cost: 4000,
            type: 'weapon',
            slot: 'weapon1',
            weaponClass: 'automatic',
            attackBonus: 20,
            rangeAttack: true,
            ammoCost: 50,
            fireRate: 'automatic',
            automaticOnly: true
        },
        machineGun: {
            name: 'Machine Gun',
            description: 'Heavy machine gun. Devastating but slow.',
            cost: 6000,
            type: 'weapon',
            slot: 'weapon1',
            weaponClass: 'automatic',
            attackBonus: 30,
            rangeAttack: true,
            ammoCost: 75,
            fireRate: 'automatic',
            automaticOnly: true
        },
        
        // === WEAPON SLOT 2 (Secondary - Locked by default) ===
        secondaryPistol: {
            name: 'Secondary Pistol',
            description: 'Backup pistol for dual wield. Requires Dual Wield skill.',
            cost: 600,
            type: 'weapon',
            slot: 'weapon2',
            weaponClass: 'pistol',
            attackBonus: 5,
            rangeAttack: true,
            ammoCost: 20,
            fireRate: 'semi-auto',
            requiresSkill: 'dual_wield'
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
    // Using fictional factions from FACTIONS.md for narrative consistency
    GANG_AFFILIATIONS: {
        theDon: {
            id: 'theDon',
            name: 'The Don',
            fullName: 'Don Moretti',
            description: 'Classic organized crime, formal wear',
            origin: 'Harbor District',
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
            meetingArea: 'old-town',
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
            portrait: 'don-boss',
            spriteType: 'faction-boss'
        },
        viper: {
            id: 'viper',
            name: 'Viper',
            fullName: 'Dr. Elena Marsh',
            description: 'Clinical, precise, scientific approach',
            origin: 'Synthetic Drugs',
            color: '#2f4f2f',
            accentColor: '#7fff00',
            // Behavior
            productQuality: 1.15,
            priceMultiplier: 1.3,
            reliability: 0.9,
            dangerLevel: 'medium',
            minLoyalty: 2,
            meetingLocation: 'warehouse',
            meetingArea: 'skid-row',
            greetings: [
                "Welcome. My product is pure — unlike my competitors.",
                "Science requires precision. You understand?",
                "I have new formulations. Care to test?",
                "Quality costs. But you'll get what you pay for."
            ],
            dialog: {
                buy: "The finest synthetic product. Laboratory pure.",
                loyalty: "You show promise. I'll share my research.",
                warning: "Don't waste my time with amateurs.",
                threat: "You've disappointed me. Severely."
            },
            portrait: 'viper-leader',
            spriteType: 'viper'
        },
        rook: {
            id: 'rook',
            name: 'Rook',
            fullName: 'Marcus Thornwood',
            description: 'Elegant, sophisticated, calculated',
            origin: 'Gambling',
            color: '#4a3728',
            accentColor: '#ffd700',
            productQuality: 1.0,
            priceMultiplier: 1.1,
            reliability: 0.9,
            dangerLevel: 'low',
            minLoyalty: 2,
            meetingLocation: 'restaurant',
            meetingArea: 'old-town',
            greetings: [
                "A pleasure to meet you. Let's discuss business.",
                "The house always wins. But I can share the profits.",
                "Welcome to my establishment. Behave yourself.",
                "You have potential. Let's see if you're smart."
            ],
            dialog: {
                buy: "Fair terms for a fair game.",
                loyalty: "You're a professional. I appreciate that.",
                warning: "Don't cheat. The house notices everything.",
                threat: "You've made a terrible mistake."
            },
            portrait: 'rook-leader',
            spriteType: 'rook'
        },
        ghost: {
            id: 'ghost',
            name: 'Ghost',
            fullName: 'Unknown',
            description: 'Shadowy, anonymous, information brokers',
            origin: 'Intel & Assassination',
            color: '#1a1a1a',
            accentColor: '#888888',
            productQuality: 1.0,
            priceMultiplier: 1.2,
            reliability: 0.7,
            dangerLevel: 'extreme',
            minLoyalty: 3,
            meetingLocation: 'tunnel',
            meetingArea: 'underground',
            greetings: [
                "You never saw me. Let's keep it that way.",
                "Information is valuable. Are you worth it?",
                "I've been watching. You interest me.",
                "Speak quickly. Time is money."
            ],
            dialog: {
                buy: "What do you need to know?",
                loyalty: "You're useful. I'll remember that.",
                warning: "You're being watched. Be careful.",
                threat: "You've seen too much. Goodbye."
            },
            portrait: 'ghost-leader',
            spriteType: 'ghost'
        },
        iron: {
            id: 'iron',
            name: 'Iron',
            fullName: 'Big Tony Ferro',
            description: 'Mechanic, craftsman, old-school operator',
            origin: 'Chop Shops',
            color: '#2f2f2f',
            accentColor: '#cd7f32',
            productQuality: 1.0,
            priceMultiplier: 0.9,
            reliability: 0.85,
            dangerLevel: 'high',
            minLoyalty: 2,
            meetingLocation: 'warehouse',
            meetingArea: 'ironworks',
            greetings: [
                "What do you need? I got connections.",
                "You need something moved? I can help.",
                "Tony's the man. Remember that.",
                "Good product deserves good wheels."
            ],
            dialog: {
                buy: "Fair price, reliable work. That's me.",
                loyalty: "You deliver. I deliver. Simple.",
                warning: "Don't cross me. I know everyone.",
                threat: "You made a big mistake, pal."
            },
            portrait: 'iron-leader',
            spriteType: 'iron'
        },
        fang: {
            id: 'fang',
            name: 'Fang',
            fullName: 'Carla "Fang" Okonkwo',
            description: 'Scrappy, resourceful, survivor',
            origin: 'Scavenging',
            color: '#8b4513',
            accentColor: '#daa520',
            productQuality: 0.85,
            priceMultiplier: 0.7,
            reliability: 0.75,
            dangerLevel: 'high',
            minLoyalty: 1,
            meetingLocation: 'alley',
            meetingArea: 'the-flats',
            greetings: [
                "You need something? I find things.",
                "Don't waste my time with small talk.",
                "What's it worth to you?",
                "I know where everything is. For a price."
            ],
            dialog: {
                buy: "Cheap prices, decent product. Deal?",
                loyalty: "You're useful. I'll hook you up.",
                warning: "Don't mess with my territory.",
                threat: "You crossed me. Big mistake."
            },
            portrait: 'fang-leader',
            spriteType: 'fang'
        },
        storm: {
            id: 'storm',
            name: 'Storm',
            fullName: 'Captain Sara Chen',
            description: 'Nomadic, free, water-born smuggling',
            origin: 'Smuggling Routes',
            color: '#4682b4',
            accentColor: '#00ced1',
            productQuality: 1.1,
            priceMultiplier: 1.0,
            reliability: 0.8,
            dangerLevel: 'medium',
            minLoyalty: 2,
            meetingLocation: 'dock',
            meetingArea: 'the-harbor',
            greetings: [
                "The sea provides. And so do I.",
                "Need something moved? I know the routes.",
                "We go where the tide takes us.",
                "You're smart enough to find me. That's promising."
            ],
            dialog: {
                buy: "Fair prices, reliable delivery.",
                loyalty: "You're good people. I remember those.",
                warning: "Don't bring heat to my waters.",
                threat: "You won't find safe harbor again."
            },
            portrait: 'storm-leader',
            spriteType: 'storm'
        },
        shade: {
            id: 'shade',
            name: 'Shade',
            fullName: 'Yusuf Hassan',
            description: 'Underground, tunnels, black market',
            origin: 'Black Market',
            color: '#2f2f4f',
            accentColor: '#9370db',
            productQuality: 1.0,
            priceMultiplier: 1.1,
            reliability: 0.85,
            dangerLevel: 'medium',
            minLoyalty: 2,
            meetingLocation: 'tunnel',
            meetingArea: 'the-maw',
            greetings: [
                "Welcome to my domain. Nothing is forbidden here.",
                "I have... connections. What do you need?",
                "The tunnels know all. I know more.",
                "You found me. That shows promise."
            ],
            dialog: {
                buy: "Name your price. I can find anything.",
                loyalty: "You show sense. The shadows reward loyalty.",
                warning: "Don't bring trouble to my tunnels.",
                threat: "The darkness hides many secrets. And bodies."
            },
            portrait: 'shade-leader',
            spriteType: 'shade'
        },
        blaze: {
            id: 'blaze',
            name: 'Blaze',
            fullName: 'Derek "Blaze" Williams',
            description: 'Violent, aggressive, high-volume production',
            origin: 'Meth & Coke',
            color: '#8b0000',
            accentColor: '#ff4500',
            productQuality: 1.0,
            priceMultiplier: 0.85,
            reliability: 0.75,
            dangerLevel: 'high',
            minLoyalty: 2,
            meetingLocation: 'safehouse',
            meetingArea: 'skid-row',
            greetings: [
                "You need product? I got plenty.",
                "Don't waste my time with small talk.",
                "You buy big, you get a deal. Simple.",
                "I don't repeat myself. Listen carefully."
            ],
            dialog: {
                buy: "Good product, fair price. Don't complain.",
                loyalty: "You're solid. I look after my people.",
                warning: "Don't sell on my blocks.",
                threat: "You crossed me. That's a death wish."
            },
            portrait: 'blaze-leader',
            spriteType: 'blaze'
        },
        frost: {
            id: 'frost',
            name: 'Frost',
            fullName: 'Viktor "Ice" Petrov',
            description: 'Cold, professional, organized smuggling',
            origin: 'Smuggling',
            color: '#4682b4',
            accentColor: '#e0ffff',
            productQuality: 1.15,
            priceMultiplier: 1.2,
            reliability: 0.9,
            dangerLevel: 'medium',
            minLoyalty: 3,
            meetingLocation: 'warehouse',
            meetingArea: 'the-harbor',
            greetings: [
                "Welcome. I run a tight operation.",
                "Everything has a price. Name your terms.",
                "I don't do sloppy. Neither should you.",
                "You're here. That means you're serious."
            ],
            dialog: {
                buy: "Premium product, premium service.",
                loyalty: "You deliver. I remember those who do.",
                warning: "Don't waste my time with amateur hour.",
                threat: "You've made a cold mistake."
            },
            portrait: 'frost-leader',
            spriteType: 'frost'
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
    },

    // Drug Lab Types - discoverable production facilities
    // Each lab type has a preferred neighborhood, risk level, and yield bonus
    LAB_TYPES: {
        'Weed Grow House': {
            description: 'Indoor cannabis operation with grow lights and hydroponics',
            produces: 'Weed',
            preferredNeighborhoods: ['The Flats', 'Industrial Zone', 'Salvage Yard'],
            riskLevel: 1,           // 1-5 scale, 1 is lowest risk
            yieldBonus: 0.25,       // +25% yield bonus
            heatGain: 2,            // Low heat generation
            requiredMaterials: ['Weed Plants'],
            processingSpeed: 1.0,   // Normal speed
            sprite: 'lab-weed',
            tile: 'tile-wood-floor',
            color: '#4CAF50',        // Green
            floors: 1,
            isBigCity: false
        },
        'Mushroom Room': {
            description: 'Climate-controlled room for psychedelic mushroom cultivation',
            produces: 'Mushrooms',
            preferredNeighborhoods: ['The Maw', 'Skid Row', 'The Flats'],
            riskLevel: 2,
            yieldBonus: 0.20,       // +20% yield bonus
            heatGain: 4,
            requiredMaterials: ['Mushroom Spores'],
            processingSpeed: 1.2,   // Slightly faster
            sprite: 'lab-mushroom',
            tile: 'tile-stone-dark',
            color: '#9C27B0',        // Purple
            floors: 1,
            isBigCity: false
        },
        'Cocaine Lab': {
            description: 'Hidden lab for processing coca leaves into cocaine powder',
            produces: 'Cocaine',
            preferredNeighborhoods: ['Old Town', 'The Harbor', 'Industrial Zone'],
            riskLevel: 4,
            yieldBonus: 0.35,       // +35% yield bonus
            heatGain: 10,
            requiredMaterials: ['Coca Leaves'],
            processingSpeed: 0.9,   // Slightly slower (careful work)
            sprite: 'lab-cocaine',
            tile: 'tile-concrete',
            color: '#FFFFFF',        // White
            floors: 1,
            isBigCity: false
        },
        'Crack House': {
            description: 'Improvised cooking operation for turning cocaine into crack',
            produces: 'Crack',
            preferredNeighborhoods: ['Skid Row', 'The Flats'],
            riskLevel: 5,           // Highest risk - very dangerous
            yieldBonus: 0.40,       // +40% yield bonus
            heatGain: 15,
            requiredMaterials: ['Cocaine'],  // Made from cocaine
            processingSpeed: 1.3,   // Fast but dangerous
            sprite: 'lab-crack',
            tile: 'tile-concrete-cracked',
            color: '#FF9800',        // Orange/brown
            floors: 1,
            isBigCity: false
        },
        'Meth Lab': {
            description: 'Secretive meth synthesis operation with chemical equipment',
            produces: 'Meth',
            preferredNeighborhoods: ['Industrial Zone', 'Skid Row', 'The Maw'],
            riskLevel: 5,
            yieldBonus: 0.50,       // +50% yield bonus - highest
            heatGain: 14,
            requiredMaterials: ['Precursor A', 'Precursor B'],
            processingSpeed: 0.8,   // Slower (complex chemistry)
            sprite: 'lab-meth',
            tile: 'tile-metal-floor',
            color: '#F44336',        // Red
            floors: 1,
            isBigCity: false
        },
        'MDMA Lab': {
            description: 'Synthesis lab for creating MDMA in tablet or crystal form',
            produces: 'MDMA',
            preferredNeighborhoods: ['Old Town', 'The Harbor', 'Industrial Zone'],
            riskLevel: 3,
            yieldBonus: 0.30,       // +30% yield bonus
            heatGain: 7,
            requiredMaterials: ['Methylamine'],
            processingSpeed: 1.1,   // Slightly faster
            sprite: 'lab-mdma',
            tile: 'tile-concrete',
            color: '#E91E63',        // Pink
            floors: 1,
            isBigCity: false
        },
        
        // ============================================================
        // BIG CITY FACILITIES - Multi-floor labs and grow operations
        // ============================================================
        
        'Meth Lab (Big City)': {
            description: 'Multi-floor meth synthesis operation in an abandoned office building. Industrial-scale production.',
            produces: 'Meth',
            preferredNeighborhoods: ['Downtown', 'Warehouse District'],
            riskLevel: 5,
            yieldBonus: 0.65,       // +65% yield bonus - highest in game
            heatGain: 18,
            requiredMaterials: ['Precursor A', 'Precursor B'],
            processingSpeed: 0.7,   // Fast with multiple floors
            sprite: 'lab-meth-multi',
            tile: 'tile-concrete',
            color: '#B71C1C',        // Dark red
            floors: 4,               // Multi-floor building
            isBigCity: true,
            combatEncounter: {
                enemies: [
                    { type: 'lab-guard', count: 3 },
                    { type: 'chemist', count: 2 },
                    { type: 'runner', count: 1 }
                ],
                experienceReward: 150
            }
        },
        'Chemical Processing': {
            description: 'Chemical processing facility for control substances and precursors. Multi-floor operation.',
            produces: 'Precursor A',
            preferredNeighborhoods: ['Downtown', 'Warehouse District'],
            riskLevel: 4,
            yieldBonus: 0.45,       // +45% yield bonus
            heatGain: 12,
            requiredMaterials: ['Chemicals'],
            processingSpeed: 0.85,
            sprite: 'lab-chemical',
            tile: 'tile-metal-floor',
            color: '#FF6F00',        // Amber
            floors: 3,
            isBigCity: true,
            combatEncounter: {
                enemies: [
                    { type: 'lab-guard', count: 2 },
                    { type: 'chemist', count: 2 }
                ],
                experienceReward: 120
            }
        },
        'Research Lab': {
            description: 'Underground research facility developing advanced synthetic drugs. High-tech equipment.',
            produces: 'MDMA',
            preferredNeighborhoods: ['Downtown', 'Warehouse District'],
            riskLevel: 4,
            yieldBonus: 0.55,       // +55% yield bonus
            heatGain: 11,
            requiredMaterials: ['Research Chemicals'],
            processingSpeed: 0.9,
            sprite: 'lab-research',
            tile: 'tile-tile-floor',
            color: '#00BCD4',        // Cyan
            floors: 3,
            isBigCity: true,
            combatEncounter: {
                enemies: [
                    { type: 'lab-guard', count: 2 },
                    { type: 'researcher', count: 2 },
                    { type: 'runner', count: 2 }
                ],
                experienceReward: 175
            }
        },
        'Indoor Grow House': {
            description: 'Large-scale indoor marijuana operation. Multiple floors of grow lights and plants.',
            produces: 'Weed',
            preferredNeighborhoods: ['Downtown', 'Warehouse District'],
            riskLevel: 2,
            yieldBonus: 0.40,       // +40% yield bonus
            heatGain: 5,
            requiredMaterials: ['Weed Plants'],
            processingSpeed: 1.1,
            sprite: 'lab-grow-house',
            tile: 'tile-wood-floor',
            color: '#66BB6A',        // Light green
            floors: 3,
            isBigCity: true,
            combatEncounter: {
                enemies: [
                    { type: 'grower', count: 2 },
                    { type: 'runner', count: 1 }
                ],
                experienceReward: 80
            }
        },
        'Hydroponics Facility': {
            description: 'High-tech hydroponics facility in a converted warehouse. Climate-controlled perfection.',
            produces: 'Weed',
            preferredNeighborhoods: ['Downtown', 'Warehouse District'],
            riskLevel: 2,
            yieldBonus: 0.50,       // +50% yield bonus
            heatGain: 4,
            requiredMaterials: ['Weed Plants'],
            processingSpeed: 1.3,   // Fast with technology
            sprite: 'lab-hydroponics',
            tile: 'tile-tile-floor',
            color: '#26A69A',        // Teal
            floors: 4,
            isBigCity: true,
            combatEncounter: {
                enemies: [
                    { type: 'lab-guard', count: 1 },
                    { type: 'grower', count: 3 }
                ],
                experienceReward: 100
            }
        }
    },

    // Lab discovery bonuses - once discovered, player gets permanent bonus
    LAB_DISCOVERY_BONUSES: {
        // Percentages added to base yield when lab is discovered
        baseYieldIncrease: 0.10,   // 10% base yield for any lab
        // Stacking bonuses per lab type discovered
        stackingBonusPerLab: 0.05  // +5% additional per unique lab type
    },
    
    // ==========================================
    // WEAPON SKILL SYSTEM
    // ==========================================
    WEAPON_SKILLS: {
        // Skill requirements for weapon slots
        SECOND_WEAPON_SLOT_SKILL: 'dual_wield',
        AUTOMATIC_WEAPONS_SKILL: 'automatic_weapons',
        
        // Weapon slot constraints
        SLOT_RESTRICTIONS: {
            1: { maxFireRate: 'any', allowedClasses: ['melee', 'pistol', 'automatic'] },
            2: { maxFireRate: 'semi-auto', allowedClasses: ['melee', 'pistol'] }
        },
        
        // Which weapons require which skill
        SKILL_REQUIREMENTS: {
            machinePistol: 'automatic_weapons',
            smg: 'automatic_weapons',
            assaultRifle: 'automatic_weapons',
            machineGun: 'automatic_weapons'
        }
    },
    
    // Helper: Check if player can use second weapon slot
    canUseSecondSlot(unlockedSkills = []) {
        return unlockedSkills.includes(this.WEAPON_SKILLS.SECOND_WEAPON_SLOT_SKILL);
    },
    
    // Helper: Check if player can equip automatic weapons
    canUseAutomaticWeapons(unlockedSkills = []) {
        return unlockedSkills.includes(this.WEAPON_SKILLS.AUTOMATIC_WEAPONS_SKILL);
    },
    
    // Helper: Check if player can equip a specific weapon
    canEquipWeapon(weaponId, unlockedSkills = [], currentSlot1Weapon = null) {
        const weapon = this.EQUIPMENT[weaponId];
        if (!weapon) return { canEquip: false, reason: 'Weapon not found' };
        
        // Check skill requirements for automatic weapons
        if (weapon.automaticOnly && !this.canUseAutomaticWeapons(unlockedSkills)) {
            return { canEquip: false, reason: 'Requires Automatic Weapons skill' };
        }
        
        // Check slot 2 restrictions
        if (weapon.slot === 2) {
            if (!this.canUseSecondSlot(unlockedSkills)) {
                return { canEquip: false, reason: 'Requires Dual Wield skill' };
            }
            // Slot 2 only allows semi-auto pistols
            if (weapon.fireRate && weapon.fireRate !== 'semi-auto') {
                return { canEquip: false, reason: 'Slot 2 only supports semi-auto pistols' };
            }
        }
        
        return { canEquip: true, reason: '' };
    },
    
    // Helper: Get all available weapons based on player skills
    getAvailableWeapons(unlockedSkills = []) {
        const available = [];
        const canDualWield = this.canUseSecondSlot(unlockedSkills);
        const canAuto = this.canUseAutomaticWeapons(unlockedSkills);
        
        for (const [id, weapon] of Object.entries(this.EQUIPMENT)) {
            if (weapon.type !== 'weapon') continue;
            
            // Filter based on skill availability
            if (weapon.automaticOnly && !canAuto) continue;
            if (weapon.slot === 2 && !canDualWield) continue;
            
            available.push({ id, ...weapon });
        }
        
        return available;
    }
};
