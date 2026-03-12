/**
 * NPCController.js - Handles all NPC spawning and management
 * Buyers, rivals, police, suppliers, vendors
 */

import { EventBus, EVENTS } from './EventBus.js';

export default class NPCController {
    constructor(scene, playerState) {
        this.scene = scene;
        this.playerState = playerState;
        
        // NPC tracking
        this.buyers = [];
        this.supplierNPCs = [];
        this.rival = null;
        this.rivalDefeated = false;
        this.police = null;
        this.policeState = 'none';
        this.policePatrolPath = [];
        this.policePatrolIndex = 0;
        this.shopOwner = null;
        this.corruptCop = null;
        this.travelingSalesman = null;
    }

    // ============================================================
    // INITIALIZATION
    // ============================================================

    /**
     * Initialize all NPCs
     */
    initializeNPCs() {
        // Place vendor
        this.placeVendor();
        
        // Place workstation
        this.placeWorkstation();
        
        // Place relationship NPCs
        this.placeRelationshipNPCs();
        
        // Spawn daily buyers
        this.spawnDailyBuyers();
        
        // Spawn rival
        this.spawnRival();
        
        // Place supplier NPCs
        if (this.scene.supplierSystem) {
            this.placeSupplierNPCs();
        }
        
        // Spawn traveling salesman (rare random spawn)
        this.spawnTravelingSalesman();
    }

