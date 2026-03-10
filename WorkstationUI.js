import Phaser from 'phaser';
import { CONFIG } from './config.js';

export default class WorkstationUI {
    constructor(scene) {
        this.scene = scene;
        this.isOpen = false;
    }
    
    open() {
        if (this.isOpen) return;
        this.isOpen = true;
        
        const { width, height } = this.scene.scale;
        
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
        const title = this.scene.add.text(width / 2, height / 2 - 250, 'WORKSTATION', {
            fontFamily: 'Press Start 2P',
            fontSize: '32px',
            color: CONFIG.COLORS.primary,
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.container.add(title);
        
        // Subtitle
        const subtitle = this.scene.add.text(width / 2, height / 2 - 200, 
            'Process Raw Materials into Product', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: CONFIG.COLORS.textDark
        }).setOrigin(0.5);
        this.container.add(subtitle);
        
        // Recipe display
        const recipeY = height / 2 - 140;
        
        // Input
        const inputIcon = this.scene.add.image(width / 2 - 200, recipeY, 'icon-raw');
        inputIcon.setScale(0.12);
        this.container.add(inputIcon);
        
        const inputText = this.scene.add.text(width / 2 - 200, recipeY + 50, 
            `${CONFIG.PROCESSING_RAW_COST}x Raw\nMaterials`, {
            fontFamily: 'Press Start 2P',
            fontSize: '12px',
            color: CONFIG.COLORS.text,
            align: 'center'
        }).setOrigin(0.5);
        this.container.add(inputText);
        
        // Plus sign
        const plusText = this.scene.add.text(width / 2 - 100, recipeY, '+', {
            fontFamily: 'Press Start 2P',
            fontSize: '32px',
            color: CONFIG.COLORS.textDark
        }).setOrigin(0.5);
        this.container.add(plusText);
        
        // Hustle cost
        const hustleText = this.scene.add.text(width / 2, recipeY, 
            `${CONFIG.PROCESSING_HUSTLE_COST}\nHustle`, {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: CONFIG.COLORS.primary,
            align: 'center'
        }).setOrigin(0.5);
        this.container.add(hustleText);
        
        // Arrow
        const arrowText = this.scene.add.text(width / 2 + 100, recipeY, '→', {
            fontFamily: 'Press Start 2P',
            fontSize: '32px',
            color: CONFIG.COLORS.textDark
        }).setOrigin(0.5);
        this.container.add(arrowText);
        
        // Output
        const outputIcon = this.scene.add.image(width / 2 + 200, recipeY, 'icon-product');
        outputIcon.setScale(0.12);
        this.container.add(outputIcon);
        
        // Calculate yield based on Ability stat and race bonus
        const abilityBonus = this.scene.playerState.stats.ability;
        const raceBonus = this.scene.playerState.raceBonus;
        const productionSpeed = raceBonus?.productionSpeed || 0;
        const raceYieldBonus = Math.floor(abilityBonus * productionSpeed);
        const totalYield = CONFIG.PRODUCT_BASE_YIELD + abilityBonus + raceYieldBonus;
        
        let bonusText = `(+${abilityBonus} from ABL)`;
        if (raceYieldBonus > 0) {
            bonusText += `\n(+${raceYieldBonus} from Race)`;
        }
        
        const outputText = this.scene.add.text(width / 2 + 200, recipeY + 50, 
            `${totalYield}x Product\n${bonusText}`, {
            fontFamily: 'Press Start 2P',
            fontSize: '12px',
            color: CONFIG.COLORS.success,
            align: 'center'
        }).setOrigin(0.5);
        this.container.add(outputText);
        
        // Player resources
        this.resourcesText = this.scene.add.text(width / 2, height / 2 - 30, '', {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: CONFIG.COLORS.text,
            align: 'center'
        }).setOrigin(0.5);
        this.container.add(this.resourcesText);
        
        // Warning text
        this.warningText = this.scene.add.text(width / 2, height / 2 + 20, '', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: CONFIG.COLORS.danger,
            align: 'center'
        }).setOrigin(0.5);
        this.container.add(this.warningText);
        
        // Process button
        this.processButton = this.createButton(width / 2, height / 2 + 80, 200, 50, 'PROCESS', () => {
            this.process();
        });
        this.container.add(this.processButton);
        
        // Info text
        const infoText = this.scene.add.text(width / 2, height / 2 + 150, 
            'Your Ability stat increases product yield.\nHigher stats = more profit per batch.', {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: CONFIG.COLORS.textDark,
            align: 'center'
        }).setOrigin(0.5);
        this.container.add(infoText);
        
        // Close button
        this.closeButton = this.createButton(width / 2, height / 2 + 200, 150, 40, 'CLOSE', () => {
            this.close();
        });
        this.container.add(this.closeButton);
        
        this.updateDisplay();
    }
    
