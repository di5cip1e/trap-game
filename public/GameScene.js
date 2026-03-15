import Phaser from 'phaser';
import { CONFIG } from './config.js';
import HUD from './HUD.js';
import TimeSystem from './TimeSystem.js';
import CalendarSystem from './CalendarSystem.js';
import Minimap from './Minimap.js';
import MapGenerator, { CONTESTED_ZONES, NEIGHBORHOODS, FACTION_HQ, isPositionContested, getFactionsInNeighborhood } from './MapGenerator.js';
import SafehouseUI from './SafehouseUI.js';
import VendorUI from './VendorUI.js';
import WorkstationUI from './WorkstationUI.js';
import RivalEncounterUI from './RivalEncounterUI.js';
import EquipmentUI from './EquipmentUI.js';
import PoliceEncounterUI from './PoliceEncounterUI.js';
import RelationshipUI from './RelationshipUI.js';
import SupplierUI from './SupplierUI.js';
import SupplierMeetingSystem from './SupplierMeetingSystem.js';
import TutorialUI from './TutorialUI.js';
import SaveLoadSystem from './SaveLoadSystem.js';
import QuestSystem from './QuestSystem.js';
import QuestUI from './QuestUI.js';
// NEW: Combat & Leveling Systems
import LevelSystem from './LevelSystem.js';
import SkillTree from './SkillTree.js';
import CombatScene, { ENEMY_TYPES } from './CombatScene.js';
// Mobile controls - already exists in rosie/controls/
import { MobileControlsManager, VirtualJoystick, ActionButton } from './rosie/controls/phaserMobileControls.js';
// NEW: Touch controls system
import TouchControls from './TouchControls.js';
// Achievements system
import Achievements, { trackSale, trackSupplierMeeting, trackHeatEscape, trackEquipmentPurchase } from './Achievements.js';
import { EventBus, EVENTS } from './EventBus.js';
// NEW: Manager classes for code organization
import PlayerManager from './PlayerManager.js';
import CombatManager from './CombatManager.js';
import UIManager from './UIManager.js';
// Player controller (for movement delegation)
import PlayerController from './PlayerController.js';
// Riverside Police System - Law enforcement and suspicion tracking
import { RiversidePoliceSystem, RIVERSIDE_COPS, getAllCops, getCopPosition } from './RiversidePolice.js';
import { BigCityPoliceSystem, BIG_CITY_COPS, getAllBigCityCops, getBigCityCopPosition } from './BigCityPolice.js';

