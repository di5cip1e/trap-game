/**
 * PlayerManager.js - Handles player state, movement, stats, equipment, and status effects
 * Extracted from GameScene.js to reduce complexity
 */

import { EventBus, EVENTS } from './EventBus.js';
import { CONFIG } from './config.js';

export default class PlayerManager {
    constructor(scene, playerState) {
        this.scene = scene;
        this.playerState = playerState;
    }

    // ============================================================
    // MOVEMENT
    // ============================================================

    /**
     * Attempt to move player in direction
     * This delegates to PlayerController if available
     */
    tryMove(dx, dy) {
        // Check if we have a PlayerController to delegate to
        if (this.scene.playerController) {
            this.scene.playerController.tryMove(dx, dy);
            return;
        }

        // Fallback: inline implementation with proper validation
        this._tryMoveInline(dx, dy);
    }

    /**
     * Inline movement implementation with bounds checking
     * @private
     */
    _tryMoveInline(dx, dy) {
        const { CONFIG } = this.scene;

        // Check for status effects that prevent movement
        const statuses = this.playerState.activeStatuses;

        if (statuses.paralyzed) {
            this.scene.showFloatingText('Paralyzed! Cannot move!', '#ffcc00');
            return;
        }

        if (statuses.frozen) {
            this.scene.showFloatingText('Frozen! Cannot move!', '#00ccff');
            return;
        }

        if (statuses.stunned) {
            this.scene.showFloatingText('Stunned! Cannot act!', '#ff6600');
            return;
        }

        if (statuses.asleep) {
            this.scene.showFloatingText('Asleep! Wake up first!', '#6666ff');
            return;
        }

        // Confused: Random movement
        if (statuses.confused) {
            if (Math.random() < 0.4) {
                const directions = [
                    { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
                    { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
                ];
                const randomDir = directions[Math.floor(Math.random() * directions.length)];
                dx = randomDir.dx;
                dy = randomDir.dy;
                this.scene.showFloatingText('🌀 Confused! Moving randomly!', '#ff66ff');
            } else {
                this.scene.showFloatingText('🌀 Confused...', '#ff66ff');
            }
        }

        // Slowed: 50% chance to fail movement
        if (statuses.slowed) {
            if (Math.random() < 0.5) {
                this.scene.showFloatingText('Slowed! Too slow to move!', '#9966ff');
                return;
            }
        }

        const newX = this.playerState.gridX + dx;
        const newY = this.playerState.gridY + dy;

        // BOUNDS CHECKING - Input validation
        if (newX < 0 || newX >= CONFIG.GRID_WIDTH ||
            newY < 0 || newY >= CONFIG.GRID_HEIGHT) {
            return;
        }

        // Check if tile is walkable with null safety
        const tile = this.scene.worldMap?.[newY]?.[newX];
        if (!tile || !tile.walkable) {
            return;
        }

        // Execute movement
        this._executeMove(newX, newY, dx, dy);
    }

    /**
     * Execute the actual move animation and state update
     * @private
     */
    _executeMove(newX, newY, dx, dy) {
        const { CONFIG } = this.scene;

        this.playerState.isMoving = true;
        this.playerState.gridX = newX;
        this.playerState.gridY = newY;

        const targetX = newX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        const targetY = newY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;

        this.scene.tweens.add({
            targets: this.scene.player,
            x: targetX,
            y: targetY,
            duration: 150,
            ease: 'Linear',
            onComplete: () => {
                this.playerState.isMoving = false;
                this.scene.events.emit('playerMoved');
            }
        });
    }

    /**
     * Called after player moves - update status effects, time, etc.
     */
    onPlayerMove() {
        // Update status effects
        this.scene.updateStatusEffects();

        // Drain hustle
        this.playerState.hustle -= CONFIG.HUSTLE_DRAIN_PER_MOVE;

        // Check for hustle depletion
        if (this.playerState.hustle <= 0) {
            this.scene.passOut();
            return;
        }

        // Check if player is at neighborhood border
        this.scene.checkNeighborhoodBorder();

        // Advance time
        if (this.scene.timeSystem) {
            this.scene.timeSystem.advanceTime(CONFIG.MINUTES_PER_MOVE);
        }

        // Update UI
        if (this.scene.hud) this.scene.hud.update();
        if (this.scene.minimap) this.scene.minimap.update();
    }

    // ============================================================
    // EQUIPMENT
    // ============================================================
    // EQUIPMENT SYSTEM (Slot-based)
    // ============================================================

    /**
     * Check if player owns equipment
     */
    ownsEquipment(equipmentId) {
        return this.playerState.equipment?.owned?.[equipmentId] === true;
    }

    /**
     * Check if equipment is currently equipped
     */
    isEquipped(equipmentId) {
        const equipment = CONFIG.EQUIPMENT[equipmentId];
        if (!equipment) return false;
        return this.playerState.equipment?.[equipment.slot] === equipmentId;
    }

    /**
     * Check if player has skill to use equipment
     */
    hasSkillToUseEquipment(equipment) {
        if (!equipment.requiresSkill) return true;
        return this.playerState.unlockedSkills?.includes(equipment.requiresSkill);
    }

    /**
     * Check if weapon slot 2 is unlocked
     */
    isWeaponSlot2Unlocked() {
        return this.playerState.unlockedSkills?.includes('dual_wield');
    }

    /**
     * Check if automatic weapons are unlocked (can use weapon1 slot for automatics)
     */
    isAutomaticWeaponsUnlocked() {
        return this.playerState.unlockedSkills?.includes('automatic_weapons');
    }

    /**
     * Can equip this item (checks skill requirements and slot availability)
     */
    canEquip(equipmentId) {
        const equipment = CONFIG.EQUIPMENT[equipmentId];
        if (!equipment) return { valid: false, reason: 'Not found' };

        // Check if player owns it
        if (!this.ownsEquipment(equipmentId)) {
            return { valid: false, reason: 'Not owned' };
        }

        // Check skill requirement
        if (!this.hasSkillToUseEquipment(equipment)) {
            return { valid: false, reason: `Requires ${equipment.requiresSkill} skill` };
        }

        // Check weapon slot 2 is unlocked for secondary weapons
        if (equipment.slot === 'weapon2' && !this.isWeaponSlot2Unlocked()) {
            return { valid: false, reason: 'Requires Dual Wield skill' };
        }

        // Check automatic weapons skill for automatic-only weapons in weapon1
        if (equipment.automaticOnly && !this.isAutomaticWeaponsUnlocked()) {
            return { valid: false, reason: 'Requires Automatic Weapons skill' };
        }

        return { valid: true };
    }

    /**
     * Purchase equipment (adds to owned, doesn't auto-equip)
     */
    purchaseEquipment(equipmentId) {
        const equipment = CONFIG.EQUIPMENT[equipmentId];
        if (!equipment) {
            console.warn(`Equipment ${equipmentId} not found`);
            return false;
        }

        if (this.playerState.money < equipment.cost) {
            this.scene.showFloatingText('Not enough money!', CONFIG.COLORS.danger);
            return false;
        }

        // Check if already owned
        if (this.ownsEquipment(equipmentId)) {
            this.scene.showFloatingText('Already owned!', CONFIG.COLORS.warning);
            return false;
        }

        // Initialize owned object if needed
        if (!this.playerState.equipment.owned) {
            this.playerState.equipment.owned = {};
        }

        // Deduct money and mark as owned
        this.playerState.money -= equipment.cost;
        this.playerState.equipment.owned[equipmentId] = true;

        // Track achievement
        if (typeof trackEquipmentPurchase === 'function') {
            trackEquipmentPurchase(equipmentId);
        }

        this.scene.showFloatingText(`Bought ${equipment.name}!`, CONFIG.COLORS.success);
        this.scene.hud?.update();
        return true;
    }

    /**
     * Equip an item to its slot
     */
    equipItem(equipmentId) {
        const equipment = CONFIG.EQUIPMENT[equipmentId];
        if (!equipment) {
            console.warn(`Equipment ${equipmentId} not found`);
            return false;
        }

        // Check if player owns it
        if (!this.ownsEquipment(equipmentId)) {
            this.scene.showFloatingText('Not owned!', CONFIG.COLORS.danger);
            return false;
        }

        // Check skill requirement
        if (!this.hasSkillToUseEquipment(equipment)) {
            this.scene.showFloatingText(`Requires ${equipment.requiresSkill} skill!`, CONFIG.COLORS.danger);
            return false;
        }

        // Check weapon slot 2 unlock
        if (equipment.slot === 'weapon2' && !this.isWeaponSlot2Unlocked()) {
            this.scene.showFloatingText('Weapon Slot 2 locked! Requires Dual Wield skill.', CONFIG.COLORS.warning);
            return false;
        }

        // Check automatic weapons
        if (equipment.automaticOnly && !this.isAutomaticWeaponsUnlocked()) {
            this.scene.showFloatingText('Automatic weapons require Automatic Weapons skill!', CONFIG.COLORS.warning);
            return false;
        }

        const slot = equipment.slot;
        const currentlyEquipped = this.playerState.equipment[slot];

        // Equip to slot (overwrite what's there)
        this.playerState.equipment[slot] = equipmentId;

        this.scene.showFloatingText(`Equipped ${equipment.name}!`, CONFIG.COLORS.success);
        this.scene.hud?.update();
        return true;
    }

    /**
     * Unequip an item from its slot
     */
    unequipEquipment(equipmentId) {
        const equipment = CONFIG.EQUIPMENT[equipmentId];
        if (!equipment) return false;

        const slot = equipment.slot;
        if (this.playerState.equipment[slot] !== equipmentId) {
            return false;
        }

        // Unequip from slot
        this.playerState.equipment[slot] = null;
        
        this.scene.showFloatingText(`Unequipped ${equipment.name}!`, CONFIG.COLORS.text);
        this.scene.hud?.update();
        return true;
    }

    /**
     * Sell equipment (remove from owned, unequip if equipped)
     */
    sellEquipment(equipmentId) {
        const equipment = CONFIG.EQUIPMENT[equipmentId];
        if (!equipment) return false;

        // Check if owned
        if (!this.ownsEquipment(equipmentId)) {
            return false;
        }

        // Unequip if equipped
        if (this.isEquipped(equipmentId)) {
            this.unequipEquipment(equipmentId);
        }

        // Remove from owned
        delete this.playerState.equipment.owned[equipmentId];
        
        // Refund partial value
        const sellValue = Math.floor(equipment.cost * 0.5);
        this.playerState.money += sellValue;
        
        this.scene.showFloatingText(`Sold ${equipment.name} for $${sellValue}!`, CONFIG.COLORS.success);
        this.scene.hud?.update();
        return sellValue;
    }

    /**
     * Get all equipped items
     */
    getEquippedItems() {
        const equipped = [];
        const slots = ['hat', 'shirt', 'jacket', 'pants', 'shoes', 'accessory1', 'accessory2', 'weapon1', 'weapon2', 'storage'];
        
        for (const slot of slots) {
            const equipmentId = this.playerState.equipment?.[slot];
            if (equipmentId) {
                const eq = CONFIG.EQUIPMENT[equipmentId];
                if (eq) {
                    equipped.push({ slot, ...eq });
                }
            }
        }
        return equipped;
    }

    /**
     * Get total stat bonuses from equipped items
     */
    getEquipmentStats() {
        const stats = {
            rawCapacityBonus: 0,
            productCapacityBonus: 0,
            attackBonus: 0,
            damageReduction: 0,
            heatReduction: 0,
            speedBonus: 0,
            visionRangeBonus: 0,
            safehouseEntrySpeed: 0,
            buyerSpawnBonus: 0,
            priceBonus: 0,
            detectionReduction: 0
        };

        const equipped = this.getEquippedItems();
        for (const eq of equipped) {
            if (eq.rawCapacityBonus) stats.rawCapacityBonus += eq.rawCapacityBonus;
            if (eq.productCapacityBonus) stats.productCapacityBonus += eq.productCapacityBonus;
            if (eq.attackBonus) stats.attackBonus += eq.attackBonus;
            if (eq.damageReduction) stats.damageReduction += eq.damageReduction;
            if (eq.heatReduction) stats.heatReduction += eq.heatReduction;
            if (eq.speedBonus) stats.speedBonus += eq.speedBonus;
            if (eq.visionRangeBonus) stats.visionRangeBonus += eq.visionRangeBonus;
            if (eq.safehouseEntrySpeed) stats.safehouseEntrySpeed += eq.safehouseEntrySpeed;
            if (eq.buyerSpawnBonus) stats.buyerSpawnBonus += eq.buyerSpawnBonus;
            if (eq.priceBonus) stats.priceBonus += eq.priceBonus;
            if (eq.detectionReduction) stats.detectionReduction += eq.detectionReduction;
        }

        return stats;
    }

    // Legacy compatibility methods
    getOwnedEquipment() {
        return this.playerState.equipment?.owned || {};
    }

    // Equipment bonuses (updated for slot-based system)
    getEquipmentAttackBonus() {
        return this.getEquipmentStats().attackBonus;
    }

    hasRangeAttack() {
        const weapon1 = this.playerState.equipment?.weapon1;
        if (weapon1) {
            const eq = CONFIG.EQUIPMENT[weapon1];
            return eq?.rangeAttack === true;
        }
        return false;
    }

    getPistolAmmoCost() {
        return this.hasRangeAttack() ? 1 : 0;
    }

    getDamageReduction() {
        return Math.min(this.getEquipmentStats().damageReduction, 0.8);
    }

    getHeatReduction() {
        return Math.min(this.getEquipmentStats().heatReduction, 0.9);
    }

    getMovementSpeedBonus() {
        const speedBonus = this.getEquipmentStats().speedBonus;
        return speedBonus > 0 ? speedBonus : 1;
    }

    getVisionRangeBonus() {
        return this.getEquipmentStats().visionRangeBonus;
    }

    getSafehouseEntrySpeed() {
        const stats = this.getEquipmentStats();
        return stats.safehouseEntrySpeed > 0 ? stats.safehouseEntrySpeed : 1;
    }

    getBuyerSpawnBonus() {
        return this.getEquipmentStats().buyerSpawnBonus;
    }

    getPriceBonus() {
        return this.getEquipmentStats().priceBonus;
    }

    getDetectionReduction() {
        return this.getEquipmentStats().detectionReduction;
    }

    // ============================================================
    // STATS & STATUS
    // ============================================================

    getRank() {
        const money = this.playerState.money;
        if (money >= 100000) return 'Kingpin';
        if (money >= 50000) return 'Boss';
        if (money >= 25000) return 'Distributor';
        if (money >= 10000) return 'Dealer';
        if (money >= 5000) return 'Peddler';
        if (money >= 1000) return 'Corner Boy';
        return 'Beginner';
    }

    applyStatus(statusKey, duration = null) {
        const status = CONFIG.STATUS_EFFECTS[statusKey];
        if (!status) return;

        this.playerState.activeStatuses[statusKey] = {
            ...status,
            duration: duration ?? status.defaultDuration
        };

        // Show status notification
        this.scene.showFloatingText(
            `${status.icon || ''} ${status.name}!`,
            status.color || '#ffffff'
        );
    }

    hasStatus(statusKey) {
        return !!this.playerState.activeStatuses?.[statusKey];
    }

    getMovementSpeedMultiplier() {
        let multiplier = 1.0;

        if (this.hasStatus('slowed')) multiplier *= 0.5;
        if (this.hasStatus('fast')) multiplier *= 1.5;
        if (this.hasStatus('speedy')) multiplier *= 2.0;

        // Equipment bonus
        multiplier += this.getMovementSpeedBonus();

        return multiplier;
    }

    getDamageTakenMultiplier() {
        let multiplier = 1.0;

        if (this.hasStatus('vulnerable')) multiplier *= 1.5;
        if (this.hasStatus('protected')) multiplier *= 0.5;
        if (this.hasStatus('armored')) multiplier *= 0.25;

        // Equipment reduction
        multiplier *= (1 - this.getDamageReduction());

        return Math.max(0.1, multiplier);
    }

    // ============================================================
    // DRUG INVENTORY
    // ============================================================

    addDrug(type, amount) {
        if (!this.playerState.drugs) {
            this.playerState.drugs = {};
        }
        this.playerState.drugs[type] = (this.playerState.drugs[type] || 0) + amount;
    }

    removeDrug(type, amount) {
        if (!this.playerState.drugs) return 0;
        const current = this.playerState.drugs[type] || 0;
        const removed = Math.min(current, amount);
        this.playerState.drugs[type] = current - removed;
        return removed;
    }

    getDrugAmount(type) {
        return this.playerState.drugs?.[type] || 0;
    }

    // Precursors
    addPrecursor(type, amount) {
        if (!this.playerState.precursors) {
            this.playerState.precursors = {};
        }
        this.playerState.precursors[type] = (this.playerState.precursors[type] || 0) + amount;
    }

    removePrecursor(type, amount) {
        if (!this.playerState.precursors) return 0;
        const current = this.playerState.precursors[type] || 0;
        const removed = Math.min(current, amount);
        this.playerState.precursors[type] = current - removed;
        return removed;
    }

    getPrecursorAmount(type) {
        return this.playerState.precursors?.[type] || 0;
    }

    // ============================================================
    // FACTION REPUTATION
    // ============================================================

    /**
     * Get reputation with a specific faction
     * @param {string} factionKey - The faction key (e.g., 'THE_DON')
     * @returns {number} Reputation value (-100 to 100)
     */
    getFactionReputation(factionKey) {
        return this.playerState.factionReputation?.[factionKey] || 0;
    }

    /**
     * Change reputation with a faction
     * @param {string} factionKey - The faction key
     * @param {number} amount - Amount to change (positive or negative)
     * @param {string} reason - Optional reason for the change
     */
    changeFactionReputation(factionKey, amount, reason = '') {
        if (!this.playerState.factionReputation) {
            this.playerState.factionReputation = {};
        }
        
        // Initialize faction if not present
        if (this.playerState.factionReputation[factionKey] === undefined) {
            this.playerState.factionReputation[factionKey] = 0;
        }
        
        // Clamp the value between -100 and 100
        const currentRep = this.playerState.factionReputation[factionKey];
        const newRep = Math.max(-100, Math.min(100, currentRep + amount));
        this.playerState.factionReputation[factionKey] = newRep;
        
        // Show notification
        if (amount !== 0) {
            const factionName = this.getFactionDisplayName(factionKey);
            const repLabel = this.getReputationLabel(newRep);
            const color = amount > 0 ? CONFIG.COLORS.success : CONFIG.COLORS.danger;
            const sign = amount > 0 ? '+' : '';
            
            this.scene.showFloatingText(
                `${factionName}: ${sign}${amount} (${repLabel})`,
                color
            );
        }
        
        // Emit event for other systems
        EventBus.emit('faction:reputationChanged', {
            faction: factionKey,
            newReputation: newRep,
            change: amount,
            reason: reason
        });
    }

    /**
     * Get display name for a faction
     * @private
     */
    getFactionDisplayName(factionKey) {
        const names = {
            THE_DON: 'The Don',
            VIPER: 'Viper',
            ROOK: 'Rook',
            GHOST: 'Ghost',
            IRON: 'Iron',
            FANG: 'Fang',
            FROST: 'Frost',
            BLAZE: 'Blaze',
            RAZOR: 'Razor',
            STORM: 'Storm',
            SHADE: 'Shade',
            BYTE: 'Byte'
        };
        return names[factionKey] || factionKey;
    }

    /**
     * Get reputation label
     * @private
     */
    getReputationLabel(rep) {
        if (rep >= 75) return 'Allied';
        if (rep >= 50) return 'Friendly';
        if (rep >= 25) return 'Neutral+';
        if (rep >= 0) return 'Neutral';
        if (rep >= -25) return 'Neutral-';
        if (rep >= -50) return 'Unfriendly';
        if (rep >= -75) return 'Hostile';
        return 'Enemy';
    }

    /**
     * Check if player has good reputation with a faction
     * @param {string} factionKey 
     * @returns {boolean}
     */
    isFactionFriendly(factionKey) {
        return this.getFactionReputation(factionKey) >= 25;
    }

    /**
     * Check if player has bad reputation with a faction
     * @param {string} factionKey 
     * @returns {boolean}
     */
    isFactionHostile(factionKey) {
        return this.getFactionReputation(factionKey) <= -25;
    }

    /**
     * Get all faction reputations
     * @returns {Object} All faction reputations
     */
    getAllFactionReputations() {
        return { ...this.playerState.factionReputation } || {};
    }

    /**
     * Get factions that the player has significant reputation with
     * @returns {Array} Array of {key, reputation, label} objects
     */
    getNotableFactions() {
        const reps = this.getAllFactionReputations();
        const notable = [];
        
        for (const [key, value] of Object.entries(reps)) {
            if (Math.abs(value) >= 25) {
                notable.push({
                    key: key,
                    name: this.getFactionDisplayName(key),
                    reputation: value,
                    label: this.getReputationLabel(value)
                });
            }
        }
        
        // Sort by reputation (highest first)
        notable.sort((a, b) => b.reputation - a.reputation);
        
        return notable;
    }
}
