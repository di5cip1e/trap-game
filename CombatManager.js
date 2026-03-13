/**
 * CombatManager.js - Handles combat, enemies, police, and status effects
 * Extracted from GameScene.js to reduce complexity
 */

import { CONFIG } from './config.js';

export default class CombatManager {
    constructor(scene, playerState) {
        this.scene = scene;
        this.playerState = playerState;
        this.police = [];
        this.activeEnemies = [];
        this.combatActive = false;
    }

    // ============================================================
    // POLICE SYSTEM
    // ============================================================

    spawnPolice() {
        if (this.playerState.heat < CONFIG.POLICE_SPAWN_HEAT_THRESHOLD) return;

        // Get detection reduction from equipment
        const detectionReduction = this.scene.playerManager?.getDetectionReduction?.() || 0;
        const spawnChance = (this.playerState.heat / CONFIG.MAX_HEAT) * (1 - detectionReduction);

        if (Math.random() > spawnChance) return;

        // Find spawn position
        let spawnX, spawnY, attempts = 0;
        do {
            spawnX = Phaser.Math.Between(2, CONFIG.GRID_WIDTH - 3);
            spawnY = Phaser.Math.Between(2, CONFIG.GRID_HEIGHT - 3);
            attempts++;
        } while (
            !this._isValidPoliceSpawn(spawnX, spawnY) &&
            attempts < 50
        );

        if (attempts >= 50) return;

        // Create police entity
        const police = {
            id: Date.now() + Math.random(),
            x: spawnX,
            y: spawnY,
            gridX: spawnX,
            gridY: spawnY,
            patrolPath: [],
            patrolIndex: 0,
            alerted: false,
            chaseTimer: 0,
            sprite: null
        };

        // Create sprite if scene is ready
        if (this.scene && this.scene.add) {
            const pixelX = spawnX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
            const pixelY = spawnY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;

            police.sprite = this.scene.add.sprite(pixelX, pixelY, 'police');
            police.sprite.setDepth(spawnY);
            police.sprite.setTint(0xff6666);

            this.scene.tweens.add({
                targets: police.sprite,
                alpha: 0.7,
                duration: 500,
                yoyo: true,
                repeat: -1
            });
        }

        this.police.push(police);
        this.scene.showFloatingText('🚨 Police spotted!', CONFIG.COLORS.danger);
    }

    /**
     * Check if position is valid for police spawn
     * @private
     */
    _isValidPoliceSpawn(x, y) {
        // Null safety for worldMap access
        const tile = this.scene.worldMap?.[y]?.[x];
        if (!tile) return false;

        // Distance from player
        const dist = Phaser.Math.Distance.Between(
            x, y,
            this.playerState.gridX, this.playerState.gridY
        );

        return tile.walkable && dist > 5 && dist < 15;
    }

    despawnPolice() {
        this.police.forEach(p => {
            if (p.sprite) p.sprite.destroy();
        });
        this.police = [];
    }

