/**
 * Achievements.js - Achievement system for TRAP game
 * Tracks player progress and rewards achievements
 * 
 * ACHIEVEMENTS:
 * - First Sale: Sell your first product
 * - Getting Started: Earn $1,000 total
 * - Established: Earn $10,000 total
 * - Big Money: Earn $100,000 total
 * - First Blood: Win first combat
 * - Survivor: Win 10 combats
 * - Neighborhood Hero: Visit all 8 neighborhoods
 * - Connected: Meet all 12 suppliers
 * - Heat Wave: Reach 100 heat and escape
 */

import { EventBus, EVENTS } from './EventBus.js';
import { CONFIG } from './config.js';

// Achievement definitions
export const ACHIEVEMENTS = {
    // Sales/Money achievements
    FIRST_SALE: {
        id: 'FIRST_SALE',
        name: 'First Sale',
        description: 'Sell your first product',
        icon: '💰',
        category: 'sales',
        isUnlocked: () => false // Checked via tracking
    },
    GETTING_STARTED: {
        id: 'GETTING_STARTED',
        name: 'Getting Started',
        description: 'Earn $1,000 total',
        icon: '📈',
        category: 'sales',
        isUnlocked: (stats) => stats.totalMoney >= 1000
    },
    ESTABLISHED: {
        id: 'ESTABLISHED',
        name: 'Established',
        description: 'Earn $10,000 total',
        icon: '💎',
        category: 'sales',
        isUnlocked: (stats) => stats.totalMoney >= 10000
    },
    BIG_MONEY: {
        id: 'BIG_MONEY',
        name: 'Big Money',
        description: 'Earn $100,000 total',
        icon: '🤑',
        category: 'sales',
        isUnlocked: (stats) => stats.totalMoney >= 100000
    },
    
    // Combat achievements
    FIRST_BLOOD: {
        id: 'FIRST_BLOOD',
        name: 'First Blood',
        description: 'Win your first combat',
        icon: '⚔️',
        category: 'combat',
        isUnlocked: (stats) => stats.combatsWon >= 1
    },
    SURVIVOR: {
        id: 'SURVIVOR',
        name: 'Survivor',
        description: 'Win 10 combats',
        icon: '🏆',
        category: 'combat',
        isUnlocked: (stats) => stats.combatsWon >= 10
    },
    
    // Exploration achievements
    NEIGHBORHOOD_HERO: {
        id: 'NEIGHBORHOOD_HERO',
        name: 'Neighborhood Hero',
        description: 'Visit all 8 neighborhoods',
        icon: '🗺️',
        category: 'exploration',
        isUnlocked: (stats) => stats.visitedNeighborhoods && stats.visitedNeighborhoods.length >= 8
    },
    
    // Social achievements
    CONNECTED: {
        id: 'CONNECTED',
        name: 'Connected',
        description: 'Meet all 12 suppliers',
        icon: '🤝',
        category: 'social',
        isUnlocked: (stats) => stats.metSuppliers && stats.metSuppliers.length >= 12
    },
    
    // Risk achievements
    HEAT_WAVE: {
        id: 'HEAT_WAVE',
        name: 'Heat Wave',
        description: 'Reach 100 heat and escape',
        icon: '🔥',
        category: 'risk',
        isUnlocked: (stats) => stats.escapedMaxHeat === true
    },
    
    // Items achievement
    GEAR_UP: {
        id: 'GEAR_UP',
        name: 'Gear Up',
        description: 'Purchase 10 pieces of equipment',
        icon: '🎒',
        category: 'items',
        isUnlocked: (stats) => stats.itemsPurchased >= 10
    }
};

// Trackable stats for achievements
export const ACHIEVEMENT_STATS = {
    totalMoney: 0,           // Lifetime earnings
    totalSales: 0,           // Number of products sold
    combatsWon: 0,           // Number of combats won
    visitedNeighborhoods: [], // Array of neighborhood keys
    metSuppliers: [],        // Array of supplier IDs met
    escapedMaxHeat: false,   // Whether player escaped at 100 heat
    itemsPurchased: 0        // Number of equipment items bought
};

export default class Achievements {
    constructor(scene) {
        this.scene = scene;
        this.unlockedAchievements = new Set();
        this.stats = { ...ACHIEVEMENT_STATS };
        this.popup = null;
        this.popupQueue = [];
        this.isPopupVisible = false;
        
        // Track achievement progress
        this.setupEventListeners();
    }
    
