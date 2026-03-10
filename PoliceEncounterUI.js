import Phaser from 'phaser';
import { CONFIG } from './config.js';

export default class PoliceEncounterUI {
    constructor(scene) {
        this.scene = scene;
        this.isOpen = false;
        this.callback = null;
    }
    
    open(callback) {
        if (this.isOpen) return;
        
        this.isOpen = true;
        this.callback = callback;
        
        const { width, height } = this.scene.scale;
        
        // Create UI container
        this.container = this.scene.add.container(0, 0).setScrollFactor(0).setDepth(2000);
        
        // Dark overlay
        const overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);
        this.container.add(overlay);
        
        // Title panel
        const titlePanel = this.scene.add.rectangle(width / 2, 150, 800, 100, 0x2a2a2a);
        titlePanel.setStrokeStyle(4, 0x0066ff);
        this.container.add(titlePanel);
        
        const titleText = this.scene.add.text(width / 2, 150, 'POLICE ARREST!', {
            fontFamily: 'Press Start 2P',
            fontSize: '32px',
            color: '#0066ff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        this.container.add(titleText);
        
        // Police message panel
        const messagePanel = this.scene.add.rectangle(width / 2, 280, 900, 180, 0x1a1a1a);
        messagePanel.setStrokeStyle(3, 0x0066ff);
        this.container.add(messagePanel);
        
        const policeMessage = this.getPoliceMessage();
        const messageText = this.scene.add.text(width / 2, 280, policeMessage, {
            fontFamily: 'Press Start 2P',
            fontSize: '18px',
            color: CONFIG.COLORS.text,
            align: 'center',
            wordWrap: { width: 850 }
        }).setOrigin(0.5);
        this.container.add(messageText);
        
        // Instructions
        const instructionText = this.scene.add.text(width / 2, 400, 'Fight or Submit?', {
            fontFamily: 'Press Start 2P',
            fontSize: '16px',
            color: CONFIG.COLORS.secondary,
            align: 'center'
        }).setOrigin(0.5);
        this.container.add(instructionText);
        
        // Stat choice buttons - Police always uses Ability
        const statLabels = [
            { key: 'intuition', label: 'INTUITION', color: CONFIG.COLORS.primary },
            { key: 'ability', label: 'ABILITY', color: CONFIG.COLORS.secondary },
            { key: 'luck', label: 'LUCK', color: CONFIG.COLORS.success }
        ];
        
        let xOffset = -320;
        statLabels.forEach(stat => {
            this.createStatButton(stat.label, width / 2 + xOffset, 500, stat.key, stat.color);
            xOffset += 320;
        });
        
        // Warning text
        const warningText = this.scene.add.text(width / 2, height - 100,
            'Officer uses ABILITY | Win: Escape (-30 Hustle) | Lose: BUSTED (-50% Cash, -All Product)', {
            fontFamily: 'Press Start 2P',
            fontSize: '12px',
            color: CONFIG.COLORS.danger,
            align: 'center',
            wordWrap: { width: 900 }
        }).setOrigin(0.5);
        this.container.add(warningText);
    }
    
    getPoliceMessage() {
        const messages = [
            "FREEZE! You're under arrest!\nResist and face the consequences!",
            "You picked the wrong day\nto deal on my beat!",
            "Hands where I can see them!\nYou're going down!",
            "End of the line, punk!\nTime to pay for your crimes!",
            "I've been watching you.\nLet's see how tough you really are!"
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }
    
    createStatButton(label, x, y, stat, color) {
        const { width, height } = this.scene.scale;
        
        // Get player's stat value
        const statValue = this.scene.playerState.stats[stat];
        
        // Button background
        const button = this.scene.add.rectangle(x, y, 280, 120, 0x2a2a2a);
        button.setStrokeStyle(3, color);
        button.setInteractive({ useHandCursor: true });
        this.container.add(button);
        
        // Stat name
        const nameText = this.scene.add.text(x, y - 20, label, {
            fontFamily: 'Press Start 2P',
            fontSize: '18px',
            color: color
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
            button.setStrokeStyle(3, color);
        });
        
        button.on('pointerdown', () => {
            this.handleChoice(stat);
        });
    }
    
    handleChoice(playerChoice) {
        // Police always uses 'ability'
        const policeChoice = 'ability';
        
        // Determine winner based on RPS rules
        // Intuition > Ability > Luck > Intuition
        const playerWins = this.checkWin(playerChoice, policeChoice);
        
        this.close();
        
        // Show result
        this.showResult(playerChoice, playerWins);
    }
    
    checkWin(playerChoice, policeChoice) {
        if (playerChoice === policeChoice) {
            // Tie - player wins if their stat is higher than a random police roll
            const policeRoll = Math.floor(Math.random() * 10) + 1;
            return this.scene.playerState.stats[playerChoice] > policeRoll;
        }
        
        // RPS logic: Intuition > Ability > Luck > Intuition
        if (playerChoice === 'intuition' && policeChoice === 'ability') return true;
        if (playerChoice === 'ability' && policeChoice === 'luck') return true;
        if (playerChoice === 'luck' && policeChoice === 'intuition') return true;
        
        return false;
    }
    
    showResult(playerChoice, playerWins) {
        const { width, height } = this.scene.scale;
        
        // Create result overlay
        const resultContainer = this.scene.add.container(0, 0).setScrollFactor(0).setDepth(2001);
        
        const overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9);
        resultContainer.add(overlay);
        
        if (playerWins) {
            // Player escapes
            this.scene.playerState.hustle -= CONFIG.POLICE_ESCAPE_HUSTLE_COST;
            this.scene.playerState.hustle = Math.max(0, this.scene.playerState.hustle);
            
            const escapeText = this.scene.add.text(width / 2, height / 2 - 60, 'ESCAPED!', {
                fontFamily: 'Press Start 2P',
                fontSize: '56px',
                color: CONFIG.COLORS.success,
                stroke: '#000000',
                strokeThickness: 8
            }).setOrigin(0.5);
            resultContainer.add(escapeText);
            
            const detailText = this.scene.add.text(width / 2, height / 2 + 20, 
                `You used ${playerChoice.toUpperCase()}\n` +
                `Officer used ABILITY\n\n` +
                `You barely got away!\n-${CONFIG.POLICE_ESCAPE_HUSTLE_COST} Hustle`, {
                fontFamily: 'Press Start 2P',
                fontSize: '18px',
                color: CONFIG.COLORS.text,
                align: 'center',
                lineSpacing: 10
            }).setOrigin(0.5);
            resultContainer.add(detailText);
            
            this.scene.hud.update();
            
        } else {
            // Player gets busted
            const cashLoss = Math.floor(this.scene.playerState.money * CONFIG.POLICE_BUST_CASH_PENALTY);
            const productLoss = this.scene.playerState.product;
            
            this.scene.playerState.money = Math.max(0, this.scene.playerState.money - cashLoss);
            this.scene.playerState.product = 0;
            
            const bustText = this.scene.add.text(width / 2, height / 2 - 60, 'BUSTED!', {
                fontFamily: 'Press Start 2P',
                fontSize: '56px',
                color: CONFIG.COLORS.danger,
                stroke: '#000000',
                strokeThickness: 8
            }).setOrigin(0.5);
            resultContainer.add(bustText);
            
            const detailText = this.scene.add.text(width / 2, height / 2 + 20,
                `You used ${playerChoice.toUpperCase()}\n` +
                `Officer used ABILITY\n\n` +
                `You've been arrested!\n` +
                `Lost $${cashLoss}\n` +
                `Lost ${productLoss} Product\n\n` +
                `Released at Safehouse...`, {
                fontFamily: 'Press Start 2P',
                fontSize: '18px',
                color: CONFIG.COLORS.text,
                align: 'center',
                lineSpacing: 10
            }).setOrigin(0.5);
            resultContainer.add(detailText);
            
            this.scene.hud.update();
            
            // Teleport player to safehouse after delay
            this.scene.time.delayedCall(4000, () => {
                resultContainer.destroy();
                this.teleportToSafehouse();
                if (this.callback) this.callback(playerWins);
            });
            return;
        }
        
        // Auto-close result for escape after 3 seconds
        this.scene.time.delayedCall(3000, () => {
            resultContainer.destroy();
            if (this.callback) this.callback(playerWins);
        });
    }
    
    teleportToSafehouse() {
        // Move player to safehouse position
        const safehouse = this.scene.worldObjects.find(obj => obj.type === 'safehouse');
        if (safehouse) {
            this.scene.playerState.gridX = safehouse.x + 2;
            this.scene.playerState.gridY = safehouse.y;
            
            const targetX = this.scene.playerState.gridX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
            const targetY = this.scene.playerState.gridY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
            
            this.scene.player.setPosition(targetX, targetY);
        }
    }
    
    close() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
        
        this.callback = null;
    }
}
