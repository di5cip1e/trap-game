/**
 * SkillTree.js - Complete Skill Tree System
 * Refactored with object-based effects
 */

import { CONFIG } from './config.js';

export const SKILL_TREES = {
    // INTUITION TREE
    intuition: {
        name: 'Street Smart',
        skills: {
            lockpick: { name: 'Lockpick', tier: 1, passive: true, effects: { safehouseEntrySpeed: 0.5 }, bonus: 'Can unlock locked doors' },
            street_sense: { name: 'Street Sense', tier: 1, passive: true, effects: { detectHidden: true }, bonus: 'Reveals concealed enemies' },
            sneak: { name: 'Sneak', tier: 2, passive: true, effects: { sneakHeatReduction: 1.0 }, bonus: 'Stealth movement' },
            intimidate: { name: 'Intimidate', tier: 2, active: true, cooldown: 30, effects: { intimidateChance: 0.5 }, bonus: '50% flee chance' },
            shadow_walk: { name: 'Shadow Walk', tier: 3, active: true, cooldown: 60, effects: { invisibleDuration: 5 }, bonus: '5s invisibility' },
            deadly_precision: { name: 'Deadly Precision', tier: 3, passive: true, effects: { critChance: 0.25, critDamage: 0.5 }, bonus: '+25% crit chance' }
        }
    },
    
    // ABILITY TREE
    ability: {
        name: 'Enforcer',
        skills: {
            iron_fist: { name: 'Iron Fist', tier: 1, passive: true, effects: { damageBonus: 0.25 }, bonus: '+25% damage' },
            toughness: { name: 'Toughness', tier: 1, passive: true, effects: { hpBonus: 25, damageReduction: 0.1 }, bonus: '+25 HP, 10% DR' },
            power_strike: { name: 'Power Strike', tier: 2, active: true, cooldown: 15, effects: { powerStrikeDamage: 2.0 }, bonus: '2x damage attack' },
            last_stand: { name: 'Last Stand', tier: 2, passive: true, effects: { lastStandThreshold: 0.25, lastStandBonus: 0.5 }, bonus: '+50% dmg at low HP' },
            berserk: { name: 'Berserk', tier: 3, active: true, cooldown: 90, effects: { berserkDuration: 8, berserkDamage: 2.0 }, bonus: '8s of 2x damage' },
            unbreakable: { name: 'Unbreakable', tier: 3, passive: true, effects: { deathSave: 1 }, bonus: 'Survive fatal blow' }
        }
    },
    
    // WEAPONS TREE (Universal)
    weapons: {
        name: 'Combat Master',
        skills: {
            dual_wield: { name: 'Dual Wield', tier: 1, passive: true, effects: { secondWeaponSlot: true }, bonus: 'Second weapon slot' },
            quick_draw: { name: 'Quick Draw', tier: 2, passive: true, effects: { attackSpeedBonus: 0.2 }, bonus: '+20% attack speed' },
            automatic_weapons: { name: 'Auto Weapons', tier: 3, passive: true, effects: { automaticWeapons: true }, bonus: 'Unlock automatic weapons' },
            dead_eye: { name: 'Dead Eye', tier: 3, passive: true, effects: { damageBonus: 0.3, critChance: 0.1 }, bonus: '+30% damage' }
        }
    },
    
    // LUCK TREE
    luck: {
        name: 'Con Artist',
        skills: {
            fast_talk: { name: 'Fast Talk', tier: 1, passive: true, effects: { vendorDiscount: 0.15 }, bonus: '15% vendor discount' },
            lucky_break: { name: 'Lucky Break', tier: 1, passive: true, effects: { luckBonus: 0.2 }, bonus: '+20% luck' },
            card_shark: { name: 'Card Shark', tier: 2, passive: true, effects: { cardGameWinRate: 0.6 }, bonus: '60% win rate' },
            escape_artist: { name: 'Escape Artist', tier: 2, passive: true, effects: { escapeChance: 0.75 }, bonus: '75% escape chance' },
            fortune: { name: 'Fortune', tier: 3, passive: true, effects: { xpBonus: 0.2, allLuck: 0.1 }, bonus: '+20% XP' },
            game_of_chance: { name: 'Game of Chance', tier: 3, active: true, cooldown: 120, effects: { doubleOrNothing: true }, bonus: '50/50 gamble' }
        }
    }
};