    generatePolicePatrolPath(police) {
        const path = [];
        let currentX = police.x;
        let currentY = police.y;

        for (let i = 0; i < 5; i++) {
            const directions = [
                { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
                { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
            ];

            // Filter to valid moves
            const validMoves = directions.filter(dir => {
                const nx = currentX + dir.dx;
                const ny = currentY + dir.dy;
                const tile = this.scene.worldMap?.[ny]?.[nx];
                return tile && tile.walkable;
            });

            if (validMoves.length === 0) break;

            const move = validMoves[Math.floor(Math.random() * validMoves.length)];
            currentX += move.dx;
            currentY += move.dy;
            path.push({ x: currentX, y: currentY });
        }

        return path;
    }

    updatePolicePatrol() {
        for (const police of this.police) {
            if (police.alerted) {
                // Continue chase logic
                this.updatePoliceChase(police);
                continue;
            }

            // Generate patrol path if needed
            if (police.patrolPath.length === 0) {
                police.patrolPath = this.generatePolicePatrolPath(police);
                police.patrolIndex = 0;
            }

            // Move along patrol path
            if (police.patrolIndex < police.patrolPath.length) {
                const target = police.patrolPath[police.patrolIndex];
                police.x = target.x;
                police.y = target.y;

                if (police.sprite) {
                    const pixelX = target.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
                    const pixelY = target.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;

                    this.scene.tweens.add({
                        targets: police.sprite,
                        x: pixelX,
                        y: pixelY,
                        duration: 300,
                        ease: 'Linear'
                    });
                }

                police.patrolIndex++;
            } else {
                // Reset patrol
                police.patrolPath = [];
            }

            // Check line of sight to player
            if (this.checkPoliceLineOfSight(police)) {
                this.startPoliceChase(police);
            }
        }
    }

    checkPoliceLineOfSight(police) {
        if (!police) return false;

        const startX = police.x;
        const startY = police.y;
        const endX = this.playerState.gridX;
        const endY = this.playerState.gridY;

        return this.scene.hasLineOfSight?.(startX, startY, endX, endY) || false;
    }

    hasLineOfSight(startX, startY, endX, endY) {
        // Simple line of sight check
        const dx = Math.abs(endX - startX);
        const dy = Math.abs(endY - startY);
        const steps = Math.max(dx, dy);

        if (steps === 0) return true;

        const xInc = (endX - startX) / steps;
        const yInc = (endY - startY) / steps;

        let x = startX;
        let y = startY;

        for (let i = 0; i < steps; i++) {
            // Bounds check
            const checkX = Math.round(x);
            const checkY = Math.round(y);

            if (checkX < 0 || checkX >= CONFIG.GRID_WIDTH ||
                checkY < 0 || checkY >= CONFIG.GRID_HEIGHT) {
                return false;
            }

            // Check if tile blocks sight - with null safety
            const tile = this.scene.worldMap?.[checkY]?.[checkX];
            if (tile && tile.sprite && tile.sprite.blockSight) {
                return false;
            }

            x += xInc;
            y += yInc;
        }

        return true;
    }

    startPoliceChase(police) {
        police.alerted = true;
        police.chaseTimer = CONFIG.POLICE_CHASE_DURATION;

        if (police.sprite) {
            police.sprite.setTint(0xff0000);
            police.sprite.setAlpha(1);
        }

        this.scene.showFloatingText('🚨 BUSTED! Run!', CONFIG.COLORS.danger);
    }

    updatePoliceChase(police) {
        if (!police.alerted) return;

        police.chaseTimer -= 1;

        if (police.chaseTimer <= 0) {
            // Lose police
            police.alerted = false;
            if (police.sprite) {
                police.sprite.setTint(0xff6666);
                police.sprite.setAlpha(0.7);
            }
            this.scene.showFloatingText('🚨 Lost them!', CONFIG.COLORS.success);
            return;
        }

        // Move toward player
        const dx = this.playerState.gridX - police.x;
        const dy = this.playerState.gridY - police.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
            const moveX = Math.round(police.x + (dx / dist));
            const moveY = Math.round(police.y + (dy / dist));

            // Check if tile is walkable with bounds checking
            const tile = this.scene.worldMap?.[moveY]?.[moveX];
            if (tile && tile.walkable) {
                police.x = moveX;
                police.y = moveY;

                if (police.sprite) {
                    const pixelX = moveX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
                    const pixelY = moveY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
                    police.sprite.setPosition(pixelX, pixelY);
                }
            }
        }

        // Check for arrest
        if (dist <= 1) {
            this.scene.arrestPlayer?.();
        }
    }

    arrestPlayer() {
        // Fine based on product carried
        let fine = 0;
        const productValue = Object.entries(this.playerState.drugs || {})
            .reduce((sum, [type, amount]) => {
                const price = CONFIG.DRUG_PRICES[type] || 0;
                return sum + (price * amount);
            }, 0);

        fine = Math.floor(productValue * 0.5);
        fine = Math.max(fine, 100);

        // Deduct money
        this.playerState.money = Math.max(0, this.playerState.money - fine);

        // Reduce heat
        this.playerState.heat = Math.max(0, this.playerState.heat - 30);

        // Lose all product
        this.playerState.drugs = {};

        this.scene.showFloatingText(
            `Arrested! Fined $${fine}`,
            CONFIG.COLORS.danger
        );

        // Despawn police
        this.despawnPolice();

        // Update UI
        if (this.scene.hud) this.scene.hud.update();
    }

    updatePoliceSystem() {
        // Spawn new police periodically
        if (Math.random() < 0.02) {
            this.spawnPolice();
        }

        // Update existing police
        this.updatePolicePatrol();
    }

    // ============================================================
    // COMBAT & ENEMIES
    // ============================================================

    spawnEnemy(type, x, y) {
        const enemyType = CONFIG.ENEMY_TYPES?.[type];
        if (!enemyType) return null;

        const enemy = {
            type: type,
            x: x,
            y: y,
            hp: enemyType.hp,
            maxHp: enemyType.hp,
            damage: enemyType.damage,
            sprite: null
        };

        this.activeEnemies.push(enemy);
        return enemy;
    }

    removeEnemy(enemy) {
        const index = this.activeEnemies.indexOf(enemy);
        if (index > -1) {
            if (enemy.sprite) enemy.sprite.destroy();
            this.activeEnemies.splice(index, 1);
        }
    }

    // ============================================================
    // STATUS EFFECTS
    // ============================================================

    updateStatusEffects() {
        const statuses = this.playerState.activeStatuses;
        if (!statuses) return;

        for (const [key, status] of Object.entries(statuses)) {
            if (status.duration !== null && status.duration !== undefined) {
                status.duration--;

                if (status.duration <= 0) {
                    delete statuses[key];
                    this.scene.showFloatingText(
                        `${status.name} wore off`,
                        '#ffffff'
                    );
                }
            }
        }
    }

    applyEnemySkill(enemyType, skillKey) {
        const enemySkills = CONFIG.ENEMY_SKILLS?.[enemyType];
        if (!enemySkills) return;

        const skill = enemySkills[skillKey];
        if (!skill) return;

        // Apply status effect
        if (skill.statusEffect) {
            this.scene.playerManager?.applyStatus(skill.statusEffect, skill.statusDuration);
        }

        // Apply damage
        if (skill.damage) {
            const damage = Math.floor(skill.damage * this.scene.playerManager?.getDamageTakenMultiplier());
            this.playerState.hp = Math.max(0, (this.playerState.hp || 100) - damage);
            this.scene.showFloatingText(`-${damage} HP`, CONFIG.COLORS.danger);
        }
    }
}
