import { CONFIG } from './config.js';

/**
 * QuestSystem - Tracks chapter progress, active/completed quests,
 * reputation, and faction relationships
 */
export default class QuestSystem {
    constructor(scene) {
        this.scene = scene;
        
        // Chapter system (1-4)
        this.currentChapter = 1;
        this.chapterComplete = false;
        
        // Quest tracking
        this.activeQuests = [];
        this.completedQuests = [];
        
        // Reputation (0-100)
        this.reputation = 0;
        
        // Faction relationships: 'allied', 'neutral', 'hostile'
        this.factionRelationships = {};
        this.initializeFactions();
        
        // Track milestones for chapter progression
        this.hasInteractedWithSupplier = false;
        this.hasEarned1000 = false;
        this.hasTier2Safehouse = false;
        this.hasEarned50K = false;
        
        // Quest definitions
        this.questDefinitions = this.getQuestDefinitions();
        
        // Current main quest
        this.mainQuest = null;
    }
    
    /**
     * Initialize faction relationships to neutral
     */
    initializeFactions() {
        const factions = ['The Don', 'Viper', 'Rook', 'Ghost', 'Iron', 'Fang', 
                         'Storm', 'Shade', 'Blaze', 'Frost', 'Razor', 'Byte'];
        factions.forEach(faction => {
            this.factionRelationships[faction] = 'neutral';
        });
    }
    
