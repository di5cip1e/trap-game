/**
 * RiversidePolice.js - Police definitions, schedules, suspicion system, and raid events
 * Small-town law enforcement that gradually becomes suspicious of the player
 */

import { CONFIG } from './config.js';

// ============================================================
// RIVERSIDE POLICE STATION POI
// ============================================================

export const RIVERSIDE_POLICE_STATION = {
    type: 'service',
    name: 'Riverside Police Station',
    description: "Riverside's small-town police department. Chief Thompson runs a tight ship.",
    tile: 'tile-concrete',
    dangerLevel: 2,
    usable: true,
    locationType: 'police',
    hours: { open: 0, close: 24 }, // 24/7 operation
    isMainPlugQuestHub: false
};

// ============================================================
// RIVERSIDE COP DEFINITIONS
// ============================================================

export const RIVERSIDE_COPS = {
    // Police Chief - runs the station
    'chief-thompson': {
        name: 'Chief Harold Thompson',
        fullName: 'Harold "Hal" Thompson',
        role: 'Police Chief',
        rank: 'Chief',
        appearance: {
            age: 55,
            build: 'heavy',
            features: ['grey hair', 'mutton chops', 'pot belly'],
            uniform: 'navy blue with gold badges'
        },
        personality: {
            disposition: 'authoritarian',
            quirks: ['Old school', 'Trusts intuition', 'Hates paperwork'],
            dialogue: {
                greeting: [
                    "Morning. Anything I can help you with?",
                    "We don't get many visitors at the station. What brings you in?",
                    "Small town, but we keep things under control here."
                ],
                suspicious: [
                    "I've seen you around town a lot lately. Staying out of trouble?",
                    "Some folks have been talking. Nothing specific, just... questions.",
                    "The department gets tips sometimes. Anonymous, you know how it is."
                ],
                warning: [
                    "I'm going to need you to come down to the station for some questioning.",
                    "We've got enough evidence to bring you in. Don't make this harder.",
                    "You have the right to remain silent. Anything you say can and will be used."
                ]
            }
        },
        schedule: {
            // Chief works weekdays 8AM-6PM, sometimes stays late
            default: { x: 3, y: 3 }, // Police station location
            8: { x: 3, y: 3 },
            12: { x: 3, y: 3 },
            18: { x: 3, y: 3 },
            20: { x: 3, y: 3 } // Occasionally stays late
        },
        suspicionThreshold: 80 // When he starts getting really suspicious
    },
    
    // Day shift officer - friendly but observant
    'officer-jenkins': {
        name: 'Officer Sarah Jenkins',
        fullName: 'Sarah Jenkins',
        role: 'Patrol Officer',
        rank: 'Officer',
        appearance: {
            age: 32,
            build: 'athletic',
            features: ['brown hair in bun', 'fit', 'friendly face'],
            uniform: 'navy blue with badge'
        },
        personality: {
            disposition: 'friendly',
            quirks: ['New to Riverside', 'Wants to prove herself', 'Suspicious of newcomers'],
            dialogue: {
                greeting: [
                    "Hi there! Stay safe out there.",
                    "Nice day for a walk around town!",
                    "We don't see many new faces. You new in town?"
                ],
                suspicious: [
                    "You seem to be everywhere at once. Find any good deals?",
                    "I've noticed some... unusual activity around your place.",
                    "My supervisor has been asking questions. Just so you know."
                ],
                warning: [
                    "I'm sorry, but I need you to come with me.",
                    "The Chief wants to talk. Now.",
                    "Don't make me call for backup."
                ]
            }
        },
        schedule: {
            // Day shift: 6AM - 6PM
            default: { x: 10, y: 8 }, // Patrols main street
            6: { x: 3, y: 3 },  // Start shift at station
            9: { x: 8, y: 8 },  // Patrol near diner
            12: { x: 10, y: 5 }, // Near MartMart
            15: { x: 12, y: 6 }, // Near taco truck
            18: { x: 3, y: 3 }   // End shift at station
        },
        suspicionThreshold: 60
    },
    
    // Night shift officer - more cynical, harder
    'officer-chen': {
        name: 'Officer Mike Chen',
        fullName: 'Michael Chen',
        role: 'Patrol Officer',
        rank: 'Officer',
        appearance: {
            age: 40,
            build: 'average',
            features: ['asian heritage', 'buzz cut', 'tired eyes'],
            uniform: 'navy blue with badge'
        },
        personality: {
            disposition: 'cynical',
            quirks: ['Night owl', 'Seen it all', 'Less trusting'],
            dialogue: {
                greeting: [
                    "Evening. Get home safe.",
                    "Late night stroll? Nothing wrong with that.",
                    "This town sleeps at 10. You got somewhere to be?"
                ],
                suspicious: [
                    "I know what's going on in this town. Don't think I don't.",
                    "You've been making some powerful enemies, friend.",
                    "The late-night trips to The Docks... we notice things like that."
                ],
                warning: [
                    "You're going down. Period.",
                    "Don't run. We will catch you.",
                    "This is your last chance to explain yourself."
                ]
            }
        },
        schedule: {
            // Night shift: 6PM - 6AM
            default: { x: 8, y: 10 }, // Patrols residential
            18: { x: 3, y: 3 }, // Start shift
            21: { x: 6, y: 8 }, // Near houses
            0: { x: 10, y: 10 }, // Late night patrol
            3: { x: 8, y: 8 }, // Near downtown
            6: { x: 3, y: 3 }  // End shift
        },
        suspicionThreshold: 70
    },
    
    // Reserve deputy - old timer, doesn't care much
    'deputy-griffin': {
        name: 'Deputy Bill Griffin',
        fullName: 'William "Bill" Griffin',
        role: 'Reserve Deputy',
        rank: 'Deputy',
        appearance: {
            age: 65,
            build: 'heavy',
            features: ['white hair', 'beer belly', 'walrus mustache'],
            uniform: 'tan brown with star badge'
        },
        personality: {
            disposition: 'laid-back',
            quirks: ['About to retire', 'More interested in coffee', 'Cut corners'],
            dialogue: {
                greeting: [
                    "Howdy. Weather's been nice lately.",
                    "Nothing much happening in these parts.",
                    "You seem like a good kid. Stay out of trouble now."
                ],
                suspicious: [
                    "I don't want to know what you're up to. Got it?",
                    "Keep your head down and we won't have problems.",
                    "I'm about to retire. Don't make me work overtime."
                ],
                warning: [
                    "Sorry kid, orders are orders.",
                    "This is the part where I'm supposed to arrest you.",
                    "Chief's got his eye on you. Good luck."
                ]
            }
        },
        schedule: {
            // Works part-time, mostly mornings
            default: { x: 5, y: 6 }, // Near convenience store
            7: { x: 3, y: 3 },  // Start
            10: { x: 5, y: 5 }, // Near Quick-Mart
            12: { x: 3, y: 3 }, // Lunch
            14: { x: 6, y: 7 }, // Patrolling
            16: { x: 3, y: 3 }  // Go home
        },
        suspicionThreshold: 90 // Harder to get him suspicious
    }
};

