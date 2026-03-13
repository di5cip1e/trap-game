/**
 * UIManager.js - Handles HUD, menus, and UI interactions
 * Extracted from GameScene.js to reduce complexity
 */

import { CONFIG } from './config.js';

export default class UIManager {
    constructor(scene, playerState) {
        this.scene = scene;
        this.playerState = playerState;
        this.openUI = null;
    }

    // ============================================================
    // UI STATE
    // ============================================================

    isAnyUIOpen() {
        return this.openUI !== null;
    }

    closeAllUI() {
        if (this.scene.safehouseUI) this.scene.safehouseUI.close();
        if (this.scene.vendorUI) this.scene.vendorUI.close();
        if (this.scene.workstationUI) this.scene.workstationUI.close();
        if (this.scene.equipmentUI) this.scene.equipmentUI.close();
        if (this.scene.relationshipUI) this.scene.relationshipUI.close();
        if (this.scene.supplierUI) this.scene.supplierUI.close();
        if (this.scene.supplierMeetingSystem) this.scene.supplierMeetingSystem.close();
        if (this.scene.policeEncounterUI) this.scene.policeEncounterUI.close();
        if (this.scene.rivalEncounterUI) this.scene.rivalEncounterUI.close();
        if (this.scene.questUI) this.scene.questUI.close();
        if (this.scene.tutorialUI) this.scene.tutorialUI.close();

        this.openUI = null;
    }

    // ============================================================
    // PAUSE MENU
    // ============================================================

    openPauseMenu() {
        if (this.isAnyUIOpen()) return;

        const { width, height } = this.scene.scale;

        // Dark overlay
        this.scene.pauseOverlay = this.scene.add.rectangle(
            width / 2, height / 2, width, height, 0x000000, 0.7
        );
        this.scene.pauseOverlay.setScrollFactor(0);
        this.scene.pauseOverlay.setDepth(100);
        this.scene.pauseOverlay.setInteractive();

        // Menu container
        this.scene.pauseContainer = this.scene.add.container(width / 2, height / 2);
        this.scene.pauseContainer.setScrollFactor(0);
        this.scene.pauseContainer.setDepth(101);

        // Title
        const title = this.scene.add.text(0, -150, 'PAUSED', {
            fontFamily: 'Press Start 2P',
            fontSize: '32px',
            color: CONFIG.COLORS.text
        }).setOrigin(0.5);

        this.scene.pauseContainer.add(title);

        // Menu options
        const options = ['Resume', 'Save Game', 'Load Game', 'Quit to Title'];
        const buttons = [];

        options.forEach((text, index) => {
            const y = -50 + (index * 60);
            const btn = this.createMenuButton(
                0, y, 300, 50, text,
                () => this.handlePauseMenuOption(index)
            );
            buttons.push(btn);
            this.scene.pauseContainer.add(btn);
        });

        this.scene.pauseButtons = buttons;
        this.openUI = 'pause';
    }

    handlePauseMenuOption(index) {
        this.closePauseMenu();

        switch (index) {
            case 0: // Resume
                // Just close, nothing else
                break;
            case 1: // Save Game
                this.showSaveSlotSelection();
                break;
            case 2: // Load Game
                this.showSaveSlotSelection();
                break;
            case 3: // Quit to Title
                this.scene.scene.start('TitleScene');
                break;
        }
    }

    closePauseMenu() {
        if (this.scene.pauseOverlay) {
            this.scene.pauseOverlay.destroy();
            this.scene.pauseOverlay = null;
        }
        if (this.scene.pauseContainer) {
            this.scene.pauseContainer.destroy();
            this.scene.pauseContainer = null;
        }
        this.scene.pauseButtons = [];
        this.openUI = null;
    }

    // ============================================================
    // SAVE/LOAD
    // ============================================================

