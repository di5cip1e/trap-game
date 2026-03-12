/**
 * GameScene refactoring example - showing how to integrate controllers
 * This is the PATTERN to follow, not the complete refactored file
 * (The full file would be too large)
 */

// Import controllers
import PlayerController from './PlayerController.js';
import MapController from './MapController.js';
import NPCController from './NPCController.js';
import SceneManager from './SceneManager.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }
    
    init() {
        // ... existing init code (playerState setup) ...
        
        // NEW: Initialize SceneManager with controllers
        this.sceneManager = new SceneManager(this, this.playerState);
    }
    
    create() {
        const { width, height } = this.scale;
        const { MapGenerator } = this.scene;
        
        // Generate map using MapController
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
        
        // NEW: Use MapController to create world
        this.sceneManager.createWorld(map, objects);
        
        // Store safehouse position
        this.safehousePos = safehousePos;
        
        // Set player start
        this.playerState.gridX = safehousePos.x + 2;
        this.playerState.gridY = safehousePos.y;
        
        // Create player sprite
        this.createPlayer();
        
        // Initialize other systems...
        this.timeSystem = new TimeSystem(this);
        this.calendarSystem = new CalendarSystem(this);
        this.minimap = new Minimap(this, width - 220, 20);
        this.hud = new HUD(this);
        // ... other UI systems ...
        
        // NEW: Initialize NPCs through NPCController
        this.sceneManager.initializeNPCs();
        
        // Setup controls
        this.setupControls();
        
        // Camera
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setZoom(1.2);
        
        // Bind movement to player controller
        this.events.on('playerMoved', () => {
            this.sceneManager.onPlayerMove();
        });
        
        // Show biome intro
        this.showBiomeIntro();
    }
    
    // ============================================================
    // CONTROLS - Updated to use SceneManager
    // ============================================================
    
    update(time, delta) {
        // Update quest system periodically
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
        
        // Combat scene
        if (this.combatScene && this.combatScene.isActive) {
            this.combatScene.update();
            return;
        }
        
        if (this.playerState.isMoving || this.isAnyUIOpen()) return;
        
        // World Map
        if (Phaser.Input.Keyboard.JustDown(this.worldMapKey)) {
            this.openWorldMap();
            return;
        }
        
        // NEW: Use SceneManager for joystick
        this.sceneManager.handleJoystickMovement(delta);
        
        // NEW: Use SceneManager for police/rival updates
        this.sceneManager.update(time, delta);
        
        // Check action key
        if (Phaser.Input.Keyboard.JustDown(this.actionKey)) {
            this.tryInteract();
        }
        
        // Skill tree
        if (Phaser.Input.Keyboard.JustDown(this.skillTreeKey)) {
            this.skillTree.openSkillTreeUI();
        }
        
        // Keyboard movement - delegate to PlayerController
        if (Phaser.Input.Keyboard.JustDown(this.cursors.left) || 
            Phaser.Input.Keyboard.JustDown(this.wasd.left)) {
            this.sceneManager.tryMove(-1, 0);
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right) || 
                   Phaser.Input.Keyboard.JustDown(this.wasd.right)) {
            this.sceneManager.tryMove(1, 0);
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || 
                   Phaser.Input.Keyboard.JustDown(this.wasd.up)) {
            this.sceneManager.tryMove(0, -1);
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down) || 
                   Phaser.Input.Keyboard.JustDown(this.wasd.down)) {
            this.sceneManager.tryMove(0, 1);
        }
    }
    
    // ============================================================
    // INTERACTIONS - Updated to use SceneManager
    // ============================================================
    
    tryInteract() {
        // Check interior exit first
        if (this.sceneManager.mapController.isIndoor && 
            this.sceneManager.checkInteriorExit()) {
            this.sceneManager.exitBuilding();
            return;
        }
        
        // Get nearby interactive object
        const obj = this.sceneManager.getNearbyInteractive();
        
        if (obj) {
            this.sceneManager.handleInteraction(obj);
        }
    }
    
    // Tap to move - delegate to PlayerController
    handleTapToMove(pointer) {
        // Ignore if in mobile control area or UI open
        if (this.isMobileControlArea(pointer)) return;
        if (this.playerState.isMoving || this.isAnyUIOpen()) return;
        
        // Handle tutorial
        if (this.tutorialUI.isOpen) {
            this.tutorialUI.handleClick(pointer.x, pointer.y);
            return;
        }
        
        // Delegate to PlayerController
        this.sceneManager.handleTapToMove(pointer);
    }
    
    // ============================================================
    // MAP/NEIGHBORHOOD - Use MapController
    // ============================================================
    
    generateMapForNeighborhood(neighborhoodKey) {
        this.sceneManager.generateMapForNeighborhood(neighborhoodKey);
    }
    
    checkNeighborhoodBorder() {
        this.sceneManager.checkNeighborhoodBorder();
    }
    
    // ============================================================
    // NEW DAY - Use SceneManager
    // ============================================================
    
    onNewDay() {
        // Decay heat
        this.playerState.heat = Math.max(0, this.playerState.heat - this.scene.CONFIG.HEAT_DECAY_PER_DAY);
        
        if (this.timeSystem.day !== this.currentDay) {
            this.currentDay = this.timeSystem.day;
            
            this.calendarSystem.advanceDay(this.currentDay);
            
            // Reset daily flags
            this.playerState.corruptCopUsedToday = false;
            
            // Decay NPC loyalty
            if (this.playerState.npcRelationships.shopOwner > 0) {
                this.playerState.npcRelationships.shopOwner = Math.max(0,
                    this.playerState.npcRelationships.shopOwner - this.scene.CONFIG.LOYALTY_DECAY_PER_DAY);
            }
            if (this.playerState.npcRelationships.corruptCop > 0) {
                this.playerState.npcRelationships.corruptCop = Math.max(0,
                    this.playerState.npcRelationships.corruptCop - this.scene.CONFIG.LOYALTY_DECAY_PER_DAY);
            }
            
            // Process runner sales
            if (this.playerState.hasRunner && this.playerState.runnerProduct > 0) {
                this.processRunnerSales();
            }
            
            // Charge runner daily fee
            if (this.playerState.hasRunner) {
                this.playerState.money = Math.max(0, this.playerState.money - this.scene.CONFIG.RUNNER_DAILY_FEE);
            }
            
            // NEW: Delegate to SceneManager for NPC spawning
            this.sceneManager.onNewDay();
            
            this.hud.update();
            SaveLoadSystem.saveGame(this);
        }
    }
    
    // ============================================================
    // EQUIPMENT - Use PlayerController
    // ============================================================
    
    purchaseEquipment(equipmentId) {
        return this.sceneManager.purchaseEquipment(equipmentId);
    }
    
    unequipEquipment(equipmentId) {
        return this.sceneManager.unequipEquipment(equipmentId);
    }
    
    sellEquipment(equipmentId) {
        return this.sceneManager.sellEquipment(equipmentId);
    }
    
    getEquipmentAttackBonus() {
        return this.sceneManager.getEquipmentAttackBonus();
    }
    
    hasRangeAttack() {
        return this.sceneManager.hasRangeAttack();
    }
    
    getPistolAmmoCost() {
        return this.sceneManager.getPistolAmmoCost();
    }
    
    getDamageReduction() {
        return this.sceneManager.getDamageReduction();
    }
    
    getHeatReduction() {
        return this.sceneManager.getHeatReduction();
    }
    
    getMovementSpeedBonus() {
        return this.sceneManager.getMovementSpeedBonus();
    }
    
    getVisionRangeBonus() {
        return this.sceneManager.getVisionRangeBonus();
    }
    
    getBuyerSpawnBonus() {
        return this.sceneManager.getBuyerSpawnBonus();
    }
    
    getPriceBonus() {
        return this.sceneManager.getPriceBonus();
    }
    
    getDetectionReduction() {
        return this.sceneManager.getDetectionReduction();
    }
    
    // ============================================================
    // SKILLS - Use PlayerController
    // ============================================================
    
    useSkill(skillKey) {
        return this.sceneManager.useSkill(skillKey);
    }
    
    unlockSkill(skillKey) {
        return this.sceneManager.unlockSkill(skillKey);
    }
    
    // ============================================================
    // OLD METHODS - Can be removed after full migration
    // ============================================================
    
    // These methods are now handled by controllers
    // They can be kept for backward compatibility during transition
    
    /*
    // OLD: tryMove - now in PlayerController
    tryMove(dx, dy) {
        // Deprecated - use this.sceneManager.tryMove()
    }
    
    // OLD: createWorld - now in MapController
    createWorld(mapData, objects) {
        // Deprecated - use this.sceneManager.createWorld()
    }
    
    // OLD: spawnDailyBuyers - now in NPCController
    spawnDailyBuyers() {
        // Deprecated - use this.sceneManager.spawnDailyBuyers()
    }
    
    // OLD: spawnRival - now in NPCController
    spawnRival() {
        // Deprecated - use this.sceneManager.npcController.spawnRival()
    }
    
    // OLD: updatePoliceSystem - now in NPCController
    updatePoliceSystem() {
        // Deprecated - use this.sceneManager.npcController.updatePoliceSystem()
    }
    */
}