    /**
     * Place vendor NPC
     */
    placeVendor() {
        const { CONFIG, biomeType } = this.scene;
        
        const vendorX = biomeType === 'block' ? 
            Math.floor(CONFIG.GRID_WIDTH * 0.75) : 
            Math.floor(CONFIG.GRID_WIDTH * 0.25);
        const vendorY = Math.floor(CONFIG.GRID_HEIGHT * 0.25);
        
        const vendorObj = {
            type: 'vendor',
            x: vendorX,
            y: vendorY,
            walkable: true
        };
        
        const sprite = this.scene.add.image(
            vendorX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            vendorY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            'npc-vendor'
        );
        sprite.setScale(CONFIG.SCALE.NPC_VENDOR);
        sprite.setDepth(50);
        
        const indicator = this.scene.add.text(
            vendorX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            vendorY * CONFIG.TILE_SIZE - 10,
            '[E] SUPPLIER',
            {
                fontFamily: 'Press Start 2P',
                fontSize: '10px',
                color: CONFIG.COLORS.success,
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5).setDepth(51).setAlpha(0);
        
        vendorObj.sprite = sprite;
        vendorObj.indicator = indicator;
        this.scene.worldObjects.push(vendorObj);
    }

    /**
     * Place workstation
     */
    placeWorkstation() {
        const { CONFIG } = this.scene;
        
        const workstationX = this.scene.safehousePos.x - 1;
        const workstationY = this.scene.safehousePos.y;
        
        const workstationObj = {
            type: 'workstation',
            x: workstationX,
            y: workstationY,
            walkable: true
        };
        
        const sprite = this.scene.add.image(
            workstationX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            workstationY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            'workstation'
        );
        sprite.setScale(0.12);
        sprite.setDepth(50);
        
        const indicator = this.scene.add.text(
            workstationX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            workstationY * CONFIG.TILE_SIZE - 10,
            '[E] PROCESS',
            {
                fontFamily: 'Press Start 2P',
                fontSize: '10px',
                color: CONFIG.COLORS.secondary,
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5).setDepth(51).setAlpha(0);
        
        workstationObj.sprite = sprite;
        workstationObj.indicator = indicator;
        this.scene.worldObjects.push(workstationObj);
    }

    /**
     * Place relationship NPCs (shop owner, corrupt cop)
     */
    placeRelationshipNPCs() {
        const { CONFIG } = this.scene;
        
        // Shop Owner
        const shopX = Math.floor(CONFIG.GRID_WIDTH * 0.3);
        const shopY = Math.floor(CONFIG.GRID_HEIGHT * 0.7);
        
        const shopOwnerObj = {
            type: 'shopOwner',
            npcId: 'shopOwner',
            x: shopX,
            y: shopY,
            walkable: true
        };
        
        const shopSprite = this.scene.add.image(
            shopX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            shopY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            'npc-shop-owner'
        );
        shopSprite.setScale(CONFIG.SCALE.NPC_SHOP_OWNER);
        shopSprite.setDepth(50);
        
        const shopIndicator = this.scene.add.text(
            shopX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            shopY * CONFIG.TILE_SIZE - 15,
            '[E] SHOP OWNER',
            {
                fontFamily: 'Press Start 2P',
                fontSize: '9px',
                color: CONFIG.COLORS.success,
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5).setDepth(51).setAlpha(0);
        
        shopOwnerObj.sprite = shopSprite;
        shopOwnerObj.indicator = shopIndicator;
        this.scene.worldObjects.push(shopOwnerObj);
        this.shopOwner = shopOwnerObj;
        
        // Corrupt Cop
        const copX = Math.floor(CONFIG.GRID_WIDTH * 0.7);
        const copY = Math.floor(CONFIG.GRID_HEIGHT * 0.3);
        
        const corruptCopObj = {
            type: 'corruptCop',
            npcId: 'corruptCop',
            x: copX,
            y: copY,
            walkable: true
        };
        
        const copSprite = this.scene.add.image(
            copX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            copY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            'npc-corrupt-cop'
        );
        copSprite.setScale(CONFIG.SCALE.NPC_CORRUPT_COP);
        copSprite.setDepth(50);
        
        const copIndicator = this.scene.add.text(
            copX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            copY * CONFIG.TILE_SIZE - 15,
            '[E] OFFICER',
            {
                fontFamily: 'Press Start 2P',
                fontSize: '9px',
                color: '#6699ff',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5).setDepth(51).setAlpha(0);
        
        corruptCopObj.sprite = copSprite;
        corruptCopObj.indicator = copIndicator;
        this.scene.worldObjects.push(corruptCopObj);
        this.corruptCop = corruptCopObj;
    }

    // ============================================================
    // BUYERS
    // ============================================================

    /**
     * Get active economy events from calendar system
     */
    getActiveEconomyEvents() {
        const events = {
            policeRaid: false,
            drought: false,
            shortage: null // Will be set if shortage system exists
        };
        
        if (this.scene.calendarSystem) {
            events.policeRaid = this.scene.calendarSystem.isCrackdownActive();
            events.drought = this.scene.calendarSystem.isDroughtActive();
        }
        
        return events;
    }

    /**
     * Handle buyers fleeing during police raid
     */
    handleBuyersFlee() {
        if (this.buyers.length === 0) return;
        
        // 40% of buyers flee during a raid
        const fleeCount = Math.floor(this.buyers.length * 0.4);
        
        for (let i = 0; i < fleeCount; i++) {
            const randomIndex = Math.floor(Math.random() * this.buyers.length);
            const fleeingBuyer = this.buyers[randomIndex];
            
            if (fleeingBuyer) {
                // Show flee message
                this.scene.showFloatingText(
                    'Buyer fled due to police!',
                    this.scene.CONFIG.COLORS.warning
                );
                this.removeBuyer(fleeingBuyer);
            }
        }
    }

    /**
     * Get buyer spawn rate based on economy events
     */
    getBuyerSpawnRateMultiplier(economyEvents) {
        let multiplier = 1.0;
        
        // POLICE_RAID: Buyers become scarce
        if (economyEvents.policeRaid) {
            multiplier *= 0.3; // 70% fewer buyers
        }
        
        // DROUGHT: Slightly fewer buyers (nervous)
        if (economyEvents.drought) {
            multiplier *= 0.85;
        }
        
        return multiplier;
    }

    /**
     * Get price multiplier for a buyer based on economy events
     */
    getBuyerPriceMultiplier(economyEvents, baseMultiplier = 1.0) {
        let multiplier = baseMultiplier;
        
        // DROUGHT: All buyers pay more
        if (economyEvents.drought) {
            multiplier *= (this.scene.CONFIG.DROUGHT_SELL_MULTIPLIER || 2.0);
        }
        
        // SHORTAGE: Buyer pays more for that drug type
        // (This would be set by the shortage system when implemented)
        if (economyEvents.shortage) {
            multiplier *= 1.5; // 50% premium for scarce drugs
        }
        
        return multiplier;
    }

    /**
     * Check if buyers are paranoid (for DROUGHT event)
     */
    areBuyersParanoid(economyEvents) {
        return economyEvents.drought;
    }

    /**
     * Spawn buyers for the day
     */
    spawnDailyBuyers() {
        const { CONFIG } = this.scene;
        
        // Get active economy events
        const economyEvents = this.getActiveEconomyEvents();
        
        // Handle police raid - make some buyers flee first
        if (economyEvents.policeRaid) {
            this.handleBuyersFlee();
            this.scene.showFloatingText(
                'POLICE RAID! Buyers are hiding!',
                CONFIG.COLORS.danger
            );
        }
        
        // Remove old remaining buyers
        this.buyers.forEach(buyer => {
            if (buyer.sprite) buyer.sprite.destroy();
            if (buyer.indicator) buyer.indicator.destroy();
            const index = this.scene.worldObjects.indexOf(buyer);
            if (index > -1) this.scene.worldObjects.splice(index, 1);
        });
        this.buyers = [];
        
        // Get time-based info
        const currentHour = this.scene.timeSystem ? this.scene.timeSystem.getHour() : 12;
        const isNight = currentHour >= CONFIG.NIGHT_START_HOUR || currentHour < CONFIG.DAY_START_HOUR;
        
        // Get economy event multipliers
        const spawnRateMultiplier = this.getBuyerSpawnRateMultiplier(economyEvents);
        const buyersParanoid = this.areBuyersParanoid(economyEvents);
        
        // Spawn new buyers
        for (let i = 0; i < CONFIG.BUYERS_PER_DAY; i++) {
            // Apply spawn rate multiplier (POLICE_RAID reduces spawns)
            if (spawnRateMultiplier < 1.0 && Math.random() > spawnRateMultiplier) {
                continue; // Skip spawning this buyer
            }
            
            const customerType = this.selectCustomerType(isNight);
            
            if (!customerType) continue;
            
            const customerConfig = CONFIG.CUSTOMER_TYPES[customerType];
            
            // Apply economy event price multiplier
            let adjustedPriceMultiplier = this.getBuyerPriceMultiplier(
                economyEvents, 
                customerConfig.priceMultiplier
            );
            
            let attempts = 0;
            let buyerX, buyerY;
            
            do {
                buyerX = Math.floor(Math.random() * (CONFIG.GRID_WIDTH - 4)) + 2;
                buyerY = Math.floor(Math.random() * (CONFIG.GRID_HEIGHT - 4)) + 2;
                attempts++;
            } while ((!this.scene.worldMap[buyerY] || 
                     !this.scene.worldMap[buyerY][buyerX] ||
                     !this.scene.worldMap[buyerY][buyerX].walkable || 
                     this.scene.worldObjects.some(obj => obj.x === buyerX && obj.y === buyerY)) &&
                     attempts < 100);
            
            if (attempts >= 100) continue;
            
            const dialog = customerConfig.dialog[Math.floor(Math.random() * customerConfig.dialog.length)];
            
            const buyerObj = {
                type: 'buyer',
                customerType: customerType,
                x: buyerX,
                y: buyerY,
                walkable: true,
                dialog: dialog,
                priceMultiplier: adjustedPriceMultiplier,
                purchaseAmount: customerConfig.purchaseAmount,
                specialBehavior: customerConfig.specialBehavior,
                tipAmount: customerConfig.tipAmount || 0,
                qualityBonus: customerConfig.qualityBonus || 0,
                hiddenIdentity: customerConfig.hiddenIdentity || false,
                bribeCost: customerConfig.bribeCost || 0,
                isParanoid: buyersParanoid // DROUGHT makes buyers paranoid
            };
            
            const spriteKey = 'npc-buyer';
            
            const sprite = this.scene.add.image(
                buyerX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                buyerY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                spriteKey
            );
            sprite.setScale(0.15);
            sprite.setDepth(50);
            
            let indicatorText = customerConfig.hiddenIdentity ? '[E] CUSTOMER' : `[E] ${customerConfig.name.toUpperCase()}`;
            
            const indicator = this.scene.add.text(
                buyerX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                buyerY * CONFIG.TILE_SIZE - 10,
                indicatorText,
                {
                    fontFamily: 'Press Start 2P',
                    fontSize: '8px',
                    color: customerConfig.hiddenIdentity ? CONFIG.COLORS.text : CONFIG.COLORS.primary,
                    stroke: '#000000',
                    strokeThickness: 3
                }
            ).setOrigin(0.5).setDepth(51).setAlpha(0);
            
            buyerObj.sprite = sprite;
            buyerObj.indicator = indicator;
            buyerObj.spriteKey = spriteKey;
            this.scene.worldObjects.push(buyerObj);
            this.buyers.push(buyerObj);
        }
        
        if (this.scene.minimap) {
            this.scene.minimap.update();
        }
        
        EventBus.emit(EVENTS.TIME_ADVANCED, { dayChanged: true });
    }

    /**
     * Select customer type based on spawn rates
     */
    selectCustomerType(isNight) {
        const { CONFIG } = this.scene;
        const customerTypes = Object.keys(CONFIG.CUSTOMER_TYPES);
        
        const pool = [];
        
        customerTypes.forEach(type => {
            const config = CONFIG.CUSTOMER_TYPES[type];
            
            if (config.timePreference === 'night' && !isNight) return;
            if (config.timePreference === 'day' && isNight) return;
            
            let weight = CONFIG.CUSTOMER_SPAWN_WEIGHTS[config.spawnRate] || 10;
            
            for (let i = 0; i < weight; i++) {
                pool.push(type);
            }
        });
        
        if (pool.length === 0) return null;
        
        return pool[Math.floor(Math.random() * pool.length)];
    }

    /**
     * Remove a buyer
     */
    removeBuyer(buyer) {
        if (buyer.sprite) buyer.sprite.destroy();
        if (buyer.indicator) buyer.indicator.destroy();
        
        const objIndex = this.scene.worldObjects.indexOf(buyer);
        if (objIndex > -1) this.scene.worldObjects.splice(objIndex, 1);
        
        const buyerIndex = this.buyers.indexOf(buyer);
        if (buyerIndex > -1) this.buyers.splice(buyerIndex, 1);
    }

    // ============================================================
    // TRAVELING SALESMAN
    // ============================================================

    /**
     * Spawn traveling salesman (rare random spawn in neighborhoods)
     */
    spawnTravelingSalesman() {
        const { CONFIG } = this.scene;
        
        // Remove existing traveling salesman if any
        if (this.travelingSalesman) {
            if (this.travelingSalesman.sprite) this.travelingSalesman.sprite.destroy();
            if (this.travelingSalesman.indicator) this.travelingSalesman.indicator.destroy();
            const index = this.scene.worldObjects.indexOf(this.travelingSalesman);
            if (index > -1) this.scene.worldObjects.splice(index, 1);
            this.travelingSalesman = null;
        }
        
        // Traveling salesman only spawns occasionally (rare)
        if (Math.random() > 0.25) return; // 25% chance to spawn
        
        const customerConfig = CONFIG.CUSTOMER_TYPES.travelingSalesman;
        
        // Find a random spot in a neighborhood
        let attempts = 0;
        let salesmanX, salesmanY;
        
        do {
            salesmanX = Math.floor(Math.random() * (CONFIG.GRID_WIDTH - 4)) + 2;
            salesmanY = Math.floor(Math.random() * (CONFIG.GRID_HEIGHT - 4)) + 2;
            attempts++;
        } while ((!this.scene.worldMap[salesmanY] || 
                 !this.scene.worldMap[salesmanY][salesmanX] ||
                 !this.scene.worldMap[salesmanY][salesmanX].walkable || 
                 this.scene.worldObjects.some(obj => obj.x === salesmanX && obj.y === salesmanY)) &&
                 attempts < 100);
        
        if (attempts >= 100) return;
        
        const dialog = customerConfig.dialog[Math.floor(Math.random() * customerConfig.dialog.length)];
        
        const salesmanObj = {
            type: 'travelingSalesman',
            customerType: 'travelingSalesman',
            x: salesmanX,
            y: salesmanY,
            walkable: true,
            dialog: dialog,
            vendorInventory: customerConfig.vendorInventory,
            triggersCombat: customerConfig.triggersCombat,
            combatChance: customerConfig.combatChance
        };
        
        const spriteKey = 'npc-traveling-salesman';
        
        const sprite = this.scene.add.image(
            salesmanX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            salesmanY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            spriteKey
        );
        
        // Fallback to vendor sprite if custom doesn't exist
        if (!this.scene.textures.exists(spriteKey)) {
            sprite.setTexture('npc-vendor');
        }
        
        sprite.setScale(CONFIG.SCALE.NPC_TRAVELING_SALESMAN);
        sprite.setDepth(50);
        
        const indicator = this.scene.add.text(
            salesmanX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            salesmanY * CONFIG.TILE_SIZE - 15,
            '[E] TRAVELER',
            {
                fontFamily: 'Press Start 2P',
                fontSize: '9px',
                color: '#ff9900',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5).setDepth(51).setAlpha(0);
        
        salesmanObj.sprite = sprite;
        salesmanObj.indicator = indicator;
        salesmanObj.spriteKey = spriteKey;
        this.scene.worldObjects.push(salesmanObj);
        this.travelingSalesman = salesmanObj;
        
                
        if (this.scene.minimap) {
            this.scene.minimap.update();
        }
    }

    // ============================================================
    // SUPPLIERS
    // ============================================================

    /**
     * Place supplier NPCs
     */
    placeSupplierNPCs() {
        const { CONFIG } = this.scene;
        const availableSuppliers = this.scene.supplierSystem.getAvailableSuppliers();
        
        if (!availableSuppliers || availableSuppliers.length === 0) {
                        return;
        }
        
        const areaPositions = {
            'downtown': { x: Math.floor(CONFIG.GRID_WIDTH * 0.8), y: Math.floor(CONFIG.GRID_HEIGHT * 0.2) },
            'hood': { x: Math.floor(CONFIG.GRID_WIDTH * 0.2), y: Math.floor(CONFIG.GRID_HEIGHT * 0.8) },
            'industrial': { x: Math.floor(CONFIG.GRID_WIDTH * 0.7), y: Math.floor(CONFIG.GRID_HEIGHT * 0.7) },
            'skid-row': { x: Math.floor(CONFIG.GRID_WIDTH * 0.15), y: Math.floor(CONFIG.GRID_HEIGHT * 0.5) },
            'underground': { x: Math.floor(CONFIG.GRID_WIDTH * 0.5), y: Math.floor(CONFIG.GRID_HEIGHT * 0.9) },
            'chinatown': { x: Math.floor(CONFIG.GRID_WIDTH * 0.9), y: Math.floor(CONFIG.GRID_HEIGHT * 0.5) },
            'southside': { x: Math.floor(CONFIG.GRID_WIDTH * 0.3), y: Math.floor(CONFIG.GRID_HEIGHT * 0.15) }
        };
        
        availableSuppliers.forEach((supplier, index) => {
            const areaPos = areaPositions[supplier.meetingArea] || areaPositions['downtown'];
            
            let supplierX = areaPos.x + ((index % 3) * 2 - 2);
            let supplierY = areaPos.y + (Math.floor(index / 3) * 2 - 1);
            
            supplierX = Math.max(2, Math.min(CONFIG.GRID_WIDTH - 3, supplierX));
            supplierY = Math.max(2, Math.min(CONFIG.GRID_HEIGHT - 3, supplierY));
            
            let attempts = 0;
            while (attempts < 20 && (
                !this.scene.worldMap[supplierY] || 
                !this.scene.worldMap[supplierY][supplierX] || 
                !this.scene.worldMap[supplierY][supplierX].walkable ||
                this.scene.worldObjects.some(obj => obj.x === supplierX && obj.y === supplierY)
            )) {
                supplierX = areaPos.x + Math.floor(Math.random() * 3) - 1;
                supplierY = areaPos.y + Math.floor(Math.random() * 3) - 1;
                supplierX = Math.max(2, Math.min(CONFIG.GRID_WIDTH - 3, supplierX));
                supplierY = Math.max(2, Math.min(CONFIG.GRID_HEIGHT - 3, supplierY));
                attempts++;
            }
            
            if (attempts >= 20) return;
            
            const spriteKey = `supplier-${supplier.id}`;
            const hasCustomSprite = this.scene.textures.exists(spriteKey);
            
            const supplierObj = {
                type: 'supplier',
                supplierId: supplier.id,
                x: supplierX,
                y: supplierY,
                walkable: true,
                gangName: supplier.name,
                dangerLevel: supplier.dangerLevel
            };
            
            const sprite = this.scene.add.image(
                supplierX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                supplierY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                hasCustomSprite ? spriteKey : 'npc-vendor'
            );
            sprite.setScale(0.15);
            sprite.setDepth(50);
            
            if (supplier.color) {
                sprite.setTint(Phaser.Display.Color.HexStringToColor(supplier.color).color);
            }
            
            const indicator = this.scene.add.text(
                supplierX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                supplierY * CONFIG.TILE_SIZE - 15,
                `[E] ${supplier.name.toUpperCase()}`,
                {
                    fontFamily: 'Press Start 2P',
                    fontSize: '8px',
                    color: supplier.accentColor || CONFIG.COLORS.success,
                    stroke: '#000000',
                    strokeThickness: 3
                }
            ).setOrigin(0.5).setDepth(51).setAlpha(0);
            
            supplierObj.sprite = sprite;
            supplierObj.indicator = indicator;
            this.scene.worldObjects.push(supplierObj);
            this.supplierNPCs.push(supplierObj);
        });
        
        if (this.scene.minimap) {
            this.scene.minimap.update();
        }
    }

    /**
     * Clear all supplier NPCs
     */
    clearSuppliers() {
        this.supplierNPCs.forEach(supplier => {
            if (supplier.sprite) supplier.sprite.destroy();
            if (supplier.indicator) supplier.indicator.destroy();
            const index = this.scene.worldObjects.indexOf(supplier);
            if (index > -1) this.scene.worldObjects.splice(index, 1);
        });
        this.supplierNPCs = [];
    }

    // ============================================================
    // RIVAL
    // ============================================================

    /**
     * Spawn rival NPC
     */
    spawnRival() {
        const { CONFIG } = this.scene;
        
        if (this.rival) {
            if (this.rival.sprite) this.rival.sprite.destroy();
            if (this.rival.indicator) this.rival.indicator.destroy();
            const index = this.scene.worldObjects.indexOf(this.rival);
            if (index > -1) this.scene.worldObjects.splice(index, 1);
        }
        
        this.rival = null;
        this.rivalDefeated = false;
        
        let attempts = 0;
        let rivalX, rivalY;
        
        // Safe position if safehousePos is null
        const safehouseX = this.scene.safehousePos ? this.scene.safehousePos.x : Math.floor(CONFIG.GRID_WIDTH / 2);
        const safehouseY = this.scene.safehousePos ? this.scene.safehousePos.y : Math.floor(CONFIG.GRID_HEIGHT / 2);
        
        do {
            rivalX = Math.floor(Math.random() * (CONFIG.GRID_WIDTH - 4)) + 2;
            rivalY = Math.floor(Math.random() * (CONFIG.GRID_HEIGHT - 4)) + 2;
            
            const distFromPlayer = Phaser.Math.Distance.Between(
                this.playerState.gridX, this.playerState.gridY,
                rivalX, rivalY
            );
            
            const distFromSafehouse = Phaser.Math.Distance.Between(
                safehouseX, safehouseY,
                rivalX, rivalY
            );
            
            attempts++;
            
            if (this.scene.worldMap[rivalY][rivalX].walkable &&
                !this.scene.worldObjects.some(obj => obj.x === rivalX && obj.y === rivalY) &&
                distFromPlayer > 8 &&
                distFromSafehouse > 5) {
                break;
            }
        } while (attempts < 100);
        
        if (attempts >= 100) return;
        
        const rivalObj = {
            type: 'rival',
            x: rivalX,
            y: rivalY,
            walkable: true
        };
        
        const sprite = this.scene.add.image(
            rivalX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            rivalY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            'npc-rival'
        );
        sprite.setScale(0.13);
        sprite.setDepth(50);
        
        const indicator = this.scene.add.text(
            rivalX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            rivalY * CONFIG.TILE_SIZE - 15,
            '!!! RIVAL !!!',
            {
                fontFamily: 'Press Start 2P',
                fontSize: '10px',
                color: CONFIG.COLORS.danger,
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5).setDepth(51);
        
        this.scene.tweens.add({
            targets: indicator,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1
        });
        
        rivalObj.sprite = sprite;
        rivalObj.indicator = indicator;
        this.scene.worldObjects.push(rivalObj);
        this.rival = rivalObj;
    }

    /**
     * Check rival proximity
     */
    checkRivalProximity() {
        if (!this.rival || this.rivalDefeated) return;
        
        const dist = Phaser.Math.Distance.Between(
            this.playerState.gridX, this.playerState.gridY,
            this.rival.x, this.rival.y
        );
        
        if (dist <= this.scene.CONFIG.RIVAL_PROXIMITY_TRIGGER) {
            this.triggerRivalEncounter();
        }
    }

    /**
     * Trigger rival encounter
     */
    triggerRivalEncounter() {
        const { CONFIG, CombatScene, ENEMY_TYPES } = this.scene;
        
        this.playerState.isMoving = true;
        
        const enemyType = this.rival.type || 'gangster';
        const enemyData = {
            type: enemyType,
            name: this.rival.name || 'Rival',
            hp: ENEMY_TYPES[enemyType].hp,
            damage: ENEMY_TYPES[enemyType].damage
        };
        
        this.scene.combatScene.startCombat(enemyData, 
            (playerWon) => {
                this.playerState.isMoving = false;
                
                if (playerWon) {
                    const cashReward = CONFIG.RIVAL_CASH_DROP_MIN + 
                        Math.floor(Math.random() * (CONFIG.RIVAL_CASH_DROP_MAX - CONFIG.RIVAL_CASH_DROP_MIN));
                    this.playerState.money += cashReward;
                    this.scene.showFloatingText(`Victory! Found $${cashReward}`, CONFIG.COLORS.success);
                    
                    if (this.rival.sprite) this.rival.sprite.destroy();
                    if (this.rival.indicator) this.rival.indicator.destroy();
                    const index = this.scene.worldObjects.indexOf(this.rival);
                    if (index > -1) this.scene.worldObjects.splice(index, 1);
                    
                    this.rivalDefeated = true;
                    this.scene.hud.update();
                    
                    EventBus.emit(EVENTS.ENEMY_DEFEATED, { enemy: 'rival' });
                }
            },
            (playerWon) => {
                this.playerState.isMoving = false;
                
                if (!playerWon) {
                    const hustleLoss = Math.floor(this.playerState.hustle * CONFIG.RIVAL_HUSTLE_PENALTY);
                    this.playerState.hustle = Math.max(0, this.playerState.hustle - hustleLoss);
                    this.scene.showFloatingText(`Defeated! -${hustleLoss} Hustle`, CONFIG.COLORS.danger);
                    
                    if (this.playerState.hustle <= 0) {
                        this.scene.passOut();
                    }
                    this.scene.hud.update();
                }
            }
        );
    }

    // ============================================================
    // POLICE
    // ============================================================

    /**
     * Update police system
     */
    updatePoliceSystem() {
        const { CONFIG } = this.scene;
        
        // Get neighborhood bonus
        const neighborhoodBonus = this.playerState.neighborhoodBonus;
        const policeSpawnReduction = neighborhoodBonus?.policeSpawnReduction || 0;
        const adjustedHeatThreshold = Math.floor(CONFIG.HEAT_THRESHOLD_POLICE * (1 + policeSpawnReduction));
        
        // Spawn police if needed
        if (!this.police && this.playerState.heat >= adjustedHeatThreshold) {
            this.spawnPolice();
        }
        
        // Despawn if heat drops
        if (this.police && this.playerState.heat < adjustedHeatThreshold) {
            this.despawnPolice();
            return;
        }
        
        // Update behavior
        if (this.police) {
            if (this.policeState === 'patrol') {
                this.updatePolicePatrol();
                this.checkPoliceLineOfSight();
            } else if (this.policeState === 'chase') {
                this.updatePoliceChase();
            }
        }
    }

    /**
     * Spawn police
     */
    spawnPolice() {
        const { CONFIG } = this.scene;
        
        let attempts = 0;
        let policeX, policeY;
        
        // Safe position if safehousePos is null
        const safehouseX = this.scene.safehousePos ? this.scene.safehousePos.x : Math.floor(CONFIG.GRID_WIDTH / 2);
        const safehouseY = this.scene.safehousePos ? this.scene.safehousePos.y : Math.floor(CONFIG.GRID_HEIGHT / 2);
        
        do {
            policeX = Math.floor(Math.random() * (CONFIG.GRID_WIDTH - 4)) + 2;
            policeY = Math.floor(Math.random() * (CONFIG.GRID_HEIGHT - 4)) + 2;
            
            const distFromPlayer = Phaser.Math.Distance.Between(
                this.playerState.gridX, this.playerState.gridY,
                policeX, policeY
            );
            
            const distFromSafehouse = Phaser.Math.Distance.Between(
                safehouseX, safehouseY,
                policeX, policeY
            );
            
            attempts++;
            
            if (this.scene.worldMap[policeY][policeX].walkable &&
                !this.scene.worldObjects.some(obj => obj.x === policeX && obj.y === policeY) &&
                distFromPlayer > 10 &&
                distFromSafehouse > 5) {
                break;
            }
        } while (attempts < 100);
        
        if (attempts >= 100) return;
        
        const policeObj = {
            type: 'police',
            x: policeX,
            y: policeY,
            walkable: true,
            gridX: policeX,
            gridY: policeY
        };
        
        const sprite = this.scene.add.image(
            policeX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            policeY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            'npc-police'
        );
        sprite.setScale(0.13);
        sprite.setDepth(50);
        
        const indicator = this.scene.add.text(
            policeX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            policeY * CONFIG.TILE_SIZE - 15,
            '!!! POLICE !!!',
            {
                fontFamily: 'Press Start 2P',
                fontSize: '10px',
                color: '#0066ff',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5).setDepth(51);
        
        this.scene.tweens.add({
            targets: indicator,
            alpha: 0.3,
            duration: 600,
            yoyo: true,
            repeat: -1
        });
        
        policeObj.sprite = sprite;
        policeObj.indicator = indicator;
        this.scene.worldObjects.push(policeObj);
        this.police = policeObj;
        this.policeState = 'patrol';
        
        this.generatePolicePatrolPath();
        
        this.scene.showFloatingText('POLICE NEARBY! Stay alert!', '#0066ff');
    }

    /**
     * Despawn police
     */
    despawnPolice() {
        if (!this.police) return;
        
        if (this.police.sprite) this.police.sprite.destroy();
        if (this.police.indicator) this.police.indicator.destroy();
        const index = this.scene.worldObjects.indexOf(this.police);
        if (index > -1) this.scene.worldObjects.splice(index, 1);
        
        this.police = null;
        this.policeState = 'none';
        this.policePatrolPath = [];
    }

    /**
     * Generate patrol path
     */
    generatePolicePatrolPath() {
        const { CONFIG } = this.scene;
        
        this.policePatrolPath = [];
        const numWaypoints = 4;
        
        for (let i = 0; i < numWaypoints; i++) {
            let x, y;
            let attempts = 0;
            
            do {
                x = Math.floor(Math.random() * (CONFIG.GRID_WIDTH - 4)) + 2;
                y = Math.floor(Math.random() * (CONFIG.GRID_HEIGHT - 4)) + 2;
                attempts++;
            } while (!this.scene.worldMap[y][x].walkable && attempts < 50);
            
            if (attempts < 50) {
                this.policePatrolPath.push({ x, y });
            }
        }
        
        this.policePatrolIndex = 0;
    }

    /**
     * Update police patrol
     */
    updatePolicePatrol() {
        const { CONFIG } = this.scene;
        
        if (!this.police || this.policePatrolPath.length === 0) return;
        
        const target = this.policePatrolPath[this.policePatrolIndex];
        
        if (this.police.gridX === target.x && this.police.gridY === target.y) {
            this.policePatrolIndex = (this.policePatrolIndex + 1) % this.policePatrolPath.length;
            return;
        }
        
        const dx = target.x - this.police.gridX;
        const dy = target.y - this.police.gridY;
        
        let moveX = 0, moveY = 0;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            moveX = dx > 0 ? 1 : -1;
        } else if (Math.abs(dy) > 0) {
            moveY = dy > 0 ? 1 : -1;
        }
        
        const newX = this.police.gridX + moveX;
        const newY = this.police.gridY + moveY;
        
        if (newX >= 0 && newX < CONFIG.GRID_WIDTH &&
            newY >= 0 && newY < CONFIG.GRID_HEIGHT &&
            this.scene.worldMap[newY][newX].walkable) {
            
            this.police.gridX = newX;
            this.police.gridY = newY;
            
            const targetPosX = newX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
            const targetPosY = newY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
            
            this.scene.tweens.add({
                targets: this.police.sprite,
                x: targetPosX,
                y: targetPosY,
                duration: CONFIG.POLICE_PATROL_SPEED,
                ease: 'Linear'
            });
            
            this.scene.tweens.add({
                targets: this.police.indicator,
                x: targetPosX,
                y: targetPosY - 15,
                duration: CONFIG.POLICE_PATROL_SPEED,
                ease: 'Linear'
            });
        }
    }

    /**
     * Check police line of sight
     */
    checkPoliceLineOfSight() {
        if (!this.police) return;
        
        const { CONFIG } = this.scene;
        
        const dist = Phaser.Math.Distance.Between(
            this.playerState.gridX, this.playerState.gridY,
            this.police.gridX, this.police.gridY
        );
        
        if (dist <= CONFIG.POLICE_VISION_RANGE) {
            if (this.hasLineOfSight(this.police.gridX, this.police.gridY, 
                                    this.playerState.gridX, this.playerState.gridY)) {
                this.startPoliceChase();
            }
        }
    }

    /**
     * Line of sight check
     */
    hasLineOfSight(startX, startY, endX, endY) {
        const { CONFIG } = this.scene;
        
        const dx = Math.abs(endX - startX);
        const dy = Math.abs(endY - startY);
        const steps = Math.max(dx, dy) * 2;
        
        if (steps === 0) return true;
        
        const xStep = (endX - startX) / steps;
        const yStep = (endY - startY) / steps;
        
        let x = startX;
        let y = startY;
        
        for (let i = 0; i < steps; i++) {
            if (i > 0 && i < steps) {
                const tileX = Math.floor(x);
                const tileY = Math.floor(y);
                
                if (tileX >= 0 && tileX < CONFIG.GRID_WIDTH && 
                    tileY >= 0 && tileY < CONFIG.GRID_HEIGHT) {
                    if (!this.scene.worldMap[tileY][tileX].walkable) {
                        return false;
                    }
                }
            }
            
            x += xStep;
            y += yStep;
        }
        
        return true;
    }

    /**
     * Start police chase
     */
    startPoliceChase() {
        if (this.policeState === 'chase') return;
        
        this.policeState = 'chase';
        
        if (this.police.indicator) {
            this.police.indicator.setText('!!! CHASING !!!');
            this.police.indicator.setColor('#ff0000');
        }
        
        this.scene.showFloatingText('POLICE CHASE!', this.scene.CONFIG.COLORS.danger);
    }

    /**
     * Update police chase
     */
    updatePoliceChase() {
        const { CONFIG } = this.scene;
        
        if (!this.police) return;
        
        // Check for Shop Owner help
        if (this.shopOwner && this.playerState.npcRelationships.shopOwner >= CONFIG.LOYALTY_THRESHOLD) {
            const distToShop = Phaser.Math.Distance.Between(
                this.playerState.gridX, this.playerState.gridY,
                this.shopOwner.x, this.shopOwner.y
            );
            
            if (distToShop <= 2) {
                this.playerState.heat = 0;
                this.despawnPolice();
                this.scene.showFloatingText('Shop Owner helps you escape!\nHeat cleared!', CONFIG.COLORS.success);
                this.scene.hud.update();
                return;
            }
        }
        
        // Check if caught
        const dist = Phaser.Math.Distance.Between(
            this.playerState.gridX, this.playerState.gridY,
            this.police.gridX, this.police.gridY
        );
        
        if (dist <= CONFIG.POLICE_CATCH_RANGE) {
            this.arrestPlayer();
            return;
        }
        
        // Chase
        const dx = this.playerState.gridX - this.police.gridX;
        const dy = this.playerState.gridY - this.police.gridY;
        
        let moveX = 0, moveY = 0;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            moveX = dx > 0 ? 1 : -1;
        } else if (Math.abs(dy) > 0) {
            moveY = dy > 0 ? 1 : -1;
        }
        
        const newX = this.police.gridX + moveX;
        const newY = this.police.gridY + moveY;
        
        if (newX >= 0 && newX < CONFIG.GRID_WIDTH &&
            newY >= 0 && newY < CONFIG.GRID_HEIGHT &&
            this.scene.worldMap[newY][newX].walkable) {
            
            this.police.gridX = newX;
            this.police.gridY = newY;
            
            const targetPosX = newX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
            const targetPosY = newY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
            
            this.scene.tweens.add({
                targets: this.police.sprite,
                x: targetPosX,
                y: targetPosY,
                duration: CONFIG.POLICE_CHASE_SPEED,
                ease: 'Linear'
            });
            
            this.scene.tweens.add({
                targets: this.police.indicator,
                x: targetPosX,
                y: targetPosY - 15,
                duration: CONFIG.POLICE_CHASE_SPEED,
                ease: 'Linear'
            });
        }
    }

    /**
     * Handle player arrest
     */
    arrestPlayer() {
        const { CONFIG } = this.scene;
        
        // Check for Corrupt Cop protection
        if (this.playerState.npcRelationships.corruptCop >= CONFIG.LOYALTY_THRESHOLD &&
            !this.playerState.corruptCopUsedToday) {
            this.playerState.corruptCopUsedToday = true;
            this.despawnPolice();
            this.scene.showFloatingText('Corrupt Cop called it off!\nGet out of here!', '#6699ff');
            return;
        }
        
        this.playerState.isMoving = true;
        
        this.scene.policeEncounterUI.open((playerEscaped) => {
            this.playerState.isMoving = false;
            
            if (playerEscaped) {
                this.despawnPolice();
                
                this.scene.time.delayedCall(10000, () => {
                    if (this.playerState.heat >= CONFIG.HEAT_THRESHOLD_POLICE) {
                        this.spawnPolice();
                    }
                });
            } else {
                this.despawnPolice();
            }
        });
    }

    // ============================================================
    // NEW DAY HANDLING
    // ============================================================

    /**
     * Handle new day - respawn buyers, rivals, etc.
     */
    onNewDay() {
        // Spawn new buyers
        this.spawnDailyBuyers();
        
        // Spawn new rival if defeated
        if (this.rivalDefeated) {
            this.spawnRival();
        }
        
        // Potentially spawn new traveling salesman
        this.spawnTravelingSalesman();
    }

    /**
     * Handle new supplier cycle
     */
    onNewSupplierCycle() {
        this.clearSuppliers();
        
        if (this.scene.supplierSystem) {
            this.scene.supplierSystem.generateSupplierCycle();
            this.placeSupplierNPCs();
        }
    }
}