export const DEFAULT_SKILL_TREES = {
    intuition: ['lockpick', 'street_sense'],
    ability: ['iron_fist', 'toughness'],
    luck: ['fast_talk', 'lucky_break'],
    weapons: ['dual_wield']
};

export default class SkillTree {
    constructor(scene) {
        this.scene = scene;
        this.currentTree = null;
        this.ui = null;
    }

    initSkillTree(classType) {
        this.currentTree = classType;
        const { playerState } = this.scene;
        if (!playerState.unlockedSkills) playerState.unlockedSkills = [];
        
        const classSkills = DEFAULT_SKILL_TREES[classType] || DEFAULT_SKILL_TREES.luck;
        const weaponSkills = DEFAULT_SKILL_TREES.weapons;
        
        [...classSkills, ...weaponSkills].forEach(s => {
            if (!playerState.unlockedSkills.includes(s)) playerState.unlockedSkills.push(s);
        });
    }

    findSkillDefinition(skillKey) {
        const treeKey = this.scene.playerState.classType || 'luck';
        if (SKILL_TREES[treeKey]?.skills[skillKey]) return { tree: SKILL_TREES[treeKey], skill: SKILL_TREES[treeKey].skills[skillKey] };
        if (SKILL_TREES.weapons.skills[skillKey]) return { tree: SKILL_TREES.weapons, skill: SKILL_TREES.weapons.skills[skillKey] };
        return { tree: null, skill: null };
    }

    getSkillTree() {
        return SKILL_TREES[this.scene.playerState.classType || 'luck'];
    }

    canLearnSkill(skillKey) {
        const { playerState } = this.scene;
        const { tree, skill } = this.findSkillDefinition(skillKey);
        if (!skill) return { canLearn: false, reason: 'Skill not found' };
        if (playerState.unlockedSkills.includes(skillKey)) return { canLearn: false, reason: 'Already learned' };
        if (playerState.abilityPoints < 1) return { canLearn: false, reason: 'No AP' };
        
        if (skill.tier > 1) {
            const tier1 = Object.keys(tree.skills).filter(k => tree.skills[k].tier === 1);
            if (skill.tier === 2 && !tier1.some(s => playerState.unlockedSkills.includes(s))) return { canLearn: false, reason: 'Need Tier 1' };
        }
        return { canLearn: true };
    }

    learnSkill(skillKey) {
        const { playerState } = this.scene;
        const check = this.canLearnSkill(skillKey);
        if (!check.canLearn) { this.scene.showFloatingText(check.reason, '#ff0000'); return false; }
        playerState.abilityPoints--;
        playerState.unlockedSkills.push(skillKey);
        const { skill } = this.findSkillDefinition(skillKey);
        this.scene.showFloatingText('Learned: ' + skill.name + '!', '#00ff00');
        if (this.scene.hud) this.scene.hud.update();
        return true;
    }

    getPlayerSkills() {
        const { playerState } = this.scene;
        const classTreeKey = playerState.classType || 'luck';
        const skills = [];
        
        const addFromTree = (treeKey) => {
            const tree = SKILL_TREES[treeKey];
            for (const [key, skill] of Object.entries(tree.skills)) {
                skills.push({ key, treeKey, categoryName: tree.name, ...skill, learned: playerState.unlockedSkills.includes(key), canLearn: this.canLearnSkill(key).canLearn });
            }
        };
        
        addFromTree(classTreeKey);
        addFromTree('weapons');
        
        skills.sort((a, b) => a.tier - b.tier);
        return skills;
    }