    updateDisplay() {
        const player = this.scene.playerState;
        
        // Calculate potential yield (includes Ability bonus and race bonus)
        const abilityBonus = player.stats.ability;
        const raceBonus = player.raceBonus;
        const productionSpeed = raceBonus?.productionSpeed || 0;
        const raceYieldBonus = Math.floor(abilityBonus * productionSpeed);
        const totalYield = CONFIG.PRODUCT_BASE_YIELD + abilityBonus + raceYieldBonus;
        
        // Check all conditions: raw materials, hustle, AND product capacity
        const hasEnoughRaw = player.rawMaterials >= CONFIG.PROCESSING_RAW_COST;
        const hasEnoughHustle = player.hustle >= CONFIG.PROCESSING_HUSTLE_COST;
        const hasProductSpace = (player.product + totalYield) <= player.productCapacity;
        
        const canProcess = hasEnoughRaw && hasEnoughHustle && hasProductSpace;
        
        this.resourcesText.setText(
            `You have: ${player.rawMaterials} Raw Materials | ` +
            `${Math.floor(player.hustle)} Hustle`
        );
        
        // Update warning - show most relevant issue
        if (!hasEnoughRaw) {
            this.warningText.setText('Not enough Raw Materials!');
        } else if (!hasEnoughHustle) {
            this.warningText.setText('Not enough Hustle! Rest or you\'ll pass out.');
        } else if (!hasProductSpace) {
            const canMake = player.productCapacity - player.product;
            if (canMake <= 0) {
                this.warningText.setText('Product inventory full!');
            } else {
                this.warningText.setText(`Product full! Can only make ${canMake} more`);
            }
        } else {
            this.warningText.setText('');
        }
        
        // Update button state
        if (canProcess) {
            this.processButton.list[0].setFillStyle(0x66ff66);
            this.processButton.list[0].setStrokeStyle(2, 0xffffff);
            this.processButton.list[1].setColor('#000000');
            this.processButton.setAlpha(1);
        } else {
            this.processButton.list[0].setFillStyle(0x2a2a2a);
            this.processButton.list[0].setStrokeStyle(2, 0x666666);
            this.processButton.list[1].setColor('#666666');
            this.processButton.setAlpha(0.5);
        }
    }
    
    process() {
        const player = this.scene.playerState;
        const canProcess = player.rawMaterials >= CONFIG.PROCESSING_RAW_COST && 
                          player.hustle >= CONFIG.PROCESSING_HUSTLE_COST;
        
        if (!canProcess) return;
        
        // Calculate yield with Ability bonus and race bonus
        const abilityBonus = player.stats.ability;
        const raceBonus = player.raceBonus;
        const productionSpeed = raceBonus?.productionSpeed || 0;
        const raceYieldBonus = Math.floor(abilityBonus * productionSpeed);
        const totalYield = CONFIG.PRODUCT_BASE_YIELD + abilityBonus + raceYieldBonus;
        
        // Check product capacity
        const afterProduction = player.product + totalYield;
        if (afterProduction > player.productCapacity) {
            const canMake = player.productCapacity - player.product;
            if (canMake <= 0) {
                this.showMessage('Product inventory full!', CONFIG.COLORS.danger);
            } else {
                this.showMessage(`Only room for ${canMake} more`, CONFIG.COLORS.danger);
            }
            return;
        }
        
        // Deduct resources
        player.rawMaterials -= CONFIG.PROCESSING_RAW_COST;
        player.hustle -= CONFIG.PROCESSING_HUSTLE_COST;
        
        // Add product
        player.product += totalYield;
        
        // Update displays
        this.scene.hud.update();
        this.updateDisplay();
        
        // Show success message
        this.showMessage(`Created ${totalYield} Product!`);
    }
    
    showMessage(text, color = CONFIG.COLORS.success) {
        const { width, height } = this.scene.scale;
        
        const msg = this.scene.add.text(width / 2, height / 2 + 250, text, {
            fontFamily: 'Press Start 2P',
            fontSize: '16px',
            color: color,
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(903);
        
        this.scene.tweens.add({
            targets: msg,
            alpha: 0,
            y: height / 2 + 220,
            duration: 1500,
            onComplete: () => msg.destroy()
        });
    }
    
    close() {
        if (!this.isOpen) return;
        this.isOpen = false;
        
        if (this.overlay) this.overlay.destroy();
        if (this.panel) this.panel.destroy();
        if (this.container) this.container.destroy();
        
        this.overlay = null;
        this.panel = null;
        this.container = null;
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
}
