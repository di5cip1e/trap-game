import Phaser from 'phaser';
import { CONFIG } from './config.js';
import HUD from './HUD.js';
import TimeSystem from './TimeSystem.js';
import CalendarSystem from './CalendarSystem.js';
import Minimap from './Minimap.js';
import MapGenerator from './MapGenerator.js';
import SafehouseUI from './SafehouseUI.js';
import VendorUI from './VendorUI.js';
import WorkstationUI from './WorkstationUI.js';
import RivalEncounterUI from './RivalEncounterUI.js';
import EquipmentUI from './EquipmentUI.js';
import PoliceEncounterUI from './PoliceEncounterUI.js';
import RelationshipUI from './RelationshipUI.js';
import TutorialUI from './TutorialUI.js';
import SaveLoadSystem from './SaveLoadSystem.js';
// Mobile controls - already exists in rosie/controls/
import { MobileControlsManager, VirtualJoystick, ActionButton } from './rosie/controls/phaserMobileControls.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }
    
    init() {
        // Get character data from registry
        this.characterData = this.registry.get('characterData');
        
        // Check for loaded save data
        const loadSaveData = this.registry.get('loadSaveData');
        
        // Determine biome based on gender
        this.biomeType = this.characterData.gender === 'male' ? 'block' : 'traphouse';
        
        // Initialize player state
        this.playerState = {
            name: this.characterData.name,
            gender: this.characterData.gender,
            race: this.characterData.race,
            stats: { ...this.characterData.stats }, // Copy stats
            raceBonus: this.characterData.raceBonus || null,
            money: 100, // Starting money for tutorial
            hustle: CONFIG.MAX_HUSTLE,
            rawMaterials: 0,
            product: 0,
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
            unlockedSkills: []
        };
        
        // If loading a saved game, apply the save data
        if (loadSaveData) {
            SaveLoadSystem.applySaveData(this, loadSaveData);
            // Clear the registry to prevent reloading
            this.registry.set('loadSaveData', null);
        }
    }
    
    preload() {
        // Load game assets
        this.load.image('player-top', 'https://rosebud.ai/assets/player-top-down.png.webp?8YJk');
        this.load.image('tile-street', 'https://rosebud.ai/assets/tile-street.png.webp?ekRg');
        this.load.image('tile-sidewalk', 'https://rosebud.ai/assets/tile-sidewalk.png.webp?WAgM');
        this.load.image('hud-bar', 'https://rosebud.ai/assets/hud-panel-bar.png.webp?IDtt');
        this.load.image('panel', 'https://rosebud.ai/assets/ui-panel.png.webp?eL0r');
        
        // Load biome-specific tiles
        this.load.image('tile-alley', 'https://rosebud.ai/assets/tile-alley.png.webp?HvWg');
        this.load.image('tile-concrete-cracked', 'https://rosebud.ai/assets/tile-concrete-cracked.png.webp?uX48');
        this.load.image('tile-dirty-floor', 'https://rosebud.ai/assets/tile-dirty-floor.png.webp?3xwW');
        this.load.image('tile-wood-floor', 'https://rosebud.ai/assets/tile-wood-floor.png.webp?7QYt');
        this.load.image('tile-wall-brick', 'https://rosebud.ai/assets/tile-wall-brick.png.webp?IhUH');
        this.load.image('tile-wall-interior', 'https://rosebud.ai/assets/tile-wall-interior.png.webp?COiM');
        
        // Load objects
        this.load.image('cardboard-box', 'https://rosebud.ai/assets/cardboard-box.png.webp?ROVi');
        this.load.image('storage-unit', 'https://rosebud.ai/assets/storage-unit.webp?hVbG');
        this.load.image('dumpster', 'https://rosebud.ai/assets/tile-dumpster.png.webp?4ZFT');
        this.load.image('workstation', 'https://rosebud.ai/assets/workstation.png.webp?moWH');
        
        // Load NPCs
        this.load.image('npc-vendor', 'https://rosebud.ai/assets/npc-vendor.png.webp?8BrV');
        this.load.image('npc-buyer', 'https://rosebud.ai/assets/npc-buyer.png.webp?WVHF');
        this.load.image('npc-rival', 'https://rosebud.ai/assets/npc-rival.webp?gi7R');
        this.load.image('npc-police', 'https://rosebud.ai/assets/npc-police.webp?K9SU');
        this.load.image('npc-shop-owner', 'https://rosebud.ai/assets/npc-shop-owner.webp?vt7M');
        this.load.image('npc-corrupt-cop', 'https://rosebud.ai/assets/npc-corrupt-cop.webp?DHMq');
        
        // Load icons
        this.load.image('icon-raw', 'https://rosebud.ai/assets/icon-raw-materials.png.webp?X41g');
        this.load.image('icon-product', 'https://rosebud.ai/assets/icon-product.png.webp?PPUj');
    }
    
    create() {
        const { width, height } = this.scale;
        
        // Generate procedural map
        const mapGen = new MapGenerator(this, this.biomeType);
        const { map, objects, safehousePos } = mapGen.generate();
        
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
        this.tutorialUI = new TutorialUI(this);
        
        // Track current day for buyer spawning
        this.currentDay = 1;
        this.buyers = [];
        
        // Spawn initial buyers
        this.spawnDailyBuyers();
        
        // Spawn rival
        this.rival = null;
        this.rivalDefeated = false;
        this.spawnRival();
        
        // Police system
        this.police = null;
        this.policeState = 'none'; // 'none', 'patrol', 'chase'
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
                
                this.worldMap[y][x] = {
                    type: tileData.type,
                    sprite: tile,
                    walkable: tileData.walkable
                };
            }
        }
        
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
                sprite.setScale(0.12);
                sprite.setDepth(50);
                
                // Mark as non-walkable
                this.worldMap[obj.y][obj.x].walkable = false;
            } else if (obj.type === 'workstation') {
                sprite = this.add.image(
                    obj.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                    obj.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                    'workstation'
                );
                sprite.setScale(0.12);
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
                sprite.setScale(0.15);
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
                sprite.setScale(0.15);
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
            }
            
            obj.sprite = sprite;
            this.worldObjects.push(obj);
        });
        
        // Place vendor NPC
        this.placeVendor();
        
        // Place workstation near safehouse
        this.placeWorkstation();
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
        this.player.setScale(0.15);
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
               this.tutorialUI.isOpen;
    }
    
    /**
     * Setup mobile touch controls (joystick + action buttons)
     */
    setupMobileControls() {
        const { width, height } = this.scale;
        
        // Create mobile controls manager
        this.mobileControls = new MobileControlsManager(this);
        
        // Add virtual joystick in bottom-left corner
        // Position: 15% from left, 20% from bottom
        this.joystick = this.mobileControls.addJoystick({
            baseRadius: 70,
            knobRadius: 35,
            maxDistance: 55,
            x: width * 0.12,
            y: height * 0.78
        });
        
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
            this.tryMove(dx, dy);
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
            this.tryMove(dx > 0 ? 1 : -1, 0);
        } else if (dy !== 0) {
            this.tryMove(0, dy > 0 ? 1 : -1);
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
        if (this.playerState.isMoving || this.safehouseUI.isOpen || 
            this.vendorUI.isOpen || this.workstationUI.isOpen || 
            this.rivalEncounterUI.isOpen || this.equipmentUI.isOpen ||
            this.policeEncounterUI.isOpen || this.relationshipUI.isOpen) return;
        
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
        
        // Check keyboard input
        if (Phaser.Input.Keyboard.JustDown(this.cursors.left) || 
            Phaser.Input.Keyboard.JustDown(this.wasd.left)) {
            this.tryMove(-1, 0);
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right) || 
                   Phaser.Input.Keyboard.JustDown(this.wasd.right)) {
            this.tryMove(1, 0);
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || 
                   Phaser.Input.Keyboard.JustDown(this.wasd.up)) {
            this.tryMove(0, -1);
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down) || 
                   Phaser.Input.Keyboard.JustDown(this.wasd.down)) {
            this.tryMove(0, 1);
        }
    }
    
    checkInteractionProximity() {
        // Check all interactive objects
        this.worldObjects.forEach(obj => {
            if (!obj.indicator) return;
            
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
                } else if (obj.type === 'buyer') {
                    this.sellToBuyer(obj);
                    return;
                } else if (obj.type === 'shopOwner' || obj.type === 'corruptCop') {
                    this.relationshipUI.open(obj);
                    return;
                }
            }
        }
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
        sprite.setScale(0.15);
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
        shopSprite.setScale(0.13);
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
        copSprite.setScale(0.13);
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
            
            // Valid if walkable, not occupied, and far enough from player and safehouse
            if (this.worldMap[rivalY][rivalX].walkable &&
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
    
    triggerRivalEncounter() {
        // Prevent movement during encounter
        this.playerState.isMoving = true;
        
        // Open encounter UI
        this.rivalEncounterUI.open(this.rival, (playerWon) => {
            this.playerState.isMoving = false;
            
            if (playerWon) {
                // Remove rival from world
                if (this.rival.sprite) this.rival.sprite.destroy();
                if (this.rival.indicator) this.rival.indicator.destroy();
                const index = this.worldObjects.indexOf(this.rival);
                if (index > -1) this.worldObjects.splice(index, 1);
                
                this.rivalDefeated = true;
            } else {
                // Rival stays but player can try again
                // Could add cooldown here if desired
            }
        });
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
                this.hud.update();
                this.minimap.update();
                
                this.showFloatingText(`${customerConfig.name} stole ${stolenAmount} product and ran!`, CONFIG.COLORS.danger);
                
                // Add some heat from the theft
                this.playerState.heat = Math.min(CONFIG.MAX_HEAT, this.playerState.heat + 10);
                this.hud.update();
                return;
            }
        }
        
        // Calculate base price
        const heatPenalty = this.playerState.heat * CONFIG.HEAT_PENALTY_PER_POINT;
        const priceMultiplier = 1 - heatPenalty;
        const droughtMultiplier = this.calendarSystem.getProductSellMultiplier();
        
        // Apply customer type price multiplier
        let customerPriceMult = buyer.priceMultiplier || 1.0;
        
        // Check for quality bonus (Party Guy pays extra for quality)
        if (buyer.specialBehavior === 'quality') {
            const qualityBonus = buyer.qualityBonus || 0.2;
            customerPriceMult += qualityBonus;
        }
        
        // Apply player's price bonus (gold chain equipment)
        const playerPriceBonus = this.getPriceBonus();
        
        const finalPrice = Math.floor(
            CONFIG.PRODUCT_SELL_PRICE * 
            priceMultiplier * 
            droughtMultiplier * 
            customerPriceMult * 
            (1 + playerPriceBonus)
        );
        
        // Calculate how much to sell (customer's purchase amount or player's stock)
        const amountToSell = Math.min(buyer.purchaseAmount || 1, this.playerState.product);
        const totalEarned = finalPrice * amountToSell;
        
        // Apply sale
        this.playerState.money += totalEarned;
        this.playerState.product -= amountToSell;
        
        // Handle tip behavior (Old Head)
        if (buyer.specialBehavior === 'tip') {
            const tipChance = customerConfig?.tipChance || 0.25;
            const tipAmount = buyer.tipAmount || 50;
            if (Math.random() < tipChance) {
                this.playerState.money += tipAmount;
                this.showFloatingText(`+$${totalEarned} (incl. $${tipAmount} tip!)`, CONFIG.COLORS.success);
            } else {
                this.showFloatingText(`Sold! +$${totalEarned}`, CONFIG.COLORS.success);
            }
        } else {
            this.showFloatingText(`Sold! +$${totalEarned}`, CONFIG.COLORS.success);
        }
        
        // Add heat for dealing on the street
        const raceBonus = this.playerState.raceBonus;
        const heatResistance = raceBonus?.heatResistance || 0;
        const heatGainMultiplier = this.calendarSystem.getHeatMultiplier();
        const baseHeatGain = CONFIG.HEAT_GAIN_PER_SALE * heatGainMultiplier;
        const heatGain = Math.floor(baseHeatGain * (1 - heatResistance));
        this.playerState.heat = Math.min(CONFIG.MAX_HEAT, 
            this.playerState.heat + heatGain);
        
        // Remove buyer after transaction
        this.removeBuyer(buyer);
        
        this.hud.update();
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
            this.hud.update();
            this.minimap.update();
            this.showFloatingText(`Undercover cop took your bribe! -$${bribeCost}, Heat -30`, '#6699ff');
        } else if (Math.random() < bustChance) {
            // Busted!
            this.removeBuyer(buyer);
            this.hud.update();
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
                    
                    this.showFloatingText(`BUSTED! Lost ${productLost} product, $${cashLost}`, CONFIG.COLORS.danger);
                    this.hud.update();
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
            
            this.removeBuyer(buyer);
            this.hud.update();
            this.minimap.update();
            this.showFloatingText(`Sold to undercover! +$${totalEarned}`, CONFIG.COLORS.success);
            
            // Small heat gain from dealing
            this.playerState.heat = Math.min(CONFIG.MAX_HEAT, this.playerState.heat + 8);
            this.hud.update();
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
                // Would apply damage to player here if we had HP
                console.log(`${config.name} deals ${actualDamage} damage!`);
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
        if (this.playerState.activeStatuses.frozen) {
            const config = CONFIG.STATUS_EFFECTS.frozen;
            if (config.extraDamageMultiplier) {
                multiplier *= config.extraDamageMultiplier;
            }
            // Remove frozen after taking damage (one-time extra damage)
            delete this.playerState.activeStatuses.frozen;
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
        this.hud.update();
        
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
            console.log(`Enemy deals ${actualDamage} damage!`);
        }
        
        // Apply status effect
        if (skill.statusEffect) {
            this.applyStatus(skill.statusEffect, skill.statusDuration);
        }
    }
    
    tryMove(dx, dy) {
        // Check for status effects that prevent movement
        const statuses = this.playerState.activeStatuses;
        
        // Paralyzed: Cannot move at all
        if (statuses.paralyzed) {
            this.showFloatingText('Paralyzed! Cannot move!', '#ffcc00');
            return;
        }
        
        // Frozen: Cannot move
        if (statuses.frozen) {
            this.showFloatingText('Frozen! Cannot move!', '#00ccff');
            return;
        }
        
        // Stunned: Cannot act (already handled separately, but double-check)
        if (statuses.stunned) {
            this.showFloatingText('Stunned! Cannot act!', '#ff6600');
            return;
        }
        
        // Asleep: Cannot move
        if (statuses.asleep) {
            this.showFloatingText('Asleep! Wake up first!', '#6666ff');
            return;
        }
        
        // Confused: Random movement instead of intended
        if (statuses.confused) {
            const confuseRoll = Math.random();
            if (confuseRoll < 0.4) {
                // 40% chance to move in random wrong direction
                const directions = [
                    { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
                    { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
                ];
                const randomDir = directions[Math.floor(Math.random() * directions.length)];
                dx = randomDir.dx;
                dy = randomDir.dy;
                this.showFloatingText('Confused! Moving randomly!', '#ff66ff');
            }
        }
        
        // Slowed: 50% chance to fail movement (simulates slow speed)
        if (statuses.slowed) {
            if (Math.random() < 0.5) {
                this.showFloatingText('Slowed! Too slow to move!', '#9966ff');
                return;
            }
        }
        
        const newX = this.playerState.gridX + dx;
        const newY = this.playerState.gridY + dy;
        
        // Check bounds
        if (newX < 0 || newX >= CONFIG.GRID_WIDTH || 
            newY < 0 || newY >= CONFIG.GRID_HEIGHT) {
            return;
        }
        
        // Check if tile is walkable
        if (!this.worldMap[newY][newX].walkable) {
            return;
        }
        
        // Start movement
        this.playerState.isMoving = true;
        this.playerState.gridX = newX;
        this.playerState.gridY = newY;
        
        const targetX = newX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        const targetY = newY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        
        // Animate movement
        this.tweens.add({
            targets: this.player,
            x: targetX,
            y: targetY,
            duration: 150,
            ease: 'Linear',
            onComplete: () => {
                this.playerState.isMoving = false;
                this.events.emit('playerMoved');
            }
        });
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
        
        // Advance time
        this.timeSystem.advanceTime(CONFIG.MINUTES_PER_MOVE);
        
        // Update UI
        this.hud.update();
        this.minimap.update();
    }
    
    passOut() {
        this.playerState.isMoving = true; // Prevent movement during passout
        
        // Calculate penalty
        const penalty = Math.floor(this.playerState.money * CONFIG.HUSTLE_PASSOUT_PENALTY);
        this.playerState.money = Math.max(0, this.playerState.money - penalty);
        
        // Add heat if holding product (with race-based heat resistance)
        let heatGained = 0;
        if (this.playerState.product > 0) {
            const raceBonus = this.playerState.raceBonus;
            const heatResistance = raceBonus?.heatResistance || 0;
            const baseHeatGain = CONFIG.HEAT_GAIN_PASSOUT;
            heatGained = Math.floor(baseHeatGain * (1 - heatResistance));
            this.playerState.heat = Math.min(CONFIG.MAX_HEAT, this.playerState.heat + heatGained);
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
            
            this.hud.update();
            this.playerState.isMoving = false;
        });
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
    
    onNewDay() {
        // Decay heat
        this.playerState.heat = Math.max(0, this.playerState.heat - CONFIG.HEAT_DECAY_PER_DAY);
        
        // Check if day changed
        if (this.timeSystem.day !== this.currentDay) {
            this.currentDay = this.timeSystem.day;
            
            // Update calendar system
            this.calendarSystem.advanceDay(this.currentDay);
            
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
            
            this.hud.update();
            
            // Auto-save on new day
            SaveLoadSystem.saveGame(this);
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
        
        // Update safehouse sprite
        const safehouse = this.worldObjects.find(obj => obj.type === 'safehouse');
        if (safehouse && safehouse.safehouseSprite) {
            safehouse.safehouseSprite.setTexture(tier.sprite);
            safehouse.safehouseSprite.setScale(tier.scale);
        }
        
        // Update HUD
        this.hud.update();
        
        // Auto-save on safehouse upgrade
        SaveLoadSystem.saveGame(this);
        
        return true;
    }
    
    processRunnerSales() {
        const product = this.playerState.runnerProduct;
        
        // Get race bonus for runner success
        const raceBonus = this.playerState.raceBonus;
        const runnerSuccessBonus = raceBonus?.runnerSuccessBonus || 0;
        
        // Calculate bust chance based on intuition (reduced by race bonus)
        const intuition = this.playerState.stats.intuition || 0;
        const baseBustChance = CONFIG.RUNNER_BUST_BASE_CHANCE - (intuition * CONFIG.RUNNER_INTUITION_REDUCTION);
        // Apply race bonus - reduces bust chance further (success = avoiding bust)
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
            
            this.showRunnerMessage('RUNNER SUCCESS!', 
                `Sold ${product} product\nRevenue: $${totalRevenue}\nRunner Cut: $${runnerCut}\nYour Profit: $${playerProfit}`, 
                CONFIG.COLORS.success);
        }
        
        this.hud.update();
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
        this.hud.update();
        
        return true;
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
    
    getDetectionReduction() {
        if (this.playerState.equipment.designerSunglasses) {
            return CONFIG.EQUIPMENT.designerSunglasses.detectionReduction;
        }
        return 0;
    }
    
    updatePoliceSystem() {
        // Get race bonus for police spawn reduction
        const raceBonus = this.playerState.raceBonus;
        const policeSpawnReduction = raceBonus?.policeSpawnReduction || 0;
        // Increase heat threshold (harder to spawn police) - e.g., 50 * 1.10 = 55
        const adjustedHeatThreshold = Math.floor(CONFIG.HEAT_THRESHOLD_POLICE * (1 + policeSpawnReduction));
        
        // Check if police should spawn
        if (!this.police && this.playerState.heat >= adjustedHeatThreshold) {
            this.spawnPolice();
        }
        
        // Despawn police if heat drops below threshold
        if (this.police && this.playerState.heat < adjustedHeatThreshold) {
            this.despawnPolice();
            return;
        }
        
        // Update police behavior
        if (this.police) {
            if (this.policeState === 'patrol') {
                this.updatePolicePatrol();
                this.checkPoliceLineOfSight();
            } else if (this.policeState === 'chase') {
                this.updatePoliceChase();
            }
        }
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
            
            if (this.worldMap[policeY][policeX].walkable &&
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
        
        // Check if new position is walkable
        if (newX >= 0 && newX < CONFIG.GRID_WIDTH &&
            newY >= 0 && newY < CONFIG.GRID_HEIGHT &&
            this.worldMap[newY][newX].walkable) {
            
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
        
        // Check if new position is walkable
        if (newX >= 0 && newX < CONFIG.GRID_WIDTH &&
            newY >= 0 && newY < CONFIG.GRID_HEIGHT &&
            this.worldMap[newY][newX].walkable) {
            
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
}