// ============================================================
// SUSPICION SYSTEM
// ============================================================

export class RiversidePoliceSystem {
    constructor(scene) {
        this.scene = scene;
        this.cops = RIVERSIDE_COPS;
        
        // Initialize suspicion tracking if not present
        if (!this.scene.playerState.policeSuspicion) {
            // Early game: suspicion starts low (10-20)
            this.scene.playerState.policeSuspicion = Math.floor(Math.random() * 11) + 10;
        }
        if (!this.scene.playerState.policeSuspicionLevel) {
            this.scene.playerState.policeSuspicionLevel = 'none'; // none, low, medium, high, critical
        }
        if (!this.scene.playerState.questCompletionCount) {
            this.scene.playerState.questCompletionCount = 0;
        }
        if (!this.scene.playerState.policeRaidTriggered) {
            this.scene.playerState.policeRaidTriggered = false;
        }
        if (!this.scene.playerState.arrested) {
            this.scene.playerState.arrested = false;
        }
    }
    
    /**
     * Increase suspicion based on quest completion
     */
    addSuspicion(amount = 10) {
        const oldLevel = this.scene.playerState.policeSuspicionLevel;
        
        this.scene.playerState.policeSuspicion += amount;
        this.scene.playerState.policeSuspicion = Math.min(100, this.scene.playerState.policeSuspicion);
        
        // Update suspicion level
        this.updateSuspicionLevel();
        
        const newLevel = this.scene.playerState.policeSuspicionLevel;
        
        // Show notification on level change
        if (this.getSuspicionLevelIndex(newLevel) > this.getSuspicionLevelIndex(oldLevel)) {
            this.showSuspicionWarning(newLevel);
        }
        
        // Check for raid trigger
        if (this.scene.playerState.policeSuspicion >= 100 && !this.scene.playerState.policeRaidTriggered) {
            this.triggerRaid();
        }
    }
    
