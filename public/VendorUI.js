import Phaser from 'phaser';
import { CONFIG } from './config.js';

export default class VendorUI {
    constructor(scene) {
        this.scene = scene;
        this.isOpen = false;
        this.customInventory = null;
    }
    
    open(customInventory = null) {
        if (this.isOpen) return;
        this.isOpen = true;
        this.customInventory = customInventory;
        
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
        
        // Title - customize for traveling salesman
        const isTravelingSalesman = this.customInventory && this.customInventory.length > 0;
        const titleText = isTravelingSalesman ? 'TRAVELING SALESMAN' : 'SUPPLIER';
        const subtitleText = isTravelingSalesman 
            ? '"Looking for something... special?"' 
            : '"You need supplies? I got you."';
        
        const title = this.scene.add.text(width / 2, height / 2 - 220, titleText, {
            fontFamily: 'Press Start 2P',
            fontSize: '32px',
            color: isTravelingSalesman ? CONFIG.COLORS.secondary : CONFIG.COLORS.primary,
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.container.add(title);
        
        // Subtitle
        const subtitle = this.scene.add.text(width / 2, height / 2 - 170, 
            subtitleText, {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: CONFIG.COLORS.textDark,
            fontStyle: 'italic'
        }).setOrigin(0.5);
        this.container.add(subtitle);
        
        // Get all purchasable drug types (buyPrice > 0)
        // If custom inventory provided (e.g., traveling salesman), use that instead
        if (this.customInventory && this.customInventory.length > 0) {
            // Create drug type entries for custom inventory items
            this.drugTypes = this.customInventory.map(itemKey => {
                // Look up the item in DRUG_TYPES or create a placeholder for precursors
                const existingDrug = Object.entries(CONFIG.DRUG_TYPES).find(([k, d]) => 
                    k.toLowerCase() === itemKey.toLowerCase() || 
                    (d.rawMaterial && d.rawMaterial.toLowerCase() === itemKey.toLowerCase())
                );
                
                if (existingDrug) {
                    return existingDrug;
                }
                
                // For Precursor items not in DRUG_TYPES, create custom entries
                const precursorPrices = {
                    'Precursor A': { buyPrice: 150, yield: 1, category: 'Precursor', name: itemKey },
                    'Precursor B': { buyPrice: 200, yield: 1, category: 'Precursor', name: itemKey }
                };
                
                if (precursorPrices[itemKey]) {
                    return [itemKey, precursorPrices[itemKey]];
                }
                
                // Default fallback
                return [itemKey, { buyPrice: 100, yield: 1, category: 'Special', name: itemKey }];
            });
        } else {
            this.drugTypes = Object.entries(CONFIG.DRUG_TYPES).filter(([key, drug]) => drug.buyPrice > 0);
        }
        
        // Selected drug index
        this.selectedDrugIndex = 0;
        
        // Item display - now uses scrollable list
        this.createDrugList();
        
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
        
        // Buy Max button
        const buyMaxButton = this.createButton(width / 2 - 160, height / 2 + 210, 140, 40, 'BUY MAX', () => {
            this.buyMax();
        });
        this.container.add(buyMaxButton);
        
        // Equipment button
        const equipButton = this.createButton(width / 2 - 60, height / 2 + 150, 100, 50, 'GEAR', () => {
            this.close();
            this.scene.equipmentUI.open();
        });
        this.container.add(equipButton);
        
        // Ammo button (for pistol ammo)
        const ammoButton = this.createButton(width / 2 + 60, height / 2 + 150, 100, 50, 'AMMO', () => {
            this.buyAmmo();
        });
        this.container.add(ammoButton);
        
        // Close button
        this.closeButton = this.createButton(width / 2 + 160, height / 2 + 150, 140, 50, 'LEAVE', () => {
            this.close();
        });
        this.container.add(this.closeButton);
        
        // ======== SELL SECTION ========
        // Add a SELL tab to allow selling processed drugs
        this.sellMode = false; // Toggle between buy/sell mode
        
        const sellTabButton = this.createButton(width / 2 + 160, height / 2 + 210, 140, 40, 'SELL 🡢', () => {
            this.toggleSellMode();
        }, CONFIG.COLORS.secondary);
        this.container.add(sellTabButton);
        this.sellTabButton = sellTabButton;
        
        // Container for sell UI elements (hidden by default)
        this.sellContainer = this.scene.add.container(0, 0);
        this.sellContainer.setScrollFactor(0);
        this.sellContainer.setDepth(902);
        this.sellContainer.setVisible(false);
        this.container.add(this.sellContainer);
        
        this.createSellUI();
        
        this.updateDisplay();
    }
    
    createDrugList() {
        const { width, height } = this.scene.scale;
        const isDrought = this.scene.calendarSystem ? this.scene.calendarSystem.isDroughtActive() : false;
        
        // Container for drug list
        this.drugListContainer = this.scene.add.container(0, 0);
        this.drugListContainer.setScrollFactor(0);
        this.drugListContainer.setDepth(902);
        this.container.add(this.drugListContainer);
        
        // Create clickable drug items
        this.drugItems = [];
        const startY = height / 2 - 100;
        const spacing = 70;
        
        this.drugTypes.forEach(([drugKey, drug], index) => {
            const y = startY + (index * spacing);
            
            // Background for selection
            const bg = this.scene.add.rectangle(width / 2, y, 600, 55, 
                index === this.selectedDrugIndex ? 0x333333 : 0x222222);
            bg.setScrollFactor(0);
            bg.setDepth(903);
            bg.setStrokeStyle(2, index === this.selectedDrugIndex ? CONFIG.COLORS.primary : 0x444444);
            
            // Make interactive
            bg.setInteractive({ useHandCursor: true });
            bg.on('pointerdown', () => {
                this.selectDrug(index);
            });
            
            this.drugListContainer.add(bg);
            
            // Drug name
            const nameText = this.scene.add.text(width / 2 - 250, y, drugKey.toUpperCase(), {
                fontFamily: 'Press Start 2P',
                fontSize: '14px',
                color: index === this.selectedDrugIndex ? CONFIG.COLORS.primary : CONFIG.COLORS.text
            }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(904);
            this.drugListContainer.add(nameText);
            
            // Buy price
            const priceText = this.scene.add.text(width / 2 + 150, y, 
                `$${drug.buyPrice}`, {
                fontFamily: 'Press Start 2P',
                fontSize: '14px',
                color: isDrought ? CONFIG.COLORS.danger : CONFIG.COLORS.success
            }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(904);
            this.drugListContainer.add(priceText);
            
            // Yield info
            const yieldText = this.scene.add.text(width / 2 + 250, y, 
                `x${drug.yield}`, {
                fontFamily: 'Press Start 2P',
                fontSize: '12px',
                color: CONFIG.COLORS.textDark
            }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(904);
            this.drugListContainer.add(yieldText);
            
            this.drugItems.push({ bg, nameText, priceText, yieldText, drugKey, drug });
        });
    }
    
    selectDrug(index) {
        this.selectedDrugIndex = index;
        
        // Update visual selection
        this.drugItems.forEach((item, i) => {
            const isSelected = i === index;
            item.bg.setFillStyle(isSelected ? 0x333333 : 0x222222);
            item.bg.setStrokeStyle(2, isSelected ? CONFIG.COLORS.primary : 0x444444);
            item.nameText.setColor(isSelected ? CONFIG.COLORS.primary : CONFIG.COLORS.text);
        });
        
        // Reset quantity when changing selection
        this.quantity = 1;
        
        this.updateDisplay();
    }
    
    changeQuantity(delta) {
        this.quantity = Math.max(1, this.quantity + delta);
        this.updateDisplay();
    }
    
    getCurrentDrugPrice() {
        const selectedDrug = this.drugTypes[this.selectedDrugIndex];
        if (!selectedDrug) return 0;
        const [, drug] = selectedDrug;
        const isDrought = this.scene.calendarSystem ? this.scene.calendarSystem.isDroughtActive() : false;
        return drug.buyPrice * (isDrought ? 2 : 1);
    }
    
    getCurrentRawPrice() {
        const multiplier = this.scene.calendarSystem ? this.scene.calendarSystem.getRawMaterialCostMultiplier() : 1;
        return CONFIG.RAW_MATERIAL_COST * multiplier;
    }
    
    updateDisplay() {
        const currentPrice = this.getCurrentDrugPrice();
        const total = this.quantity * currentPrice;
        const canAfford = this.scene.playerState.money >= total;
        
        // Get selected drug key for inventory check
        const selectedDrug = this.drugTypes[this.selectedDrugIndex];
        const [, drug] = selectedDrug || [null, {}];
        const drugKey = drug.rawMaterial ? drug.rawMaterial.replace(' ', '') : drug.category;
        
        // Check inventory - use product inventory for processed drugs
        const inventoryKey = 'rawMaterials'; // Default to raw materials
        const afterPurchase = this.scene.playerState[inventoryKey] + this.quantity;
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
        const total = this.quantity * this.getCurrentDrugPrice();
        
        // Get selected drug info
        const selectedDrug = this.drugTypes[this.selectedDrugIndex];
        if (!selectedDrug) {
            this.showMessage('No item selected!', CONFIG.COLORS.danger);
            return;
        }
        const [drugKey, drug] = selectedDrug;
        
        // Check if this is a precursor purchase from traveling salesman
        const isPrecursorA = drugKey.toLowerCase() === 'precursor a';
        const isPrecursorB = drugKey.toLowerCase() === 'precursor b';
        const isPrecursor = isPrecursorA || isPrecursorB;
        
        // Check if player can afford
        if (this.scene.playerState.money < total) {
            this.showMessage('Not enough cash!', CONFIG.COLORS.danger);
            return;
        }
        
        if (isPrecursor) {
            // Precursors go to drugs inventory, not raw materials
            const precursorKey = isPrecursorA ? 'precursorA' : 'precursorB';
            const currentPrecursors = this.scene.playerState.drugs[precursorKey] || 0;
            const afterPurchase = currentPrecursors + this.quantity;
            const maxPrecursors = 20; // Max precursor storage
            
            if (afterPurchase > maxPrecursors) {
                const canBuy = maxPrecursors - currentPrecursors;
                if (canBuy <= 0) {
                    this.showMessage('Precursor inventory full!', CONFIG.COLORS.danger);
                } else {
                    this.showMessage(`Can only carry ${canBuy} more`, CONFIG.COLORS.danger);
                }
                return;
            }
            
            // Process precursor purchase
            this.scene.playerState.money -= total;
            this.scene.playerState.drugs[precursorKey] = (this.scene.playerState.drugs[precursorKey] || 0) + this.quantity;
        } else {
            // Standard raw materials purchase
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
            
            // Process standard purchase
            this.scene.playerState.money -= total;
            this.scene.playerState.rawMaterials += this.quantity;
        }
        
        // Update HUD
        if (this.scene.hud) {
            this.scene.hud.update();
        }
        this.moneyText.setText(`Your Money: $${this.scene.playerState.money}`);
        this.updateDisplay();
        
        // Track precursor purchases from traveling salesman to unlock content
        if (isPrecursor && this.customInventory) {
            this.scene.playerState.purchasedFromSalesman = true;
        }
        
        // Show purchase message
        if (isPrecursor) {
            this.showMessage(`Purchased ${this.quantity} ${drugKey}`);
        } else {
            this.showMessage(`Purchased ${this.quantity} Raw Materials`);
        }
    }
    
    /**
     * Buy maximum affordable quantity
     */
    buyMax() {
        const currentPrice = this.getCurrentDrugPrice();
        const playerMoney = this.scene.playerState.money;
        
        // Get selected drug info
        const selectedDrug = this.drugTypes[this.selectedDrugIndex];
        if (!selectedDrug) {
            this.showMessage('No item selected!', CONFIG.COLORS.danger);
            return;
        }
        const [drugKey, drug] = selectedDrug;
        
        // Check if this is a precursor
        const isPrecursorA = drugKey.toLowerCase() === 'precursor a';
        const isPrecursorB = drugKey.toLowerCase() === 'precursor b';
        const isPrecursor = isPrecursorA || isPrecursorB;
        
        if (isPrecursor) {
            // Calculate max for precursors
            const precursorKey = isPrecursorA ? 'precursorA' : 'precursorB';
            const currentPrecursors = this.scene.playerState.drugs[precursorKey] || 0;
            const maxPrecursors = 20;
            const maxByInventory = maxPrecursors - currentPrecursors;
            const maxByMoney = Math.floor(playerMoney / currentPrice);
            const maxAffordable = Math.min(maxByInventory, maxByMoney);
            
            if (maxAffordable <= 0) {
                if (maxByInventory <= 0) {
                    this.showMessage('Precursor inventory full!', CONFIG.COLORS.danger);
                } else {
                    this.showMessage('Not enough cash!', CONFIG.COLORS.danger);
                }
                return;
            }
            
            // Purchase max
            this.quantity = maxAffordable;
            this.buy();
        } else {
            // Calculate max for raw materials
            const maxByInventory = this.scene.playerState.rawCapacity - this.scene.playerState.rawMaterials;
            const maxByMoney = Math.floor(playerMoney / currentPrice);
            const maxAffordable = Math.min(maxByInventory, maxByMoney);
            
            if (maxAffordable <= 0) {
                if (maxByInventory <= 0) {
                    this.showMessage('Inventory full!', CONFIG.COLORS.danger);
                } else {
                    this.showMessage('Not enough cash!', CONFIG.COLORS.danger);
                }
                return;
            }
            
            // Purchase max
            this.quantity = maxAffordable;
            this.buy();
        }
    }
    
    /**
     * Buy pistol ammo
     */
    buyAmmo() {
        const player = this.scene.playerState;
        const ammoCost = CONFIG.EQUIPMENT.pistol?.ammoCost || 25; // Default to 25 if not defined
        
        // Check if player has a pistol
        if (!player.equipment.pistol) {
            this.showMessage('You need a pistol first!', CONFIG.COLORS.danger);
            return;
        }
        
        const currentAmmo = player.pistolAmmo || 0;
        const maxAmmo = player.maxPistolAmmo || 30;
        const spaceAvailable = maxAmmo - currentAmmo;
        
        if (spaceAvailable <= 0) {
            this.showMessage('Ammo full!', CONFIG.COLORS.danger);
            return;
        }
        
        // Calculate how many we can buy
        const maxByMoney = Math.floor(player.money / ammoCost);
        const maxAffordable = Math.min(spaceAvailable, maxByMoney, this.quantity);
        
        if (maxAffordable <= 0) {
            if (spaceAvailable <= 0) {
                this.showMessage('Ammo full!', CONFIG.COLORS.danger);
            } else {
                this.showMessage('Not enough cash!', CONFIG.COLORS.danger);
            }
            return;
        }
        
        const totalCost = maxAffordable * ammoCost;
        
        // Purchase ammo
        player.money -= totalCost;
        player.pistolAmmo = currentAmmo + maxAffordable;
        
        // Update HUD
        if (this.scene.hud) {
            this.scene.hud.update();
        }
        this.moneyText.setText(`Your Money: $${player.money}`);
        this.updateDisplay();
        
        this.showMessage(`Purchased ${maxAffordable} ammo for $${totalCost}`);
    }
    
    // ======== SELL MODE METHODS ========
    
    /**
     * Create the sell UI elements
     */
    createSellUI() {
        const { width, height } = this.scene.scale;
        
        // Get drugs the player has (processed products)
        const drugs = this.scene.playerState.drugs || {};
        
        // Filter to only show drugs with quantity > 0
        this.sellableDrugs = Object.entries(drugs).filter(([key, qty]) => qty > 0);
        
        // If no drugs to sell
        if (this.sellableDrugs.length === 0) {
            const noDrugsText = this.scene.add.text(width / 2, height / 2 - 80, 
                'No processed drugs to sell!\nProcess raw materials first.', {
                fontFamily: 'Press Start 2P',
                fontSize: '12px',
                color: CONFIG.COLORS.textDark,
                align: 'center'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(903);
            this.sellContainer.add(noDrugsText);
            return;
        }
        
        // Sell title
        const sellTitle = this.scene.add.text(width / 2, height / 2 - 140, 'SELL DRUGS', {
            fontFamily: 'Press Start 2P',
            fontSize: '20px',
            color: CONFIG.COLORS.secondary,
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0).setDepth(903);
        this.sellContainer.add(sellTitle);
        
        // Selected drug for selling
        this.selectedSellIndex = 0;
        
        // Create drug list for selling
        this.sellDrugItems = [];
        const startY = height / 2 - 80;
        const spacing = 60;
        
        const isDrought = this.scene.calendarSystem ? this.scene.calendarSystem.isDroughtActive() : false;
        
        this.sellableDrugs.forEach(([drugKey, qty], index) => {
            const y = startY + (index * spacing);
            
            // Get sell price from config
            const drugConfig = CONFIG.DRUG_TYPES[drugKey];
            const basePrice = drugConfig?.sellPrice || 50;
            const sellPrice = basePrice * (isDrought ? 2 : 1); // Drought doubles price
            
            // Background
            const bg = this.scene.add.rectangle(width / 2, y, 500, 45, 
                index === this.selectedSellIndex ? 0x333333 : 0x222222);
            bg.setScrollFactor(0);
            bg.setDepth(903);
            bg.setStrokeStyle(2, index === this.selectedSellIndex ? CONFIG.COLORS.secondary : 0x444444);
            bg.setInteractive({ useHandCursor: true });
            bg.on('pointerdown', () => {
                this.selectSellDrug(index);
            });
            this.sellContainer.add(bg);
            
            // Drug name
            const nameText = this.scene.add.text(width / 2 - 200, y, 
                `${drugKey.toUpperCase()} (x${qty})`, {
                fontFamily: 'Press Start 2P',
                fontSize: '12px',
                color: index === this.selectedSellIndex ? CONFIG.COLORS.secondary : CONFIG.COLORS.text
            }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(904);
            this.sellContainer.add(nameText);
            
            // Price each
            const priceText = this.scene.add.text(width / 2 + 50, y, 
                `$${sellPrice} ea`, {
                fontFamily: 'Press Start 2P',
                fontSize: '12px',
                color: CONFIG.COLORS.success
            }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(904);
            this.sellContainer.add(priceText);
            
            // Total value
            const totalValue = sellPrice * qty;
            const totalText = this.scene.add.text(width / 2 + 180, y, 
                `Total: $${totalValue}`, {
                fontFamily: 'Press Start 2P',
                fontSize: '12px',
                color: CONFIG.COLORS.primary
            }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(904);
            this.sellContainer.add(totalText);
            
            this.sellDrugItems.push({ bg, nameText, priceText, totalText, drugKey, qty, sellPrice });
        });
        
        // SELL ALL button
        this.sellAllButton = this.createButton(width / 2, height / 2 + 100, 180, 50, 'SELL ALL', () => {
            this.sellAll();
        }, CONFIG.COLORS.success);
        this.sellContainer.add(this.sellAllButton);
    }
    
    /**
     * Toggle between buy and sell mode
     */
    toggleSellMode() {
        this.sellMode = !this.sellMode;
        
        // Update button text
        const buttonLabel = this.sellTabButton.list[1];
        if (this.sellMode) {
            buttonLabel.setText('BUY 🡠');
            // Show sell container, hide buy elements
            this.drugListContainer.setVisible(false);
            this.buyButton.setVisible(false);
            this.minusBtn.setVisible(false);
            this.plusBtn.setVisible(false);
            this.qtyText.setVisible(false);
            this.totalText.setVisible(false);
            
            // Check if we need to rebuild the drug list
            const drugs = this.scene.playerState.drugs || {};
            const hasDrugs = Object.values(drugs).some(qty => qty > 0);
            if (hasDrugs) {
                // Rebuild sell UI with fresh data
                this.sellContainer.removeAll(true);
                this.createSellUI();
            }
            
            this.sellContainer.setVisible(true);
            this.sellTabButton.list[0].setStrokeStyle(2, CONFIG.COLORS.success);
        } else {
            buttonLabel.setText('SELL 🡢');
            // Hide sell container, show buy elements
            this.drugListContainer.setVisible(true);
            this.buyButton.setVisible(true);
            this.minusBtn.setVisible(true);
            this.plusBtn.setVisible(true);
            this.qtyText.setVisible(true);
            this.totalText.setVisible(true);
            this.sellContainer.setVisible(false);
            this.sellTabButton.list[0].setStrokeStyle(2, 0xffcc00);
        }
    }
    
    /**
     * Select a drug to sell
     */
    selectSellDrug(index) {
        this.selectedSellIndex = index;
        
        // Update visual selection
        if (this.sellDrugItems) {
            this.sellDrugItems.forEach((item, i) => {
                const isSelected = i === index;
                item.bg.setFillStyle(isSelected ? 0x333333 : 0x222222);
                item.bg.setStrokeStyle(2, isSelected ? CONFIG.COLORS.secondary : 0x444444);
                item.nameText.setColor(isSelected ? CONFIG.COLORS.secondary : CONFIG.COLORS.text);
            });
        }
    }
    
    /**
     * Sell all of the selected drug
     */
    sellAll() {
        if (!this.sellDrugItems || this.sellDrugItems.length === 0) {
            this.showMessage('Nothing to sell!', CONFIG.COLORS.danger);
            return;
        }
        
        const selectedItem = this.sellDrugItems[this.selectedSellIndex];
        if (!selectedItem) {
            this.showMessage('Select a drug to sell!', CONFIG.COLORS.danger);
            return;
        }
        
        const { drugKey, qty, sellPrice } = selectedItem;
        
        if (qty <= 0) {
            this.showMessage('No stock to sell!', CONFIG.COLORS.danger);
            return;
        }
        
        const totalEarned = qty * sellPrice;
        
        // Add money
        this.scene.playerState.money += totalEarned;
        
        // Remove all of that drug from inventory
        this.scene.playerState.drugs[drugKey] = 0;
        
        // Update HUD
        if (this.scene.hud) {
            this.scene.hud.update();
        }
        
        // Check for rank change
        if (this.scene.checkRankChange) {
            this.scene.checkRankChange();
        }
        
        this.moneyText.setText(`Your Money: $${this.scene.playerState.money}`);
        
        this.showMessage(`Sold ${qty} ${drugKey} for $${totalEarned}!`, CONFIG.COLORS.success);
        
        // Rebuild sell UI
        this.sellContainer.removeAll(true);
        this.createSellUI();
        
        // Also update the buy mode drug list if visible
        this.updateDisplay();
    }
    
    // ======== END SELL MODE METHODS ========
    
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
        this.customInventory = null; // Reset custom inventory
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
