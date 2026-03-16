/**
 * LevelSystem.js - Experience Points & Leveling System
 * Handles XP gain, leveling up, and stat/ability point allocation
 */

import { CONFIG } from './config.js';

export default class LevelSystem {
    constructor(scene) {
        this.scene = scene;
    }

    /**
     * Initialize level system for new game
     * @param {Object} playerState - Player state object
     */
    initPlayerLevel(playerState) {
        // GUARD: Only initialize if this is a brand new game
        if (playerState.level !== undefined) return;

        playerState.level = 1;
        playerState.xp = 0;
        playerState.xpToNextLevel = this.getXpForLevel(2);
        playerState.abilityPoints = 2; // Starting AP
        playerState.statPoints = 1; // Starting stat points

        // Ensure stats exist
        if (!playerState.stats) {
            playerState.stats = { intuition: 5, ability: 5, luck: 5 };
        }

        playerState.classType = playerState.stats.intuition >= playerState.stats.ability && 
                                playerState.stats.intuition >= playerState.stats.luck ? 'intuition' :
                                playerState.stats.ability >= playerState.stats.intuition &&
                                playerState.stats.ability >= playerState.stats.luck ? 'ability' : 'luck';
    }

    /**
     * Calculate XP needed for a given level
     * Formula: level * 500
     * Level 2 = 1000, Level 3 = 1500, etc.
     * @param {number} level - Target level
     * @returns {number} XP needed
     */
    getXpForLevel(level) {
        return level * 500;
    }

    /**
     * Check if player can level up
     * @returns {boolean}
     */
    canLevelUp() {
        const { playerState } = this.scene;
        return playerState.level < CONFIG.MAX_LEVEL && 
               playerState.xp >= playerState.xpToNextLevel;
    }

    /**
     * Add XP to player and check for level up
     * @param {number} amount - Amount of XP to add
     * @param {string} source - Source of XP (battle, quest, sale)
     */
    addXP(amount, source = 'battle') {
        const { playerState } = this.scene;
        
        // Apply any XP multipliers from skills/bonuses
        let finalAmount = amount;
        
        // Fortune skill (Luck tree tier 3) gives +20% XP
        if (playerState.unlockedSkills && playerState.unlockedSkills.includes('fortune')) {
            finalAmount = Math.floor(finalAmount * 1.2);
        }

        playerState.xp += finalAmount;
        
        // Show XP gain floating text
        this.scene.showFloatingText(`+${finalAmount} XP (${source})`, '#00ff00');

        // Check for level up
        let leveledUp = false;
        while (this.canLevelUp()) {
            this.levelUp();
            leveledUp = true;
        }

        // Update HUD
        if (this.scene.hud) {
            this.scene.hud.update();
        }

        return leveledUp;
    }

    /**
     * Handle player leveling up
     */
    levelUp() {
        const { playerState } = this.scene;
        
        // Increase level
        playerState.level++;
        
        // Calculate XP overflow for next level
        const overflow = playerState.xp - playerState.xpToNextLevel;
        playerState.xp = overflow;
        playerState.xpToNextLevel = this.getXpForLevel(playerState.level + 1);
        
        // Grant ability point and stat point
        playerState.abilityPoints++;
        playerState.statPoints++;
        
        // Show level up notification
        this.showLevelUpNotification();
        
            }

    /**
     * Show level up notification UI
     */
    /**
     * Show interactive level up and stat allocation UI
     */
    showLevelUpNotification() {
        const { width, height } = this.scene.scale;
        const { playerState } = this.scene;
        
        const container = this.scene.add.container(0, 0).setScrollFactor(0).setDepth(3000);
        const overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);
        container.add(overlay);
        
        const panel = this.scene.add.rectangle(width / 2, height / 2, 600, 450, 0x1a1a2e);
        panel.setStrokeStyle(4, 0xffd700);
        container.add(panel);
        
