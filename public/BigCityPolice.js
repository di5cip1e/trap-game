/**
 * BigCityPolice.js - Big City law enforcement system
 * Metro Police, SWAT, and federal-level law enforcement for The Docks proper
 * More serious, bureaucratic, and dangerous than Riverside PD
 */

import { CONFIG } from './config.js';

// ============================================================
// BIG CITY POLICE STATION POIs
// ============================================================

export const BIG_CITY_POLICE_STATION = {
    type: 'service',
    name: 'Metro Police Station',
    description: "Big City's main police precinct. Bureaucratic, overworked, but dangerous.",
    tile: 'tile-concrete',
    dangerLevel: 3,
    usable: true,
    locationType: 'police',
    hours: { open: 0, close: 24 },
    isMainPlugQuestHub: false
};

export const SWAT_HEADQUARTERS = {
    type: 'service',
    name: 'SWAT Headquarters',
    description: "Metro SWAT Division - elite tactical unit. They don't patrol; they raid.",
    tile: 'tile-concrete',
    dangerLevel: 5,
    usable: false,
    locationType: 'police',
    hours: { open: 0, close: 24 },
    isMainPlugQuestHub: false
};

// ============================================================
// BIG CITY COP DEFINITIONS
// ============================================================

export const BIG_CITY_COPS = {
    // Captain - runs the Metro division
    'captain-martinez': {
        name: 'Captain Elena Martinez',
        fullName: 'Captain Elena Martinez',
        role: 'Metro Police Captain',
        rank: 'Captain',
        appearance: {
            age: 48,
            build: 'athletic',
            features: ['latina heritage', 'dark hair', 'piercing eyes', 'scar on jaw'],
            uniform: 'navy blue with gold eagles'
        },
        personality: {
            disposition: 'calculating',
            quirks: ['Former detective', 'Plays the long game', 'Has informants everywhere'],
            dialogue: {
                greeting: [
                    "Metro PD. What brings you to my station?",
                    "We don't get many visitors from... outside. What do you want?",
                    "Make it quick. I've got a city to run."
                ],
                suspicious: [
                    "We've been watching your operations. Careful.",
                    "The Don's people mentioned you. That's... concerning.",
                    "You're getting close to some dangerous people. I hope you know what you're doing."
                ],
                warning: [
                    "Don't make me send SWAT. They're eager for some action.",
                    "I've got enough on you to make your life very difficult.",
                    "This is your last warning. Disappear from my city."
                ]
            }
        },
        schedule: {
            default: { x: 5, y: 5 },
            8: { x: 5, y: 5 },
            12: { x: 5, y: 5 },
            18: { x: 5, y: 5 },
            22: { x: 5, y: 5 }
        },
        suspicionThreshold: 85
    },
    
    // Lieutenant - investigations
    'lt-jameson': {
        name: 'Lieutenant Jameson',
        fullName: 'Marcus Jameson',
        role: 'Detective Lieutenant',
        rank: 'Lieutenant',
        appearance: {
            age: 42,
            build: 'heavy',
            features: ['african american', 'grey temples', 'hawk nose', 'bulldog'],
            uniform: 'navy blue with two gold bars'
        },
        personality: {
            disposition: 'aggressive',
            quirks: ['Old school detective', 'Tough but fair', 'Hates paperwork more than criminals'],
            dialogue: {
                greeting: [
                    "You're a hard person to find. That concerns me.",
                    "I've got questions. You've got answers. Let's talk.",
                    "You don't belong here. That makes you interesting."
                ],
                suspicious: [
                    "The Don, Viper, Razor... you know all of them. Convenient.",
                    "Money's moving through your accounts. A lot of money.",
                    "Someone's talking. Everyone's talking. Even you will talk eventually."
                ],
                warning: [
                    "You're going down. Not if, when.",
                    "I've got a SWAT team on standby. Don't make me call them.",
                    "Your protection is crumbling. When it does, you're mine."
                ]
            }
        },
        schedule: {
            default: { x: 6, y: 6 },
            9: { x: 6, y: 6 },
            14: { x: 7, y: 5 },
            18: { x: 6, y: 6 }
        },
        suspicionThreshold: 75
    },
    
    // Detective - street level investigations
    'detective-chen': {
        name: 'Detective Sarah Chen',
        fullName: 'Sarah Chen',
        role: 'Homicide Detective',
        rank: 'Detective',
        appearance: {
            age: 35,
            build: 'athletic',
            features: ['asian heritage', 'black hair', 'intense stare', 'scarce makeup'],
            uniform: 'plainclothes - navy blazer'
        },
        personality: {
            disposition: 'intense',
            quirks: ['Workaholic', 'Not bought by any faction', 'Has a reputation'],
            dialogue: {
                greeting: [
                    "I know who you are. I know what you do. We're going to talk.",
                    "The bodies are piling up. And your name keeps coming up.",
                    "You run a clean operation. Too clean. That's suspicious."
                ],
                suspicious: [
                    "Every faction in this city has tried to buy me. You're next.",
                    "I've got eyes in every neighborhood. Even the ones you think are safe.",
                    "The bodies you've buried... I've found some of them."
                ],
                warning: [
                    "I'm not like the others. I don't take bribes. I take arrests.",
                    "SWAT is ready. One call and your empire burns.",
                    "You're going away for a long time. The question is how long."
                ]
            }
        },
        schedule: {
            default: { x: 8, y: 8 },
            6: { x: 6, y: 6 },
            10: { x: 10, y: 4 },
            15: { x: 8, y: 8 },
            20: { x: 6, y: 6 }
        },
        suspicionThreshold: 65
    },
    
    // SWAT Commander - the heavy hitter
    'scommander-steele': {
        name: 'Commander Steele',
        fullName: 'David "Stone" Steele',
        role: 'SWAT Commander',
        rank: 'Commander',
        appearance: {
            age: 45,
            build: 'massive',
            features: ['white', 'buzz cut', 'jagged scar', 'muscles through uniform'],
            uniform: 'black tactical gear with swat patch'
        },
        personality: {
            disposition: 'militaristic',
            quirks: ['Former military', 'No negotiations', 'Always ready to breach'],
            dialogue: {
                greeting: [
                    "You made the wrong enemies. Now we meet.",
                    "I've raided 47 operations this year. Yours will be 48.",
                    "Every criminal thinks they're smart. They're all wrong."
                ],
                suspicious: [
                    "Your operation is flagged. We have a warrant.",
                    "Surveillance shows everything. We know everything.",
                    "The raid is planned. The only question is when."
                ],
                warning: [
                    "BREACH IN PROGRESS. YOU ARE SURROUNDED.",
                    "Final warning. Hands where we can see them.",
                    "This ends now. No deals. No bargains. Just prison."
                ]
            }
        },
        schedule: {
            default: { x: 3, y: 3 },
            8: { x: 3, y: 3 },
            12: { x: 3, y: 3 },
            18: { x: 3, y: 3 }
        },
        suspicionThreshold: 95 // Hard to get SWAT suspicious, but devastating when triggered
    },
    
    // Regular Metro Officer
    'officer-rodriguez': {
        name: 'Officer Rodriguez',
        fullName: 'Carlos Rodriguez',
        role: 'Patrol Officer',
        rank: 'Officer',
        appearance: {
            age: 30,
            build: 'average',
            features: ['latino', 'mustache', 'tired eyes', 'young but experienced'],
            uniform: 'navy blue with badge'
        },
        personality: {
            disposition: 'professional',
            quirks: ['Just doing his job', 'Knows more than he lets on', 'Can be bribed'],
            dialogue: {
                greeting: [
                    "Evening. Papers, please.",
                    "Stay out of trouble. This sector's heated.",
                    "Just patrolling. You know how it is."
                ],
                suspicious: [
                    "I've seen your face at a few... interesting places.",
                    "Someone's been asking about you. Not me, obviously.",
                    "Keep your head down and we won't have problems."
                ],
                warning: [
                    "You're coming with me. No arguments.",
                    "Hands behind your back. Now.",
                    "I've got backup on the way. Don't make me use this."
                ]
            }
        },
        schedule: {
            default: { x: 10, y: 8 },
            6: { x: 8, y: 6 },
            12: { x: 10, y: 10 },
            18: { x: 12, y: 8 }
        },
        suspicionThreshold: 60
    },
    
    // Federal Agent (FBI/DEA) - ultimate threat
    'agent-thompson': {
        name: 'Agent Thompson',
        fullName: 'Federal Agent Thompson',
        role: 'DEA Task Force',
        rank: 'Special Agent',
        appearance: {
            age: 40,
            build: 'average',
            features: ['caucasian', 'suit', 'sunken eyes', 'no expression'],
            uniform: 'federal suit - no badge visible'
        },
        personality: {
            disposition: 'cold',
            quirks: ['Never emotional', 'Has RICO', 'Works above the factions'],
            dialogue: {
                greeting: [
                    "You're a person of interest in a federal investigation.",
                    "We've been tracking your money. It's... impressive.",
                    "The Don, Razor, Viper... you're connected to all of them."
                ],
                suspicious: [
                    "RICO is on the table. You understand what that means?",
                    "Your associates are talking. They're all talking.",
                    "We've seized assets. Bank accounts. Properties. There's more coming."
                ],
                warning: [
                    "Federal indictment is being prepared. You have the right to remain silent.",
                    "This is not a local matter anymore. This is federal.",
                    "Your organization is under federal investigation. Cooperate or face the full weight of the law."
                ]
            }
        },
        schedule: {
            default: { x: 5, y: 5 },
            9: { x: 5, y: 5 },
            17: { x: 5, y: 5 }
        },
        suspicionThreshold: 90 // Very hard to trigger, but devastating
    }
};

