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
            race: CONFIG.RACES[0],
            stats: {
                intuition: 0,
                ability: 0,
                luck: 0
            },
            raceBonus: CONFIG.RACE_BONUSES[CONFIG.RACES[0]] || null
        };
        
        this.pointsRemaining = CONFIG.TOTAL_STAT_POINTS;
    }
    
    preload() {
        // Load assets
        this.load.image('background', 'https://rosebud.ai/assets/background-creation.png.webp?xy4i');
        this.load.image('panel', 'https://rosebud.ai/assets/ui-panel.png.webp?eL0r');
        this.load.image('male', 'https://rosebud.ai/assets/male-char.png.webp?jt3w');
        this.load.image('female', 'https://rosebud.ai/assets/female-char.png.webp?qKkE');
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
        
        // Check for saved game and show continue button
        if (SaveLoadSystem.hasSavedGame()) {
            this.showContinueButton(width, height);
        }
        
        // Handle resize
        this.scale.on('resize', this.handleResize, this);
    }
    
    showContinueButton(width, height) {
        // Continue button (only if save exists)
        const continueBtn = this.createButton(width / 2, height / 2 + 420, 280, 60, 'CONTINUE', () => {
            const saveData = SaveLoadSystem.loadGame();
            if (saveData) {
                // Set up character data from save
                this.characterData = {
                    name: saveData.name,
                    gender: saveData.gender,
                    race: saveData.race,
                    stats: saveData.stats,
                    raceBonus: saveData.raceBonus || null
                };
                
                // Store character data globally for next scene
                this.registry.set('characterData', this.characterData);
                this.registry.set('loadSaveData', saveData);
                
                // Transition to main game scene
                this.scene.start('GameScene');
            }
        });
        
        // Make continue button green
        continueBtn.bg.setFillStyle(0x228822);
        continueBtn.bg.setStrokeStyle(2, 0x44ff44);
        continueBtn.label.setColor('#ffffff');
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
        
        this.raceDisplay = this.add.text(0, 260, '', {
            fontFamily: 'Press Start 2P',
            fontSize: '16px',
            color: CONFIG.COLORS.textDark,
            align: 'center'
        }).setOrigin(0.5);
        previewContainer.add(this.raceDisplay);
        
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
        
        this.createRaceButtons(x, currentY);
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
    
    createRaceButtons(x, y) {
        const buttonWidth = 140;
        const spacing = 150;
        const rows = 2;
        const cols = 2;
        
        this.raceButtons = {};
        
        CONFIG.RACES.forEach((race, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;
            const btnX = x - spacing / 2 + col * spacing;
            const btnY = y + row * 50;
            
            const btn = this.createButton(btnX, btnY, buttonWidth, 40, race.toUpperCase(), () => {
                this.characterData.race = race;
                // Apply race stat bonuses
                const raceBonus = CONFIG.RACE_BONUSES[race];
                if (raceBonus && raceBonus.statBoosts) {
                    this.characterData.raceBonus = raceBonus;
                } else {
                    this.characterData.raceBonus = null;
                }
                this.updateRaceButtons();
                this.updateCharacterPreview();
            });
            
            this.raceButtons[race] = btn;
        });
        
        this.updateRaceButtons();
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
    
    updateRaceButtons() {
        Object.keys(this.raceButtons).forEach(race => {
            const btn = this.raceButtons[race];
            const isSelected = this.characterData.race === race;
            
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
        
        // Update race display
        this.raceDisplay.setText(this.characterData.race.toUpperCase());
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