    /**
     * Decrease suspicion (e.g., by sleeping or special actions)
     */
    reduceSuspicion(amount = 10) {
        const oldLevel = this.scene.playerState.policeSuspicionLevel;
        
        this.scene.playerState.policeSuspicion -= amount;
        this.scene.playerState.policeSuspicion = Math.max(0, this.scene.playerState.policeSuspicion);
        
        this.updateSuspicionLevel();
        
        const newLevel = this.scene.playerState.policeSuspicionLevel;
        
        if (this.getSuspicionLevelIndex(newLevel) < this.getSuspicionLevelIndex(oldLevel)) {
            this.scene.showFloatingText(`Police Interest: ${newLevel}`, CONFIG.COLORS.success);
        }
    }
    
    /**
     * Update suspicion level based on current value
     */
    updateSuspicionLevel() {
        const susp = this.scene.playerState.policeSuspicion;
        
        if (susp >= 80) {
            this.scene.playerState.policeSuspicionLevel = 'critical';
        } else if (susp >= 60) {
            this.scene.playerState.policeSuspicionLevel = 'high';
        } else if (susp >= 40) {
            this.scene.playerState.policeSuspicionLevel = 'medium';
        } else if (susp >= 20) {
            this.scene.playerState.policeSuspicionLevel = 'low';
        } else {
            this.scene.playerState.policeSuspicionLevel = 'none';
        }
    }
    
    /**
     * Add suspicion from specific actions
     * @param {string} actionType - Type of action that increases suspicion
     * @param {number} baseAmount - Base suspicion amount (will be modified by multipliers)
     */
    addSuspicionFromAction(actionType, baseAmount = 5) {
        let amount = baseAmount;
        
        // Action-specific modifiers
        switch (actionType) {
            case 'high_heat':
                // High heat significantly increases suspicion
                amount = Math.floor(amount * 1.5);
                break;
            case 'witnessed_sale':
                // Being seen making a sale is bad
                amount = Math.floor(amount * 2);
                break;
            case 'rival_elimination':
                // Killing rivals draws attention
                amount = Math.floor(amount * 1.5);
                break;
            case 'gang_activity':
                // Gang-related activities
                amount = Math.floor(amount * 1.25);
                break;
            case 'large_transaction':
                // Large money transactions are suspicious
                amount = Math.floor(amount * 1.3);
                break;
            default:
                // Default action
                break;
        }
        
        this.addSuspicion(amount);
    }
    
    /**
     * Get numeric index for suspicion level
     */
    getSuspicionLevelIndex(level) {
        const levels = ['none', 'low', 'medium', 'high', 'critical'];
        return levels.indexOf(level);
    }
    
    /**
     * Show warning when suspicion increases
     */
    showSuspicionWarning(level) {
        const messages = {
            'low': '⚠️ Police have noticed you',
            'medium': '⚠️ Police are asking questions about you',
            'high': '🚨 Police are watching you closely!',
            'critical': '🚔 RAID IMMINENT!'
        };
        
        this.scene.showFloatingText(messages[level] || '', CONFIG.COLORS.danger);
    }
    
    /**
     * Get dialogue from a cop based on suspicion level
     */
    getCopDialogue(copKey, type = 'greeting') {
        const cop = this.cops[copKey];
        if (!cop) return ["..."];
        
        const suspLevel = this.scene.playerState.policeSuspicionLevel;
        
        // At high suspicion, mix in suspicious dialogue
        if ((suspLevel === 'high' || suspLevel === 'critical') && type === 'greeting') {
            // 50% chance of suspicious dialogue at high suspicion
            if (Math.random() < 0.5) {
                type = 'suspicious';
            }
        }
        
        // At critical, use warning dialogue
        if (suspLevel === 'critical' && type !== 'warning') {
            type = 'warning';
        }
        
        return cop.personality.dialogue[type] || cop.personality.dialogue.greeting;
    }
    
