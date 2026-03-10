import Phaser from 'phaser';
import { CONFIG } from './config.js';

export default class RivalEncounterUI {
    constructor(scene) {
        this.scene = scene;
        this.isOpen = false;
        this.container = null;
        this.rivalChoice = null;
        this.callback = null;
    }
    
    open(rival, callback) {
        if (this.isOpen) return;
        
        this.isOpen = true;
        this.callback = callback;
        
        const { width, height } = this.scene.scale;
        
        // Randomly choose rival's stat (RPS choice)
        const stats = ['intuition', 'ability', 'luck'];
        this.rivalChoice = stats[Math.floor(Math.random() * stats.length)];
        
        // Create UI container
        this.container = this.scene.add.container(0, 0).setScrollFactor(0).setDepth(2000);
        
        // Dark overlay
        const overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);
        this.container.add(overlay);
        
        // Title panel
        const titlePanel = this.scene.add.rectangle(width / 2, 150, 800, 100, 0x2a2a2a);
        titlePanel.setStrokeStyle(4, 0xff3333);
        this.container.add(titlePanel);
        
        const titleText = this.scene.add.text(width / 2, 150, 'RIVAL ENCOUNTER!', {
            fontFamily: 'Press Start 2P',
            fontSize: '32px',
            color: CONFIG.COLORS.danger,
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        this.container.add(titleText);
        
        // Rival message panel
        const messagePanel = this.scene.add.rectangle(width / 2, 280, 900, 180, 0x1a1a1a);
        messagePanel.setStrokeStyle(3, 0xff6600);
        this.container.add(messagePanel);
        
        const rivalMessage = this.getRivalMessage();
        const messageText = this.scene.add.text(width / 2, 280, rivalMessage, {
            fontFamily: 'Press Start 2P',
            fontSize: '18px',
            color: CONFIG.COLORS.text,
            align: 'center',
            wordWrap: { width: 850 }
        }).setOrigin(0.5);
        this.container.add(messageText);
        
        // Instructions
        const instructionText = this.scene.add.text(width / 2, 400, 'Choose your stat to counter:', {
            fontFamily: 'Press Start 2P',
            fontSize: '16px',
            color: CONFIG.COLORS.secondary,
            align: 'center'
        }).setOrigin(0.5);
        this.container.add(instructionText);
        
        // Stat choice buttons
        this.createStatButton('INTUITION', width / 2 - 320, 500, 'intuition');
        this.createStatButton('ABILITY', width / 2, 500, 'ability');
        this.createStatButton('LUCK', width / 2 + 320, 500, 'luck');
        
        // Show RPS rules
        const rulesText = this.scene.add.text(width / 2, height - 150, 
            'Rules: Intuition > Ability > Luck > Intuition', {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: CONFIG.COLORS.textDark,
            align: 'center'
        }).setOrigin(0.5);
        this.container.add(rulesText);
        
        const warningText = this.scene.add.text(width / 2, height - 100,
            'Win: Rival drops cash | Lose: -20% Hustle', {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: CONFIG.COLORS.primary,
            align: 'center'
        }).setOrigin(0.5);
        this.container.add(warningText);
    }
    
    getRivalMessage() {
        const messages = [
            "You stepping on my turf?\nTime to learn some respect!",
            "I run these streets.\nYou better back off!",
            "Think you're tough?\nLet's settle this!",
            "Wrong place, wrong time.\nThis ends now!",
            "You got a lot of nerve\nshowing your face here!"
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }
    
    createStatButton(label, x, y, stat) {
        const { width, height } = this.scene.scale;
        
        // Get player's stat value
        const statValue = this.scene.playerState.stats[stat];
        
        // Button background
        const button = this.scene.add.rectangle(x, y, 280, 120, 0x2a2a2a);
        button.setStrokeStyle(3, 0xffcc00);
        button.setInteractive({ useHandCursor: true });
        this.container.add(button);
        
        // Stat name
        const nameText = this.scene.add.text(x, y - 20, label, {
            fontFamily: 'Press Start 2P',
            fontSize: '18px',
            color: CONFIG.COLORS.primary
        }).setOrigin(0.5);
        this.container.add(nameText);
        
        // Stat value
        const valueText = this.scene.add.text(x, y + 20, `Power: ${statValue}`, {
            fontFamily: 'Press Start 2P',
            fontSize: '16px',
            color: CONFIG.COLORS.text
        }).setOrigin(0.5);
        this.container.add(valueText);
        
        // Hover effects
        button.on('pointerover', () => {
            button.setFillStyle(0x3a3a3a);
            button.setStrokeStyle(4, 0xffff00);
        });
        
        button.on('pointerout', () => {
            button.setFillStyle(0x2a2a2a);
            button.setStrokeStyle(3, 0xffcc00);
        });
        
        button.on('pointerdown', () => {
            this.handleChoice(stat);
        });
    }
    
    handleChoice(playerChoice) {
        // Determine winner based on RPS rules
        // Intuition > Ability > Luck > Intuition
        const playerWins = this.checkWin(playerChoice, this.rivalChoice);
        
        this.close();
        
        // Show result
        this.showResult(playerChoice, playerWins);
    }
    
    checkWin(playerChoice, rivalChoice) {
        // Check for Caucasian race bonus (extra dice in RPS)
        const raceBonus = this.scene.playerState.raceBonus;
        const hasExtraDice = raceBonus?.rpsExtraDice || false;
        
        if (playerChoice === rivalChoice) {
            // Tie - player wins if their stat is higher (with possible Caucasian bonus)
            const playerStat = this.scene.playerState.stats[playerChoice];
            // Caucasian bonus: effectively adds +3 to stat for tie-breaker
            const effectiveStat = hasExtraDice ? playerStat + 3 : playerStat;
            return effectiveStat > Math.floor(Math.random() * 10) + 1;
        }
        
        // RPS logic: Intuition > Ability > Luck > Intuition
        if (playerChoice === 'intuition' && rivalChoice === 'ability') return true;
        if (playerChoice === 'ability' && rivalChoice === 'luck') return true;
        if (playerChoice === 'luck' && rivalChoice === 'intuition') return true;
        
        return false;
    }
    
    showResult(playerChoice, playerWins) {
        const { width, height } = this.scene.scale;
        
        // Create result overlay
        const resultContainer = this.scene.add.container(0, 0).setScrollFactor(0).setDepth(2001);
        
        const overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9);
        resultContainer.add(overlay);
        
        if (playerWins) {
            // Player wins
            const cashDrop = CONFIG.RIVAL_CASH_DROP_MIN + 
                Math.floor(Math.random() * (CONFIG.RIVAL_CASH_DROP_MAX - CONFIG.RIVAL_CASH_DROP_MIN));
            
            this.scene.playerState.money += cashDrop;
            
            const winText = this.scene.add.text(width / 2, height / 2 - 60, 'VICTORY!', {
                fontFamily: 'Press Start 2P',
                fontSize: '56px',
                color: CONFIG.COLORS.success,
                stroke: '#000000',
                strokeThickness: 8
            }).setOrigin(0.5);
            resultContainer.add(winText);
            
            const detailText = this.scene.add.text(width / 2, height / 2 + 20, 
                `You used ${playerChoice.toUpperCase()}\n` +
                `Rival used ${this.rivalChoice.toUpperCase()}\n\n` +
                `The rival fled!\nYou found $${cashDrop}!`, {
                fontFamily: 'Press Start 2P',
                fontSize: '18px',
                color: CONFIG.COLORS.text,
                align: 'center',
                lineSpacing: 10
            }).setOrigin(0.5);
            resultContainer.add(detailText);
            
            this.scene.hud.update();
            
        } else {
            // Player loses
            const hustleLoss = Math.floor(this.scene.playerState.hustle * CONFIG.RIVAL_HUSTLE_PENALTY);
            this.scene.playerState.hustle = Math.max(0, this.scene.playerState.hustle - hustleLoss);
            
            const loseText = this.scene.add.text(width / 2, height / 2 - 60, 'DEFEAT', {
                fontFamily: 'Press Start 2P',
                fontSize: '56px',
                color: CONFIG.COLORS.danger,
                stroke: '#000000',
                strokeThickness: 8
            }).setOrigin(0.5);
            resultContainer.add(loseText);
            
            const detailText = this.scene.add.text(width / 2, height / 2 + 20,
                `You used ${playerChoice.toUpperCase()}\n` +
                `Rival used ${this.rivalChoice.toUpperCase()}\n\n` +
                `You got roughed up!\nHustle -${hustleLoss}`, {
                fontFamily: 'Press Start 2P',
                fontSize: '18px',
                color: CONFIG.COLORS.text,
                align: 'center',
                lineSpacing: 10
            }).setOrigin(0.5);
            resultContainer.add(detailText);
            
            this.scene.hud.update();
            
            // Check if player passed out from hustle loss
            if (this.scene.playerState.hustle <= 0) {
                this.scene.time.delayedCall(3000, () => {
                    resultContainer.destroy();
                    this.scene.passOut();
                });
                if (this.callback) this.callback(playerWins);
                return;
            }
        }
        
        // Auto-close result after 3 seconds
        this.scene.time.delayedCall(3000, () => {
            resultContainer.destroy();
            if (this.callback) this.callback(playerWins);
        });
    }
    
    close() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
        
        this.rivalChoice = null;
        this.callback = null;
    }
}