    /**
     * Get quest definitions from QUESTS.md
     */
    getQuestDefinitions() {
        return {
            // Chapter 1: Getting Established
            chapter1_main: {
                id: 'chapter1_main',
                title: 'Getting Established',
                description: 'Meet 3 suppliers and make your first $1,000',
                objectives: [
                    { id: 'talk_suppliers', text: 'Talk to suppliers in each territory', complete: false },
                    { id: 'buy_product', text: 'Buy product from any supplier', complete: false },
                    { id: 'earn_1000', text: 'Earn $1,000 from sales', complete: false }
                ],
                rewards: { money: 500, reputation: 10, unlock: 'Connected status, runners' },
                chapter: 1
            },
            
            // Chapter 2: Building the Network
            chapter2_main: {
                id: 'chapter2_main',
                title: 'Building the Network',
                description: 'Earn $10,000 and unlock Tier 2 safehouse',
                objectives: [
                    { id: 'expand_territories', text: 'Expand operations to 3+ territories', complete: false },
                    { id: 'hire_runner', text: 'Hire your first runner', complete: false },
                    { id: 'keep_heat_low', text: 'Maintain heat below 50%', complete: false },
                    { id: 'earn_10k', text: 'Earn $10,000', complete: false }
                ],
                rewards: { money: 2000, reputation: 25, unlock: 'Tier 2 safehouse' },
                chapter: 2
            },
            
            // Chapter 3: The Faction Wars
            chapter3_main: {
                id: 'chapter3_main',
                title: 'The Faction Wars',
                description: 'Choose a faction alliance, earn $50,000',
                objectives: [
                    { id: 'choose_faction', text: 'Choose a faction to ally with', complete: false },
                    { id: 'faction_missions', text: 'Complete 3 missions for your faction', complete: false },
                    { id: 'gain_territory', text: 'Gain territory in faction stronghold', complete: false },
                    { id: 'earn_50k', text: 'Earn $50,000', complete: false }
                ],
                rewards: { money: 5000, reputation: 50, unlock: 'Faction headquarters' },
                chapter: 3
            },
            
            // Chapter 4: Taking Over The Docks
            chapter4_main: {
                id: 'chapter4_main',
                title: 'Taking Over The Docks',
                description: 'Earn $500,000 and control 50% of territories',
                objectives: [
                    { id: 'eliminate_rivals', text: 'Eliminate rival faction leaders (optional)', complete: false },
                    { id: 'final_quest', text: 'Complete final faction quest', complete: false },
                    { id: 'control_empire', text: 'Build empire across all territories', complete: false }
                ],
                rewards: { money: 10000, reputation: 100, unlock: 'Victory - King of The Docks' },
                chapter: 4
            },
            
            // ============================================================
            // RIVERSIDE FINAL QUEST - Triggers the raid and transition to Big City
            // ============================================================
            riverside_final_quest: {
                id: 'riverside_final_quest',
                title: 'The Last Deal',
                description: 'Make one final deal that attracts federal attention. Your operation is too big to hide anymore.',
                objectives: [
                    { id: 'final_delivery', text: 'Complete a major delivery to any faction', complete: false },
                    { id: 'big_score', text: 'Earn $100,000 from a single transaction', complete: false }
                ],
                rewards: { money: 50000, reputation: 100, unlock: 'Transfer to Big City' },
                chapter: 0, // Special quest not tied to chapters
                isFinalQuest: true,
                triggersRaid: true,
                isMainPlugQuestHub: true,
                availableIn: ['RIVERSIDE']
            },
            
            // Side quests by faction
            side_don_delivery: {
                id: 'side_don_delivery',
                title: 'The Don: Delivery',
                description: 'Bring 10 product to their warehouse',
                objectives: [
                    { id: 'deliver_product', text: 'Deliver 10 product to Don\'s warehouse', complete: false }
                ],
                rewards: { money: 1000, reputation: 15 },
                faction: 'The Don',
                difficulty: 'medium'
            },
            
            side_don_protection: {
                id: 'side_don_protection',
                title: 'The Don: Protection',
                description: 'Defend their shipment from rival',
                objectives: [
                    { id: 'protect_shipment', text: 'Defend shipment from rivals', complete: false }
                ],
                rewards: { money: 2000, reputation: 20 },
                faction: 'The Don',
                difficulty: 'hard'
            },
            
            side_viper_sample: {
                id: 'side_viper_sample',
                title: 'Viper: Sample Testing',
                description: 'Test new product on customers',
                objectives: [
                    { id: 'test_product', text: 'Test new product and report results', complete: false }
                ],
                rewards: { money: 500, reputation: 10 },
                faction: 'Viper',
                difficulty: 'easy'
            },
            
            side_viper_competition: {
                id: 'side_viper_competition',
                title: 'Viper: Competition',
                description: 'Drive out a street dealer',
                objectives: [
                    { id: 'drive_out', text: 'Remove competing dealer from territory', complete: false }
                ],
                rewards: { money: 1500, reputation: 15 },
                faction: 'Viper',
                difficulty: 'medium'
            },
            
            side_rook_gambling: {
                id: 'side_rook_gambling',
                title: 'Rook: Gambling Setup',
                description: 'Establish a poker game location',
                objectives: [
                    { id: 'setup_poker', text: 'Set up poker location', complete: false }
                ],
                rewards: { money: 1500, reputation: 15 },
                faction: 'Rook',
                difficulty: 'medium'
            },
            
            side_rook_debts: {
                id: 'side_rook_debts',
                title: 'Rook: Debts',
                description: 'Collect from a deadbeat customer',
                objectives: [
                    { id: 'collect_debt', text: 'Collect debt from customer', complete: false }
                ],
                rewards: { money: 1000, reputation: 10 },
                faction: 'Rook',
                difficulty: 'easy'
            },
            
            side_ghost_elimination: {
                id: 'side_ghost_elimination',
                title: 'Ghost: Elimination',
                description: 'Remove a target (optional kill)',
                objectives: [
                    { id: 'eliminate_target', text: 'Eliminate the target', complete: false }
                ],
                rewards: { money: 5000, reputation: 30 },
                faction: 'Ghost',
                difficulty: 'hard'
            },
            
            side_iron_vehicle: {
                id: 'side_iron_vehicle',
                title: 'Iron: Vehicle',
                description: 'Acquire a specific vehicle',
                objectives: [
                    { id: 'acquire_vehicle', text: 'Find and deliver the vehicle', complete: false }
                ],
                rewards: { money: 2000, reputation: 20 },
                faction: 'Iron',
                difficulty: 'medium'
            },
            
            side_fang_scavenge: {
                id: 'side_fang_scavenge',
                title: 'Fang: Scavenge',
                description: 'Find valuable scrap from the docks',
                objectives: [
                    { id: 'find_scrap', text: 'Find valuable scrap', complete: false }
                ],
                rewards: { money: 500, reputation: 5 },
                faction: 'Fang',
                difficulty: 'easy'
            },
            
            side_storm_getaway: {
                id: 'side_storm_getaway',
                title: 'Storm: Getaway',
                description: 'Provide escape route for a job',
                objectives: [
                    { id: 'provide_escape', text: 'Provide boat escape route', complete: false }
                ],
                rewards: { money: 1500, reputation: 15 },
                faction: 'Storm',
                difficulty: 'medium'
            },
            
            side_shade_acquisition: {
                id: 'side_shade_acquisition',
                title: 'Shade: Acquisition',
                description: 'Obtain specific black market item',
                objectives: [
                    { id: 'get_item', text: 'Obtain black market item', complete: false }
                ],
                rewards: { money: 2000, reputation: 20 },
                faction: 'Shade',
                difficulty: 'medium'
            },
            
            side_blaze_supply: {
                id: 'side_blaze_supply',
                title: 'Blaze: Supply Run',
                description: 'Source chemical precursors',
                objectives: [
                    { id: 'source_chemicals', text: 'Source chemical precursors', complete: false }
                ],
                rewards: { money: 1000, reputation: 10 },
                faction: 'Blaze',
                difficulty: 'easy'
            },
            
            side_frost_smuggling: {
                id: 'side_frost_smuggling',
                title: 'Frost: Smuggling',
                description: 'Move illegal cargo through docks',
                objectives: [
                    { id: 'move_cargo', text: 'Move cargo through docks', complete: false }
                ],
                rewards: { money: 3000, reputation: 25 },
                faction: 'Frost',
                difficulty: 'hard'
            },
            
            side_razor_arms: {
                id: 'side_razor_arms',
                title: 'Razor: Arms Deal',
                description: 'Complete a weapon transaction',
                objectives: [
                    { id: 'complete_deal', text: 'Complete weapon deal', complete: false }
                ],
                rewards: { money: 3000, reputation: 25 },
                faction: 'Razor',
                difficulty: 'hard'
            },
            
            side_byte_hack: {
                id: 'side_byte_hack',
                title: 'Byte: Hack',
                description: 'Breach a rival\'s communications',
                objectives: [
                    { id: 'breach_comms', text: 'Hack rival communications', complete: false }
                ],
                rewards: { money: 2500, reputation: 20 },
                faction: 'Byte',
                difficulty: 'hard'
            }
        };
    }
    
