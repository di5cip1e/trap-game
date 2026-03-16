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
        
        const panel = this.scene.add.rectangle(width / 2, height / 2, 600, 500, 0x1a1a2e);
        panel.setStrokeStyle(4, 0xffd700);
        container.add(panel);
        
        const title = this.scene.add.text(width / 2, height / 2 - 200, 'LEVEL UP!', {
            fontFamily: 'Press Start 2P', fontSize: '36px', color: '#ffd700', stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5);
        container.add(title);
        
        const levelText = this.scene.add.text(width / 2, height / 2 - 150, `You are now Level ${playerState.level}`, {
            fontFamily: 'Press Start 2P', fontSize: '18px', color: '#ffffff'
        }).setOrigin(0.5);
        container.add(levelText);
        
        // Display Points Available
        const pointsDisplay = this.scene.add.text(width / 2, height / 2 - 100, 
            `Stat Points Available: ${playerState.statPoints}\nAbility Points (AP): ${playerState.abilityPoints}`, {
            fontFamily: 'Press Start 2P', fontSize: '14px', color: '#00ff88', align: 'center', lineSpacing: 8
        }).setOrigin(0.5);
        container.add(pointsDisplay);

        // --- STAT ALLOCATION ROW GENERATOR ---
        let startY = height / 2 - 30;
        const stats = [
            { key: 'intuition', name: 'INTUITION', color: '#4488ff', desc: 'Stealth & Awareness' },
            { key: 'ability', name: 'ABILITY', color: '#ff4444', desc: 'Combat & Speed' },
            { key: 'luck', name: 'LUCK', color: '#ffcc00', desc: 'Prices & RNG' }
        ];

        const statTexts = {}; // Store references to update numbers dynamically

        stats.forEach((stat, index) => {
            const y = startY + (index * 60);
            
            // Stat Name & Desc
            const nameText = this.scene.add.text(width / 2 - 180, y, stat.name, {
                fontFamily: 'Press Start 2P', fontSize: '14px', color: stat.color
            }).setOrigin(0, 0.5);
            
            const descText = this.scene.add.text(width / 2 - 180, y + 18, stat.desc, {
                fontFamily: 'Press Start 2P', fontSize: '8px', color: '#888888'
            }).setOrigin(0, 0.5);
            
            // Current Stat Value
            statTexts[stat.key] = this.scene.add.text(width / 2 + 50, y, `${playerState.stats[stat.key]}`, {
                fontFamily: 'Press Start 2P', fontSize: '18px', color: '#ffffff'
            }).setOrigin(0.5);

            // [+] Button
            const plusBtn = this.scene.add.rectangle(width / 2 + 130, y, 40, 40, 0x2a4a2a).setStrokeStyle(2, 0x00ff00).setInteractive({ useHandCursor: true });
            const plusText = this.scene.add.text(width / 2 + 130, y, '+', {
                fontFamily: 'Press Start 2P', fontSize: '20px', color: '#00ff00'
            }).setOrigin(0.5);

            plusBtn.on('pointerdown', () => {
                if (playerState.statPoints > 0 && playerState.stats[stat.key] < 100) {
                    playerState.statPoints--;
                    playerState.stats[stat.key]++;
                    
                    // Update Text
                    statTexts[stat.key].setText(`${playerState.stats[stat.key]}`);
                    pointsDisplay.setText(`Stat Points Available: ${playerState.statPoints}\nAbility Points (AP): ${playerState.abilityPoints}`);
                    
                    // Visual feedback
                    this.scene.tweens.add({ targets: statTexts[stat.key], scale: 1.5, yoyo: true, duration: 150 });
                } else if (playerState.statPoints <= 0) {
                    this.scene.showFloatingText('No Stat Points left!', '#ff0000');
                } else {
                    this.scene.showFloatingText('Stat is maxed out!', '#ffaa00');
                }
            });

            container.add([nameText, descText, statTexts[stat.key], plusBtn, plusText]);
        });
        
        // Continue / Close button
        const btnBg = this.scene.add.rectangle(width / 2, height / 2 + 160, 250, 50, 0x2a2a4a).setStrokeStyle(2, 0xffd700).setInteractive({ useHandCursor: true });
        const btnText = this.scene.add.text(width / 2, height / 2 + 160, 'FINISH & CONTINUE', {
            fontFamily: 'Press Start 2P', fontSize: '14px', color: '#ffffff'
        }).setOrigin(0.5);
        container.add([btnBg, btnText]);
        
        btnBg.on('pointerover', () => btnBg.setFillStyle(0x3a3a5a));
        btnBg.on('pointerout', () => btnBg.setFillStyle(0x2a2a4a));
        btnBg.on('pointerup', () => {
            container.destroy();
            if (this.scene.hud) this.scene.hud.update();
        });
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
