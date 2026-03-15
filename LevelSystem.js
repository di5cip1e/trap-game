/**
 * LevelSystem.js - Experience Points & Leveling System
 * Handles XP gain, leveling up, and stat/ability point allocation
 */

import { CONFIG } from './config.js';
import { NEIGHBORHOODS } from './MapGenerator.js';
import MapController from './MapController.js';

export default class LevelSystem {
    constructor(scene) {
        this.scene = scene;
    }

    /**
     * Initialize level system for new game
     * @param {Object} playerState - Player state object
     */
    initPlayerLevel(playerState) {
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
     * Curve: 350 base, increases 12% per level (slightly faster for better pacing)
     * Level 2 = 392, Level 5 = 616, Level 10 = 1,094, Level 20 = 3,406
     * @param {number} level - Target level
     * @returns {number} XP needed
     */
    getXpForLevel(level) {
        return Math.floor(350 * Math.pow(1.12, level - 1));
    }

    /**
     * Check if player can level up
     * @returns {boolean}
     */
    canLevelUp() {
        const { playerState } = this.scene;
        
        // Ensure playerState and required properties exist
        if (!playerState || playerState.level == null || playerState.xp == null || playerState.xpToNextLevel == null) {
            return false;
        }
        
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
        
        // Check and unlock new neighborhoods based on level
        this.checkNeighborhoodUnlocks();
        
        // Show level up notification
        this.showLevelUpNotification();
    }
    
    /**
     * Check if player qualifies to unlock any new neighborhoods
     * and show notification for newly unlocked areas
     */
    checkNeighborhoodUnlocks() {
        const { playerState } = this.scene;
        
        // Import the unlock requirements
        const unlockRequirements = MapController.UNLOCK_REQUIREMENTS;
        const newlyUnlocked = [];
        
        // Check each neighborhood's unlock requirements
        for (const [neighborhood, requirements] of Object.entries(unlockRequirements)) {
            // Skip if already unlocked
            if (playerState.unlockedNeighborhoods.includes(neighborhood)) continue;
            
            // Check if player meets level requirement
            if (playerState.level >= requirements.minLevel) {
                playerState.unlockedNeighborhoods.push(neighborhood);
                newlyUnlocked.push({
                    key: neighborhood,
                    name: requirements.dangerLevel ? 
                        `${NEIGHBORHOODS[neighborhood]?.name || neighborhood}` : 
                        neighborhood,
                    dangerLevel: requirements.dangerLevel
                });
            }
        }
        
        // Show notification for newly unlocked neighborhoods
        if (newlyUnlocked.length > 0) {
            this.showNeighborhoodUnlockNotification(newlyUnlocked);
        }
    }
    
    /**
     * Show notification when new neighborhoods are unlocked
     * @param {Array} newlyUnlocked - Array of unlocked neighborhood objects
     */
    showNeighborhoodUnlockNotification(newlyUnlocked) {
        const { width, height } = this.scene.scale;
        const { playerState } = this.scene;
        
        // Create notification container
        const container = this.scene.add.container(0, 0).setScrollFactor(0).setDepth(3000);
        
        // Overlay
        const overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.5);
        container.add(overlay);
        
        // Calculate panel size based on number of unlocks
        const panelHeight = 200 + (newlyUnlocked.length * 60);
        const panel = this.scene.add.rectangle(width / 2, height / 2 - 25, 500, panelHeight, 0x1a1a2e);
        panel.setStrokeStyle(3, 0x00ff88);
        container.add(panel);
        
        // Title
        const title = this.scene.add.text(width / 2, height / 2 - 80, 'AREAS UNLOCKED!', {
            fontFamily: 'Press Start 2P',
            fontSize: '20px',
            color: '#00ff88'
        }).setOrigin(0.5);
        container.add(title);
        
        // List unlocked neighborhoods
        let yOffset = height / 2 - 30;
        newlyUnlocked.forEach(area => {
            const hood = NEIGHBORHOODS[area.key];
            const name = hood?.name || area.key;
            const danger = hood?.dangerLevel || area.dangerLevel || '?';
            const dangerColor = danger <= 2 ? '#00ff00' : danger <= 3 ? '#ffff00' : '#ff6600';
            
            const text = this.scene.add.text(width / 2, yOffset, 
                `${name} (Danger: ${danger})`, {
                fontFamily: 'Press Start 2P',
                fontSize: '14px',
                color: '#ffffff'
            }).setOrigin(0.5);
            container.add(text);
            yOffset += 50;
        });
        
        // Continue instruction
        const continueText = this.scene.add.text(width / 2, height / 2 + panelHeight / 2 - 30, 
            'Press any key to continue', {
            fontFamily: 'Press Start 2P',
            fontSize: '12px',
            color: '#888888'
        }).setOrigin(0.5);
        container.add(continueText);
        
        // Close on any key
        const closeHandler = () => {
            container.destroy();
            this.scene.input.keyboard.off('keydown', closeHandler);
        };
        
        this.scene.input.keyboard.once('keydown', closeHandler);
        this.scene.input.on('pointerdown', closeHandler);
    }

    /**
     * Show level up notification UI
     */
    showLevelUpNotification() {
        const { width, height } = this.scene.scale;
        const { playerState } = this.scene;
        
        // Create notification container
        const container = this.scene.add.container(0, 0).setScrollFactor(0).setDepth(3000);
        
        // Overlay
        const overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
        container.add(overlay);
        
        // Level up panel
        const panel = this.scene.add.rectangle(width / 2, height / 2 - 50, 600, 350, 0x1a1a2e);
        panel.setStrokeStyle(4, 0xffd700);
        container.add(panel);
        
        // Title
        const title = this.scene.add.text(width / 2, height / 2 - 150, 'LEVEL UP!', {
            fontFamily: 'Press Start 2P',
            fontSize: '36px',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        container.add(title);
        
        // Level text
        const levelText = this.scene.add.text(width / 2, height / 2 - 100, `Level ${playerState.level}`, {
            fontFamily: 'Press Start 2P',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);
        container.add(levelText);
        
        // Rewards
        const rewardsText = this.scene.add.text(width / 2, height / 2 - 40, 
            `+1 Ability Point\n+1 Stat Point`, {
            fontFamily: 'Press Start 2P',
            fontSize: '16px',
            color: '#00ff00',
            align: 'center',
            lineSpacing: 8
        }).setOrigin(0.5);
        container.add(rewardsText);
        
        // Current points
        const pointsText = this.scene.add.text(width / 2, height / 2 + 40,
            `AP: ${playerState.abilityPoints} | SP: ${playerState.statPoints}`, {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: '#ffcc00'
        }).setOrigin(0.5);
        container.add(pointsText);
        
        // Continue button
        const btnBg = this.scene.add.rectangle(width / 2, height / 2 + 100, 200, 50, 0x2a2a4a);
        btnBg.setStrokeStyle(2, 0xffd700);
        btnBg.setInteractive({ useHandCursor: true });
        container.add(btnBg);
        
        const btnText = this.scene.add.text(width / 2, height / 2 + 100, 'CONTINUE', {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5);
        container.add(btnText);
        
        btnBg.on('pointerover', () => btnBg.setFillStyle(0x3a3a5a));
        btnBg.on('pointerout', () => btnBg.setFillStyle(0x2a2a4a));
        btnBg.on('pointerup', () => {
            container.destroy();
        });
        
        // Auto close after 5 seconds
        this.scene.time.delayedCall(5000, () => {
            if (container) container.destroy();
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
