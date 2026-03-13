import Phaser from 'phaser';
import { CONFIG } from './config.js';

export default class EquipmentUI {
    constructor(scene) {
        this.scene = scene;
        this.isOpen = false;
        
        // View mode: 'shop' or 'equipped'
        this.viewMode = 'shop';
        
        // Shop categories
        this.currentCategory = 'all';
        this.categories = ['all', 'weapons', 'armor', 'utility', 'accessories', 'head', 'legs'];
        
        // Equipment slots for equipped view
        this.equipmentSlots = [
            { id: 'hat', label: 'HAT', y: -180 },
            { id: 'shirt', label: 'SHIRT', y: -100 },
            { id: 'jacket', label: 'JACKET', y: -20 },
            { id: 'pants', label: 'PANTS', y: 60 },
            { id: 'shoes', label: 'SHOES', y: 140 },
            { id: 'accessory1', label: 'ACCESSORY 1', y: 220 },
            { id: 'accessory2', label: 'ACCESSORY 2', y: 300 },
            { id: 'weapon1', label: 'WEAPON 1', y: 380 },
            { id: 'weapon2', label: 'WEAPON 2 (LOCKED)', y: 460, locked: true }
        ];
        
        this.comparisonPanel = null;
        
        // Equipment ID lists by category
        this.equipmentByCategory = {
            all: ['backpack', 'baseCap', 'fedora', 'brassKnucks', 'switchblade', 'pistol', 'secondaryPistol', 'machinePistol', 'smg', 'assaultRifle', 'machineGun', 'bulletproofVest', 'leatherJacket', 'heavyCoat', 'trenchCoat', 'cargoPants', 'runningShoes', 'combatBoots', 'binoculars', 'lockpick', 'burnerPhone', 'goldChain', 'designerSunglasses'],
            weapons: ['brassKnucks', 'switchblade', 'pistol', 'secondaryPistol', 'machinePistol', 'smg', 'assaultRifle', 'machineGun'],
            armor: ['bulletproofVest', 'leatherJacket', 'heavyCoat', 'trenchCoat', 'cargoPants'],
            utility: ['runningShoes', 'combatBoots', 'binoculars', 'lockpick', 'burnerPhone'],
            accessories: ['goldChain', 'designerSunglasses'],
            head: ['baseCap', 'fedora'],
            legs: ['cargoPants']
        };
        
        // Stats that can be compared
        this.comparableStats = [
            { key: 'rawCapacityBonus', label: 'Raw Cap' },
            { key: 'productCapacityBonus', label: 'Product Cap' },
            { key: 'attackBonus', label: 'Attack' },
            { key: 'damageReduction', label: 'Dmg Reduct', isPercent: true },
            { key: 'heatReduction', label: 'Heat Reduct', isPercent: true },
            { key: 'speedBonus', label: 'Speed', isMultiplier: true },
            { key: 'visionRangeBonus', label: 'Vision' },
            { key: 'safehouseEntrySpeed', label: 'Safehouse', isMultiplier: true },
            { key: 'buyerSpawnBonus', label: 'Buyers', isPercent: true },
            { key: 'priceBonus', label: 'Prices', isPercent: true },
            { key: 'detectionReduction', label: 'Detect', isPercent: true }
        ];
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
        
        // Mode toggle (Shop / Equipped)
        this.createModeToggle(width / 2, height / 2 - 330);
        
        // Player's money
        const moneyText = this.scene.add.text(width / 2, height / 2 - 260, `Cash: $${this.scene.playerState.money}`, {
            fontFamily: 'Press Start 2P',
            fontSize: '16px',
            color: CONFIG.COLORS.success
        }).setOrigin(0.5);
        this.container.add(moneyText);
        this.moneyText = moneyText;
        
        // Category tabs (shop mode only)
        if (this.viewMode === 'shop') {
            this.createCategoryTabs(width / 2, height / 2 - 220);
        }
        
        // Equipment items container
        this.equipmentContainer = this.scene.add.container(0, 0);
        this.equipmentContainer.setScrollFactor(0);
        this.equipmentContainer.setDepth(903);
        this.container.add(this.equipmentContainer);
        
        // Render based on mode
        this.renderContent();
        
        // Close button
        const closeButton = this.createButton(width / 2, height / 2 + 290, 200, 50, 'CLOSE', () => {
            this.close();
        });
        this.container.add(closeButton);
    }
    