    /**
     * Handle quest completion - add suspicion
     */
    onQuestComplete(questId) {
        this.scene.playerState.questCompletionCount++;
        
        // Base suspicion per quest
        let suspIncrease = 5;
        
        // Additional suspicion based on quest type (simplified - can expand)
        const questSuspicionMap = {
            'riverside_first_delivery': 8,
            'riverside_become_plug': 15,
            'riverside_rival_elimination': 20,
            'riverside_expansion': 12,
            'riverside_final_quest': 100 // Final quest triggers raid immediately
        };
        
        if (questSuspicionMap[questId]) {
            suspIncrease = questSuspicionMap[questId];
        }
        
        // Check if this is the final quest - trigger raid immediately
        if (questId === 'riverside_final_quest' || questId === 'chapter4_final') {
            this.triggerFinalQuestRaid();
        } else {
            this.addSuspicion(suspIncrease);
        }
    }
    
    /**
     * Trigger raid for final quest completion (different from suspicion-based raid)
     * This is the canonical raid that transitions to Big City
     */
    triggerFinalQuestRaid() {
        // Mark as triggered
        this.scene.playerState.policeRaidTriggered = true;
        this.scene.playerState.finalQuestComplete = true;
        
        // Show notification
        this.scene.showFloatingText('🚔 THE FEDS ARE COMING!', CONFIG.COLORS.danger);
        
        // Schedule the raid after a short delay
        this.scene.time.delayedCall(2000, () => {
            this.executeFinalQuestRaid();
        });
    }
    
