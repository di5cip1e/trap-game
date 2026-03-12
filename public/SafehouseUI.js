import Phaser from 'phaser';
import { CONFIG } from './config.js';
import SaveLoadSystem from './SaveLoadSystem.js';

export default class SafehouseUI {
    constructor(scene) {
        this.scene = scene;
        this.isOpen = false;
        this.currentMenu = 'main'; // 'main' or 'upgrade'
        
        // Initialize stash (stores items: { type: 'raw'|'product', amount: number })
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
        
        // Upgrade button
        if (this.scene.playerState.safehouseTier < CONFIG.SAFEHOUSE_TIERS.length - 1) {
            const upgradeButton = this.createButton(width / 2 - 160, height / 2 + 240, 280, 50, 'UPGRADE', () => {
                this.renderUpgradeMenu();
            });
            this.container.add(upgradeButton);
        } else {
            // Max tier reached
            const maxTierText = this.scene.add.text(width / 2 - 160, height / 2 + 240, 'MAX TIER', {
                fontFamily: 'Press Start 2P',
                fontSize: '14px',
                color: CONFIG.COLORS.success
            }).setOrigin(0.5);
            this.container.add(maxTierText);
        }
        
        // Rest button
        const restButton = this.createButton(width / 2 + 160, height / 2 + 240, 280, 50, 'SLEEP', () => {
            this.rest();
        });
        this.container.add(restButton);
        
        // Save/Load buttons
        const saveButton = this.createButton(width / 2 - 120, height / 2 + 300, 200, 40, 'SAVE GAME', () => {
            const success = SaveLoadSystem.saveGame(this.scene);
            this.showSaveLoadMessage(success, 'Game saved!', 'Failed to save');
        });
        this.container.add(saveButton);
        
        const loadButton = this.createButton(width / 2 + 120, height / 2 + 300, 200, 40, 'LOAD GAME', () => {
            const saveData = SaveLoadSystem.loadGame();
            if (saveData) {
                SaveLoadSystem.applySaveData(this.scene, saveData);
                this.scene.hud.update();
                this.showSaveLoadMessage(true, 'Game loaded!', '');
                // Close and reopen to refresh UI
                this.close();
            } else {
                this.showSaveLoadMessage(false, '', 'No save found');
            }
        });
        this.container.add(loadButton);
        
        // Close button (adjust position based on whether we have runner button)
        const closeButtonY = tier.canHireRunners ? height / 2 + 330 : height / 2 + 290;
        const closeButton = this.createButton(width / 2, closeButtonY, 200, 40, 'LEAVE', () => {
            this.close();
        });
        this.container.add(closeButton);
    }
    
    renderStashSlots(maxSlots) {
        const { width, height } = this.scene.scale;
        const slotSize = 80;
        const slotSpacing = 90;
        const slotsPerRow = 5;
        const rows = Math.ceil(maxSlots / slotsPerRow);
        
        // Inventory section title
        const invTitle = this.scene.add.text(width / 2, height / 2 + 50, 'YOUR INVENTORY', {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: CONFIG.COLORS.textDark
        }).setOrigin(0.5);
        this.container.add(invTitle);
        
        const invText = this.scene.add.text(width / 2, height / 2 + 75, 
            `Raw: ${this.scene.playerState.rawMaterials} | Product: ${this.scene.playerState.product}`, {
            fontFamily: 'Press Start 2P',
            fontSize: '12px',
            color: CONFIG.COLORS.text
        }).setOrigin(0.5);
        this.container.add(invText);
        
        // Stash/Deposit buttons
        if (this.scene.playerState.rawMaterials > 0) {
            const depositRawBtn = this.createSmallButton(width / 2 - 120, height / 2 + 110, 220, 35, 
                'STORE RAW', () => {
                this.depositItem('raw');
            });
            this.container.add(depositRawBtn);
        }
        
        if (this.scene.playerState.product > 0) {
            const depositProdBtn = this.createSmallButton(width / 2 + 120, height / 2 + 110, 220, 35, 
                'STORE PRODUCT', () => {
                this.depositItem('product');
            });
            this.container.add(depositProdBtn);
        }
        
        // Render stash slots
        for (let i = 0; i < maxSlots; i++) {
            const row = Math.floor(i / slotsPerRow);
            const col = i % slotsPerRow;
            
            const startX = width / 2 - ((Math.min(maxSlots, slotsPerRow) - 1) * slotSpacing) / 2;
            const startY = height / 2 - 140 + row * 100;
            
            const slotX = startX + col * slotSpacing;
            const slotY = startY;
            
            const item = this.stash[i];
            
            // Slot background
            const slotBg = this.scene.add.rectangle(slotX, slotY, slotSize, slotSize, 0x1a1a1a);
            slotBg.setStrokeStyle(3, item ? 0xffcc00 : 0x666666);
            this.container.add(slotBg);
            
            if (item) {
                // Item icon
                const iconKey = item.type === 'raw' ? 'icon-raw' : 'icon-product';
                const icon = this.scene.add.image(slotX, slotY - 10, iconKey);
                icon.setScale(0.08);
                this.container.add(icon);
                
                // Amount
                const amountText = this.scene.add.text(slotX, slotY + 20, `${item.amount}`, {
                    fontFamily: 'Press Start 2P',
                    fontSize: '10px',
                    color: CONFIG.COLORS.success
                }).setOrigin(0.5);
                this.container.add(amountText);
                
                // Make slot interactive to withdraw
                const slotContainer = this.scene.add.container(slotX, slotY);
                slotContainer.setSize(slotSize, slotSize);
                slotContainer.setInteractive({ useHandCursor: true });
                
                slotContainer.on('pointerdown', () => {
                    this.withdrawItem(i);
                });
                
                this.container.add(slotContainer);
            } else {
                // Empty slot
                const emptyText = this.scene.add.text(slotX, slotY, 'EMPTY', {
                    fontFamily: 'Press Start 2P',
                    fontSize: '10px',
                    color: CONFIG.COLORS.textDark
                }).setOrigin(0.5);
                this.container.add(emptyText);
            }
        }
    }
    
