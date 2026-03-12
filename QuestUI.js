import { CONFIG } from './config.js';

export default class QuestUI {
    constructor(scene) {
        this.scene = scene;
        this.isOpen = false;
        this.container = null;
    }
    
    /**
     * Create/Update the quest display in HUD area
     */
    create() {
        const { width } = this.scene.scale;
        
        // Quest info panel (bottom-right of HUD area)
        this.questBg = this.scene.add.rectangle(
            width - 220, 150,
            400, 120,
            0x000000, 0.7
        ).setScrollFactor(0).setDepth(502).setAlpha(0);
        
        this.questBg.setStrokeStyle(2, CONFIG.COLORS.primary);
        
        // Chapter text
        this.chapterText = this.scene.add.text(
            width - 420, 100,
            '', {
                fontFamily: 'Press Start 2P',
                fontSize: '12px',
                color: CONFIG.COLORS.primary
            }
        ).setScrollFactor(0).setDepth(502).setAlpha(0);
        
        // Quest title
        this.questTitleText = this.scene.add.text(
            width - 420, 120,
            '', {
                fontFamily: 'Press Start 2P',
                fontSize: '10px',
                color: CONFIG.COLORS.text
            }
        ).setScrollFactor(0).setDepth(502).setAlpha(0);
        
        // Quest objectives container
        this.objectiveTexts = [];
        
        // Quest button to open detailed view
        this.questBtn = this.scene.add.rectangle(
            width - 30, 150,
            50, 50,
            0x2a2a2a
        ).setScrollFactor(0).setDepth(502).setAlpha(0);
        this.questBtn.setStrokeStyle(2, CONFIG.COLORS.primary);
        this.questBtn.setInteractive({ useHandCursor: true });
        
        this.questBtnText = this.scene.add.text(
            width - 30, 150,
            '📜', {
                fontFamily: 'Press Start 2P',
                fontSize: '20px'
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(503).setAlpha(0);
        
        this.questBtn.on('pointerdown', () => {
            this.toggleQuestLog();
        });
        
        this.questBtn.on('pointerover', () => {
            this.questBtn.setFillStyle(0x444444);
        });
        
        this.questBtn.on('pointerout', () => {
            this.questBtn.setFillStyle(0x2a2a2a);
        });
        
        this.update();
    }
    
    /**
     * Update the quest display
     */
    update() {
        const { width } = this.scene.scale;
        const questSystem = this.scene.questSystem;
        
        if (!questSystem) return;
        
        const chapterInfo = questSystem.getChapterInfo();
        
        // Update chapter text
        this.chapterText.setText(`Ch.${chapterInfo.chapter}: ${chapterInfo.title}`);
        
        // Update main quest display
        if (questSystem.mainQuest) {
            this.questTitleText.setText(questSystem.mainQuest.title);
            
            // Clear old objective texts
            this.objectiveTexts.forEach(t => t.destroy());
            this.objectiveTexts = [];
            
            // Show first 3 objectives
            const maxObjectives = 3;
            questSystem.mainQuest.objectives.slice(0, maxObjectives).forEach((obj, index) => {
                const status = obj.complete ? '✓' : '○';
                const color = obj.complete ? CONFIG.COLORS.success : CONFIG.COLORS.textDark;
                
                const objText = this.scene.add.text(
                    width - 420, 140 + (index * 16),
                    `${status} ${obj.text}`, {
                        fontFamily: 'Press Start 2P',
                        fontSize: '8px',
                        color: color
                    }
                ).setScrollFactor(0).setDepth(502);
                
                this.objectiveTexts.push(objText);
            });
            
            // Show progress bar
            this.updateProgressBar(chapterInfo.progress);
        } else {
            this.questTitleText.setText('No active quest');
            this.clearProgressBar();
        }
        
        // Show elements
        this.questBg.setAlpha(1);
        this.chapterText.setAlpha(1);
        this.questTitleText.setAlpha(1);
        this.questBtn.setAlpha(1);
        this.questBtnText.setAlpha(1);
    }
    
    /**
     * Update progress bar
     */
    updateProgressBar(progress) {
        if (!this.progressBarBg) {
            const { width } = this.scene.scale;
            
            this.progressBarBg = this.scene.add.rectangle(
                width - 420, 195,
                380, 15,
                0x1a1a1a
            ).setOrigin(0, 0).setScrollFactor(0).setDepth(502);
            
            this.progressBarFill = this.scene.add.rectangle(
                width - 420, 195,
                0, 15,
                CONFIG.COLORS.primary
            ).setOrigin(0, 0).setScrollFactor(0).setDepth(503);
        }
        
        this.progressBarFill.width = (380 * progress) / 100;
    }
    
    /**
     * Clear progress bar
     */
    clearProgressBar() {
        if (this.progressBarBg) {
            this.progressBarBg.destroy();
            this.progressBarFill.destroy();
            this.progressBarBg = null;
            this.progressBarFill = null;
        }
    }
    
    /**
     * Toggle quest log (detailed view)
     */
    toggleQuestLog() {
        if (this.isOpen) {
            this.closeQuestLog();
        } else {
            this.openQuestLog();
        }
    }
    
    /**
     * Open detailed quest log
     */
    openQuestLog() {
        const { width, height } = this.scene.scale;
        this.isOpen = true;
        
        // Background panel
        this.logBg = this.scene.add.rectangle(
            width / 2, height / 2,
            800, 600,
            0x000000, 0.95
        ).setScrollFactor(0).setDepth(700);
        this.logBg.setStrokeStyle(3, CONFIG.COLORS.primary);
        
        // Title
        this.logTitle = this.scene.add.text(
            width / 2, height / 2 - 260,
            'QUEST LOG', {
                fontFamily: 'Press Start 2P',
                fontSize: '24px',
                color: CONFIG.COLORS.primary
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(701);
        
        // Chapter info
        const questSystem = this.scene.questSystem;
        const chapterInfo = questSystem.getChapterInfo();
        
        this.logChapter = this.scene.add.text(
            width / 2, height / 2 - 210,
            `Chapter ${chapterInfo.chapter}: ${chapterInfo.title}`, {
                fontFamily: 'Press Start 2P',
                fontSize: '14px',
                color: CONFIG.COLORS.text
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(701);
        
        // Reputation display
        this.logReputation = this.scene.add.text(
            width / 2, height / 2 - 180,
            `Reputation: ${questSystem.reputation} - ${questSystem.getReputationTier()}`, {
                fontFamily: 'Press Start 2P',
                fontSize: '12px',
                color: CONFIG.COLORS.primary
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(701);
        
        // Main quest section
        if (questSystem.mainQuest) {
            this.logMainQuestTitle = this.scene.add.text(
                width / 2 - 350, height / 2 - 140,
                'MAIN QUEST:', {
                    fontFamily: 'Press Start 2P',
                    fontSize: '12px',
                    color: CONFIG.COLORS.primary
                }
            ).setScrollFactor(0).setDepth(701);
            
            this.logMainQuestName = this.scene.add.text(
                width / 2 - 350, height / 2 - 120,
                questSystem.mainQuest.title, {
                    fontFamily: 'Press Start 2P',
                    fontSize: '11px',
                    color: CONFIG.COLORS.text
                }
            ).setScrollFactor(0).setDepth(701);
            
            this.logMainQuestDesc = this.scene.add.text(
                width / 2 - 350, height / 2 - 100,
                questSystem.mainQuest.description, {
                    fontFamily: 'Press Start 2P',
                    fontSize: '9px',
                    color: CONFIG.COLORS.textDark
                }
            ).setScrollFactor(0).setDepth(701);
            
            // Objectives
            let objY = height / 2 - 70;
            questSystem.mainQuest.objectives.forEach((obj, index) => {
                const status = obj.complete ? '✓' : '○';
                const color = obj.complete ? CONFIG.COLORS.success : CONFIG.COLORS.textDark;
                
                this.scene.add.text(
                    width / 2 - 350, objY,
                    `${status} ${obj.text}`, {
                        fontFamily: 'Press Start 2P',
                        fontSize: '9px',
                        color: color
                    }
                ).setScrollFactor(0).setDepth(701);
                
                objY += 20;
            });
        }
        
        // Faction relationships
        this.logFactionsTitle = this.scene.add.text(
            width / 2 - 350, height / 2 + 50,
            'FACTION RELATIONSHIPS:', {
                fontFamily: 'Press Start 2P',
                fontSize: '12px',
                color: CONFIG.COLORS.primary
            }
        ).setScrollFactor(0).setDepth(701);
        
        let factionY = height / 2 + 75;
        const factions = Object.keys(questSystem.factionRelationships);
        const shortFactions = ['Don', 'Viper', 'Rook', 'Ghost', 'Iron', 'Fang', 
                               'Storm', 'Shade', 'Blaze', 'Frost', 'Razor', 'Byte'];
        
        factions.forEach((faction, index) => {
            const rel = questSystem.factionRelationships[faction];
            const color = rel === 'allied' ? CONFIG.COLORS.success : 
                         rel === 'hostile' ? CONFIG.COLORS.danger : 
                         CONFIG.COLORS.textDark;
            
            this.scene.add.text(
                width / 2 - 350 + ((index % 6) * 130), factionY + Math.floor(index / 6) * 20,
                `${shortFactions[index]}: ${rel.charAt(0).toUpperCase() + rel.slice(1)}`, {
                    fontFamily: 'Press Start 2P',
                    fontSize: '8px',
                    color: color
                }
            ).setScrollFactor(0).setDepth(701);
        });
        
        // Close button
        this.logCloseBtn = this.scene.add.rectangle(
            width / 2, height / 2 + 260,
            150, 40,
            0x2a2a2a
        ).setScrollFactor(0).setDepth(702);
        this.logCloseBtn.setStrokeStyle(2, CONFIG.COLORS.danger);
        this.logCloseBtn.setInteractive({ useHandCursor: true });
        
        this.logCloseText = this.scene.add.text(
            width / 2, height / 2 + 260,
            'CLOSE', {
                fontFamily: 'Press Start 2P',
                fontSize: '12px',
                color: CONFIG.COLORS.danger
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(703);
        
        this.logCloseBtn.on('pointerdown', () => {
            this.closeQuestLog();
        });
        
        this.logCloseBtn.on('pointerover', () => {
            this.logCloseBtn.setFillStyle(0x444444);
        });
        
        this.logCloseBtn.on('pointerout', () => {
            this.logCloseBtn.setFillStyle(0x2a2a2a);
        });
    }
    
    /**
     * Close detailed quest log
     */
    closeQuestLog() {
        this.isOpen = false;
        
        if (this.logBg) {
            this.logBg.destroy();
            this.logTitle.destroy();
            this.logChapter.destroy();
            this.logReputation.destroy();
            if (this.logMainQuestTitle) this.logMainQuestTitle.destroy();
            if (this.logMainQuestName) this.logMainQuestName.destroy();
            if (this.logMainQuestDesc) this.logMainQuestDesc.destroy();
            if (this.logFactionsTitle) this.logFactionsTitle.destroy();
            this.logCloseBtn.destroy();
            this.logCloseText.destroy();
        }
    }
    
    /**
     * Show mini notification for objective completion
     */
    showObjectiveComplete(objectiveText) {
        const { width } = this.scene.scale;
        
        const notifyBg = this.scene.add.rectangle(
            width / 2, 220,
            400, 30,
            0x000000, 0.8
        ).setScrollFactor(0).setDepth(600);
        
        const notifyText = this.scene.add.text(
            width / 2, 220,
            `✓ ${objectiveText}`, {
                fontFamily: 'Press Start 2P',
                fontSize: '10px',
                color: CONFIG.COLORS.success
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(601);
        
        this.scene.tweens.add({
            targets: [notifyBg, notifyText],
            alpha: 0,
            duration: 500,
            delay: 2000,
            onComplete: () => {
                notifyBg.destroy();
                notifyText.destroy();
            }
        });
    }
}
