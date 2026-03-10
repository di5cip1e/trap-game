import Phaser from 'phaser';
import { CONFIG } from './config.js';

export default class HUD {
    constructor(scene) {
        this.scene = scene;
        this.create();
    }
    
    create() {
        const { width } = this.scene.scale;
        
        // Top HUD bar background
        const barHeight = 100;
        this.hudBg = this.scene.add.image(width / 2, barHeight / 2, 'hud-bar');
        this.hudBg.setDisplaySize(width, barHeight);
        this.hudBg.setScrollFactor(0);
        this.hudBg.setDepth(500);
        this.hudBg.setAlpha(0.9);
        
        // Dark overlay for better text visibility
        this.hudOverlay = this.scene.add.rectangle(width / 2, barHeight / 2, width, barHeight, 0x000000, 0.5);
        this.hudOverlay.setScrollFactor(0);
        this.hudOverlay.setDepth(501);
        
        const leftMargin = 30;
        const topY = 25;
        
        // Player name
        this.nameText = this.scene.add.text(leftMargin, topY, '', {
            fontFamily: 'Press Start 2P',
            fontSize: '20px',
            color: CONFIG.COLORS.primary
        }).setScrollFactor(0).setDepth(502);
        
        // Rank
        this.rankText = this.scene.add.text(leftMargin, topY + 30, '', {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: CONFIG.COLORS.textDark
        }).setScrollFactor(0).setDepth(502);
        
        // Money
        this.moneyText = this.scene.add.text(leftMargin + 400, topY, '', {
            fontFamily: 'Press Start 2P',
            fontSize: '18px',
            color: CONFIG.COLORS.success
        }).setScrollFactor(0).setDepth(502);
        
        // Inventory display
        this.inventoryText = this.scene.add.text(leftMargin + 400, topY + 30, '', {
            fontFamily: 'Press Start 2P',
            fontSize: '11px',
            color: CONFIG.COLORS.text
        }).setScrollFactor(0).setDepth(502);
        
        // Equipment indicator
        this.equipmentText = this.scene.add.text(leftMargin + 400, topY + 45, '', {
            fontFamily: 'Press Start 2P',
            fontSize: '9px',
            color: CONFIG.COLORS.success
        }).setScrollFactor(0).setDepth(502);
        
        // Runner indicator
        this.runnerText = this.scene.add.text(leftMargin + 600, topY + 45, '', {
            fontFamily: 'Press Start 2P',
            fontSize: '9px',
            color: CONFIG.COLORS.primary
        }).setScrollFactor(0).setDepth(502);
        
        // Ability Points indicator
        this.apText = this.scene.add.text(leftMargin + 200, topY, '', {
            fontFamily: 'Press Start 2P',
            fontSize: '12px',
            color: CONFIG.COLORS.primary
        }).setScrollFactor(0).setDepth(502);
        
        // Heat display
        this.heatText = this.scene.add.text(leftMargin + 400, topY + 65, '', {
            fontFamily: 'Press Start 2P',
            fontSize: '11px',
            color: CONFIG.COLORS.text
        }).setScrollFactor(0).setDepth(502);
        
        // Heat bar (visual meter)
        const heatBarWidth = 200;
        const heatBarHeight = 20;
        const heatBarX = leftMargin + 600;
        const heatBarY = topY + 65;
        
        // Heat bar background
        this.heatBarBg = this.scene.add.rectangle(
            heatBarX, heatBarY,
            heatBarWidth, heatBarHeight,
            0x1a1a1a
        ).setOrigin(0, 0.5).setScrollFactor(0).setDepth(502);
        this.heatBarBg.setStrokeStyle(2, 0xff3333);
        
        // Heat bar fill
        this.heatBarFill = this.scene.add.rectangle(
            heatBarX + 2, heatBarY,
            0, heatBarHeight - 4,
            0xff3333
        ).setOrigin(0, 0.5).setScrollFactor(0).setDepth(503);
        
        this.heatBarMaxWidth = heatBarWidth - 4;
        
        // Time/Day (center-right)
        this.timeText = this.scene.add.text(width - 400, topY, '', {
            fontFamily: 'Press Start 2P',
            fontSize: '18px',
            color: CONFIG.COLORS.text
        }).setScrollFactor(0).setDepth(502);
        
        // Hustle bar (below time)
        const hustleBarWidth = 300;
        const hustleBarHeight = 30;
        const hustleBarX = width - 400;
        const hustleBarY = topY + 40;
        
        // Hustle bar background
        this.hustleBarBg = this.scene.add.rectangle(
            hustleBarX, hustleBarY,
            hustleBarWidth, hustleBarHeight,
            0x1a1a1a
        ).setOrigin(0, 0).setScrollFactor(0).setDepth(502);
        
        this.hustleBarBg.setStrokeStyle(2, 0xffcc00);
        
        // Hustle bar fill
        this.hustleBarFill = this.scene.add.rectangle(
            hustleBarX + 2, hustleBarY + 2,
            hustleBarWidth - 4, hustleBarHeight - 4,
            0x66ff66
        ).setOrigin(0, 0).setScrollFactor(0).setDepth(503);
        
        // Hustle label
        this.hustleLabel = this.scene.add.text(hustleBarX, hustleBarY - 20, 'HUSTLE', {
            fontFamily: 'Press Start 2P',
            fontSize: '12px',
            color: CONFIG.COLORS.textDark
        }).setScrollFactor(0).setDepth(502);
        
        // Hustle value text
        this.hustleValueText = this.scene.add.text(
            hustleBarX + hustleBarWidth / 2, 
            hustleBarY + hustleBarHeight / 2, 
            '', {
            fontFamily: 'Press Start 2P',
            fontSize: '12px',
            color: CONFIG.COLORS.text,
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0).setDepth(504);
        
        this.hustleBarMaxWidth = hustleBarWidth - 4;
        
        // Calendar/Event display (below time)
        this.calendarText = this.scene.add.text(width - 400, topY + 25, '', {
            fontFamily: 'Press Start 2P',
            fontSize: '11px',
            color: CONFIG.COLORS.textDark
        }).setScrollFactor(0).setDepth(502);
        
        // Event indicators (active events shown here)
        this.eventTexts = [];
        
        // ============ HELP BUTTON ============
        const helpX = width - 30;
        const helpY = 30;
        
        this.helpBtn = this.scene.add.rectangle(helpX, helpY, 80, 35, 0x2a2a2a);
        this.helpBtn.setOrigin(1, 0);
        this.helpBtn.setScrollFactor(0);
        this.helpBtn.setDepth(502);
        this.helpBtn.setStrokeStyle(2, 0xff6600);
        this.helpBtn.setInteractive({ useHandCursor: true });
        
        this.helpBtnText = this.scene.add.text(helpX - 40, helpY + 17, 'HELP', {
            fontFamily: 'Press Start 2P',
            fontSize: '12px',
            color: CONFIG.COLORS.primary
        }).setOrigin(0.5).setScrollFactor(0).setDepth(503);
        
        this.helpBtn.on('pointerover', () => {
            this.helpBtn.setFillStyle(0x444444);
        });
        
        this.helpBtn.on('pointerout', () => {
            this.helpBtn.setFillStyle(0x2a2a2a);
        });
        
        this.helpBtn.on('pointerdown', () => {
            if (this.scene.tutorialUI) {
                this.scene.tutorialUI.open(0);
            }
        });
        // ============ END HELP BUTTON ============
        
        // ============ STATUS EFFECT ICONS ============
        // Container for status effect icons
        this.statusIcons = [];
        const statusStartX = leftMargin + 200;
        
        // Create placeholder for status icons (up to 8)
        for (let i = 0; i < 8; i++) {
            const icon = this.scene.add.text(
                statusStartX + (i * 40), topY + 60,
                '', {
                fontFamily: 'Press Start 2P',
                fontSize: '16px'
            }).setScrollFactor(0).setDepth(502).setAlpha(0);
            
            this.statusIcons.push(icon);
        }
        
        // Status tooltip
        this.statusTooltip = this.scene.add.text(
            statusStartX, topY + 80,
            '', {
                fontFamily: 'Press Start 2P',
                fontSize: '8px',
                color: CONFIG.COLORS.text
            }
        ).setScrollFactor(0).setDepth(502).setAlpha(0);
        // ============ END STATUS ICONS ============
        
        this.update();
    }
    
    /**
     * Update the status effect icons display
     */
    updateStatusDisplay() {
        const player = this.scene.playerState;
        const statuses = player.activeStatuses || {};
        const statusKeys = Object.keys(statuses);
        
        // Clear all icons first
        this.statusIcons.forEach(icon => {
            icon.setText('');
            icon.setAlpha(0);
        });
        
        // Hide tooltip
        this.statusTooltip.setAlpha(0);
        
        // Show icons for each active status
        let iconIndex = 0;
        for (const statusKey of statusKeys) {
            if (iconIndex >= 8) break;
            
            const status = statuses[statusKey];
            const config = CONFIG.STATUS_EFFECTS[statusKey];
            
            if (config && config.icon) {
                const icon = this.statusIcons[iconIndex];
                icon.setText(config.icon);
                icon.setColor(config.color || '#ffffff');
                icon.setAlpha(1);
                icon.setDepth(502);
                
                // Make interactive for tooltip
                icon.setInteractive({ useHandCursor: true });
                icon.on('pointerover', () => {
                    const stacksText = status.stacks > 1 ? ` (x${status.stacks})` : '';
                    this.statusTooltip.setText(`${config.name}${stacksText} - ${status.duration} turns`);
                    this.statusTooltip.setColor(config.color || CONFIG.COLORS.text);
                    this.statusTooltip.setAlpha(1);
                });
                icon.on('pointerout', () => {
                    this.statusTooltip.setAlpha(0);
                });
                
                iconIndex++;
            }
        }
    }
    
    update() {
        const player = this.scene.playerState;
        const rank = this.scene.getRank();
        const time = this.scene.timeSystem;
        
        // Update texts
        this.nameText.setText(player.name);
        this.rankText.setText(rank);
        this.moneyText.setText(`$${player.money}`);
        
        // Update ability points
        const ap = player.abilityPoints || 0;
        const unlockedSkills = player.unlockedSkills || [];
        const skillCount = unlockedSkills.length;
        this.apText.setText(`AP: ${ap} (${skillCount} skills)`);
        
        // Inventory with capacity
        this.inventoryText.setText(
            `RAW: ${player.rawMaterials}/${player.rawCapacity} | PRODUCT: ${player.product}/${player.productCapacity}`
        );
        
        // Equipment indicators
        const equipmentLabels = [];
        if (player.equipment.backpack) {
            equipmentLabels.push('[BACKPACK]');
        }
        this.equipmentText.setText(equipmentLabels.join(' '));
        
        // Runner indicator
        if (player.hasRunner) {
            const runnerProduct = player.runnerProduct;
            this.runnerText.setText(`[RUNNER: ${runnerProduct}]`);
            this.runnerText.setColor(runnerProduct > 0 ? CONFIG.COLORS.primary : CONFIG.COLORS.textDark);
        } else {
            this.runnerText.setText('');
        }
        
        // Heat with color coding
        const heatPercent = player.heat / CONFIG.MAX_HEAT;
        const heatColor = player.heat > 50 ? CONFIG.COLORS.danger : 
                         player.heat > 25 ? CONFIG.COLORS.primary : 
                         CONFIG.COLORS.success;
        this.heatText.setText(`HEAT: ${player.heat}%`);
        this.heatText.setColor(heatColor);
        
        // Update heat bar
        this.heatBarFill.width = this.heatBarMaxWidth * heatPercent;
        
        // Change heat bar color based on level
        if (player.heat > 75) {
            this.heatBarFill.setFillStyle(0xff0000); // Bright red (critical)
        } else if (player.heat > 50) {
            this.heatBarFill.setFillStyle(0xff3333); // Red (high)
        } else if (player.heat > 25) {
            this.heatBarFill.setFillStyle(0xff9900); // Orange (medium)
        } else {
            this.heatBarFill.setFillStyle(0xffcc00); // Yellow (low)
        }
        
        // Update time
        const timeStr = time.getTimeString();
        const dayStr = `Day ${time.day}`;
        this.timeText.setText(`${dayStr} - ${timeStr}`);
        
        // Update time color based on day/night
        if (time.isNight()) {
            this.timeText.setColor('#9999ff'); // Bluish for night
        } else {
            this.timeText.setColor('#ffcc00'); // Gold for day
        }
        
        // Update calendar info
        const calendar = this.scene.calendarSystem.getCalendarInfo();
        this.calendarText.setText(`${calendar.dayName} (Week ${calendar.week})`);
        
        // Clear old event texts
        this.eventTexts.forEach(text => text.destroy());
        this.eventTexts = [];
        
        // Show active events
        const activeEvents = calendar.activeEvents;
        if (activeEvents.length > 0) {
            const { width } = this.scene.scale;
            const startY = 120;
            
            activeEvents.forEach((event, index) => {
                const yOffset = index * 50; // More space between multiple events
                
                const eventText = this.scene.add.text(
                    width / 2,
                    startY + yOffset,
                    `⚠ ${event.name} ⚠`,
                    {
                        fontFamily: 'Press Start 2P',
                        fontSize: '14px',
                        color: event.color,
                        stroke: '#000000',
                        strokeThickness: 4
                    }
                ).setOrigin(0.5).setScrollFactor(0).setDepth(505);
                
                this.eventTexts.push(eventText);
                
                const eventDesc = this.scene.add.text(
                    width / 2,
                    startY + yOffset + 20,
                    event.description,
                    {
                        fontFamily: 'Press Start 2P',
                        fontSize: '10px',
                        color: CONFIG.COLORS.text,
                        stroke: '#000000',
                        strokeThickness: 3
                    }
                ).setOrigin(0.5).setScrollFactor(0).setDepth(505);
                
                this.eventTexts.push(eventDesc);
            });
        }
        
        // Update hustle bar
        const hustlePercent = player.hustle / CONFIG.MAX_HUSTLE;
        this.hustleBarFill.width = this.hustleBarMaxWidth * hustlePercent;
        
        // Change color based on hustle level
        if (hustlePercent > 0.6) {
            this.hustleBarFill.setFillStyle(0x66ff66); // Green
        } else if (hustlePercent > 0.3) {
            this.hustleBarFill.setFillStyle(0xffcc00); // Yellow
        } else {
            this.hustleBarFill.setFillStyle(0xff3333); // Red
        }
        
        this.hustleValueText.setText(`${Math.floor(player.hustle)}%`);
        
        // Update status effect icons
        this.updateStatusDisplay();
    }
}