    /**
     * Check and update chapter progression based on game events
     */
    checkChapterProgress() {
        const player = this.scene.playerState;
        
        // Chapter 1: After first supplier interaction
        if (this.currentChapter === 1 && this.hasInteractedWithSupplier && !this.mainQuest) {
            this.startChapter1Quest();
        }
        
        // Check Chapter 1 completion (earn $1,000)
        if (this.currentChapter === 1 && player.money >= 1000 && !this.hasEarned1000) {
            this.hasEarned1000 = true;
            this.updateMainQuestObjective('earn_1000', true);
            
            // Check if all objectives complete
            if (this.areAllObjectivesComplete('chapter1_main')) {
                this.completeChapter(1);
            }
        }
        
        // Chapter 2: After earning $1,000
        if (this.currentChapter === 1 && this.hasEarned1000 && player.money >= 1000) {
            this.currentChapter = 2;
            this.startChapter2Quest();
        }
        
        // Check Chapter 2 completion (Tier 2 safehouse + $10k)
        if (this.currentChapter === 2 && player.safehouseTier >= 1 && !this.hasTier2Safehouse) {
            this.hasTier2Safehouse = true;
            this.updateMainQuestObjective('keep_heat_low', true);
            
            if (player.money >= 10000) {
                this.updateMainQuestObjective('earn_10k', true);
            }
            
            if (this.areAllObjectivesComplete('chapter2_main')) {
                this.completeChapter(2);
            }
        }
        
        // Chapter 3: After Tier 2 safehouse
        if (this.currentChapter === 2 && this.hasTier2Safehouse) {
            this.currentChapter = 3;
            this.startChapter3Quest();
        }
        
        // Check Chapter 3 completion ($50k + faction alliance)
        if (this.currentChapter === 3 && player.money >= 50000 && !this.hasEarned50K) {
            this.hasEarned50K = true;
            this.updateMainQuestObjective('earn_50k', true);
            
            if (this.areAllObjectivesComplete('chapter3_main')) {
                this.completeChapter(3);
            }
        }
        
        // Chapter 4: After $50K
        if (this.currentChapter === 3 && this.hasEarned50K) {
            this.currentChapter = 4;
            this.startChapter4Quest();
        }
        
        // Always update heat-related objectives
        if (this.currentChapter === 2 && player.heat < 50) {
            this.updateMainQuestObjective('keep_heat_low', true);
        }
    }
    