    /**
     * Setup event listeners for achievement tracking
     */
    setupEventListeners() {
        // Money earned - track lifetime earnings
        EventBus.on(EVENTS.PLAYER_MONEY_CHANGED, (data) => {
            if (data.amount > 0) {
                this.stats.totalMoney += data.amount;
                this.checkAchievements();
            }
        });
        
        // Track sales
        EventBus.on('achievement:trackSale', () => {
            this.stats.totalSales++;
            if (this.stats.totalSales === 1) {
                // First sale achievement
                this.unlockAchievement('FIRST_SALE');
            }
            this.checkAchievements();
        });
        
        // Track combat wins
        EventBus.on(EVENTS.ENEMY_DEFEATED, (data) => {
            // This fires when any enemy is defeated
            // We need to track when player actually wins combat
        });
        
        EventBus.on(EVENTS.COMBAT_ENDED, (data) => {
            if (data.victory) {
                this.stats.combatsWon++;
                if (this.stats.combatsWon === 1) {
                    this.unlockAchievement('FIRST_BLOOD');
                }
                this.checkAchievements();
            }
        });
        
        // Track neighborhood visits
        EventBus.on(EVENTS.PLAYER_NEIGHBORHOOD_CHANGED, (data) => {
            const neighborhood = data.neighborhood;
            if (neighborhood && !this.stats.visitedNeighborhoods.includes(neighborhood)) {
                this.stats.visitedNeighborhoods.push(neighborhood);
                this.checkAchievements();
            }
        });
        
        // Track supplier meetings
        EventBus.on('achievement:metSupplier', (data) => {
            const supplierId = data.supplierId;
            if (supplierId && !this.stats.metSuppliers.includes(supplierId)) {
                this.stats.metSuppliers.push(supplierId);
                this.checkAchievements();
            }
        });
        
        // Track escaping at max heat
        EventBus.on('achievement:escapedHeat', () => {
            // Check if current heat is at or near max when escaping police
            if (this.scene.playerState.heat >= 100) {
                this.stats.escapedMaxHeat = true;
                this.unlockAchievement('HEAT_WAVE');
            }
        });
        
        // Track equipment purchases
        EventBus.on('achievement:purchasedEquipment', () => {
            this.stats.itemsPurchased++;
            this.checkAchievements();
        });
    }
    
    /**
     * Check all achievements and unlock any that are now valid
     */
    checkAchievements() {
        Object.values(ACHIEVEMENTS).forEach(achievement => {
            if (!this.unlockedAchievements.has(achievement.id)) {
                if (achievement.isUnlocked(this.stats)) {
                    this.unlockAchievement(achievement.id);
                }
            }
        });
    }
    
    /**
     * Unlock a specific achievement
     * @param {string} achievementId - The ID of the achievement to unlock
     */
    unlockAchievement(achievementId) {
        const achievement = ACHIEVEMENTS[achievementId];
        if (!achievement || this.unlockedAchievements.has(achievementId)) {
            return;
        }
        
        // Mark as unlocked
        this.unlockedAchievements.add(achievementId);
        
        // Show popup
        this.showAchievementPopup(achievement);
        
        // Emit event for other systems
        EventBus.emit(EVENTS.NOTIFICATION_SHOWN, {
            type: 'achievement',
            achievement: achievement
        });
        
            }
    
