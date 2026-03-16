import Phaser from 'phaser';
import { CONFIG } from './config.js';
import { getRiversideNPC } from './RiversideNPCs.js';

export default class DialogUI {
    constructor(scene) {
        this.scene = scene;
        this.isOpen = false;
        this.currentNPCId = null;
    }
    
    open(npcId) {
        if (this.isOpen) return;
        this.isOpen = true;
        this.currentNPCId = npcId;
        
        const { width, height } = this.scene.scale;
        
        // Darken background
        this.overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);
        this.overlay.setScrollFactor(0).setDepth(900).setInteractive();
        this.overlay.on('pointerdown', () => this.close());
        
        // Main panel
        this.panel = this.scene.add.image(width / 2, height / 2, 'panel');
        this.panel.setDisplaySize(800, 450);
        this.panel.setScrollFactor(0).setDepth(901).setAlpha(0.95);
        
        this.container = this.scene.add.container(0, 0);
        this.container.setScrollFactor(0).setDepth(902);
        
        // Fetch NPC Data
        const npcData = getRiversideNPC(npcId) || { 
            name: 'Unknown', role: 'Stranger', 
            dialog: { greeting: ["What do you want?"] } 
        };
        
        // NPC Name & Role
        const nameText = this.scene.add.text(width / 2, height / 2 - 160, npcData.name.toUpperCase(), {
            fontFamily: 'Press Start 2P',
            fontSize: '28px',
            color: CONFIG.COLORS.primary,
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        const roleText = this.scene.add.text(width / 2, height / 2 - 120, npcData.role, {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: CONFIG.COLORS.textDark
        }).setOrigin(0.5);
        
        this.container.add([nameText, roleText]);
        
        // --- QUEST LOGIC ---
        const questSystem = this.scene.questSystem;
        const allDefs = questSystem.questDefinitions;
        
        // Find all quests given by this specific NPC
        const npcQuests = Object.values(allDefs).filter(q => q.giver === npcId);
        
        // Determine current quest state
        const activeQuest = questSystem.activeQuests.find(q => q.giver === npcId);
        const availableQuest = npcQuests.find(q => 
            !questSystem.activeQuests.some(aq => aq.id === q.id) && 
            !questSystem.completedQuests.some(cq => cq.id === q.id)
        );
        
        let dialogText = "";
        let buttonSetup = null;
        
        if (activeQuest) {
            // PLAYER IS CURRENTLY ON A QUEST FOR THIS NPC
            if (questSystem.canCompleteQuest(activeQuest.id)) {
                dialogText = `You got the stuff? Excellent. Pleasure doing business.\n\n(Ready to turn in: ${activeQuest.title})`;
                buttonSetup = { label: 'TURN IN QUEST', color: 0x00ff00, callback: () => this.turnInQuest(activeQuest.id) };
            } else {
                dialogText = `I'm still waiting on that delivery. Don't make me look bad.\n\n(In Progress: ${activeQuest.title})`;
                buttonSetup = { label: 'VIEW OBJECTIVES', color: 0xffaa00, callback: () => this.showQuestObjectives(activeQuest) };
            }
        } else if (availableQuest) {
            // QUEST IS AVAILABLE TO ACCEPT
            dialogText = availableQuest.description;
            buttonSetup = { label: 'ACCEPT QUEST', color: 0x00aaff, callback: () => this.acceptQuest(availableQuest.id) };
        } else if (npcQuests.every(q => questSystem.completedQuests.some(cq => cq.id === q.id))) {
            // ALL QUESTS COMPLETED
            dialogText = "You've been a good friend to us. Keep up the good work.";
            buttonSetup = { label: 'THANKS', color: 0x888888, callback: () => this.close() };
        } else {
            // NO ACTIVE OR AVAILABLE QUESTS - SHOW GREETING
            const greeting = npcData.dialog?.greeting?.[0] || "What do you want?";
            dialogText = greeting;
            buttonSetup = { label: 'TALK', color: 0xaaaaaa, callback: () => this.showGreeting(npcData) };
        }
        
        // Dialog text
        const dialogLines = this.scene.add.text(width / 2, height / 2 - 40, dialogText, {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: CONFIG.COLORS.text,
            align: 'center',
            wordWrap: { width: 700 }
        }).setOrigin(0.5);
        this.container.add(dialogLines);
        
        // Quest requirements display
        if (activeQuest && activeQuest.requirements?.drugs) {
            const drugsText = Object.entries(activeQuest.requirements.drugs)
                .map(([drug, amount]) => `${drug}: ${amount}`)
                .join(', ');
            const reqText = this.scene.add.text(width / 2, height / 2 + 60, `Required: ${drugsText}`, {
                fontFamily: 'Press Start 2P',
                fontSize: '10px',
                color: CONFIG.COLORS.textDark
            }).setOrigin(0.5);
            this.container.add(reqText);
        }
        
        // Action button
        if (buttonSetup) {
            const btnBg = this.scene.add.rectangle(width / 2, height / 2 + 140, 300, 50, buttonSetup.color);
            btnBg.setScrollFactor(0).setDepth(903).setInteractive({ useHandCursor: true });
            btnBg.on('pointerdown', buttonSetup.callback);
            
            const btnText = this.scene.add.text(width / 2, height / 2 + 140, buttonSetup.label, {
                fontFamily: 'Press Start 2P',
                fontSize: '14px',
                color: '#000000'
            }).setOrigin(0.5);
            btnText.setScrollFactor(0).setDepth(904);
            
            this.container.add([btnBg, btnText]);
        }
        
        // Close button
        const closeBtn = this.scene.add.text(width / 2 + 350, height / 2 - 190, '✕', {
            fontFamily: 'Press Start 2P',
            fontSize: '24px',
            color: CONFIG.COLORS.danger
        }).setOrigin(0.5).setScrollFactor(0).setDepth(903).setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => this.close());
        this.container.add(closeBtn);
    }
    