// ============================================================
// BIG CITY POLICE SYSTEM
// ============================================================

export class BigCityPoliceSystem {
    constructor(scene) {
        this.scene = scene;
        this.cops = BIG_CITY_COPS;
        
        // Initialize suspicion tracking if not present
        if (!this.scene.playerState.bigCityPoliceSuspicion) {
            // In Big City, suspicion starts at 0 (fresh start)
            this.scene.playerState.bigCityPoliceSuspicion = 0;
        }
        if (!this.scene.playerState.bigCityPoliceSuspicionLevel) {
            this.scene.playerState.bigCityPoliceSuspicionLevel = 'none';
        }
        if (!this.scene.playerState.bigCityPoliceRaidTriggered) {
            this.scene.playerState.bigCityPoliceRaidTriggered = false;
        }
        if (!this.scene.playerState.federalInvestigation) {
            this.scene.playerState.federalInvestigation = false;
        }
    }
    
    /**
     * Increase suspicion based on activities in Big City
     */
    addSuspicion(amount = 15) {
        const oldLevel = this.scene.playerState.bigCityPoliceSuspicionLevel;
        
        this.scene.playerState.bigCityPoliceSuspicion += amount;
        this.scene.playerState.bigCityPoliceSuspicion = Math.min(150, this.scene.playerState.bigCityPoliceSuspicion); // Can go higher in Big City
        
        // Update suspicion level
        this.updateSuspicionLevel();
        
        const newLevel = this.scene.playerState.bigCityPoliceSuspicionLevel;
        
        // Show notification on level change
        if (this.getSuspicionLevelIndex(newLevel) > this.getSuspicionLevelIndex(oldLevel)) {
            this.showSuspicionWarning(newLevel);
        }
        
        // Trigger federal investigation at very high suspicion
        if (this.scene.playerState.bigCityPoliceSuspicion >= 120 && !this.scene.playerState.federalInvestigation) {
            this.scene.playerState.federalInvestigation = true;
            this.scene.showFloatingText('⚠️ FEDERAL INVESTIGATION LAUNCHED!', CONFIG.COLORS.danger);
        }
        
        // Check for raid trigger (higher threshold in Big City)
        if (this.scene.playerState.bigCityPoliceSuspicion >= 150 && !this.scene.playerState.bigCityPoliceRaidTriggered) {
            this.triggerRaid();
        }
    }
    
