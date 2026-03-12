/**
 * SceneManager.js - Orchestrates all game controllers
 * Central hub for accessing controllers and managing game flow
 */

import { EventBus, EVENTS } from './EventBus.js';

// Import controllers
import PlayerController from './PlayerController.js';
import MapController from './MapController.js';
import NPCController from './NPCController.js';

export default class SceneManager {
    constructor(scene, playerState) {
        this.scene = scene;
        this.playerState = playerState;
        
        // Initialize controllers
        this.playerController = new PlayerController(scene, playerState);
        this.mapController = new MapController(scene, playerState);
        this.npcController = new NPCController(scene, playerState);
        
        // Setup event bus listeners
        this.setupEventListeners();
        
            }

    /**
     * Setup event bus communication between controllers
     */
    setupEventListeners() {
        // Player events -> NPC/Map responses
        EventBus.on(EVENTS.PLAYER_NEIGHBORHOOD_CHANGED, (data) => {
            // When neighborhood changes, update NPCs
            this.npcController.clearSuppliers();
            this.npcController.spawnDailyBuyers();
        });

        EventBus.on(EVENTS.TIME_ADVANCED, (data) => {
            // Check for new day
            if (data.dayChanged) {
                this.npcController.onNewDay();
            }
        });

        EventBus.on(EVENTS.ENEMY_DEFEATED, (data) => {
            // Handle enemy defeat
            if (data.enemy === 'rival') {
                this.playerState.rivalDefeated = true;
            }
        });

        EventBus.on(EVENTS.COMBAT_ENDED, (data) => {
            // Cleanup after combat
            this.playerState.isMoving = false;
        });
    }

    // ============================================================
    // DELEGATION - Forward to appropriate controller
    // ============================================================

    // Player movement
    tryMove(dx, dy) {
        return this.playerController.tryMove(dx, dy);
    }

    handleTapToMove(pointer) {
        return this.playerController.handleTapToMove(pointer);
    }

    handleJoystickMovement(delta) {
        return this.playerController.handleJoystickMovement(delta);
    }

    onPlayerMove() {
        return this.playerController.onPlayerMove();
    }

    // Map management
    createWorld(mapData, objects) {
        return this.mapController.createWorld(mapData, objects);
    }

    generateMapForNeighborhood(neighborhoodKey) {
        return this.mapController.generateMapForNeighborhood(neighborhoodKey);
    }

    checkNeighborhoodBorder() {
        return this.mapController.checkNeighborhoodBorder();
    }

    enterBuilding(poiObj) {
        return this.mapController.enterBuilding(poiObj);
    }

    exitBuilding() {
        return this.mapController.exitBuilding();
    }

    checkInteriorExit() {
        return this.mapController.checkInteriorExit();
    }

    checkInteractionProximity() {
        return this.mapController.checkInteractionProximity();
    }

    getNearbyInteractive() {
        return this.mapController.getNearbyInteractive();
    }

    // NPC management
    initializeNPCs() {
        return this.npcController.initializeNPCs();
    }

    spawnDailyBuyers() {
        return this.npcController.spawnDailyBuyers();
    }

    checkRivalProximity() {
        return this.npcController.checkRivalProximity();
    }

    updatePoliceSystem() {
        return this.npcController.updatePoliceSystem();
    }

    onNewDay() {
        this.npcController.onNewDay();
        
        // Handle supplier cycle
        const { CONFIG } = this.scene;
        const config = CONFIG.SUPPLIER_CONFIG;
        if (this.scene.timeSystem && this.scene.timeSystem.day % config.SUPPLIER_CYCLE_DAYS === 0) {
            this.npcController.onNewSupplierCycle();
        }
    }

    // Status effects
    applyStatus(statusKey, duration) {
        return this.playerController.applyStatus(statusKey, duration);
    }

    // Equipment
    purchaseEquipment(equipmentId) {
        return this.playerController.purchaseEquipment(equipmentId);
    }

    unequipEquipment(equipmentId) {
        return this.playerController.unequipEquipment(equipmentId);
    }

    sellEquipment(equipmentId) {
        return this.playerController.sellEquipment(equipmentId);
    }

    // Stats
    addMoney(amount) {
        return this.playerController.addMoney(amount);
    }

    spendMoney(amount) {
        return this.playerController.spendMoney(amount);
    }

    addHeat(amount) {
        return this.playerController.addHeat(amount);
    }

    reduceHeat(amount) {
        return this.playerController.reduceHeat(amount);
    }

    changeHustle(amount) {
        return this.playerController.changeHustle(amount);
    }

    // Combat helpers
    takeDamage(amount) {
        return this.playerController.takeDamage(amount);
    }

    heal(amount) {
        return this.playerController.heal(amount);
    }

    getEquipmentAttackBonus() {
        return this.playerController.getEquipmentAttackBonus();
    }

    hasRangeAttack() {
        return this.playerController.hasRangeAttack();
    }

    getDamageReduction() {
        return this.playerController.getDamageReduction();
    }

    getHeatReduction() {
        return this.playerController.getHeatReduction();
    }

