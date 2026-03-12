/**
 * SkillTree.js - Skill Tree System
 * Class-based skill trees: Intuition, Ability, Luck
 */

import { CONFIG } from './config.js';

/**
 * Skill definitions for each class tree
 */
export const SKILL_TREES = {
    // INTUITION TREE (Assassin/Street Smart)
    intuition: {
        name: 'Street Smart',
        description: 'Skills for stealth, information, and manipulation',
        skills: {
            // Tier 1
            lockpick: {
                name: 'Lockpick',
                description: 'Faster safehouse entry and can unlock doors',
                tier: 1,
                passive: true,
                effect: 'safehouseEntrySpeed: 0.5', // 50% faster
                bonus: 'Can unlock locked doors in encounters'
            },
            street_sense: {
                name: 'Street Sense',
                description: 'Detect hidden enemies and traps',
                tier: 1,
                passive: true,
                effect: 'detectHidden: true',
                bonus: 'Reveals concealed enemies on minimap'
            },
            // Tier 2
            sneak: {
                name: 'Sneak',
                description: 'Move without gaining heat',
                tier: 2,
                passive: true,
                effect: 'sneakHeatReduction: 1.0', // No heat gained
                bonus: 'Stealth movement in encounters'
            },
            intimidate: {
                name: 'Intimidate',
                description: 'Scare enemies into submission',
                tier: 2,
                active: true,
                cooldown: 30, // seconds
                effect: 'intimidateChance: 0.5',
                bonus: '50% chance to make enemy flee in combat'
            },
            // Tier 3
            shadow_walk: {
                name: 'Shadow Walk',
                description: 'Become invisible for short periods',
                tier: 3,
                active: true,
                cooldown: 60,
                effect: 'invisibleDuration: 5',
                bonus: '5 seconds of invisibility in combat'
            },
            deadly_precision: {
                name: 'Deadly Precision',
                description: 'Critical hit bonus in combat',
                tier: 3,
                passive: true,
                effect: 'critChance: 0.25, critDamage: 0.5',
                bonus: '+25% crit chance, +50% crit damage'
            }
        }
    },
    
    // ABILITY TREE (Enforcer/Fighter)
    ability: {
        name: 'Enforcer',
        description: 'Combat-focused skills for direct confrontation',
        skills: {
            // Tier 1
            iron_fist: {
                name: 'Iron Fist',
                description: '+Damage in combat',
                tier: 1,
                passive: true,
                effect: 'damageBonus: 0.25',
                bonus: '+25% combat damage'
            },
            toughness: {
                name: 'Toughness',
                description: '+Health and damage resistance',
                tier: 1,
                passive: true,
                effect: 'hpBonus: 25, damageReduction: 0.1',
                bonus: '+25 max HP, 10% damage reduction'
            },
            // Tier 2
            power_strike: {
                name: 'Power Strike',
                description: 'Heavy attack ability',
                tier: 2,
                active: true,
                cooldown: 15,
                effect: 'powerStrikeDamage: 2.0',
                bonus: '2x damage attack (2x cooldown)'
            },
            last_stand: {
                name: 'Last Stand',
                description: 'Desperate defense when low HP',
                tier: 2,
                passive: true,
                effect: 'lastStandThreshold: 0.25, lastStandBonus: 0.5',
                bonus: 'When below 25% HP: +50% damage and defense'
            },
            // Tier 3
            berserk: {
                name: 'Berserk',
                description: 'Go into a rage, massive damage',
                tier: 3,
                active: true,
                cooldown: 90,
                effect: 'berserkDuration: 8, berserkDamage: 2.0',
                bonus: '8 seconds of 2x damage, cannot be killed'
            },
            unbreakable: {
                name: 'Unbreakable',
                description: 'Cannot be killed, survive fatal blows',
                tier: 3,
                passive: true,
                effect: 'deathSave: 1',
                bonus: 'Survive one fatal blow per encounter'
            }
        }
    },
    
    // LUCK TREE (Con Artist/Gambler)
    luck: {
        name: 'Con Artist',
        description: 'Skills for deception, luck, and escape',
        skills: {
            // Tier 1
            fast_talk: {
                name: 'Fast Talk',
                description: 'Better prices from vendors',
                tier: 1,
                passive: true,
                effect: 'vendorDiscount: 0.15',
                bonus: '15% discount at vendors'
            },
            lucky_break: {
                name: 'Lucky Break',
                description: 'Random luck in critical moments',
                tier: 1,
                passive: true,
                effect: 'luckBonus: 0.2',
                bonus: '+20% to random event positive outcomes'
            },
            // Tier 2
            card_shark: {
                name: 'Card Shark',
                description: 'Win at card games',
                tier: 2,
                passive: true,
                effect: 'cardGameWinRate: 0.6',
                bonus: '60% win rate at gambling'
            },
            escape_artist: {
                name: 'Escape Artist',
                description: 'Always escape from bad situations',
                tier: 2,
                passive: true,
                effect: 'escapeChance: 0.75',
                bonus: '75% chance to escape encounters'
            },
            // Tier 3
            fortune: {
                name: 'Fortune',
                description: 'Overall luck boost and XP bonus',
                tier: 3,
                passive: true,
                effect: 'xpBonus: 0.2, allLuck: 0.1',
                bonus: '+20% XP gain, +10% all luck effects'
            },
            game_of_chance: {
                name: 'Game of Chance',
                description: 'Ultimate gamble skill',
                tier: 3,
                active: true,
                cooldown: 120,
                effect: 'doubleOrNothing: true',
                bonus: '50/50 chance: 2x rewards or lose half'
            }
        }
    }
};