    /**
     * Called when player interacts with a supplier
     */
    onSupplierInteraction() {
        if (!this.hasInteractedWithSupplier) {
            this.hasInteractedWithSupplier = true;
            this.checkChapterProgress();
            
            // Update quest objective
            if (this.mainQuest && this.mainQuest.id === 'chapter1_main') {
                this.updateMainQuestObjective('talk_suppliers', true);
            }
        }
    }
    
    /**
     * Called when player buys product from a supplier
     */
    onBuyFromSupplier() {
        if (this.mainQuest && this.mainQuest.id === 'chapter1_main') {
            this.updateMainQuestObjective('buy_product', true);
        }
        this.onSupplierInteraction();
    }
    
    /**
     * Called when player hires a runner
     */
    onHireRunner() {
        if (this.mainQuest && this.mainQuest.id === 'chapter2_main') {
            this.updateMainQuestObjective('hire_runner', true);
        }
    }
    
    /**
     * Called when player upgrades safehouse
     */
    onSafehouseUpgrade(tier) {
        if (tier >= 1 && !this.hasTier2Safehouse) {
            this.hasTier2Safehouse = true;
            this.checkChapterProgress();
        }
    }
    
    /**
     * Start Chapter 1 main quest
     */
    startChapter1Quest() {
        const quest = this.questDefinitions.chapter1_main;
        this.mainQuest = JSON.parse(JSON.stringify(quest)); // Deep copy
        this.activeQuests.push(this.mainQuest);
        this.showQuestNotification(`📜 Chapter 1: ${quest.title}`, quest.description);
    }
    
    /**
     * Start Chapter 2 main quest
     */
    startChapter2Quest() {
        const quest = this.questDefinitions.chapter2_main;
        this.mainQuest = JSON.parse(JSON.stringify(quest));
        this.activeQuests.push(this.mainQuest);
        this.showQuestNotification(`📜 Chapter 2: ${quest.title}`, quest.description);
    }
    
    /**
     * Start Chapter 3 main quest
     */
    startChapter3Quest() {
        const quest = this.questDefinitions.chapter3_main;
        this.mainQuest = JSON.parse(JSON.stringify(quest));
        this.activeQuests.push(this.mainQuest);
        this.showQuestNotification(`📜 Chapter 3: ${quest.title}`, quest.description);
    }
    
    /**
     * Start Chapter 4 main quest
     */
    startChapter4Quest() {
        const quest = this.questDefinitions.chapter4_main;
        this.mainQuest = JSON.parse(JSON.stringify(quest));
        this.activeQuests.push(this.mainQuest);
        this.showQuestNotification(`📜 Chapter 4: ${quest.title}`, quest.description);
    }
    
    /**
     * Update a main quest objective as complete
     */
    updateMainQuestObjective(objectiveId, complete) {
        if (!this.mainQuest) return;
        
        const objective = this.mainQuest.objectives.find(o => o.id === objectiveId);
        if (objective) {
            objective.complete = complete;
            
            // Show notification
            if (complete) {
                this.scene.showFloatingText(`✓ Objective Complete: ${objective.text}`, '#00ff00');
            }
        }
    }
    