    getPriceBonus() {
        return this.playerController.getPriceBonus();
    }

    // Skills
    useSkill(skillKey) {
        return this.playerController.useSkill(skillKey);
    }

    unlockSkill(skillKey) {
        return this.playerController.unlockSkill(skillKey);
    }

    // ============================================================
    // INTERACTION HANDLING
    // ============================================================

    /**
     * Handle interaction based on object type
     */
    handleInteraction(obj) {
        if (!obj) return;

        switch (obj.type) {
            case 'safehouse':
                this.scene.safehouseUI.open();
                break;
                
            case 'vendor':
                this.scene.vendorUI.open();
                break;
                
            case 'workstation':
                this.scene.workstationUI.open();
                break;
                
            case 'buyer':
                this.handleBuyerInteraction(obj);
                break;
                
            case 'shopOwner':
            case 'corruptCop':
                this.scene.relationshipUI.open(obj);
                break;
                
            case 'supplier':
                this.openSupplierMeeting(obj.supplierId);
                break;
                
            case 'poi':
                if (obj.interactive) {
                    this.enterBuilding(obj);
                }
                break;
                
            default:
                        }
    }

    /**
     * Handle buyer interaction
     */
    handleBuyerInteraction(buyer) {
        if (this.playerState.product <= 0) {
            this.scene.showFloatingText('No Product to sell!', this.scene.CONFIG.COLORS.danger);
            return;
        }

        const customerConfig = this.scene.CONFIG.CUSTOMER_TYPES[buyer.customerType];

        // Show dialog
        if (buyer.dialog) {
            this.showCustomerDialog(buyer);
        }

        // Check for undercover cop
        if (buyer.customerType === 'cop') {
            this.handleCopEncounter(buyer);
            return;
        }

        // Check for steal behavior
        if (buyer.specialBehavior === 'steal') {
            const stealChance = customerConfig?.stealChance || 0.15;
            if (Math.random() < stealChance) {
                const stolenAmount = Math.min(2, this.playerState.product);
                this.playerState.product -= stolenAmount;
                this.npcController.removeBuyer(buyer);
                this.scene.hud.update();
                if (this.scene.minimap) this.scene.minimap.update();
                this.scene.showFloatingText(`${customerConfig.name} stole ${stolenAmount} product and ran!`, this.scene.CONFIG.COLORS.danger);
                this.addHeat(10);
                return;
            }
        }

        // Calculate price
        const heatPenalty = this.playerState.heat * this.scene.CONFIG.HEAT_PENALTY_PER_POINT;
        const droughtMultiplier = this.scene.calendarSystem.getProductSellMultiplier();
        let customerPriceMult = buyer.priceMultiplier || 1.0;

        if (buyer.specialBehavior === 'quality') {
            customerPriceMult += (buyer.qualityBonus || 0.2);
        }

        // Check for preferred drug bonus (20% if player sells what buyer wants)
        if (buyer.preferredDrug) {
            const drugs = this.playerState.drugs || {};
            let soldDrug = null;
            
            // Find first non-zero drug in inventory to determine what's being sold
            for (const [drugName, amount] of Object.entries(drugs)) {
                if (amount > 0) {
                    soldDrug = drugName;
                    break;
                }
            }
            
            // Fallback: check legacy product (assume it's Weed if player has any)
            if (!soldDrug && this.playerState.product > 0) {
                soldDrug = 'Weed'; // Default assumption
            }
            
            if (soldDrug === buyer.preferredDrug) {
                customerPriceMult *= 1.2; // 20% bonus
            }
        }

        const playerPriceBonus = this.getPriceBonus();

        const finalPrice = Math.floor(
            this.scene.CONFIG.PRODUCT_SELL_PRICE * 
            (1 - heatPenalty) * 
            droughtMultiplier * 
            customerPriceMult * 
            (1 + playerPriceBonus)
        );

        const amountToSell = Math.min(buyer.purchaseAmount || 1, this.playerState.product);
        const totalEarned = finalPrice * amountToSell;

        // Apply sale
        this.addMoney(totalEarned);
        this.playerState.product -= amountToSell;

        // Track achievement: First Sale
        EventBus.emit('achievement:trackSale');

        // XP from sale
        if (this.scene.levelSystem) {
            this.scene.levelSystem.grantSaleXP(amountToSell);
        }

        // Handle tip
        if (buyer.specialBehavior === 'tip') {
            const tipChance = customerConfig?.tipChance || 0.25;
            const tipAmount = buyer.tipAmount || 50;
            if (Math.random() < tipChance) {
                this.addMoney(tipAmount);
                this.scene.showFloatingText(`+$${totalEarned} (incl. $${tipAmount} tip!)`, this.scene.CONFIG.COLORS.success);
            } else {
                this.scene.showFloatingText(`Sold! +$${totalEarned}`, this.scene.CONFIG.COLORS.success);
            }
        } else {
            this.scene.showFloatingText(`Sold! +$${totalEarned}`, this.scene.CONFIG.COLORS.success);
        }

        // Add heat
        const neighborhoodBonus = this.playerState.neighborhoodBonus;
        const heatResistance = neighborhoodBonus?.heatResistance || 0;
        const heatGainMultiplier = this.scene.calendarSystem.getHeatMultiplier();
        const baseHeatGain = this.scene.CONFIG.HEAT_GAIN_PER_SALE * heatGainMultiplier;
        const heatGain = Math.floor(baseHeatGain * (1 - heatResistance));
        this.addHeat(heatGain);

        // Remove buyer
        this.npcController.removeBuyer(buyer);

        this.scene.hud.update();
        if (this.scene.minimap) this.scene.minimap.update();

        if (this.playerState.heat > this.scene.CONFIG.HEAT_THRESHOLD_POLICE / 2) {
            this.scene.showFloatingText(`Heat: ${this.playerState.heat}%`, '#ff9900');
        }
    }