        const title = this.scene.add.text(width / 2, height / 2 - 180, 'LEVEL UP!', {
            fontFamily: 'Press Start 2P', fontSize: '36px', color: '#ffd700', stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5);
        container.add(title);
        
        const levelText = this.scene.add.text(width / 2, height / 2 - 130, `You are now Level ${playerState.level}`, {
            fontFamily: 'Press Start 2P', fontSize: '18px', color: '#ffffff'
        }).setOrigin(0.5);
        container.add(levelText);
        
        const rewardsText = this.scene.add.text(width / 2, height / 2 - 80, '+1 Ability Point\n+1 Stat Point', {
            fontFamily: 'Press Start 2P', fontSize: '14px', color: '#00ff00', align: 'center'
        }).setOrigin(0.5);
        container.add(rewardsText);
        
        // Stat allocation UI
        const stats = ['intuition', 'ability', 'luck'];
        const labels = { intuition: 'INTUITION', ability: 'ABILITY', luck: 'LUCK' };
        const statX = [width / 2 - 120, width / 2, width / 2 + 120];
        
        const updateStats = () => {
            stats.forEach((stat, i) => {
                statTexts[i].setText(`${labels[stat]}: ${playerState.stats[stat]}`);
            });
            pointsText.setText(`Stat Points: ${playerState.statPoints} | AP: ${playerState.abilityPoints}`);
            closeBtn.setAlpha(playerState.statPoints > 0 ? 0.5 : 1);
            closeBtnText.setText(playerState.statPoints > 0 ? 'SPEND FIRST' : 'CONTINUE');
        };
        
        const statTexts = stats.map((stat, i) => {
            return this.scene.add.text(statX[i], height / 2 - 10, `${labels[stat]}: ${playerState.stats[stat]}`, {
                fontFamily: 'Press Start 2P', fontSize: '12px', color: '#88ff88'
            }).setOrigin(0.5);
        });
        
        // + buttons
        stats.forEach((stat, i) => {
            if (playerState.statPoints > 0) {
                const btn = this.scene.add.text(statX[i] + 70, height / 2 - 10, '+', {
                    fontFamily: 'Press Start 2P', fontSize: '16px', color: '#00ff00'
                }).setOrigin(0.5).setInteractive({ useHandCursor: true });
                btn.on('pointerup', () => {
                    if (playerState.statPoints > 0) {
                        playerState.statPoints--;
                        playerState.stats[stat]++;
                        updateStats();
                        if (this.scene.hud) this.scene.hud.update();
                    }
                });
                container.add(btn);
            }
        });
        
        const pointsText = this.scene.add.text(width / 2, height / 2 + 60, `Stat Points: ${playerState.statPoints} | AP: ${playerState.abilityPoints}`, {
            fontFamily: 'Press Start 2P', fontSize: '14px', color: '#ffcc00'
        }).setOrigin(0.5);
        container.add(pointsText);
        
        const closeBtn = this.scene.add.rectangle(width / 2, height / 2 + 140, 200, 50, 0x2a2a4a).setStrokeStyle(2, 0xffd700).setInteractive({ useHandCursor: true });
        container.add(closeBtn);
        
        const closeBtnText = this.scene.add.text(width / 2, height / 2 + 140, playerState.statPoints > 0 ? 'SPEND FIRST' : 'CONTINUE', {
            fontFamily: 'Press Start 2P', fontSize: '14px', color: '#ffffff'
        }).setOrigin(0.5);
        container.add(closeBtnText);
        
        closeBtn.on('pointerup', () => {
            container.destroy();
        });
        
        updateStats();
    }

    /**
     * Grant XP for winning a battle
     * @param {Object} enemy - Enemy that was defeated
     */
    grantBattleXP(enemy) {
        const baseXP = enemy.xpValue || 50;
        
        // Bonus XP based on enemy type
        let multiplier = 1.0;
        if (enemy.type === 'boss') multiplier = 2.0;
        else if (enemy.type === 'enforcer') multiplier = 1.5;
        else if (enemy.type === 'gangster') multiplier = 1.2;
        
        const xpGained = Math.floor(baseXP * multiplier);
        return this.addXP(xpGained, 'battle');
    }

    /**
     * Grant XP for completing a quest
     * @param {Object} quest - Completed quest
     */
    grantQuestXP(quest) {
        const xpGained = quest.xpReward || 100;
        return this.addXP(xpGained, 'quest');
    }

    /**
     * Grant small XP for selling product
     * @param {number} amount - Amount sold
     */
    grantSaleXP(amount) {
        // Small XP per sale: 5 XP per unit
        const xpGained = Math.floor(amount * 5);
        return this.addXP(xpGained, 'sale');
    }

    /**
     * Get current XP progress as percentage
     * @returns {number} Percentage (0-1)
     */
    getXPProgress() {
        const { playerState } = this.scene;
        if (playerState.level >= CONFIG.MAX_LEVEL) return 1;
        return playerState.xp / playerState.xpToNextLevel;
    }

    /**
     * Get player damage modifier based on level
     * @returns {number} Damage multiplier
     */
    getLevelDamageBonus() {
        const { playerState } = this.scene;
        // +5% damage per level
        return 1 + (playerState.level - 1) * 0.05;
    }

    /**
     * Get player HP modifier based on level
     * @returns {number} Max HP bonus
     */
    getLevelHPBonus() {
        const { playerState } = this.scene;
        // +10 HP per level
        return (playerState.level - 1) * 10;
    }
}