    /**
     * Check if all objectives in a quest are complete
     */
    areAllObjectivesComplete(questId) {
        // Find the active quest (not from definitions - definitions are static templates)
        const activeQuest = this.activeQuests.find(q => q.id === questId);
        if (!activeQuest) return false;
        
        return activeQuest.objectives.every(o => o.complete);
    }
    
    /**
     * Complete a chapter
     */
    completeChapter(chapter) {
        const rewards = this.mainQuest.rewards;
        
        // Grant rewards
        if (rewards.money) {
            this.scene.playerState.money += rewards.money;
            this.scene.showFloatingText(`+$${rewards.money}`, '#00ff00');
        }
        
        if (rewards.reputation) {
            this.addReputation(rewards.reputation);
        }
        
        // NEW: Grant XP for chapter completion
        if (this.scene.levelSystem) {
            const xpReward = 200 + (chapter * 100); // More XP for later chapters
            this.scene.levelSystem.addXP(xpReward, 'quest');
        }
        
        // Show completion notification
        this.showQuestNotification(
            `🎉 Chapter ${chapter} Complete!`,
            `Rewards: $${rewards.money}, +${rewards.reputation} rep, ${rewards.unlock}`
        );
        
        // Mark quest as completed
        this.completedQuests.push({ ...this.mainQuest });
        this.activeQuests = this.activeQuests.filter(q => q.id !== this.mainQuest.id);
        this.mainQuest = null;
        
        this.chapterComplete = true;
    }
    
    /**
     * Add reputation points
     */
    addReputation(amount) {
        this.reputation = Math.min(100, this.reputation + amount);
        this.scene.showFloatingText(`Reputation: ${this.reputation}`, '#ffaa00');
    }
    
    /**
     * Set faction relationship
     */
    setFactionRelationship(faction, relationship) {
        // relationship: 'allied', 'neutral', 'hostile'
        this.factionRelationships[faction] = relationship;
        
        const color = relationship === 'allied' ? '#00ff00' : 
                     relationship === 'hostile' ? '#ff0000' : '#ffffff';
        this.scene.showFloatingText(`${faction}: ${relationship}`, color);
    }
    
    /**
     * Get faction relationship
     */
    getFactionRelationship(faction) {
        return this.factionRelationships[faction] || 'neutral';
    }
    
    /**
     * Accept a side quest
     */
    acceptQuest(questId) {
        const questDef = this.questDefinitions[questId];
        if (!questDef) return false;
        
        // Check if already active or completed
        if (this.activeQuests.find(q => q.id === questId)) return false;
        if (this.completedQuests.find(q => q.id === questId)) return false;
        
        const quest = JSON.parse(JSON.stringify(questDef));
        this.activeQuests.push(quest);
        this.showQuestNotification(`📜 New Quest: ${quest.title}`, quest.description);
        
        return true;
    }
    
    /**
     * Complete a side quest
     */
    completeQuest(questId) {
        const questIndex = this.activeQuests.findIndex(q => q.id === questId);
        if (questIndex === -1) return false;
        
        const quest = this.activeQuests[questIndex];
        // Use quest.rewards directly - it's already copied when quest was accepted
        const rewards = quest.rewards;
        
        // Grant rewards
        if (rewards.money) {
            this.scene.playerState.money += rewards.money;
            this.scene.showFloatingText(`+$${rewards.money}`, '#00ff00');
        }
        
        if (rewards.reputation) {
            this.addReputation(rewards.reputation);
        }
        
        // NEW: Grant XP for side quest completion
        if (this.scene.levelSystem) {
            const xpReward = 50 + Math.floor(Math.random() * 50); // 50-100 XP
            this.scene.levelSystem.addXP(xpReward, 'quest');
        }
        
        // Update faction relationship if applicable
        if (quest.faction) {
            const currentRel = this.getFactionRelationship(quest.faction);
            if (currentRel === 'neutral') {
                this.setFactionRelationship(quest.faction, 'allied');
            }
        }
        
        // Mark complete
        this.completedQuests.push(quest);
        this.activeQuests.splice(questIndex, 1);
        
        this.showQuestNotification(`✅ Quest Complete: ${quest.title}`, `Reward: $${rewards.money}`);
        
        // NEW: Trigger callback for quest completion (e.g., police suspicion)
        if (this.scene.onQuestComplete) {
            this.scene.onQuestComplete(questId);
        }
        
        return true;
    }
    
