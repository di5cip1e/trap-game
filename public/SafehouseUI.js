import Phaser from 'phaser';
import { CONFIG } from './config.js';
import SaveLoadSystem from './SaveLoadSystem.js';

export default class SafehouseUI {
    constructor(scene) {
        this.scene = scene;
        this.isOpen = false;
        this.currentMenu = 'main'; // 'main' or 'upgrade'
        
        // UI State trackers for the new dynamic drug system
        this.selectedStashItem = null;
        this.selectedRunnerDrug = null;
        
        // Initialize stash (stores items: { id: string, amount: number })
        this.stash = [];
    }
    
    open() {
        if (this.isOpen) return;
        this.isOpen = true;
        this.currentMenu = 'main';
        this.renderMainMenu();
    }
    
    renderMainMenu() {
        this.clearUI();
        
        const { width, height } = this.scene.scale;
        const tier = CONFIG.SAFEHOUSE_TIERS[this.scene.playerState.safehouseTier];
        
        // Darken background
        this.overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);
        this.overlay.setScrollFactor(0);
        this.overlay.setDepth(900);
        this.overlay.setInteractive();
        
        // Main panel
        const panelHeight = tier.canHireRunners ? 750 : 700; // Taller if can hire runners
        
        this.panel = this.scene.add.image(width / 2, height / 2, 'panel');
        this.panel.setDisplaySize(900, panelHeight);
        this.panel.setScrollFactor(0);
        this.panel.setDepth(901);
        this.panel.setAlpha(0.95);
        
        // Container for all UI elements
        this.container = this.scene.add.container(0, 0);
        this.container.setScrollFactor(0);
        this.container.setDepth(902);
        
