import Phaser from 'phaser';
import { CONFIG } from './config.js';
import SaveLoadSystem from './SaveLoadSystem.js';

export default class CharacterCreationScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CharacterCreationScene' });
        
        // Character data
        this.characterData = {
            name: '',
            gender: 'male',
            neighborhood: CONFIG.NEIGHBORHOODS[0],
            stats: {
                intuition: 0,
                ability: 0,
                luck: 0
            },
            neighborhoodBonus: CONFIG.NEIGHBORHOOD_BONUSES[CONFIG.NEIGHBORHOODS[0]] || null
        };
        
        this.pointsRemaining = CONFIG.TOTAL_STAT_POINTS;
    }
    
    preload() {
        // Load assets
        this.load.image('background', 'assets/background-creation.png');
        this.load.image('panel', 'assets/ui-panel.png');
        this.load.image('male', 'assets/male-char.png');
        this.load.image('female', 'assets/female-char.png');
    }
    
    create() {
        const { width, height } = this.scale;
        
        // Background
        const bg = this.add.image(width / 2, height / 2, 'background');
        bg.setDisplaySize(width, height);
        bg.setAlpha(0.7);
        
        // Add dark overlay
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.5);
        
        // Title
        this.add.text(width / 2, 80, 'CREATE YOUR IDENTITY', {
            fontFamily: 'Press Start 2P',
            fontSize: '42px',
            color: CONFIG.COLORS.primary,
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Main panel
        const panel = this.add.image(width / 2, height / 2 + 20, 'panel');
        panel.setDisplaySize(width * 0.9, height * 0.75);
        panel.setAlpha(0.85);
        
        // Left side - Character preview
        this.createCharacterPreview(width * 0.25, height / 2);
        
        // Right side - Form
        this.createForm(width * 0.6, height / 2 - 200);
        
        // Check for saved games in any slot and show load button
        const hasAnySave = SaveLoadSystem.getAllSlots().some(s => s.exists);
        if (hasAnySave) {
            this.showLoadGameButton(width, height);
        }
        
        // Handle resize
        this.scale.on('resize', this.handleResize, this);
    }
    
    /**
     * Show load game button that opens slot selection
     */
    showLoadGameButton(width, height) {
        // LOAD GAME button
        const loadBtn = this.createButton(width / 2 - 160, height / 2 + 420, 280, 60, 'LOAD GAME', () => {
            this.showLoadSlotSelection();
        });
        
        // Make load button green
        loadBtn.bg.setFillStyle(0x228822);
        loadBtn.bg.setStrokeStyle(2, 0x44ff44);
        loadBtn.label.setColor('#ffffff');
        
        // New Game+ button - appears for any save (allows replay with bonuses)
        // Use most recent save for NG+
        const slots = SaveLoadSystem.getAllSlots();
        const recentSave = slots.find(s => s.exists);
        if (recentSave) {
            const saveData = SaveLoadSystem.loadFromSlot(recentSave.slot);
            if (saveData) {
                this.showNewGamePlusButton(width, height, saveData);
            }
        }
    }
    
    /**
     * Show save slot selection for loading
     */
    showLoadSlotSelection() {
        const { width, height } = this.scale;
        
        // Darken background
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);
        overlay.setDepth(1000);
        overlay.setInteractive();
        
        // Main panel
        const panel = this.add.image(width / 2, height / 2, 'panel');
        panel.setDisplaySize(800, 600);
        panel.setDepth(1001);
        
        // Title
        const title = this.add.text(width / 2, height / 2 - 250, 'SELECT SAVE TO LOAD', {
            fontFamily: 'Press Start 2P',
            fontSize: '28px',
            color: CONFIG.COLORS.primary,
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        title.setDepth(1002);
        
        // Get all slots
        const slots = SaveLoadSystem.getAllSlots();
        
        // Display save slots
        const slotYStart = height / 2 - 150;
        const slotHeight = 100;
        
        slots.forEach((slot, index) => {
            const y = slotYStart + index * (slotHeight + 20);
            
            // Slot background - only interactive if save exists
            const slotBg = this.add.rectangle(width / 2, y, 600, slotHeight, slot.exists ? 0x1a3a1a : 0x2a2a2a);
            slotBg.setStrokeStyle(2, slot.exists ? CONFIG.COLORS.success : CONFIG.COLORS.textDark);
            slotBg.setDepth(1002);
            
            if (slot.exists) {
                slotBg.setInteractive({ useHandCursor: true });
                
                // Slot number
                const slotNum = this.add.text(width / 2 - 250, y - 20, `SLOT ${index + 1}`, {
                    fontFamily: 'Press Start 2P',
                    fontSize: '14px',
                    color: CONFIG.COLORS.primary
                }).setOrigin(0, 0.5);
                slotNum.setDepth(1003);
                
                // Save name
                const saveName = this.add.text(width / 2 - 250, y + 10, slot.name, {
                    fontFamily: 'Arial',
                    fontSize: '16px',
                    color: CONFIG.COLORS.text
                }).setOrigin(0, 0.5);
                saveName.setDepth(1003);
                
                // Save details
                const details = `Day ${slot.day} | $${slot.money} | Level ${slot.level}`;
                const detailText = this.add.text(width / 2 - 250, y + 35, details, {
                    fontFamily: 'Arial',
                    fontSize: '12px',
                    color: CONFIG.COLORS.textDark
                }).setOrigin(0, 0.5);
                detailText.setDepth(1003);
                
                // Timestamp
                const date = new Date(slot.savedAt);
                const timeStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
                const timeText = this.add.text(width / 2 + 200, y + 10, timeStr, {
                    fontFamily: 'Arial',
                    fontSize: '11px',
                    color: CONFIG.COLORS.textDark
                }).setOrigin(0.5, 0.5);
                timeText.setDepth(1003);
                
                // Click handler - load from this slot
                slotBg.on('pointerdown', () => {
                    this.loadFromSlot(index);
                });
                
                // Hover effect
                slotBg.on('pointerover', () => {
                    slotBg.setFillStyle(0x2a4a2a);
                });
                slotBg.on('pointerout', () => {
                    slotBg.setFillStyle(0x1a3a1a);
                });
                
                // Delete button (X)
                const deleteBtn = this.add.text(width / 2 + 260, y - 30, '🗑️', {
                    fontSize: '20px'
                }).setDepth(1003);
                deleteBtn.setInteractive({ useHandCursor: true });
                deleteBtn.on('pointerdown', (e) => {
                    e.stopPropagation();
                    this.confirmDeleteSlot(index);
                });
            } else {
                // Empty slot display
                const slotNum = this.add.text(width / 2 - 250, y, `SLOT ${index + 1} - EMPTY`, {
                    fontFamily: 'Press Start 2P',
                    fontSize: '14px',
                    color: CONFIG.COLORS.textDark
                }).setOrigin(0, 0.5);
                slotNum.setDepth(1003);
            }
        });
        
        // Back button
        const backBtn = this.createMenuButton(width / 2, height / 2 + 220, 200, 50, 'BACK', () => {
            overlay.destroy();
            panel.destroy();
            title.destroy();
            // Destroy all slot elements
            this.children.list.filter(c => c.depth >= 1002).forEach(c => c.destroy());
        });
        backBtn.setDepth(1002);
    }
    
    /**
     * Confirm and delete a save slot
     */
    confirmDeleteSlot(slotIndex) {
        const { width, height } = this.scale;
        
        // Simple confirmation - just delete
        SaveLoadSystem.deleteSlot(slotIndex);
        
        // Refresh the slot selection UI
        this.children.list.filter(c => c.depth >= 1000).forEach(c => c.destroy());
        this.showLoadSlotSelection();
    }
    
    /**
     * Load game from a specific slot
     */
    loadFromSlot(slotIndex) {
        const saveData = SaveLoadSystem.loadFromSlot(slotIndex);
        
        if (!saveData) {
            console.error('Failed to load save from slot', slotIndex);
            return;
        }
        
        // Set up character data from save
        this.characterData = {
            name: saveData.name,
            gender: saveData.gender,
            neighborhood: saveData.neighborhood || saveData.race,
            stats: saveData.stats,
            neighborhoodBonus: saveData.neighborhoodBonus || saveData.raceBonus || null
        };
        
        // Store character data globally for next scene
        this.registry.set('characterData', this.characterData);
        this.registry.set('loadSaveData', saveData);
        this.registry.set('isNewGamePlus', false);
        
        // Transition to main game scene
        this.scene.start('GameScene');
    }
    
    /**
     * Create a menu button (smaller, simpler than createButton)
     */
    createMenuButton(x, y, width, height, text) {
        const btn = this.add.rectangle(x, y, width, height, 0x2a2a2a);
        btn.setStrokeStyle(2, CONFIG.COLORS.primary);
        btn.setInteractive({ useHandCursor: true });
        
        const label = this.add.text(x, y, text, {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: CONFIG.COLORS.text
        }).setOrigin(0.5);
        
        btn.on('pointerover', () => {
            btn.setFillStyle(0x3a3a3a);
        });
        btn.on('pointerout', () => {
            btn.setFillStyle(0x2a2a2a);
        });
        
        return { bg: btn, label: label };
    }
    
    showContinueButton(width, height) {
        // Load existing save data to check for New Game+ eligibility
        const saveData = SaveLoadSystem.loadGame();
        
        if (!saveData) return; // No save exists
        
        // Continue button (only if save exists)
        const continueBtn = this.createButton(width / 2 - 160, height / 2 + 420, 280, 60, 'CONTINUE', () => {
            if (saveData) {
                // Set up character data from save
                this.characterData = {
                    name: saveData.name,
                    gender: saveData.gender,
                    neighborhood: saveData.neighborhood || saveData.race, // backward compat
                    stats: saveData.stats,
                    neighborhoodBonus: saveData.neighborhoodBonus || saveData.raceBonus || null
                };
                
                // Store character data globally for next scene
                this.registry.set('characterData', this.characterData);
                this.registry.set('loadSaveData', saveData);
                this.registry.set('isNewGamePlus', false); // Regular continue
                
                // Transition to main game scene
                this.scene.start('GameScene');
            }
        });
        
        // Make continue button green
        continueBtn.bg.setFillStyle(0x228822);
        continueBtn.bg.setStrokeStyle(2, 0x44ff44);
        continueBtn.label.setColor('#ffffff');
        
        // New Game+ button - appears for any save (allows replay with bonuses)
        this.showNewGamePlusButton(width, height, saveData);
    }
    
    showNewGamePlusButton(width, height, saveData) {
        // Get NG+ count from save (default to 0)
        const ngpCount = saveData.newGamePlusCount || 0;
        const ngpLabel = ngpCount > 0 ? `NEW GAME+${ngpCount}` : 'NEW GAME+';
        
        const ngpBtn = this.createButton(width / 2 + 160, height / 2 + 420, 280, 60, ngpLabel, () => {
            if (saveData) {
                // Calculate NG+ bonuses from previous save
                const previousMoney = saveData.money || 0;
                const carryOverMoney = Math.floor(previousMoney * 0.1); // 10% carry over
                
                // Unlock all neighborhoods
                const allNeighborhoods = ['OLD_TOWN', 'SKID_ROW', 'THE_FLATS', 'IRONWORKS', 'THE_HARBOR', 'THE_MAW', 'INDUSTRIAL_ZONE', 'SALVAGE_YARD'];
                
                // Keep achievements - copy level, XP, skills, class
                const ngpSaveData = {
                    ...saveData,
                    // Increment NG+ count
                    newGamePlusCount: ngpCount + 1,
                    
                    // Reset character but keep some stats
                    name: saveData.name,
                    gender: saveData.gender,
                    neighborhood: saveData.neighborhood || saveData.race || 'Old Town',
                    neighborhoodBonus: saveData.neighborhoodBonus || saveData.raceBonus || null,
                    stats: { ...saveData.stats },
                    
                    // Carry over money (10%)
                    money: carryOverMoney,
                    ngpMoneyCarriedOver: carryOverMoney,
                    
                    // Unlock all neighborhoods from start
                    unlockedNeighborhoods: allNeighborhoods,
                    visitedNeighborhoods: allNeighborhoods,
                    
                    // Keep achievements (level, XP, skills, class)
                    level: saveData.level || 1,
                    xp: saveData.xp || 0,
                    xpToNextLevel: saveData.xpToNextLevel || 100,
                    abilityPoints: saveData.abilityPoints || 0,
                    statPoints: saveData.statPoints || 0,
                    classType: saveData.classType,
                    unlockedSkills: saveData.unlockedSkills ? [...saveData.unlockedSkills] : [],
                    skillCooldowns: {},
                    
                    // Reset gameplay progress
                    rawMaterials: 0,
                    product: 0,
                    heat: 0,
                    hustle: 10,
                    currentDay: 1,
                    week: 1,
                    calendarEvents: [],
                    hasRunner: false,
                    runnerProduct: 0,
                    gridX: 15,
                    gridY: 15,
                    safehouseTier: 1,
                    questSystem: null,
                    supplierRelations: { ...saveData.supplierRelations }, // Keep supplier relations
                    npcRelationships: {},
                    corruptCopUsedToday: false,
                    
                    // Keep achievements data
                    achievements: saveData.achievements,
                    
                    // Track NG+ specific unlocked items
                    ngpUnlockedItems: ngpCount > 0 ? (saveData.ngpUnlockedItems || []) : []
                };
                
                // Set up character data for new game+
                this.characterData = {
                    name: saveData.name,
                    gender: saveData.gender,
                    neighborhood: ngpSaveData.neighborhood,
                    stats: ngpSaveData.stats,
                    neighborhoodBonus: ngpSaveData.neighborhoodBonus
                };
                
                // Store character data globally for next scene
                this.registry.set('characterData', this.characterData);
                this.registry.set('loadSaveData', ngpSaveData);
                this.registry.set('isNewGamePlus', true); // Mark as NG+ start
                this.registry.set('newGamePlusCount', ngpCount + 1);
                
                // Show NG+ info message
                this.showNewGamePlusMessage(width, height, ngpCount + 1, carryOverMoney);
                
                // Transition to main game scene
                this.scene.start('GameScene');
            }
        });
        
        // Make NG+ button purple/gold
        ngpBtn.bg.setFillStyle(0x6633aa);
        ngpBtn.bg.setStrokeStyle(2, 0xffcc00);
        ngpBtn.label.setColor('#ffcc00');
    }
    
    showNewGamePlusMessage(width, height, ngpCount, carryOverMoney) {
        // Display a temporary message about NG+ bonuses
        const message = `NEW GAME+${ngpCount}\n\n10% Money: $${carryOverMoney}\nAll Neighborhoods Unlocked\nAchievements Kept\nDifficulty Increased!`;
        
        const msgBox = this.add.text(width / 2, height / 2, message, {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: '#ffcc00',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4,
            backgroundColor: '#1a0a2e',
            padding: { x: 20, y: 20 }
        }).setOrigin(0.5).setDepth(2000);
        
        // Auto-dismiss after 3 seconds
        this.time.delayedCall(3000, () => {
            msgBox.destroy();
        });
    }
    
    createButton(x, y, width, height, text, callback) {
        const container = this.add.container(x, y);
        
        const bg = this.add.rectangle(0, 0, width, height, 0x2a2a2a);
        bg.setStrokeStyle(2, 0x666666);
        
        const label = this.add.text(0, 0, text, {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: '#aaaaaa'
        }).setOrigin(0.5);
        
        container.add([bg, label]);
        
        container.setSize(width, height);
        container.setInteractive({ useHandCursor: true });
        
        container.on('pointerover', () => {
            bg.setFillStyle(0x444444);
            label.setColor('#ffffff');
        });
        
        container.on('pointerout', () => {
            bg.setFillStyle(0x2a2a2a);
            label.setColor('#aaaaaa');
        });
        
        container.on('pointerdown', () => {
            bg.setFillStyle(0x111111);
        });
        
        container.on('pointerup', () => {
            bg.setFillStyle(0x444444);
            callback();
        });
        
        container.bg = bg;
        container.label = label;
        
        return container;
    }
    
    createCharacterPreview(x, y) {
        const previewContainer = this.add.container(x, y);
        
        // Character sprite
        this.characterSprite = this.add.image(0, 0, 'male');
        this.characterSprite.setScale(0.4);
        previewContainer.add(this.characterSprite);
        
        // Character info display
        this.nameDisplay = this.add.text(0, 220, '', {
            fontFamily: 'Press Start 2P',
            fontSize: '20px',
            color: CONFIG.COLORS.text,
            align: 'center'
        }).setOrigin(0.5);
        previewContainer.add(this.nameDisplay);
        
        this.neighborhoodDisplay = this.add.text(0, 260, '', {
            fontFamily: 'Press Start 2P',
            fontSize: '16px',
            color: CONFIG.COLORS.textDark,
            align: 'center'
        }).setOrigin(0.5);
        previewContainer.add(this.neighborhoodDisplay);
        
        this.updateCharacterPreview();
    }
    
    createForm(x, y) {
        let currentY = y;
        
        // Name input section
        this.add.text(x, currentY, 'NAME:', {
            fontFamily: 'Press Start 2P',
            fontSize: '18px',
            color: CONFIG.COLORS.primary
        }).setOrigin(0.5);
        currentY += 40;
        
        // Create HTML input for name
        this.createNameInput(x, currentY);
        currentY += 80;
        
        // Gender selection
        this.add.text(x, currentY, 'GENDER:', {
            fontFamily: 'Press Start 2P',
            fontSize: '18px',
            color: CONFIG.COLORS.primary
        }).setOrigin(0.5);
        currentY += 40;
        
        this.createGenderButtons(x, currentY);
        currentY += 80;
        
        // Race selection
        this.add.text(x, currentY, 'BACKGROUND:', {
            fontFamily: 'Press Start 2P',
            fontSize: '18px',
            color: CONFIG.COLORS.primary
        }).setOrigin(0.5);
        currentY += 40;
        
        this.createNeighborhoodButtons(x, currentY);
        currentY += 100;
        
        // Stats section
        this.add.text(x, currentY, 'ATTRIBUTES:', {
            fontFamily: 'Press Start 2P',
            fontSize: '18px',
            color: CONFIG.COLORS.primary
        }).setOrigin(0.5);
        currentY += 30;
        
        this.pointsText = this.add.text(x, currentY, `Points: ${this.pointsRemaining}`, {
            fontFamily: 'Press Start 2P',
            fontSize: '16px',
            color: CONFIG.COLORS.success
        }).setOrigin(0.5);
        currentY += 50;
        
        this.createStatControls(x, currentY);
        currentY += 220;
        
        // Start button
        this.createStartButton(x, currentY);
    }
    
    createNameInput(x, y) {
        const { width, height } = this.scale;
        
        // Clean up any existing input to prevent memory leaks
        this.destroyNameInput();
        
        // Create DOM input element
        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = 12;
        input.placeholder = 'Enter name...';
        input.style.position = 'absolute';
        input.style.left = `${x + width / 2 - 150}px`;
        input.style.top = `${y + height / 2 - 20}px`;
        input.style.width = '300px';
        input.style.height = '40px';
        input.style.fontSize = '18px';
        input.style.fontFamily = 'Press Start 2P';
        input.style.backgroundColor = '#1a1a1a';
        input.style.color = '#ffffff';
        input.style.border = '2px solid #ffcc00';
        input.style.padding = '5px 10px';
        input.style.textAlign = 'center';
        
        input.addEventListener('input', (e) => {
            this.characterData.name = e.target.value;
            this.updateCharacterPreview();
        });
        
        document.body.appendChild(input);
        this.nameInput = input;
        
        // Ensure cleanup on scene shutdown
        this.events.once('shutdown', this.destroyNameInput);
    }
    
    destroyNameInput() {
        // Clean up the DOM input element to prevent memory leaks
        if (this.nameInput) {
            if (this.nameInput.parentNode) {
                this.nameInput.parentNode.removeChild(this.nameInput);
            }
            // Remove event listeners to prevent memory leaks
            this.nameInput.replaceWith(this.nameInput.cloneNode(false));
            this.nameInput = null;
        }
    }
    
    createGenderButtons(x, y) {
        const buttonWidth = 120;
        const spacing = 140;
        
        // Male button
        const maleBtn = this.createButton(x - spacing / 2, y, buttonWidth, 40, 'MALE', () => {
            this.characterData.gender = 'male';
            this.updateGenderButtons();
            this.updateCharacterPreview();
        });
        
        // Female button
        const femaleBtn = this.createButton(x + spacing / 2, y, buttonWidth, 40, 'FEMALE', () => {
            this.characterData.gender = 'female';
            this.updateGenderButtons();
            this.updateCharacterPreview();
        });
        
        this.genderButtons = { male: maleBtn, female: femaleBtn };
        this.updateGenderButtons();
    }
    
    createNeighborhoodButtons(x, y) {
        const buttonWidth = 140;
        const spacing = 150;
        const rows = 2;
        const cols = 2;
        
        this.neighborhoodButtons = {};
        
        CONFIG.NEIGHBORHOODS.forEach((neighborhood, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;
            const btnX = x - spacing / 2 + col * spacing;
            const btnY = y + row * 50;
            
            const btn = this.createButton(btnX, btnY, buttonWidth, 40, neighborhood.toUpperCase(), () => {
                this.characterData.neighborhood = neighborhood;
                // Apply neighborhood stat bonuses
                const neighborhoodBonus = CONFIG.NEIGHBORHOOD_BONUSES[neighborhood];
                if (neighborhoodBonus && neighborhoodBonus.statBoosts) {
                    this.characterData.neighborhoodBonus = neighborhoodBonus;
                } else {
                    this.characterData.neighborhoodBonus = null;
                }
                this.updateNeighborhoodButtons();
                this.updateCharacterPreview();
            });
            
            this.neighborhoodButtons[neighborhood] = btn;
        });
        
        this.updateNeighborhoodButtons();
    }
    
    createStatControls(x, y) {
        const stats = ['intuition', 'ability', 'luck'];
        const spacing = 70;
        
        this.statControls = {};
        
        stats.forEach((stat, index) => {
            const statY = y + index * spacing;
            
            // Stat name
            this.add.text(x - 150, statY, stat.toUpperCase(), {
                fontFamily: 'Press Start 2P',
                fontSize: '14px',
                color: CONFIG.COLORS.text
            }).setOrigin(1, 0.5);
            
            // Minus button
            const minusBtn = this.createButton(x - 80, statY, 40, 40, '-', () => {
                this.adjustStat(stat, -1);
            });
            
            // Stat value
            const valueText = this.add.text(x, statY, '0', {
                fontFamily: 'Press Start 2P',
                fontSize: '20px',
                color: CONFIG.COLORS.primary
            }).setOrigin(0.5);
            
            // Plus button
            const plusBtn = this.createButton(x + 80, statY, 40, 40, '+', () => {
                this.adjustStat(stat, 1);
            });
            
            // Tooltip icon
            const tooltip = this.add.text(x + 150, statY, '?', {
                fontFamily: 'Press Start 2P',
                fontSize: '16px',
                color: CONFIG.COLORS.textDark
            }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
            
            tooltip.on('pointerover', () => {
                this.showTooltip(stat, x + 180, statY);
            });
            
            tooltip.on('pointerout', () => {
                this.hideTooltip();
            });
            
            this.statControls[stat] = { minusBtn, valueText, plusBtn };
        });
    }
    
    createStartButton(x, y) {
        this.startBtn = this.createButton(x, y, 200, 50, 'START', () => {
            this.startGame();
        });
        
        // Initially disabled if no name
        this.updateStartButton();
    }
    
    createButton(x, y, width, height, text, callback) {
        const container = this.add.container(x, y);
        
        const bg = this.add.rectangle(0, 0, width, height, 0x2a2a2a);
        bg.setStrokeStyle(2, 0xffcc00);
        
        const label = this.add.text(0, 0, text, {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: CONFIG.COLORS.text
        }).setOrigin(0.5);
        
        container.add([bg, label]);
        container.setSize(width, height);
        container.setInteractive({ useHandCursor: true });
        
        container.on('pointerover', () => {
            bg.setFillStyle(0x3a3a3a);
            label.setColor(CONFIG.COLORS.primary);
        });
        
        container.on('pointerout', () => {
            bg.setFillStyle(0x2a2a2a);
            label.setColor(CONFIG.COLORS.text);
        });
        
        container.on('pointerdown', () => {
            bg.setFillStyle(0x1a1a1a);
        });
        
        container.on('pointerup', () => {
            bg.setFillStyle(0x3a3a3a);
            if (callback) callback();
        });
        
        // Store references
        container.bg = bg;
        container.label = label;
        
        return container;
    }
    
    adjustStat(stat, delta) {
        const newValue = this.characterData.stats[stat] + delta;
        
        // Check if we have points available or are removing
        if (delta > 0 && this.pointsRemaining <= 0) return;
        if (newValue < CONFIG.MIN_STAT || newValue > CONFIG.MAX_STAT) return;
        
        this.characterData.stats[stat] = newValue;
        this.pointsRemaining -= delta;
        
        this.updateStatDisplay();
        this.updateStartButton();
    }
    
    updateStatDisplay() {
        Object.keys(this.statControls).forEach(stat => {
            const value = this.characterData.stats[stat];
            this.statControls[stat].valueText.setText(value.toString());
        });
        
        this.pointsText.setText(`Points: ${this.pointsRemaining}`);
        
        // Change color based on points remaining
        if (this.pointsRemaining === 0) {
            this.pointsText.setColor(CONFIG.COLORS.success);
        } else if (this.pointsRemaining < 3) {
            this.pointsText.setColor(CONFIG.COLORS.primary);
        } else {
            this.pointsText.setColor(CONFIG.COLORS.text);
        }
    }
    
    updateGenderButtons() {
        Object.keys(this.genderButtons).forEach(gender => {
            const btn = this.genderButtons[gender];
            const isSelected = this.characterData.gender === gender;
            
            if (isSelected) {
                btn.bg.setFillStyle(0xffcc00);
                btn.bg.setStrokeStyle(2, 0xffffff);
                btn.label.setColor('#000000');
            } else {
                btn.bg.setFillStyle(0x2a2a2a);
                btn.bg.setStrokeStyle(2, 0xffcc00);
                btn.label.setColor(CONFIG.COLORS.text);
            }
        });
    }
    
    updateNeighborhoodButtons() {
        Object.keys(this.neighborhoodButtons).forEach(neighborhood => {
            const btn = this.neighborhoodButtons[neighborhood];
            const isSelected = this.characterData.neighborhood === neighborhood;
            
            if (isSelected) {
                btn.bg.setFillStyle(0xffcc00);
                btn.bg.setStrokeStyle(2, 0xffffff);
                btn.label.setColor('#000000');
            } else {
                btn.bg.setFillStyle(0x2a2a2a);
                btn.bg.setStrokeStyle(2, 0xffcc00);
                btn.label.setColor(CONFIG.COLORS.text);
            }
        });
    }
    
    updateCharacterPreview() {
        // Update sprite
        this.characterSprite.setTexture(this.characterData.gender);
        
        // Update name display
        const displayName = this.characterData.name || '???';
        this.nameDisplay.setText(displayName);
        
        // Update neighborhood display
        this.neighborhoodDisplay.setText(this.characterData.neighborhood.toUpperCase());
    }
    
    updateStartButton() {
        const canStart = this.characterData.name.length > 0 && this.pointsRemaining === 0;
        
        if (canStart) {
            this.startBtn.bg.setFillStyle(0x66ff66);
            this.startBtn.bg.setStrokeStyle(2, 0xffffff);
            this.startBtn.label.setColor('#000000');
            this.startBtn.setAlpha(1);
        } else {
            this.startBtn.bg.setFillStyle(0x2a2a2a);
            this.startBtn.bg.setStrokeStyle(2, 0x666666);
            this.startBtn.label.setColor('#666666');
            this.startBtn.setAlpha(0.5);
        }
    }
    
    showTooltip(stat, x, y) {
        if (this.tooltipText) this.tooltipText.destroy();
        
        this.tooltipText = this.add.text(x, y, CONFIG.STAT_DESCRIPTIONS[stat], {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 8 },
            wordWrap: { width: 300 }
        }).setOrigin(0, 0.5).setDepth(1000);
    }
    
    hideTooltip() {
        if (this.tooltipText) {
            this.tooltipText.destroy();
            this.tooltipText = null;
        }
    }
    
    startGame() {
        const canStart = this.characterData.name.length > 0 && this.pointsRemaining === 0;
        
        if (!canStart) return;
        
        // Store character data globally for next scene
        this.registry.set('characterData', this.characterData);
        
        // Transition to main game scene
        this.scene.start('GameScene');
    }
    
    handleResize(gameSize) {
        // Reposition elements on resize if needed
        // For now, we're using relative positioning in create()
    }
}