    depositItem(type) {
        const tier = CONFIG.SAFEHOUSE_TIERS[this.scene.playerState.safehouseTier];
        
        // Check if stash has room
        if (this.stash.length >= tier.stashSlots) {
            this.showQuickMessage('Stash is full!', CONFIG.COLORS.danger);
            return;
        }
        
        // Get amount from inventory
        let amount = 0;
        if (type === 'raw') {
            amount = this.scene.playerState.rawMaterials;
            if (amount <= 0) return;
            this.scene.playerState.rawMaterials = 0;
        } else if (type === 'product') {
            amount = this.scene.playerState.product;
            if (amount <= 0) return;
            this.scene.playerState.product = 0;
        }
        
        // Add to stash
        this.stash.push({ type, amount });
        
        // Update displays
        this.scene.hud.update();
        this.renderMainMenu();
    }
    
    withdrawItem(slotIndex) {
        const item = this.stash[slotIndex];
        if (!item) return;
        
        // Check capacity
        if (item.type === 'raw') {
            const afterWithdraw = this.scene.playerState.rawMaterials + item.amount;
            if (afterWithdraw > this.scene.playerState.rawCapacity) {
                this.showQuickMessage('Not enough inventory space!', CONFIG.COLORS.danger);
                return;
            }
            this.scene.playerState.rawMaterials += item.amount;
        } else if (item.type === 'product') {
            const afterWithdraw = this.scene.playerState.product + item.amount;
            if (afterWithdraw > this.scene.playerState.productCapacity) {
                this.showQuickMessage('Not enough inventory space!', CONFIG.COLORS.danger);
                return;
            }
            this.scene.playerState.product += item.amount;
        }
        
        // Remove from stash
        this.stash.splice(slotIndex, 1);
        
        // Update displays
        this.scene.hud.update();
        this.renderMainMenu();
    }
    