/**
 * Default skill assignments based on starting stat priority
 */
export const DEFAULT_SKILL_TREES = {
    intuition: ['lockpick', 'street_sense'],
    ability: ['iron_fist', 'toughness'],
    luck: ['fast_talk', 'lucky_break']
};

export default class SkillTree {
    constructor(scene) {
        this.scene = scene;
        this.currentTree = null;
    }

    /**
     * Initialize skill tree based on player's class
     * @param {string} classType - 'intuition', 'ability', or 'luck'
     */
    initSkillTree(classType) {
        this.currentTree = classType;
        const { playerState } = this.scene;
        
        // Assign starting skills based on class
        const startingSkills = DEFAULT_SKILL_TREES[classType] || DEFAULT_SKILL_TREES.luck;
        
        if (!playerState.unlockedSkills) {
            playerState.unlockedSkills = [];
        }
        
        // Add starting skills
        startingSkills.forEach(skillKey => {
            if (!playerState.unlockedSkills.includes(skillKey)) {
                playerState.unlockedSkills.push(skillKey);
            }
        });
    }

    /**
     * Get the player's current skill tree
     * @returns {Object} Skill tree definition
     */
    getSkillTree() {
        const { playerState } = this.scene;
        const treeType = playerState.classType || 'luck';
        return SKILL_TREES[treeType];
    }

    /**
     * Check if player can learn a skill
     * @param {string} skillKey - Skill identifier
     * @returns {Object} {canLearn: boolean, reason: string}
     */
    canLearnSkill(skillKey) {
        const { playerState } = this.scene;
        const tree = this.getSkillTree();
        const skill = tree.skills[skillKey];
        
        if (!skill) {
            return { canLearn: false, reason: 'Skill does not exist' };
        }
        
        // Check if already learned
        if (playerState.unlockedSkills.includes(skillKey)) {
            return { canLearn: false, reason: 'Skill already learned' };
        }
        
        // Check if player has enough AP
        if (playerState.abilityPoints < 1) {
            return { canLearn: false, reason: 'Not enough Ability Points' };
        }
        
        // Check tier requirements
        if (skill.tier > 1) {
            // Check if player has previous tier skills
            const tier1Skills = Object.keys(tree.skills).filter(k => tree.skills[k].tier === 1);
            const tier2Skills = Object.keys(tree.skills).filter(k => tree.skills[k].tier === 2);
            
            if (skill.tier === 2) {
                // Need at least one tier 1 skill
                const hasTier1 = tier1Skills.some(s => playerState.unlockedSkills.includes(s));
                if (!hasTier1) {
                    return { canLearn: false, reason: 'Need Tier 1 skill from this tree' };
                }
            }
            
            if (skill.tier === 3) {
                // Need at least one tier 2 skill
                const hasTier2 = tier2Skills.some(s => playerState.unlockedSkills.includes(s));
                if (!hasTier2) {
                    return { canLearn: false, reason: 'Need Tier 2 skill from this tree' };
                }
            }
        }
        
        return { canLearn: true, reason: '' };
    }

    /**
     * Learn a new skill
     * @param {string} skillKey - Skill to learn
     * @returns {boolean} Success
     */
    learnSkill(skillKey) {
        const { playerState } = this.scene;
        const check = this.canLearnSkill(skillKey);
        
        if (!check.canLearn) {
            this.scene.showFloatingText(check.reason, '#ff0000');
            return false;
        }
        
        // Deduct AP and add skill
        playerState.abilityPoints--;
        playerState.unlockedSkills.push(skillKey);
        
        const tree = this.getSkillTree();
        const skill = tree.skills[skillKey];
        
        this.scene.showFloatingText(`Learned: ${skill.name}!`, '#00ff00');
        
        // Update HUD
        if (this.scene.hud) {
            this.scene.hud.update();
        }
        
        return true;
    }