    /**
     * Decrease suspicion
     */
    reduceSuspicion(amount = 15) {
        const oldLevel = this.scene.playerState.bigCityPoliceSuspicionLevel;
        
        this.scene.playerState.bigCityPoliceSuspicion -= amount;
        this.scene.playerState.bigCityPoliceSuspicion = Math.max(0, this.scene.playerState.bigCityPoliceSuspicion);
        
        this.updateSuspicionLevel();
        
        const newLevel = this.scene.playerState.bigCityPoliceSuspicionLevel;
        
        if (this.getSuspicionLevelIndex(newLevel) < this.getSuspicionLevelIndex(oldLevel)) {
            this.scene.showFloatingText(`Metro PD Interest: ${newLevel}`, CONFIG.COLORS.success);
        }
    }
    
    /**
     * Update suspicion level based on current value
     */
    updateSuspicionLevel() {
        const susp = this.scene.playerState.bigCityPoliceSuspicion;
        
        if (susp >= 120) {
            this.scene.playerState.bigCityPoliceSuspicionLevel = 'federal';
        } else if (susp >= 100) {
            this.scene.playerState.bigCityPoliceSuspicionLevel = 'critical';
        } else if (susp >= 75) {
            this.scene.playerState.bigCityPoliceSuspicionLevel = 'high';
        } else if (susp >= 50) {
            this.scene.playerState.bigCityPoliceSuspicionLevel = 'medium';
        } else if (susp >= 25) {
            this.scene.playerState.bigCityPoliceSuspicionLevel = 'low';
        } else {
            this.scene.playerState.bigCityPoliceSuspicionLevel = 'none';
        }
    }
    