    /**
     * Execute the final quest raid sequence
     * This shows police cars arriving, sirens, arrest, and transitions to Big City
     */
    executeFinalQuestRaid() {
        const { width, height } = this.scene.scale;
        
        // Create dramatic raid overlay
        const raidOverlay = this.scene.add.rectangle(
            width / 2, height / 2, width, height, 0x000000, 0.85
        ).setScrollFactor(0).setDepth(5000);
        
        // Dramatic flash effect
        const flash = this.scene.add.rectangle(
            width / 2, height / 2, width, height, 0xffffff, 0.9
        ).setScrollFactor(0).setDepth(5001);
        
        // Animate flash
        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                flash.destroy();
            }
        });
        
        // Show "POLICE RAID" text with animation
        const raidText = this.scene.add.text(
            width / 2, height / 2 - 150,
            'POLICE RAID!', {
                fontFamily: 'Press Start 2P',
                fontSize: '56px',
                color: CONFIG.COLORS.danger,
                stroke: '#000000',
                strokeThickness: 8
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(5002);
        
        // Subtitle - explain what's happening
        const subtitleText = this.scene.add.text(
            width / 2, height / 2 - 60,
            'Big City SWAT has arrived!\n\nYour operation has been exposed.\n\nThere\'s no escape...', {
                fontFamily: 'Press Start 2P',
                fontSize: '16px',
                color: CONFIG.COLORS.text,
                align: 'center',
                lineSpacing: 8
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(5002);
        
        // Fade in raid text with scale
        raidText.setScale(0.1);
        this.scene.tweens.add({
            targets: raidText,
            scale: 1,
            duration: 500,
            ease: 'Back.easeOut'
        });
        
        // Show arrest scene after delay
        this.scene.time.delayedCall(4000, () => {
            this.showArrestScene(raidOverlay, raidText, subtitleText);
        });
    }
    
    /**
     * Show the arrest scene with player being taken away
     */
    showArrestScene(overlay, oldTitle, oldSubtitle) {
        const { width, height } = this.scene.scale;
        
        // Clear old text
        oldTitle.destroy();
        oldSubtitle.destroy();
        
        // Show arrest message
        const arrestText = this.scene.add.text(
            width / 2, height / 2 - 80,
            'YOU ARE UNDER ARREST', {
                fontFamily: 'Press Start 2P',
                fontSize: '36px',
                color: CONFIG.COLORS.danger,
                stroke: '#000000',
                strokeThickness: 6
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(5002);
        
        const chargeText = this.scene.add.text(
            width / 2, height / 2 + 20,
            'Charges:\n• Drug Trafficking\n• Distribution\n• Conspiracy\n\n"You have the right to remain silent..."', {
                fontFamily: 'Press Start 2P',
                fontSize: '14px',
                color: CONFIG.COLORS.text,
                align: 'center',
                lineSpacing: 8
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(5002);
        
        // Show time skip after delay
        this.scene.time.delayedCall(5000, () => {
            this.showTimeSkip(overlay, arrestText, chargeText);
        });
    }
    
    /**
     * Show 5 YEARS LATER time skip (reuse existing method for transition)
     */
    showTimeSkip(overlay, oldTitle, oldDetail) {
        const { width, height } = this.scene.scale;
        
        // Clear old text
        oldTitle.destroy();
        oldDetail.destroy();
        
        // Show time skip
        const timeSkipText = this.scene.add.text(
            width / 2, height / 2 - 60,
            '5 YEARS LATER...', {
                fontFamily: 'Press Start 2P',
                fontSize: '36px',
                color: CONFIG.COLORS.primary,
                stroke: '#000000',
                strokeThickness: 6
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(5002);
        
        const releaseText = this.scene.add.text(
            width / 2, height / 2 + 40,
            'You\'ve been released from prison.\n\nThe streets have changed.\nA new city awaits...\n\nWELCOME TO THE DOCKS', {
                fontFamily: 'Press Start 2P',
                fontSize: '14px',
                color: CONFIG.COLORS.text,
                align: 'center',
                lineSpacing: 8
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(5002);
        
        // Animate the text
        timeSkipText.setAlpha(0);
        this.scene.tweens.add({
            targets: timeSkipText,
            alpha: 1,
            duration: 1000
        });
        
        // Clear suspicion and set arrested flag
        this.scene.playerState.arrested = true;
        this.scene.playerState.policeSuspicion = 0;
        this.scene.playerState.policeSuspicionLevel = 'none';
        
        // Transfer player to The Docks after delay
        this.scene.time.delayedCall(6000, () => {
            this.transitionToDocks(overlay, timeSkipText, releaseText);
        });
    }
    
    /**
     * Get current suspicion level
     */
    getSuspicion() {
        return this.scene.playerState.policeSuspicion;
    }
    
    /**
     * Get suspicion level string
     */
    getSuspicionLevel() {
        return this.scene.playerState.policeSuspicionLevel;
    }
    
    /**
     * Get patrol frequency modifier based on suspicion level
     * Higher suspicion = more frequent patrols
     * @returns {number} - Multiplier for patrol frequency (1.0 = normal, 2.0 = twice as frequent)
     */
    getPatrolFrequencyModifier() {
        const susp = this.scene.playerState.policeSuspicion;
        
        if (susp >= 75) {
            return 3.0; // Critical - maximum patrols
        } else if (susp >= 50) {
            return 2.0; // High - doubled patrols
        } else if (susp >= 25) {
            return 1.5; // Medium - 50% more patrols
        } else {
            return 1.0; // Low - normal patrols
        }
    }
    
    /**
     * Get position for cop patrol based on suspicion
     * At higher suspicion, cops patrol closer to player's known location
     * @param {string} copKey - The cop identifier
     * @param {number} hour - Current hour (0-23)
     * @returns {Object} - Position {x, y}
     */
    getSuspicionAdjustedPosition(copKey, hour) {
        const cop = this.cops[copKey];
        if (!cop) return null;
        
        // Get base position from schedule
        const basePos = getCopPosition(copKey, hour);
        
        // Get player's known position (safehouse or last seen)
        const playerX = this.scene.playerState.gridX;
        const playerY = this.scene.playerState.gridY;
        
        const susp = this.scene.playerState.policeSuspicion;
        
        // At low suspicion, use normal patrol routes
        if (susp < 25) {
            return basePos;
        }
        
        // At medium+ suspicion, occasionally patrol near player
        const suspicionFactor = susp / 100; // 0-1
        
        // Chance to patrol near player increases with suspicion
        const patrolNearPlayerChance = suspicionFactor * 0.7; // Max 70% chance at 100% susp
        
        if (Math.random() < patrolNearPlayerChance) {
            // Move patrol position closer to player based on suspicion
            const offsetRange = Math.floor(5 * suspicionFactor); // 0-5 tiles offset
            const offsetX = (Math.random() * 2 - 1) * offsetRange;
            const offsetY = (Math.random() * 2 - 1) * offsetRange;
            
            return {
                x: Math.max(1, Math.min(this.scene.worldMap[0]?.length - 2 || 20, Math.floor(playerX + offsetX))),
                y: Math.max(1, Math.min(this.scene.worldMap.length - 2 || 20, Math.floor(playerY + offsetY)))
            };
        }
        
        return basePos;
    }
    
    /**
     * Check if cops should initiate contact with player based on suspicion
     * @returns {Object|null} - { copKey, dialogueType } or null
     */
    checkForCopContact() {
        const susp = this.scene.playerState.policeSuspicion;
        
        // No contact at very low suspicion
        if (susp < 20) return null;
        
        // Determine contact type based on suspicion level
        let dialogueType = 'greeting';
        let requiredSuspicion = 0;
        
        if (susp >= 75) {
            // Critical - threaten player
            dialogueType = 'warning';
            requiredSuspicion = 75;
        } else if (susp >= 50) {
            // High - suspicious questions
            dialogueType = 'suspicious';
            requiredSuspicion = 50;
        } else if (susp >= 25) {
            // Medium - probing questions
            dialogueType = 'suspicious';
            requiredSuspicion = 25;
        }
        
        // Check if suspicion meets threshold for contact
        if (susp >= requiredSuspicion) {
            // Select random cop for contact
            const copKeys = Object.keys(this.cops);
            const randomCopKey = copKeys[Math.floor(Math.random() * copKeys.length)];
            
            return {
                copKey: randomCopKey,
                dialogueType: dialogueType
            };
        }
        
        return null;
    }
    
    /**
     * Check if raid should be triggered
     */
    shouldTriggerRaid() {
        return this.scene.playerState.policeSuspicion >= 100 && 
               !this.scene.playerState.policeRaidTriggered;
    }
    
    /**
     * Trigger the police raid
     */
    triggerRaid() {
        this.scene.playerState.policeRaidTriggered = true;
        this.scene.showFloatingText('🚔 POLICE RAID!', CONFIG.COLORS.danger);
        
        // Schedule the raid after a short delay
        this.scene.time.delayedCall(2000, () => {
            this.executeRaid();
        });
    }
    
    /**
     * Execute the raid sequence
     */
    executeRaid() {
        const { width, height } = this.scene.scale;
        
        // Create raid overlay
        const raidOverlay = this.scene.add.rectangle(
            width / 2, height / 2, width, height, 0x000000, 0.9
        ).setScrollFactor(0).setDepth(5000);
        
        // Flash effect
        const flash = this.scene.add.rectangle(
            width / 2, height / 2, width, height, 0xffffff, 0.8
        ).setScrollFactor(0).setDepth(5001);
        
        // Sound effect (if audio available)
        // this.scene.sound.play('siren');
        
        // Raid message
        const raidText = this.scene.add.text(
            width / 2, height / 2 - 100,
            'POLICE RAID!', {
                fontFamily: 'Press Start 2P',
                fontSize: '48px',
                color: CONFIG.COLORS.danger,
                stroke: '#000000',
                strokeThickness: 8
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(5002);
        
        const detailText = this.scene.add.text(
            width / 2, height / 2 + 20,
            'The Riverside PD has busted down your door!\n\nBig city SWAT arrived to take over...\n\nYou\'re going away for a LONG time.', {
                fontFamily: 'Press Start 2P',
                fontSize: '16px',
                color: CONFIG.COLORS.text,
                align: 'center',
                lineSpacing: 8
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(5002);
        
        // Animate flash
        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                flash.destroy();
            }
        });
        
        // Show time skip after delay
        this.scene.time.delayedCall(5000, () => {
            this.showTimeSkip(raidOverlay, raidText, detailText);
        });
    }
    
    /**
     * Show 5 YEARS LATER time skip
     */
    showTimeSkip(overlay, oldTitle, oldDetail) {
        const { width, height } = this.scene.scale;
        
        // Clear old text
        oldTitle.destroy();
        oldDetail.destroy();
        
        // Show time skip
        const timeSkipText = this.scene.add.text(
            width / 2, height / 2 - 60,
            '5 YEARS LATER...', {
                fontFamily: 'Press Start 2P',
                fontSize: '36px',
                color: CONFIG.COLORS.primary,
                stroke: '#000000',
                strokeThickness: 6
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(5002);
        
        const releaseText = this.scene.add.text(
            width / 2, height / 2 + 40,
            'You\'ve been released from prison.\n\nThe streets have changed.\nA new city awaits...\n\nWELCOME TO THE DOCKS', {
                fontFamily: 'Press Start 2P',
                fontSize: '14px',
                color: CONFIG.COLORS.text,
                align: 'center',
                lineSpacing: 8
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(5002);
        
        // Clear suspicion and set arrested flag
        this.scene.playerState.arrested = true;
        this.scene.playerState.policeSuspicion = 0;
        this.scene.playerState.policeSuspicionLevel = 'none';
        
        // Transfer player to The Docks after delay
        this.scene.time.delayedCall(6000, () => {
            this.transitionToDocks(overlay, timeSkipText, releaseText);
        });
    }
    
    /**
     * Transition player to The Docks (Big City)
     */
    transitionToDocks(overlay, title, detail) {
        // Destroy UI elements
        overlay.destroy();
        title.destroy();
        detail.destroy();
        
        // Set new neighborhood - start at Prison (player was just released)
        this.scene.playerState.neighborhood = 'RIVERSIDE_PRISON';
        
        // Add Big City neighborhoods to unlocked neighborhoods
        const bigCityNeighborhoods = ['DOWNTOWN', 'DOWNTOWN_EXPANSION', 'WAREHOUSE_DISTRICT', 'RIVERSIDE_PRISON'];
        bigCityNeighborhoods.forEach(hood => {
            if (!this.scene.playerState.unlockedNeighborhoods.includes(hood)) {
                this.scene.playerState.unlockedNeighborhoods.push(hood);
            }
        });
        
        // Add legacy neighborhoods for backwards compatibility
        if (!this.scene.playerState.unlockedNeighborhoods.includes('OLD_TOWN')) {
            this.scene.playerState.unlockedNeighborhoods.push('OLD_TOWN');
        }
        if (!this.scene.playerState.unlockedNeighborhoods.includes('THE_HARBOR')) {
            this.scene.playerState.unlockedNeighborhoods.push('THE_HARBOR');
        }
        
        // Reset player position to prison (starting location after release)
        this.scene.playerState.gridX = 5;
        this.scene.playerState.gridY = 5;
        
        // Set money to a small amount (prison took most)
        this.scene.playerState.money = 100;
        this.scene.playerState.product = 0;
        
        // Clear drugs
        Object.keys(this.scene.playerState.drugs).forEach(key => {
            this.scene.playerState.drugs[key] = 0;
        });
        
        // Reset heat
        this.scene.playerState.heat = 10;
        
        // Reset Big City police suspicion (fresh start)
        this.scene.playerState.bigCityPoliceSuspicion = 0;
        this.scene.playerState.bigCityPoliceSuspicionLevel = 'none';
        
        // Mark player as having been released from prison
        this.scene.playerState.justReleasedFromPrison = true;
        
        // Show welcome message for new area
        this.scene.showFloatingText('Welcome to Big City!', CONFIG.COLORS.success);
        
        // Reload the scene for new neighborhood
        this.scene.scene.restart();
    }
}

// ============================================================
// EXPORT HELPER FUNCTIONS
// ============================================================

/**
 * Get all cops as an array
 */
export function getAllCops() {
    return Object.entries(RIVERSIDE_COPS).map(([key, cop]) => ({
        key,
        ...cop
    }));
}

/**
 * Get cop by key
 */
export function getCop(copKey) {
    return RIVERSIDE_COPS[copKey];
}

/**
 * Get patrol route for a cop at a given hour
 */
export function getCopPosition(copKey, hour) {
    const cop = RIVERSIDE_COPS[copKey];
    if (!cop) return null;
    
    // Find the closest schedule entry
    const schedules = Object.entries(cop.schedule).map(([h, pos]) => ({
        hour: parseInt(h),
        pos
    })).sort((a, b) => a.hour - b.hour);
    
    // Find the current or last schedule point
    let currentPos = schedules[0].pos;
    for (const schedule of schedules) {
        if (hour >= schedule.hour) {
            currentPos = schedule.pos;
        }
    }
    
    return currentPos;
}

/**
 * Check if a cop is on duty at a given hour
 */
export function isCopOnDuty(copKey, hour) {
    const cop = RIVERSIDE_COPS[copKey];
    if (!cop) return false;
    
    // All cops have schedules - check if hour falls within any range
    const hours = Object.keys(cop.schedule).map(h => parseInt(h));
    return hours.some(h => h === hour || (hour > h && hour < (hours[hours.indexOf(h) + 1] || 24)));
}