    /**
     * Get all skills for the player's tree with unlock status
     * @returns {Array} Array of skill objects with status
     */
    getPlayerSkills() {
        const { playerState } = this.scene;
        const tree = this.getSkillTree();
        const skills = [];
        
        for (const [key, skill] of Object.entries(tree.skills)) {
            skills.push({
                key,
                ...skill,
                learned: playerState.unlockedSkills.includes(key),
                canLearn: this.canLearnSkill(key).canLearn
            });
        }
        
        // Sort by tier
        skills.sort((a, b) => a.tier - b.tier);
        
        return skills;
    }

    /**
     * Check if player has a specific skill
     * @param {string} skillKey - Skill to check
     * @returns {boolean}
     */
    hasSkill(skillKey) {
        const { playerState } = this.scene;
        return playerState.unlockedSkills && playerState.unlockedSkills.includes(skillKey);
    }

    /**
     * Get skill effect value
     * @param {string} effectName - Effect to look up
     * @returns {*} Effect value
     */
    getSkillEffect(effectName) {
        const { playerState } = this.scene;
        if (!playerState.unlockedSkills) return null;
        
        const tree = this.getSkillTree();
        
        for (const skillKey of playerState.unlockedSkills) {
            const skill = tree.skills[skillKey];
            if (!skill || !skill.effect) continue;
            
            // Parse effect string (e.g., "damageBonus: 0.25")
            const effects = skill.effect.split(', ');
            for (const effect of effects) {
                const [key, value] = effect.split(': ');
                if (key === effectName) {
                    return parseFloat(value);
                }
            }
        }
        
        return null;
    }

    /**
     * Check and activate active skills in combat
     * @param {string} skillKey - Active skill to activate
     * @param {Object} combatState - Current combat state
     * @returns {Object} Skill activation result
     */
    activateSkill(skillKey, combatState) {
        const { playerState } = this.scene;
        
        if (!this.hasSkill(skillKey)) {
            return { success: false, reason: 'Skill not learned' };
        }
        
        const tree = this.getSkillTree();
        const skill = tree.skills[skillKey];
        
        if (!skill.active) {
            return { success: false, reason: 'Not an active skill' };
        }
        
        // Check cooldown
        const lastUsed = playerState.skillCooldowns?.[skillKey] || 0;
        const now = this.scene.time.now / 1000; // Convert to seconds
        
        if (skill.cooldown && now - lastUsed < skill.cooldown) {
            const remaining = Math.ceil(skill.cooldown - (now - lastUsed));
            return { success: false, reason: `Cooldown: ${remaining}s` };
        }
        
        // Mark skill as used
        if (!playerState.skillCooldowns) {
            playerState.skillCooldowns = {};
        }
        playerState.skillCooldowns[skillKey] = now;
        
        return {
            success: true,
            skill: skill,
            effect: skill.effect
        };
    }

    /**
     * Get current cooldown for a skill
     * @param {string} skillKey - Skill to check
     * @returns {number} Cooldown remaining in seconds
     */
    getSkillCooldown(skillKey) {
        const { playerState } = this.scene;
        const skill = this.getSkillTree().skills[skillKey];
        
        if (!skill || !skill.active || !skill.cooldown) return 0;
        
        const lastUsed = playerState.skillCooldowns?.[skillKey] || 0;
        const now = this.scene.time.now / 1000;
        const remaining = skill.cooldown - (now - lastUsed);
        
        return Math.max(0, remaining);
    }

    /**
     * Open skill tree UI
     */
    openSkillTreeUI() {
        if (this.ui && this.ui.isOpen) return;
        
        this.ui = new SkillTreeUI(this.scene);
        this.ui.open();
    }
}

/**
 * Skill Tree UI Class
 */
class SkillTreeUI {
    constructor(scene) {
        this.scene = scene;
        this.isOpen = false;
        this.container = null;
    }

    open() {
        if (this.isOpen) return;
        this.isOpen = true;

        const { width, height } = this.scene.scale;
        const skillTree = new SkillTree(this.scene);
        const playerSkills = skillTree.getPlayerSkills();
        const { playerState } = this.scene;

        // Container
        this.container = this.scene.add.container(0, 0).setScrollFactor(0).setDepth(2000);

        // Overlay
        const overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);
        this.container.add(overlay);

        // Background panel
        const panel = this.scene.add.rectangle(width / 2, height / 2, 1000, 700, 0x1a1a2e);
        panel.setStrokeStyle(4, 0x4a4a6a);
        this.container.add(panel);

        // Title
        const title = this.scene.add.text(width / 2, 80, 'SKILL TREE', {
            fontFamily: 'Press Start 2P',
            fontSize: '28px',
            color: '#ffd700'
        }).setOrigin(0.5);
        this.container.add(title);