    /**
     * Get numeric index for suspicion level
     */
    getSuspicionLevelIndex(level) {
        const levels = ['none', 'low', 'medium', 'high', 'critical', 'federal'];
        return levels.indexOf(level);
    }
    
    /**
     * Show warning when suspicion increases
     */
    showSuspicionWarning(level) {
        const messages = {
            'low': '⚠️ Metro PD has noticed you',
            'medium': '⚠️ Metro PD is asking questions about you',
            'high': '🚔 Metro PD is watching you closely!',
            'critical': '🚨 SWAT RAID IMMINENT!',
            'federal': '� federal agents are on your trail!'
        };
        
        this.scene.showFloatingText(messages[level] || '', CONFIG.COLORS.danger);
    }
    
    /**
     * Get dialogue from a cop based on suspicion level
     */
    getCopDialogue(copKey, type = 'greeting') {
        const cop = this.cops[copKey];
        if (!cop) return ["..."];
        
        const suspLevel = this.scene.playerState.bigCityPoliceSuspicionLevel;
        
        // At high suspicion, mix in suspicious dialogue
        if ((suspLevel === 'high' || suspLevel === 'critical' || suspLevel === 'federal') && type === 'greeting') {
            if (Math.random() < 0.5) {
                type = 'suspicious';
            }
        }
        
        // At critical and above, use warning dialogue
        if ((suspLevel === 'critical' || suspLevel === 'federal') && type !== 'warning') {
            type = 'warning';
        }
        
        return cop.personality.dialogue[type] || cop.personality.dialogue.greeting;
    }
    
    /**
     * Handle quest completion - add suspicion
     */
    onQuestComplete(questId) {
        // Base suspicion per quest (higher in Big City)
        let suspIncrease = 10;
        
        // Additional suspicion based on quest type
        const questSuspicionMap = {
            'bigcity_establish': 15,
            'bigcity_faction_alliance': 20,
            'bigcity_territory_war': 25,
            'bigcity_final_quest': 50 // Major suspicion spike for final quest
        };
        
        if (questSuspicionMap[questId]) {
            suspIncrease = questSuspicionMap[questId];
        }
        
        this.addSuspicion(suspIncrease);
    }
    
    /**
     * Get current suspicion level
     */
    getSuspicion() {
        return this.scene.playerState.bigCityPoliceSuspicion;
    }
    
    /**
     * Get suspicion level string
     */
    getSuspicionLevel() {
        return this.scene.playerState.bigCityPoliceSuspicionLevel;
    }
    
    /**
     * Check if raid should be triggered
     */
    shouldTriggerRaid() {
        return this.scene.playerState.bigCityPoliceSuspicion >= 150 && 
               !this.scene.playerState.bigCityPoliceRaidTriggered;
    }
    
    /**
     * Trigger the SWAT raid
     */
    triggerRaid() {
        this.scene.playerState.bigCityPoliceRaidTriggered = true;
        this.scene.showFloatingText('🚨 SWAT RAID!', CONFIG.COLORS.danger);
        
        // Schedule the raid after a short delay
        this.scene.time.delayedCall(2000, () => {
            this.executeRaid();
        });
    }
    