    /**
     * Show quest notification
     */
    showQuestNotification(title, description) {
        // Create a floating notification in game
        const { width, height } = this.scene.scale;
        
        const bg = this.scene.add.rectangle(
            width / 2, height / 2 - 100,
            600, 80, 0x000000, 0.8
        ).setScrollFactor(0).setDepth(600);
        
        const titleText = this.scene.add.text(
            width / 2, height / 2 - 130,
            title, {
                fontFamily: 'Press Start 2P',
                fontSize: '16px',
                color: '#ffaa00'
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(601);
        
        const descText = this.scene.add.text(
            width / 2, height / 2 - 100,
            description, {
                fontFamily: 'Press Start 2P',
                fontSize: '10px',
                color: '#ffffff'
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(601);
        
        // Fade out and destroy after 4 seconds
        this.scene.tweens.add({
            targets: [bg, titleText, descText],
            alpha: 0,
            duration: 1000,
            delay: 3000,
            onComplete: () => {
                bg.destroy();
                titleText.destroy();
                descText.destroy();
            }
        });
    }
    
    /**
     * Get current chapter info for HUD
     */
    getChapterInfo() {
        return {
            chapter: this.currentChapter,
            title: this.getChapterTitle(this.currentChapter),
            progress: this.getChapterProgress()
        };
    }
    
    getChapterTitle(chapter) {
        const titles = {
            1: 'Getting Established',
            2: 'Building the Network',
            3: 'The Faction Wars',
            4: 'Taking Over The Docks'
        };
        return titles[chapter] || 'Unknown';
    }
    
    getChapterProgress() {
        if (!this.mainQuest) return 0;
        
        const completed = this.mainQuest.objectives.filter(o => o.complete).length;
        return Math.floor((completed / this.mainQuest.objectives.length) * 100);
    }
    
    /**
     * Get reputation tier
     */
    getReputationTier() {
        if (this.reputation <= 25) return 'Street Level';
        if (this.reputation <= 50) return 'Connected';
        if (this.reputation <= 75) return 'Respected';
        return 'King of The Docks';
    }
    
    /**
     * Get save data for persistence
     */
    getSaveData() {
        return {
            currentChapter: this.currentChapter,
            chapterComplete: this.chapterComplete,
            activeQuests: this.activeQuests,
            completedQuests: this.completedQuests,
            reputation: this.reputation,
            factionRelationships: this.factionRelationships,
            hasInteractedWithSupplier: this.hasInteractedWithSupplier,
            hasEarned1000: this.hasEarned1000,
            hasTier2Safehouse: this.hasTier2Safehouse,
            hasEarned50K: this.hasEarned50K
        };
    }
    
    /**
     * Load save data
     */
    loadSaveData(data) {
        if (data.currentChapter) this.currentChapter = data.currentChapter;
        if (data.chapterComplete) this.chapterComplete = data.chapterComplete;
        if (data.activeQuests) this.activeQuests = data.activeQuests;
        if (data.completedQuests) this.completedQuests = data.completedQuests;
        if (data.reputation) this.reputation = data.reputation;
        if (data.factionRelationships) this.factionRelationships = data.factionRelationships;
        if (data.hasInteractedWithSupplier) this.hasInteractedWithSupplier = data.hasInteractedWithSupplier;
        if (data.hasEarned1000) this.hasEarned1000 = data.hasEarned1000;
        if (data.hasTier2Safehouse) this.hasTier2Safehouse = data.hasTier2Safehouse;
        if (data.hasEarned50K) this.hasEarned50K = data.hasEarned50K;
        
        // Restore main quest reference
        if (this.activeQuests.length > 0) {
            this.mainQuest = this.activeQuests.find(q => q.id.startsWith('chapter')) || this.activeQuests[0];
        }
    }
}