    createModeToggle(centerX, y) {
        const container = this.scene.add.container(centerX, y);
        
        // Shop button
        const shopBg = this.scene.add.rectangle(-100, 0, 180, 40, 
            this.viewMode === 'shop' ? CONFIG.COLORS.primary : 0x2a2a2a);
        const shopText = this.scene.add.text(-100, 0, 'SHOP', {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: this.viewMode === 'shop' ? '#000000' : CONFIG.COLORS.text
        }).setOrigin(0.5);
        
        const shopBtn = this.scene.add.container(-100, 0);
        shopBtn.add([shopBg, shopText]);
        shopBtn.setSize(180, 40);
        shopBtn.setInteractive({ useHandCursor: true });
        shopBtn.on('pointerup', () => {
            if (this.viewMode !== 'shop') {
                this.viewMode = 'shop';
                this.refreshUI();
            }
        });
        container.add(shopBtn);
        
        // Equipped button
        const equippedBg = this.scene.add.rectangle(100, 0, 180, 40, 
            this.viewMode === 'equipped' ? CONFIG.COLORS.primary : 0x2a2a2a);
        const equippedText = this.scene.add.text(100, 0, 'EQUIPPED', {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: this.viewMode === 'equipped' ? '#000000' : CONFIG.COLORS.text
        }).setOrigin(0.5);
        
        const equippedBtn = this.scene.add.container(100, 0);
        equippedBtn.add([equippedBg, equippedText]);
        equippedBtn.setSize(180, 40);
        equippedBtn.setInteractive({ useHandCursor: true });
        equippedBtn.on('pointerup', () => {
            if (this.viewMode !== 'equipped') {
                this.viewMode = 'equipped';
                this.refreshUI();
            }
        });
        container.add(equippedBtn);
        
        this.container.add(container);
    }
    
    renderContent() {
        if (this.viewMode === 'shop') {
            this.renderShop();
        } else {
            this.renderEquipped();
        }
    }
    