    hasSkill(skillKey) {
        return this.scene.playerState.unlockedSkills?.includes(skillKey);
    }

    getSkillEffect(effectName) {
        const { playerState } = this.scene;
        if (!playerState.unlockedSkills) return null;
        
        for (const skillKey of playerState.unlockedSkills) {
            const { skill } = this.findSkillDefinition(skillKey);
            if (skill?.effects?.[effectName] !== undefined) return skill.effects[effectName];
        }
        return null;
    }

    activateSkill(skillKey, combatScene) {
        const { playerState } = this.scene;
        
        if (!this.hasSkill(skillKey)) return { success: false, reason: 'Not learned' };
        
        const { skill } = this.findSkillDefinition(skillKey);
        if (!skill?.active) return { success: false, reason: 'Not active skill' };
        
        const lastUsed = playerState.skillCooldowns?.[skillKey] || 0;
        const now = this.scene.time.now / 1000;
        
        if (skill.cooldown && now - lastUsed < skill.cooldown) {
            return { success: false, reason: 'Cooldown: ' + Math.ceil(skill.cooldown - (now - lastUsed)) + 's' };
        }
        
        if (!playerState.skillCooldowns) playerState.skillCooldowns = {};
        playerState.skillCooldowns[skillKey] = now;
        
        // === COMBAT EXECUTION ===
        switch (skillKey) {
            case 'intimidate':
                if (Math.random() < 0.5) {
                    combatScene.showDamageText('ENEMY FLED!', combatScene.scale.width/2, 300, 0x00ff00);
                    combatScene.enemyHP = 0;
                    combatScene.enemyFled = true;
                } else {
                    combatScene.showDamageText('Intimidate failed!', combatScene.scale.width/2, 300, 0xffaa00);
                }
                break;
            case 'shadow_walk':
                combatScene.activeEffects.invisible = true;
                combatScene.showDamageText('INVISIBLE!', combatScene.scale.width/2, 400, 0x8888ff);
                combatScene.time.delayedCall(5000, () => delete combatScene.activeEffects.invisible);
                break;
            case 'power_strike':
                const dmg = combatScene.getPlayerDamage() * 2;
                combatScene.enemyHP = Math.max(0, combatScene.enemyHP - dmg);
                combatScene.showDamageText('-' + dmg + '!', combatScene.scale.width/2, 220, 0xff4444);
                break;
            case 'berserk':
                combatScene.activeEffects.berserk = true;
                combatScene.showDamageText('BERSERK!', combatScene.scale.width/2, 400, 0xff0000);
                combatScene.time.delayedCall(8000, () => delete combatScene.activeEffects.berserk);
                break;
            case 'game_of_chance':
                if (Math.random() < 0.5) {
                    const luckDmg = combatScene.getPlayerDamage() * 2;
                    combatScene.enemyHP = Math.max(0, combatScene.enemyHP - luckDmg);
                    combatScene.showDamageText('LUCKY! -' + luckDmg, combatScene.scale.width/2, 220, 0xffd700);
                } else {
                    const badLuck = Math.floor(combatScene.enemy.damage * 0.5);
                    combatScene.playerHP = Math.max(0, combatScene.playerHP - badLuck);
                    combatScene.showDamageText('BAD LUCK! +' + badLuck, combatScene.scale.width/2, 480, 0xff0000);
                }
                break;
        }
        
        return { success: true, skill, effects: skill.effects };
    }

    getSkillCooldown(skillKey) {
        const { skill } = this.findSkillDefinition(skillKey);
        if (!skill?.active?.cooldown) return 0;
        const lastUsed = this.scene.playerState.skillCooldowns?.[skillKey] || 0;
        return Math.max(0, skill.cooldown - (this.scene.time.now/1000 - lastUsed));
    }

    openSkillTreeUI() {
        if (this.ui?.isOpen) return;
        this.ui = new SkillTreeUI(this.scene, this);
        this.ui.open();
    }
}

