/**
 * PlayerController.js - Handles all player-related logic
 * Movement, stats, equipment, status effects
 */

import { EventBus, EVENTS } from './EventBus.js';

export default class PlayerController {
    constructor(scene, playerState) {
        this.scene = scene;
        this.playerState = playerState;
    }

    // ============================================================
    // MOVEMENT
    // ============================================================

    /**
     * Attempt to move player in direction
     */
    tryMove(dx, dy) {
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
        
        // Confused: Random movement instead of intended
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
        
        // Check bounds
        if (newX < 0 || newX >= CONFIG.GRID_WIDTH || 
            newY < 0 || newY >= CONFIG.GRID_HEIGHT) {
            return;
        }
        
        // Check for NPC collision - players cannot walk through NPCs
        if (this.scene.worldObjects) {
            const hasCollision = this.scene.worldObjects.some(obj => 
                obj.x === newX && obj.y === newY && obj.walkable === false
            );
            if (hasCollision) return;
        }
        
        // Check if tile exists and is walkable (with safety check)
        const targetTile = this.scene.worldMap[newY]?.[newX];
        if (!targetTile || !targetTile.walkable) {
            return;
        }
        
        // Start movement
        this.playerState.isMoving = true;
        this.playerState.gridX = newX;
        this.playerState.gridY = newY;
        
        const targetX = newX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        const targetY = newY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        
        // Animate movement
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
     * Handle tap-to-move
     */
    handleTapToMove(pointer) {
        const { CONFIG } = this.scene;
        
        const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
        const targetGridX = Math.floor(worldPoint.x / CONFIG.TILE_SIZE);
        const targetGridY = Math.floor(worldPoint.y / CONFIG.TILE_SIZE);
        
        const dx = targetGridX - this.playerState.gridX;
        const dy = targetGridY - this.playerState.gridY;
        
        if (dx === 0 && dy === 0) return;
        
        if (Math.abs(dx) >= Math.abs(dy) && dx !== 0) {
            this.tryMove(dx > 0 ? 1 : -1, 0);
        } else if (dy !== 0) {
            this.tryMove(0, dy > 0 ? 1 : -1);
        }
    }

    /**
     * Handle joystick movement
     */
    handleJoystickMovement(delta) {
        if (!this.scene.joystick) return;
        
        const vector = this.scene.joystick.getVector();
        const joystickMagnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
        
        if (joystickMagnitude < 0.2) {
            this.scene.joystickMoveDelay = 0;
            return;
        }
        
        if (this.playerState.isMoving || this.scene.isAnyUIOpen()) return;
        
        if (this.scene.joystickMoveDelay > 0) {
            this.scene.joystickMoveDelay -= delta;
            return;
        }
        
        this.scene.joystickMoveDelay = 180;
        
        const dx = Math.abs(vector.x) > Math.abs(vector.y) ? 
            (vector.x > 0 ? 1 : -1) : 0;
        const dy = Math.abs(vector.y) > Math.abs(vector.x) ? 
            (vector.y > 0 ? 1 : -1) : 0;
        
        if (dx !== 0 || dy !== 0) {
            this.tryMove(dx, dy);
        }
    }

    /**
     * Called after player moves
     */
    onPlayerMove() {
        const { CONFIG } = this.scene;
        
        // Update status effects
        this.updateStatusEffects();
        
        // Drain hustle
        this.playerState.hustle -= CONFIG.HUSTLE_DRAIN_PER_MOVE;
        
        // Check for hustle depletion
        if (this.playerState.hustle <= 0) {
            this.scene.passOut();
            return;
        }
        
        // Check neighborhood border
        this.scene.checkNeighborhoodBorder();
        
        // Advance time
        this.scene.timeSystem.advanceTime(CONFIG.MINUTES_PER_MOVE);
        
        // Update UI
        this.scene.hud.update();
        this.scene.minimap.update();
        
        // Emit event for other controllers
        EventBus.emit(EVENTS.TIME_ADVANCED, { moves: 1 });
    }

    // ============================================================
    // STATUS EFFECTS
    // ============================================================

    applyStatus(statusKey, duration = null) {
        const { CONFIG } = this.scene;
        const statusConfig = CONFIG.STATUS_EFFECTS[statusKey];
        
        if (!statusConfig) {
            console.warn(`Unknown status effect: ${statusKey}`);
            return false;
        }
        
        const statuses = this.playerState.activeStatuses;
        
        // Handle mutually exclusive statuses
        if (statusConfig.mutuallyExclusive) {
            for (const exclusiveKey of statusConfig.mutuallyExclusive) {
                if (statuses[exclusiveKey]) {
                    delete statuses[exclusiveKey];
                }
            }
        }
        
        const actualDuration = duration !== null ? duration : statusConfig.duration;
        
        if (statusConfig.stackable) {
            if (!statuses[statusKey]) {
                statuses[statusKey] = { duration: actualDuration, stacks: 1 };
            } else {
                statuses[statusKey].stacks += 1;
                statuses[statusKey].duration = Math.max(statuses[statusKey].duration, actualDuration);
            }
        } else {
            statuses[statusKey] = { duration: actualDuration, stacks: 1 };
        }
        
        const icon = statusConfig.icon || '';
        this.scene.showFloatingText(`${icon} ${statusConfig.name} applied!`, statusConfig.color);
        
        if (this.scene.hud) {
            this.scene.hud.updateStatusDisplay();
        }
        
        // Emit event
        EventBus.emit(EVENTS.PLAYER_STATS_CHANGED, { statusApplied: statusKey });
        
        return true;
    }

    updateStatusEffects() {
        const { CONFIG } = this.scene;
        const statuses = this.playerState.activeStatuses;
        const keys = Object.keys(statuses);
        
        if (keys.length === 0) return;
        
        for (const statusKey of keys) {
            const status = statuses[statusKey];
            const config = CONFIG.STATUS_EFFECTS[statusKey];
            
            if (!config) continue;
            
            let damage = 0;
            
            if (config.damagePerTurn) {
                damage += config.damagePerTurn * (status.stacks || 1);
            }
            
            if (damage > 0) {
                let defenseReduction = 0;
                if (statuses.onFire && CONFIG.STATUS_EFFECTS.onFire.defenseReduction) {
                    defenseReduction = CONFIG.STATUS_EFFECTS.onFire.defenseReduction;
                }
                
                const actualDamage = Math.floor(damage * (1 - defenseReduction));
                this.playerState.playerHP = Math.max(0, this.playerState.playerHP - actualDamage);
                                
                if (this.playerState.playerHP <= 0) {
                    this.scene.handlePlayerDeath();
                }
            }
            
            status.duration -= 1;
            
            if (status.duration <= 0) {
                delete statuses[statusKey];
                this.scene.showFloatingText(`${config.icon} ${config.name} wore off!`, config.color);
            }
        }
        
        if (this.scene.hud) {
            this.scene.hud.updateStatusDisplay();
        }
    }

    hasStatus(statusKey) {
        return !!this.playerState.activeStatuses[statusKey];
    }

    getMovementSpeedMultiplier() {
        let multiplier = 1;
        
        if (this.playerState.activeStatuses.poisoned) {
            const config = this.scene.CONFIG.STATUS_EFFECTS.poisoned;
            if (config.speedReduction) {
                multiplier *= config.speedReduction;
            }
        }
        
        if (this.playerState.activeStatuses.slowed) {
            const config = this.scene.CONFIG.STATUS_EFFECTS.slowed;
            if (config.speedMultiplier) {
                multiplier *= config.speedMultiplier;
            }
        }
        
        // Equipment bonus
        if (this.playerState.equipment.runningShoes) {
            multiplier *= 1.5;
        }
        
        return multiplier;
    }

    getDamageTakenMultiplier() {
        let multiplier = 1;
        
        if (this.playerState.activeStatuses.stunned) {
            const config = this.scene.CONFIG.STATUS_EFFECTS.stunned;
            if (config.vulnerabilityMultiplier) {
                multiplier *= config.vulnerabilityMultiplier;
            }
        }
        
        const frozenStatus = this.playerState.activeStatuses.frozen;
        if (frozenStatus && frozenStatus.duration > 0) {
            const config = this.scene.CONFIG.STATUS_EFFECTS.frozen;
            if (config.extraDamageMultiplier) {
                multiplier *= config.extraDamageMultiplier;
            }
            delete this.playerState.activeStatuses.frozen;
            this.scene.showFloatingText('❄️ Frozen shattered!', config.color);
            if (this.scene.hud) this.scene.hud.updateStatusDisplay();
        }
        
        return multiplier;
    }

    // ============================================================
    // EQUIPMENT
    // ============================================================

    purchaseEquipment(equipmentId) {
        const { CONFIG } = this.scene;
        const equipment = CONFIG.EQUIPMENT[equipmentId];
        
        if (!equipment) return false;
        if (this.playerState.equipment[equipmentId]) return false;
        if (this.playerState.money < equipment.cost) return false;
        
        this.playerState.money -= equipment.cost;
        this.playerState.equipment[equipmentId] = true;
        
        if (equipment.rawCapacityBonus) {
            this.playerState.rawCapacity += equipment.rawCapacityBonus;
        }
        if (equipment.productCapacityBonus) {
            this.playerState.productCapacity += equipment.productCapacityBonus;
        }
        
        this.scene.hud.update();
        EventBus.emit(EVENTS.PLAYER_EQUIPMENT_CHANGED, { equipmentId, action: 'purchased' });
        
        return true;
    }

    unequipEquipment(equipmentId) {
        const { CONFIG } = this.scene;
        const equipment = CONFIG.EQUIPMENT[equipmentId];
        
        if (!equipment || !this.playerState.equipment[equipmentId]) return false;
        
        this.playerState.equipment[equipmentId] = false;
        
        if (equipment.rawCapacityBonus) {
            this.playerState.rawCapacity -= equipment.rawCapacityBonus;
        }
        if (equipment.productCapacityBonus) {
            this.playerState.productCapacity -= equipment.productCapacityBonus;
        }
        
        this.scene.hud.update();
        EventBus.emit(EVENTS.PLAYER_EQUIPMENT_CHANGED, { equipmentId, action: 'unequipped' });
        
        return true;
    }

    sellEquipment(equipmentId) {
        const { CONFIG } = this.scene;
        const equipment = CONFIG.EQUIPMENT[equipmentId];
        
        if (!equipment || !this.playerState.equipment[equipmentId]) return false;
        
        const sellValue = Math.floor(equipment.cost * 0.5);
        this.playerState.money += sellValue;
        this.playerState.equipment[equipmentId] = false;
        
        if (equipment.rawCapacityBonus) {
            this.playerState.rawCapacity -= equipment.rawCapacityBonus;
        }
        if (equipment.productCapacityBonus) {
            this.playerState.productCapacity -= equipment.productCapacityBonus;
        }
        
        this.scene.hud.update();
        EventBus.emit(EVENTS.PLAYER_EQUIPMENT_CHANGED, { equipmentId, action: 'sold' });
        
        return sellValue;
    }

    // Equipment effect getters
    getEquipmentAttackBonus() {
        let bonus = 0;
        const { CONFIG } = this.scene;
        
        if (this.playerState.equipment.brassKnucks) {
            bonus += CONFIG.EQUIPMENT.brassKnucks.attackBonus;
        }
        if (this.playerState.equipment.switchblade) {
            bonus += CONFIG.EQUIPMENT.switchblade.attackBonus;
        }
        if (this.playerState.equipment.pistol) {
            bonus += CONFIG.EQUIPMENT.pistol.attackBonus;
        }
        return bonus;
    }

    hasRangeAttack() {
        return this.playerState.equipment.pistol;
    }

    getPistolAmmoCost() {
        const { CONFIG } = this.scene;
        return this.playerState.equipment.pistol ? CONFIG.EQUIPMENT.pistol.ammoCost : 0;
    }

    getDamageReduction() {
        const { CONFIG } = this.scene;
        if (this.playerState.equipment.bulletproofVest) {
            return CONFIG.EQUIPMENT.bulletproofVest.damageReduction;
        }
        return 0;
    }

    getHeatReduction() {
        const { CONFIG } = this.scene;
        if (this.playerState.equipment.heavyCoat) {
            return CONFIG.EQUIPMENT.heavyCoat.heatReduction;
        }
        return 0;
    }

    getVisionRangeBonus() {
        const { CONFIG } = this.scene;
        if (this.playerState.equipment.binoculars) {
            return CONFIG.EQUIPMENT.binoculars.visionRangeBonus;
        }
        return 0;
    }

    getPriceBonus() {
        const { CONFIG } = this.scene;
        if (this.playerState.equipment.goldChain) {
            return CONFIG.EQUIPMENT.goldChain.priceBonus;
        }
        return 0;
    }

    getDetectionReduction() {
        const { CONFIG } = this.scene;
        if (this.playerState.equipment.designerSunglasses) {
            return CONFIG.EQUIPMENT.designerSunglasses.detectionReduction;
        }
        return 0;
    }

    // ============================================================
    // STATS & MONEY
    // ============================================================

    addMoney(amount) {
        this.playerState.money += amount;
        this.scene.hud.update();
        EventBus.emit(EVENTS.PLAYER_MONEY_CHANGED, { 
            amount: amount,
            currentMoney: this.playerState.money 
        });
    }

    spendMoney(amount) {
        if (this.playerState.money < amount) return false;
        this.playerState.money -= amount;
        this.scene.hud.update();
        EventBus.emit(EVENTS.PLAYER_MONEY_CHANGED, { 
            amount: -amount,
            currentMoney: this.playerState.money 
        });
        return true;
    }

    addHeat(amount) {
        const reduction = this.getHeatReduction();
        const actualAmount = Math.floor(amount * (1 - reduction));
        this.playerState.heat = Math.min(100, this.playerState.heat + actualAmount);
        this.scene.hud.update();
        EventBus.emit(EVENTS.PLAYER_HEAT_CHANGED, { heat: this.playerState.heat });
    }

    reduceHeat(amount) {
        this.playerState.heat = Math.max(0, this.playerState.heat - amount);
        this.scene.hud.update();
        EventBus.emit(EVENTS.PLAYER_HEAT_CHANGED, { heat: this.playerState.heat });
    }

    changeHustle(amount) {
        this.playerState.hustle = Math.max(0, Math.min(100, this.playerState.hustle + amount));
        this.scene.hud.update();
        EventBus.emit(EVENTS.PLAYER_HUSTLE_CHANGED, { hustle: this.playerState.hustle });
    }

    // ============================================================
    // COMBAT HELPERS
    // ============================================================

    takeDamage(amount) {
        const multiplier = this.getDamageReduction();
        const actualDamage = Math.floor(amount * (1 - multiplier));
        
        this.playerState.playerHP = Math.max(0, this.playerState.playerHP - actualDamage);
        
        EventBus.emit(EVENTS.PLAYER_DAMAGED, { damage: actualDamage, hp: this.playerState.playerHP });
        
        if (this.playerState.playerHP <= 0) {
            this.scene.handlePlayerDeath();
        }
        
        return actualDamage;
    }

    heal(amount) {
        this.playerState.playerHP = Math.min(this.playerState.playerMaxHP, this.playerState.playerHP + amount);
        this.scene.hud.update();
    }

    useSkill(skillKey) {
        const { CONFIG } = this.scene;
        const skill = CONFIG.PLAYER_SKILLS[skillKey];
        
        if (!skill) {
            console.warn(`Unknown skill: ${skillKey}`);
            return false;
        }
        
        if (!this.playerState.unlockedSkills.includes(skillKey)) {
            this.scene.showFloatingText(`Skill not unlocked: ${skill.name}`, '#ff4444');
            return false;
        }
        
        this.applyStatus(skill.statusEffect, skill.statusDuration);
        this.scene.showFloatingText(`${skill.name}!`, CONFIG.COLORS.primary);
        
        return true;
    }

    unlockSkill(skillKey) {
        const { CONFIG } = this.scene;
        const skill = CONFIG.PLAYER_SKILLS[skillKey];
        
        if (!skill) return false;
        if (this.playerState.unlockedSkills.includes(skillKey)) {
            this.scene.showFloatingText('Skill already unlocked!', '#888888');
            return false;
        }
        if (this.playerState.abilityPoints < skill.unlockCost) {
            this.scene.showFloatingText(`Need ${skill.unlockCost} AP to unlock ${skill.name}`, '#ff4444');
            return false;
        }
        
        this.playerState.abilityPoints -= skill.unlockCost;
        this.playerState.unlockedSkills.push(skillKey);
        
        this.scene.showFloatingText(`Unlocked ${skill.name}!`, '#00ff00');
        this.scene.hud.update();
        
        return true;
    }
}