    /**
     * Execute the SWAT raid sequence
     */
    executeRaid() {
        const { width, height } = this.scene.scale;
        
        // Create raid overlay with more intense effect
        const raidOverlay = this.scene.add.rectangle(
            width / 2, height / 2, width, height, 0x000000, 0.95
        ).setScrollFactor(0).setDepth(5000);
        
        // Flash effect
        const flash = this.scene.add.rectangle(
            width / 2, height / 2, width, height, 0xffffff, 0.9
        ).setScrollFactor(0).setDepth(5001);
        
        // SWAT Raid message
        const raidText = this.scene.add.text(
            width / 2, height / 2 - 120,
            'FEDERAL RAID!', {
                fontFamily: 'Press Start 2P',
                fontSize: '42px',
                color: '#ff0000',
                stroke: '#000000',
                strokeThickness: 8
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(5002);
        
        const detailText = this.scene.add.text(
            width / 2, height / 2 - 20,
            'SWAT HAS BREACHED YOUR LOCATION!\n\nFederal agents found evidence of:\n• Drug trafficking\n• RICO violations\n• Multiple felonies\n\nYou\'re going away for GOOD.', {
                fontFamily: 'Press Start 2P',
                fontSize: '12px',
                color: CONFIG.COLORS.text,
                align: 'center',
                lineSpacing: 8
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(5002);
        
        // Animate flash
        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 800,
            onComplete: () => {
                flash.destroy();
            }
        });
        
        // Show game over or restart after delay
        this.scene.time.delayedCall(6000, () => {
            this.showGameOver(raidOverlay, raidText, detailText);
        });
    }
    
    /**
     * Show game over screen
     */
    showGameOver(overlay, oldTitle, oldDetail) {
        const { width, height } = this.scene.scale;
        
        // Clear old text
        oldTitle.destroy();
        oldDetail.destroy();
        
        // Game Over text
        const gameOverText = this.scene.add.text(
            width / 2, height / 2 - 80,
            'GAME OVER', {
                fontFamily: 'Press Start 2P',
                fontSize: '48px',
                color: '#ff0000',
                stroke: '#000000',
                strokeThickness: 8
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(5002);
        
        const finalText = this.scene.add.text(
            width / 2, height / 2 + 20,
            'You were sentenced to life without parole.\n\nYour empire has fallen.\n\nThank you for playing TRAP.', {
                fontFamily: 'Press Start 2P',
                fontSize: '12px',
                color: CONFIG.COLORS.text,
                align: 'center',
                lineSpacing: 8
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(5002);
        
        // Add restart button prompt
        const restartText = this.scene.add.text(
            width / 2, height / 2 + 120,
            'Press SPACE to restart', {
                fontFamily: 'Press Start 2P',
                fontSize: '14px',
                color: CONFIG.COLORS.primary,
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(5002);
        
        // Pulse the restart text
        this.scene.tweens.add({
            targets: restartText,
            alpha: 0.3,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
        
        // Setup restart input
        this.scene.input.keyboard.once('keydown-SPACE', () => {
            this.scene.scene.restart();
        });
    }
}

// ============================================================
// EXPORT HELPER FUNCTIONS
// ============================================================

/**
 * Get all Big City cops as an array
 */
export function getAllBigCityCops() {
    return Object.entries(BIG_CITY_COPS).map(([key, cop]) => ({
        key,
        ...cop
    }));
}

/**
 * Get cop by key
 */
export function getBigCityCop(copKey) {
    return BIG_CITY_COPS[copKey];
}

/**
 * Get patrol route for a cop at a given hour
 */
export function getBigCityCopPosition(copKey, hour) {
    const cop = BIG_CITY_COPS[copKey];
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
export function isBigCityCopOnDuty(copKey, hour) {
    const cop = BIG_CITY_COPS[copKey];
    if (!cop) return false;
    
    // Metro PD operates 24/7
    return true;
}

/**
 * Get random cop key for encounters
 */
export function getRandomCop() {
    const copKeys = Object.keys(BIG_CITY_COPS);
    return copKeys[Math.floor(Math.random() * copKeys.length)];
}

/**
 * Get police faction name
 */
export function getPoliceFaction() {
    return 'Metro PD';
}

/**
 * Get SWAT faction name
 */
export function getSWATFaction() {
    return 'Metro SWAT';
}

/**
 * Get Federal faction name
 */
export function getFederalFaction() {
    return 'Federal Task Force';
}