    showQuickMessage(text, color) {
        const { width, height } = this.scene.scale;
        
        const msg = this.scene.add.text(width / 2, height / 2 + 150, text, {
            fontFamily: 'Press Start 2P',
            fontSize: '12px',
            color: color,
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0).setDepth(950);
        
        this.scene.tweens.add({
            targets: msg,
            alpha: 0,
            y: height / 2 + 130,
            duration: 1500,
            onComplete: () => msg.destroy()
        });
    }
    
    renderUpgradeMenu() {
        this.currentMenu = 'upgrade';
        this.clearUI();
        
        const { width, height } = this.scene.scale;
        const currentTier = this.scene.playerState.safehouseTier;
        const nextTierIndex = currentTier + 1;
        
        if (nextTierIndex >= CONFIG.SAFEHOUSE_TIERS.length) {
            this.renderMainMenu();
            return;
        }
        
        const nextTier = CONFIG.SAFEHOUSE_TIERS[nextTierIndex];
        
        // Darken background
        this.overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);
        this.overlay.setScrollFactor(0);
        this.overlay.setDepth(900);
        this.overlay.setInteractive();
        
        // Main panel
        this.panel = this.scene.add.image(width / 2, height / 2, 'panel');
        this.panel.setDisplaySize(800, 600);
        this.panel.setScrollFactor(0);
        this.panel.setDepth(901);
        this.panel.setAlpha(0.95);
        
        // Container for all UI elements
        this.container = this.scene.add.container(0, 0);
        this.container.setScrollFactor(0);
        this.container.setDepth(902);
        
        // Title
        const title = this.scene.add.text(width / 2, height / 2 - 250, 'UPGRADE SAFEHOUSE', {
            fontFamily: 'Press Start 2P',
            fontSize: '28px',
            color: CONFIG.COLORS.primary,
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.container.add(title);
        
        // Upgrade info panel
        const infoPanel = this.scene.add.rectangle(width / 2, height / 2 - 100, 700, 250, 0x1a1a1a);
        infoPanel.setStrokeStyle(3, CONFIG.COLORS.secondary);
        this.container.add(infoPanel);
        
        // Tier name
        const tierName = this.scene.add.text(width / 2, height / 2 - 200, nextTier.name, {
            fontFamily: 'Press Start 2P',
            fontSize: '22px',
            color: CONFIG.COLORS.success
        }).setOrigin(0.5);
        this.container.add(tierName);
        
        // Benefits list
        const benefits = [
            `Stash Capacity: ${nextTier.stashSlots} slots`,
            `Hustle Restore: ${Math.floor(nextTier.hustleRestore * 100)}%`,
            'Improved Security'
        ];
        
        // Add runner benefit if applicable
        if (nextTier.canHireRunners) {
            benefits.push('Can Hire Runners');
        }
        
        let yOffset = -150;
        benefits.forEach(benefit => {
            const benefitText = this.scene.add.text(width / 2, height / 2 + yOffset, `+ ${benefit}`, {
                fontFamily: 'Press Start 2P',
                fontSize: '14px',
                color: CONFIG.COLORS.text
            }).setOrigin(0.5);
            this.container.add(benefitText);
            yOffset += 35;
        });
        
        // Cost
        const canAfford = this.scene.playerState.money >= nextTier.cost;
        const costColor = canAfford ? CONFIG.COLORS.success : CONFIG.COLORS.danger;
        
        const costText = this.scene.add.text(width / 2, height / 2 + 40, `COST: $${nextTier.cost}`, {
            fontFamily: 'Press Start 2P',
            fontSize: '20px',
            color: costColor,
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.container.add(costText);
        
        const currentMoneyText = this.scene.add.text(width / 2, height / 2 + 80, `Your Money: $${this.scene.playerState.money}`, {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: CONFIG.COLORS.textDark
        }).setOrigin(0.5);
        this.container.add(currentMoneyText);
        
        // Purchase button
        const purchaseButton = this.createButton(width / 2 - 120, height / 2 + 180, 200, 50, 
            canAfford ? 'PURCHASE' : 'TOO POOR', () => {
            if (canAfford) {
                const success = this.scene.upgradeSafehouse(nextTierIndex);
                if (success) {
                    this.showUpgradeSuccess(nextTier.name);
                }
            }
        });
        this.container.add(purchaseButton);
        
        // Back button
        const backButton = this.createButton(width / 2 + 120, height / 2 + 180, 200, 50, 'BACK', () => {
            this.renderMainMenu();
        });
        this.container.add(backButton);
    }
    
    showUpgradeSuccess(tierName) {
        this.close();
        
        const { width, height } = this.scene.scale;
        
        const overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9);
        overlay.setScrollFactor(0);
        overlay.setDepth(1000);
        
        const message = this.scene.add.text(width / 2, height / 2, 
            `UPGRADE COMPLETE!\n\n${tierName}\n\nYour operation grows...`, {
            fontFamily: 'Press Start 2P',
            fontSize: '20px',
            color: CONFIG.COLORS.success,
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4,
            lineSpacing: 10
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);
        
        this.scene.time.delayedCall(3000, () => {
            overlay.destroy();
            message.destroy();
        });
    }
    
    renderRunnerMenu() {
        this.currentMenu = 'runner';
        this.clearUI();
        
        const { width, height } = this.scene.scale;
        
        // Darken background
        this.overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);
        this.overlay.setScrollFactor(0);
        this.overlay.setDepth(900);
        this.overlay.setInteractive();
        
        // Main panel
        this.panel = this.scene.add.image(width / 2, height / 2, 'panel');
        this.panel.setDisplaySize(800, 700);
        this.panel.setScrollFactor(0);
        this.panel.setDepth(901);
        this.panel.setAlpha(0.95);
        
        // Container for all UI elements
        this.container = this.scene.add.container(0, 0);
        this.container.setScrollFactor(0);
        this.container.setDepth(902);
        
        // Title
        const title = this.scene.add.text(width / 2, height / 2 - 300, 'RUNNER MANAGEMENT', {
            fontFamily: 'Press Start 2P',
            fontSize: '28px',
            color: CONFIG.COLORS.primary,
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.container.add(title);
        
        // Status panel
        const statusPanel = this.scene.add.rectangle(width / 2, height / 2 - 180, 700, 180, 0x1a1a1a);
        statusPanel.setStrokeStyle(3, CONFIG.COLORS.secondary);
        this.container.add(statusPanel);
        
        // Runner status
        const hasRunner = this.scene.playerState.hasRunner;
        const statusColor = hasRunner ? CONFIG.COLORS.success : CONFIG.COLORS.textDark;
        const statusText = hasRunner ? 'EMPLOYED' : 'NO RUNNER';
        
        const runnerStatus = this.scene.add.text(width / 2, height / 2 - 240, `STATUS: ${statusText}`, {
            fontFamily: 'Press Start 2P',
            fontSize: '18px',
            color: statusColor
        }).setOrigin(0.5);
        this.container.add(runnerStatus);
        
        // Daily fee info
        const feeText = this.scene.add.text(width / 2, height / 2 - 200, `Daily Fee: $${CONFIG.RUNNER_DAILY_FEE}`, {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: CONFIG.COLORS.textDark
        }).setOrigin(0.5);
        this.container.add(feeText);
        
        const cutText = this.scene.add.text(width / 2, height / 2 - 170, `Runner takes ${CONFIG.RUNNER_CUT * 100}% cut of sales`, {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: CONFIG.COLORS.textDark
        }).setOrigin(0.5);
        this.container.add(cutText);
        
        // Calculate intuition-based bust chance
        const intuition = this.scene.playerState.stats.intuition || 0;
        const bustChance = Math.max(0, CONFIG.RUNNER_BUST_BASE_CHANCE - (intuition * CONFIG.RUNNER_INTUITION_REDUCTION));
        const bustPercent = Math.round(bustChance * 100);
        
        const bustChanceText = this.scene.add.text(width / 2, height / 2 - 140, 
            `Bust Chance: ${bustPercent}% (Intuition: ${intuition})`, {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: bustPercent > 5 ? CONFIG.COLORS.danger : CONFIG.COLORS.success
        }).setOrigin(0.5);
        this.container.add(bustChanceText);
        
        const bustInfoText = this.scene.add.text(width / 2, height / 2 - 110, 
            'Higher Intuition reduces bust chance', {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: CONFIG.COLORS.textDark,
            align: 'center'
        }).setOrigin(0.5);
        this.container.add(bustInfoText);
        
        if (hasRunner) {
            // Runner is employed - show assignment interface
            
            // Current assignment
            const assignedProduct = this.scene.playerState.runnerProduct;
            const assignmentText = this.scene.add.text(width / 2, height / 2 - 50, 
                `Product Assigned: ${assignedProduct}`, {
                fontFamily: 'Press Start 2P',
                fontSize: '16px',
                color: assignedProduct > 0 ? CONFIG.COLORS.success : CONFIG.COLORS.text
            }).setOrigin(0.5);
            this.container.add(assignmentText);
            
            const infoText = this.scene.add.text(width / 2, height / 2 - 15, 
                'Runner will sell product when you sleep', {
                fontFamily: 'Arial',
                fontSize: '12px',
                color: CONFIG.COLORS.textDark
            }).setOrigin(0.5);
            this.container.add(infoText);
            
            // Player's current product
            const playerProduct = this.scene.playerState.product;
            const playerProductText = this.scene.add.text(width / 2, height / 2 + 30, 
                `Your Product: ${playerProduct}`, {
                fontFamily: 'Press Start 2P',
                fontSize: '14px',
                color: CONFIG.COLORS.text
            }).setOrigin(0.5);
            this.container.add(playerProductText);
            
            // Assign product buttons
            if (playerProduct > 0) {
                const assignOneButton = this.createButton(width / 2 - 120, height / 2 + 80, 200, 45, 
                    'ASSIGN 1', () => {
                    this.assignProductToRunner(1);
                });
                this.container.add(assignOneButton);
                
                if (playerProduct >= 5) {
                    const assignFiveButton = this.createButton(width / 2 + 120, height / 2 + 80, 200, 45, 
                        'ASSIGN 5', () => {
                        this.assignProductToRunner(5);
                    });
                    this.container.add(assignFiveButton);
                }
            }
            
            // Retrieve product button
            if (assignedProduct > 0) {
                const retrieveButton = this.createButton(width / 2, height / 2 + 140, 250, 45, 
                    'RETRIEVE PRODUCT', () => {
                    this.retrieveProductFromRunner();
                });
                this.container.add(retrieveButton);
            }
            
            // Fire runner button
            const fireButton = this.createButton(width / 2, height / 2 + 200, 200, 45, 
                'FIRE RUNNER', () => {
                this.fireRunner();
            });
            this.container.add(fireButton);
            
        } else {
            // No runner - show hire option
            
            const hireInfoPanel = this.scene.add.rectangle(width / 2, height / 2 + 20, 650, 200, 0x2a2a2a);
            hireInfoPanel.setStrokeStyle(2, CONFIG.COLORS.primary);
            this.container.add(hireInfoPanel);
            
            const hireInfo = this.scene.add.text(width / 2, height / 2 - 30, 
                'Hire a Runner to automate sales!\n\nAssign product to your runner,\nthen sleep. They\'ll sell it and\ndeposit cash in your stash.', {
                fontFamily: 'Press Start 2P',
                fontSize: '14px',
                color: CONFIG.COLORS.text,
                align: 'center',
                lineSpacing: 8
            }).setOrigin(0.5);
            this.container.add(hireInfo);
            
            const warningText = this.scene.add.text(width / 2, height / 2 + 80, 
                'Warning: Runners can get busted!', {
                fontFamily: 'Press Start 2P',
                fontSize: '12px',
                color: CONFIG.COLORS.danger
            }).setOrigin(0.5);
            this.container.add(warningText);
            
            // Hire button
            const hireButton = this.createButton(width / 2, height / 2 + 150, 250, 50, 
                'HIRE RUNNER', () => {
                this.hireRunner();
            });
            this.container.add(hireButton);
        }
        
        // Back button
        const backButton = this.createButton(width / 2, height / 2 + 280, 200, 40, 'BACK', () => {
            this.renderMainMenu();
        });
        this.container.add(backButton);
    }
    
    hireRunner() {
        this.scene.playerState.hasRunner = true;
        
        // Quest: Track runner hiring
        if (this.scene.questSystem) {
            this.scene.questSystem.onHireRunner();
        }
        
        this.showQuickMessage('Runner hired! Assign product to start.', CONFIG.COLORS.success);
        this.renderRunnerMenu();
    }
    
    fireRunner() {
        // Return any assigned product
        if (this.scene.playerState.runnerProduct > 0) {
            const returned = this.scene.playerState.runnerProduct;
            const afterReturn = this.scene.playerState.product + returned;
            
            if (afterReturn > this.scene.playerState.productCapacity) {
                this.showQuickMessage('Not enough inventory space!', CONFIG.COLORS.danger);
                return;
            }
            
            this.scene.playerState.product += returned;
        }
        
        this.scene.playerState.hasRunner = false;
        this.scene.playerState.runnerProduct = 0;
        this.scene.hud.update();
        this.showQuickMessage('Runner fired.', CONFIG.COLORS.textDark);
        this.renderRunnerMenu();
    }
    
    assignProductToRunner(amount) {
        if (this.scene.playerState.product < amount) {
            this.showQuickMessage('Not enough product!', CONFIG.COLORS.danger);
            return;
        }
        
        this.scene.playerState.product -= amount;
        this.scene.playerState.runnerProduct += amount;
        this.scene.hud.update();
        this.showQuickMessage(`Assigned ${amount} product to runner.`, CONFIG.COLORS.success);
        this.renderRunnerMenu();
    }
    
    retrieveProductFromRunner() {
        const amount = this.scene.playerState.runnerProduct;
        const afterReturn = this.scene.playerState.product + amount;
        
        if (afterReturn > this.scene.playerState.productCapacity) {
            this.showQuickMessage('Not enough inventory space!', CONFIG.COLORS.danger);
            return;
        }
        
        this.scene.playerState.product += amount;
        this.scene.playerState.runnerProduct = 0;
        this.scene.hud.update();
        this.showQuickMessage(`Retrieved ${amount} product.`, CONFIG.COLORS.success);
        this.renderRunnerMenu();
    }
    
    clearUI() {
        if (this.overlay) this.overlay.destroy();
        if (this.panel) this.panel.destroy();
        if (this.container) this.container.destroy();
        
        this.overlay = null;
        this.panel = null;
        this.container = null;
    }
    
    close() {
        if (!this.isOpen) return;
        this.isOpen = false;
        this.clearUI();
    }
    
    showSaveLoadMessage(success, successText, failText) {
        const { width, height } = this.scene.scale;
        
        const overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
        overlay.setScrollFactor(0);
        overlay.setDepth(1000);
        
        const messageText = success ? successText : failText;
        const messageColor = success ? '#00ff00' : '#ff4444';
        
        const message = this.scene.add.text(width / 2, height / 2, messageText, {
            fontFamily: 'Press Start 2P',
            fontSize: '20px',
            color: messageColor,
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        message.setScrollFactor(0);
        message.setDepth(1001);
        
        // Auto-close after 2 seconds
        this.scene.time.delayedCall(2000, () => {
            overlay.destroy();
            message.destroy();
        });
    }
    
    rest() {
        const tier = CONFIG.SAFEHOUSE_TIERS[this.scene.playerState.safehouseTier];
        
        // Restore hustle based on tier
        const restoreAmount = CONFIG.MAX_HUSTLE * tier.hustleRestore;
        this.scene.playerState.hustle = Math.min(CONFIG.MAX_HUSTLE, restoreAmount);
        
        // Reduce heat when sleeping
        this.scene.playerState.heat = Math.max(0, 
            this.scene.playerState.heat - CONFIG.HEAT_DECAY_PER_SLEEP);
        
        // Advance to next day
        this.scene.timeSystem.advanceToNextDay();
        
        // Update HUD
        this.scene.hud.update();
        
        // Show rest message
        this.close();
        this.showRestMessage(tier.name);
    }
    
    showRestMessage(tierName) {
        const { width, height } = this.scene.scale;
        
        const overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
        overlay.setScrollFactor(0);
        overlay.setDepth(1000);
        
        // Get calendar info for new day
        const calendar = this.scene.calendarSystem.getCalendarInfo();
        const activeEvents = calendar.activeEvents;
        
        // Build message with events
        let messageText = `You sleep in your ${tierName}...\n\nDay ${this.scene.timeSystem.day} - ${calendar.dayName}`;
        
        if (activeEvents.length > 0) {
            messageText += '\n\n';
            activeEvents.forEach(event => {
                messageText += `⚠ ${event.name} ⚠\n${event.description}\n`;
            });
        }
        
        const message = this.scene.add.text(width / 2, height / 2, messageText, {
            fontFamily: 'Press Start 2P',
            fontSize: '18px',
            color: CONFIG.COLORS.success,
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4,
            lineSpacing: 5
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);
        
        // Longer delay if events are active
        const delay = activeEvents.length > 0 ? 3500 : 2000;
        
        this.scene.time.delayedCall(delay, () => {
            overlay.destroy();
            message.destroy();
        });
    }
    
    createButton(x, y, width, height, text, callback) {
        const container = this.scene.add.container(x, y);
        
        const bg = this.scene.add.rectangle(0, 0, width, height, 0x2a2a2a);
        bg.setStrokeStyle(2, 0xffcc00);
        
        const label = this.scene.add.text(0, 0, text, {
            fontFamily: 'Press Start 2P',
            fontSize: '16px',
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
        
        return container;
    }
    
    createSmallButton(x, y, width, height, text, callback) {
        const container = this.scene.add.container(x, y);
        
        const bg = this.scene.add.rectangle(0, 0, width, height, 0x2a2a2a);
        bg.setStrokeStyle(2, 0xffcc00);
        
        const label = this.scene.add.text(0, 0, text, {
            fontFamily: 'Press Start 2P',
            fontSize: '12px',
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
        
        return container;
    }
}