        // Class type
        const className = SKILL_TREES[playerState.classType || 'luck'].name;
        const classText = this.scene.add.text(width / 2, 120, className, {
            fontFamily: 'Press Start 2P',
            fontSize: '16px',
            color: '#aaaaff'
        }).setOrigin(0.5);
        this.container.add(classText);

        // Points display
        const pointsText = this.scene.add.text(width / 2, 160, 
            `Ability Points: ${playerState.abilityPoints} | Stat Points: ${playerState.statPoints}`, {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: '#ffcc00'
        }).setOrigin(0.5);
        this.container.add(pointsText);

        // Create skill cards
        const tiers = [1, 2, 3];
        const tierX = [width / 2 - 300, width / 2, width / 2 + 300];

        tiers.forEach((tier, tierIndex) => {
            const tierSkills = playerSkills.filter(s => s.tier === tier);
            
            tierSkills.forEach((skill, skillIndex) => {
                const x = tierX[tierIndex];
                const y = 280 + skillIndex * 120;
                
                this.createSkillCard(x, y, skill, skillTree);
            });
        });

        // Close button
        const closeBtn = this.scene.add.rectangle(width / 2, height - 80, 200, 50, 0x2a2a4a);
        closeBtn.setStrokeStyle(2, 0xff4444);
        closeBtn.setInteractive({ useHandCursor: true });
        this.container.add(closeBtn);

        const closeText = this.scene.add.text(width / 2, height - 80, 'CLOSE', {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.container.add(closeText);

        closeBtn.on('pointerover', () => closeBtn.setFillStyle(0x4a4a6a));
        closeBtn.on('pointerout', () => closeBtn.setFillStyle(0x2a2a4a));
        closeBtn.on('pointerup', () => this.close());
    }

    createSkillCard(x, y, skill, skillTree) {
        const { playerState } = this.scene;
        
        // Card background
        const cardColor = skill.learned ? 0x2a4a2a : (skill.canLearn ? 0x2a2a4a : 0x1a1a2a);
        const strokeColor = skill.learned ? 0x00ff00 : (skill.canLearn ? 0xffd700 : 0x444444);
        
        const card = this.scene.add.rectangle(x, y, 260, 100, cardColor);
        card.setStrokeStyle(2, strokeColor);
        this.container.add(card);

        // Skill name
        const nameText = this.scene.add.text(x, y - 30, skill.name, {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: skill.learned ? '#00ff00' : '#ffffff'
        }).setOrigin(0.5);
        this.container.add(nameText);

        // Description
        const descText = this.scene.add.text(x, y, skill.description, {
            fontFamily: 'Press Start 2P',
            fontSize: '10px',
            color: '#aaaaaa',
            wordWrap: { width: 240 }
        }).setOrigin(0.5, 0.5);
        this.container.add(descText);

        // Bonus text
        const bonusText = this.scene.add.text(x, y + 25, skill.bonus, {
            fontFamily: 'Press Start 2P',
            fontSize: '9px',
            color: '#ffcc00',
            wordWrap: { width: 240 }
        }).setOrigin(0.5, 0);
        this.container.add(bonusText);

        // Learn button (if not learned and can learn)
        if (!skill.learned && skill.canLearn) {
            const learnBtn = this.scene.add.rectangle(x, y + 45, 100, 30, 0x4a4a2a);
            learnBtn.setStrokeStyle(2, 0xffd700);
            learnBtn.setInteractive({ useHandCursor: true });
            this.container.add(learnBtn);

            const learnText = this.scene.add.text(x, y + 45, 'LEARN (1 AP)', {
                fontFamily: 'Press Start 2P',
                fontSize: '10px',
                color: '#ffd700'
            }).setOrigin(0.5);
            this.container.add(learnText);

            learnBtn.on('pointerover', () => learnBtn.setFillStyle(0x6a6a4a));
            learnBtn.on('pointerout', () => learnBtn.setFillStyle(0x4a4a2a));
            learnBtn.on('pointerup', () => {
                if (skillTree.learnSkill(skill.key)) {
                    this.close();
                    // Reopen to refresh
                    this.scene.time.delayedCall(100, () => {
                        this.scene.skillTree.openSkillTreeUI();
                    });
                }
            });
        } else if (skill.learned) {
            const learnedText = this.scene.add.text(x, y + 45, 'LEARNED', {
                fontFamily: 'Press Start 2P',
                fontSize: '10px',
                color: '#00ff00'
            }).setOrigin(0.5);
            this.container.add(learnedText);
        } else {
            const lockedText = this.scene.add.text(x, y + 45, 'LOCKED', {
                fontFamily: 'Press Start 2P',
                fontSize: '10px',
                color: '#666666'
            }).setOrigin(0.5);
            this.container.add(lockedText);
        }
    }

    close() {
        if (!this.isOpen) return;
        this.isOpen = false;
        
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
    }
}