    showSaveSlotSelection() {
        const { width, height } = this.scene.scale;

        // Clear pause menu
        if (this.scene.pauseContainer) {
            this.scene.pauseContainer.destroy();
        }

        // Create slot selection
        this.scene.saveSlotContainer = this.scene.add.container(width / 2, height / 2);
        this.scene.saveSlotContainer.setScrollFactor(0);
        this.scene.saveSlotContainer.setDepth(102);

        const title = this.scene.add.text(0, -180, 'Select Save Slot', {
            fontFamily: 'Press Start 2P',
            fontSize: '24px',
            color: CONFIG.COLORS.text
        }).setOrigin(0.5);

        this.scene.saveSlotContainer.add(title);

        // Create 3 save slots
        for (let i = 0; i < 3; i++) {
            const y = -80 + (i * 80);
            const slotText = `Slot ${i + 1}`;
            const btn = this.createMenuButton(0, y, 400, 60, slotText, () => {
                this.saveToSlot(i);
            });
            this.scene.saveSlotContainer.add(btn);
        }

        // Back button
        const backBtn = this.createMenuButton(0, 180, 200, 50, 'Back', () => {
            this.closeSaveSlotSelection();
            this.openPauseMenu();
        });
        this.scene.saveSlotContainer.add(backBtn);
    }

    closeSaveSlotSelection() {
        if (this.scene.saveSlotContainer) {
            this.scene.saveSlotContainer.destroy();
            this.scene.saveSlotContainer = null;
        }
    }

    saveToSlot(slotIndex) {
        const saveData = {
            playerState: this.playerState,
            timestamp: Date.now(),
            version: '1.0.0'
        };

        localStorage.setItem(`trap_save_${slotIndex}`, JSON.stringify(saveData));
        this.scene.showFloatingText('Game Saved!', CONFIG.COLORS.success);
        this.closeSaveSlotSelection();
    }

    // ============================================================
    // HELPER: Create menu button
    // ============================================================

    createMenuButton(x, y, width, height, text, callback) {
        const container = this.scene.add.container(x, y);

        const bg = this.scene.add.rectangle(0, 0, width, height, CONFIG.COLORS.uiBg);
        bg.setStrokeStyle(2, CONFIG.COLORS.border);

        const label = this.scene.add.text(0, 0, text, {
            fontFamily: 'Press Start 2P',
            fontSize: '16px',
            color: CONFIG.COLORS.text
        }).setOrigin(0.5);

        container.add([bg, label]);

        bg.setInteractive({ useHandCursor: true });

        bg.on('pointerover', () => {
            bg.setFillStyle(CONFIG.COLORS.uiHighlight);
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(CONFIG.COLORS.uiBg);
        });

        bg.on('pointerdown', () => {
            if (callback) callback();
        });

        return container;
    }

    // ============================================================
    // FLOATING TEXT
    // ============================================================

    showFloatingText(text, color = '#ffffff') {
        if (!this.scene.player) return;

        const { CONFIG } = this.scene;
        const playerX = this.scene.player.x;
        const playerY = this.scene.player.y - 40;

        const textObj = this.scene.add.text(playerX, playerY, text, {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: color,
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(1000);

        this.scene.tweens.add({
            targets: textObj,
            y: playerY - 50,
            alpha: 0,
            duration: 1500,
            ease: 'Linear',
            onComplete: () => {
                textObj.destroy();
            }
        });
    }

    // ============================================================
    // INTERACTION
    // ============================================================

    checkInteractionProximity() {
        const { gridX, gridY } = this.playerState;
        const { GRID_WIDTH, GRID_HEIGHT } = CONFIG;

        // Bounds checking
        if (gridX < 0 || gridX >= GRID_WIDTH || gridY < 0 || gridY >= GRID_HEIGHT) {
            return;
        }

        // Check adjacent tiles for interactables with null safety
        const directions = [
            { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
            { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
        ];

        for (const dir of directions) {
            const checkX = gridX + dir.dx;
            const checkY = gridY + dir.dy;

            // Bounds check
            if (checkX < 0 || checkX >= GRID_WIDTH || checkY < 0 || checkY >= GRID_HEIGHT) {
                continue;
            }

            const tile = this.scene.worldMap?.[checkY]?.[checkX];
            if (tile?.poi) {
                return tile.poi;
            }
        }

        return null;
    }

    tryInteract() {
        const poi = this.checkInteractionProximity();
        if (!poi) return;

        switch (poi.type) {
            case 'safehouse':
                this.scene.safehouseUI?.show();
                break;
            case 'vendor':
                this.scene.vendorUI?.show(poi.vendorType);
                break;
            case 'workstation':
                this.scene.workstationUI?.show();
                break;
            case 'supplier':
                this.scene.openSupplierMeeting(poi.supplierId);
                break;
            default:
                this.scene.enterBuilding(poi);
        }
    }
}
