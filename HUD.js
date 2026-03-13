import Phaser from 'phaser';
import { CONFIG } from './config.js';
import MapGenerator from './MapGenerator.js';
import { EventBus, EVENTS } from './EventBus.js';

export default class HUD {
    constructor(scene) {
        this.scene = scene;
        this.create();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Listen for economy events to show notifications
        EventBus.on(EVENTS.ECONOMY_EVENT_STARTED, (data) => {
            this.showToastNotification(data);
        });
    }
    
    showToastNotification(eventData) {
        const { width, height } = this.scene.scale;
        
        // Create toast container
        const toastX = width / 2;
        const toastY = height / 2 + 50;
        
        // Background panel
        const toastBg = this.scene.add.rectangle(toastX, toastY, 600, 80, 0x000000, 0.9);
        toastBg.setScrollFactor(0);
        toastBg.setDepth(1000);
        toastBg.setStrokeStyle(3, eventData.color || CONFIG.COLORS.primary);
        
        // "NEWS:" prefix
        const newsText = this.scene.add.text(toastX - 280, toastY - 20, 'NEWS:', {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: CONFIG.COLORS.danger
        }).setScrollFactor(0).setDepth(1001);
        
        // Event name
        const eventText = this.scene.add.text(toastX - 200, toastY - 20, eventData.name, {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: eventData.color || CONFIG.COLORS.primary
        }).setScrollFactor(0).setDepth(1001);
        
        // Affected area
        const areaText = this.scene.add.text(toastX - 280, toastY + 10, eventData.affectedArea || 'All neighborhoods', {
            fontFamily: 'Press Start 2P',
            fontSize: '10px',
            color: CONFIG.COLORS.textDark
        }).setScrollFactor(0).setDepth(1001);
        
        // Price effect
        const priceText = this.scene.add.text(toastX - 50, toastY + 10, eventData.priceEffect || '', {
            fontFamily: 'Press Start 2P',
            fontSize: '10px',
            color: CONFIG.COLORS.success
        }).setScrollFactor(0).setDepth(1001);
        
        // Description
        const descText = this.scene.add.text(toastX + 150, toastY, eventData.description, {
            fontFamily: 'Arial',
            fontSize: '11px',
            color: CONFIG.COLORS.text
        }).setScrollFactor(0).setDepth(1001);
        
        // Animate fade in
        toastBg.setAlpha(0);
        newsText.setAlpha(0);
        eventText.setAlpha(0);
        areaText.setAlpha(0);
        priceText.setAlpha(0);
        descText.setAlpha(0);
        
        // Fade in animation
        this.scene.tweens.add({
            targets: [toastBg, newsText, eventText, areaText, priceText, descText],
            alpha: 1,
            duration: 300,
            ease: 'Power2'
        });
        
        // Auto-dismiss after 4 seconds
        this.scene.time.delayedCall(4000, () => {
            this.scene.tweens.add({
                targets: [toastBg, newsText, eventText, areaText, priceText, descText],
                alpha: 0,
                duration: 500,
                ease: 'Power2',
                onComplete: () => {
                    toastBg.destroy();
                    newsText.destroy();
                    eventText.destroy();
                    areaText.destroy();
                    priceText.destroy();
                    descText.destroy();
                }
            });
        });
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
        
        // Neighborhood indicator
        this.neighborhoodText = this.scene.add.text(leftMargin, topY + 50, '', {
            fontFamily: 'Press Start 2P',
            fontSize: '10px',
            color: CONFIG.COLORS.primary
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
        
        // Pistol Ammo indicator
        this.ammoText = this.scene.add.text(leftMargin + 400, topY + 58, '', {
            fontFamily: 'Press Start 2P',
            fontSize: '9px',
            color: CONFIG.COLORS.secondary
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
        
        // NEW: Level display
        this.levelText = this.scene.add.text(leftMargin + 200, topY + 30, '', {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: '#ffd700'
        }).setScrollFactor(0).setDepth(502);
        
        // NEW: XP bar (visual meter)
        const xpBarWidth = 150;
        const xpBarHeight = 15;
        const xpBarX = leftMargin + 200;
        const xpBarY = topY + 50;
        
        // XP bar background
        this.xpBarBg = this.scene.add.rectangle(
            xpBarX, xpBarY,
            xpBarWidth, xpBarHeight,
            0x1a1a1a
        ).setOrigin(0, 0.5).setScrollFactor(0).setDepth(502);
        this.xpBarBg.setStrokeStyle(2, 0xffd700);
        
        // XP bar fill
        this.xpBarFill = this.scene.add.rectangle(
            xpBarX + 2, xpBarY,
            0, xpBarHeight - 4,
            0xffd700
        ).setOrigin(0, 0.5).setScrollFactor(0).setDepth(503);
        
        this.xpBarMaxWidth = xpBarWidth - 4;
        
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
        
        // ============ MENU/SETTINGS BUTTON ============
        const menuX = width - 30;
        const menuY = 30;
        
        this.menuBtn = this.scene.add.rectangle(menuX, menuY, 70, 50, 0x2a2a2a);
        this.menuBtn.setOrigin(1, 0);
        this.menuBtn.setScrollFactor(0);
        this.menuBtn.setDepth(502);
        this.menuBtn.setStrokeStyle(2, 0x44aaff);
        this.menuBtn.setInteractive({ useHandCursor: true });
        
        this.menuBtnText = this.scene.add.text(menuX - 35, menuY + 25, '☰', {
            fontSize: '24px',
            color: '#44aaff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(503);
        
        this.menuBtn.on('pointerover', () => {
            this.menuBtn.setFillStyle(0x444444);
        });
        
        this.menuBtn.on('pointerout', () => {
            this.menuBtn.setFillStyle(0x2a2a2a);
        });
        
        this.menuBtn.on('pointerdown', () => {
            this.menuBtn.setScale(0.95);
            // Open pause/menu screen
            if (this.scene.openPauseMenu) {
                this.scene.openPauseMenu();
            }
        });
        
        this.menuBtn.on('pointerup', () => {
            this.menuBtn.setScale(1);
        });
        
        // Touch-friendly: Also trigger on tap for mobile
        this.scene.input.on('pointerdown', (pointer) => {
            if (pointer.x > menuX - 80 && pointer.x < menuX + 10 && 
                pointer.y > menuY && pointer.y < menuY + 55) {
                if (this.scene.openPauseMenu) {
                    this.scene.openPauseMenu();
                }
            }
        });
        // ============ END MENU BUTTON ============
        
        // ============ HELP BUTTON ============
        const helpX = menuX - 90;
        const helpY = 30;
        
        this.helpBtn = this.scene.add.rectangle(helpX, helpY, 70, 50, 0x2a2a2a);
        this.helpBtn.setOrigin(1, 0);
        this.helpBtn.setScrollFactor(0);
        this.helpBtn.setDepth(502);
        this.helpBtn.setStrokeStyle(2, 0xff6600);
        this.helpBtn.setInteractive({ useHandCursor: true });
        
        this.helpBtnText = this.scene.add.text(helpX - 35, helpY + 25, 'HELP', {
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
            this.helpBtn.setScale(0.95);
            if (this.scene.tutorialUI) {
                this.scene.tutorialUI.open(0);
            }
        });
        
        this.helpBtn.on('pointerup', () => {
            this.helpBtn.setScale(1);
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
        
        // Update neighborhood display
        const neighborhood = player.neighborhood || 'OLD_TOWN';
        const hoodData = MapGenerator.NEIGHBORHOODS[neighborhood];
        const hoodName = hoodData?.name || neighborhood;
        this.neighborhoodText.setText(`📍 ${hoodName}`);
        
        this.moneyText.setText(`$${player.money}`);
        
        // Update ability points
        const ap = player.abilityPoints || 0;
        const unlockedSkills = player.unlockedSkills || [];
        const skillCount = unlockedSkills.length;
        this.apText.setText(`AP: ${ap} (${skillCount} skills)`);
        
        // NEW: Update Level display
        const level = player.level || 1;
        const xp = player.xp || 0;
        const xpToNext = player.xpToNextLevel || 500;
        const statPoints = player.statPoints || 0;
        
        this.levelText.setText(`LVL ${level} | SP: ${statPoints}`);
        
        // Update XP bar
        const xpPercent = Math.min(1, xp / xpToNext);
        this.xpBarFill.width = this.xpBarMaxWidth * xpPercent;
        
        // Inventory with capacity - show drug inventory instead of just product
        const drugs = player.drugs || {};
        const drugTypes = Object.keys(drugs).filter(drug => drugs[drug] > 0);
        
        if (drugTypes.length > 0) {
            // Show each drug type and amount
            const drugInfo = drugTypes.map(drug => `${drug}: ${drugs[drug]}`).join(' | ');
            this.inventoryText.setText(
                `RAW: ${player.rawMaterials}/${player.rawCapacity} | ${drugInfo}`
            );
        } else {
            // No drugs, show generic product (backward compatibility)
            this.inventoryText.setText(
                `RAW: ${player.rawMaterials}/${player.rawCapacity} | PRODUCT: ${player.product}/${player.productCapacity}`
            );
        }
        
        // Equipment indicators
        const equipmentLabels = [];
        if (player.equipment.backpack) {
            equipmentLabels.push('[BACKPACK]');
        }
        this.equipmentText.setText(equipmentLabels.join(' '));
        
        // Pistol ammo indicator
        const hasPistol = player.equipment.pistol;
        if (hasPistol) {
            const ammo = player.pistolAmmo || 0;
            const maxAmmo = player.maxPistolAmmo || 30;
            const ammoColor = ammo === 0 ? CONFIG.COLORS.danger : 
                             ammo < maxAmmo * 0.3 ? CONFIG.COLORS.primary : 
                             CONFIG.COLORS.success;
            this.ammoText.setText(`🔫 AMMO: ${ammo}/${maxAmmo}`);
            this.ammoText.setColor(ammoColor);
        } else {
            this.ammoText.setText('');
        }
        
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
                const yOffset = index * 55; // More space for icon + days
                
                // Icon (if available)
                if (event.icon) {
                    const iconText = this.scene.add.text(
                        width / 2 - 200,
                        startY + yOffset,
                        event.icon,
                        {
                            fontSize: '24px'
                        }
                    ).setScrollFactor(0).setDepth(505);
                    this.eventTexts.push(iconText);
                }
                
                // Event name with icon prefix
                const nameText = this.scene.add.text(
                    width / 2,
                    startY + yOffset,
                    `${event.icon ? '' : '⚠ '}${event.name}${event.icon ? '' : ' ⚠'}`,
                    {
                        fontFamily: 'Press Start 2P',
                        fontSize: '14px',
                        color: event.color,
                        stroke: '#000000',
                        strokeThickness: 4
                    }
                ).setOrigin(0.5).setScrollFactor(0).setDepth(505);
                
                this.eventTexts.push(nameText);
                
                // Description
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
                
                // Days remaining (for economy events)
                if (event.daysRemaining) {
                    const daysText = this.scene.add.text(
                        width / 2,
                        startY + yOffset + 35,
                        `⏱ ${event.daysRemaining}`,
                        {
                            fontFamily: 'Press Start 2P',
                            fontSize: '10px',
                            color: event.color,
                            stroke: '#000000',
                            strokeThickness: 2
                        }
                    ).setOrigin(0.5).setScrollFactor(0).setDepth(505);
                    
                    this.eventTexts.push(daysText);
                }
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
