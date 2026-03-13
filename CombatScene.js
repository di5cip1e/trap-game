/**
 * CombatScene.js - Real-time Combat System
 * Replaces RPS with action-based combat
 */

import { CONFIG } from './config.js';
import SkillTree, { SKILL_TREES } from './SkillTree.js';

/**
 * Enemy type definitions
 */
export const ENEMY_TYPES = {
    thug: {
        name: 'Thug',
        hp: 50,
        maxHp: 50,
        damage: 8,
        xpValue: 30,
        attackSpeed: 1500,
        color: 0xaa6644,
        description: 'A basic street thug'
    },
    gangster: {
        name: 'Gangster',
        hp: 80,
        maxHp: 80,
        damage: 15,
        xpValue: 50,
        attackSpeed: 1200,
        color: 0x8844aa,
        description: 'Organized crime member'
    },
    enforcer: {
        name: 'Enforcer',
        hp: 120,
        maxHp: 120,
        damage: 25,
        xpValue: 80,
        attackSpeed: 1000,
        color: 0xaa4444,
        description: 'Muscle for the organization'
    },
    boss: {
        name: 'Boss',
        hp: 200,
        maxHp: 200,
        damage: 40,
        xpValue: 150,
        attackSpeed: 800,
        color: 0xffcc00,
        description: 'Major crime figure',
        isBoss: true,
        specialAttacks: {
            // Area attack: hits harder, described as powerful blow
            areaAttack: {
                chance: 0.25,           // 25% chance
                damageMultiplier: 1.5,  // 50% more damage
                message: 'BOSS UNLEASHES A DEVASTATING ATTACK!'
            },
            // Enrage: increases damage temporarily
            enrage: {
                chance: 0.15,           // 15% chance at 50% HP
                hpThreshold: 0.5,       // Triggers at 50% HP
                damageBoost: 0.5,       // +50% damage
                duration: 5000,         // 5 seconds
                message: 'BOSS ENRAGES! DAMAGE INCREASED!'
            },
            // Summon: calls for backup (spawns additional enemy)
            summon: {
                chance: 0.1,            // 10% chance
                hpThreshold: 0.3,       // Triggers at 30% HP
                message: 'BOSS CALLS FOR REINFORCEMENTS!'
            }
        }
    }
};

export default class CombatScene {
    constructor(scene) {
        this.scene = scene;
        this.isActive = false;
        this.container = null;
        
        // Combat state
        this.playerHP = 100;
        this.playerMaxHP = 100;
        this.enemy = null;
        this.enemyHP = 0;
        this.enemyMaxHP = 0;
        
        // Combat timers
        this.playerAttackTimer = 0;
        this.enemyAttackTimer = 0;
        this.lastPlayerAttack = 0;
        this.lastEnemyAttack = 0;
        
        // Active effects
        this.activeEffects = {};
        
        // Callbacks
        this.onVictory = null;
        this.onDefeat = null;
        
        // UI elements
        this.uiElements = {};
    }

    /**
     * Start a combat encounter
     * @param {Object} enemyData - Enemy data (type or custom)
     * @param {Function} onVictory - Callback on win
     * @param {Function} onDefeat - Callback on loss
     */
    startCombat(enemyData, onVictory, onDefeat) {
        if (this.isActive) return;
        
        this.isActive = true;
        this.onVictory = onVictory;
        this.onDefeat = onDefeat;
        
        // Set up enemy
        const enemyType = ENEMY_TYPES[enemyData.type] || ENEMY_TYPES.thug;
        this.enemy = {
            type: enemyData.type || 'thug',
            name: enemyData.name || enemyType.name,
            hp: enemyData.hp || enemyType.hp,
            maxHp: enemyData.hp || enemyType.maxHp,
            damage: enemyData.damage || enemyType.damage,
            xpValue: enemyType.xpValue,
            attackSpeed: enemyType.attackSpeed,
            color: enemyType.color
        };
        this.enemyHP = this.enemy.hp;
        this.enemyMaxHP = this.enemy.maxHp;
        
        // Calculate player HP (base + equipment + level + skills)
        this.calculatePlayerStats();
        
        // Reset combat timers
        this.playerAttackTimer = 0;
        this.enemyAttackTimer = 0;
        this.lastPlayerAttack = this.scene.time.now;
        this.lastEnemyAttack = this.scene.time.now;
        
        // Reset active effects
        this.activeEffects = {};
        
        // Create UI
        this.createCombatUI();
        
            }