    /**
     * Show achievement unlock popup
     * @param {Object} achievement - The achievement that was unlocked
     */
    showAchievementPopup(achievement) {
        // Add to queue if popup is already showing
        if (this.isPopupVisible) {
            this.popupQueue.push(achievement);
            return;
        }
        
        this.isPopupVisible = true;
        
        const { width, height } = this.scene.scale;
        
        // Create popup container
        this.popup = this.scene.add.container(width / 2, height / 2 - 100);
        this.popup.setScrollFactor(0);
        this.popup.setDepth(2000);
        
        // Background
        const bg = this.scene.add.rectangle(0, 0, 500, 120, 0x000000, 0.9);
        bg.setStrokeStyle(4, 0xffd700);
        this.popup.add(bg);
        
        // Achievement icon
        const icon = this.scene.add.text(-200, 0, achievement.icon, {
            fontSize: '48px'
        }).setOrigin(0.5);
        this.popup.add(icon);
        
        // "Achievement Unlocked" text
        const title = this.scene.add.text(0, -30, 'ACHIEVEMENT UNLOCKED!', {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: '#ffd700'
        }).setOrigin(0.5);
        this.popup.add(title);
        
        // Achievement name
        const name = this.scene.add.text(0, 0, achievement.name, {
            fontFamily: 'Press Start 2P',
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.popup.add(name);
        
        // Achievement description
        const desc = this.scene.add.text(0, 25, achievement.description, {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#aaaaaa'
        }).setOrigin(0.5);
        this.popup.add(desc);
        
        // Initial position (off-screen top)
        this.popup.y = -200;
        
        // Animate in
        this.scene.tweens.add({
            targets: this.popup,
            y: height / 2 - 100,
            duration: 500,
            ease: 'Back.easeOut',
            onComplete: () => {
                // Auto-dismiss after 4 seconds
                this.scene.time.delayedCall(4000, () => {
                    this.dismissPopup();
                });
            }
        });
        
        // Flash effect on HUD
        this.scene.tweens.add({
            targets: this.scene.hud?.hudBg,
            alpha: 0.5,
            duration: 200,
            yoyo: true,
            repeat: 2
        });
    }
    
    /**
     * Dismiss the current popup and show next in queue
     */
    dismissPopup() {
        if (!this.popup) return;
        
        // Animate out
        this.scene.tweens.add({
            targets: this.popup,
            y: -200,
            alpha: 0,
            duration: 300,
            ease: 'Cubic.easeIn',
            onComplete: () => {
                if (this.popup) {
                    this.popup.destroy();
                    this.popup = null;
                }
                
                this.isPopupVisible = false;
                
                // Show next popup in queue
                if (this.popupQueue.length > 0) {
                    const nextAchievement = this.popupQueue.shift();
                    this.showAchievementPopup(nextAchievement);
                }
            }
        });
    }
    
    /**
     * Get all unlocked achievements
     * @returns {Array} Array of unlocked achievement objects
     */
    getUnlockedAchievements() {
        return Array.from(this.unlockedAchievements).map(id => ACHIEVEMENTS[id]);
    }
    
    /**
     * Get all achievements with their unlock status
     * @returns {Array} Array of all achievements with unlocked status
     */
    getAllAchievements() {
        return Object.values(ACHIEVEMENTS).map(achievement => ({
            ...achievement,
            unlocked: this.unlockedAchievements.has(achievement.id)
        }));
    }
    
    /**
     * Check if a specific achievement is unlocked
     * @param {string} achievementId - The achievement ID to check
     * @returns {boolean} Whether the achievement is unlocked
     */
    isUnlocked(achievementId) {
        return this.unlockedAchievements.has(achievementId);
    }
    
    /**
     * Get achievement progress for UI display
     * @param {string} achievementId - The achievement ID
     * @returns {Object} Progress object with current and target values
     */
    getProgress(achievementId) {
        const achievement = ACHIEVEMENTS[achievementId];
        if (!achievement) return null;
        
        let progress = { current: 0, target: 1, percentage: 0 };
        
        switch (achievementId) {
            case 'GETTING_STARTED':
                progress = { 
                    current: this.stats.totalMoney, 
                    target: 1000, 
                    percentage: Math.min(100, (this.stats.totalMoney / 1000) * 100) 
                };
                break;
            case 'ESTABLISHED':
                progress = { 
                    current: this.stats.totalMoney, 
                    target: 10000, 
                    percentage: Math.min(100, (this.stats.totalMoney / 10000) * 100) 
                };
                break;
            case 'BIG_MONEY':
                progress = { 
                    current: this.stats.totalMoney, 
                    target: 100000, 
                    percentage: Math.min(100, (this.stats.totalMoney / 100000) * 100) 
                };
                break;
            case 'SURVIVOR':
                progress = { 
                    current: this.stats.combatsWon, 
                    target: 10, 
                    percentage: Math.min(100, (this.stats.combatsWon / 10) * 100) 
                };
                break;
            case 'NEIGHBORHOOD_HERO':
                progress = { 
                    current: this.stats.visitedNeighborhoods.length, 
                    target: 8, 
                    percentage: Math.min(100, (this.stats.visitedNeighborhoods.length / 8) * 100) 
                };
                break;
            case 'CONNECTED':
                progress = { 
                    current: this.stats.metSuppliers.length, 
                    target: 12, 
                    percentage: Math.min(100, (this.stats.metSuppliers.length / 12) * 100) 
                };
                break;
            case 'GEAR_UP':
                progress = { 
                    current: this.stats.itemsPurchased, 
                    target: 10, 
                    percentage: Math.min(100, (this.stats.itemsPurchased / 10) * 100) 
                };
                break;
        }
        
        return progress;
    }
    
    /**
     * Load achievement state from save data
     * @param {Object} saveData - Save data object
     */
    loadFromSave(saveData) {
        if (saveData.achievements) {
            if (saveData.achievements.unlocked) {
                this.unlockedAchievements = new Set(saveData.achievements.unlocked);
            }
            if (saveData.achievements.stats) {
                this.stats = { ...this.stats, ...saveData.achievements.stats };
            }
        }
    }
    
    /**
     * Get save data for achievements
     * @returns {Object} Achievement save data
     */
    getSaveData() {
        return {
            unlocked: Array.from(this.unlockedAchievements),
            stats: { ...this.stats }
        };
    }
    
    /**
     * Reset all achievements (for new game)
     */
    reset() {
        this.unlockedAchievements.clear();
        this.stats = { ...ACHIEVEMENT_STATS };
    }
}

/**
 * Helper function to emit sales event (call when player sells product)
 */
export function trackSale() {
    EventBus.emit('achievement:trackSale');
}

/**
 * Helper function to emit supplier meeting event
 */
export function trackSupplierMeeting(supplierId) {
    EventBus.emit('achievement:metSupplier', { supplierId });
}

/**
 * Helper function to emit heat escape event
 */
export function trackHeatEscape() {
    EventBus.emit('achievement:escapedHeat');
}

/**
 * Helper function to emit equipment purchase event
 */
export function trackEquipmentPurchase() {
    EventBus.emit('achievement:purchasedEquipment');
}