    close() {
        if (!this.isOpen) return;
        this.isOpen = false;
        
        if (this.overlay) this.overlay.destroy();
        if (this.panel) this.panel.destroy();
        if (this.container) this.container.destroy();
        
        this.currentNPCId = null;
    }
    
    acceptQuest(questId) {
        if (this.scene.questSystem.acceptQuest(questId)) {
            this.scene.showFloatingText('Quest Accepted!', CONFIG.COLORS.success);
            this.close();
        }
    }
    
    turnInQuest(questId) {
        const success = this.scene.questSystem.completeQuest(questId);
        if (success) {
            this.close();
            // Re-open to see if they have another quest immediately ready!
            this.scene.time.delayedCall(100, () => this.open(this.currentNPCId));
        }
    }
    
    createButton(x, y, width, height, text, color, callback) {
        const container = this.scene.add.container(x, y);
        const bg = this.scene.add.rectangle(0, 0, width, height, 0x2a2a2a);
        bg.setStrokeStyle(2, color);
        
        const label = this.scene.add.text(0, 0, text, {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: color
        }).setOrigin(0.5);
        
        container.add([bg, label]);
        container.setSize(width, height);
        container.setInteractive({ useHandCursor: true });
        
        container.on('pointerover', () => bg.setFillStyle(0x3a3a3a));
        container.on('pointerout', () => bg.setFillStyle(0x2a2a2a));
        container.on('pointerdown', () => bg.setFillStyle(0x1a1a1a));
        container.on('pointerup', () => {
            bg.setFillStyle(0x3a3a3a);
            if (callback) callback();
        });
        
        return container;
    }
    
    showQuestObjectives(quest) {
        const objectivesText = quest.objectives?.map(o => `○ ${o.description}`).join('\n') || 'No objectives';
        this.scene.showFloatingText(objectivesText, CONFIG.COLORS.textDark);
    }
    
    showGreeting(npcData) {
        const greeting = npcData.dialog?.greeting?.[0] || "...";
        this.scene.showFloatingText(greeting, CONFIG.COLORS.text);
    }
}