    /**
     * Calculate player combat stats
     */
    calculatePlayerStats() {
        const { playerState } = this.scene;
        
        // Base HP
        let maxHP = 100;
        
        // Equipment bonuses
        if (playerState.equipment.bulletproofVest) {
            maxHP += CONFIG.EQUIPMENT.bulletproofVest.hpBonus || 20;
        }
        if (playerState.equipment.heavyCoat) {
            maxHP += CONFIG.EQUIPMENT.heavyCoat.hpBonus || 15;
        }
        
        // Level bonus from LevelSystem
        if (this.scene.levelSystem) {
            maxHP += this.scene.levelSystem.getLevelHPBonus();
        }
        
        // Skill bonuses (Toughness)
        if (this.scene.skillTree?.hasSkill('toughness')) {
            maxHP += 25;
        }
        
        this.playerMaxHP = maxHP;
        
        // If new combat, set player HP to max, otherwise keep current
        if (this.playerHP <= 0 || this.playerHP > this.playerMaxHP) {
            this.playerHP = this.playerMaxHP;
        }
    }

    /**
     * Get player damage value
     * @returns {number} Player damage
     */
    getPlayerDamage() {
        const { playerState } = this.scene;
        
        let damage = 15; // Base damage
        
        // Equipment bonuses
        if (playerState.equipment.brassKnucks) {
            damage += CONFIG.EQUIPMENT.brassKnucks.attackBonus || 5;
        }
        if (playerState.equipment.switchblade) {
            damage += CONFIG.EQUIPMENT.switchblade.attackBonus || 10;
        }
        if (playerState.equipment.pistol) {
            damage += CONFIG.EQUIPMENT.pistol.attackBonus || 25;
        }
        
        // Level bonus
        if (this.scene.levelSystem) {
            damage = Math.floor(damage * this.scene.levelSystem.getLevelDamageBonus());
        }
        
        // Skill bonuses
        if (this.scene.skillTree?.hasSkill('iron_fist')) {
            damage = Math.floor(damage * 1.25); // +25%
        }
        
        // Last Stand bonus (when low HP)
        if (this.activeEffects.lastStand) {
            damage = Math.floor(damage * 1.5);
        }
        
        // Berserk bonus
        if (this.activeEffects.berserk) {
            damage = Math.floor(damage * 2.0);
        }
        
        // Critical hit (Deadly Precision)
        if (this.scene.skillTree?.hasSkill('deadly_precision')) {
            if (Math.random() < 0.25) {
                damage = Math.floor(damage * 1.5); // +50% crit damage
                this.showDamageText('CRITICAL!', this.scene.scale.width / 2, 200, 0xff0000);
            }
        }
        
        return damage;
    }

    /**
     * Get player defense value
     * @returns {number} Damage reduction (0-1)
     */
    getPlayerDefense() {
        const { playerState } = this.scene;
        
        let defense = 0;
        
        // Equipment
        if (playerState.equipment.bulletproofVest) {
            defense += CONFIG.EQUIPMENT.bulletproofVest.damageReduction || 0.15;
        }
        
        // Skill: Toughness
        if (this.scene.skillTree?.hasSkill('toughness')) {
            defense += 0.1;
        }
        
        // Last Stand bonus
        if (this.activeEffects.lastStand) {
            defense += 0.25;
        }
        
        // Berserk (no defense, full aggression)
        if (this.activeEffects.berserk) {
            defense = 0;
        }
        
        return Math.min(0.75, defense); // Max 75% reduction
    }

    /**
     * Create the combat UI
     */
    createCombatUI() {
        const { width, height } = this.scene.scale;
        
        // Container
        this.container = this.scene.add.container(0, 0).setScrollFactor(0).setDepth(2000);
        
        // Dark overlay
        const overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9);
        this.container.add(overlay);
        
        // Combat border effect
        const border = this.scene.add.rectangle(width / 2, height / 2, width - 100, height - 200, 0x1a0a0a);
        border.setStrokeStyle(4, 0xff0000);
        this.container.add(border);
        