// UI Class
class SkillTreeUI {
    constructor(scene, skillTreeManager) {
        this.scene = scene;
        this.skillTreeManager = skillTreeManager;
        this.isOpen = false;
    }

    open() {
        if (this.isOpen) return;
        this.isOpen = true;
        const { width, height } = this.scene.scale;
        const playerSkills = this.skillTreeManager.getPlayerSkills();
        const { playerState } = this.scene;
        
        this.container = this.scene.add.container(0, 0).setScrollFactor(0).setDepth(2000);
        this.container.add(this.scene.add.rectangle(width/2, height/2, width, height, 0x000000, 0.85));
        
        const panel = this.scene.add.rectangle(width/2, height/2, 1000, 700, 0x1a1a2e).setStrokeStyle(4, 0x4a4a6a);
        this.container.add(panel);
        
        this.container.add(this.scene.add.text(width/2, 50, 'SKILLS & COMBAT', { fontFamily: 'Press Start 2P', fontSize: '28px', color: '#ffd700' }).setOrigin(0.5));
        
        // Points
        this.container.add(this.scene.add.text(width/2, 90, 'AP: ' + playerState.abilityPoints + ' | SP: ' + playerState.statPoints, { fontFamily: 'Press Start 2P', fontSize: '14px', color: '#ffcc00' }).setOrigin(0.5));
        
        // Stat allocation
        const stats = ['intuition', 'ability', 'luck'];
        const labels = { intuition: 'INT', ability: 'ABI', luck: 'LCK' };
        const statX = [width/2 - 200, width/2, width/2 + 200];
        
        stats.forEach((stat, i) => {
            this.container.add(this.scene.add.text(statX[i], 130, labels[stat] + ': ' + (playerState.stats[stat] || 0), { fontFamily: 'Press Start 2P', fontSize: '12px', color: '#88ff88' }).setOrigin(0.5));
            if (playerState.statPoints > 0) {
                const btn = this.scene.add.text(statX[i] + 50, 130, '+', { fontFamily: 'Press Start 2P', fontSize: '14px', color: '#00ff00' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
                btn.on('pointerup', () => { playerState.statPoints--; playerState.stats[stat]++; this.close(); this.scene.time.delayedCall(100, () => this.open()); });
                this.container.add(btn);
            }
        });
        
        // Skills by tier
        [1, 2, 3].forEach((tier, ti) => {
            const tierSkills = playerSkills.filter(s => s.tier === tier);
            tierSkills.forEach((skill, si) => {
                const x = width/2 + (si - tierSkills.length/2) * 280;
                const y = 220 + ti * 140;
                this.createCard(x, y, skill);
            });
        });
        
        // Close button
        const closeBtn = this.scene.add.rectangle(width/2, height - 50, 200, 50, 0x2a2a4a).setStrokeStyle(2, 0xff4444).setInteractive({ useHandCursor: true });
        this.container.add(closeBtn);
        this.container.add(this.scene.add.text(width/2, height - 50, 'CLOSE', { fontFamily: 'Press Start 2P', fontSize: '14px' }).setOrigin(0.5));
        closeBtn.on('pointerup', () => this.close());
    }

    createCard(x, y, skill) {
        const color = skill.learned ? 0x2a4a2a : (skill.canLearn ? 0x2a2a4a : 0x1a1a2a);
        const stroke = skill.learned ? 0x00ff00 : (skill.canLearn ? 0xffd700 : 0x444444);
        const card = this.scene.add.rectangle(x, y, 260, 120, color).setStrokeStyle(2, stroke);
        this.container.add(card);
        
        this.container.add(this.scene.add.text(x, y - 40, skill.name, { fontFamily: 'Press Start 2P', fontSize: '12px', color: skill.learned ? '#00ff00' : '#fff' }).setOrigin(0.5));
        this.container.add(this.scene.add.text(x, y - 10, skill.description || '', { fontFamily: 'Press Start 2P', fontSize: '9
