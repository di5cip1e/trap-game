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

        // Check slot availability
        const slot = equipment.slot;
        if (this.playerState.equipment[slot]) {
            this.scene.showFloatingText('Slot occupied!', CONFIG.COLORS.warning);
            return false;
        }

        this.playerState.money -= equipment.cost;
        this.playerState.equipment[slot] = equipmentId;

        // Track achievement
        if (typeof trackEquipmentPurchase === 'function') {
            trackEquipmentPurchase(equipmentId);
        }

        this.scene.showFloatingText(`Bought ${equipment.name}!`, CONFIG.COLORS.success);
        this.scene.hud?.update();
        return true;
    }

    unequipEquipment(equipmentId) {
        const equipment = CONFIG.EQUIPMENT[equipmentId];
        if (!equipment) return false;

        const slot = equipment.slot;
        if (this.playerState.equipment[slot] !== equipmentId) {
            return false;
        }

        delete this.playerState.equipment[slot];
        this.playerState.money += Math.floor(equipment.cost * 0.7);
        this.scene.showFloatingText(`Sold ${equipment.name}!`, CONFIG.COLORS.text);
        this.scene.hud?.update();
        return true;
    }

    sellEquipment(equipmentId) {
        return this.unequipEquipment(equipmentId);
    }

    // Equipment bonuses
    getEquipmentAttackBonus() {
        let bonus = 0;
        for (const equipmentId of Object.values(this.playerState.equipment || {})) {
            const eq = CONFIG.EQUIPMENT[equipmentId];
            if (eq?.attackBonus) bonus += eq.attackBonus;
        }
        return bonus;
    }

    hasRangeAttack() {
        return Object.values(this.playerState.equipment || {}).some(
            id => CONFIG.EQUIPMENT[id]?.range > 0
        );
    }

    getPistolAmmoCost() {
        return this.hasRangeAttack() ? 1 : 0;
    }

    getDamageReduction() {
        let reduction = 0;
        for (const equipmentId of Object.values(this.playerState.equipment || {})) {
            const eq = CONFIG.EQUIPMENT[equipmentId];
            if (eq?.damageReduction) reduction += eq.damageReduction;
        }
        return Math.min(reduction, 0.8); // Cap at 80%
    }

    getHeatReduction() {
        let reduction = 0;
        for (const equipmentId of Object.values(this.playerState.equipment || {})) {
            const eq = CONFIG.EQUIPMENT[equipmentId];
            if (eq?.heatReduction) reduction += eq.heatReduction;
        }
        return Math.min(reduction, 0.9);
    }

    getMovementSpeedBonus() {
        let bonus = 0;
        for (const equipmentId of Object.values(this.playerState.equipment || {})) {
            const eq = CONFIG.EQUIPMENT[equipmentId];
            if (eq?.speedBonus) bonus += eq.speedBonus;
        }
        return bonus;
    }

    getVisionRangeBonus() {
        let bonus = 0;
        for (const equipmentId of Object.values(this.playerState.equipment || {})) {
            const eq = CONFIG.EQUIPMENT[equipmentId];
            if (eq?.visionBonus) bonus += eq.visionBonus;
        }
        return bonus;
    }

    getSafehouseEntrySpeed() {
        let bonus = 0;
        for (const equipmentId of Object.values(this.playerState.equipment || {})) {
            const eq = CONFIG.EQUIPMENT[equipmentId];
            if (eq?.safehouseSpeed) bonus += eq.safehouseSpeed;
        }
        return bonus;
    }

    getBuyerSpawnBonus() {
        let bonus = 0;
        for (const equipmentId of Object.values(this.playerState.equipment || {})) {
            const eq = CONFIG.EQUIPMENT[equipmentId];
            if (eq?.buyerSpawnBonus) bonus += eq.buyerSpawnBonus;
        }
        return bonus;
    }

    getPriceBonus() {
        let bonus = 0;
        for (const equipmentId of Object.values(this.playerState.equipment || {})) {
            const eq = CONFIG.EQUIPMENT[equipmentId];
            if (eq?.priceBonus) bonus += eq.priceBonus;
        }
        return bonus;
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
}