        // Title
        const title = this.scene.add.text(width / 2, 60, 'COMBAT!', {
            fontFamily: 'Press Start 2P',
            fontSize: '36px',
            color: '#ff0000',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        this.container.add(title);
        
        // Enemy section (top)
        this.createEnemyDisplay(width / 2, 180);
        
        // VS text
        const vsText = this.scene.add.text(width / 2, 320, 'VS', {
            fontFamily: 'Press Start 2P',
            fontSize: '32px',
            color: '#ff0000'
        }).setOrigin(0.5);
        this.container.add(vsText);
        
        // Player section (bottom)
        this.createPlayerDisplay(width / 2, 450);
        
        // Action buttons
        this.createActionButtons(width / 2, 600);
        
        // Skill buttons
        this.createSkillButtons(100, height - 150);
        
        // Timer/auto-attack indicator
        this.createAttackIndicator(width - 150, height - 150);
        
        // Update UI
        this.updateCombatUI();
    }

    /**
     * Create enemy display
     */
    createEnemyDisplay(x, y) {
        // Enemy sprite area
        const enemyBg = this.scene.add.rectangle(x, y, 200, 120, 0x2a1a1a);
        enemyBg.setStrokeStyle(3, this.enemy.color);
        this.container.add(enemyBg);
        
        // Enemy name
        const nameText = this.scene.add.text(x, y - 40, this.enemy.name, {
            fontFamily: 'Press Start 2P',
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.container.add(nameText);
        this.uiElements.enemyName = nameText;
        
        // Enemy HP bar
        const hpBarBg = this.scene.add.rectangle(x, y, 180, 25, 0x333333);
        this.container.add(hpBarBg);
        
        const hpBar = this.scene.add.rectangle(x - 90 + 5, y, 0, 20, 0xff0000);
        this.container.add(hpBar);
        this.uiElements.enemyHPBar = hpBar;
        
        // HP text
        const hpText = this.scene.add.text(x, y, `${this.enemyHP}/${this.enemyMaxHP}`, {
            fontFamily: 'Press Start 2P',
            fontSize: '12px',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.container.add(hpText);
        this.uiElements.enemyHPText = hpText;
    }

    /**
     * Create player display
     */
    createPlayerDisplay(x, y) {
        // Player HP bar background
        const hpBarBg = this.scene.add.rectangle(x, y, 500, 35, 0x333333);
        this.container.add(hpBarBg);
        
        // Player HP bar
        const hpBar = this.scene.add.rectangle(x - 250 + 10, y, 0, 30, 0x00ff00);
        this.container.add(hpBar);
        this.uiElements.playerHPBar = hpBar;
        
        // HP text
        const hpText = this.scene.add.text(x, y, `${Math.floor(this.playerHP)}/${this.playerMaxHP}`, {
            fontFamily: 'Press Start 2P',
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.container.add(hpText);
        this.uiElements.playerHPText = hpText;
        
        // Player label
        const playerLabel = this.scene.add.text(x, y - 30, 'YOU', {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: '#00ff00'
        }).setOrigin(0.5);
        this.container.add(playerLabel);
    }

    /**
     * Create action buttons
     */
    createActionButtons(x, y) {
        // Attack button
        const attackBtn = this.scene.add.rectangle(x - 150, y, 200, 70, 0x4a1a1a);
        attackBtn.setStrokeStyle(3, 0xff4444);
        attackBtn.setInteractive({ useHandCursor: true });
        this.container.add(attackBtn);
        
        const attackText = this.scene.add.text(x - 150, y, 'ATTACK', {
            fontFamily: 'Press Start 2P',
            fontSize: '18px',
            color: '#ff4444'
        }).setOrigin(0.5);
        this.container.add(attackText);
        
        // Defend button
        const defendBtn = this.scene.add.rectangle(x + 150, y, 200, 70, 0x1a3a4a);
        defendBtn.setStrokeStyle(3, 0x4488ff);
        defendBtn.setInteractive({ useHandCursor: true });
        this.container.add(defendBtn);
        
        const defendText = this.scene.add.text(x + 150, y, 'DEFEND', {
            fontFamily: 'Press Start 2P',
            fontSize: '18px',
            color: '#4488ff'
        }).setOrigin(0.5);
        this.container.add(defendText);
        
        // Button interactions
        attackBtn.on('pointerover', () => attackBtn.setFillStyle(0x6a2a2a));
        attackBtn.on('pointerout', () => attackBtn.setFillStyle(0x4a1a1a));
        attackBtn.on('pointerup', () => this.playerAttack());
        
        defendBtn.on('pointerover', () => defendBtn.setFillStyle(0x2a5a6a));
        defendBtn.on('pointerout', () => defendBtn.setFillStyle(0x1a3a4a));
        defendBtn.on('pointerup', () => this.playerDefend());
        
        this.uiElements.attackBtn = attackBtn;
        this.uiElements.defendBtn = defendBtn;
    }

    /**
     * Create skill buttons
     */
    createSkillButtons(x, y) {
        const { playerState } = this.scene;
        
        // Get active skills from player's tree
        if (!this.scene.skillTree) return;
        
        const tree = this.scene.skillTree.getSkillTree();
        const activeSkills = Object.entries(tree.skills)
            .filter(([key, skill]) => skill.active && playerState.unlockedSkills.includes(key));
        
        let btnX = x;
        
        activeSkills.forEach(([key, skill]) => {
            const cooldown = this.scene.skillTree.getSkillCooldown(key);
            const isOnCooldown = cooldown > 0;
            
            const btn = this.scene.add.rectangle(btnX, y, 120, 50, isOnCooldown ? 0x333333 : 0x2a2a4a);
            btn.setStrokeStyle(2, isOnCooldown ? 0x666666 : 0xffd700);
            btn.setInteractive({ useHandCursor: !isOnCooldown });
            this.container.add(btn);
            
            const btnText = this.scene.add.text(btnX, y - 10, skill.name, {
                fontFamily: 'Press Start 2P',
                fontSize: '10px',
                color: isOnCooldown ? '#666666' : '#ffd700'
            }).setOrigin(0.5);
            this.container.add(btnText);
            
            // Cooldown text
            if (isOnCooldown) {
                const cdText = this.scene.add.text(btnX, y + 10, `${Math.ceil(cooldown)}s`, {
                    fontFamily: 'Press Start 2P',
                    fontSize: '12px',
                    color: '#ff6666'
                }).setOrigin(0.5);
                this.container.add(cdText);
            }
            
            btn.on('pointerover', () => {
                if (!isOnCooldown) btn.setFillStyle(0x4a4a6a);
            });
            btn.on('pointerout', () => {
                btn.setFillStyle(isOnCooldown ? 0x333333 : 0x2a2a4a);
            });
            btn.on('pointerup', () => this.useSkill(key));
            
            btnX += 140;
        });
    }

    /**
     * Create auto-attack indicator
     */
    createAttackIndicator(x, y) {
        // Auto-attack progress bar
        const barBg = this.scene.add.rectangle(x, y, 100, 20, 0x333333);
        this.container.add(barBg);
        
        const barFill = this.scene.add.rectangle(x - 50 + 5, y, 0, 15, 0xffaa00);
        this.container.add(barFill);
        this.uiElements.autoAttackBar = barFill;
        
        const label = this.scene.add.text(x, y - 20, 'AUTO-ATTACK', {
            fontFamily: 'Press Start 2P',
            fontSize: '10px',
            color: '#aaaaaa'
        }).setOrigin(0.5);
        this.container.add(label);
    }

    /**
     * Update combat UI elements
     */
    updateCombatUI() {
        // Update player HP bar
        const playerPercent = this.playerHP / this.playerMaxHP;
        this.uiElements.playerHPBar.width = Math.max(0, 480 * playerPercent);
        this.uiElements.playerHPBar.x = this.scene.scale.width / 2 - 240 + this.uiElements.playerHPBar.width / 2;
        this.uiElements.playerHPText.setText(`${Math.floor(this.playerHP)}/${this.playerMaxHP}`);
        
        // Player HP bar color
        if (playerPercent < 0.25) {
            this.uiElements.playerHPBar.setFillStyle(0xff0000);
        } else if (playerPercent < 0.5) {
            this.uiElements.playerHPBar.setFillStyle(0xffaa00);
        } else {
            this.uiElements.playerHPBar.setFillStyle(0x00ff00);
        }
        
        // Update enemy HP bar
        const enemyPercent = this.enemyHP / this.enemyMaxHP;
        this.uiElements.enemyHPBar.width = Math.max(0, 170 * enemyPercent);
        this.uiElements.enemyHPBar.x = this.scene.scale.width / 2 - 85 + this.uiElements.enemyHPBar.width / 2;
        this.uiElements.enemyHPText.setText(`${Math.floor(this.enemyHP)}/${this.enemyMaxHP}`);
    }

    /**
     * Update auto-attack progress
     */
    updateAttackProgress() {
        const now = this.scene.time.now;
        
        // Player auto-attack (every 2 seconds)
        const playerAttackInterval = 2000;
        const timeSincePlayerAttack = now - this.lastPlayerAttack;
        const playerProgress = Math.min(1, timeSincePlayerAttack / playerAttackInterval);
        
        // Update attack bar
        if (this.uiElements.autoAttackBar) {
            this.uiElements.autoAttackBar.width = Math.max(1, 90 * playerProgress);
            this.uiElements.autoAttackBar.x = this.scene.scale.width - 150 - 45 + this.uiElements.autoAttackBar.width / 2;
        }
        
        // Auto-attack when ready
        if (timeSincePlayerAttack >= playerAttackInterval) {
            this.lastPlayerAttack = now;
            this.autoAttack();
        }
        
        // Enemy attack timer
        const timeSinceEnemyAttack = now - this.lastEnemyAttack;
        if (timeSinceEnemyAttack >= this.enemy.attackSpeed) {
            this.lastEnemyAttack = now;
            this.enemyAttack();
        }
    }

    /**
     * Player attacks enemy
     */
    playerAttack() {
        if (!this.isActive) return;
        
        const damage = this.getPlayerDamage();
        this.enemyHP = Math.max(0, this.enemyHP - damage);
        
        // Show damage text
        this.showDamageText(`-${damage}`, this.scene.scale.width / 2, 220, 0xff4444);
        
        // Attack effect
        this.uiElements.enemyName.setScale(1.2);
        this.scene.time.delayedCall(100, () => {
            if (this.uiElements.enemyName) this.uiElements.enemyName.setScale(1);
        });
        
        this.updateCombatUI();
        this.checkCombatEnd();
    }

    /**
     * Player auto-attack
     */
    autoAttack() {
        if (!this.isActive) return;
        
        const damage = Math.floor(this.getPlayerDamage() * 0.75); // Auto is 75% damage
        this.enemyHP = Math.max(0, this.enemyHP - damage);
        
        this.showDamageText(`-${damage}`, this.scene.scale.width / 2, 220, 0xff8844);
        this.updateCombatUI();
        this.checkCombatEnd();
    }

    /**
     * Player defends
     */
    playerDefend() {
        if (!this.isActive) return;
        
        // Defend grants temporary defense boost
        this.activeEffects.defending = true;
        
        // Show defend text
        this.showDamageText('DEFENDING!', this.scene.scale.width / 2, 400, 0x4488ff);
        
        // Remove after 2 seconds
        this.scene.time.delayedCall(2000, () => {
            delete this.activeEffects.defending;
        });
    }

    /**
     * Enemy AI decision-making (called before attack)
     * Reacts to player defending and low HP situations
     */
    enemyTurn() {
        if (!this.isActive || this.enemyHP <= 0) return;
        
        // Get enemy HP percentage
        const hpPercent = this.enemyHP / this.enemyMaxHP;
        
        // AI Decision 1: Check if player is defending
        // If player is defending, enemy might use a different strategy
        if (this.activeEffects.defending) {
            // Player is defending - enemy has reduced effectiveness
            // 30% chance enemy will wait/observe instead of full attack
            if (Math.random() < 0.3) {
                this.showDamageText('Enemy hesitates...', this.scene.scale.width / 2, 350, 0xaaaaaa);
                return 'hesitate';
            }
        }
        
        // AI Decision 2: Low HP - Check for flee behavior
        // Enemies with less than 25% HP might try to flee
        if (hpPercent < 0.25) {
            // Bosses don't flee (they fight to the death)
            if (this.enemy.type !== 'boss') {
                // 40% chance to flee when low HP
                if (Math.random() < 0.4) {
                    this.showDamageText('Enemy tries to flee!', this.scene.scale.width / 2, 350, 0xffaa00);
                    // Instead of attacking, enemy retreats - dealing reduced damage while running
                    this.enemy.isFleeing = true;
                    return 'flee';
                }
            }
        }
        
        // AI Decision 3: High HP enemy might be aggressive
        // If enemy is above 75% HP, 20% chance of power attack
        if (hpPercent > 0.75 && Math.random() < 0.2) {
            this.enemy.powerAttackReady = true;
            return 'powerAttack';
        }
        
        return 'attack';
    }
    
    /**
     * Enemy attacks player
     */
    enemyAttack() {
        if (!this.isActive || this.enemyHP <= 0) return;
        
        // First, make AI decision
        const decision = this.enemyTurn();
        
        // Handle different AI decisions
        if (decision === 'hesitate') {
            // Enemy hesitates - reduced damage this turn
            let damage = Math.floor(this.enemy.damage * 0.3);
            let defense = this.getPlayerDefense();
            damage = Math.floor(damage * (1 - defense));
            this.playerHP = Math.max(0, this.playerHP - damage);
            this.showDamageText(`-${damage}`, this.scene.scale.width / 2, 480, 0xff8800);
            this.updateCombatUI();
            this.checkCombatEnd();
            return;
        }
        
        if (decision === 'flee') {
            // Enemy tries to flee - minimal damage while escaping
            let damage = Math.floor(this.enemy.damage * 0.5);
            let defense = this.getPlayerDefense();
            damage = Math.floor(damage * (1 - defense));
            this.playerHP = Math.max(0, this.playerHP - damage);
            this.showDamageText(`Fleeing! -${damage}`, this.scene.scale.width / 2, 480, 0xffaa00);
            
            // Enemy becomes inactive (flees combat)
            this.enemyHP = 0; // Trigger victory
            this.updateCombatUI();
            this.checkCombatEnd();
            return;
        }
        
        let damage = this.enemy.damage;
        
        // Power attack if ready
        if (this.enemy.powerAttackReady) {
            damage = Math.floor(damage * 1.5);
            this.showDamageText('POWER ATTACK!', this.scene.scale.width / 2, 300, 0xff0000);
            this.enemy.powerAttackReady = false;
        }
        
        // Check for boss special attacks
        if (this.enemy.isBoss && this.enemy.specialAttacks) {
            const hpRatio = this.enemyHP / this.enemyMaxHP;
            const specialAttacks = this.enemy.specialAttacks;
            
            // Check for enrage (triggers at hpThreshold)
            if (specialAttacks.enrage && hpRatio <= specialAttacks.enrage.hpThreshold && !this.enemy.enraged) {
                if (Math.random() < specialAttacks.enrage.chance) {
                    this.enemy.enraged = true;
                    this.enemy.damage = Math.floor(this.enemy.damage * (1 + specialAttacks.enrage.damageBoost));
                    this.showDamageText(specialAttacks.enrage.message, this.scene.scale.width / 2, 350, 0xff8800);
                    // Remove enrage after duration
                    this.scene.time.delayedCall(specialAttacks.enrage.duration, () => {
                        if (this.enemy) {
                            this.enemy.enraged = false;
                            this.enemy.damage = this.enemy.damage / (1 + specialAttacks.enrage.damageBoost);
                        }
                    });
                }
            }
            
            // Check for summon (triggers at hpThreshold)
            if (specialAttacks.summon && hpRatio <= specialAttacks.summon.hpThreshold && !this.enemy.summoned) {
                if (Math.random() < specialAttacks.summon.chance) {
                    this.enemy.summoned = true;
                    this.showDamageText(specialAttacks.summon.message, this.scene.scale.width / 2, 320, 0xff4444);
                    // Show that backup is coming - visual effect
                    this.scene.cameras.main.shake(200, 0.02);
                    // Could spawn additional enemy if we had that capability
                }
            }
            
            // Check for area attack (random chance each attack)
            if (specialAttacks.areaAttack && Math.random() < specialAttacks.areaAttack.chance) {
                damage = Math.floor(damage * specialAttacks.areaAttack.damageMultiplier);
                this.showDamageText(specialAttacks.areaAttack.message, this.scene.scale.width / 2, 280, 0xff0000);
                // Extra screen shake for area attack
                this.scene.cameras.main.shake(150, 0.015);
            }
        }
        
        // Apply player defense
        let defense = this.getPlayerDefense();
        if (this.activeEffects.defending) {
            defense = Math.min(0.9, defense + 0.3); // Extra 30% when defending
        }
        
        damage = Math.floor(damage * (1 - defense));
        
        // Minimum 1 damage to prevent immortality with berserk+unbreakable combo
        if (this.activeEffects.berserk && this.scene.skillTree?.hasSkill('unbreakable')) {
            damage = Math.max(1, damage);
        }
        
        // Apply damage to player
        this.playerHP = Math.max(0, this.playerHP - damage);
        
        // Show damage text
        this.showDamageText(`-${damage}`, this.scene.scale.width / 2, 480, 0xff0000);
        
        // Screen shake effect
        this.scene.cameras.main.shake(100, 0.01);
        
        this.updateCombatUI();
        this.checkCombatEnd();
    }

    /**
     * Use a combat skill
     * @param {string} skillKey - Skill to use
     */
    useSkill(skillKey) {
        if (!this.isActive) return;
        
        const result = this.scene.skillTree.activateSkill(skillKey, this);
        
        if (!result.success) {
            this.showDamageText(result.reason, this.scene.scale.width / 2, 400, 0xffaa00);
            return;
        }
        
        const skill = result.skill;
        
        // Apply skill effects
        switch (skillKey) {
            case 'intimidate':
                // 50% chance to make enemy flee
                if (Math.random() < 0.5) {
                    this.showDamageText('ENEMY FLED!', this.scene.scale.width / 2, 300, 0x00ff00);
                    this.enemyHP = 0;
                } else {
                    this.showDamageText('Intimidate failed!', this.scene.scale.width / 2, 300, 0xffaa00);
                }
                break;
                
            case 'shadow_walk':
                // 5 seconds invisibility
                this.activeEffects.invisible = true;
                this.showDamageText('INVISIBLE!', this.scene.scale.width / 2, 400, 0x8888ff);
                this.scene.time.delayedCall(5000, () => {
                    delete this.activeEffects.invisible;
                });
                break;
                
            case 'power_strike':
                // 2x damage attack
                const damage = this.getPlayerDamage() * 2;
                this.enemyHP = Math.max(0, this.enemyHP - damage);
                this.showDamageText(`-${damage}!`, this.scene.scale.width / 2, 220, 0xff4444);
                break;
                
            case 'berserk':
                // 8 seconds of 2x damage, cannot be killed (but takes minimum 1 damage)
                this.activeEffects.berserk = true;
                this.showDamageText('BERSERK! (8s)', this.scene.scale.width / 2, 400, 0xff0000);
                
                // Warning at 2 seconds remaining
                this.scene.time.delayedCall(6000, () => {
                    if (this.activeEffects.berserk) {
                        this.showDamageText('BERSERK ENDING!', this.scene.scale.width / 2, 350, 0xffaa00);
                    }
                });
                
                this.scene.time.delayedCall(8000, () => {
                    delete this.activeEffects.berserk;
                });
                break;
                
            case 'game_of_chance':
                // Double or nothing
                if (Math.random() < 0.5) {
                    // Win: 2x damage
                    const damage = this.getPlayerDamage() * 2;
                    this.enemyHP = Math.max(0, this.enemyHP - damage);
                    this.showDamageText('LUCKY! -' + damage, this.scene.scale.width / 2, 220, 0xffd700);
                } else {
                    // Lose: take extra damage
                    const extraDamage = Math.floor(this.enemy.damage * 0.5);
                    this.playerHP = Math.max(0, this.playerHP - extraDamage);
                    this.showDamageText('BAD LUCK! +' + extraDamage, this.scene.scale.width / 2, 480, 0xff0000);
                }
                break;
        }
        
        // Refresh skill buttons
        this.refreshSkillButtons();
        
        this.updateCombatUI();
        this.checkCombatEnd();
    }

    /**
     * Refresh skill button cooldowns
     */
    refreshSkillButtons() {
        // Remove old skill buttons
        if (this.container) {
            this.container.list
                .filter(el => el.type === 'rectangle' && el.y > this.scene.scale.height - 200)
                .forEach(el => el.destroy());
        }
        
        // Recreate skill buttons
        this.createSkillButtons(100, this.scene.scale.height - 150);
    }

    /**
     * Show floating damage text
     */
    showDamageText(text, x, y, color) {
        const damageText = this.scene.add.text(x, y, text, {
            fontFamily: 'Press Start 2P',
            fontSize: '24px',
            color: '#' + color.toString(16).padStart(6, '0'),
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.container.add(damageText);
        
        // Animate up and fade
        this.scene.tweens.add({
            targets: damageText,
            y: y - 50,
            alpha: 0,
            duration: 1000,
            onComplete: () => damageText.destroy()
        });
    }

    /**
     * Check if combat has ended
     */
    checkCombatEnd() {
        // Check victory
        if (this.enemyHP <= 0) {
            this.victory();
            return;
        }
        
        // Check defeat
        if (this.playerHP <= 0) {
            this.defeat();
            return;
        }
    }

    /**
     * Handle victory
     */
    victory() {
        this.isActive = false;
        
        // Grant XP
        const leveledUp = this.scene.levelSystem?.grantBattleXP(this.enemy);
        
        // Show victory screen
        const { width, height } = this.scene.scale;
        
        // Victory overlay
        const victoryContainer = this.scene.add.container(0, 0).setScrollFactor(0).setDepth(2001);
        
        const overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
        victoryContainer.add(overlay);
        
        const panel = this.scene.add.rectangle(width / 2, height / 2, 500, 300, 0x1a2a1a);
        panel.setStrokeStyle(4, 0x00ff00);
        victoryContainer.add(panel);
        
        const title = this.scene.add.text(width / 2, height / 2 - 80, 'VICTORY!', {
            fontFamily: 'Press Start 2P',
            fontSize: '48px',
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        victoryContainer.add(title);
        
        const detailText = this.scene.add.text(width / 2, height / 2, 
            `Enemy defeated: ${this.enemy.name}\nXP Gained: ${this.enemy.xpValue}${leveledUp ? '\nLEVEL UP!' : ''}`, {
            fontFamily: 'Press Start 2P',
            fontSize: '16px',
            color: '#ffffff',
            align: 'center',
            lineSpacing: 8
        }).setOrigin(0.5);
        victoryContainer.add(detailText);
        
        // Continue button
        const btn = this.scene.add.rectangle(width / 2, height / 2 + 100, 200, 50, 0x2a4a2a);
        btn.setStrokeStyle(2, 0x00ff00);
        btn.setInteractive({ useHandCursor: true });
        victoryContainer.add(btn);
        
        const btnText = this.scene.add.text(width / 2, height / 2 + 100, 'CONTINUE', {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5);
        victoryContainer.add(btnText);
        
        btn.on('pointerover', () => btn.setFillStyle(0x4a6a4a));
        btn.on('pointerout', () => btn.setFillStyle(0x2a4a2a));
        btn.on('pointerup', () => {
            victoryContainer.destroy();
            this.close();
            if (this.onVictory) this.onVictory(true);
        });
        
        // Auto close after 5 seconds
        this.scene.time.delayedCall(5000, () => {
            if (victoryContainer) {
                victoryContainer.destroy();
                this.close();
                if (this.onVictory) this.onVictory(true);
            }
        });
    }

    /**
     * Handle defeat
     */
    defeat() {
        this.isActive = false;
        
        // Show defeat screen
        const { width, height } = this.scene.scale;
        
        const defeatContainer = this.scene.add.container(0, 0).setScrollFactor(0).setDepth(2001);
        
        const overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
        defeatContainer.add(overlay);
        
        const panel = this.scene.add.rectangle(width / 2, height / 2, 500, 300, 0x2a1a1a);
        panel.setStrokeStyle(4, 0xff0000);
        defeatContainer.add(panel);
        
        const title = this.scene.add.text(width / 2, height / 2 - 80, 'DEFEATED', {
            fontFamily: 'Press Start 2P',
            fontSize: '48px',
            color: '#ff0000',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        defeatContainer.add(title);
        
        const detailText = this.scene.add.text(width / 2, height / 2,
            `You were beaten by\n${this.enemy.name}`, {
            fontFamily: 'Press Start 2P',
            fontSize: '16px',
            color: '#ffffff',
            align: 'center',
            lineSpacing: 8
        }).setOrigin(0.5);
        defeatContainer.add(detailText);
        
        // Continue button
        const btn = this.scene.add.rectangle(width / 2, height / 2 + 100, 200, 50, 0x4a2a2a);
        btn.setStrokeStyle(2, 0xff4444);
        btn.setInteractive({ useHandCursor: true });
        defeatContainer.add(btn);
        
        const btnText = this.scene.add.text(width / 2, height / 2 + 100, 'CONTINUE', {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5);
        defeatContainer.add(btnText);
        
        btn.on('pointerover', () => btn.setFillStyle(0x6a4a4a));
        btn.on('pointerout', () => btn.setFillStyle(0x4a2a2a));
        btn.on('pointerup', () => {
            defeatContainer.destroy();
            this.close();
            if (this.onDefeat) this.onDefeat(false);
        });
        
        // Auto close after 5 seconds
        this.scene.time.delayedCall(5000, () => {
            if (defeatContainer) {
                defeatContainer.destroy();
                this.close();
                if (this.onDefeat) this.onDefeat(false);
            }
        });
    }

    /**
     * Close combat UI
     */
    close() {
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
        this.isActive = false;
    }

    /**
     * Update loop - called from scene update
     */
    update() {
        if (!this.isActive) return;
        
        this.updateAttackProgress();
        
        // Check Last Stand activation
        if (this.playerHP <= this.playerMaxHP * 0.25 && !this.activeEffects.lastStand) {
            if (this.scene.skillTree?.hasSkill('last_stand')) {
                this.activeEffects.lastStand = true;
                this.showDamageText('LAST STAND!', this.scene.scale.width / 2, 400, 0xffaa00);
            }
        }
        
        // Check Unbreakable (death save)
        if (this.playerHP <= 0 && this.scene.skillTree?.hasSkill('unbreakable')) {
            if (!this.activeEffects.deathSaveUsed) {
                this.activeEffects.deathSaveUsed = true;
                this.playerHP = Math.floor(this.playerMaxHP * 0.25);
                this.showDamageText('UNBREAKABLE!', this.scene.scale.width / 2, 400, 0xffd700);
                this.updateCombatUI();
            }
        }
    }
}
