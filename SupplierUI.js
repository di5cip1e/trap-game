import Phaser from 'phaser';
import { CONFIG } from './config.js';

export default class SupplierUI {
    constructor(scene) {
        this.scene = scene;
        this.isOpen = false;
        this.currentSupplier = null;
    }
    
    open(supplier) {
        if (this.isOpen) return;
        this.isOpen = true;
        this.currentSupplier = supplier;
        
        const { width, height } = this.scene.scale;
        
        // Darken background
        this.overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);
        this.overlay.setScrollFactor(0);
        this.overlay.setDepth(900);
        this.overlay.setInteractive();
        this.overlay.on('pointerdown', () => this.close());
        
        // Main panel - slightly larger for detailed info
        this.panel = this.scene.add.image(width / 2, height / 2, 'panel');
        this.panel.setDisplaySize(800, 600);
        this.panel.setScrollFactor(0);
        this.panel.setDepth(901);
        this.panel.setAlpha(0.95);
        
        // Container for all UI elements
        this.container = this.scene.add.container(0, 0);
        this.container.setScrollFactor(0);
        this.container.setDepth(902);
        
        // Title with gang name
        const title = this.scene.add.text(width / 2, height / 2 - 270, 
            supplier.name.toUpperCase(), {
            fontFamily: 'Press Start 2P',
            fontSize: '28px',
            color: supplier.accentColor,
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.container.add(title);
        
        // Full name
        const fullName = this.scene.add.text(width / 2, height / 2 - 225, 
            supplier.fullName, {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: CONFIG.COLORS.textDark
        }).setOrigin(0.5);
        this.container.add(fullName);
        
        // Loyalty indicator
        const loyalty = this.scene.supplierSystem.getLoyalty(supplier.id);
        const loyaltyText = this.scene.add.text(width / 2, height / 2 - 190, 
            `Loyalty: ${this.getLoyaltyStars(loyalty)}`, {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: this.getLoyaltyColor(loyalty)
        }).setOrigin(0.5);
        this.container.add(loyaltyText);
        
        // Portrait
        const portraitKey = `supplier-${supplier.id}`;
        if (this.scene.textures.exists(portraitKey)) {
            const portrait = this.scene.add.image(width / 2 - 300, height / 2 - 80, portraitKey);
            portrait.setDisplaySize(120, 120);
            this.container.add(portrait);
        } else {
            // Placeholder
            const placeholder = this.scene.add.rectangle(width / 2 - 300, height / 2 - 80, 120, 120, 0x333333);
            this.container.add(placeholder);
        }
        
        // Dialog text
        const greeting = this.scene.supplierSystem.getGreeting(supplier.id);
        const dialog = this.scene.add.text(width / 2 - 180, height / 2 - 150, 
            `"${greeting}"`, {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: CONFIG.COLORS.text,
            fontStyle: 'italic'
        }).setOrigin(0, 0);
        this.container.add(dialog);
        
        // Stats section
        const statsY = height / 2 - 60;
        
        // Product quality
        const quality = this.scene.supplierSystem.getQuality(supplier.id);
        const qualityText = this.scene.add.text(width / 2 - 180, statsY, 
            `Product Quality: ${(quality * 100).toFixed(0)}%`, {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: CONFIG.COLORS.text
        }).setOrigin(0, 0.5);
        this.container.add(qualityText);
        
        // Price
        const price = this.scene.supplierSystem.getPrice(supplier.id);
        const priceText = this.scene.add.text(width / 2 - 180, statsY + 25, 
            `Price: $${price}/unit`, {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: CONFIG.COLORS.text
        }).setOrigin(0, 0.5);
        this.container.add(priceText);
        
        // Danger level
        const dangerText = this.scene.add.text(width / 2 - 180, statsY + 50, 
            `Danger Level: ${this.getDangerText(supplier.dangerLevel)}`, {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: this.getDangerColor(supplier.dangerLevel)
        }).setOrigin(0, 0.5);
        this.container.add(dangerText);
        
        // Meeting location
        const location = CONFIG.SUPPLIER_CONFIG.LOCATIONS[supplier.meetingLocation];
        const locationText = this.scene.add.text(width / 2 - 180, statsY + 75, 
            `Meeting: ${location.name}`, {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: CONFIG.COLORS.textDark
        }).setOrigin(0, 0.5);
        this.container.add(locationText);
        
        // Buy section
        const buyY = height / 2 + 50;
        
        // Buy button
        this.buyBtn = this.createButton(width / 2 - 150, buyY, 280, 50, 
            'BUY SUPPLIES', CONFIG.COLORS.success, () => this.buySupplies());
        this.container.add(this.buyBtn);
        
        // Bribe for loyalty button
        this.loyaltyBtn = this.createButton(width / 2 + 150, buyY, 280, 50, 
            'BUILD LOYALTY ($100)', CONFIG.COLORS.primary, () => this.buildLoyalty());
        this.container.add(this.loyaltyBtn);
        
        // Info text
        const infoText = this.scene.add.text(width / 2, height / 2 + 120, 
            'Building loyalty lowers prices and increases quality', {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: CONFIG.COLORS.textDark
        }).setOrigin(0.5);
        this.container.add(infoText);
        
        // Close button
        this.closeBtn = this.createButton(width / 2, height / 2 + 250, 200, 40, 
            'CLOSE', CONFIG.COLORS.danger, () => this.close());
        this.container.add(this.closeBtn);
    }
    
    createButton(x, y, w, h, text, color, callback) {
        const btn = this.scene.add.container(x, y);
        
        const bg = this.scene.add.rectangle(0, 0, w, h, 
            Phaser.Display.Color.HexStringToColor(color).color);
        bg.setInteractive({ useHandCursor: true });
        bg.on('pointerdown', callback);
        btn.add(bg);
        
        const label = this.scene.add.text(0, 0, text, {
            fontFamily: 'Press Start 2P',
            fontSize: '12px',
            color: '#000000'
        }).setOrigin(0.5);
        btn.add(label);
        
        return btn;
    }
    
    getLoyaltyStars(loyalty) {
        const maxStars = CONFIG.MAX_LOYALTY;
        const filled = '★'.repeat(loyalty);
        const empty = '☆'.repeat(maxStars - loyalty);
        return filled + empty;
    }
    
    getLoyaltyColor(loyalty) {
        if (loyalty >= 7) return CONFIG.COLORS.success;
        if (loyalty >= 4) return CONFIG.COLORS.primary;
        return CONFIG.COLORS.danger;
    }
    
    getDangerText(level) {
        const levels = {
            'low': 'LOW',
            'medium': 'MEDIUM',
            'high': 'HIGH',
            'extreme': 'EXTREME'
        };
        return levels[level] || 'UNKNOWN';
    }
    
    getDangerColor(level) {
        const colors = {
            'low': CONFIG.COLORS.success,
            'medium': CONFIG.COLORS.primary,
            'high': CONFIG.COLORS.danger,
            'extreme': '#ff0000'
        };
        return colors[level] || CONFIG.COLORS.text;
    }
    
    buySupplies() {
        if (!this.currentSupplier) return;
        
        const price = this.scene.supplierSystem.getPrice(this.currentSupplier.id);
        const player = this.scene.playerState;
        
        // Check player money
        if (player.money < price) {
            this.showMessage("Not enough money!", CONFIG.COLORS.danger);
            return;
        }
        
        // Check inventory space
        const maxRaw = player.rawCapacity + (player.equipment?.rawCapacityBonus || 0);
        if (player.rawMaterials >= maxRaw) {
            this.showMessage("Inventory full!", CONFIG.COLORS.danger);
            return;
        }
        
        // Calculate how many units player can afford and carry
        const canAfford = Math.floor(player.money / price);
        const canCarry = maxRaw - player.rawMaterials;
        const toBuy = Math.min(canAfford, canCarry, 10); // Max 10 at once
        
        if (toBuy <= 0) {
            this.showMessage("Can't buy any!", CONFIG.COLORS.danger);
            return;
        }
        
        // Deduct money and add materials
        player.money -= toBuy * price;
        player.rawMaterials += toBuy;
        
        // Update HUD
        if (this.scene.hud) {
            this.scene.hud.updateDisplay();
        }
        
        // Show success
        this.showMessage(`Bought ${toBuy} units for $${toBuy * price}`, CONFIG.COLORS.success);
        
        // Small loyalty boost for buying
        this.scene.supplierSystem.modifyLoyalty(this.currentSupplier.id, 0.5);
    }
    
    buildLoyalty() {
        if (!this.currentSupplier) return;
        
        const player = this.scene.playerState;
        
        if (player.money < CONFIG.BRIBE_CASH_AMOUNT) {
            this.showMessage("Not enough money!", CONFIG.COLORS.danger);
            return;
        }
        
        player.money -= CONFIG.BRIBE_CASH_AMOUNT;
        
        // Add loyalty
        const newLoyalty = this.scene.supplierSystem.modifyLoyalty(
            this.currentSupplier.id, CONFIG.BRIBE_CASH_LOYALTY);
        
        // Update HUD
        if (this.scene.hud) {
            this.scene.hud.updateDisplay();
        }
        
        // Show new loyalty
        this.showMessage(`Loyalty increased to ${newLoyalty}!`, CONFIG.COLORS.success);
        
        // Refresh the UI to show new values
        this.close();
        this.open(this.currentSupplier);
    }
    
    showMessage(text, color) {
        if (this.msgText) this.msgText.destroy();
        
        const { width, height } = this.scene.scale;
        this.msgText = this.scene.add.text(width / 2, height / 2 + 180, text, {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: color,
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        this.container.add(this.msgText);
        
        // Auto-hide after 2 seconds
        this.scene.time.delayedCall(2000, () => {
            if (this.msgText) {
                this.msgText.destroy();
                this.msgText = null;
            }
        });
    }
    
    close() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        this.currentSupplier = null;
        
        if (this.overlay) this.overlay.destroy();
        if (this.panel) this.panel.destroy();
        if (this.container) this.container.destroy();
    }
}
