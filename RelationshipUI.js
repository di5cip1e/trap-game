import Phaser from 'phaser';
import { CONFIG } from './config.js';

export default class RelationshipUI {
    constructor(scene) {
        this.scene = scene;
        this.isOpen = false;
        this.currentNPC = null;
    }
    
    open(npc) {
        if (this.isOpen) return;
        
        this.isOpen = true;
        this.currentNPC = npc;
        
        const { width, height } = this.scene.scale;
        
        // Darken background
        this.overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);
        this.overlay.setScrollFactor(0);
        this.overlay.setDepth(900);
        this.overlay.setInteractive();
        
        // Main panel
        this.panel = this.scene.add.image(width / 2, height / 2, 'panel');
        this.panel.setDisplaySize(800, 650);
        this.panel.setScrollFactor(0);
        this.panel.setDepth(901);
        this.panel.setAlpha(0.95);
        
        // Container for all UI elements
        this.container = this.scene.add.container(0, 0);
        this.container.setScrollFactor(0);
        this.container.setDepth(902);
        
        // NPC specific content
        const npcData = this.getNPCData(npc);
        const loyalty = this.scene.playerState.npcRelationships[npc.npcId];
        
        // Title
        const title = this.scene.add.text(width / 2, height / 2 - 280, npcData.name, {
            fontFamily: 'Press Start 2P',
            fontSize: '28px',
            color: npcData.color,
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.container.add(title);
        
        // Subtitle
        const subtitle = this.scene.add.text(width / 2, height / 2 - 240, npcData.role, {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: CONFIG.COLORS.textDark
        }).setOrigin(0.5);
        this.container.add(subtitle);
        
        // Loyalty display
        const loyaltyPanel = this.scene.add.rectangle(width / 2, height / 2 - 180, 700, 80, 0x1a1a1a);
        loyaltyPanel.setStrokeStyle(3, npcData.color);
        this.container.add(loyaltyPanel);
        
        const loyaltyLabel = this.scene.add.text(width / 2, height / 2 - 200, 'LOYALTY', {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: CONFIG.COLORS.textDark
        }).setOrigin(0.5);
        this.container.add(loyaltyLabel);
        
        // Loyalty bar
        const loyaltyBarWidth = 400;
        const loyaltyBarHeight = 25;
        const loyaltyBarX = width / 2 - loyaltyBarWidth / 2;
        const loyaltyBarY = height / 2 - 170;
        
        const loyaltyBarBg = this.scene.add.rectangle(
            loyaltyBarX, loyaltyBarY,
            loyaltyBarWidth, loyaltyBarHeight,
            0x2a2a2a
        ).setOrigin(0, 0.5).setStrokeStyle(2, 0xffcc00);
        this.container.add(loyaltyBarBg);
        
        const loyaltyPercent = loyalty / CONFIG.MAX_LOYALTY;
        const loyaltyBarFill = this.scene.add.rectangle(
            loyaltyBarX + 2, loyaltyBarY,
            (loyaltyBarWidth - 4) * loyaltyPercent, loyaltyBarHeight - 4,
            this.getLoyaltyColor(loyalty)
        ).setOrigin(0, 0.5);
        this.container.add(loyaltyBarFill);
        
        const loyaltyText = this.scene.add.text(width / 2, loyaltyBarY, `${loyalty}/${CONFIG.MAX_LOYALTY}`, {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: CONFIG.COLORS.text,
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        this.container.add(loyaltyText);
        
        // Dialogue
        const dialogue = this.scene.add.text(width / 2, height / 2 - 100, npcData.dialogue, {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: CONFIG.COLORS.text,
            align: 'center',
            wordWrap: { width: 700 },
            lineSpacing: 8
        }).setOrigin(0.5);
        this.container.add(dialogue);
        
        // Perk status
        const perkActive = loyalty >= CONFIG.LOYALTY_THRESHOLD;
        const perkPanel = this.scene.add.rectangle(width / 2, height / 2 - 10, 720, 100, 0x1a1a1a);
        perkPanel.setStrokeStyle(3, perkActive ? CONFIG.COLORS.success : CONFIG.COLORS.textDark);
        this.container.add(perkPanel);
        
        const perkTitle = this.scene.add.text(width / 2, height / 2 - 40, 
            perkActive ? 'PERK ACTIVE' : 'PERK LOCKED', {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: perkActive ? CONFIG.COLORS.success : CONFIG.COLORS.textDark
        }).setOrigin(0.5);
        this.container.add(perkTitle);
        
        const perkDesc = this.scene.add.text(width / 2, height / 2, npcData.perk, {
            fontFamily: 'Arial',
            fontSize: '13px',
            color: CONFIG.COLORS.text,
            align: 'center',
            wordWrap: { width: 680 }
        }).setOrigin(0.5);
        this.container.add(perkDesc);
        
        const perkHint = this.scene.add.text(width / 2, height / 2 + 25, 
            perkActive ? '✓ Requirement Met' : `Need Loyalty ${CONFIG.LOYALTY_THRESHOLD}+`, {
            fontFamily: 'Press Start 2P',
            fontSize: '10px',
            color: perkActive ? CONFIG.COLORS.success : CONFIG.COLORS.danger
        }).setOrigin(0.5);
        this.container.add(perkHint);
        
        // Bribe options
        const optionsY = height / 2 + 100;
        
        const optionsTitle = this.scene.add.text(width / 2, optionsY, 'IMPROVE RELATIONSHIP', {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: CONFIG.COLORS.secondary
        }).setOrigin(0.5);
        this.container.add(optionsTitle);
        
        // Cash bribe button
        const canAffordCash = this.scene.playerState.money >= CONFIG.BRIBE_CASH_AMOUNT;
        const cashButton = this.createBribeButton(
            width / 2 - 180, optionsY + 60,
            `GIVE $${CONFIG.BRIBE_CASH_AMOUNT}`,
            `+${CONFIG.BRIBE_CASH_LOYALTY} Loyalty`,
            canAffordCash,
            () => this.giveBribe('cash')
        );
        this.container.add(cashButton);
        
        // Product bribe button
        const canAffordProduct = this.scene.playerState.product >= CONFIG.BRIBE_PRODUCT_AMOUNT;
        const productButton = this.createBribeButton(
            width / 2 + 180, optionsY + 60,
            `GIVE ${CONFIG.BRIBE_PRODUCT_AMOUNT} PRODUCT`,
            `+${CONFIG.BRIBE_PRODUCT_LOYALTY} Loyalty`,
            canAffordProduct,
            () => this.giveBribe('product')
        );
        this.container.add(productButton);
        
        // Close button
        const closeButton = this.createButton(width / 2, height / 2 + 270, 200, 40, 'LEAVE', () => {
            this.close();
        });
        this.container.add(closeButton);
    }
    
    getNPCData(npc) {
        if (npc.npcId === 'shopOwner') {
            return {
                name: 'Shop Owner',
                role: 'Local Business Owner',
                color: CONFIG.COLORS.success,
                dialogue: '"Hey there! Always good to see\na friendly face around here.\nBusiness treating you well?"',
                perk: 'SAFE HAVEN: Pass by during a police chase to instantly clear all Heat.'
            };
        } else if (npc.npcId === 'corruptCop') {
            return {
                name: 'Officer "Payday"',
                role: 'Corrupt Detective',
                color: '#6699ff',
                dialogue: '"Look who it is. You know,\nI could make your life easier...\nor a lot harder. Your choice."',
                perk: 'GET OUT OF JAIL FREE: First arrest each day is automatically avoided.'
            };
        }
    }
    
    getLoyaltyColor(loyalty) {
        if (loyalty >= 8) return 0x00ff00; // Bright green
        if (loyalty >= CONFIG.LOYALTY_THRESHOLD) return 0x66ff66; // Green
        if (loyalty >= 3) return 0xffcc00; // Yellow
        return 0xff6600; // Orange
    }
    
    giveBribe(type) {
        const loyalty = this.scene.playerState.npcRelationships[this.currentNPC.npcId];
        
        if (loyalty >= CONFIG.MAX_LOYALTY) {
            this.showMessage('Relationship maxed out!', CONFIG.COLORS.success);
            return;
        }
        
        if (type === 'cash') {
            if (this.scene.playerState.money < CONFIG.BRIBE_CASH_AMOUNT) {
                this.showMessage('Not enough cash!', CONFIG.COLORS.danger);
                return;
            }
            
            this.scene.playerState.money -= CONFIG.BRIBE_CASH_AMOUNT;
            this.scene.playerState.npcRelationships[this.currentNPC.npcId] = 
                Math.min(CONFIG.MAX_LOYALTY, loyalty + CONFIG.BRIBE_CASH_LOYALTY);
            
            this.showMessage(`+${CONFIG.BRIBE_CASH_LOYALTY} Loyalty`, CONFIG.COLORS.success);
            
        } else if (type === 'product') {
            if (this.scene.playerState.product < CONFIG.BRIBE_PRODUCT_AMOUNT) {
                this.showMessage('Not enough Product!', CONFIG.COLORS.danger);
                return;
            }
            
            this.scene.playerState.product -= CONFIG.BRIBE_PRODUCT_AMOUNT;
            this.scene.playerState.npcRelationships[this.currentNPC.npcId] = 
                Math.min(CONFIG.MAX_LOYALTY, loyalty + CONFIG.BRIBE_PRODUCT_LOYALTY);
            
            this.showMessage(`+${CONFIG.BRIBE_PRODUCT_LOYALTY} Loyalty`, CONFIG.COLORS.success);
        }
        
        this.scene.hud.update();
        
        // Refresh UI
        this.close();
        this.open(this.currentNPC);
    }
    
    showMessage(text, color) {
        const { width, height } = this.scene.scale;
        
        const msg = this.scene.add.text(width / 2, height / 2 + 230, text, {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: color,
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0).setDepth(950);
        
        this.scene.tweens.add({
            targets: msg,
            alpha: 0,
            y: height / 2 + 200,
            duration: 1500,
            onComplete: () => msg.destroy()
        });
    }
    
    createBribeButton(x, y, mainText, subText, canAfford, callback) {
        const container = this.scene.add.container(x, y);
        
        const bg = this.scene.add.rectangle(0, 0, 320, 80, canAfford ? 0x2a2a2a : 0x1a1a1a);
        bg.setStrokeStyle(2, canAfford ? 0xffcc00 : 0x666666);
        
        const label = this.scene.add.text(0, -12, mainText, {
            fontFamily: 'Press Start 2P',
            fontSize: '12px',
            color: canAfford ? CONFIG.COLORS.text : CONFIG.COLORS.textDark
        }).setOrigin(0.5);
        
        const sublabel = this.scene.add.text(0, 12, subText, {
            fontFamily: 'Press Start 2P',
            fontSize: '10px',
            color: CONFIG.COLORS.success
        }).setOrigin(0.5);
        
        container.add([bg, label, sublabel]);
        container.setSize(320, 80);
        
        if (canAfford) {
            container.setInteractive({ useHandCursor: true });
            
            container.on('pointerover', () => {
                bg.setFillStyle(0x3a3a3a);
                label.setColor(CONFIG.COLORS.primary);
            });
            
            container.on('pointerout', () => {
                bg.setFillStyle(0x2a2a2a);
                label.setColor(CONFIG.COLORS.text);
            });
            
            container.on('pointerdown', () => {
                bg.setFillStyle(0x1a1a1a);
            });
            
            container.on('pointerup', () => {
                bg.setFillStyle(0x3a3a3a);
                if (callback) callback();
            });
        }
        
        return container;
    }
    
    createButton(x, y, width, height, text, callback) {
        const container = this.scene.add.container(x, y);
        
        const bg = this.scene.add.rectangle(0, 0, width, height, 0x2a2a2a);
        bg.setStrokeStyle(2, 0xffcc00);
        
        const label = this.scene.add.text(0, 0, text, {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: CONFIG.COLORS.text
        }).setOrigin(0.5);
        
        container.add([bg, label]);
        container.setSize(width, height);
        container.setInteractive({ useHandCursor: true });
        
        container.on('pointerover', () => {
            bg.setFillStyle(0x3a3a3a);
            label.setColor(CONFIG.COLORS.primary);
        });
        
        container.on('pointerout', () => {
            bg.setFillStyle(0x2a2a2a);
            label.setColor(CONFIG.COLORS.text);
        });
        
        container.on('pointerdown', () => {
            bg.setFillStyle(0x1a1a1a);
        });
        
        container.on('pointerup', () => {
            bg.setFillStyle(0x3a3a3a);
            if (callback) callback();
        });
        
        return container;
    }
    
    close() {
        if (!this.isOpen) return;
        this.isOpen = false;
        
        if (this.overlay) this.overlay.destroy();
        if (this.panel) this.panel.destroy();
        if (this.container) this.container.destroy();
        
        this.overlay = null;
        this.panel = null;
        this.container = null;
        this.currentNPC = null;
    }
}