        // Title
        const title = this.scene.add.text(width / 2, height / 2 - 310, 'SAFEHOUSE', {
            fontFamily: 'Press Start 2P',
            fontSize: '32px',
            color: CONFIG.COLORS.primary,
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.container.add(title);
        
        // Subtitle
        const subtitle = this.scene.add.text(width / 2, height / 2 - 260, tier.name, {
            fontFamily: 'Press Start 2P',
            fontSize: '16px',
            color: CONFIG.COLORS.textDark
        }).setOrigin(0.5);
        this.container.add(subtitle);
        
        // Stash section
        const maxSlots = tier.stashSlots;
        const stashTitle = this.scene.add.text(width / 2, height / 2 - 210, `STASH (${maxSlots} SLOTS)`, {
            fontFamily: 'Press Start 2P',
            fontSize: '18px',
            color: CONFIG.COLORS.text
        }).setOrigin(0.5);
        this.container.add(stashTitle);
        
        // Help text
        const helpText = this.scene.add.text(width / 2, height / 2 - 185, 
            'Click filled slots to withdraw items', {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: CONFIG.COLORS.textDark,
            align: 'center'
        }).setOrigin(0.5);
        this.container.add(helpText);
        
        // Render stash slots dynamically
        this.renderStashSlots(maxSlots);
        
        // Runner button (only if tier 3+)
        if (tier.canHireRunners) {
            const runnerButton = this.createButton(width / 2, height / 2 + 170, 280, 50, 'MANAGE RUNNER', () => {
                this.renderRunnerMenu();
            });
            this.container.add(runnerButton);
        }
        
        // Back button
        const backButton = this.createButton(width / 2, height / 2 + 240, 200, 45, 'LEAVE', () => {
            this.close();
        });
        this.container.add(backButton);
    }
    
    renderStashSlots(maxSlots) {
        const { width, height } = this.scene.scale;
        const startY = height / 2 - 150;
        const slotSize = 70;
        const padding = 10;
        const cols = 6;
        
        // Get actual drugs from player state
        const drugs = this.scene.playerState.drugs || {};
        
        // Build stash display from drugs inventory
        // Each drug type with amount > 0 gets a slot
        const drugEntries = Object.entries(drugs).filter(([key, amount]) => amount > 0);
        
        for (let i = 0; i < maxSlots; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = width / 2 - ((cols - 1) * (slotSize + padding)) / 2 + col * (slotSize + padding);
            const y = startY + row * (slotSize + padding);
            
            // Check if we have a drug for this slot
            const drugEntry = drugEntries[i];
            const hasItem = drugEntry !== undefined;
            
            // Slot background
            const slot = this.scene.add.rectangle(x, y, slotSize, slotSize, hasItem ? 0x2a4a2a : 0x1a1a1a);
            slot.setStrokeStyle(2, hasItem ? 0x00ff00 : 0x333333);
            slot.setInteractive({ useHandCursor: hasItem });
            this.container.add(slot);
            
            if (hasItem) {
                const [drugKey, amount] = drugEntry;
                
                // Drug icon/text
                const icon = this.scene.add.text(x, y - 10, drugKey.substring(0, 3).toUpperCase(), {
                    fontFamily: 'Press Start 2P',
                    fontSize: '10px',
                    color: '#00ff00'
                }).setOrigin(0.5);
                this.container.add(icon);
                
                // Amount
                const amountText = this.scene.add.text(x, y + 15, `x${amount}`, {
                    fontFamily: 'Press Start 2P',
                    fontSize: '9px',
                    color: '#ffffff'
                }).setOrigin(0.5);
                this.container.add(amountText);
                
                // Click to withdraw (add back to inventory)
                slot.on('pointerup', () => {
                    const playerDrugs = this.scene.playerState.drugs || {};
                    const currentAmount = playerDrugs[drugKey] || 0;
                    const newAmount = currentAmount + 1;
                    
                    // Update stash and player inventory
                    if (newAmount <= 50) { // Max carry
                        playerDrugs[drugKey] = newAmount;
                        this.showMessage(`Withdrew 1 ${drugKey}`);
                        this.renderMainMenu();
                    } else {
                        this.showMessage('Inventory full!', CONFIG.COLORS.danger);
                    }
                });
            }
        }
    }
    
    renderRunnerMenu() {
        this.clearUI();
        
        const { width, height } = this.scene.scale;
        const player = this.scene.playerState;
        const tier = CONFIG.SAFEHOUSE_TIERS[player.safehouseTier];
        
        // Background
        this.overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);
        this.overlay.setScrollFactor(0);
        this.overlay.setDepth(900);
        this.overlay.setInteractive();
        
        // Panel
        this.panel = this.scene.add.image(width / 2, height / 2, 'panel');
        this.panel.setDisplaySize(900, 700);
        this.panel.setScrollFactor(0);
        this.panel.setDepth(901);
        
        this.container = this.scene.add.container(0, 0);
        this.container.setScrollFactor(0);
        this.container.setDepth(902);
        
        // Title
        const title = this.scene.add.text(width / 2, height / 2 - 300, 'RUNNER MANAGEMENT', {
            fontFamily: 'Press Start 2P',
            fontSize: '24px',
            color: CONFIG.COLORS.primary,
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.container.add(title);
        
        // Runner status
        const runnerStatus = player.hasRunner ? 'ACTIVE' : 'NOT HIRED';
        const runnerColor = player.hasRunner ? '#00ff00' : '#ff0000';
        
        const statusText = this.scene.add.text(width / 2, height / 2 - 240, `Runner: ${runnerStatus}`, {
            fontFamily: 'Press Start 2P',
            fontSize: '16px',
            color: runnerColor
        }).setOrigin(0.5);
        this.container.add(statusText);
        
        if (player.hasRunner) {
            // Show runner info
            const runnerDrug = player.runnerDrug || 'None';
            const runnerEarnings = player.runnerEarnings || 0;
            const runnerStatusText = player.runnerStatus || 'Idle';
            
            this.scene.add.text(width / 2, height / 2 - 190, `Selling: ${runnerDrug}`, {
                fontFamily: 'Press Start 2P',
                fontSize: '14px',
                color: '#ffffff'
            }).setOrigin(0.5);
            
            this.scene.add.text(width / 2, height / 2 - 160, `Earnings: $${runnerEarnings}`, {
                fontFamily: 'Press Start 2P',
                fontSize: '14px',
                color: '#00ff00'
            }).setOrigin(0.5);
            
            this.scene.add.text(width / 2, height / 2 - 130, `Status: ${runnerStatusText}`, {
                fontFamily: 'Press Start 2P',
                fontSize: '12px',
                color: '#aaaaaa'
            }).setOrigin(0.5);
            
            // Change drug button
            const changeDrugBtn = this.createButton(width / 2, height / 2 - 80, 300, 45, 'CHANGE DRUG', () => {
                this.showRunnerDrugSelector();
            });
            this.container.add(changeDrugBtn);
            
            // Collect earnings
            if (runnerEarnings > 0) {
                const collectBtn = this.createButton(width / 2, height / 2 - 20, 300, 45, `COLLECT $${runnerEarnings}`, () => {
                    player.money += runnerEarnings;
                    player.runnerEarnings = 0;
                    this.renderRunnerMenu();
                    if (this.scene.hud) this.scene.hud.update();
                });
                this.container.add(collectBtn);
            }
        } else {
            // Hire runner button
            const hireCost = tier.runnerHireCost || 1000;
            const hireBtn = this.createButton(width / 2, height / 2 - 80, 300, 50, `HIRE RUNNER ($${hireCost})`, () => {
                if (player.money >= hireCost) {
                    player.money -= hireCost;
                    player.hasRunner = true;
                    player.runnerStatus = 'Idle';
                    player.runnerEarnings = 0;
                    this.showMessage('Runner hired!', CONFIG.COLORS.success);
                    this.renderRunnerMenu();
                    if (this.scene.hud) this.scene.hud.update();
                } else {
                    this.showMessage('Not enough money!', CONFIG.COLORS.danger);
                }
            });
            this.container.add(hireBtn);
        }
        
        // Back button
        const backButton = this.createButton(width / 2, height / 2 + 250, 200, 45, 'BACK', () => {
            this.renderMainMenu();
        });
        this.container.add(backButton);
    }
    
    showRunnerDrugSelector() {
        const { width, height } = this.scene.scale;
        const player = this.scene.playerState;
        
        // Show drug selection
        const drugs = player.drugs || {};
        const availableDrugs = Object.entries(drugs).filter(([k, v]) => v > 0);
        
        if (availableDrugs.length === 0) {
            this.showMessage('No drugs to assign!', CONFIG.COLORS.danger);
            return;
        }
        
        // Simple selector - cycle through available drugs
        const drugKeys = availableDrugs.map(([k]) => k);
        let currentIndex = drugKeys.indexOf(player.runnerDrug || '');
        if (currentIndex < 0) currentIndex = 0;
        
        const selectorText = this.scene.add.text(width / 2, height / 2 + 50, 
            `Select drug: ${drugKeys[currentIndex]}`, {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.container.add(selectorText);
        
        const cycleBtn = this.createButton(width / 2, height / 2 + 100, 200, 45, 'CYCLE', () => {
            currentIndex = (currentIndex + 1) % drugKeys.length;
            selectorText.setText(`Select drug: ${drugKeys[currentIndex]}`);
        });
        this.container.add(cycleBtn);
        
        const confirmBtn = this.createButton(width / 2, height / 2 + 160, 200, 45, 'CONFIRM', () => {
            player.runnerDrug = drugKeys[currentIndex];
            this.showMessage(`Runner now selling ${player.runnerDrug}!`, CONFIG.COLORS.success);
            this.renderRunnerMenu();
        });
        this.container.add(confirmBtn);
    }
    
    createButton(x, y, w, h, label, onClick) {
        const btn = this.scene.add.container(x, y);
        
        const bg = this.scene.add.rectangle(0, 0, w, h, 0x2a2a4a);
        bg.setStrokeStyle(2, 0x666666);
        btn.add(bg);
        
        const text = this.scene.add.text(0, 0, label, {
            fontFamily: 'Press Start 2P',
            fontSize: '12px',
            color: '#ffffff'
        }).setOrigin(0.5);
        btn.add(text);
        
        bg.setInteractive({ useHandCursor: true });
        bg.on('pointerover', () => bg.setFillStyle(0x3a3a5a));
        bg.on('pointerout', () => bg.setFillStyle(0x2a2a4a));
        bg.on('pointerup', onClick);
        
        return btn;
    }
    
    clearUI() {
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
        if (this.overlay) {
            this.overlay.destroy();
            this.overlay = null;
        }
        if (this.panel) {
            this.panel.destroy();
            this.panel = null;
        }
    }
    
    close() {
        this.clearUI();
        this.isOpen = false;
    }
    
    showMessage(text, color = CONFIG.COLORS.text) {
        const { width, height } = this.scene.scale;
        const msg = this.scene.add.text(width / 2, height / 2 + 300, text, {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: color
        }).setOrigin(0.5);
        msg.setScrollFactor(0);
        msg.setDepth(1000);
        
        this.scene.time.delayedCall(2000, () => msg.destroy());
    }
}