    /**
     * Render the equipped items view with slot system
     */
    renderEquipped() {
        this.equipmentContainer.removeAll(true);
        
        const { width, height } = this.scene.scale;
        const centerX = width / 2;
        
        // Title for stats
        const stats = this.scene.playerManager?.getEquipmentStats() || {};
        const statsText = this.scene.add.text(centerX, height / 2 - 180, 'EQUIPPED ITEMS', {
            fontFamily: 'Press Start 2P',
            fontSize: '22px',
            color: CONFIG.COLORS.primary,
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.equipmentContainer.add(statsText);
        
        // Show total stat bonuses
        this.renderStatBonuses(centerX, height / 2 - 140, stats);
        
        // Render each slot
        this.equipmentSlots.forEach((slot, index) => {
            const x = centerX;
            const y = height / 2 + slot.y;
            this.renderSlot(x, y, slot);
        });
    }
    
    renderStatBonuses(centerX, y, stats) {
        const bonusTexts = [];
        let bonusStr = ' bonuses: ';
        
        if (stats.rawCapacityBonus) bonusStr += `+${stats.rawCapacityBonus} Raw `;
        if (stats.productCapacityBonus) bonusStr += `+${stats.productCapacityBonus} Product `;
        if (stats.attackBonus) bonusStr += `+${stats.attackBonus} ATK `;
        if (stats.damageReduction) bonusStr += `-${Math.round(stats.damageReduction * 100)}% Dmg `;
        if (stats.heatReduction) bonusStr += `-${Math.round(stats.heatReduction * 100)}% Heat `;
        if (stats.speedBonus > 1) bonusStr += `+${Math.round((stats.speedBonus - 1) * 100)}% Speed `;
        if (stats.visionRangeBonus) bonusStr += `+${stats.visionRangeBonus} Vision `;
        if (stats.priceBonus) bonusStr += `+${Math.round(stats.priceBonus * 100)}% Prices `;
        if (stats.detectionReduction) bonusStr += `-${Math.round(stats.detectionReduction * 100)}% Detect`;
        
        if (bonusStr === ' bonuses: ') bonusStr = 'No bonuses active';
        
        const bonusText = this.scene.add.text(centerX, y, bonusStr, {
            fontFamily: 'Press Start 2P',
            fontSize: '10px',
            color: CONFIG.COLORS.success
        }).setOrigin(0.5);
        this.equipmentContainer.add(bonusText);
    }
    
    renderSlot(x, y, slot) {
        const equippedId = this.scene.playerState.equipment?.[slot.id];
        const equipped = equippedId ? CONFIG.EQUIPMENT[equippedId] : null;
        const isLocked = slot.locked;
        
        // Check if weapon2 is unlocked
        const weapon2Unlocked = this.scene.playerState.unlockedSkills?.includes('dual_wield');
        
        // Slot background
        const slotBg = this.scene.add.rectangle(x, y, 700, 60, 0x1a1a1a);
        slotBg.setStrokeStyle(2, equipped ? CONFIG.COLORS.success : (isLocked && !weapon2Unlocked ? 0x444444 : CONFIG.COLORS.secondary));
        this.equipmentContainer.add(slotBg);
        
        // Slot label
        const labelColor = isLocked && !weapon2Unlocked ? CONFIG.COLORS.textDark : CONFIG.COLORS.text;
        const labelText = this.scene.add.text(x - 320, y, slot.label, {
            fontFamily: 'Press Start 2P',
            fontSize: '12px',
            color: labelColor
        }).setOrigin(0, 0.5);
        this.equipmentContainer.add(labelText);
        
        if (isLocked && !weapon2Unlocked) {
            // Locked slot
            const lockText = this.scene.add.text(x, y, '🔒 LOCKED - Requires Dual Wield Skill', {
                fontFamily: 'Press Start 2P',
                fontSize: '12px',
                color: CONFIG.COLORS.textDark
            }).setOrigin(0.5);
            this.equipmentContainer.add(lockText);
            return;
        }
        
        if (equipped) {
            // Show equipped item
            const nameText = this.scene.add.text(x - 180, y - 12, equipped.name, {
                fontFamily: 'Press Start 2P',
                fontSize: '14px',
                color: CONFIG.COLORS.success
            }).setOrigin(0, 0.5);
            this.equipmentContainer.add(nameText);
            
            // Show item bonuses
            const bonuses = this.getItemBonuses(equipped);
            if (bonuses) {
                const bonusText = this.scene.add.text(x - 180, y + 12, bonuses, {
                    fontFamily: 'Arial',
                    fontSize: '11px',
                    color: CONFIG.COLORS.textDark
                }).setOrigin(0, 0.5);
                this.equipmentContainer.add(bonusText);
            }
            
            // Unequip button
            const unequipBtn = this.createButton(x + 280, y, 120, 35, 'UNEQUIP', () => {
                this.scene.playerManager?.unequipEquipment(equippedId);
                this.refreshUI();
            }, CONFIG.COLORS.secondary);
            this.equipmentContainer.add(unequipBtn);
            
        } else {
            // Empty slot - show what's available to equip
            const emptyText = this.scene.add.text(x - 180, y, 'Empty', {
                fontFamily: 'Press Start 2P',
                fontSize: '12px',
                color: CONFIG.COLORS.textDark
            }).setOrigin(0, 0.5);
            this.equipmentContainer.add(emptyText);
            
            // Show "Owned" indicator if player has items for this slot
            const ownedForSlot = this.getOwnedItemsForSlot(slot.id);
            if (ownedForSlot.length > 0) {
                const equipText = this.scene.add.text(x + 200, y, `${ownedForSlot.length} owned`, {
                    fontFamily: 'Press Start 2P',
                    fontSize: '10px',
                    color: CONFIG.COLORS.primary
                }).setOrigin(0.5);
                this.equipmentContainer.add(equipText);
                
                // Quick equip button (cycles through owned items)
                const quickBtn = this.createButton(x + 320, y, 100, 35, 'EQUIP', () => {
                    // Find first owned item for this slot that's not equipped
                    for (const itemId of ownedForSlot) {
                        const canEquip = this.scene.playerManager?.canEquip(itemId);
                        if (canEquip?.valid) {
                            this.scene.playerManager?.equipItem(itemId);
                            break;
                        }
                    }
                    this.refreshUI();
                }, CONFIG.COLORS.success);
                this.equipmentContainer.add(quickBtn);
            }
        }
    }
    
    getOwnedItemsForSlot(slotId) {
        const owned = this.scene.playerState.equipment?.owned || {};
        const itemsForSlot = [];
        
        for (const [itemId, isOwned] of Object.entries(owned)) {
            if (isOwned) {
                const eq = CONFIG.EQUIPMENT[itemId];
                if (eq?.slot === slotId) {
                    itemsForSlot.push(itemId);
                }
            }
        }
        return itemsForSlot;
    }
    
    getItemBonuses(equipment) {
        const bonuses = [];
        
        if (equipment.rawCapacityBonus) bonuses.push(`+${equipment.rawCapacityBonus} Raw`);
        if (equipment.productCapacityBonus) bonuses.push(`+${equipment.productCapacityBonus} Product`);
        if (equipment.attackBonus) bonuses.push(`+${equipment.attackBonus} ATK`);
        if (equipment.damageReduction) bonuses.push(`-${Math.round(equipment.damageReduction * 100)}% Dmg`);
        if (equipment.heatReduction) bonuses.push(`-${Math.round(equipment.heatReduction * 100)}% Heat`);
        if (equipment.speedBonus && equipment.speedBonus > 1) bonuses.push(`+${Math.round((equipment.speedBonus - 1) * 100)}% Speed`);
        if (equipment.visionRangeBonus) bonuses.push(`+${equipment.visionRangeBonus} Vision`);
        if (equipment.priceBonus) bonuses.push(`+${Math.round(equipment.priceBonus * 100)}% Prices`);
        if (equipment.detectionReduction) bonuses.push(`-${Math.round(equipment.detectionReduction * 100)}% Detect`);
        if (equipment.safehouseEntrySpeed) bonuses.push(`${equipment.safehouseEntrySpeed}x Safehouse`);
        if (equipment.buyerSpawnBonus) bonuses.push(`+${Math.round(equipment.buyerSpawnBonus * 100)}% Buyers`);
        
        return bonuses.join(' | ');
    }
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
        
        this.categoryTabs = [];
        
        categories.forEach((cat, index) => {
            const x = startX + (index * tabWidth);
            const isActive = this.currentCategory === cat.id;
            
            const tabButton = this.createTabButton(x, y, cat.label, cat.id, isActive);
            this.container.add(tabButton);
            this.categoryTabs.push({ container: tabButton, categoryId: cat.id });
        });
    }
    
    updateCategoryTabs() {
        if (!this.categoryTabs) return;
        
        this.categoryTabs.forEach(tab => {
            const isActive = this.currentCategory === tab.categoryId;
            const container = tab.container;
            
            // Update background color
            const bg = container.list[0];
            bg.setFillStyle(isActive ? CONFIG.COLORS.primary : 0x2a2a2a);
            
            // Update text color
            const label = container.list[1];
            label.setColor(isActive ? '#000000' : CONFIG.COLORS.text);
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
                // Just update the equipment display instead of closing/reopening
                this.updateCategoryTabs();
                this.renderEquipment();
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
        
        // Check skill requirements for weapons
        const unlockedSkills = this.scene.playerState.unlockedSkills || [];
        const skillCheck = CONFIG.canEquipWeapon(equipmentId, unlockedSkills);
        const hasSkill = skillCheck.canEquip;
        const skillReason = skillCheck.reason;
        
        // Determine if weapon is locked due to skill requirement
        const isLocked = !hasSkill && !owned;
        const isAutomaticWeapon = equipment.automaticOnly;
        const isSecondarySlot = equipment.slot === 2;
        
        // Item panel
        const itemPanel = this.scene.add.rectangle(x, y, 800, 110, 0x1a1a1a);
        itemPanel.setStrokeStyle(2, owned ? CONFIG.COLORS.success : (isLocked ? 0x444444 : CONFIG.COLORS.secondary));
        itemPanel.setInteractive({ useHandCursor: true });
        this.equipmentContainer.add(itemPanel);
        
        // Show comparison on hover (only for items you don't own yet, to help decide purchase)
        if (!owned) {
            itemPanel.on('pointerover', () => {
                itemPanel.setFillStyle(0x2a2a2a);
                this.showComparison(equipmentId, x, y);
            });
            
            itemPanel.on('pointerout', () => {
                itemPanel.setFillStyle(0x1a1a1a);
                this.hideComparison();
            });
        }
        
        // Item icon (type-based)
        const iconColor = this.getEquipmentTypeColor(equipment.type);
        const icon = this.scene.add.rectangle(x - 350, y, 40, 80, iconColor);
        this.equipmentContainer.add(icon);
        
        // Item name
        const nameText = this.scene.add.text(x - 300, y - 35, equipment.name, {
            fontFamily: 'Press Start 2P',
            fontSize: '16px',
            color: owned ? CONFIG.COLORS.success : (isLocked ? 0x666666 : CONFIG.COLORS.primary)
        }).setOrigin(0, 0.5);
        this.equipmentContainer.add(nameText);
        
        // Slot/Skill indicator for weapons
        if (equipment.type === 'weapon') {
            let slotText = '';
            let slotColor = CONFIG.COLORS.text;
            
            // Slot indicator
            if (equipment.slot === 1) {
                slotText = '[SLOT 1]';
            } else if (equipment.slot === 2) {
                slotText = '[SLOT 2 - DUAL WIELD]';
                slotColor = 0xffaa00;
            }
            
            // Add automatic weapon indicator
            if (equipment.automaticOnly) {
                slotText = slotText ? slotText + ' [AUTO]' : '[AUTO]';
                slotColor = 0xff4444;
            }
            
            if (slotText) {
                const slotLabel = this.scene.add.text(x - 300, y - 12, slotText, {
                    fontFamily: 'Press Start 2P',
                    fontSize: '9px',
                    color: slotColor
                }).setOrigin(0, 0.5);
                this.equipmentContainer.add(slotLabel);
            }
            
            // Show locked status if skill missing
            if (isLocked) {
                const lockedText = this.scene.add.text(x + 300, y - 35, 'LOCKED', {
                    fontFamily: 'Press Start 2P',
                    fontSize: '14px',
                    color: 0xff4444
                }).setOrigin(0.5);
                this.equipmentContainer.add(lockedText);
                
                const reasonText = this.scene.add.text(x + 300, y - 15, skillReason, {
                    fontFamily: 'Press Start 2P',
                    fontSize: '8px',
                    color: 0x888888
                }).setOrigin(0.5);
                this.equipmentContainer.add(reasonText);
            }
        }
        
        // Type badge (only show for non-weapons to avoid overlap)
        if (equipment.type !== 'weapon') {
            const typeLabel = this.scene.add.text(x - 300, y - 12, `[${equipment.type.toUpperCase()}]`, {
                fontFamily: 'Press Start 2P',
                fontSize: '10px',
                color: iconColor
            }).setOrigin(0, 0.5);
            this.equipmentContainer.add(typeLabel);
        }
        
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
            // Can't buy if skill-locked
            if (isLocked) {
                const lockedBtn = this.scene.add.rectangle(x + 300, y + 20, 160, 40, 0x333333);
                lockedBtn.setStrokeStyle(2, 0x666666);
                this.equipmentContainer.add(lockedBtn);
                
                const lockedText = this.scene.add.text(x + 300, y + 20, 'LOCKED', {
                    fontFamily: 'Press Start 2P',
                    fontSize: '12px',
                    color: 0x888888
                }).setOrigin(0.5);
                this.equipmentContainer.add(lockedText);
            } else {
                const buttonText = canAfford ? `BUY - $${equipment.cost}` : 'TOO POOR';
                const buttonColor = canAfford ? CONFIG.COLORS.success : CONFIG.COLORS.danger;
                
                const purchaseButton = this.createButton(x + 300, y + 20, 160, 40, buttonText, () => {
                    if (canAfford) {
                        const success = this.scene.purchaseEquipment(equipmentId);
                        if (success) {
                            this.showPurchaseSuccess(equipment.name);
                            // Refresh UI without closing/reopening
                            this.refreshUI();
                        }
                    }
                }, buttonColor);
                this.equipmentContainer.add(purchaseButton);
            }
        } else {
            // Owned - show Unequip and Sell buttons
            const sellValue = Math.floor(equipment.cost * 0.5);
            
            // Unequip button
            const unequipButton = this.createButton(x + 220, y + 20, 130, 40, 'UNEQUIP', () => {
                const success = this.scene.unequipEquipment(equipmentId);
                if (success) {
                    this.showUnequipSuccess(equipment.name);
                    // Refresh UI without closing/reopening
                    this.refreshUI();
                }
            }, CONFIG.COLORS.secondary);
            this.equipmentContainer.add(unequipButton);
            
            // Sell button
            const sellButton = this.createButton(x + 370, y + 20, 130, 40, `SELL $${sellValue}`, () => {
                const sellAmount = this.scene.sellEquipment(equipmentId);
                if (sellAmount) {
                    this.showSellSuccess(equipment.name, sellAmount);
                    // Refresh UI without closing/reopening
                    this.refreshUI();
                }
            }, CONFIG.COLORS.danger);
            this.equipmentContainer.add(sellButton);
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
    
    // Calculate total stats from all currently equipped items
    getCurrentStats() {
        const stats = {};
        
        this.comparableStats.forEach(stat => {
            stats[stat.key] = 0;
        });
        
        // Iterate through all owned equipment
        const equipment = this.scene.playerState.equipment;
        for (const [id, isEquipped] of Object.entries(equipment)) {
            if (isEquipped && CONFIG.EQUIPMENT[id]) {
                const item = CONFIG.EQUIPMENT[id];
                this.comparableStats.forEach(stat => {
                    if (item[stat.key]) {
                        stats[stat.key] += item[stat.key];
                    }
                });
            }
        }
        
        return stats;
    }
    
    // Calculate what stats would be if we replace equipped item of same type with new item
    getComparisonStats(equipmentId) {
        const newEquipment = CONFIG.EQUIPMENT[equipmentId];
        if (!newEquipment) return null;
        
        const currentStats = this.getCurrentStats();
        const newStats = { ...currentStats };
        
        // Get type of item being considered
        const itemType = newEquipment.type;
        
        // Subtract stats from currently equipped items of the same type
        const equipment = this.scene.playerState.equipment;
        for (const [id, isEquipped] of Object.entries(equipment)) {
            if (isEquipped && CONFIG.EQUIPMENT[id]) {
                const equippedItem = CONFIG.EQUIPMENT[id];
                if (equippedItem.type === itemType) {
                    this.comparableStats.forEach(stat => {
                        if (equippedItem[stat.key]) {
                            newStats[stat.key] -= equippedItem[stat.key];
                        }
                    });
                }
            }
        }
        
        // Add stats from the new item
        this.comparableStats.forEach(stat => {
            if (newEquipment[stat.key]) {
                newStats[stat.key] += newEquipment[stat.key];
            }
        });
        
        return { current: currentStats, new: newStats };
    }
    
    // Show comparison panel for an item
    showComparison(equipmentId, x, y) {
        this.hideComparison();
        
        const comparison = this.getComparisonStats(equipmentId);
        if (!comparison) return;
        
        const { width, height } = this.scene.scale;
        
        // Only show if there's a difference
        let hasDifference = false;
        this.comparableStats.forEach(stat => {
            if (comparison.current[stat.key] !== comparison.new[stat.key]) {
                hasDifference = true;
            }
        });
        
        if (!hasDifference) return;
        
        // Create comparison panel
        this.comparisonPanel = this.scene.add.container(x + 450, y);
        
        // Background
        const panelBg = this.scene.add.rectangle(0, 0, 280, 200, 0x1a1a1a);
        panelBg.setStrokeStyle(2, CONFIG.COLORS.primary);
        this.comparisonPanel.add(panelBg);
        
        // Title
        const titleText = this.scene.add.text(0, -85, 'COMPARISON', {
            fontFamily: 'Press Start 2P',
            fontSize: '12px',
            color: CONFIG.COLORS.primary
        }).setOrigin(0.5);
        this.comparisonPanel.add(titleText);
        
        // Stats comparison
        let yOffset = -60;
        this.comparableStats.forEach(stat => {
            const currentVal = comparison.current[stat.key];
            const newVal = comparison.new[stat.key];
            
            if (currentVal !== newVal) {
                const diff = newVal - currentVal;
                const diffText = diff > 0 ? `+${this.formatStatValue(diff, stat)}` : `${this.formatStatValue(diff, stat)}`;
                const color = diff > 0 ? '#44FF44' : (diff < 0 ? '#FF4444' : CONFIG.COLORS.text);
                
                // Current value
                const currentText = this.scene.add.text(-110, yOffset, 
                    `${stat.label}: ${this.formatStatValue(currentVal, stat)}`, {
                    fontFamily: 'Press Start 2P',
                    fontSize: '9px',
                    color: CONFIG.COLORS.textDark
                }).setOrigin(0, 0.5);
                this.comparisonPanel.add(currentText);
                
                // Arrow
                const arrowText = this.scene.add.text(0, yOffset, '→', {
                    fontFamily: 'Press Start 2P',
                    fontSize: '9px',
                    color: CONFIG.COLORS.text
                }).setOrigin(0.5);
                this.comparisonPanel.add(arrowText);
                
                // New value with difference
                const newText = this.scene.add.text(60, yOffset, 
                    `${this.formatStatValue(newVal, stat)} (${diffText})`, {
                    fontFamily: 'Press Start 2P',
                    fontSize: '9px',
                    color: color
                }).setOrigin(0, 0.5);
                this.comparisonPanel.add(newText);
                
                yOffset += 22;
            }
        });
        
        // Add to container
        this.equipmentContainer.add(this.comparisonPanel);
    }
    
    formatStatValue(value, stat) {
        if (stat.isPercent) {
            return Math.round(value * 100) + '%';
        } else if (stat.isMultiplier) {
            return value.toFixed(1) + 'x';
        }
        return Math.round(value * 10) / 10;
    }
    
    hideComparison() {
        if (this.comparisonPanel) {
            this.comparisonPanel.destroy();
            this.comparisonPanel = null;
        }
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
    
    showUnequipSuccess(itemName) {
        const { width, height } = this.scene.scale;
        
        const overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
        overlay.setScrollFactor(0);
        overlay.setDepth(1100);
        
        const message = this.scene.add.text(width / 2, height / 2, 
            `UNEQUIPPED!\n\n${itemName}`, {
            fontFamily: 'Press Start 2P',
            fontSize: '24px',
            color: CONFIG.COLORS.secondary,
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1101);
        
        this.scene.time.delayedCall(1500, () => {
            overlay.destroy();
            message.destroy();
        });
    }
    
    showSellSuccess(itemName, amount) {
        const { width, height } = this.scene.scale;
        
        const overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
        overlay.setScrollFactor(0);
        overlay.setDepth(1100);
        
        const message = this.scene.add.text(width / 2, height / 2, 
            `SOLD!\n\n${itemName}\n+$${amount}`, {
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
    
    /**
     * Refresh the UI without closing/reopening (performance optimization)
     */
    refreshUI() {
        if (!this.isOpen) return;
        
        // Update money display
        if (this.moneyText) {
            this.moneyText.setText(`Cash: $${this.scene.playerState.money}`);
        }
        
        // Update category tabs to reflect active category state
        this.updateCategoryTabs();
        
        // Re-render equipment list
        this.renderEquipment();
    }
    
    close() {
        if (!this.isOpen) return;
        this.isOpen = false;
        
        this.hideComparison();
        
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