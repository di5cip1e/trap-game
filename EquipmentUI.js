import Phaser from 'phaser';
import { CONFIG } from './config.js';

export default class EquipmentUI {
    constructor(scene) {
        this.scene = scene;
        this.isOpen = false;
        this.currentCategory = 'all';
        this.categories = ['all', 'weapons', 'armor', 'utility', 'accessories'];
        
        // Equipment ID lists by category
        this.equipmentByCategory = {
            all: ['backpack', 'brassKnucks', 'switchblade', 'pistol', 'bulletproofVest', 'heavyCoat', 'runningShoes', 'binoculars', 'lockpick', 'burnerPhone', 'goldChain', 'designerSunglasses'],
            weapons: ['brassKnucks', 'switchblade', 'pistol'],
            armor: ['bulletproofVest', 'heavyCoat'],
            utility: ['runningShoes', 'binoculars', 'lockpick', 'burnerPhone'],
            accessories: ['goldChain', 'designerSunglasses']
        };
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
        this.panel.setDisplaySize(900, 700);
        this.panel.setScrollFactor(0);
        this.panel.setDepth(901);
        this.panel.setAlpha(0.95);
        
        // Container for all UI elements
        this.container = this.scene.add.container(0, 0);
        this.container.setScrollFactor(0);
        this.container.setDepth(902);
        
        // Title
        const title = this.scene.add.text(width / 2, height / 2 - 310, 'EQUIPMENT SHOP', {
            fontFamily: 'Press Start 2P',
            fontSize: '28px',
            color: CONFIG.COLORS.primary,
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.container.add(title);
        
        // Player's money
        const moneyText = this.scene.add.text(width / 2, height / 2 - 260, `Cash: $${this.scene.playerState.money}`, {
            fontFamily: 'Press Start 2P',
            fontSize: '16px',
            color: CONFIG.COLORS.success
        }).setOrigin(0.5);
        this.container.add(moneyText);
        this.moneyText = moneyText;
        
        // Category tabs
        this.createCategoryTabs(width / 2, height / 2 - 220);
        
        // Equipment items container
        this.equipmentContainer = this.scene.add.container(0, 0);
        this.equipmentContainer.setScrollFactor(0);
        this.equipmentContainer.setDepth(903);
        this.container.add(this.equipmentContainer);
        
        // Render equipment
        this.renderEquipment();
        
        // Close button
        const closeButton = this.createButton(width / 2, height / 2 + 290, 200, 50, 'LEAVE', () => {
            this.close();
        });
        this.container.add(closeButton);
    }
    
    createCategoryTabs(centerX, y) {
        const categories = [
            { id: 'all', label: 'ALL' },
            { id: 'weapons', label: 'WEAPONS' },
            { id: 'armor', label: 'ARMOR' },
            { id: 'utility', label: 'UTILITY' },
            { id: 'accessories', label: 'ACCESSORIES' }
        ];
        
        const tabWidth = 140;
        const startX = centerX - ((categories.length * tabWidth) / 2) + (tabWidth / 2);
        
        categories.forEach((cat, index) => {
            const x = startX + (index * tabWidth);
            const isActive = this.currentCategory === cat.id;
            
            const tabButton = this.createTabButton(x, y, cat.label, cat.id, isActive);
            this.container.add(tabButton);
        });
    }
    
    createTabButton(x, y, text, categoryId, isActive) {
        const container = this.scene.add.container(x, y);
        
        const bg = this.scene.add.rectangle(0, 0, 130, 35, 
            isActive ? CONFIG.COLORS.primary : 0x2a2a2a);
        
        const label = this.scene.add.text(0, 0, text, {
            fontFamily: 'Press Start 2P',
            fontSize: '10px',
            color: isActive ? '#000000' : CONFIG.COLORS.text
        }).setOrigin(0.5);
        
        container.add([bg, label]);
        container.setSize(130, 35);
        container.setInteractive({ useHandCursor: true });
        
        container.on('pointerover', () => {
            if (!isActive) {
                bg.setFillStyle(0x3a3a3a);
            }
        });
        
        container.on('pointerout', () => {
            if (!isActive) {
                bg.setFillStyle(0x2a2a2a);
            }
        });
        
        container.on('pointerup', () => {
            if (!isActive) {
                this.currentCategory = categoryId;
                this.close();
                this.open(); // Refresh UI with new category
            }
        });
        
        return container;
    }
    
    renderEquipment() {
        // Clear previous items
        this.equipmentContainer.removeAll(true);
        
        const { width, height } = this.scene.scale;
        const equipmentIds = this.equipmentByCategory[this.currentCategory];
        
        let yOffset = -140;
        const itemHeight = 130;
        
        equipmentIds.forEach((equipmentId, index) => {
            const y = height / 2 + yOffset + (index * itemHeight);
            this.renderEquipmentItem(equipmentId, width / 2, y);
        });
    }
    
    renderEquipmentItem(equipmentId, x, y) {
        const equipment = CONFIG.EQUIPMENT[equipmentId];
        if (!equipment) return;
        
        const owned = this.scene.playerState.equipment[equipmentId];
        const canAfford = this.scene.playerState.money >= equipment.cost;
        
        // Item panel
        const itemPanel = this.scene.add.rectangle(x, y, 800, 110, 0x1a1a1a);
        itemPanel.setStrokeStyle(2, owned ? CONFIG.COLORS.success : CONFIG.COLORS.secondary);
        this.equipmentContainer.add(itemPanel);
        
        // Item icon (type-based)
        const iconColor = this.getEquipmentTypeColor(equipment.type);
        const icon = this.scene.add.rectangle(x - 350, y, 40, 80, iconColor);
        this.equipmentContainer.add(icon);
        
        // Item name
        const nameText = this.scene.add.text(x - 300, y - 35, equipment.name, {
            fontFamily: 'Press Start 2P',
            fontSize: '16px',
            color: owned ? CONFIG.COLORS.success : CONFIG.COLORS.primary
        }).setOrigin(0, 0.5);
        this.equipmentContainer.add(nameText);
        
        // Type badge
        const typeLabel = this.scene.add.text(x - 300, y - 12, `[${equipment.type.toUpperCase()}]`, {
            fontFamily: 'Press Start 2P',
            fontSize: '10px',
            color: iconColor
        }).setOrigin(0, 0.5);
        this.equipmentContainer.add(typeLabel);
        
        // Status
        if (owned) {
            const ownedText = this.scene.add.text(x + 300, y - 35, 'OWNED', {
                fontFamily: 'Press Start 2P',
                fontSize: '14px',
                color: CONFIG.COLORS.success
            }).setOrigin(0.5);
            this.equipmentContainer.add(ownedText);
        }
        
        // Description
        const descText = this.scene.add.text(x - 300, y + 10, equipment.description, {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: CONFIG.COLORS.textDark
        }).setOrigin(0, 0.5);
        this.equipmentContainer.add(descText);
        
        // Benefits
        const benefitsText = this.scene.add.text(x - 300, y + 32, this.getEquipmentBenefits(equipment), {
            fontFamily: 'Press Start 2P',
            fontSize: '10px',
            color: CONFIG.COLORS.text
        }).setOrigin(0, 0.5);
        this.equipmentContainer.add(benefitsText);
        
        // Purchase button or owned status
        if (!owned) {
            const buttonText = canAfford ? `BUY - $${equipment.cost}` : 'TOO POOR';
            const buttonColor = canAfford ? CONFIG.COLORS.success : CONFIG.COLORS.danger;
            
            const purchaseButton = this.createButton(x + 300, y + 20, 160, 40, buttonText, () => {
                if (canAfford) {
                    const success = this.scene.purchaseEquipment(equipmentId);
                    if (success) {
                        this.showPurchaseSuccess(equipment.name);
                        // Refresh UI
                        this.close();
                        this.open();
                    }
                }
            }, buttonColor);
            this.equipmentContainer.add(purchaseButton);
        }
    }
    
    getEquipmentTypeColor(type) {
        const colors = {
            storage: 0x8B4513,    // Brown
            weapon: 0xFF4444,     // Red
            armor: 0x4488FF,      // Blue
            utility: 0x44FF44,    // Green
            accessory: 0xFFAA00   // Gold
        };
        return colors[type] || 0x888888;
    }
    
    getEquipmentBenefits(equipment) {
        const benefits = [];
        
        if (equipment.rawCapacityBonus) {
            benefits.push(`+${equipment.rawCapacityBonus} Raw Cap`);
        }
        if (equipment.productCapacityBonus) {
            benefits.push(`+${equipment.productCapacityBonus} Product Cap`);
        }
        if (equipment.attackBonus) {
            benefits.push(`+${equipment.attackBonus} ATK`);
        }
        if (equipment.rangeAttack) {
            benefits.push(`RANGED`);
        }
        if (equipment.damageReduction) {
            benefits.push(`-${Math.round(equipment.damageReduction * 100)}% Dmg`);
        }
        if (equipment.heatReduction) {
            benefits.push(`-${Math.round(equipment.heatReduction * 100)}% Heat`);
        }
        if (equipment.speedBonus) {
            benefits.push(`+${Math.round((equipment.speedBonus - 1) * 100)}% Speed`);
        }
        if (equipment.visionRangeBonus) {
            benefits.push(`+${equipment.visionRangeBonus} Vision`);
        }
        if (equipment.safehouseEntrySpeed) {
            benefits.push(`+${equipment.safehouseEntrySpeed}x Safehouse`);
        }
        if (equipment.buyerSpawnBonus) {
            benefits.push(`+${Math.round(equipment.buyerSpawnBonus * 100)}% Buyers`);
        }
        if (equipment.priceBonus) {
            benefits.push(`+${Math.round(equipment.priceBonus * 100)}% Prices`);
        }
        if (equipment.detectionReduction) {
            benefits.push(`-${Math.round(equipment.detectionReduction * 100)}% Detect`);
        }
        
        return benefits.join(' | ') || 'Special Item';
    }
    
    showPurchaseSuccess(itemName) {
        const { width, height } = this.scene.scale;
        
        const overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
        overlay.setScrollFactor(0);
        overlay.setDepth(1100);
        
        const message = this.scene.add.text(width / 2, height / 2, 
            `PURCHASED!\n\n${itemName}`, {
            fontFamily: 'Press Start 2P',
            fontSize: '24px',
            color: CONFIG.COLORS.success,
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1101);
        
        this.scene.time.delayedCall(1500, () => {
            overlay.destroy();
            message.destroy();
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
        this.equipmentContainer = null;
    }
    
    createButton(x, y, width, height, text, callback, textColor = CONFIG.COLORS.text) {
        const container = this.scene.add.container(x, y);
        
        const bg = this.scene.add.rectangle(0, 0, width, height, 0x2a2a2a);
        bg.setStrokeStyle(2, 0xffcc00);
        
        const label = this.scene.add.text(0, 0, text, {
            fontFamily: 'Press Start 2P',
            fontSize: '12px',
            color: textColor
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
            label.setColor(textColor);
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