    /**
     * Handle undercover cop encounter
     */
    handleCopEncounter(buyer) {
        const bribeCost = buyer.bribeCost || 500;
        const bustChance = Math.min(0.8, this.playerState.heat / 100);

        if (this.playerState.money >= bribeCost && Math.random() > bustChance * 0.5) {
            this.spendMoney(bribeCost);
            this.reduceHeat(30);
            this.npcController.removeBuyer(buyer);
            this.scene.hud.update();
            if (this.scene.minimap) this.scene.minimap.update();
            this.scene.showFloatingText(`Undercover cop took your bribe! -$${bribeCost}, Heat -30`, '#6699ff');
        } else if (Math.random() < bustChance) {
            this.npcController.removeBuyer(buyer);
            this.scene.hud.update();
            if (this.scene.minimap) this.scene.minimap.update();

            this.playerState.isMoving = true;
            this.scene.policeEncounterUI.open((playerEscaped) => {
                this.playerState.isMoving = false;
                if (!playerEscaped) {
                    const productLost = Math.floor(this.playerState.product * 0.5);
                    const cashLost = Math.floor(this.playerState.money * 0.3);
                    this.playerState.product -= productLost;
                    this.spendMoney(cashLost);
                    this.addHeat(30);
                    this.scene.showFloatingText(`BUSTED! Lost ${productLost} product, $${cashLost}`, this.scene.CONFIG.COLORS.danger);
                    this.scene.hud.update();
                }
            });
        } else {
            const heatPenalty = this.playerState.heat * this.scene.CONFIG.HEAT_PENALTY_PER_POINT;
            const droughtMultiplier = this.scene.calendarSystem.getProductSellMultiplier();
            const finalPrice = Math.floor(
                this.scene.CONFIG.PRODUCT_SELL_PRICE * (1 - heatPenalty) * droughtMultiplier
            );

            const amountToSell = Math.min(buyer.purchaseAmount || 2, this.playerState.product);
            const totalEarned = finalPrice * amountToSell;

            this.addMoney(totalEarned);
            this.playerState.product -= amountToSell;

            this.npcController.removeBuyer(buyer);
            this.scene.hud.update();
            if (this.scene.minimap) this.scene.minimap.update();
            this.scene.showFloatingText(`Sold to undercover! +$${totalEarned}`, this.scene.CONFIG.COLORS.success);

            this.addHeat(8);
            this.scene.hud.update();
        }
    }

    /**
     * Show customer dialog
     */
    showCustomerDialog(buyer) {
        if (!buyer.dialog) return;
        
        const { width, height } = this.scene.scale;

        const dialogText = this.scene.add.text(width / 2, height / 2 - 80, `"${buyer.dialog}"`, {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: this.scene.CONFIG.COLORS.text,
            fontStyle: 'italic',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1000);

        this.scene.tweens.add({
            targets: dialogText,
            alpha: 0,
            duration: 2000,
            delay: 1500,
            ease: 'Cubic.easeOut',
            onComplete: () => dialogText.destroy()
        });
    }

    /**
     * Open supplier meeting
     */
    openSupplierMeeting(supplierId) {
        const supplier = this.scene.supplierSystem.getSupplier(supplierId);
        if (!supplier) {
            this.scene.showFloatingText('Supplier not found!', this.scene.CONFIG.COLORS.danger);
            return;
        }

        this.scene.supplierSystem.startMeeting(supplierId);

        // Track achievement: met supplier
        EventBus.emit('achievement:metSupplier', { supplierId });

        if (this.scene.questSystem && typeof this.scene.questSystem.onSupplierInteraction === 'function') {
            this.scene.questSystem.onSupplierInteraction();
        }

        this.scene.supplierUI.open(supplier);
    }

    // ============================================================
    // UPDATE LOOP
    // ============================================================

    /**
     * Update called every frame
     */
    update(time, delta) {
        // Update police system
        this.updatePoliceSystem();
        
        // Check rival proximity
        this.checkRivalProximity();
        
        // Check interaction proximity
        this.checkInteractionProximity();
    }
}

// Export singleton factory
export function createSceneManager(scene, playerState) {
    return new SceneManager(scene, playerState);
}
