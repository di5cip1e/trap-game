import Phaser from 'phaser';
import { CONFIG } from './config.js';

export default class VendorUI {
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
        this.panel.setDisplaySize(700, 500);
        this.panel.setScrollFactor(0);
        this.panel.setDepth(901);
        this.panel.setAlpha(0.95);
        
        // Container for all UI elements
        this.container = this.scene.add.container(0, 0);
        this.container.setScrollFactor(0);
        this.container.setDepth(902);
        
        // Title
        const title = this.scene.add.text(width / 2, height / 2 - 220, 'SUPPLIER', {
            fontFamily: 'Press Start 2P',
            fontSize: '32px',
            color: CONFIG.COLORS.primary,
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.container.add(title);
        
        // Subtitle
        const subtitle = this.scene.add.text(width / 2, height / 2 - 170, 
            '"You need supplies? I got you."', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: CONFIG.COLORS.textDark,
            fontStyle: 'italic'
        }).setOrigin(0.5);
        this.container.add(subtitle);
        
        // Item display
        const itemY = height / 2 - 100;
        
        // Icon
        const icon = this.scene.add.image(width / 2 - 150, itemY, 'icon-raw');
        icon.setScale(0.15);
        this.container.add(icon);
        
        // Item info
        const itemName = this.scene.add.text(width / 2 - 50, itemY - 30, 'RAW MATERIALS', {
            fontFamily: 'Press Start 2P',
            fontSize: '18px',
            color: CONFIG.COLORS.text
        }).setOrigin(0, 0.5);
        this.container.add(itemName);
        
        // Get current price (affected by drought)
        const currentPrice = this.getCurrentRawPrice();
        const isDrought = this.scene.calendarSystem.isDroughtActive();
        
        this.itemPrice = this.scene.add.text(width / 2 - 50, itemY + 10, 
            `$${currentPrice} per unit`, {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: isDrought ? CONFIG.COLORS.danger : CONFIG.COLORS.success
        }).setOrigin(0, 0.5);
        this.container.add(this.itemPrice);
        
        // Drought indicator
        if (isDrought) {
            const droughtNote = this.scene.add.text(width / 2 - 50, itemY + 35, 
                'DROUGHT - 2X PRICE!', {
                fontFamily: 'Press Start 2P',
                fontSize: '10px',
                color: CONFIG.COLORS.danger
            }).setOrigin(0, 0.5);
            this.container.add(droughtNote);
        }
        
        // Player money display
        this.moneyText = this.scene.add.text(width / 2, height / 2 - 10, 
            `Your Money: $${this.scene.playerState.money}`, {
            fontFamily: 'Press Start 2P',
            fontSize: '16px',
            color: CONFIG.COLORS.text
        }).setOrigin(0.5);
        this.container.add(this.moneyText);
        
        // Quantity selector
        this.quantity = 1;
        
        const qtyY = height / 2 + 40;
        
        const qtyLabel = this.scene.add.text(width / 2 - 100, qtyY, 'QUANTITY:', {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: CONFIG.COLORS.textDark
        }).setOrigin(1, 0.5);
        this.container.add(qtyLabel);
        
        // Minus button
        this.minusBtn = this.createButton(width / 2 - 50, qtyY, 40, 40, '-', () => {
            this.changeQuantity(-1);
        });
        this.container.add(this.minusBtn);
        
        // Quantity display
        this.qtyText = this.scene.add.text(width / 2, qtyY, '1', {
            fontFamily: 'Press Start 2P',
            fontSize: '20px',
            color: CONFIG.COLORS.primary
        }).setOrigin(0.5);
        this.container.add(this.qtyText);
        
        // Plus button
        this.plusBtn = this.createButton(width / 2 + 50, qtyY, 40, 40, '+', () => {
            this.changeQuantity(1);
        });
        this.container.add(this.plusBtn);
        
        // Total cost
        this.totalText = this.scene.add.text(width / 2, height / 2 + 90, 
            `Total: $${CONFIG.RAW_MATERIAL_COST}`, {
            fontFamily: 'Press Start 2P',
            fontSize: '18px',
            color: CONFIG.COLORS.primary
        }).setOrigin(0.5);
        this.container.add(this.totalText);
        
        // Buy button
        this.buyButton = this.createButton(width / 2 - 160, height / 2 + 150, 140, 50, 'BUY', () => {
            this.buy();
        });
        this.container.add(this.buyButton);
        
        // Equipment button
        const equipButton = this.createButton(width / 2, height / 2 + 150, 140, 50, 'GEAR', () => {
            this.close();
            this.scene.equipmentUI.open();
        });
        this.container.add(equipButton);
        
        // Close button
        this.closeButton = this.createButton(width / 2 + 160, height / 2 + 150, 140, 50, 'LEAVE', () => {
            this.close();
        });
        this.container.add(this.closeButton);
        
        this.updateDisplay();
    }
    
    changeQuantity(delta) {
        this.quantity = Math.max(1, this.quantity + delta);
        this.updateDisplay();
    }
    
    getCurrentRawPrice() {
        return CONFIG.RAW_MATERIAL_COST * this.scene.calendarSystem.getRawMaterialCostMultiplier();
    }
    
    updateDisplay() {
        const total = this.quantity * this.getCurrentRawPrice();
        const canAfford = this.scene.playerState.money >= total;
        
        // Check if player has enough inventory space
        const afterPurchase = this.scene.playerState.rawMaterials + this.quantity;
        const hasInventorySpace = afterPurchase <= this.scene.playerState.rawCapacity;
        
        this.qtyText.setText(this.quantity.toString());
        this.totalText.setText(`Total: $${total}`);
        
        // Update buy button state - must have both money AND inventory space
        if (canAfford && hasInventorySpace) {
            this.buyButton.list[0].setFillStyle(0x2a2a2a);
            this.buyButton.list[1].setColor(CONFIG.COLORS.text);
            this.buyButton.setAlpha(1);
        } else {
            this.buyButton.list[0].setFillStyle(0x1a1a1a);
            this.buyButton.list[1].setColor('#666666');
            this.buyButton.setAlpha(0.5);
        }
    }
    
    buy() {
        const total = this.quantity * this.getCurrentRawPrice();
        
        // Check if player can afford
        if (this.scene.playerState.money < total) {
            this.showMessage('Not enough cash!', CONFIG.COLORS.danger);
            return;
        }
        
        // Check inventory capacity
        const afterPurchase = this.scene.playerState.rawMaterials + this.quantity;
        if (afterPurchase > this.scene.playerState.rawCapacity) {
            const canBuy = this.scene.playerState.rawCapacity - this.scene.playerState.rawMaterials;
            if (canBuy <= 0) {
                this.showMessage('Inventory full!', CONFIG.COLORS.danger);
            } else {
                this.showMessage(`Can only carry ${canBuy} more`, CONFIG.COLORS.danger);
            }
            return;
        }
        
        // Process purchase
        this.scene.playerState.money -= total;
        this.scene.playerState.rawMaterials += this.quantity;
        
        this.scene.hud.update();
        this.moneyText.setText(`Your Money: $${this.scene.playerState.money}`);
        this.updateDisplay();
        
        // Show purchase message
        this.showMessage(`Purchased ${this.quantity} Raw Materials`);
    }
    
    showMessage(text, color = CONFIG.COLORS.success) {
        const { width, height } = this.scene.scale;
        
        const msg = this.scene.add.text(width / 2, height / 2 + 200, text, {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: color,
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0).setDepth(903);
        
        this.scene.tweens.add({
            targets: msg,
            alpha: 0,
            y: height / 2 + 170,
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