// Biome mapping based on neighborhood origin
function getBiomeForNeighborhood(neighborhood) {
    const biomeMap = {
        'Riverside': 'block',        // Starting area - simple block map
        'Old Town': 'block',
        'Skid Row': 'traphouse',
        'The Flats': 'traphouse',
        'Ironworks': 'industrial',
        'The Harbor': 'waterfront',
        'The Maw': 'underground',
        'Industrial Zone': 'industrial',
        'Salvage Yard': 'junkyard',
        // Big City neighborhoods
        'Downtown': 'downtown',
        'Downtown East': 'downtown',
        'Warehouse District': 'industrial',
        'State Prison': 'prison'
    };
    return biomeMap[neighborhood] || 'block';
}

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }
    
    init() {
        // Get character data from registry
        this.characterData = this.registry.get('characterData');
        
        // Check for loaded save data
        const loadSaveData = this.registry.get('loadSaveData');
        
        // Determine biome based on neighborhood origin (not gender)
        const homeNeighborhood = this.characterData.neighborhood;
        this.biomeType = this.getBiomeForNeighborhood(homeNeighborhood);
        
        // Initialize player state
        this.playerState = {
            name: this.characterData.name,
            gender: this.characterData.gender,
            // Convert display name to key (e.g., "Old Town" -> "OLD_TOWN")
            neighborhood: GameScene.convertNeighborhoodToKeyStatic(this.characterData.neighborhood),
            stats: { ...this.characterData.stats }, // Copy stats
            neighborhoodBonus: this.characterData.neighborhoodBonus || null,
            
            // NEW: Neighborhood navigation system
            unlockedNeighborhoods: [GameScene.convertNeighborhoodToKeyStatic(this.characterData.neighborhood)], // Start with home neighborhood
            visitedNeighborhoods: [GameScene.convertNeighborhoodToKeyStatic(this.characterData.neighborhood)],
            money: 100, // Starting money for tutorial
            hustle: CONFIG.MAX_HUSTLE,
            rawMaterials: 0,
            product: 0,
            // Specific drug inventory (legacy)
            cocaine: 0,  // Raw cocaine for processing
            crack: 0,    // Processed crack
            
            // NEW: Drug inventory system - organized by type
            drugs: {
                cocaine: 0,
                crack: 0,
                heroin: 0,
                methamphetamine: 0,
                ecstasy: 0,
                marijuana: 0
            },
            
            // Precursor inventory for manufacturing
            precursors: {
                pseudoephedrine: 0,
                ammonia: 0,
                lithium: 0,
                toluene: 0,
                aceticAnhydride: 0,
                ether: 0
            },
            
            heat: 0,
            gridX: Math.floor(CONFIG.GRID_WIDTH / 2),
            gridY: Math.floor(CONFIG.GRID_HEIGHT / 2),
            isMoving: false,
            safehouseTier: 0, // Index in CONFIG.SAFEHOUSE_TIERS
            equipment: {
                // Storage
                backpack: false,
                // Weapons
                brassKnucks: false,
                switchblade: false,
                pistol: false,
                // Armor
                bulletproofVest: false,
                heavyCoat: false,
                // Utility
                runningShoes: false,
                binoculars: false,
                lockpick: false,
                burnerPhone: false,
                // Accessories
                goldChain: false,
                designerSunglasses: false
            },
            // Inventory capacities
            rawCapacity: CONFIG.DEFAULT_RAW_CAPACITY,
            productCapacity: CONFIG.DEFAULT_PRODUCT_CAPACITY,
            // NPC relationships
            npcRelationships: {
                shopOwner: 0,
                corruptCop: 0
            },
            
            // Faction reputation (new system)
            // Format: { FACTION_NAME: repValue, ... } where repValue ranges from -100 to 100
            // -100 = hostile, 0 = neutral, 100 = allied
            factionReputation: {
                THE_DON: 0,      // The Don - Old Family
                VIPER: 0,        // Viper - The Serpents
                ROOK: 0,         // Rook - The Crown
                GHOST: 0,        // Ghost - The Ravens
                IRON: 0,         // Iron - The Iron Hands
                FANG: 0,         // Fang - The Jackals
                FROST: 0,        // Frost - The Ice
                BLAZE: 0,        // Blaze - The Inferno
                RAZOR: 0,        // Razor - The Cut
                STORM: 0,        // Storm - The Nomads
                SHADE: 0,        // Shade - The Shadows
                BYTE: 0          // Byte - The Network
            },
            // Daily flags
            corruptCopUsedToday: false,
            // Runner system
            hasRunner: false,
            runnerProduct: 0,  // Product assigned to runner
            // Status Effects
            activeStatuses: {},  // Object to store active status effects
            
            // Ability Points (for skills)
            abilityPoints: 2,
            
            // Unlocked skills
            unlockedSkills: [],
            
            // NEW: Level & XP System
            level: 1,
            xp: 0,
            xpToNextLevel: 500,
            statPoints: 1,
            classType: null, // Will be determined by highest stat
            
            // Skill cooldowns
            skillCooldowns: {},
            
            // Player HP (for status effect damage)
            playerHP: 100,
            playerMaxHP: 100,
            
            // Pistol ammo (defined in CONFIG but not tracked - now adding tracking)
            pistolAmmo: 0,
            maxPistolAmmo: 30,
            
            // NEW GAME+ tracking
            newGamePlusCount: 0,
            ngpMoneyCarriedOver: 0,
            ngpUnlockedItems: [],
            
            // NEW: Neighborhood demand tracking - track sales per neighborhood per drug
            // Format: { OLD_TOWN: { Weed: 10, lastSale: timestamp, ... }, ... }
            neighborhoodHistory: {},
            
            // Rank tracking for notifications
            currentRank: 'Street Rat'
        };
        
        // Check for New Game+ flag from registry
        const isNewGamePlus = this.registry.get('isNewGamePlus') || false;
        const newGamePlusCount = this.registry.get('newGamePlusCount') || 0;
        
        // Apply NG+ settings if this is a new game+
        if (isNewGamePlus && newGamePlusCount > 0) {
                        this.playerState.newGamePlusCount = newGamePlusCount;
            
            // Apply NG+ difficulty scaling to game config
            this.applyNewGamePlusDifficulty(newGamePlusCount);
        }
        
        // If loading a saved game, apply the save data
        let supplierRelations = null;
        if (loadSaveData) {
            supplierRelations = loadSaveData.supplierRelations || null;
            SaveLoadSystem.applySaveData(this, loadSaveData);
            
            // Check if loading a NG+ game and apply difficulty scaling
            if (this.playerState.newGamePlusCount > 0) {
                this.applyNewGamePlusDifficulty(this.playerState.newGamePlusCount);
            }
            
            // Clear the registry to prevent reloading
            this.registry.set('loadSaveData', null);
        }
        
        // Initialize supplier system
        this.supplierSystem = new SupplierMeetingSystem(this);
        
        // Load supplier relations from save data if available
        if (supplierRelations) {
            this.supplierSystem.loadRelations(supplierRelations);
        }
    }
    
    /**
     * Static: Convert neighborhood display name to key (e.g., "Old Town" -> "OLD_TOWN")
     */
    static convertNeighborhoodToKeyStatic(neighborhood) {
        if (!neighborhood) return 'OLD_TOWN';
        
        // If it's already a key (all caps with underscores), return it
        if (neighborhood === neighborhood.toUpperCase() && neighborhood.includes('_')) {
            return neighborhood;
        }
        
        // Convert display name to key
        const keyMap = {
            'Riverside': 'RIVERSIDE',
            'Old Town': 'OLD_TOWN',
            'Skid Row': 'SKID_ROW',
            'The Flats': 'THE_FLATS',
            'Ironworks': 'IRONWORKS',
            'The Harbor': 'THE_HARBOR',
            'The Maw': 'THE_MAW',
            'Industrial Zone': 'INDUSTRIAL_ZONE',
            'Salvage Yard': 'SALVAGE_YARD'
        };
        
        return keyMap[neighborhood] || 'RIVERSIDE';
    }
    
    /**
     * Instance method: Convert neighborhood display name to key
     */
    convertNeighborhoodToKey(neighborhood) {
        return GameScene.convertNeighborhoodToKeyStatic(neighborhood);
    }
    
    /**
     * NEW GAME+: Apply difficulty scaling based on NG+ cycle
     * Each NG+ increases enemy stats and reduces some bonuses
     */
    applyNewGamePlusDifficulty(ngpCount) {
        if (ngpCount <= 0) return;
        
        // Difficulty multiplier (10% increase per NG+ cycle)
        const difficultyMult = 1 + (ngpCount * 0.1);
        
                
        // Scale enemy stats in CombatScene
        if (this.combatScene && ENEMY_TYPES) {
            // Store original values if not already stored
            if (!this._originalEnemyTypes) {
                this._originalEnemyTypes = JSON.parse(JSON.stringify(ENEMY_TYPES));
            }
            
            // Scale each enemy type
            Object.keys(ENEMY_TYPES).forEach(enemyKey => {
                const original = this._originalEnemyTypes[enemyKey];
                const current = ENEMY_TYPES[enemyKey];
                
                // Scale HP and damage
                current.hp = Math.floor(original.hp * difficultyMult);
                current.maxHp = current.hp;
                current.damage = Math.floor(original.damage * difficultyMult);
                
                // Slight XP increase
                current.xpValue = Math.floor(original.xpValue * (1 + ngpCount * 0.05));
            });
        }
        
        // Scale customer prices slightly lower (harder to make money)
        if (this.CONFIG) {
            this._originalProductSellPrice = this.CONFIG.PRODUCT_SELL_PRICE;
            this.CONFIG.PRODUCT_SELL_PRICE = Math.floor(this._originalProductSellPrice / difficultyMult);
        }
        
        // Increase heat gain from sales
        if (this.CONFIG && this.CONFIG.HEAT_GAIN_PER_SALE) {
            this._originalHeatGain = this.CONFIG.HEAT_GAIN_PER_SALE;
            this.CONFIG.HEAT_GAIN_PER_SALE = Math.floor(this._originalHeatGain * difficultyMult);
        }
        
        // Show NG+ indicator in HUD
        this.showNewGamePlusIndicator(ngpCount);
    }
    
    // ============================================================
    // DRUG & PRECURSOR INVENTORY MANAGEMENT
    // ============================================================
    
    /**
     * Add drugs to player's inventory
     * @param {string} type - Drug type (e.g., 'cocaine', 'crack', 'heroin', etc.)
     * @param {number} amount - Amount to add
     * @returns {boolean} - Success
     */
    addDrug(type, amount) {
        if (!type || amount <= 0) return false;
        
        if (!this.playerState.drugs) {
            this.playerState.drugs = {};
        }
        
        if (this.playerState.drugs[type] === undefined) {
            this.playerState.drugs[type] = 0;
        }
        
        this.playerState.drugs[type] += amount;
        
        // Also update legacy properties for backward compatibility
        if (type === 'cocaine') {
            this.playerState.cocaine = this.playerState.drugs.cocaine;
        } else if (type === 'crack') {
            this.playerState.crack = this.playerState.drugs.crack;
        }
        
        return true;
    }
    
    /**
     * Remove drugs from player's inventory
     * @param {string} type - Drug type
     * @param {number} amount - Amount to remove
     * @returns {boolean} - Success (false if insufficient amount)
     */
    removeDrug(type, amount) {
        if (!type || amount <= 0) return false;
        
        if (!this.playerState.drugs || this.playerState.drugs[type] === undefined) {
            return false;
        }
        
        if (this.playerState.drugs[type] < amount) {
            return false; // Not enough
        }
        
        this.playerState.drugs[type] -= amount;
        
        // Also update legacy properties for backward compatibility
        if (type === 'cocaine') {
            this.playerState.cocaine = this.playerState.drugs.cocaine;
        } else if (type === 'crack') {
            this.playerState.crack = this.playerState.drugs.crack;
        }
        
        return true;
    }
    
    /**
     * Get current amount of a specific drug
     * @param {string} type - Drug type
     * @returns {number} - Amount (0 if not found)
     */
    getDrugAmount(type) {
        if (!type) return 0;
        
        if (!this.playerState.drugs) {
            return 0;
        }
        
        return this.playerState.drugs[type] || 0;
    }
    
    /**
     * Add precursors to player's inventory
     * @param {string} type - Precursor type (e.g., 'pseudoephedrine', 'ammonia', etc.)
     * @param {number} amount - Amount to add
     * @returns {boolean} - Success
     */
    addPrecursor(type, amount) {
        if (!type || amount <= 0) return false;
        
        if (!this.playerState.precursors) {
            this.playerState.precursors = {};
        }
        
        if (this.playerState.precursors[type] === undefined) {
            this.playerState.precursors[type] = 0;
        }
        
        this.playerState.precursors[type] += amount;
        return true;
    }
    
    /**
     * Remove precursors from player's inventory
     * @param {string} type - Precursor type
     * @param {number} amount - Amount to remove
     * @returns {boolean} - Success (false if insufficient amount)
     */
    removePrecursor(type, amount) {
        if (!type || amount <= 0) return false;
        
        if (!this.playerState.precursors || this.playerState.precursors[type] === undefined) {
            return false;
        }
        
        if (this.playerState.precursors[type] < amount) {
            return false; // Not enough
        }
        
        this.playerState.precursors[type] -= amount;
        return true;
    }
    
    /**
     * Get current amount of a specific precursor
     * @param {string} type - Precursor type
     * @returns {number} - Amount (0 if not found)
     */
    getPrecursorAmount(type) {
        if (!type) return 0;
        
        if (!this.playerState.precursors) {
            return 0;
        }
        
        return this.playerState.precursors[type] || 0;
    }
    
    /**
     * Show NG+ indicator in the game world
     */
    showNewGamePlusIndicator(ngpCount) {
        const { width, height } = this.scale;
        
        // Create NG+ indicator
        const indicator = this.add.text(width - 20, 20, `NG+${ngpCount}`, {
            fontFamily: 'Press Start 2P',
            fontSize: '16px',
            color: '#ffcc00',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);
        
        // Add glow effect
        this.tweens.add({
            targets: indicator,
            alpha: 0.6,
            duration: 800,
            yoyo: true,
            repeat: -1
        });
        
        // Store reference for potential later use
        this.ngpIndicator = indicator;
    }
    
    preload() {
        // ==========================================
        // LOADING PROGRESS BAR
        // ==========================================
        const { width, height } = this.scale;

        // Create loading screen elements
        const loadingBg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000);
        loadingBg.setScrollFactor(0);
        loadingBg.setDepth(9999);

        const loadingText = this.add.text(width / 2, height / 2 - 50, 'LOADING...', {
            fontFamily: 'Press Start 2P',
            fontSize: '24px',
            color: '#ffcc00',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(10000);

        const progressBarBg = this.add.rectangle(width / 2, height / 2, 400, 30, 0x333333);
        progressBarBg.setScrollFactor(0);
        progressBarBg.setDepth(10000);

        const progressBar = this.add.rectangle(width / 2 - 198, height / 2, 4, 26, 0xffcc00);
        progressBar.setScrollFactor(0);
        progressBar.setDepth(10000);

        // Update progress bar as assets load
        this.load.on('progress', (value) => {
            const barWidth = Math.max(4, 396 * value);
            progressBar.width = barWidth;
            progressBar.x = (width / 2) - (200 - barWidth / 2);
        });

        this.load.once('complete', () => {
            // Fade out loading screen
            this.tweens.add({
                targets: [loadingBg, loadingText, progressBarBg, progressBar],
                alpha: 0,
                duration: 300,
                onComplete: () => {
                    loadingBg.destroy();
                    loadingText.destroy();
                    progressBarBg.destroy();
                    progressBar.destroy();
                }
            });
        });

        // ==========================================
        // LOAD ASSETS - ATLAS-BASED APPROACH
        // ==========================================
        // 
        // ATRAP has moved to texture atlas loading for improved performance.
        // Atlases combine related sprites into single images, reducing draw calls.
        // See: docs/ATLAS_CONSOLIDATION.md for full atlas configuration
        //
        // Current atlas structure:
        // - tiles.png: Ground/floor tiles
        // - ui-hud.png: HUD and interface elements  
        // - player-main.png: Player walk cycles and portraits
        // - npcs.png: Static NPCs (vendor, buyer, police, etc.)
        // - enemies.png: Combat enemy sprites
        // - ui-combat.png: Combat UI elements
        // - skills.png: Skill ability icons
        // - status-effects.png: Combat status icons
        //
        // NOTE: Legacy single-image loading preserved for compatibility.
        // When atlas files are generated, switch to atlas loading below.
        
        // --- ATLAS LOADING (disabled - using individual images instead) ---
        // These require atlas JSON files that don't exist yet
        /*
        this.load.atlas('tiles', 'assets/atlases/tiles.png', 'assets/atlases/tiles.json');
        this.load.atlas('ui-hud', 'assets/atlases/ui-hud.png', 'assets/atlases/ui-hud.json');
        this.load.atlas('player-main', 'assets/atlases/player-main.png', 'assets/atlases/player-main.json');
        this.load.atlas('npcs', 'assets/atlases/npcs.png', 'assets/atlases/npcs.json');
        this.load.atlas('enemies', 'assets/atlases/enemies.png', 'assets/atlases/enemies.json');
        this.load.atlas('ui-combat', 'assets/atlases/ui-combat.png', 'assets/atlases/ui-combat.json');
        this.load.atlas('skills', 'assets/atlases/skills.png', 'assets/atlases/skills.json');
        this.load.atlas('status-effects', 'assets/atlases/status-effects.png', 'assets/atlases/status-effects.json');
        */
        
        // --- INDIVIDUAL IMAGE LOADING (using local assets) ---
        // All these files exist in public/assets/
        this.load.image('player-top', 'assets/player-top-down.png');
        this.load.image('tile-street', 'assets/tile-street.png');
        this.load.image('tile-sidewalk', 'assets/tile-sidewalk.png');
        this.load.image('hud-bar', 'assets/hud-panel-bar.png');
        this.load.image('panel', 'assets/ui-panel.png');
        
        // Load biome-specific tiles
        this.load.image('tile-alley', 'assets/tile-alley.png');
        this.load.image('tile-concrete-cracked', 'assets/tile-concrete-cracked.png');
        this.load.image('tile-dirty-floor', 'assets/tile-dirty-floor.png');
        this.load.image('tile-wood-floor', 'assets/tile-wood-floor.png');
        this.load.image('tile-wall-brick', 'assets/tile-wall-brick.png');
        this.load.image('tile-wall-interior', 'assets/tile-wall-interior.png');
        
        // Load objects
        this.load.image('cardboard-box', 'assets/cardboard-box.png');
        this.load.image('storage-unit', 'assets/storage-unit.png');
        this.load.image('dumpster', 'assets/tile-dumpster.png');
        this.load.image('workstation', 'assets/workstation.png');
        
        // Load NPCs
        this.load.image('npc-vendor', 'assets/npc-vendor.png');
        this.load.image('npc-buyer', 'assets/npc-buyer.png');
        this.load.image('npc-rival', 'assets/npc-rival.png');
        this.load.image('npc-police', 'assets/npc-police.png');
        this.load.image('npc-shop-owner', 'assets/npc-shop-owner.png');
        this.load.image('npc-corrupt-cop', 'assets/npc-corrupt-cop.png');
        
        // Load icons
        this.load.image('icon-raw', 'assets/icon-raw-materials.png');
        this.load.image('icon-product', 'assets/icon-product.png');
        
        // === NEW AI-GENERATED SPRITES ===
        // Equipment slots
        this.load.image('equip-hat', 'assets/sprites/equipment/hat_slot.png');
        this.load.image('equip-shirt', 'assets/sprites/equipment/shirt_slot.png');
        this.load.image('equip-jacket', 'assets/sprites/equipment/jacket_slot.png');
        this.load.image('equip-pants', 'assets/sprites/equipment/pants_slot.png');
        this.load.image('equip-shoes', 'assets/sprites/equipment/shoes_slot.png');
        this.load.image('equip-weapon', 'assets/sprites/equipment/weapon_slot.png');
        this.load.image('equip-accessory1', 'assets/sprites/equipment/accessory1_slot.png');
        this.load.image('equip-accessory2', 'assets/sprites/equipment/accessory2_slot.png');
        
        // UI elements
        this.load.image('ui-health', 'assets/sprites/ui/health_bar_fill.png');
        this.load.image('ui-heat', 'assets/sprites/ui/heat_bar_fill.png');
        this.load.image('ui-money', 'assets/sprites/ui/money_icon.png');
        
        // Characters
        this.load.image('char-male', 'assets/sprites/characters/player_male_base.png');
        this.load.image('char-female', 'assets/sprites/characters/player_female_base.png');
        
        // NPCs
        this.load.image('npc-guard-basic', 'assets/sprites/npcs/npc_guard_basic.png');
        this.load.image('npc-guard-armed', 'assets/sprites/npcs/npc_guard_armed.png');
        this.load.image('npc-chemist', 'assets/sprites/npcs/npc_chemist.png');
        this.load.image('npc-runner', 'assets/sprites/npcs/npc_runner.png');
        this.load.image('npc-grower', 'assets/sprites/npcs/npc_grower.png');
        this.load.image('npc-dealer', 'assets/sprites/npcs/npc_dealer.png');
        
        // Weapons
        this.load.image('weapon-knife', 'assets/sprites/weapons/kitchen_knife.png');
        this.load.image('weapon-bat', 'assets/sprites/weapons/baseball_bat.png');
        this.load.image('weapon-crowbar', 'assets/sprites/weapons/crowbar.png');
        this.load.image('weapon-pistol', 'assets/sprites/weapons/pistol_9mm.png');
        this.load.image('weapon-ak47', 'assets/sprites/weapons/ak47.png');
        this.load.image('weapon-machete', 'assets/sprites/weapons/machete.png');
        this.load.image('weapon-revolver', 'assets/sprites/weapons/revolver.png');
        this.load.image('weapon-m4', 'assets/sprites/weapons/m4_rifle.png');
        
        // Armor
        this.load.image('armor-cap', 'assets/sprites/armor/01_light_baseball_cap.png');
        this.load.image('armor-shirt', 'assets/sprites/armor/02_light_cotton_shirt.png');
        this.load.image('armor-leather', 'assets/sprites/armor/06_medium_leather_jacket.png');
        this.load.image('armor-kevlar', 'assets/sprites/armor/07_medium_kevlar_vest.png');
        this.load.image('armor-combat-boots', 'assets/sprites/armor/08_medium_combat_boots.png');
        this.load.image('armor-swat', 'assets/sprites/armor/10_heavy_swat_gear.png');
        
        // FX
        this.load.image('fx-bullet', 'assets/sprites/fx/fx_bullet_hit.png');
        this.load.image('fx-blood', 'assets/sprites/fx/fx_blood_splat.png');
        this.load.image('fx-muzzle', 'assets/sprites/fx/fx_muzzle_flash.png');
        this.load.image('fx-explosion', 'assets/sprites/fx/fx_explosion.png');
        this.load.image('fx-fire', 'assets/sprites/fx/fx_fire.png');
        this.load.image('fx-smoke', 'assets/sprites/fx/fx_smoke.png');
    }
    
    create() {
        const { width, height } = this.scale;
        
        // Generate fallback textures in case external assets failed to load
        this.generateFallbackTextures();
        
        // Generate procedural map with neighborhood settings
        const neighborhood = this.playerState.neighborhood;
        const hoodConfig = MapGenerator.NEIGHBORHOODS[neighborhood];
        const factions = hoodConfig?.factions || [];
        const primaryFaction = factions.length > 0 ? factions[0] : null;
        const isContested = this.isNeighborhoodContested(neighborhood);
        
        const mapGen = new MapGenerator(this, this.biomeType, {
            neighborhood: neighborhood,
            faction: primaryFaction,
            includeHQ: true,
            includePOIs: true,
            isContested: isContested
        });
        
        const { map, objects, safehousePos } = mapGen.generate();
        
        // Initialize indoor state tracking
        this.isIndoor = false;
        this.outdoorState = null;
        this.currentInterior = null;
        this.interiorExit = null;
        
        // Create the game world
        this.createWorld(map, objects);
        
        // Store safehouse position
        this.safehousePos = safehousePos;
        
        // Set player start position near safehouse
        this.playerState.gridX = safehousePos.x + 2;
        this.playerState.gridY = safehousePos.y;
        
        // Create player sprite
        this.createPlayer();
        
        // Initialize systems
        this.timeSystem = new TimeSystem(this);
        this.calendarSystem = new CalendarSystem(this);
        this.minimap = new Minimap(this, width - 220, 20);
        this.hud = new HUD(this);
        this.safehouseUI = new SafehouseUI(this);
        this.vendorUI = new VendorUI(this);
        this.workstationUI = new WorkstationUI(this);
        this.rivalEncounterUI = new RivalEncounterUI(this);
        this.equipmentUI = new EquipmentUI(this);
        this.policeEncounterUI = new PoliceEncounterUI(this);
        this.relationshipUI = new RelationshipUI(this);
        this.supplierUI = new SupplierUI(this);
        this.tutorialUI = new TutorialUI(this);
        
        // Quest System
        this.questSystem = new QuestSystem(this);
        this.questUI = new QuestUI(this);
        this.questUI.create();
        
        // Setup quest completion callback for police suspicion tracking
        this.questSystem.onQuestComplete = (questId) => {
            // Riverside police tracks suspicion in starting area
            if (this.riversidePolice) {
                this.riversidePolice.onQuestComplete(questId);
            }
            // Big City police tracks suspicion in The Docks proper
            if (this.bigCityPolice) {
                this.bigCityPolice.onQuestComplete(questId);
            }
        };
        
        // NEW: Level & Skill Systems
        this.levelSystem = new LevelSystem(this);
        this.skillTree = new SkillTree(this);
        
        // NEW: Player Controller for movement delegation (eliminates duplicate tryMove)
        this.playerController = new PlayerController(this, this.playerState);
        
        // Initialize class type and starting skills based on highest stat
        this.initializeClassAndSkills();
        
        // NEW: Combat System
        this.combatScene = new CombatScene(this);
        
        // NEW: Achievements System
        this.achievements = new Achievements(this);
        
        // Load achievements from save if loading game
        if (loadSaveData && loadSaveData.achievements) {
            this.achievements.loadFromSave(loadSaveData);
        }
        
        // Track current day for buyer spawning
        this.currentDay = 1;
        this.buyers = [];
        this.supplierNPCs = [];
        
        // Spawn initial suppliers
        this.supplierSystem.generateSupplierCycle();
        this.placeSupplierNPCs();
        
        // Spawn initial buyers
        this.spawnDailyBuyers();
        
        // Spawn rival
        this.rival = null;
        this.rivalDefeated = false;
        this.spawnRival();
        
        // Police system
        this.police = null;
        this.policeState = 'none'; // 'none', 'patrol', 'chase'
        
        // Riverside Police System - Suspicion tracking and law enforcement interactions
        this.riversidePolice = null;
        if (this.playerState.neighborhood === 'RIVERSIDE' || 
            this.playerState.neighborhood === 'riverside') {
            this.riversidePolice = new RiversidePoliceSystem(this);
        }
        
        // Big City Police System - Metro PD, SWAT, and Federal law enforcement
        this.bigCityPolice = null;
        const bigCityNeighborhoods = ['DOWNTOWN', 'DOWNTOWN_EXPANSION', 'WAREHOUSE_DISTRICT', 'RIVERSIDE_PRISON', 
                                       'OLD_TOWN', 'SKID_ROW', 'THE_FLATS', 'IRONWORKS', 'THE_HARBOR',
                                       'THE_MAW', 'INDUSTRIAL_ZONE', 'SALVAGE_YARD'];
        if (bigCityNeighborhoods.includes(this.playerState.neighborhood)) {
            this.bigCityPolice = new BigCityPoliceSystem(this);
        }
        this.policePatrolPath = [];
        this.policePatrolIndex = 0;
        
        // Relationship NPCs
        this.shopOwner = null;
        this.corruptCop = null;
        this.placeRelationshipNPCs();
        
        // Setup controls
        this.setupControls();
        
        // Camera setup
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setZoom(1.2);
        
        // Bind time advance to movement
        this.events.on('playerMoved', () => {
            this.onPlayerMove();
        });
        
        // Show biome intro
        this.showBiomeIntro();
    }
    
    createWorld(mapData, objects) {
        // Create tiles from map data
        this.worldMap = [];
        this.worldObjects = [];
        this.culledTileCount = 0;
        this.lastCulledCount = -1;
        
        for (let y = 0; y < CONFIG.GRID_HEIGHT; y++) {
            this.worldMap[y] = [];
            for (let x = 0; x < CONFIG.GRID_WIDTH; x++) {
                const tileData = mapData[y][x];
                
                const tile = this.add.image(
                    x * CONFIG.TILE_SIZE,
                    y * CONFIG.TILE_SIZE,
                    tileData.type
                );
                tile.setOrigin(0, 0);
                tile.setDisplaySize(CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                
                // Store tile with visibility tracking
                this.worldMap[y][x] = {
                    type: tileData.type,
                    sprite: tile,
                    walkable: tileData.walkable,
                    gridX: x,
                    gridY: y,
                    isVisible: true  // Track visibility for culling
                };
            }
        }
        
        // Initial culling - hide tiles outside viewport
        this.updateTileCulling();
        
        // Place objects
        objects.forEach(obj => {
            let sprite;
            
            if (obj.type === 'safehouse') {
                const tier = CONFIG.SAFEHOUSE_TIERS[this.playerState.safehouseTier];
                sprite = this.add.image(
                    obj.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                    obj.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                    tier.sprite
                );
                sprite.setScale(tier.scale);
                sprite.setDepth(50);
                
                // Store reference for upgrades
                obj.safehouseSprite = sprite;
                
                // Add interaction indicator
                const indicator = this.add.text(
                    obj.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                    obj.y * CONFIG.TILE_SIZE - 10,
                    '[E]',
                    {
                        fontFamily: 'Press Start 2P',
                        fontSize: '12px',
                        color: CONFIG.COLORS.primary,
                        stroke: '#000000',
                        strokeThickness: 3
                    }
                ).setOrigin(0.5).setDepth(51).setAlpha(0);
                
                obj.indicator = indicator;
            } else if (obj.type === 'dumpster') {
                sprite = this.add.image(
                    obj.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                    obj.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                    'dumpster'
                );
                sprite.setScale(CONFIG.SCALE.DUMPSTER);
                sprite.setDepth(50);
                
                // Mark as non-walkable (with bounds check)
                if (this.worldMap[obj.y] && this.worldMap[obj.y][obj.x]) {
                    this.worldMap[obj.y][obj.x].walkable = false;
                }
            } else if (obj.type === 'workstation') {
                sprite = this.add.image(
                    obj.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                    obj.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                    'workstation'
                );
                sprite.setScale(CONFIG.SCALE.WORKSTATION);
                sprite.setDepth(50);
                
                // Add interaction indicator
                const indicator = this.add.text(
                    obj.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                    obj.y * CONFIG.TILE_SIZE - 10,
                    '[E]',
                    {
                        fontFamily: 'Press Start 2P',
                        fontSize: '12px',
                        color: CONFIG.COLORS.secondary,
                        stroke: '#000000',
                        strokeThickness: 3
                    }
                ).setOrigin(0.5).setDepth(51).setAlpha(0);
                
                obj.indicator = indicator;
            } else if (obj.type === 'vendor') {
                sprite = this.add.image(
                    obj.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                    obj.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                    'npc-vendor'
                );
                sprite.setScale(CONFIG.SCALE.NPC_VENDOR);
                sprite.setDepth(50);
                
                // Add interaction indicator
                const indicator = this.add.text(
                    obj.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                    obj.y * CONFIG.TILE_SIZE - 10,
                    '[E] SUPPLIER',
                    {
                        fontFamily: 'Press Start 2P',
                        fontSize: '10px',
                        color: CONFIG.COLORS.success,
                        stroke: '#000000',
                        strokeThickness: 3
                    }
                ).setOrigin(0.5).setDepth(51).setAlpha(0);
                
                obj.indicator = indicator;
            } else if (obj.type === 'buyer') {
                sprite = this.add.image(
                    obj.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                    obj.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                    'npc-buyer'
                );
                sprite.setScale(CONFIG.SCALE.NPC_BUYER);
                sprite.setDepth(50);
                
                // Add interaction indicator
                const indicator = this.add.text(
                    obj.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                    obj.y * CONFIG.TILE_SIZE - 10,
                    '[E] BUYER',
                    {
                        fontFamily: 'Press Start 2P',
                        fontSize: '10px',
                        color: CONFIG.COLORS.primary,
                        stroke: '#000000',
                        strokeThickness: 3
                    }
                ).setOrigin(0.5).setDepth(51).setAlpha(0);
                
                obj.indicator = indicator;
            } else if (obj.type === 'poi') {
                // POI - Point of Interest with visual indicator
                // Create a colored marker based on POI type
                const poiColors = {
                    'building': 0xFFD700,
                    'passage': 0x00CED1,
                    'waterfront': 0x4169E1,
                    'danger': 0xFF4500,
                    'service': 0x32CD32
                };
                const color = poiColors[obj.poiType] || 0xFFD700;
                
                // Create a glow effect for the POI
                const marker = this.add.circle(
                    obj.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                    obj.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                    CONFIG.TILE_SIZE * 0.3,
                    color,
                    0.3
                );
                marker.setDepth(49);
                
                // Add interaction indicator with POI name
                const indicator = this.add.text(
                    obj.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                    obj.y * CONFIG.TILE_SIZE - 10,
                    '[E] ' + obj.poiKey.toUpperCase(),
                    {
                        fontFamily: 'Press Start 2P',
                        fontSize: '8px',
                        color: '#' + color.toString(16).padStart(6, '0'),
                        stroke: '#000000',
                        strokeThickness: 3
                    }
                ).setOrigin(0.5).setDepth(51).setAlpha(0);
                
                obj.indicator = indicator;
                obj.marker = marker;
            }
            
            obj.sprite = sprite;
            this.worldObjects.push(obj);
        });
        
        // Place vendor NPC
        this.placeVendor();
        
        // Place workstation near safehouse
        this.placeWorkstation();
        
        // Animate POI markers for discoverability
        this.animatePOIMarkers();
    }
    
    showBiomeIntro() {
        const { width, height } = this.scale;
        
        const biomeName = this.biomeType === 'block' ? 'THE BLOCK' : 'TRAP HOUSE';
        const biomeDesc = this.biomeType === 'block' ? 
            'Dark alleys and concrete streets.\nThis is your territory now.' :
            'A dilapidated safehouse.\nYour operation starts here.';
        
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9);
        overlay.setScrollFactor(0);
        overlay.setDepth(1000);
        
        const title = this.add.text(width / 2, height / 2 - 30, biomeName, {
            fontFamily: 'Press Start 2P',
            fontSize: '42px',
            color: CONFIG.COLORS.primary,
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);
        
        const desc = this.add.text(width / 2, height / 2 + 40, biomeDesc, {
            fontFamily: 'Press Start 2P',
            fontSize: '16px',
            color: CONFIG.COLORS.text,
            align: 'center'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);
        
        this.time.delayedCall(3000, () => {
            overlay.destroy();
            title.destroy();
            desc.destroy();
        });
    }
    
    createPlayer() {
        const startX = this.playerState.gridX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        const startY = this.playerState.gridY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;

        this.player = this.add.image(startX, startY, 'player-top');
        this.player.setScale(CONFIG.SCALE.PLAYER);
        this.player.setDepth(100);
    }
    
    setupControls() {
        // ==========================================
        // KEYBOARD CONTROLS
        // ==========================================
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };
        
        // Action key (E) for interactions
        this.actionKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        
        // Skill Tree hotkey (K)
        this.skillTreeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
        
        // World Map hotkey (M)
        this.worldMapKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
        
        // Pause menu (ESC)
        this.escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        
        // ==========================================
        // MOBILE CONTROLS
        // ==========================================
        this.setupMobileControls();
        
        // ==========================================
        // TAP-TO-MOVE (works with both mouse and touch)
        // ==========================================
        this.input.on('pointerdown', (pointer) => {
            // Ignore if clicking on UI elements or joystick area
            if (this.isMobileControlArea(pointer)) return;
            if (this.playerState.isMoving || this.isAnyUIOpen()) return;
            
            // Handle tutorial click-outside to close
            if (this.tutorialUI.isOpen) {
                this.tutorialUI.handleClick(pointer.x, pointer.y);
                return;
            }
            
            this.handleTapToMove(pointer);
        });
    }
    
    /**
     * Check if pointer is in mobile control area (left side for joystick)
     */
    isMobileControlArea(pointer) {
        const { width, height } = this.scale;
        // Left 30% of screen is joystick area
        return pointer.x < width * 0.3;
    }
    
    /**
     * Check if any UI is currently open
     */
    isAnyUIOpen() {
        return this.safehouseUI.isOpen || 
               this.vendorUI.isOpen || 
               this.workstationUI.isOpen || 
               this.rivalEncounterUI.isOpen || 
               this.equipmentUI.isOpen ||
               this.policeEncounterUI.isOpen || 
               this.relationshipUI.isOpen ||
               this.supplierUI.isOpen ||
               this.tutorialUI.isOpen ||
               (this.skillTree.ui && this.skillTree.ui.isOpen) ||
               (this.questUI && this.questUI.isOpen) ||
               this.pauseOverlay !== null;
    }
    
    /**
     * Setup mobile touch controls (joystick + action buttons)
     */
    setupMobileControls() {
        const { width, height } = this.scale;
        
        // Create TouchControls for mobile joystick and buttons
        this.touchControls = new TouchControls(this);
        this.touchControls.setupJoystick();
        
        // Set this.joystick to TouchControls for PlayerController compatibility
        this.joystick = this.touchControls;
        
        // Also create mobile controls manager for any additional controls
        this.mobileControls = new MobileControlsManager(this);
        
        // Add INTERACT button (right side)
        this.interactButton = this.add.rectangle(
            width * 0.88, height * 0.82, 90, 90, 0x44aa44, 0.8
        );
        this.interactButton.setDepth(1000);
        this.interactButton.setScrollFactor(0);
        this.interactButton.setInteractive({ useHandCursor: true });
        
        // Add "E" label to button
        this.interactLabel = this.add.text(
            width * 0.88, height * 0.82, 'E', {
            fontFamily: 'Press Start 2P',
            fontSize: '36px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(1001).setScrollFactor(0);
        
        // Prevent double-tap zoom on button (touch feedback)
        this.interactButton.on('pointerdown', (pointer) => {
            this.interactButton.setScale(0.95);
            this.interactButton.setAlpha(1);
            
            // Trigger interaction
            this.tryInteract();
        });
        
        this.interactButton.on('pointerup', () => {
            this.interactButton.setScale(1);
            this.interactButton.setAlpha(0.8);
        });
        
        this.interactButton.on('pointerout', () => {
            this.interactButton.setScale(1);
            this.interactButton.setAlpha(0.8);
        });
        
        // Track continuous movement from joystick
        this.joystickInput = { x: 0, y: 0 };
        this.joystickMoveDelay = 0; // Cooldown between joystick moves
    }
    
    /**
     * Update tile culling based on camera viewport
     * Only tiles within camera view + buffer are rendered
     */
    updateTileCulling() {
        if (!this.cameras?.main) return;
        
        const cam = this.cameras.main;
        const buffer = CONFIG.CULLING_BUFFER;
        
        // Calculate visible grid bounds
        const startX = Math.max(0, Math.floor(cam.scrollX / CONFIG.TILE_SIZE) - buffer);
        const endX = Math.min(CONFIG.GRID_WIDTH - 1, Math.ceil((cam.scrollX + cam.width / cam.zoom) / CONFIG.TILE_SIZE) + buffer);
        const startY = Math.max(0, Math.floor(cam.scrollY / CONFIG.TILE_SIZE) - buffer);
        const endY = Math.min(CONFIG.GRID_HEIGHT - 1, Math.ceil((cam.scrollY + cam.height / cam.zoom) / CONFIG.TILE_SIZE) + buffer);
        
        let visibleCount = 0;
        let culledCount = 0;
        
        // Update tile visibility
        for (let y = 0; y < CONFIG.GRID_HEIGHT; y++) {
            for (let x = 0; x < CONFIG.GRID_WIDTH; x++) {
                const tile = this.worldMap[y]?.[x];
                if (!tile?.sprite) continue;
                
                const inView = x >= startX && x <= endX && y >= startY && y <= endY;
                
                if (inView !== tile.isVisible) {
                    tile.isVisible = inView;
                    tile.sprite.setVisible(inView);
                    tile.sprite.setActive(inView);
                }
                
                if (inView) visibleCount++;
                else culledCount++;
            }
        }
        
        // Update object visibility
        this.worldObjects.forEach(obj => {
            if (!obj.sprite) return;
            
            const inView = obj.x >= startX && obj.x <= endX && obj.y >= startY && obj.y <= endY;
            
            if (inView !== obj.isVisible) {
                obj.isVisible = inView;
                obj.sprite.setVisible(inView);
                obj.sprite.setActive(inView);
            }
        });
        
        // Log culling stats (only when changed)
        if (culledCount !== this.lastCulledCount) {
                        this.lastCulledCount = culledCount;
        }
    }
    
    // ============================================================
    // WORLD MAP & NEIGHBORHOOD NAVIGATION
    // ============================================================
    
    /**
     * Open the world map scene
     */
    openWorldMap() {
        // Check if gang war is active (blocks travel)
        if (this.calendarSystem && this.calendarSystem.isTravelBlocked()) {
            this.showFloatingText('Gang War! Cannot leave neighborhood!', CONFIG.COLORS.danger);
            return;
        }
        
        // Pause the game
        this.scene.pause();
        
        // Store reference to this scene in registry
        this.registry.set('gameScene', this);
        
        // Launch world map scene
        this.scene.launch('WorldMapScene');
    }
    
    /**
     * Generate a new map for a specific neighborhood
     * @param {string} neighborhoodKey - The neighborhood key (e.g., 'OLD_TOWN', 'SKID_ROW')
     */
    generateMapForNeighborhood(neighborhoodKey) {
        try {
            // Prevent neighborhood transitions while indoors
            if (this.isIndoor) {
                this.showFloatingText('Exit building first!', CONFIG.COLORS.danger);
                return;
            }
            
            // Show loading indicator
            this.showFloatingText('Traveling...', CONFIG.COLORS.info);
            
            const neighborhood = neighborhoodKey || this.playerState.neighborhood;
        
        // Get neighborhood config
        const hoodConfig = MapGenerator.NEIGHBORHOODS[neighborhood];
        if (!hoodConfig) {
            console.error(`Unknown neighborhood: ${neighborhood}`);
            return;
        }
        
        // Get factions for this neighborhood
        const factions = hoodConfig.factions || [];
        const primaryFaction = factions.length > 0 ? factions[0] : null;
        
        // Check if this is a contested zone
        const isContested = this.isNeighborhoodContested(neighborhood);
        
        // Create map generator with neighborhood options
        const mapGen = new MapGenerator(this, this.biomeType, {
            neighborhood: neighborhood,
            faction: primaryFaction,
            includeHQ: true,
            includePOIs: true,
            isContested: isContested
        });
        
        // Generate new map
        const { map, objects, safehousePos, spatial } = mapGen.generate();
        
        // Clear existing world
        this.clearWorld();
        
        // Recreate world with new map
        this.createWorld(map, objects);
        
        // Update safehouse position
        this.safehousePos = safehousePos;
        
        // Set player start position near safehouse
        this.playerState.gridX = safehousePos.x + 2;
        this.playerState.gridY = safehousePos.y;
        
        // Update player sprite position
        if (this.player) {
            this.player.x = this.playerState.gridX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
            this.player.y = this.playerState.gridY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        }
        
        // Update neighborhood in player state
        this.playerState.neighborhood = neighborhood;
        
        // Add to visited neighborhoods if not already visited
        if (!this.playerState.visitedNeighborhoods.includes(neighborhood)) {
            this.playerState.visitedNeighborhoods.push(neighborhood);
            
            // Track achievement: visit new neighborhood
            EventBus.emit(EVENTS.PLAYER_NEIGHBORHOOD_CHANGED, { 
                neighborhood: neighborhood,
                isNew: true 
            });
        }
        
        // Unlock neighboring neighborhoods when visiting a new area
        this.unlockNeighborNeighborhoods(neighborhood);
        
                
        // Update HUD to show new neighborhood
        if (this.hud) {
            this.hud.update();
        }
        
        } catch (error) {
            console.error('Error generating map for neighborhood:', error);
            this.showFloatingText('Travel failed!', CONFIG.COLORS.danger);
        }
    }
    
    /**
     * Check if a neighborhood is contested
     */
    isNeighborhoodContested(neighborhood) {
        // Define contested neighborhoods
        const contested = ['SKID_ROW', 'THE_FLATS', 'THE_HARBOR', 'INDUSTRIAL_ZONE'];
        return contested.includes(neighborhood);
    }
    
    /**
     * Unlock neighboring neighborhoods when visiting a new area
     */
    unlockNeighborNeighborhoods(neighborhood) {
        // Define neighborhood adjacency (who connects to whom)
        const adjacency = {
            'RIVERSIDE': ['OLD_TOWN', 'THE_FLATS'], // Starting area - gateway
            'OLD_TOWN': ['RIVERSIDE', 'THE_MAW', 'THE_FLATS', 'INDUSTRIAL_ZONE'],
            'SKID_ROW': ['THE_FLATS'],
            'THE_FLATS': ['RIVERSIDE', 'OLD_TOWN', 'SKID_ROW', 'INDUSTRIAL_ZONE', 'SALVAGE_YARD'],
            'INDUSTRIAL_ZONE': ['OLD_TOWN', 'THE_FLATS', 'THE_HARBOR', 'THE_MAW'],
            'THE_MAW': ['OLD_TOWN', 'INDUSTRIAL_ZONE'],
            'SALVAGE_YARD': ['THE_FLATS', 'IRONWORKS'],
            'IRONWORKS': ['SALVAGE_YARD', 'THE_HARBOR'],
            'THE_HARBOR': ['INDUSTRIAL_ZONE', 'IRONWORKS']
        };
        
        const neighbors = adjacency[neighborhood] || [];
        
        neighbors.forEach(neighbor => {
            if (!this.playerState.unlockedNeighborhoods.includes(neighbor)) {
                this.playerState.unlockedNeighborhoods.push(neighbor);
                            }
        });
    }
    
    /**
     * Check if player is at the edge of the map and offer to travel
     */
    checkNeighborhoodBorder() {
        const { GRID_WIDTH, GRID_HEIGHT } = CONFIG;
        const borderThreshold = 2; // How close to edge before triggering
        
        let atBorder = false;
        let direction = '';
        
        if (this.playerState.gridX <= borderThreshold) {
            atBorder = true;
            direction = 'west';
        } else if (this.playerState.gridX >= GRID_WIDTH - borderThreshold - 1) {
            atBorder = true;
            direction = 'east';
        } else if (this.playerState.gridY <= borderThreshold) {
            atBorder = true;
            direction = 'north';
        } else if (this.playerState.gridY >= GRID_HEIGHT - borderThreshold - 1) {
            atBorder = true;
            direction = 'south';
        }
        
        if (atBorder && !this.borderPromptShown) {
            this.borderPromptShown = true;
            this.offerNeighborhoodTransition(direction);
        } else if (!atBorder) {
            this.borderPromptShown = false;
        }
    }
    
    /**
     * Offer to travel to neighboring area when at border
     */
    offerNeighborhoodTransition(direction) {
        // Check if gang war is active (blocks travel)
        if (this.calendarSystem && this.calendarSystem.isTravelBlocked()) {
            this.showFloatingText('Gang War! Cannot leave neighborhood!', CONFIG.COLORS.danger);
            return;
        }
        
        const { neighborhood } = this.playerState;
        const hoodConfig = MapGenerator.NEIGHBORHOODS[neighborhood];
        
        // Get neighboring neighborhoods based on direction
        const adjacency = {
            'RIVERSIDE': ['OLD_TOWN', 'THE_FLATS'], // Starting area - gateway
            'OLD_TOWN': ['RIVERSIDE', 'THE_MAW', 'THE_FLATS', 'INDUSTRIAL_ZONE'],
            'SKID_ROW': ['THE_FLATS'],
            'THE_FLATS': ['RIVERSIDE', 'OLD_TOWN', 'SKID_ROW', 'INDUSTRIAL_ZONE', 'SALVAGE_YARD'],
            'INDUSTRIAL_ZONE': ['OLD_TOWN', 'THE_FLATS', 'THE_HARBOR', 'THE_MAW'],
            'THE_MAW': ['OLD_TOWN', 'INDUSTRIAL_ZONE'],
            'SALVAGE_YARD': ['THE_FLATS', 'IRONWORKS'],
            'IRONWORKS': ['SALVAGE_YARD', 'THE_HARBOR'],
            'THE_HARBOR': ['INDUSTRIAL_ZONE', 'IRONWORKS']
        };
        
        const neighbors = adjacency[neighborhood] || [];
        
        // Filter to only unlocked neighbors
        const availableNeighbors = neighbors.filter(n => 
            this.playerState.unlockedNeighborhoods.includes(n)
        );
        
        if (availableNeighbors.length === 0) return;
        
        // Show prompt
        const { width, height } = this.scale;
        
        // Create popup
        const popup = this.add.rectangle(width/2, height/2, 400, 200, 0x1a1a2e);
        popup.setStrokeStyle(2, 0x666666);
        
        const text = this.add.text(width/2, height/2 - 40, 
            `You're leaving ${hoodConfig.name}.\nTravel to a new area?`, {
            fontSize: '18px',
            fontFamily: 'Courier, monospace',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        const travelBtn = this.add.text(width/2 - 80, height/2 + 40, '[ TRAVEL ]', {
            fontSize: '20px',
            fontFamily: 'Courier, monospace',
            color: '#00ff00'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        const stayBtn = this.add.text(width/2 + 80, height/2 + 40, '[ STAY ]', {
            fontSize: '20px',
            fontFamily: 'Courier, monospace',
            color: '#ff4444'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        travelBtn.on('pointerdown', () => {
            popup.destroy();
            text.destroy();
            travelBtn.destroy();
            stayBtn.destroy();
            this.openWorldMap();
        });
        
        stayBtn.on('pointerdown', () => {
            popup.destroy();
            text.destroy();
            travelBtn.destroy();
            stayBtn.destroy();
            // Push player back from edge
            if (direction === 'west') this.playerState.gridX = 3;
            else if (direction === 'east') this.playerState.gridX = CONFIG.GRID_WIDTH - 4;
            else if (direction === 'north') this.playerState.gridY = 3;
            else if (direction === 'south') this.playerState.gridY = CONFIG.GRID_HEIGHT - 4;
            
            // Update player position visually
            if (this.player) {
                this.player.x = this.playerState.gridX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
                this.player.y = this.playerState.gridY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
            }
        });
    }
    
    /**
     * Clear the existing world (tiles, objects, etc.)
     */
    clearWorld() {
        // Destroy existing tilemap
        if (this.layer) {
            this.layer.destroy();
        }
        if (this.map) {
            this.map.destroy();
        }
        
        // Clear objects
        if (this.objects) {
            this.objects.getChildren().forEach(obj => obj.destroy());
        }
        
        // Clear safehouse
        if (this.safehouse) {
            this.safehouse.destroy();
        }
    }
    
    /**
     * Handle joystick movement - continuous movement while joystick is held
     * Called from update() to integrate with game loop
     */
    handleJoystickMovement(delta) {
        if (!this.joystick) return;
        
        const vector = this.joystick.getVector();
        
        // Only move if joystick has meaningful input and cooldown is ready
        const joystickMagnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
        if (joystickMagnitude < 0.2) {
            this.joystickMoveDelay = 0;
            return;
        }
        
        // Check if player is moving or UI is open
        if (this.playerState.isMoving || this.isAnyUIOpen()) return;
        
        // Apply cooldown (prevents too-fast movement)
        if (this.joystickMoveDelay > 0) {
            this.joystickMoveDelay -= delta;
            return;
        }
        
        // Reset cooldown (180ms between moves)
        this.joystickMoveDelay = 180;
        
        // Determine movement direction based on joystick angle
        const dx = Math.abs(vector.x) > Math.abs(vector.y) ? 
            (vector.x > 0 ? 1 : -1) : 0;
        const dy = Math.abs(vector.y) > Math.abs(vector.x) ? 
            (vector.y > 0 ? 1 : -1) : 0;
        
        // Move in the predominant direction
        if (dx !== 0 || dy !== 0) {
            this.playerController.tryMove(dx, dy);
        }
    }
    
    /**
     * Handle tap-to-move: move player towards tapped location
     */
    handleTapToMove(pointer) {
        // Convert screen coordinates to world coordinates
        const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
        const targetGridX = Math.floor(worldPoint.x / CONFIG.TILE_SIZE);
        const targetGridY = Math.floor(worldPoint.y / CONFIG.TILE_SIZE);
        
        // Calculate direction from player to target
        const dx = targetGridX - this.playerState.gridX;
        const dy = targetGridY - this.playerState.gridY;
        
        // If tapping on player, ignore
        if (dx === 0 && dy === 0) return;
        
        // Determine primary movement direction (like keyboard input)
        // Move one tile in the predominant direction (for grid-based movement)
        if (Math.abs(dx) >= Math.abs(dy) && dx !== 0) {
            this.playerController.tryMove(dx > 0 ? 1 : -1, 0);
        } else if (dy !== 0) {
            this.playerController.tryMove(0, dy > 0 ? 1 : -1);
        }
    }
    
    /**
     * Clean up mobile controls (for scene shutdown)
     */
    destroyMobileControls() {
        if (this.mobileControls) {
            this.mobileControls.destroy();
            this.mobileControls = null;
        }
    }
    
    update(time, delta) {
        // Update tile culling based on camera position
        this.updateTileCulling();
        
        // Update hints system with player state (non-blocking tips)
        if (this.tutorialUI && this.tutorialUI.hintsSystem) {
            this.tutorialUI.hintsSystem.update(this.playerState);
        }
        
        // Update quest system periodically (every ~5 seconds)
        if (this.questUpdateTimer === undefined) {
            this.questUpdateTimer = 0;
        }
        this.questUpdateTimer += delta;
        if (this.questUpdateTimer > 5000) {
            this.questUpdateTimer = 0;
            if (this.questSystem) {
                this.questSystem.checkChapterProgress();
                this.questUI.update();
            }
        }
        
        // Update combat scene if active
        if (this.combatScene && this.combatScene.isActive) {
            this.combatScene.update();
            return;
        }
        
        if (this.playerState.isMoving || this.safehouseUI.isOpen || 
            this.vendorUI.isOpen || this.workstationUI.isOpen || 
            this.rivalEncounterUI.isOpen || this.equipmentUI.isOpen ||
            this.policeEncounterUI.isOpen || this.relationshipUI.isOpen) return;
        
        // ==========================================
        // WORLD MAP (M key)
        // ==========================================
        if (Phaser.Input.Keyboard.JustDown(this.worldMapKey)) {
            this.openWorldMap();
            return;
        }
        
        // ==========================================
        // PAUSE MENU (ESC key)
        // ==========================================
        if (Phaser.Input.Keyboard.JustDown(this.escapeKey)) {
            if (this.isAnyUIOpen()) {
                // Close current UI if open
                this.closeAllUI();
            } else {
                // Open pause menu with achievements
                this.openPauseMenu();
            }
            return;
        }
        
        // ==========================================
        // JOYSTICK MOVEMENT (Mobile)
        // ==========================================
        // Handle joystick input from mobile controls
        this.handleJoystickMovement(delta);
        
        // Check for rival proximity (before interactions)
        if (this.rival && !this.rivalDefeated) {
            this.checkRivalProximity();
        }
        
        // Check police status and spawn if needed
        this.updatePoliceSystem();
        
        // Check for interactions
        this.checkInteractionProximity();
        
        // Check action key
        if (Phaser.Input.Keyboard.JustDown(this.actionKey)) {
            this.tryInteract();
        }
        
        // Check skill tree hotkey (K)
        if (Phaser.Input.Keyboard.JustDown(this.skillTreeKey)) {
            this.skillTree.openSkillTreeUI();
        }
        
        // Check keyboard input
        if (Phaser.Input.Keyboard.JustDown(this.cursors.left) || 
            Phaser.Input.Keyboard.JustDown(this.wasd.left)) {
            this.playerController.tryMove(-1, 0);
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right) || 
                   Phaser.Input.Keyboard.JustDown(this.wasd.right)) {
            this.playerController.tryMove(1, 0);
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || 
                   Phaser.Input.Keyboard.JustDown(this.wasd.up)) {
            this.playerController.tryMove(0, -1);
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down) || 
                   Phaser.Input.Keyboard.JustDown(this.wasd.down)) {
            this.playerController.tryMove(0, 1);
        }
    }
    
    /**
     * Check if an NPC is available based on their schedule
     * @param {Object} obj - The NPC object with optional schedule property
     * @returns {boolean} - True if NPC is available, false otherwise
     */
    isNPCScheduleAvailable(obj) {
        // If no schedule property, NPC is always available
        if (!obj.schedule) return true;
        
        // Check current time of day
        const currentHour = this.timeSystem ? this.timeSystem.getHour() : 12;
        const isNight = currentHour >= CONFIG.NIGHT_START_HOUR || currentHour < CONFIG.DAY_START_HOUR;
        
        if (obj.schedule === 'day') {
            return !isNight;
        } else if (obj.schedule === 'night') {
            return isNight;
        }
        
        return true; // Default to available if schedule is unknown
    }
    
    /**
     * Get schedule status text for NPC
     * @param {Object} obj - The NPC object
     * @returns {string} - Status message or empty string
     */
    getNPCScheduleStatus(obj) {
        if (!obj.schedule) return '';
        
        const currentHour = this.timeSystem ? this.timeSystem.getHour() : 12;
        const isNight = currentHour >= CONFIG.NIGHT_START_HOUR || currentHour < CONFIG.DAY_START_HOUR;
        
        if (obj.schedule === 'day' && isNight) {
            return ' (Closed - opens at 6 AM)';
        } else if (obj.schedule === 'night' && !isNight) {
            return ' (Sleeping - active at 10 PM)';
        }
        
        return '';
    }
    
    checkInteractionProximity() {
        // Check all interactive objects
        this.worldObjects.forEach(obj => {
            if (!obj.indicator) return;
            
            // Check NPC schedule - hide indicator if NPC isn't available
            if ((obj.type === 'shopOwner' || obj.type === 'corruptCop') && 
                !this.isNPCScheduleAvailable(obj)) {
                obj.indicator.setAlpha(0);
                return;
            }
            
            const dist = Phaser.Math.Distance.Between(
                this.playerState.gridX, this.playerState.gridY,
                obj.x, obj.y
            );
            
            if (dist <= 1.5) {
                obj.indicator.setAlpha(1);
            } else {
                obj.indicator.setAlpha(0);
            }
        });
    }
    
    tryInteract() {
        // Check for interior exit first
        if (this.isIndoor && this.checkInteriorExit()) {
            this.exitBuilding();
            return;
        }
        
        // Find nearby interactive object
        for (const obj of this.worldObjects) {
            const dist = Phaser.Math.Distance.Between(
                this.playerState.gridX, this.playerState.gridY,
                obj.x, obj.y
            );
            
            if (dist <= 1.5) {
                if (obj.type === 'safehouse') {
                    this.safehouseUI.open();
                    return;
                } else if (obj.type === 'vendor') {
                    this.vendorUI.open();
                    return;
                } else if (obj.type === 'workstation') {
                    this.workstationUI.open();
                    return;
                } else if (obj.type === 'travelingSalesman') {
                    // Traveling Salesman opens VendorUI with special inventory
                    this.vendorUI.open(obj.vendorInventory);
                    return;
                } else if (obj.type === 'buyer') {
                    // Check for traveling salesman - opens VendorUI instead of selling
                    if (obj.customerType === 'travelingSalesman') {
                        this.vendorUI.open(obj.vendorInventory);
                        return;
                    }
                    this.sellToBuyer(obj);
                    return;
                } else if (obj.type === 'shopOwner' || obj.type === 'corruptCop') {
                    // Check NPC schedule before allowing interaction
                    if (!this.isNPCScheduleAvailable(obj)) {
                        const status = this.getNPCScheduleStatus(obj);
                        this.showFloatingText(`NPC not available${status}`, CONFIG.COLORS.warning);
                        return;
                    }
                    this.relationshipUI.open(obj);
                    return;
                } else if (obj.type === 'supplier') {
                    this.openSupplierMeeting(obj.supplierId);
                    return;
                } else if (obj.type === 'poi' && obj.interactive) {
                    // Check if it's the police station
                    if (obj.isLawEnforcement) {
                        this.interactWithPoliceStation(obj);
                        return;
                    }
                    this.enterBuilding(obj);
                    return;
                }
            }
        }
    }
    
    /**
     * Open a meeting with a supplier by gang ID
     */
    openSupplierMeeting(supplierId) {
        const supplier = this.supplierSystem.getSupplier(supplierId);
        if (!supplier) {
            this.showFloatingText('Supplier not found!', CONFIG.COLORS.danger);
            return;
        }
        
        // Start the meeting in the system
        this.supplierSystem.startMeeting(supplierId);
        
        // Quest: Track supplier interaction
        if (this.questSystem) {
            this.questSystem.onSupplierInteraction();
        }
        
        // Open the supplier UI
        this.supplierUI.open(supplier);
    }
    
    /**
     * Interact with the Riverside Police Station
     */
    interactWithPoliceStation(policeStationObj) {
        // Check if player is in Riverside and has police system
        if (!this.riversidePolice) {
            this.showFloatingText('Nothing to do here', CONFIG.COLORS.text);
            return;
        }
        
        const suspLevel = this.riversidePolice.getSuspicionLevel();
        const suspValue = this.riversidePolice.getSuspicion();
        
        // Show police interaction UI
        this.showPoliceStationUI(suspLevel, suspValue);
    }
    
    /**
     * Show the police station interaction UI
     */
    showPoliceStationUI(suspicionLevel, suspicionValue) {
        const { width, height } = this.scale;
        
        // Create container
        const container = this.add.container(0, 0).setScrollFactor(0).setDepth(2000);
        
        // Dark overlay
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);
        container.add(overlay);
        
        // Title panel
        const titlePanel = this.add.rectangle(width / 2, 120, 700, 80, 0x1a3a5c);
        titlePanel.setStrokeStyle(4, 0x4488cc);
        container.add(titlePanel);
        
        const titleText = this.add.text(width / 2, 120, 'RIVERSIDE POLICE STATION', {
            fontFamily: 'Press Start 2P',
            fontSize: '20px',
            color: '#4488cc'
        }).setOrigin(0.5);
        container.add(titleText);
        
        // Suspicion display
        const suspColors = {
            'none': '#44cc44',
            'low': '#88cc44',
            'medium': '#ccaa44',
            'high': '#cc6644',
            'critical': '#cc4444'
        };
        
        const suspPanel = this.add.rectangle(width / 2, 200, 700, 60, 0x2a2a2a);
        suspPanel.setStrokeStyle(2, suspColors[suspicionLevel] || '#ffffff');
        container.add(suspPanel);
        
        const suspText = this.add.text(width / 2, 200, 
            `Police Interest: ${suspicionLevel.toUpperCase()} (${suspicionValue}%)`, {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: suspColors[suspicionLevel] || '#ffffff'
        }).setOrigin(0.5);
        container.add(suspText);
        
        // Info panel
        const infoPanel = this.add.rectangle(width / 2, 320, 700, 180, 0x1a1a1a);
        infoPanel.setStrokeStyle(2, 0x333333);
        container.add(infoPanel);
        
        let infoMessage = '';
        if (suspicionLevel === 'none') {
            infoMessage = "Chief Thompson nods as you enter.\n\n\"Stay out of trouble, citizen.\"\n\nThe station is quiet. No one suspects anything.";
        } else if (suspicionLevel === 'low') {
            infoMessage = "Officer Jenkins glances at you.\n\n\"Heard some rumors lately.\nNothing specific, though.\"\n\nBetter be more careful.";
        } else if (suspicionLevel === 'medium') {
            infoMessage = "The Chief looks at you sternly.\n\n\"We've been getting tips about\nsome activity in town.\"\n\nThey're getting suspicious.";
        } else if (suspicionLevel === 'high') {
            infoMessage = "\"Sit down.\" The Chief is serious.\n\n\"We know about your operations.\nDon't think we haven't been watching.\"\n\nThis is bad. Very bad.";
        } else {
            infoMessage = "They're ready to pounce.\n\n\"We've got enough evidence.\nYou're going down.\"\n\nA raid is imminent!";
        }
        
        const infoText = this.add.text(width / 2, 320, infoMessage, {
            fontFamily: 'Press Start 2P',
            fontSize: '12px',
            color: CONFIG.COLORS.text,
            align: 'center',
            lineSpacing: 8
        }).setOrigin(0.5);
        container.add(infoText);
        
        // Close button
        const closeButton = this.add.rectangle(width / 2, height - 100, 300, 60, 0x2a2a2a);
        closeButton.setStrokeStyle(3, 0x4488cc);
        closeButton.setInteractive({ useHandCursor: true });
        container.add(closeButton);
        
        const closeText = this.add.text(width / 2, height - 100, 'LEAVE', {
            fontFamily: 'Press Start 2P',
            fontSize: '18px',
            color: '#4488cc'
        }).setOrigin(0.5);
        container.add(closeText);
        
        closeButton.on('pointerover', () => {
            closeButton.setFillStyle(0x3a3a3a);
        });
        
        closeButton.on('pointerout', () => {
            closeButton.setFillStyle(0x2a2a2a);
        });
        
        closeButton.on('pointerdown', () => {
            container.destroy();
        });
    }
    
    placeVendor() {
        // Place vendor in a corner of the map
        const vendorX = this.biomeType === 'block' ? 
            Math.floor(CONFIG.GRID_WIDTH * 0.75) : 
            Math.floor(CONFIG.GRID_WIDTH * 0.25);
        const vendorY = Math.floor(CONFIG.GRID_HEIGHT * 0.25);
        
        const vendorObj = {
            type: 'vendor',
            x: vendorX,
            y: vendorY,
            walkable: true
        };
        
        const sprite = this.add.image(
            vendorX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            vendorY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            'npc-vendor'
        );
        sprite.setScale(CONFIG.SCALE.NPC_VENDOR);
        sprite.setDepth(50);
        
        const indicator = this.add.text(
            vendorX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            vendorY * CONFIG.TILE_SIZE - 10,
            '[E] SUPPLIER',
            {
                fontFamily: 'Press Start 2P',
                fontSize: '10px',
                color: CONFIG.COLORS.success,
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5).setDepth(51).setAlpha(0);
        
        vendorObj.sprite = sprite;
        vendorObj.indicator = indicator;
        this.worldObjects.push(vendorObj);
    }
    
    placeRelationshipNPCs() {
        // Place Shop Owner
        const shopX = Math.floor(CONFIG.GRID_WIDTH * 0.3);
        const shopY = Math.floor(CONFIG.GRID_HEIGHT * 0.7);
        
        const shopOwnerObj = {
            type: 'shopOwner',
            npcId: 'shopOwner',
            x: shopX,
            y: shopY,
            walkable: true
        };
        
        const shopSprite = this.add.image(
            shopX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            shopY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            'npc-shop-owner'
        );
        shopSprite.setScale(CONFIG.SCALE.NPC_SHOP_OWNER);
        shopSprite.setDepth(50);
        
        const shopIndicator = this.add.text(
            shopX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            shopY * CONFIG.TILE_SIZE - 15,
            '[E] SHOP OWNER',
            {
                fontFamily: 'Press Start 2P',
                fontSize: '9px',
                color: CONFIG.COLORS.success,
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5).setDepth(51).setAlpha(0);
        
        shopOwnerObj.sprite = shopSprite;
        shopOwnerObj.indicator = shopIndicator;
        this.worldObjects.push(shopOwnerObj);
        this.shopOwner = shopOwnerObj;
        
        // Place Corrupt Cop
        const copX = Math.floor(CONFIG.GRID_WIDTH * 0.7);
        const copY = Math.floor(CONFIG.GRID_HEIGHT * 0.3);
        
        const corruptCopObj = {
            type: 'corruptCop',
            npcId: 'corruptCop',
            x: copX,
            y: copY,
            walkable: true
        };
        
        const copSprite = this.add.image(
            copX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            copY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            'npc-corrupt-cop'
        );
        copSprite.setScale(CONFIG.SCALE.NPC_CORRUPT_COP);
        copSprite.setDepth(50);
        
        const copIndicator = this.add.text(
            copX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            copY * CONFIG.TILE_SIZE - 15,
            '[E] OFFICER',
            {
                fontFamily: 'Press Start 2P',
                fontSize: '9px',
                color: '#6699ff',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5).setDepth(51).setAlpha(0);
        
        corruptCopObj.sprite = copSprite;
        corruptCopObj.indicator = copIndicator;
        this.worldObjects.push(corruptCopObj);
        this.corruptCop = corruptCopObj;
    }
    
    placeWorkstation() {
        // Place workstation next to safehouse
        const workstationX = this.safehousePos.x - 1;
        const workstationY = this.safehousePos.y;
        
        const workstationObj = {
            type: 'workstation',
            x: workstationX,
            y: workstationY,
            walkable: true
        };
        
        const sprite = this.add.image(
            workstationX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            workstationY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            'workstation'
        );
        sprite.setScale(0.12);
        sprite.setDepth(50);
        
        const indicator = this.add.text(
            workstationX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            workstationY * CONFIG.TILE_SIZE - 10,
            '[E] PROCESS',
            {
                fontFamily: 'Press Start 2P',
                fontSize: '10px',
                color: CONFIG.COLORS.secondary,
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5).setDepth(51).setAlpha(0);
        
        workstationObj.sprite = sprite;
        workstationObj.indicator = indicator;
        this.worldObjects.push(workstationObj);
    }
    
    /**
     * Add pulsing animation to POI markers to make them discoverable
     */
    animatePOIMarkers() {
        this.worldObjects.forEach(obj => {
            if (obj.type === 'poi' && obj.marker) {
                this.tweens.add({
                    targets: obj.marker,
                    alpha: { from: 0.2, to: 0.5 },
                    scale: { from: 0.8, to: 1.2 },
                    duration: 1000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        });
    }
    
    placeSupplierNPCs() {
        // Get available suppliers from the system
        const availableSuppliers = this.supplierSystem.getAvailableSuppliers();
        
        if (!availableSuppliers || availableSuppliers.length === 0) {
                        return;
        }
        
        // Define area positions for each meeting area type
        const areaPositions = {
            'downtown': { x: Math.floor(CONFIG.GRID_WIDTH * 0.8), y: Math.floor(CONFIG.GRID_HEIGHT * 0.2) },
            'hood': { x: Math.floor(CONFIG.GRID_WIDTH * 0.2), y: Math.floor(CONFIG.GRID_HEIGHT * 0.8) },
            'industrial': { x: Math.floor(CONFIG.GRID_WIDTH * 0.7), y: Math.floor(CONFIG.GRID_HEIGHT * 0.7) },
            'skid-row': { x: Math.floor(CONFIG.GRID_WIDTH * 0.15), y: Math.floor(CONFIG.GRID_HEIGHT * 0.5) },
            'underground': { x: Math.floor(CONFIG.GRID_WIDTH * 0.5), y: Math.floor(CONFIG.GRID_HEIGHT * 0.9) },
            'chinatown': { x: Math.floor(CONFIG.GRID_WIDTH * 0.9), y: Math.floor(CONFIG.GRID_HEIGHT * 0.5) },
            'southside': { x: Math.floor(CONFIG.GRID_WIDTH * 0.3), y: Math.floor(CONFIG.GRID_HEIGHT * 0.15) }
        };
        
        // Place each supplier NPC at their meeting area
        availableSuppliers.forEach((supplier, index) => {
            const areaPos = areaPositions[supplier.meetingArea] || areaPositions['downtown'];
            
            // Offset each supplier slightly so they don't stack
            const offsetX = (index % 3) * 2 - 2;
            const offsetY = Math.floor(index / 3) * 2 - 1;
            
            let supplierX = areaPos.x + offsetX;
            let supplierY = areaPos.y + offsetY;
            
            // Clamp to map bounds
            supplierX = Math.max(2, Math.min(CONFIG.GRID_WIDTH - 3, supplierX));
            supplierY = Math.max(2, Math.min(CONFIG.GRID_HEIGHT - 3, supplierY));
            
            // Find a valid walkable spot
            let attempts = 0;
            while (attempts < 20 && (
                !this.worldMap[supplierY] || 
                !this.worldMap[supplierY][supplierX] || 
                !this.worldMap[supplierY][supplierX].walkable ||
                this.worldObjects.some(obj => obj.x === supplierX && obj.y === supplierY)
            )) {
                supplierX = areaPos.x + Math.floor(Math.random() * 3) - 1;
                supplierY = areaPos.y + Math.floor(Math.random() * 3) - 1;
                supplierX = Math.max(2, Math.min(CONFIG.GRID_WIDTH - 3, supplierX));
                supplierY = Math.max(2, Math.min(CONFIG.GRID_HEIGHT - 3, supplierY));
                attempts++;
            }
            
            if (attempts >= 20) return; // Skip if can't find valid spot
            
            // Check if a supplier sprite exists
            const spriteKey = `supplier-${supplier.id}`;
            const hasCustomSprite = this.textures.exists(spriteKey);
            
            // Create supplier NPC object
            const supplierObj = {
                type: 'supplier',
                supplierId: supplier.id,
                x: supplierX,
                y: supplierY,
                walkable: true,
                gangName: supplier.name,
                dangerLevel: supplier.dangerLevel
            };
            
            // Create sprite (use custom sprite if available, otherwise use a placeholder)
            const sprite = this.add.image(
                supplierX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                supplierY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                hasCustomSprite ? spriteKey : 'npc-vendor'
            );
            sprite.setScale(0.15);
            sprite.setDepth(50);
            
            // Tint based on gang color
            if (supplier.color) {
                sprite.setTint(Phaser.Display.Color.HexStringToColor(supplier.color).color);
            }
            
            // Add indicator showing supplier name
            const indicator = this.add.text(
                supplierX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                supplierY * CONFIG.TILE_SIZE - 15,
                `[E] ${supplier.name.toUpperCase()}`,
                {
                    fontFamily: 'Press Start 2P',
                    fontSize: '8px',
                    color: supplier.accentColor || CONFIG.COLORS.success,
                    stroke: '#000000',
                    strokeThickness: 3
                }
            ).setOrigin(0.5).setDepth(51).setAlpha(0);
            
            supplierObj.sprite = sprite;
            supplierObj.indicator = indicator;
            this.worldObjects.push(supplierObj);
            this.supplierNPCs.push(supplierObj);
        });
        
        // Update minimap
        if (this.minimap) {
            this.minimap.update();
        }
    }
    
    spawnDailyBuyers() {
        // Remove old buyers
        this.buyers.forEach(buyer => {
            if (buyer.sprite) buyer.sprite.destroy();
            if (buyer.indicator) buyer.indicator.destroy();
            const index = this.worldObjects.indexOf(buyer);
            if (index > -1) this.worldObjects.splice(index, 1);
        });
        this.buyers = [];
        
        // Get current hour for time-based spawning
        const currentHour = this.timeSystem ? this.timeSystem.getHour() : 12;
        const isNight = currentHour >= CONFIG.NIGHT_START_HOUR || currentHour < CONFIG.DAY_START_HOUR;
        
        // Spawn new buyers at random walkable locations
        for (let i = 0; i < CONFIG.BUYERS_PER_DAY; i++) {
            // Select customer type based on spawn rates
            const customerType = this.selectCustomerType(isNight);
            
            if (!customerType) continue;
            
            const customerConfig = CONFIG.CUSTOMER_TYPES[customerType];
            
            let attempts = 0;
            let buyerX, buyerY;
            
            // Find valid spawn location
            do {
                buyerX = Math.floor(Math.random() * (CONFIG.GRID_WIDTH - 4)) + 2;
                buyerY = Math.floor(Math.random() * (CONFIG.GRID_HEIGHT - 4)) + 2;
                attempts++;
            } while ((!this.worldMap[buyerY][buyerX].walkable || 
                     this.worldObjects.some(obj => obj.x === buyerX && obj.y === buyerY)) &&
                     attempts < 100);
            
            if (attempts >= 100) continue;
            
            // Get random dialog from customer type
            const dialog = customerConfig.dialog[Math.floor(Math.random() * customerConfig.dialog.length)];
            
            const buyerObj = {
                type: 'buyer',
                customerType: customerType,
                x: buyerX,
                y: buyerY,
                walkable: true,
                dialog: dialog,
                priceMultiplier: customerConfig.priceMultiplier,
                purchaseAmount: customerConfig.purchaseAmount,
                specialBehavior: customerConfig.specialBehavior,
                tipAmount: customerConfig.tipAmount || 0,
                qualityBonus: customerConfig.qualityBonus || 0,
                hiddenIdentity: customerConfig.hiddenIdentity || false,
                bribeCost: customerConfig.bribeCost || 0
            };
            
            // Determine sprite key based on customer type
            let spriteKey = 'npc-buyer';
            if (customerConfig.spriteType) {
                // Check if custom sprite exists
                const customSpriteKey = `npc-${customerConfig.spriteType}`;
                // Use custom if available, otherwise fallback to generic buyer
                spriteKey = customSpriteKey;
            }
            
            const sprite = this.add.image(
                buyerX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                buyerY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                spriteKey
            );
            sprite.setScale(0.15);
            sprite.setDepth(50);
            
            // Indicator text - hide identity for undercover cop
            let indicatorText = customerConfig.hiddenIdentity ? '[E] CUSTOMER' : `[E] ${customerConfig.name.toUpperCase()}`;
            
            const indicator = this.add.text(
                buyerX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                buyerY * CONFIG.TILE_SIZE - 10,
                indicatorText,
                {
                    fontFamily: 'Press Start 2P',
                    fontSize: '8px',
                    color: customerConfig.hiddenIdentity ? CONFIG.COLORS.text : CONFIG.COLORS.primary,
                    stroke: '#000000',
                    strokeThickness: 3
                }
            ).setOrigin(0.5).setDepth(51).setAlpha(0);
            
            buyerObj.sprite = sprite;
            buyerObj.indicator = indicator;
            buyerObj.spriteKey = spriteKey;
            this.worldObjects.push(buyerObj);
            this.buyers.push(buyerObj);
        }
        
        this.minimap.update();
    }
    
    /**
     * Select a customer type based on spawn rates
     * @param {boolean} isNight - Whether it's night time
     * @returns {string|null} - Customer type key or null
     */
    selectCustomerType(isNight) {
        const customerTypes = Object.keys(CONFIG.CUSTOMER_TYPES);
        
        // Build weighted pool
        const pool = [];
        
        customerTypes.forEach(type => {
            const config = CONFIG.CUSTOMER_TYPES[type];
            
            // Skip time-incompatible types
            if (config.timePreference === 'night' && !isNight) return;
            if (config.timePreference === 'day' && isNight) return;
            
            // Get weight based on spawn rate
            let weight = CONFIG.CUSTOMER_SPAWN_WEIGHTS[config.spawnRate] || 10;
            
            // Add to pool multiple times based on weight
            for (let i = 0; i < weight; i++) {
                pool.push(type);
            }
        });
        
        if (pool.length === 0) return null;
        
        // Random selection
        return pool[Math.floor(Math.random() * pool.length)];
    }
    
    /**
     * Show customer dialog in a floating message
     */
    showCustomerDialog(buyer) {
        if (!buyer.dialog) return;
        
        const { width, height } = this.scale;
        
        const dialogText = this.add.text(width / 2, height / 2 - 80, `"${buyer.dialog}"`, {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: CONFIG.COLORS.text,
            fontStyle: 'italic',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1000);
        
        // Fade out after 2 seconds
        this.tweens.add({
            targets: dialogText,
            alpha: 0,
            duration: 2000,
            delay: 1500,
            ease: 'Cubic.easeOut',
            onComplete: () => dialogText.destroy()
        });
    }
    
    spawnRival() {
        // Remove old rival if exists
        if (this.rival) {
            if (this.rival.sprite) this.rival.sprite.destroy();
            if (this.rival.indicator) this.rival.indicator.destroy();
            const index = this.worldObjects.indexOf(this.rival);
            if (index > -1) this.worldObjects.splice(index, 1);
        }
        
        this.rival = null;
        this.rivalDefeated = false;
        
        // Find valid spawn location away from player and safehouse
        let attempts = 0;
        let rivalX, rivalY;
        
        do {
            rivalX = Math.floor(Math.random() * (CONFIG.GRID_WIDTH - 4)) + 2;
            rivalY = Math.floor(Math.random() * (CONFIG.GRID_HEIGHT - 4)) + 2;
            
            const distFromPlayer = Phaser.Math.Distance.Between(
                this.playerState.gridX, this.playerState.gridY,
                rivalX, rivalY
            );
            
            const distFromSafehouse = Phaser.Math.Distance.Between(
                this.safehousePos.x, this.safehousePos.y,
                rivalX, rivalY
            );
            
            attempts++;
            
            // Valid if walkable (with bounds check), not occupied, and far enough from player and safehouse
            const rivalTile = this.worldMap[rivalY]?.[rivalX];
            if (rivalTile?.walkable &&
                !this.worldObjects.some(obj => obj.x === rivalX && obj.y === rivalY) &&
                distFromPlayer > 8 &&
                distFromSafehouse > 5) {
                break;
            }
        } while (attempts < 100);
        
        if (attempts >= 100) return; // Couldn't find valid spot
        
        const rivalObj = {
            type: 'rival',
            x: rivalX,
            y: rivalY,
            walkable: true
        };
        
        const sprite = this.add.image(
            rivalX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            rivalY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            'npc-rival'
        );
        sprite.setScale(0.13);
        sprite.setDepth(50);
        
        // Add warning indicator
        const indicator = this.add.text(
            rivalX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            rivalY * CONFIG.TILE_SIZE - 15,
            '!!! RIVAL !!!',
            {
                fontFamily: 'Press Start 2P',
                fontSize: '10px',
                color: CONFIG.COLORS.danger,
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5).setDepth(51);
        
        // Pulsing animation
        this.tweens.add({
            targets: indicator,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1
        });
        
        rivalObj.sprite = sprite;
        rivalObj.indicator = indicator;
        this.worldObjects.push(rivalObj);
        this.rival = rivalObj;
    }
    
    checkRivalProximity() {
        if (!this.rival || this.rivalDefeated) return;
        
        const dist = Phaser.Math.Distance.Between(
            this.playerState.gridX, this.playerState.gridY,
            this.rival.x, this.rival.y
        );
        
        if (dist <= CONFIG.RIVAL_PROXIMITY_TRIGGER) {
            // Trigger encounter
            this.triggerRivalEncounter();
        }
    }
    
    /**
     * Initialize player class based on highest stat and grant starting skills
     */
    initializeClassAndSkills() {
        const { stats } = this.playerState;
        
        // Determine class based on highest stat
        if (stats.intuition >= stats.ability && stats.intuition >= stats.luck) {
            this.playerState.classType = 'intuition';
        } else if (stats.ability >= stats.intuition && stats.ability >= stats.luck) {
            this.playerState.classType = 'ability';
        } else {
            this.playerState.classType = 'luck';
        }
        
        // Initialize skill tree with starting skills
        this.skillTree.initSkillTree(this.playerState.classType);
        
        // Initialize level system
        this.levelSystem.initPlayerLevel(this.playerState);
        
            }
    
    triggerRivalEncounter() {
        // Prevent movement during encounter
        this.playerState.isMoving = true;
        
        // NEW: Use real combat instead of RPS
        const enemyType = this.rival.type || 'gangster';
        const enemyData = {
            type: enemyType,
            name: this.rival.name || 'Rival',
            hp: ENEMY_TYPES[enemyType].hp,
            damage: ENEMY_TYPES[enemyType].damage
        };
        
        this.combatScene.startCombat(enemyData, 
            // Victory callback
            (playerWon) => {
                this.playerState.isMoving = false;
                
                if (playerWon) {
                    // Grant money reward
                    const cashReward = CONFIG.RIVAL_CASH_DROP_MIN + 
                        Math.floor(Math.random() * (CONFIG.RIVAL_CASH_DROP_MAX - CONFIG.RIVAL_CASH_DROP_MIN));
                    this.playerState.money += cashReward;
                    this.showFloatingText(`Victory! Found $${cashReward}`, CONFIG.COLORS.success);
                    this.checkRankChange();
                    
                    // Remove rival from world
                    if (this.rival.sprite) this.rival.sprite.destroy();
                    if (this.rival.indicator) this.rival.indicator.destroy();
                    const index = this.worldObjects.indexOf(this.rival);
                    if (index > -1) this.worldObjects.splice(index, 1);
                    
                    this.rivalDefeated = true;
                    if (this.hud) this.hud.update();
                }
            },
            // Defeat callback
            (playerWon) => {
                this.playerState.isMoving = false;
                
                if (!playerWon) {
                    // Apply hustle penalty
                    const hustleLoss = Math.floor(this.playerState.hustle * CONFIG.RIVAL_HUSTLE_PENALTY);
                    this.playerState.hustle = Math.max(0, this.playerState.hustle - hustleLoss);
                    this.showFloatingText(`Defeated! -${hustleLoss} Hustle`, CONFIG.COLORS.danger);
                    
                    // Check if player passed out
                    if (this.playerState.hustle <= 0) {
                        this.passOut();
                    }
                    if (this.hud) this.hud.update();
                }
            }
        );
    }
    
    sellToBuyer(buyer) {
        if (this.playerState.product <= 0) {
            this.showFloatingText('No Product to sell!', CONFIG.COLORS.danger);
            return;
        }
        
        const customerConfig = buyer.customerType ? CONFIG.CUSTOMER_TYPES[buyer.customerType] : null;
        
        // Show customer dialog
        this.showCustomerDialog(buyer);
        
        // Check for undercover cop arrest attempt
        if (buyer.customerType === 'cop') {
            this.handleCopEncounter(buyer);
            return;
        }
        
        // Check for steal behavior (Junkie)
        if (buyer.specialBehavior === 'steal') {
            const stealChance = customerConfig?.stealChance || 0.15;
            if (Math.random() < stealChance) {
                // Junkie steals from player!
                const stolenAmount = Math.min(2, this.playerState.product);
                this.playerState.product -= stolenAmount;
                
                // Run away!
                this.removeBuyer(buyer);
                if (this.hud) this.hud.update();
                this.minimap.update();
                
                this.showFloatingText(`${customerConfig.name} stole ${stolenAmount} product and ran!`, CONFIG.COLORS.danger);
                
                // Add some heat from the theft
                this.playerState.heat = Math.min(CONFIG.MAX_HEAT, this.playerState.heat + 10);
                if (this.hud) this.hud.update();
                return;
            }
        }
        
        // Determine what drug is being sold (needed for demand calculation)
        const drugs = this.playerState.drugs || {};
        let soldDrug = null;
        
        // Find first non-zero drug in inventory to determine what's being sold
        for (const [drugName, amount] of Object.entries(drugs)) {
            if (amount > 0) {
                soldDrug = drugName;
                break;
            }
        }
        
        // Fallback: check legacy product (assume it's Weed if player has any)
        if (!soldDrug && this.playerState.product > 0) {
            soldDrug = 'Weed'; // Default assumption
        }
        
        // Calculate base price
        const heatPenalty = this.playerState.heat * CONFIG.HEAT_PENALTY_PER_POINT;
        const priceMultiplier = 1 - heatPenalty;
        const droughtMultiplier = this.calendarSystem.getProductSellMultiplier();
        
        // NEW: Get neighborhood demand multiplier (based on sales history)
        const demandMultiplier = this.getNeighborhoodDemandMultiplier(soldDrug);
        
        // Apply customer type price multiplier
        let customerPriceMult = buyer.priceMultiplier || 1.0;
        
        // Check for quality bonus (Party Guy pays extra for quality)
        if (buyer.specialBehavior === 'quality') {
            const qualityBonus = buyer.qualityBonus || 0.2;
            customerPriceMult += qualityBonus;
        }
        
        // Check for preferred drug bonus (using config value if player sells what buyer wants)
        if (buyer.preferredDrug && buyer.preferredDrugBonus) {
            if (soldDrug === buyer.preferredDrug) {
                customerPriceMult *= (1 + buyer.preferredDrugBonus);
            }
        }
        
        // Apply player's price bonus (gold chain equipment)
        const playerPriceBonus = this.getPriceBonus();
        
        const finalPrice = Math.floor(
            CONFIG.PRODUCT_SELL_PRICE * 
            priceMultiplier * 
            droughtMultiplier * 
            demandMultiplier *  // NEW: Apply neighborhood demand
            customerPriceMult * 
            (1 + playerPriceBonus)
        );
        
        // Calculate how much to sell (customer's purchase amount or player's stock)
        const amountToSell = Math.min(buyer.purchaseAmount || 1, this.playerState.product);
        const totalEarned = finalPrice * amountToSell;
        
        // Apply sale
        this.playerState.money += totalEarned;
        this.playerState.product -= amountToSell;
        this.checkRankChange();
        
        // NEW: Track sale in neighborhood history for demand system
        this.updateNeighborhoodHistory(soldDrug, amountToSell);
        
        // Quest: Check progress on money gain
        if (this.questSystem) {
            this.questSystem.checkChapterProgress();
        }
        
        // NEW: Grant XP for sale
        if (this.levelSystem) {
            this.levelSystem.grantSaleXP(amountToSell);
        }
        
        // Handle tip behavior (Old Head)
        if (buyer.specialBehavior === 'tip') {
            const tipChance = customerConfig?.tipChance || 0.25;
            const tipAmount = buyer.tipAmount || 50;
            if (Math.random() < tipChance) {
                this.playerState.money += tipAmount;
                this.showFloatingText(`+$${totalEarned} (incl. $${tipAmount} tip!)`, CONFIG.COLORS.success);
                this.checkRankChange();
            } else {
                this.showFloatingText(`Sold! +$${totalEarned}`, CONFIG.COLORS.success);
            }
        } else {
            this.showFloatingText(`Sold! +$${totalEarned}`, CONFIG.COLORS.success);
        }
        
        // NEW: Show demand indicator (low demand = red, high demand = green)
        const demandMult = this.getNeighborhoodDemandMultiplier(soldDrug);
        if (demandMult > 1.1) {
            this.showFloatingText('📈 High Demand!', '#00ff00'); // Green for high demand = higher prices
        } else if (demandMult < 0.9) {
            this.showFloatingText('📉 Market Saturated', '#ff4444'); // Red for low demand = lower prices
        }
        
        // Add heat for dealing on the street
        const neighborhoodBonus = this.playerState.neighborhoodBonus;
        const heatResistance = neighborhoodBonus?.heatResistance || 0;
        const heatGainMultiplier = this.calendarSystem.getHeatMultiplier();
        const baseHeatGain = CONFIG.HEAT_GAIN_PER_SALE * heatGainMultiplier;
        const heatGain = Math.floor(baseHeatGain * (1 - heatResistance));
        this.playerState.heat = Math.min(CONFIG.MAX_HEAT, 
            this.playerState.heat + heatGain);
        
        // Riverside Police: Add suspicion from sale
        // Being seen making deals increases police interest
        if (this.riversidePolice) {
            const actionType = this.playerState.heat > 50 ? 'witnessed_sale' : 'high_heat';
            this.riversidePolice.addSuspicionFromAction(actionType, 3);
        }
        
        // Remove buyer after transaction
        this.removeBuyer(buyer);
        
        if (this.hud) this.hud.update();
        this.minimap.update();
        
        // Heat warning message
        if (this.playerState.heat > CONFIG.HEAT_THRESHOLD_POLICE / 2) {
            this.showFloatingText(`Heat: ${this.playerState.heat}%`, '#ff9900');
        }
    }
    
    /**
     * Handle undercover cop encounter
     */
    handleCopEncounter(buyer) {
        // Check if player can bribe the cop
        const bribeCost = buyer.bribeCost || 500;
        
        // Determine if cop will bust - more likely in high heat
        const bustChance = Math.min(0.8, this.playerState.heat / 100);
        
        if (this.playerState.money >= bribeCost && Math.random() > bustChance * 0.5) {
            // Offer bribe
            this.playerState.money -= bribeCost;
            this.playerState.heat = Math.max(0, this.playerState.heat - 30);
            this.removeBuyer(buyer);
            if (this.hud) this.hud.update();
            this.minimap.update();
            this.showFloatingText(`Undercover cop took your bribe! -$${bribeCost}, Heat -30`, '#6699ff');
        } else if (Math.random() < bustChance) {
            // Busted!
            this.removeBuyer(buyer);
            if (this.hud) this.hud.update();
            this.minimap.update();
            
            // Trigger arrest
            this.playerState.isMoving = true;
            this.policeEncounterUI.open((playerEscaped) => {
                this.playerState.isMoving = false;
                if (!playerEscaped) {
                    // Lose product and extra cash
                    const productLost = Math.floor(this.playerState.product * 0.5);
                    const cashLost = Math.floor(this.playerState.money * 0.3);
                    this.playerState.product -= productLost;
                    this.playerState.money -= cashLost;
                    this.playerState.heat = Math.min(CONFIG.MAX_HEAT, this.playerState.heat + 30);
                    
                    // Riverside Police: Major suspicion increase from being busted
                    if (this.riversidePolice) {
                        this.riversidePolice.addSuspicionFromAction('high_heat', 15);
                    }
                    
                    this.showFloatingText(`BUSTED! Lost ${productLost} product, $${cashLost}`, CONFIG.COLORS.danger);
                    if (this.hud) this.hud.update();
                }
            });
        } else {
            // Cop buys but doesn't bust (low heat)
            const heatPenalty = this.playerState.heat * CONFIG.HEAT_PENALTY_PER_POINT;
            const droughtMultiplier = this.calendarSystem.getProductSellMultiplier();
            const finalPrice = Math.floor(
                CONFIG.PRODUCT_SELL_PRICE * (1 - heatPenalty) * droughtMultiplier
            );
            
            const amountToSell = Math.min(buyer.purchaseAmount || 2, this.playerState.product);
            const totalEarned = finalPrice * amountToSell;
            
            this.playerState.money += totalEarned;
            this.playerState.product -= amountToSell;
            this.checkRankChange();
            
            // Quest: Check progress on money gain
            if (this.questSystem) {
                this.questSystem.checkChapterProgress();
            }
            
            this.removeBuyer(buyer);
            if (this.hud) this.hud.update();
            this.minimap.update();
            this.showFloatingText(`Sold to undercover! +$${totalEarned}`, CONFIG.COLORS.success);
            
            // Small heat gain from dealing
            this.playerState.heat = Math.min(CONFIG.MAX_HEAT, this.playerState.heat + 8);
            if (this.hud) this.hud.update();
        }
    }
    
    /**
     * Remove a buyer from the world
     */
    removeBuyer(buyer) {
        if (buyer.sprite) buyer.sprite.destroy();
        if (buyer.indicator) buyer.indicator.destroy();
        
        const objIndex = this.worldObjects.indexOf(buyer);
        if (objIndex > -1) this.worldObjects.splice(objIndex, 1);
        
        const buyerIndex = this.buyers.indexOf(buyer);
        if (buyerIndex > -1) this.buyers.splice(buyerIndex, 1);
    }
    
    showFloatingText(text, color) {
        const { width, height } = this.scale;
        
        const floatText = this.add.text(width / 2, height / 2 + 100, text, {
            fontFamily: 'Press Start 2P',
            fontSize: '16px',
            color: color,
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1000);
        
        this.tweens.add({
            targets: floatText,
            y: height / 2 + 50,
            alpha: 0,
            duration: 2000,
            ease: 'Cubic.easeOut',
            onComplete: () => floatText.destroy()
        });
    }
    
    // ==========================================
    // BUILDING ENTRY & INTERIOR SYSTEM
    // ==========================================
    
    // Interior map templates for different POI types
    INTERIOR_MAPS = {
        'Abandoned Hotel': {
            name: 'Abandoned Hotel',
            tiles: 'tile-dirty-floor',
            walls: 'tile-wall-brick',
            objects: ['bed', 'desk', 'trash'],
            size: { width: 8, height: 8 }
        },
        'Burned-out Store': {
            name: 'Burned-out Store',
            tiles: 'tile-concrete-cracked',
            walls: 'tile-wall-brick',
            objects: ['rubble', 'ash', 'debris'],
            size: { width: 6, height: 6 }
        },
        'Old Pharmacy': {
            name: 'Old Pharmacy',
            tiles: 'tile-wood-floor',
            walls: 'tile-wall-interior',
            objects: ['shelf', 'counter', 'trash'],
            size: { width: 6, height: 6 }
        },
        'Defunct Factory': {
            name: 'Defunct Factory',
            tiles: 'tile-concrete-cracked',
            walls: 'tile-wall-brick',
            objects: ['machine', 'crate', 'barrel'],
            size: { width: 10, height: 8 }
        },
        'Abandoned Warehouse': {
            name: 'Abandoned Warehouse',
            tiles: 'tile-concrete-cracked',
            walls: 'tile-wall-brick',
            objects: ['crate', 'pallet', 'forklift'],
            size: { width: 12, height: 10 }
        },
        'Old Laundromat': {
            name: 'Old Laundromat',
            tiles: 'tile-wood-floor',
            walls: 'tile-wall-interior',
            objects: ['washer', 'dryer', 'folding-table'],
            size: { width: 6, height: 5 }
        },
        'Auto Shop': {
            name: 'Auto Shop',
            tiles: 'tile-concrete-cracked',
            walls: 'tile-wall-brick',
            objects: ['car-lift', 'toolbox', 'tire'],
            size: { width: 8, height: 7 }
        },
        'Secret Door': {
            name: 'Shade\'s Tunnels',
            tiles: 'tile-dirty-floor',
            walls: 'tile-wall-brick',
            objects: ['torch', 'rubble', 'web'],
            size: { width: 8, height: 10 }
        },
        'Sewer Entrance': {
            name: 'The Maw',
            tiles: 'tile-dirty-floor',
            walls: 'tile-wall-brick',
            objects: [' grate', 'water', 'rubble'],
            size: { width: 8, height: 12 }
        },
        'Rooftop Access': {
            name: 'Rooftop',
            tiles: 'tile-concrete-cracked',
            walls: 'tile-wall-brick',
            objects: ['antenna', 'ac-unit', 'water-tank'],
            size: { width: 8, height: 6 }
        },
        '24/7 Diner': {
            name: '24/7 Diner',
            tiles: 'tile-wood-floor',
            walls: 'tile-wall-interior',
            objects: ['table', 'counter', 'jukebox'],
            size: { width: 8, height: 6 }
        },
        'Pawn Shop': {
            name: 'Pawn Shop',
            tiles: 'tile-wood-floor',
            walls: 'tile-wall-brick',
            objects: ['display-case', 'counter', 'safe'],
            size: { width: 6, height: 6 }
        },
        'Hidden Alley': {
            name: 'Hidden Alley',
            tiles: 'tile-alley',
            walls: 'tile-wall-brick',
            objects: ['dumpster', 'boxes', 'trash'],
            size: { width: 4, height: 8 }
        },
        'default': {
            name: 'Interior',
            tiles: 'tile-dirty-floor',
            walls: 'tile-wall-brick',
            objects: ['crate', 'trash'],
            size: { width: 6, height: 6 }
        }
    };
    
    /**
     * Enter a building through a POI
     */
    enterBuilding(poiObj) {
        // Get interior map template
        const template = this.INTERIOR_MAPS[poiObj.poiKey] || this.INTERIOR_MAPS['default'];
        
        // Store outdoor state for return
        this.outdoorState = {
            map: this.worldMap,
            objects: this.worldObjects,
            gridX: this.playerState.gridX,
            gridY: this.playerState.gridY,
            biomeType: this.biomeType,
            neighborhood: this.playerState.neighborhood
        };
        
        // Show transition animation
        this.transitionToInterior(template, poiObj);
    }
    
    /**
     * Transition animation from outdoor to indoor
     */
    transitionToInterior(template, poiObj) {
        const { width, height } = this.scale;
        
        // Create fade to black overlay
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000);
        overlay.setScrollFactor(0).setDepth(2000);
        
        // Fade in
        this.tweens.add({
            targets: overlay,
            alpha: 1,
            duration: 500,
            onComplete: () => {
                // Hide outdoor world
                this.cameras.main.setAlpha(0);
                
                // Create interior
                this.createInterior(template, poiObj);
                
                // Fade out
                this.time.delayedCall(300, () => {
                    this.tweens.add({
                        targets: overlay,
                        alpha: 0,
                        duration: 500,
                        onComplete: () => {
                            overlay.destroy();
                            this.cameras.main.setAlpha(1);
                        }
                    });
                });
            }
        });
        
        // Show entrance message
        this.time.delayedCall(600, () => {
            this.showFloatingText(`Entering: ${template.name}`, CONFIG.COLORS.primary);
        });
    }
    
    /**
     * Create interior map
     */
    createInterior(template, poiObj) {
        // Clear outdoor objects
        this.worldMap = [];
        this.worldObjects = [];
        
        const interiorWidth = template.size.width;
        const interiorHeight = template.size.height;
        
        // Create interior tiles
        for (let y = 0; y < interiorHeight; y++) {
            this.worldMap[y] = [];
            for (let x = 0; x < interiorWidth; x++) {
                // Border walls
                const isWall = x === 0 || x === interiorWidth - 1 || 
                              y === 0 || y === interiorHeight - 1;
                
                const tileType = isWall ? template.walls : template.tiles;
                
                const tile = this.add.image(
                    x * CONFIG.TILE_SIZE,
                    y * CONFIG.TILE_SIZE,
                    tileType
                );
                tile.setOrigin(0, 0);
                tile.setDisplaySize(CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                
                this.worldMap[y][x] = {
                    type: tileType,
                    sprite: tile,
                    walkable: !isWall
                };
            }
        }
        
        // Add random interior objects
        this.addInteriorObjects(template, interiorWidth, interiorHeight);
        
        // Add exit point (where player enters)
        const exitX = Math.floor(interiorWidth / 2);
        const exitY = interiorHeight - 2;
        this.worldMap[exitY][exitX].walkable = true;
        
        // Add exit indicator
        const exitIndicator = this.add.text(
            exitX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            exitY * CONFIG.TILE_SIZE - 10,
            '[E] EXIT',
            {
                fontFamily: 'Press Start 2P',
                fontSize: '10px',
                color: CONFIG.COLORS.success,
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5).setDepth(51);
        
        // Store exit info
        this.interiorExit = {
            x: exitX,
            y: exitY,
            indicator: exitIndicator,
            poiObj: poiObj
        };
        
        // Position player at entrance
        this.playerState.gridX = Math.floor(interiorWidth / 2);
        this.playerState.gridY = interiorHeight - 3;
        
        // Update player sprite position
        this.playerSprite.x = this.playerState.gridX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        this.playerSprite.y = this.playerState.gridY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        
        // Track we're indoors
        this.isIndoor = true;
        this.currentInterior = template;
        
        // Update minimap if exists
        if (this.minimap) {
            this.minimap.setVisible(false);
        }
        
        // Get scale dimensions
        const { width, height } = this.scale;
        
        // Add [E] Exit indicator always visible indoors
        this.interactionHintText = this.add.text(
            width / 2, height - 50,
            '[E] Exit Building',
            {
                fontFamily: 'Press Start 2P',
                fontSize: '14px',
                color: CONFIG.COLORS.success
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(100);
    }
    
    /**
     * Add random objects to interior
     */
    addInteriorObjects(template, width, height) {
        const numObjects = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < numObjects; i++) {
            const x = Math.floor(Math.random() * (width - 2)) + 1;
            const y = Math.floor(Math.random() * (height - 2)) + 1;
            
            // Skip if not walkable or occupied
            if (!this.worldMap[y][x].walkable) continue;
            if (Math.abs(x - width/2) < 2 && y > height - 3) continue; // Near exit
            
            // Mark as non-walkable (obstacle)
            this.worldMap[y][x].walkable = false;
            
            // Add simple crate/barrel sprite placeholder
            const objSprite = this.add.rectangle(
                x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                CONFIG.TILE_SIZE * 0.6,
                CONFIG.TILE_SIZE * 0.6,
                0x8B4513
            );
            objSprite.setDepth(50);
        }
    }
    
    /**
     * Exit building and return to outdoor
     */
    exitBuilding() {
        if (!this.isIndoor || !this.outdoorState) return;
        
        const { width, height } = this.scale;
        
        // Create fade overlay
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000);
        overlay.setScrollFactor(0).setDepth(2000);
        
        this.tweens.add({
            targets: overlay,
            alpha: 1,
            duration: 500,
            onComplete: () => {
                // Clean up interior
                this.cleanupInterior();
                
                // Restore outdoor state
                this.worldMap = this.outdoorState.map;
                this.worldObjects = this.outdoorState.objects;
                this.playerState.gridX = this.outdoorState.gridX;
                this.playerState.gridY = this.outdoorState.gridY;
                this.biomeType = this.outdoorState.biomeType;
                this.playerState.neighborhood = this.outdoorState.neighborhood;
                
                // Update player position
                this.playerSprite.x = this.playerState.gridX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
                this.playerSprite.y = this.playerState.gridY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
                
                // Show world again
                this.cameras.main.setAlpha(1);
                
                // Fade out
                this.tweens.add({
                    targets: overlay,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => {
                        overlay.destroy();
                    }
                });
                
                this.showFloatingText('Exited to streets', CONFIG.COLORS.success);
                
                // Show minimap again
                if (this.minimap) {
                    this.minimap.setVisible(true);
                }
            }
        });
    }
    
    /**
     * Clean up interior resources
     */
    cleanupInterior() {
        // Destroy interior sprites
        for (let y = 0; y < this.worldMap.length; y++) {
            for (let x = 0; x < this.worldMap[y].length; x++) {
                if (this.worldMap[y][x].sprite) {
                    this.worldMap[y][x].sprite.destroy();
                }
            }
        }
        
        // Remove exit indicator
        if (this.interiorExit && this.interiorExit.indicator) {
            this.interiorExit.indicator.destroy();
        }
        
        // Remove interaction hint
        if (this.interactionHintText) {
            this.interactionHintText.destroy();
        }
        
        this.isIndoor = false;
        this.currentInterior = null;
        this.interiorExit = null;
    }
    
    /**
     * Check for exit interaction when indoors
     */
    checkInteriorExit() {
        if (!this.isIndoor || !this.interiorExit) return false;
        
        const dist = Phaser.Math.Distance.Between(
            this.playerState.gridX, this.playerState.gridY,
            this.interiorExit.x, this.interiorExit.y
        );
        
        return dist <= 1;
    }
    
    // ==========================================
    // STATUS EFFECT SYSTEM
    // ==========================================
    
    /**
     * Apply a status effect to the player
     * @param {string} statusKey - Key from CONFIG.STATUS_EFFECTS
     * @param {number} duration - Override duration (optional)
     */
    applyStatus(statusKey, duration = null) {
        const statusConfig = CONFIG.STATUS_EFFECTS[statusKey];
        if (!statusConfig) {
            console.warn(`Unknown status effect: ${statusKey}`);
            return false;
        }
        
        const statuses = this.playerState.activeStatuses;
        
        // Check for mutually exclusive statuses
        if (statusConfig.mutuallyExclusive) {
            for (const exclusiveKey of statusConfig.mutuallyExclusive) {
                if (statuses[exclusiveKey]) {
                    // Remove the exclusive status first
                    delete statuses[exclusiveKey];
                }
            }
        }
        
        // Set the duration (use config default or override)
        const actualDuration = duration !== null ? duration : statusConfig.duration;
        
        // For stackable statuses like bleeding, increment stack count
        if (statusConfig.stackable) {
            if (!statuses[statusKey]) {
                statuses[statusKey] = { duration: actualDuration, stacks: 1 };
            } else {
                statuses[statusKey].stacks += 1;
                statuses[statusKey].duration = Math.max(statuses[statusKey].duration, actualDuration);
            }
        } else {
            statuses[statusKey] = { duration: actualDuration, stacks: 1 };
        }
        
        // Show status applied message
        const icon = statusConfig.icon || '';
        this.showFloatingText(`${icon} ${statusConfig.name} applied!`, statusConfig.color);
        
        // Update HUD status display
        if (this.hud) {
            this.hud.updateStatusDisplay();
        }
        
        return true;
    }
    
    /**
     * Update all status effects (called each turn)
     * Handles duration countdown and periodic damage
     */
    updateStatusEffects() {
        const statuses = this.playerState.activeStatuses;
        const keys = Object.keys(statuses);
        
        if (keys.length === 0) return;
        
        for (const statusKey of keys) {
            const status = statuses[statusKey];
            const config = CONFIG.STATUS_EFFECTS[statusKey];
            
            if (!config) continue;
            
            // Apply damage per turn for damaging statuses
            let damage = 0;
            
            if (config.damagePerTurn) {
                damage += config.damagePerTurn * (status.stacks || 1);
            }
            
            // Apply immediate damage
            if (damage > 0) {
                // Check defense reduction from "On Fire" status
                let defenseReduction = 0;
                if (statuses.onFire && CONFIG.STATUS_EFFECTS.onFire.defenseReduction) {
                    defenseReduction = CONFIG.STATUS_EFFECTS.onFire.defenseReduction;
                }
                
                const actualDamage = Math.floor(damage * (1 - defenseReduction));
                // Apply damage to player HP
                this.playerState.playerHP = Math.max(0, this.playerState.playerHP - actualDamage);
                                
                // Check for death from status damage
                if (this.playerState.playerHP <= 0) {
                    this.handlePlayerDeath();
                }
            }
            
            // Decrement duration
            status.duration -= 1;
            
            // Remove expired statuses
            if (status.duration <= 0) {
                delete statuses[statusKey];
                this.showFloatingText(`${config.icon} ${config.name} wore off!`, config.color);
            }
        }
        
        // Update HUD
        if (this.hud) {
            this.hud.updateStatusDisplay();
        }
    }
    
    /**
     * Check if player has a specific status effect
     * @param {string} statusKey 
     * @returns {boolean}
     */
    hasStatus(statusKey) {
        return !!this.playerState.activeStatuses[statusKey];
    }
    
    /**
     * Get movement speed multiplier based on status effects
     * @returns {number} - Speed multiplier (1 = normal)
     */
    getMovementSpeedMultiplier() {
        let multiplier = 1;
        
        // Check for Poisoned speed reduction
        if (this.playerState.activeStatuses.poisoned) {
            const config = CONFIG.STATUS_EFFECTS.poisoned;
            if (config.speedReduction) {
                multiplier *= config.speedReduction;
            }
        }
        
        // Check for Slowed
        if (this.playerState.activeStatuses.slowed) {
            const config = CONFIG.STATUS_EFFECTS.slowed;
            if (config.speedMultiplier) {
                multiplier *= config.speedMultiplier;
            }
        }
        
        return multiplier;
    }
    
    /**
     * Get damage multiplier from status effects (for taking damage)
     * @returns {number} - Damage multiplier (1 = normal)
     */
    getDamageTakenMultiplier() {
        let multiplier = 1;
        
        // Check for Stunned vulnerability
        if (this.playerState.activeStatuses.stunned) {
            const config = CONFIG.STATUS_EFFECTS.stunned;
            if (config.vulnerabilityMultiplier) {
                multiplier *= config.vulnerabilityMultiplier;
            }
        }
        
        // Check for Frozen extra damage from next hit
        const frozenStatus = this.playerState.activeStatuses.frozen;
        if (frozenStatus && frozenStatus.duration > 0) {
            const config = CONFIG.STATUS_EFFECTS.frozen;
            if (config.extraDamageMultiplier) {
                multiplier *= config.extraDamageMultiplier;
            }
            // Remove frozen after taking damage (one-time extra damage)
            delete this.playerState.activeStatuses.frozen;
            this.showFloatingText('❄️ Frozen shattered!', config.color);
            if (this.hud) this.hud.updateStatusDisplay();
        }
        
        return multiplier;
    }
    
    // ==========================================
    // SKILL SYSTEM
    // ==========================================
    
    /**
     * Use a player skill that applies a status effect
     * @param {string} skillKey - Key from CONFIG.PLAYER_SKILLS
     * @returns {boolean} - Success
     */
    useSkill(skillKey) {
        const skill = CONFIG.PLAYER_SKILLS[skillKey];
        if (!skill) {
            console.warn(`Unknown skill: ${skillKey}`);
            return false;
        }
        
        // Check if skill is unlocked
        if (!this.playerState.unlockedSkills.includes(skillKey)) {
            this.showFloatingText(`Skill not unlocked: ${skill.name}`, CONFIG.COLORS.danger);
            return false;
        }
        
        // Check AP cost (simplified - could add AP system later)
        // For now, skills are free to use once unlocked
        
        // Apply the status effect
        this.applyStatus(skill.statusEffect, skill.statusDuration);
        
        // Show skill usage
        this.showFloatingText(`${skill.name}!`, CONFIG.COLORS.primary);
        
        return true;
    }
    
    /**
     * Unlock a skill using ability points
     * @param {string} skillKey 
     * @returns {boolean}
     */
    unlockSkill(skillKey) {
        const skill = CONFIG.PLAYER_SKILLS[skillKey];
        if (!skill) return false;
        
        // Already unlocked?
        if (this.playerState.unlockedSkills.includes(skillKey)) {
            this.showFloatingText('Skill already unlocked!', CONFIG.COLORS.textDark);
            return false;
        }
        
        // Check ability points
        if (this.playerState.abilityPoints < skill.unlockCost) {
            this.showFloatingText(`Need ${skill.unlockCost} AP to unlock ${skill.name}`, CONFIG.COLORS.danger);
            return false;
        }
        
        // Deduct AP and unlock
        this.playerState.abilityPoints -= skill.unlockCost;
        this.playerState.unlockedSkills.push(skillKey);
        
        this.showFloatingText(`Unlocked ${skill.name}!`, CONFIG.COLORS.success);
        if (this.hud) this.hud.update();
        
        return true;
    }
    
    /**
     * Apply enemy skill (status effect) to player
     * @param {string} enemyType - 'police' or 'rival'
     * @param {string} skillKey - Key from CONFIG.ENEMY_SKILLS
     */
    applyEnemySkill(enemyType, skillKey) {
        const skill = CONFIG.ENEMY_SKILLS[skillKey];
        if (!skill) {
            console.warn(`Unknown enemy skill: ${skillKey}`);
            return;
        }
        
        // Accuracy check
        if (skill.accuracy && Math.random() > skill.accuracy) {
            this.showFloatingText(`${enemyType === 'police' ? 'Police' : 'Rival'} missed!`, CONFIG.COLORS.success);
            return;
        }
        
        // Apply damage
        if (skill.damage > 0) {
            const damageMult = this.getDamageTakenMultiplier();
            const actualDamage = Math.floor(skill.damage * damageMult);
            // Would apply to player HP here
                    }
        
        // Apply status effect
        if (skill.statusEffect) {
            this.applyStatus(skill.statusEffect, skill.statusDuration);
        }
    }
    
    onPlayerMove() {
        // Update status effects (tick down duration, apply damage)
        this.updateStatusEffects();
        
        // Drain hustle
        this.playerState.hustle -= CONFIG.HUSTLE_DRAIN_PER_MOVE;
        
        // Check for hustle depletion
        if (this.playerState.hustle <= 0) {
            this.passOut();
            return;
        }
        
        // Check if player is at neighborhood border (for world navigation)
        this.checkNeighborhoodBorder();
        
        // Advance time
        this.timeSystem.advanceTime(CONFIG.MINUTES_PER_MOVE);
        
        // Update UI
        if (this.hud) this.hud.update();
        this.minimap.update();
    }
    
    passOut() {
        this.playerState.isMoving = true; // Prevent movement during passout
        
        // Calculate penalty
        const penalty = Math.floor(this.playerState.money * CONFIG.HUSTLE_PASSOUT_PENALTY);
        this.playerState.money = Math.max(0, this.playerState.money - penalty);
        
        // Add heat if holding product (with neighborhood-based heat resistance)
        let heatGained = 0;
        if (this.playerState.product > 0) {
            const neighborhoodBonus = this.playerState.neighborhoodBonus;
            const heatResistance = neighborhoodBonus?.heatResistance || 0;
            const baseHeatGain = CONFIG.HEAT_GAIN_PASSOUT;
            heatGained = Math.floor(baseHeatGain * (1 - heatResistance));
            this.playerState.heat = Math.min(CONFIG.MAX_HEAT, this.playerState.heat + heatGained);
            
            // Riverside Police: Being caught unconscious with product increases suspicion
            if (this.riversidePolice) {
                this.riversidePolice.addSuspicionFromAction('high_heat', 8);
            }
        }
        
        // Show passout message
        const { width, height } = this.scale;
        
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
        overlay.setScrollFactor(0);
        overlay.setDepth(1000);
        
        const messageText = this.add.text(width / 2, height / 2 - 50, 'PASSED OUT', {
            fontFamily: 'Press Start 2P',
            fontSize: '48px',
            color: CONFIG.COLORS.danger,
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);
        
        let penaltyMsg = penalty > 0 ? `Lost $${penalty} while unconscious` : 'Woke up broke on the streets';
        if (heatGained > 0) {
            penaltyMsg += `\nCaught with Product! Heat +${heatGained}`;
        }
        
        const penaltyText = this.add.text(width / 2, height / 2 + 30, penaltyMsg, {
            fontFamily: 'Press Start 2P',
            fontSize: '18px',
            color: CONFIG.COLORS.text,
            align: 'center'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);
        
        // Wait, then advance to next day
        this.time.delayedCall(3000, () => {
            overlay.destroy();
            messageText.destroy();
            penaltyText.destroy();
            
            // Reset hustle and advance to next morning
            this.playerState.hustle = CONFIG.MAX_HUSTLE;
            this.timeSystem.advanceToNextDay();
            
            if (this.hud) this.hud.update();
            this.playerState.isMoving = false;
        });
    }
    
    /**
     * Handle player death from status effect damage
     */
    handlePlayerDeath() {
        this.playerState.isMoving = true;
        
        const { width, height } = this.scale;
        
        // Create game over overlay
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.95);
        overlay.setScrollFactor(0);
        overlay.setDepth(1000);
        
        // Game Over title
        const titleText = this.add.text(width / 2, height / 2 - 120, 'GAME OVER', {
            fontFamily: 'Press Start 2P',
            fontSize: '48px',
            color: CONFIG.COLORS.danger,
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);
        
        // Death reason
        const reasonText = this.add.text(width / 2, height / 2 - 50, 'You have been overwhelmed...\nYour body gave out.', {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: CONFIG.COLORS.text,
            align: 'center',
            lineSpacing: 8
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);
        
        // Medical help cost
        const medicalCost = 500;
        const canAffordMedical = this.playerState.money >= medicalCost;
        
        // Stats display
        const statsText = this.add.text(width / 2, height / 2 + 20, 
            `Day: ${this.timeSystem?.day || 1} | Money: $${this.playerState.money}`, {
            fontFamily: 'Press Start 2P',
            fontSize: '12px',
            color: CONFIG.COLORS.textDark
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);
        
        // Options container
        const optionsContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(1002);
        
        // Option 1: Medical Help button
        const medicalBtnBg = this.add.rectangle(width / 2 - 120, height / 2 + 100, 200, 60, 
            canAffordMedical ? 0x2a4a2a : 0x1a1a1a);
        medicalBtnBg.setStrokeStyle(2, canAffordMedical ? 0x00ff00 : 0x444444);
        optionsContainer.add(medicalBtnBg);
        
        const medicalBtnText = this.add.text(width / 2 - 120, height / 2 + 100, 
            canAffordMedical ? `MEDICAL\n$${medicalCost}` : 'NO FUNDS\nFOR MEDICAL', {
            fontFamily: 'Press Start 2P',
            fontSize: '12px',
            color: canAffordMedical ? '#00ff00' : '#666666',
            align: 'center'
        }).setOrigin(0.5).setScrollFactor(0);
        optionsContainer.add(medicalBtnText);
        
        // Make medical button interactive
        if (canAffordMedical) {
            medicalBtnBg.setInteractive({ useHandCursor: true });
            medicalBtnBg.on('pointerover', () => medicalBtnBg.setFillStyle(0x3a5a3a));
            medicalBtnBg.on('pointerout', () => medicalBtnBg.setFillStyle(0x2a4a2a));
            medicalBtnBg.on('pointerup', () => {
                this.handleMedicalRevival(overlay, titleText, reasonText, statsText, optionsContainer, medicalCost);
            });
        }
        
        // Option 2: Restart button
        const restartBtnBg = this.add.rectangle(width / 2 + 120, height / 2 + 100, 200, 60, 0x2a2a4a);
        restartBtnBg.setStrokeStyle(2, 0x6666ff);
        optionsContainer.add(restartBtnBg);
        
        const restartBtnText = this.add.text(width / 2 + 120, height / 2 + 100, 'RESTART\nGAME', {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: '#6666ff',
            align: 'center'
        }).setOrigin(0.5).setScrollFactor(0);
        optionsContainer.add(restartBtnText);
        
        // Make restart button interactive
        restartBtnBg.setInteractive({ useHandCursor: true });
        restartBtnBg.on('pointerover', () => restartBtnBg.setFillStyle(0x3a3a5a));
        restartBtnBg.on('pointerout', () => restartBtnBg.setFillStyle(0x2a2a4a));
        restartBtnBg.on('pointerup', () => {
            this.restartGame(overlay, titleText, reasonText, statsText, optionsContainer);
        });
        
        // Keyboard shortcuts hint
        this.input.keyboard.once('keydown-M', () => {
            if (canAffordMedical) {
                this.handleMedicalRevival(overlay, titleText, reasonText, statsText, optionsContainer, medicalCost);
            }
        });
        
        this.input.keyboard.once('keydown-R', () => {
            this.restartGame(overlay, titleText, reasonText, statsText, optionsContainer);
        });
    }
    
    /**
     * Handle medical revival option
     */
    handleMedicalRevival(overlay, titleText, reasonText, statsText, optionsContainer, cost) {
        // Deduct cost
        this.playerState.money -= cost;
        
        // Clear overlay
        overlay.destroy();
        titleText.destroy();
        reasonText.destroy();
        statsText.destroy();
        optionsContainer.destroy();
        
        const { width, height } = this.scale;
        
        // Show revival message
        const revivalOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9);
        revivalOverlay.setScrollFactor(0).setDepth(1000);
        
        const revivalTitle = this.add.text(width / 2, height / 2 - 30, 'TREATED', {
            fontFamily: 'Press Start 2P',
            fontSize: '36px',
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);
        
        const revivalText = this.add.text(width / 2, height / 2 + 30, 'Medical team stabilized you.\nBack in the streets...', {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: CONFIG.COLORS.text,
            align: 'center'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);
        
        // Clear all status effects
        this.playerState.activeStatuses = {};
        
        // Restore HP to 75%
        this.playerState.playerHP = Math.floor(this.playerState.playerMaxHP * 0.75);
        
        // Revive at safehouse
        this.reviveAtSafehouse();
        
        // Continue after delay
        this.time.delayedCall(2500, () => {
            revivalOverlay.destroy();
            revivalTitle.destroy();
            revivalText.destroy();
            
            if (this.hud) {
                this.hud.updateStatusDisplay();
                this.hud.update();
            }
            this.playerState.isMoving = false;
        });
    }
    
    /**
     * Restart the game
     */
    restartGame(overlay, titleText, reasonText, statsText, optionsContainer) {
        overlay.destroy();
        titleText.destroy();
        reasonText.destroy();
        statsText.destroy();
        optionsContainer.destroy();
        
        // Restart the scene
        this.scene.restart();
    }
    
    /**
     * Revive player at safehouse
     */
    reviveAtSafehouse() {
        // Find safehouse position
        const safehouse = this.worldObjects?.find(obj => obj.type === 'safehouse');
        if (safehouse) {
            this.playerState.gridX = safehouse.x + 1;
            this.playerState.gridY = safehouse.y;
            
            // Update player sprite position
            if (this.player) {
                this.player.x = this.playerState.gridX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
                this.player.y = this.playerState.gridY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
            }
        }
    }
    
    getRank() {
        const money = this.playerState.money;
        let rank = CONFIG.RANKS[0];
        
        for (const r of CONFIG.RANKS) {
            if (money >= r.minMoney) {
                rank = r;
            } else {
                break;
            }
        }
        
        return rank.name;
    }
    
    /**
     * Check if player's rank has changed and show notification if so
     * Should be called whenever money changes significantly
     */
    checkRankChange() {
        const newRank = this.getRank();
        const currentRank = this.playerState.currentRank;
        
        if (newRank !== currentRank) {
            const oldRank = currentRank;
            this.playerState.currentRank = newRank;
            
            // Show rank change notification
            if (this.hud) {
                this.hud.showRankChangeNotification(newRank, oldRank);
            }
            
            // Also show a celebratory floating text
            this.showFloatingText(
                `🎉 PROMOTED TO ${newRank.toUpperCase()}! 🎉`,
                CONFIG.COLORS.success,
                this.player.x,
                this.player.y - 50
            );
        }
    }
    
    onNewDay() {
        // Decay heat
        this.playerState.heat = Math.max(0, this.playerState.heat - CONFIG.HEAT_DECAY_PER_DAY);
        
        // Check if day changed
        if (this.timeSystem.day !== this.currentDay) {
            this.currentDay = this.timeSystem.day;
            
            // Update calendar system
            this.calendarSystem.advanceDay(this.currentDay);
            
            // Random chance for neighborhood event (20% chance each day)
            if (Math.random() < 0.2) {
                this.calendarSystem.triggerRandomNeighborhoodEvent();
            }
            
            // Reset daily flags
            this.playerState.corruptCopUsedToday = false;
            
            // Decay NPC loyalty
            if (this.playerState.npcRelationships.shopOwner > 0) {
                this.playerState.npcRelationships.shopOwner = Math.max(0,
                    this.playerState.npcRelationships.shopOwner - CONFIG.LOYALTY_DECAY_PER_DAY);
            }
            if (this.playerState.npcRelationships.corruptCop > 0) {
                this.playerState.npcRelationships.corruptCop = Math.max(0,
                    this.playerState.npcRelationships.corruptCop - CONFIG.LOYALTY_DECAY_PER_DAY);
            }
            
            // Process runner sales
            if (this.playerState.hasRunner && this.playerState.runnerProduct > 0) {
                this.processRunnerSales();
            }
            
            // Charge runner daily fee
            if (this.playerState.hasRunner) {
                this.playerState.money = Math.max(0, this.playerState.money - CONFIG.RUNNER_DAILY_FEE);
            }
            
            // Spawn new buyers
            this.spawnDailyBuyers();
            
            // Spawn new rival if previous was defeated
            if (this.rivalDefeated) {
                this.spawnRival();
            }
            
            // Handle crackdown - spawn extra police
            if (this.calendarSystem.shouldSpawnExtraPolice() && !this.police) {
                this.checkPoliceSpawn(); // Try to spawn police even if heat is low
            }
            
            // Update supplier system - decay loyalty and generate new suppliers
            this.supplierSystem.onNewDay();
            
            // Check if we need to generate new supplier cycle
            const config = CONFIG.SUPPLIER_CONFIG;
            if (this.currentDay % config.SUPPLIER_CYCLE_DAYS === 0) {
                // Clear old supplier NPCs
                this.supplierNPCs.forEach(supplier => {
                    if (supplier.sprite) supplier.sprite.destroy();
                    if (supplier.indicator) supplier.indicator.destroy();
                    const index = this.worldObjects.indexOf(supplier);
                    if (index > -1) this.worldObjects.splice(index, 1);
                });
                this.supplierNPCs = [];
                
                // Generate new suppliers
                this.supplierSystem.generateSupplierCycle();
                this.placeSupplierNPCs();
            }
            
            if (this.hud) this.hud.update();
            
            // Auto-save on new day (to slot 0)
            SaveLoadSystem.saveToSlot(this, 0, `Day ${this.currentDay} Auto-save`);
        }
    }
    
    upgradeSafehouse(tierIndex) {
        if (tierIndex >= CONFIG.SAFEHOUSE_TIERS.length) return false;
        if (tierIndex <= this.playerState.safehouseTier) return false;
        
        const tier = CONFIG.SAFEHOUSE_TIERS[tierIndex];
        
        // Check if player can afford
        if (this.playerState.money < tier.cost) return false;
        
        // Deduct cost
        this.playerState.money -= tier.cost;
        
        // Update tier
        this.playerState.safehouseTier = tierIndex;
        
        // Quest: Track safehouse upgrades
        if (this.questSystem) {
            this.questSystem.onSafehouseUpgrade(tierIndex);
        }
        
        // Update safehouse sprite
        const safehouse = this.worldObjects.find(obj => obj.type === 'safehouse');
        if (safehouse && safehouse.safehouseSprite) {
            safehouse.safehouseSprite.setTexture(tier.sprite);
            safehouse.safehouseSprite.setScale(tier.scale);
        }
        
        // Update HUD
        if (this.hud) this.hud.update();
        
        // Auto-save on safehouse upgrade (to slot 0)
        SaveLoadSystem.saveToSlot(this, 0, `Safehouse Tier ${tierIndex} Upgrade`);
        
        return true;
    }
    
    processRunnerSales() {
        const product = this.playerState.runnerProduct;
        
        // Get neighborhood bonus for runner success
        const neighborhoodBonus = this.playerState.neighborhoodBonus;
        const runnerSuccessBonus = neighborhoodBonus?.runnerSuccessBonus || 0;
        
        // Calculate bust chance based on intuition (reduced by neighborhood bonus)
        const intuition = this.playerState.stats.intuition || 0;
        const baseBustChance = CONFIG.RUNNER_BUST_BASE_CHANCE - (intuition * CONFIG.RUNNER_INTUITION_REDUCTION);
        // Apply neighborhood bonus - reduces bust chance further (success = avoiding bust)
        const adjustedBustChance = Math.max(0, baseBustChance - runnerSuccessBonus);
        
        const bustChance = adjustedBustChance;
        
        // Roll for bust
        const busted = Math.random() < bustChance;
        
        if (busted) {
            // Runner got busted - lose all product
            this.playerState.runnerProduct = 0;
            this.showRunnerMessage('RUNNER BUSTED!', 
                `Your runner got caught!\nLost ${product} product.`, 
                CONFIG.COLORS.danger);
        } else {
            // Successful sale (affected by drought)
            const droughtMultiplier = this.calendarSystem.getProductSellMultiplier();
            const totalRevenue = product * CONFIG.PRODUCT_SELL_PRICE * droughtMultiplier;
            const runnerCut = Math.floor(totalRevenue * CONFIG.RUNNER_CUT);
            const playerProfit = totalRevenue - runnerCut;
            
            // Add money to player's stash (not direct inventory)
            this.playerState.money += playerProfit;
            this.playerState.runnerProduct = 0;
            this.checkRankChange();
            
            // Quest: Check progress on money gain
            if (this.questSystem) {
                this.questSystem.checkChapterProgress();
            }
            
            this.showRunnerMessage('RUNNER SUCCESS!', 
                `Sold ${product} product\nRevenue: $${totalRevenue}\nRunner Cut: $${runnerCut}\nYour Profit: $${playerProfit}`, 
                CONFIG.COLORS.success);
        }
        
        if (this.hud) this.hud.update();
    }
    
    showRunnerMessage(title, message, color) {
        const { width, height } = this.scale;
        
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
        overlay.setScrollFactor(0);
        overlay.setDepth(1000);
        
        const titleText = this.add.text(width / 2, height / 2 - 50, title, {
            fontFamily: 'Press Start 2P',
            fontSize: '28px',
            color: color,
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);
        
        const messageText = this.add.text(width / 2, height / 2 + 20, message, {
            fontFamily: 'Press Start 2P',
            fontSize: '16px',
            color: CONFIG.COLORS.text,
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3,
            lineSpacing: 10
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);
        
        this.time.delayedCall(3000, () => {
            overlay.destroy();
            titleText.destroy();
            messageText.destroy();
        });
    }
    
    purchaseEquipment(equipmentId) {
        const equipment = CONFIG.EQUIPMENT[equipmentId];
        if (!equipment) return false;
        
        // Check if already owned
        if (this.playerState.equipment[equipmentId]) return false;
        
        // Check if can afford
        if (this.playerState.money < equipment.cost) return false;
        
        // Deduct cost
        this.playerState.money -= equipment.cost;
        
        // Grant equipment
        this.playerState.equipment[equipmentId] = true;
        
        // Apply bonuses based on equipment type
        if (equipment.rawCapacityBonus) {
            this.playerState.rawCapacity += equipment.rawCapacityBonus;
        }
        if (equipment.productCapacityBonus) {
            this.playerState.productCapacity += equipment.productCapacityBonus;
        }
        
        // Update HUD
        if (this.hud) this.hud.update();
        
        // Track achievement: equipment purchase
        EventBus.emit('achievement:purchasedEquipment');
        
        return true;
    }
    
    unequipEquipment(equipmentId) {
        const equipment = CONFIG.EQUIPMENT[equipmentId];
        if (!equipment) return false;
        
        // Check if owned
        if (!this.playerState.equipment[equipmentId]) return false;
        
        // Remove equipment
        this.playerState.equipment[equipmentId] = false;
        
        // Remove bonuses that were added directly
        if (equipment.rawCapacityBonus) {
            this.playerState.rawCapacity -= equipment.rawCapacityBonus;
        }
        if (equipment.productCapacityBonus) {
            this.playerState.productCapacity -= equipment.productCapacityBonus;
        }
        
        // Update HUD
        if (this.hud) this.hud.update();
        
        return true;
    }
    
    sellEquipment(equipmentId) {
        const equipment = CONFIG.EQUIPMENT[equipmentId];
        if (!equipment) return false;
        
        // Check if owned
        if (!this.playerState.equipment[equipmentId]) return false;
        
        // Calculate sell value (50% of cost)
        const sellValue = Math.floor(equipment.cost * 0.5);
        
        // Add money
        this.playerState.money += sellValue;
        this.checkRankChange();
        
        // Remove equipment (same as unequip)
        this.playerState.equipment[equipmentId] = false;
        
        // Remove bonuses that were added directly
        if (equipment.rawCapacityBonus) {
            this.playerState.rawCapacity -= equipment.rawCapacityBonus;
        }
        if (equipment.productCapacityBonus) {
            this.playerState.productCapacity -= equipment.productCapacityBonus;
        }
        
        // Update HUD
        if (this.hud) this.hud.update();

        return sellValue;
    }
    
    // Equipment effect getters
    getEquipmentAttackBonus() {
        let bonus = 0;
        if (this.playerState.equipment.brassKnucks) {
            bonus += CONFIG.EQUIPMENT.brassKnucks.attackBonus;
        }
        if (this.playerState.equipment.switchblade) {
            bonus += CONFIG.EQUIPMENT.switchblade.attackBonus;
        }
        if (this.playerState.equipment.pistol) {
            bonus += CONFIG.EQUIPMENT.pistol.attackBonus;
        }
        return bonus;
    }
    
    hasRangeAttack() {
        return this.playerState.equipment.pistol;
    }
    
    getPistolAmmoCost() {
        return this.playerState.equipment.pistol ? CONFIG.EQUIPMENT.pistol.ammoCost : 0;
    }
    
    getDamageReduction() {
        if (this.playerState.equipment.bulletproofVest) {
            return CONFIG.EQUIPMENT.bulletproofVest.damageReduction;
        }
        return 0;
    }
    
    getHeatReduction() {
        if (this.playerState.equipment.heavyCoat) {
            return CONFIG.EQUIPMENT.heavyCoat.heatReduction;
        }
        return 0;
    }
    
    getMovementSpeedBonus() {
        if (this.playerState.equipment.runningShoes) {
            return CONFIG.EQUIPMENT.runningShoes.speedBonus;
        }
        return 1;
    }
    
    getVisionRangeBonus() {
        if (this.playerState.equipment.binoculars) {
            return CONFIG.EQUIPMENT.binoculars.visionRangeBonus;
        }
        return 0;
    }
    
    getSafehouseEntrySpeed() {
        if (this.playerState.equipment.lockpick) {
            return CONFIG.EQUIPMENT.lockpick.safehouseEntrySpeed;
        }
        return 1;
    }
    
    getBuyerSpawnBonus() {
        if (this.playerState.equipment.burnerPhone) {
            return CONFIG.EQUIPMENT.burnerPhone.buyerSpawnBonus;
        }
        return 0;
    }
    
    getPriceBonus() {
        if (this.playerState.equipment.goldChain) {
            return CONFIG.EQUIPMENT.goldChain.priceBonus;
        }
        return 0;
    }
    
    /**
     * Calculate demand multiplier based on neighborhood sales history
     * - High sales of a drug in an area → market saturation → lower prices
     * - No sales in an area for a while → demand builds → higher prices
     * @param {string} drugType - The drug being sold
     * @returns {number} Demand multiplier (1.0 = normal, <1.0 = saturated, >1.0 = high demand)
     */
    getNeighborhoodDemandMultiplier(drugType) {
        const history = this.playerState.neighborhoodHistory;
        const currentNeighborhood = this.playerState.neighborhood;
        
        if (!history || !history[currentNeighborhood]) {
            // No history = fresh market, slightly higher demand
            return 1.15;
        }
        
        const neighborhoodData = history[currentNeighborhood];
        const lastSale = neighborhoodData.lastSale || 0;
        const now = Date.now();
        
        // Calculate time since last sale (in game days roughly)
        // Assuming ~2 minutes per game day, so 1 game day = 120000ms
        const daysSinceLastSale = (now - lastSale) / 120000;
        
        // Base multiplier from time since last sale (ignored areas have higher demand)
        let timeMultiplier = 1.0;
        if (daysSinceLastSale > 7) {
            // Haven't sold here in over a week - high demand
            timeMultiplier = 1.3;
        } else if (daysSinceLastSale > 3) {
            // Haven't sold here in a few days - moderate demand
            timeMultiplier = 1.15;
        } else if (daysSinceLastSale < 0.5) {
            // Sold very recently - lower demand
            timeMultiplier = 0.9;
        }
        
        // Drug-specific saturation: if player sold lots of THIS drug recently, reduce demand
        const drugSales = neighborhoodData[drugType] || 0;
        let drugSaturationMultiplier = 1.0;
        
        if (drugSales > 20) {
            // Heavy saturation - much lower prices
            drugSaturationMultiplier = 0.6;
        } else if (drugSales > 10) {
            // Moderate saturation
            drugSaturationMultiplier = 0.8;
        } else if (drugSales > 5) {
            // Slight saturation
            drugSaturationMultiplier = 0.9;
        }
        
        // Combine multipliers
        return timeMultiplier * drugSaturationMultiplier;
    }
    
    /**
     * Update neighborhood history after a sale
     * @param {string} drugType - The drug sold
     * @param {number} amount - Amount sold
     */
    updateNeighborhoodHistory(drugType, amount) {
        const currentNeighborhood = this.playerState.neighborhood;
        
        if (!this.playerState.neighborhoodHistory) {
            this.playerState.neighborhoodHistory = {};
        }
        if (!this.playerState.neighborhoodHistory[currentNeighborhood]) {
            this.playerState.neighborhoodHistory[currentNeighborhood] = {};
        }
        
        const neighborhoodData = this.playerState.neighborhoodHistory[currentNeighborhood];
        
        // Initialize drug count if not exists
        if (!neighborhoodData[drugType]) {
            neighborhoodData[drugType] = 0;
        }
        
        // Add to drug sales count
        neighborhoodData[drugType] += amount;
        
        // Update last sale timestamp
        neighborhoodData.lastSale = Date.now();
    }
    
    getDetectionReduction() {
        if (this.playerState.equipment.designerSunglasses) {
            return CONFIG.EQUIPMENT.designerSunglasses.detectionReduction;
        }
        return 0;
    }
    
    updatePoliceSystem() {
        // Get neighborhood bonus for police spawn reduction
        const neighborhoodBonus = this.playerState.neighborhoodBonus;
        const policeSpawnReduction = neighborhoodBonus?.policeSpawnReduction || 0;
        
        // Check if Riverside police system is active
        const hasRiversidePolice = this.riversidePolice !== null;
        
        // Adjust heat threshold based on suspicion if Riverside police is active
        let adjustedHeatThreshold = Math.floor(CONFIG.HEAT_THRESHOLD_POLICE * (1 + policeSpawnReduction));
        if (hasRiversidePolice) {
            // Higher suspicion = lower heat threshold needed to spawn police
            const suspMod = this.riversidePolice.getPatrolFrequencyModifier();
            const suspReduction = (suspMod - 1) * 0.3; // Up to 60% reduction at max suspicion
            adjustedHeatThreshold = Math.floor(adjustedHeatThreshold * (1 - suspReduction));
        }
        
        // Check if police should spawn (or if suspicion triggers raid warning)
        if (!this.police && this.playerState.heat >= adjustedHeatThreshold) {
            this.spawnPolice();
        }
        
        // Despawn police if heat drops below threshold
        if (this.police && this.playerState.heat < adjustedHeatThreshold * 0.7) {
            this.despawnPolice();
            return;
        }
        
        // Update police behavior
        if (this.police) {
            if (this.policeState === 'patrol') {
                this.updatePolicePatrol();
                this.checkPoliceLineOfSight();
                
                // Riverside Police: Check for suspicion-based patrol adjustments
                if (hasRiversidePolice) {
                    this.handleRiversidePatrolBehavior();
                }
            } else if (this.policeState === 'chase') {
                this.updatePoliceChase();
            }
        }
        
        // Riverside Police: Check for cop contact with player
        if (hasRiversidePolice) {
            this.checkRiversideCopContact();
        }
    }
    
    /**
     * Handle Riverside Police-specific patrol behavior based on suspicion
     */
    handleRiversidePatrolBehavior() {
        if (!this.riversidePolice || !this.police) return;
        
        const suspicion = this.riversidePolice.getSuspicion();
        const patrolMod = this.riversidePolice.getPatrolFrequencyModifier();
        
        // At high suspicion, police move more aggressively
        if (patrolMod >= 2.0 && suspicion >= 50) {
            // Get player position for surveillance
            const playerX = this.playerState.gridX;
            const playerY = this.playerState.gridY;
            
            // Move police gradually toward player at high suspicion
            const moveChance = (patrolMod - 1) * 0.2; // 20% at 2x, higher at 3x
            if (Math.random() < moveChance) {
                const dx = playerX - this.police.gridX;
                const dy = playerY - this.police.gridY;
                
                // Move one step toward player
                const moveX = dx !== 0 ? (dx > 0 ? 1 : -1) : 0;
                const moveY = dy !== 0 ? (dy > 0 ? 1 : -1) : 0;
                
                // Try to move
                const targetX = this.police.gridX + moveX;
                const targetY = this.police.gridY + moveY;
                
                const targetTile = this.worldMap[targetY]?.[targetX];
                if (targetTile?.walkable && !this.worldObjects.some(obj => obj.x === targetX && obj.y === targetY)) {
                    this.movePolice(targetX - this.police.gridX, targetY - this.police.gridY);
                }
            }
        }
        
        // At critical suspicion, show surveillance message
        if (patrolMod >= 3.0 && suspicion >= 75 && Math.random() < 0.02) {
            this.showFloatingText('👀 You\'re being watched...', CONFIG.COLORS.warning);
        }
    }
    
    /**
     * Check if cops should contact player based on suspicion
     */
    checkRiversideCopContact() {
        if (!this.riversidePolice) return;
        
        const contact = this.riversidePolice.checkForCopContact();
        if (!contact) return;
        
        // Only trigger contact occasionally (not every frame)
        if (Math.random() > 0.001) return;
        
        // Get dialogue
        const dialogues = this.riversidePolice.getCopDialogue(contact.copKey, contact.dialogueType);
        const dialogue = dialogues[Math.floor(Math.random() * dialogues.length)];
        
        // Show dialogue
        const { width, height } = this.scale;
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
        overlay.setScrollFactor(0).setDepth(1500);
        
        const copName = this.riversidePolice.cops[contact.copKey]?.name || 'Officer';
        
        const nameText = this.add.text(width / 2, height / 2 - 60, copName, {
            fontFamily: 'Press Start 2P',
            fontSize: '16px',
            color: '#4488cc'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1501);
        
        const dialogText = this.add.text(width / 2, height / 2, `"${dialogue}"`, {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: CONFIG.COLORS.text,
            align: 'center',
            fontStyle: 'italic'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1501);
        
        const continueText = this.add.text(width / 2, height / 2 + 60, '[Press E to continue]', {
            fontFamily: 'Press Start 2P',
            fontSize: '12px',
            color: '#888888'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1501);
        
        // Allow player to close
        this.input.keyboard.once('keydown-E', () => {
            overlay.destroy();
            nameText.destroy();
            dialogText.destroy();
            continueText.destroy();
        });
        
        // Auto-close after delay
        this.time.delayedCall(4000, () => {
            if (overlay) overlay.destroy();
            if (nameText) nameText.destroy();
            if (dialogText) dialogText.destroy();
            if (continueText) continueText.destroy();
        });
    }
    
    spawnPolice() {
        // Find valid spawn location far from player
        let attempts = 0;
        let policeX, policeY;
        
        do {
            policeX = Math.floor(Math.random() * (CONFIG.GRID_WIDTH - 4)) + 2;
            policeY = Math.floor(Math.random() * (CONFIG.GRID_HEIGHT - 4)) + 2;
            
            const distFromPlayer = Phaser.Math.Distance.Between(
                this.playerState.gridX, this.playerState.gridY,
                policeX, policeY
            );
            
            attempts++;
            
            const policeTile = this.worldMap[policeY]?.[policeX];
            if (policeTile?.walkable &&
                !this.worldObjects.some(obj => obj.x === policeX && obj.y === policeY) &&
                distFromPlayer > 10) {
                break;
            }
        } while (attempts < 100);
        
        if (attempts >= 100) return;
        
        const policeObj = {
            type: 'police',
            x: policeX,
            y: policeY,
            walkable: true,
            gridX: policeX,
            gridY: policeY
        };
        
        const sprite = this.add.image(
            policeX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            policeY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            'npc-police'
        );
        sprite.setScale(0.13);
        sprite.setDepth(50);
        
        // Add warning indicator
        const indicator = this.add.text(
            policeX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            policeY * CONFIG.TILE_SIZE - 15,
            '!!! POLICE !!!',
            {
                fontFamily: 'Press Start 2P',
                fontSize: '10px',
                color: '#0066ff',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5).setDepth(51);
        
        // Pulsing animation
        this.tweens.add({
            targets: indicator,
            alpha: 0.3,
            duration: 600,
            yoyo: true,
            repeat: -1
        });
        
        policeObj.sprite = sprite;
        policeObj.indicator = indicator;
        this.worldObjects.push(policeObj);
        this.police = policeObj;
        this.policeState = 'patrol';
        
        // Generate patrol path
        this.generatePolicePatrolPath();
        
        // Show warning
        this.showFloatingText('POLICE NEARBY! Stay alert!', '#0066ff');
    }
    
    despawnPolice() {
        if (!this.police) return;
        
        if (this.police.sprite) this.police.sprite.destroy();
        if (this.police.indicator) this.police.indicator.destroy();
        const index = this.worldObjects.indexOf(this.police);
        if (index > -1) this.worldObjects.splice(index, 1);
        
        this.police = null;
        this.policeState = 'none';
        this.policePatrolPath = [];
    }
    
    generatePolicePatrolPath() {
        // Generate random patrol waypoints
        this.policePatrolPath = [];
        const numWaypoints = 4;
        
        for (let i = 0; i < numWaypoints; i++) {
            let x, y;
            let attempts = 0;
            
            do {
                x = Math.floor(Math.random() * (CONFIG.GRID_WIDTH - 4)) + 2;
                y = Math.floor(Math.random() * (CONFIG.GRID_HEIGHT - 4)) + 2;
                attempts++;
            } while (!this.worldMap[y][x].walkable && attempts < 50);
            
            if (attempts < 50) {
                this.policePatrolPath.push({ x, y });
            }
        }
        
        this.policePatrolIndex = 0;
    }
    
    updatePolicePatrol() {
        if (!this.police || this.policePatrolPath.length === 0) return;
        
        // Get current target waypoint
        const target = this.policePatrolPath[this.policePatrolIndex];
        
        // Check if reached waypoint
        if (this.police.gridX === target.x && this.police.gridY === target.y) {
            // Move to next waypoint
            this.policePatrolIndex = (this.policePatrolIndex + 1) % this.policePatrolPath.length;
            return;
        }
        
        // Move towards waypoint (simple pathfinding)
        const dx = target.x - this.police.gridX;
        const dy = target.y - this.police.gridY;
        
        let moveX = 0, moveY = 0;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            moveX = dx > 0 ? 1 : -1;
        } else if (Math.abs(dy) > 0) {
            moveY = dy > 0 ? 1 : -1;
        }
        
        const newX = this.police.gridX + moveX;
        const newY = this.police.gridY + moveY;
        
        // Check if new position is walkable (with bounds check)
        const policeMoveTile = this.worldMap[newY]?.[newX];
        if (newX >= 0 && newX < CONFIG.GRID_WIDTH &&
            newY >= 0 && newY < CONFIG.GRID_HEIGHT &&
            policeMoveTile?.walkable) {
            
            this.police.gridX = newX;
            this.police.gridY = newY;
            
            const targetPosX = newX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
            const targetPosY = newY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
            
            this.tweens.add({
                targets: this.police.sprite,
                x: targetPosX,
                y: targetPosY,
                duration: CONFIG.POLICE_PATROL_SPEED,
                ease: 'Linear'
            });
            
            this.tweens.add({
                targets: this.police.indicator,
                x: targetPosX,
                y: targetPosY - 15,
                duration: CONFIG.POLICE_PATROL_SPEED,
                ease: 'Linear'
            });
        }
    }
    
    checkPoliceLineOfSight() {
        if (!this.police) return;
        
        const dist = Phaser.Math.Distance.Between(
            this.playerState.gridX, this.playerState.gridY,
            this.police.gridX, this.police.gridY
        );
        
        // Check if player is within vision range
        if (dist <= CONFIG.POLICE_VISION_RANGE) {
            // Check if there's a clear line of sight (not blocked by walls)
            if (this.hasLineOfSight(this.police.gridX, this.police.gridY, 
                                    this.playerState.gridX, this.playerState.gridY)) {
                this.startPoliceChase();
            }
        }
    }
    
    /**
     * Check if there's a clear line of sight between two points using raycasting.
     * Returns true if no walls block the view between start and end.
     */
    hasLineOfSight(startX, startY, endX, endY) {
        // Bresenham-style line of sight check with sub-tile sampling
        const dx = Math.abs(endX - startX);
        const dy = Math.abs(endY - startY);
        const steps = Math.max(dx, dy) * 2; // Sample at half-tile intervals for accuracy
        
        if (steps === 0) return true; // Same position
        
        const xStep = (endX - startX) / steps;
        const yStep = (endY - startY) / steps;
        
        let x = startX;
        let y = startY;
        
        for (let i = 0; i < steps; i++) {
            // Check the tile at this position (stop before reaching player position)
            if (i > 0 && i < steps) {
                const tileX = Math.floor(x);
                const tileY = Math.floor(y);
                
                // Bounds check
                if (tileX >= 0 && tileX < CONFIG.GRID_WIDTH && 
                    tileY >= 0 && tileY < CONFIG.GRID_HEIGHT) {
                    // Check if this tile is a wall (not walkable)
                    if (!this.worldMap[tileY][tileX].walkable) {
                        return false; // Wall blocks line of sight
                    }
                }
            }
            
            x += xStep;
            y += yStep;
        }
        
        return true; // No walls blocking
    }
    
    startPoliceChase() {
        if (this.policeState === 'chase') return;
        
        this.policeState = 'chase';
        
        // Change indicator
        if (this.police.indicator) {
            this.police.indicator.setText('!!! CHASING !!!');
            this.police.indicator.setColor('#ff0000');
        }
        
        this.showFloatingText('POLICE CHASE!', CONFIG.COLORS.danger);
    }
    
    updatePoliceChase() {
        if (!this.police) return;
        
        // Check if player is near Shop Owner with high loyalty
        if (this.shopOwner && this.playerState.npcRelationships.shopOwner >= CONFIG.LOYALTY_THRESHOLD) {
            const distToShop = Phaser.Math.Distance.Between(
                this.playerState.gridX, this.playerState.gridY,
                this.shopOwner.x, this.shopOwner.y
            );
            
            if (distToShop <= 2) {
                // Shop Owner helps player escape
                this.playerState.heat = 0;
                this.despawnPolice();
                this.showFloatingText('Shop Owner helps you escape!\nHeat cleared!', CONFIG.COLORS.success);
                this.hud.update();
                return;
            }
        }
        
        // Check if caught player
        const dist = Phaser.Math.Distance.Between(
            this.playerState.gridX, this.playerState.gridY,
            this.police.gridX, this.police.gridY
        );
        
        if (dist <= CONFIG.POLICE_CATCH_RANGE) {
            this.arrestPlayer();
            return;
        }
        
        // Chase player
        const dx = this.playerState.gridX - this.police.gridX;
        const dy = this.playerState.gridY - this.police.gridY;
        
        let moveX = 0, moveY = 0;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            moveX = dx > 0 ? 1 : -1;
        } else if (Math.abs(dy) > 0) {
            moveY = dy > 0 ? 1 : -1;
        }
        
        const newX = this.police.gridX + moveX;
        const newY = this.police.gridY + moveY;
        
        // Check if new position is walkable (with bounds check)
        const chaseTile = this.worldMap[newY]?.[newX];
        if (newX >= 0 && newX < CONFIG.GRID_WIDTH &&
            newY >= 0 && newY < CONFIG.GRID_HEIGHT &&
            chaseTile?.walkable) {
            
            this.police.gridX = newX;
            this.police.gridY = newY;
            
            const targetPosX = newX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
            const targetPosY = newY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
            
            this.tweens.add({
                targets: this.police.sprite,
                x: targetPosX,
                y: targetPosY,
                duration: CONFIG.POLICE_CHASE_SPEED,
                ease: 'Linear'
            });
            
            this.tweens.add({
                targets: this.police.indicator,
                x: targetPosX,
                y: targetPosY - 15,
                duration: CONFIG.POLICE_CHASE_SPEED,
                ease: 'Linear'
            });
        }
    }
    
    arrestPlayer() {
        // Check for Corrupt Cop protection
        if (this.playerState.npcRelationships.corruptCop >= CONFIG.LOYALTY_THRESHOLD &&
            !this.playerState.corruptCopUsedToday) {
            // Corrupt Cop prevents arrest
            this.playerState.corruptCopUsedToday = true;
            this.despawnPolice();
            this.showFloatingText('Corrupt Cop called it off!\nGet out of here!', '#6699ff');
            return;
        }
        
        // Prevent movement during arrest
        this.playerState.isMoving = true;
        
        // Despawn police temporarily
        const policeSprite = this.police.sprite;
        const policeIndicator = this.police.indicator;
        
        // Open arrest encounter
        this.policeEncounterUI.open((playerEscaped) => {
            this.playerState.isMoving = false;
            
            if (playerEscaped) {
                // Player escaped - despawn police temporarily
                this.despawnPolice();
                
                // Track achievement: escaped at high heat
                if (this.playerState.heat >= 100) {
                    EventBus.emit('achievement:escapedHeat');
                }
                
                // Respawn police after delay if heat still high
                this.time.delayedCall(10000, () => {
                    if (this.playerState.heat >= CONFIG.HEAT_THRESHOLD_POLICE) {
                        this.spawnPolice();
                    }
                });
            } else {
                // Player got busted - despawn police
                this.despawnPolice();
            }
        });
    }
    
    /**
     * Close all open UI panels
     */
    closeAllUI() {
        if (this.safehouseUI.isOpen) this.safehouseUI.close();
        if (this.vendorUI.isOpen) this.vendorUI.close();
        if (this.workstationUI.isOpen) this.workstationUI.close();
        if (this.rivalEncounterUI.isOpen) this.rivalEncounterUI.close();
        if (this.equipmentUI.isOpen) this.equipmentUI.close();
        if (this.policeEncounterUI.isOpen) this.policeEncounterUI.close();
        if (this.relationshipUI.isOpen) this.relationshipUI.close();
        if (this.supplierUI.isOpen) this.supplierUI.close();
        if (this.tutorialUI.isOpen) this.tutorialUI.close();
        if (this.skillTree.ui && this.skillTree.ui.isOpen) this.skillTree.closeSkillTreeUI();
        if (this.questUI && this.questUI.isOpen) this.questUI.close();
    }
    
    /**
     * Open the pause menu with achievements
     */
    openPauseMenu() {
        const { width, height } = this.scale;
        
        // Close any open UI first
        this.closeAllUI();
        
        // Darken background
        this.pauseOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);
        this.pauseOverlay.setScrollFactor(0);
        this.pauseOverlay.setDepth(900);
        this.pauseOverlay.setInteractive();
        
        // Main panel
        this.pausePanel = this.add.image(width / 2, height / 2, 'ui-panel');
        this.pausePanel.setDisplaySize(1000, 800);
        this.pausePanel.setScrollFactor(0);
        this.pausePanel.setDepth(901);
        
        // Container for UI elements
        this.pauseContainer = this.add.container(0, 0);
        this.pauseContainer.setScrollFactor(0);
        this.pauseContainer.setDepth(902);
        
        // Title
        const title = this.add.text(width / 2, height / 2 - 350, 'PAUSE MENU', {
            fontFamily: 'Press Start 2P',
            fontSize: '36px',
            color: CONFIG.COLORS.primary,
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.pauseContainer.add(title);
        
        // Get all achievements
        const achievements = this.achievements.getAllAchievements();
        
        // Display achievements in categories
        const categories = {
            sales: { title: '💰 Sales & Money', achievements: [] },
            combat: { title: '⚔️ Combat', achievements: [] },
            exploration: { title: '🗺️ Exploration', achievements: [] },
            social: { title: '🤝 Social', achievements: [] },
            risk: { title: '🔥 Risk', achievements: [] },
            items: { title: '🎒 Items', achievements: [] }
        };
        
        achievements.forEach(ach => {
            if (categories[ach.category]) {
                categories[ach.category].achievements.push(ach);
            }
        });
        
        // Render achievements
        let yOffset = height / 2 - 280;
        const xOffset = width / 2 - 400;
        const colWidth = 380;
        
        Object.values(categories).forEach((category, catIndex) => {
            if (category.achievements.length === 0) return;
            
            // Category title
            const catTitle = this.add.text(xOffset + (catIndex % 2) * colWidth + 190, yOffset, category.title, {
                fontFamily: 'Press Start 2P',
                fontSize: '12px',
                color: CONFIG.COLORS.text
            }).setOrigin(0.5);
            this.pauseContainer.add(catTitle);
            
            yOffset += 30;
            
            // Achievements in this category
            category.achievements.forEach(ach => {
                const isUnlocked = ach.unlocked;
                const alpha = isUnlocked ? 1 : 0.5;
                
                // Achievement icon
                const icon = this.add.text(
                    xOffset + (catIndex % 2) * colWidth + 20, 
                    yOffset, 
                    ach.icon, 
                    { fontSize: '20px' }
                ).setAlpha(alpha);
                this.pauseContainer.add(icon);
                
                // Achievement name
                const name = this.add.text(
                    xOffset + (catIndex % 2) * colWidth + 50, 
                    yOffset - 5, 
                    ach.name, {
                    fontFamily: 'Press Start 2P',
                    fontSize: '10px',
                    color: isUnlocked ? '#ffd700' : CONFIG.COLORS.textDark
                }).setAlpha(alpha);
                this.pauseContainer.add(name);
                
                // Achievement description
                const desc = this.add.text(
                    xOffset + (catIndex % 2) * colWidth + 50, 
                    yOffset + 10, 
                    ach.description, {
                    fontFamily: 'Arial',
                    fontSize: '10px',
                    color: isUnlocked ? '#ffffff' : '#666666'
                }).setAlpha(alpha);
                this.pauseContainer.add(desc);
                
                // Progress bar for some achievements
                const progress = this.achievements.getProgress(ach.id);
                if (progress && progress.target > 1 && !isUnlocked) {
                    const barBg = this.add.rectangle(
                        xOffset + (catIndex % 2) * colWidth + 190,
                        yOffset + 25,
                        200, 10,
                        0x333333
                    ).setOrigin(0.5);
                    this.pauseContainer.add(barBg);
                    
                    const barFill = this.add.rectangle(
                        xOffset + (catIndex % 2) * colWidth + 90,
                        yOffset + 25,
                        progress.percentage * 2,
                        8,
                        CONFIG.COLORS.primary
                    ).setOrigin(0, 0.5);
                    this.pauseContainer.add(barFill);
                    
                    // Progress text
                    const progText = this.add.text(
                        xOffset + (catIndex % 2) * colWidth + 190,
                        yOffset + 40,
                        `${progress.current}/${progress.target}`,
                        {
                            fontFamily: 'Arial',
                            fontSize: '8px',
                            color: CONFIG.COLORS.textDark
                        }
                    ).setOrigin(0.5);
                    this.pauseContainer.add(progText);
                }
                
                // Unlocked checkmark
                if (isUnlocked) {
                    const check = this.add.text(
                        xOffset + (catIndex % 2) * colWidth + 360,
                        yOffset,
                        '✅',
                        { fontSize: '16px' }
                    );
                    this.pauseContainer.add(check);
                }
                
                yOffset += 55;
            });
            
            // Move to next column after 2 categories
            if (catIndex % 2 === 1) {
                yOffset += 20;
            }
            
            // Wrap to next row if needed
            if (catIndex === 1) {
                yOffset = height / 2 - 280;
            }
        });
        
        // Buttons at bottom
        const buttonY = height / 2 + 320;
        
        // Resume button
        const resumeBtn = this.createMenuButton(width / 2 - 150, buttonY, 280, 50, 'RESUME', () => {
            this.closePauseMenu();
        });
        this.pauseContainer.add(resumeBtn);
        
        // Save button - opens save slot selection
        const saveBtn = this.createMenuButton(width / 2 + 150, buttonY, 280, 50, 'SAVE GAME', () => {
            this.showSaveSlotSelection();
        });
        this.pauseContainer.add(saveBtn);
        
        // Stats display
        const statsY = height / 2 + 250;
        this.add.text(width / 2 - 300, statsY, `Total Money Earned: $${this.achievements.stats.totalMoney}`, {
            fontFamily: 'Press Start 2P',
            fontSize: '10px',
            color: CONFIG.COLORS.text
        });
        
        this.add.text(width / 2 + 50, statsY, `Combats Won: ${this.achievements.stats.combatsWon}`, {
            fontFamily: 'Press Start 2P',
            fontSize: '10px',
            color: CONFIG.COLORS.text
        });
    }
    
    /**
     * Create a button for the pause menu
     */
    createMenuButton(x, y, width, height, text, callback) {
        const btn = this.add.rectangle(x, y, width, height, 0x2a2a2a);
        btn.setStrokeStyle(2, CONFIG.COLORS.primary);
        btn.setInteractive({ useHandCursor: true });
        
        const btnText = this.add.text(x, y, text, {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: CONFIG.COLORS.primary
        }).setOrigin(0.5);
        
        btn.on('pointerover', () => {
            btn.setFillStyle(0x444444);
        });
        
        btn.on('pointerout', () => {
            btn.setFillStyle(0x2a2a2a);
        });
        
        btn.on('pointerdown', callback);
        
        return btn;
    }
    
    /**
     * Show save slot selection UI
     */
    showSaveSlotSelection() {
        const { width, height } = this.scale;
        
        // Close pause menu first
        this.closePauseMenu();
        
        // Darken background
        this.pauseOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);
        this.pauseOverlay.setScrollFactor(0);
        this.pauseOverlay.setDepth(900);
        this.pauseOverlay.setInteractive();
        
        // Main panel
        this.pausePanel = this.add.image(width / 2, height / 2, 'panel');
        this.pausePanel.setDisplaySize(800, 600);
        this.pausePanel.setScrollFactor(0);
        this.pausePanel.setDepth(901);
        
        // Container for UI elements
        this.pauseContainer = this.add.container(0, 0);
        this.pauseContainer.setScrollFactor(0);
        this.pauseContainer.setDepth(902);
        
        // Title
        const title = this.add.text(width / 2, height / 2 - 250, 'SELECT SAVE SLOT', {
            fontFamily: 'Press Start 2P',
            fontSize: '28px',
            color: CONFIG.COLORS.primary,
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.pauseContainer.add(title);
        
        // Get all slots
        const slots = SaveLoadSystem.getAllSlots();
        
        // Display save slots
        const slotYStart = height / 2 - 150;
        const slotHeight = 100;
        
        slots.forEach((slot, index) => {
            const y = slotYStart + index * (slotHeight + 20);
            
            // Slot background
            const slotBg = this.add.rectangle(width / 2, y, 600, slotHeight, slot.exists ? 0x1a3a1a : 0x2a2a2a);
            slotBg.setStrokeStyle(2, slot.exists ? CONFIG.COLORS.success : CONFIG.COLORS.textDark);
            slotBg.setScrollFactor(0);
            slotBg.setDepth(903);
            this.pauseContainer.add(slotBg);
            
            // Make slot interactive
            slotBg.setInteractive({ useHandCursor: true });
            
            // Slot number
            const slotNum = this.add.text(width / 2 - 250, y - 20, `SLOT ${index + 1}`, {
                fontFamily: 'Press Start 2P',
                fontSize: '14px',
                color: CONFIG.COLORS.primary
            }).setOrigin(0, 0.5);
            slotNum.setScrollFactor(0);
            slotNum.setDepth(904);
            this.pauseContainer.add(slotNum);
            
            // Save name / status
            const saveName = slot.exists ? slot.name : 'Empty Slot';
            const saveNameText = this.add.text(width / 2 - 250, y + 10, saveName, {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: slot.exists ? CONFIG.COLORS.text : CONFIG.COLORS.textDark
            }).setOrigin(0, 0.5);
            saveNameText.setScrollFactor(0);
            saveNameText.setDepth(904);
            this.pauseContainer.add(saveNameText);
            
            // Save details (if exists)
            if (slot.exists) {
                const details = `Day ${slot.day} | $${slot.money} | Level ${slot.level}`;
                const detailText = this.add.text(width / 2 - 250, y + 35, details, {
                    fontFamily: 'Arial',
                    fontSize: '12px',
                    color: CONFIG.COLORS.textDark
                }).setOrigin(0, 0.5);
                detailText.setScrollFactor(0);
                detailText.setDepth(904);
                this.pauseContainer.add(detailText);
                
                // Timestamp
                const date = new Date(slot.savedAt);
                const timeStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
                const timeText = this.add.text(width / 2 + 200, y + 10, timeStr, {
                    fontFamily: 'Arial',
                    fontSize: '11px',
                    color: CONFIG.COLORS.textDark
                }).setOrigin(0.5, 0.5);
                timeText.setScrollFactor(0);
                timeText.setDepth(904);
                this.pauseContainer.add(timeText);
            }
            
            // Click handler
            slotBg.on('pointerdown', () => {
                this.saveToSlot(index);
            });
            
            // Hover effect
            slotBg.on('pointerover', () => {
                slotBg.setFillStyle(slot.exists ? 0x2a4a2a : 0x3a3a3a);
            });
            slotBg.on('pointerout', () => {
                slotBg.setFillStyle(slot.exists ? 0x1a3a1a : 0x2a2a2a);
            });
        });
        
        // Back button
        const backBtn = this.createMenuButton(width / 2, height / 2 + 220, 200, 50, 'BACK', () => {
            this.closePauseMenu();
            this.openPauseMenu();
        });
        this.pauseContainer.add(backBtn);
    }
    
    /**
     * Save to a specific slot and show confirmation
     */
    saveToSlot(slotIndex) {
        const success = SaveLoadSystem.saveToSlot(this, slotIndex);
        
        // Close the save UI
        this.closePauseMenu();
        
        if (success) {
            this.showFloatingText('Game Saved!', CONFIG.COLORS.success);
        } else {
            this.showFloatingText('Save Failed!', CONFIG.COLORS.danger);
        }
    }
    
    /**
     * Close the pause menu
     */
    closePauseMenu() {
        if (this.pauseOverlay) {
            this.pauseOverlay.destroy();
            this.pauseOverlay = null;
        }
        if (this.pausePanel) {
            this.pausePanel.destroy();
            this.pausePanel = null;
        }
        if (this.pauseContainer) {
            this.pauseContainer.destroy();
            this.pauseContainer = null;
        }
    }
    
    /**
     * Generate fallback textures in case external assets fail to load
     * This ensures the game works even without external assets
     */
    generateFallbackTextures() {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Player texture (green square)
        graphics.fillStyle(0x00ff00, 1);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('player-top', 32, 32);
        graphics.clear();
        
        // Street tile (dark gray)
        graphics.fillStyle(0x333333, 1);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('tile-street', 32, 32);
        graphics.clear();
        
        // Sidewalk (light gray)
        graphics.fillStyle(0x666666, 1);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('tile-sidewalk', 32, 32);
        graphics.clear();
        
        // HUD bar (dark blue)
        graphics.fillStyle(0x1a1a2e, 1);
        graphics.fillRect(0, 0, 200, 30);
        graphics.generateTexture('hud-bar', 200, 30);
        graphics.clear();
        
        // Panel (dark purple)
        graphics.fillStyle(0x2a2a4e, 1);
        graphics.fillRect(0, 0, 400, 300);
        graphics.generateTexture('panel', 400, 300);
        graphics.clear();
        
        // Alley tile (darker gray)
        graphics.fillStyle(0x222222, 1);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('tile-alley', 32, 32);
        graphics.clear();
        
        // Concrete tile
        graphics.fillStyle(0x444444, 1);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('tile-concrete-cracked', 32, 32);
        graphics.clear();
        
        // Dirty floor
        graphics.fillStyle(0x3a3a3a, 1);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('tile-dirty-floor', 32, 32);
        graphics.clear();
        
        // Wood floor
        graphics.fillStyle(0x5c4033, 1);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('tile-wood-floor', 32, 32);
        graphics.clear();
        
        // Wall brick
        graphics.fillStyle(0x8b4513, 1);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('tile-wall-brick', 32, 32);
        graphics.clear();
        
        // Interior wall
        graphics.fillStyle(0xaaaaaa, 1);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('tile-wall-interior', 32, 32);
        graphics.clear();
        
        // Cardboard box (brown)
        graphics.fillStyle(0x8b6914, 1);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('cardboard-box', 32, 32);
        graphics.clear();
        
        // Storage unit (gray)
        graphics.fillStyle(0x555555, 1);
        graphics.fillRect(0, 0, 64, 48);
        graphics.generateTexture('storage-unit', 64, 48);
        graphics.clear();
        
        // Dumpster (dark green)
        graphics.fillStyle(0x2d5a27, 1);
        graphics.fillRect(0, 0, 48, 32);
        graphics.generateTexture('dumpster', 48, 32);
        graphics.clear();
        
        // Workstation (blue)
        graphics.fillStyle(0x3366cc, 1);
        graphics.fillRect(0, 0, 48, 32);
        graphics.generateTexture('workstation', 48, 32);
        graphics.clear();
        
        // NPC Vendor (cyan)
        graphics.fillStyle(0x00ffff, 1);
        graphics.fillCircle(16, 16, 16);
        graphics.generateTexture('npc-vendor', 32, 32);
        graphics.clear();
        
        // NPC Buyer (yellow)
        graphics.fillStyle(0xffff00, 1);
        graphics.fillCircle(16, 16, 16);
        graphics.generateTexture('npc-buyer', 32, 32);
        graphics.clear();
        
        // NPC Rival (red)
        graphics.fillStyle(0xff0000, 1);
        graphics.fillCircle(16, 16, 16);
        graphics.generateTexture('npc-rival', 32, 32);
        graphics.clear();
        
        // NPC Police (blue)
        graphics.fillStyle(0x0066ff, 1);
        graphics.fillCircle(16, 16, 16);
        graphics.generateTexture('npc-police', 32, 32);
        graphics.clear();
        
        // NPC Shop Owner (purple)
        graphics.fillStyle(0x9900ff, 1);
        graphics.fillCircle(16, 16, 16);
        graphics.generateTexture('npc-shop-owner', 32, 32);
        graphics.clear();
        
        // NPC Corrupt Cop (dark blue)
        graphics.fillStyle(0x003366, 1);
        graphics.fillCircle(16, 16, 16);
        graphics.generateTexture('npc-corrupt-cop', 32, 32);
        graphics.clear();
        
        // Icon Raw Materials (orange)
        graphics.fillStyle(0xff9900, 1);
        graphics.fillRect(0, 0, 24, 24);
        graphics.generateTexture('icon-raw', 24, 24);
        graphics.clear();
        
        // Icon Product (green)
        graphics.fillStyle(0x00cc00, 1);
        graphics.fillRect(0, 0, 24, 24);
        graphics.generateTexture('icon-product', 24, 24);
        
        graphics.destroy();
    }
}
