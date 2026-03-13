import Phaser from 'phaser';
import { CONFIG } from './config.js';

export default class WorkstationUI {
    constructor(scene) {
        this.scene = scene;
        this.isOpen = false;
        this.selectedDrugType = 'Weed'; // Default drug type
        this.selectedProcessingType = 'basic'; // 'basic', 'crack', or 'meth'
        this.drugOptions = ['Weed', 'Mushrooms', 'Cocaine', 'MDMA'];
        this.processingTypes = [
            { id: 'basic', name: 'Basic Processing', description: 'Raw Materials → Product' },
            { id: 'crack', name: 'Process to Crack', description: '2 Cocaine → 1 Crack' },
            { id: 'meth', name: 'Process to Meth', description: '3 Precursor A + B → Meth' }
        ];
    }
    
    open() {
        if (this.isOpen) return;
        this.isOpen = true;
        
        const { width, height } = this.scene.scale;
        
        // Darken background
        this.overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);
        this.overlay.setScrollFactor(0);
        this.overlay.setDepth(900);
        this.overlay.setInteractive();
        
        // Main panel
        this.panel = this.scene.add.image(width / 2, height / 2, 'panel');
        this.panel.setDisplaySize(800, 600);
        this.panel.setScrollFactor(0);
        this.panel.setDepth(901);
        this.panel.setAlpha(0.95);
        
        // Container for all UI elements
        this.container = this.scene.add.container(0, 0);
        this.container.setScrollFactor(0);
        this.container.setDepth(902);
        
        // Title
        const title = this.scene.add.text(width / 2, height / 2 - 250, 'WORKSTATION', {
            fontFamily: 'Press Start 2P',
            fontSize: '32px',
            color: CONFIG.COLORS.primary,
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.container.add(title);
        
        // Subtitle
        const subtitle = this.scene.add.text(width / 2, height / 2 - 200, 
            'Process Raw Materials into Product', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: CONFIG.COLORS.textDark
        }).setOrigin(0.5);
        this.container.add(subtitle);
        
        // Processing type selector label
        const processLabel = this.scene.add.text(width / 2 - 200, height / 2 - 160, 
            'Processing Type:', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: CONFIG.COLORS.textDark
        }).setOrigin(0.5);
        this.container.add(processLabel);
        
        // Create buttons for processing type selection
        this.createProcessingTypeButtons(width / 2 + 80, height / 2 - 160);
        
        // Drug type selector label (for basic processing)
        this.drugLabel = this.scene.add.text(width / 2 - 200, height / 2 - 110, 
            'Drug to Produce:', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: CONFIG.COLORS.textDark
        }).setOrigin(0.5);
        this.container.add(this.drugLabel);
        
        // Create buttons for drug type selection
        this.createDrugTypeButtons(width / 2 + 80, height / 2 - 110);
        
        // Recipe display
        this.recipeY = height / 2 - 80;
        
        // Create recipe display elements (will be updated dynamically)
        this.inputIcon = this.scene.add.image(width / 2 - 200, this.recipeY, 'icon-raw');
        this.inputIcon.setScale(0.12);
        this.container.add(this.inputIcon);
        
        this.inputText = this.scene.add.text(width / 2 - 200, this.recipeY + 50, 
            '', {
            fontFamily: 'Press Start 2P',
            fontSize: '12px',
            color: CONFIG.COLORS.text,
            align: 'center'
        }).setOrigin(0.5);
        this.container.add(this.inputText);
        
        // Plus sign
        this.plusText = this.scene.add.text(width / 2 - 100, this.recipeY, '+', {
            fontFamily: 'Press Start 2P',
            fontSize: '32px',
            color: CONFIG.COLORS.textDark
        }).setOrigin(0.5);
        this.container.add(this.plusText);
        
        // Hustle cost
        this.hustleText = this.scene.add.text(width / 2, this.recipeY, 
            '', {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: CONFIG.COLORS.primary,
            align: 'center'
        }).setOrigin(0.5);
        this.container.add(this.hustleText);
        
        // Arrow
        this.arrowText = this.scene.add.text(width / 2 + 100, this.recipeY, '→', {
            fontFamily: 'Press Start 2P',
            fontSize: '32px',
            color: CONFIG.COLORS.textDark
        }).setOrigin(0.5);
        this.container.add(this.arrowText);
        
        // Output
        this.outputIcon = this.scene.add.image(width / 2 + 200, this.recipeY, 'icon-product');
        this.outputIcon.setScale(0.12);
        this.container.add(this.outputIcon);
        
        this.outputText = this.scene.add.text(width / 2 + 200, this.recipeY + 50, 
            '', {
            fontFamily: 'Press Start 2P',
            fontSize: '12px',
            color: CONFIG.COLORS.success,
            align: 'center'
        }).setOrigin(0.5);
        this.container.add(this.outputText);
        
        this.updateRecipeDisplay();
        
        // Player resources
        this.resourcesText = this.scene.add.text(width / 2, height / 2 + 30, '', {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: CONFIG.COLORS.text,
            align: 'center'
        }).setOrigin(0.5);
        this.container.add(this.resourcesText);
        
        // Warning text
        this.warningText = this.scene.add.text(width / 2, height / 2 + 60, '', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: CONFIG.COLORS.danger,
            align: 'center'
        }).setOrigin(0.5);
        this.container.add(this.warningText);
        
        // Drug selection dropdown (above Process button)
        this.createDrugDropdown(width / 2, height / 2 + 70);
        
        // Process button
        this.processButton = this.createButton(width / 2, height / 2 + 130, 200, 50, 'PROCESS', () => {
            this.process();
        });
        this.container.add(this.processButton);
        
        // Info text
        const infoText = this.scene.add.text(width / 2, height / 2 + 190, 
            'Your Ability stat increases product yield.\nHigher stats = more profit per batch.', {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: CONFIG.COLORS.textDark,
            align: 'center'
        }).setOrigin(0.5);
        this.container.add(infoText);
        
        // Close button
        this.closeButton = this.createButton(width / 2, height / 2 + 240, 150, 40, 'CLOSE', () => {
            this.close();
        });
        this.container.add(this.closeButton);
        
        this.updateDisplay();
    }
    
    updateDisplay() {
        const player = this.scene.playerState;
        
        // Handle different display for crack processing
        if (this.selectedProcessingType === 'crack') {
            const cocaineCount = player.drugs.cocaine || 0;
            const canProcess = cocaineCount >= 2 && player.hustle >= CONFIG.PROCESSING_HUSTLE_COST;
            
            this.resourcesText.setText(
                `You have: ${cocaineCount} Cocaine | ` +
                `${Math.floor(player.hustle)} Hustle`
            );
            
            if (cocaineCount < 2) {
                this.warningText.setText('Need 2 Cocaine to process!');
            } else if (player.hustle < CONFIG.PROCESSING_HUSTLE_COST) {
                this.warningText.setText('Not enough Hustle! Rest or you\'ll pass out.');
            } else {
                this.warningText.setText('');
            }
            
            // Update button state
            if (canProcess) {
                this.processButton.list[0].setFillStyle(0x66ff66);
                this.processButton.list[0].setStrokeStyle(2, 0xffffff);
                this.processButton.list[1].setColor('#000000');
                this.processButton.setAlpha(1);
            } else {
                this.processButton.list[0].setFillStyle(0x2a2a2a);
                this.processButton.list[0].setStrokeStyle(2, 0x666666);
                this.processButton.list[1].setColor('#666666');
                this.processButton.setAlpha(0.5);
            }
            return;
        }
        
        // Handle meth processing display
        if (this.selectedProcessingType === 'meth') {
            const precursorA = player.drugs.precursorA || 0;
            const precursorB = player.drugs.precursorB || 0;
            const canProcess = precursorA >= 3 && precursorB >= 3 && player.hustle >= CONFIG.PROCESSING_HUSTLE_COST;
            
            this.resourcesText.setText(
                `Precursor A: ${precursorA} | Precursor B: ${precursorB} | ` +
                `${Math.floor(player.hustle)} Hustle`
            );
            
            if (precursorA < 3 || precursorB < 3) {
                this.warningText.setText('Need 3 of each Precursor!');
            } else if (player.hustle < CONFIG.PROCESSING_HUSTLE_COST) {
                this.warningText.setText('Not enough Hustle! Rest or you\'ll pass out.');
            } else {
                this.warningText.setText('');
            }
            
            // Update button state
            if (canProcess) {
                this.processButton.list[0].setFillStyle(0x66ff66);
                this.processButton.list[0].setStrokeStyle(2, 0xffffff);
                this.processButton.list[1].setColor('#000000');
                this.processButton.setAlpha(1);
            } else {
                this.processButton.list[0].setFillStyle(0x2a2a2a);
                this.processButton.list[0].setStrokeStyle(2, 0x666666);
                this.processButton.list[1].setColor('#666666');
                this.processButton.setAlpha(0.5);
            }
            return;
        }
        
        // Standard processing (raw materials → product) - existing code
        // Calculate potential yield (includes Ability bonus and race bonus)
        const abilityBonus = player.stats.ability;
        const raceBonus = player.raceBonus;
        const productionSpeed = raceBonus?.productionSpeed || 0;
        const raceYieldBonus = Math.floor(abilityBonus * productionSpeed);
        const totalYield = CONFIG.PRODUCT_BASE_YIELD + abilityBonus + raceYieldBonus;
        
        // Check all conditions: raw materials, hustle, AND product capacity
        const hasEnoughRaw = player.rawMaterials >= CONFIG.PROCESSING_RAW_COST;
        const hasEnoughHustle = player.hustle >= CONFIG.PROCESSING_HUSTLE_COST;
        const hasProductSpace = (player.product + totalYield) <= player.productCapacity;
        
        const canProcess = hasEnoughRaw && hasEnoughHustle && hasProductSpace;
        
        this.resourcesText.setText(
            `You have: ${player.rawMaterials} Raw Materials | ` +
            `${Math.floor(player.hustle)} Hustle`
        );
        
        // Update warning - show most relevant issue
        if (!hasEnoughRaw) {
            this.warningText.setText('Not enough Raw Materials!');
        } else if (!hasEnoughHustle) {
            this.warningText.setText('Not enough Hustle! Rest or you\'ll pass out.');
        } else if (!hasProductSpace) {
            const canMake = player.productCapacity - player.product;
            if (canMake <= 0) {
                this.warningText.setText('Product inventory full!');
            } else {
                this.warningText.setText(`Product full! Can only make ${canMake} more`);
            }
        } else {
            this.warningText.setText('');
        }
        
        // Update button state
        if (canProcess) {
            this.processButton.list[0].setFillStyle(0x66ff66);
            this.processButton.list[0].setStrokeStyle(2, 0xffffff);
            this.processButton.list[1].setColor('#000000');
            this.processButton.setAlpha(1);
        } else {
            this.processButton.list[0].setFillStyle(0x2a2a2a);
            this.processButton.list[0].setStrokeStyle(2, 0x666666);
            this.processButton.list[1].setColor('#666666');
            this.processButton.setAlpha(0.5);
        }
        
        // Meth button is always visible but disabled if not enough precursors
        // No action needed - button stays visible, updateDisplay handles enable/disable state
        if (this.methButton) {
            // Always ensure meth button is visible
            this.methButton.setVisible(true);
        }
    }
    
    process() {
        const player = this.scene.playerState;
        
        // Handle different processing types
        if (this.selectedProcessingType === 'crack') {
            // Crack processing: 2 Cocaine → 1 Crack
            const cocaineNeeded = 2;
            const hasEnoughCocaine = player.drugs.cocaine >= cocaineNeeded;
            const hasEnoughHustle = player.hustle >= CONFIG.PROCESSING_HUSTLE_COST;
            const hasSpace = (player.drugs.crack || 0) < (player.productCapacity || 20);
            
            if (!hasEnoughCocaine) {
                this.showMessage('Need 2 Cocaine to process!', CONFIG.COLORS.danger);
                return;
            }
            if (!hasEnoughHustle) {
                this.showMessage('Not enough Hustle!', CONFIG.COLORS.danger);
                return;
            }
            if (!hasSpace) {
                this.showMessage('No space for Crack!', CONFIG.COLORS.danger);
                return;
            }
            
            // Deduct cocaine, add crack
            player.drugs.cocaine -= cocaineNeeded;
            player.drugs.crack = (player.drugs.crack || 0) + 1;
            player.hustle -= CONFIG.PROCESSING_HUSTLE_COST;
            
            // Update HUD
            this.scene.hud.update();
            this.updateDisplay();
            
            this.showMessage('Processed 2 Cocaine → 1 Crack!');
            return;
        }
        
        if (this.selectedProcessingType === 'meth') {
            // Meth processing: 3 Precursor A + 3 Precursor B → Meth
            const player = this.scene.playerState;
            const precursorNeeded = 3;
            const hasEnoughA = (player.drugs.precursorA || 0) >= precursorNeeded;
            const hasEnoughB = (player.drugs.precursorB || 0) >= precursorNeeded;
            const hasEnoughHustle = player.hustle >= CONFIG.PROCESSING_HUSTLE_COST;
            const hasSpace = (player.drugs.methamphetamine || 0) < (player.productCapacity || 20);
            
            if (!hasEnoughA || !hasEnoughB) {
                this.showMessage('Need 3 Precursor A + 3 Precursor B!', CONFIG.COLORS.danger);
                return;
            }
            if (!hasEnoughHustle) {
                this.showMessage('Not enough Hustle!', CONFIG.COLORS.danger);
                return;
            }
            if (!hasSpace) {
                this.showMessage('No space for Meth!', CONFIG.COLORS.danger);
                return;
            }
            
            // Deduct precursors, add meth
            player.drugs.precursorA = (player.drugs.precursorA || 0) - precursorNeeded;
            player.drugs.precursorB = (player.drugs.precursorB || 0) - precursorNeeded;
            player.drugs.methamphetamine = (player.drugs.methamphetamine || 0) + 1;
            player.hustle -= CONFIG.PROCESSING_HUSTLE_COST;
            
            // Update HUD
            this.scene.hud.update();
            this.updateDisplay();
            
            this.showMessage('Processed Meth! (3 Precursor A + 3 Precursor B)');
            return;
        }
        
        // Standard processing (raw materials → product)
        const canProcess = player.rawMaterials >= CONFIG.PROCESSING_RAW_COST && 
                          player.hustle >= CONFIG.PROCESSING_HUSTLE_COST;
        
        if (!canProcess) return;
        
        // Get the selected drug type's config and yield
        const drugConfig = CONFIG.DRUG_TYPES[this.selectedDrugType];
        const baseYield = drugConfig?.yield || CONFIG.PRODUCT_BASE_YIELD;
        
        // Calculate yield with Ability bonus and race bonus
        const abilityBonus = player.stats.ability;
        const raceBonus = player.raceBonus;
        const productionSpeed = raceBonus?.productionSpeed || 0;
        const raceYieldBonus = Math.floor(abilityBonus * productionSpeed);
        const totalYield = baseYield + abilityBonus + raceYieldBonus;
        
        // Check product capacity for the selected drug type
        const currentDrugStock = player.drugs[this.selectedDrugType] || 0;
        const afterProduction = currentDrugStock + totalYield;
        if (afterProduction > player.productCapacity) {
            const canMake = player.productCapacity - currentDrugStock;
            if (canMake <= 0) {
                this.showMessage(`${this.selectedDrugType} inventory full!`, CONFIG.COLORS.danger);
            } else {
                this.showMessage(`Only room for ${canMake} more ${this.selectedDrugType}`, CONFIG.COLORS.danger);
            }
            return;
        }
        
        // Deduct resources
        player.rawMaterials -= CONFIG.PROCESSING_RAW_COST;
        player.hustle -= CONFIG.PROCESSING_HUSTLE_COST;
        
        // Add product to the selected drug type
        player.drugs[this.selectedDrugType] = (player.drugs[this.selectedDrugType] || 0) + totalYield;
        
        // Update displays
        this.scene.hud.update();
        this.updateDisplay();
        
        // Show success message
        this.showMessage(`Processed ${totalYield} ${this.selectedDrugType}!`);
    }
    
    showMessage(text, color = CONFIG.COLORS.success) {
        const { width, height } = this.scene.scale;
        
        const msg = this.scene.add.text(width / 2, height / 2 + 250, text, {
            fontFamily: 'Press Start 2P',
            fontSize: '16px',
            color: color,
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(903);
        
        this.scene.tweens.add({
            targets: msg,
            alpha: 0,
            y: height / 2 + 220,
            duration: 1500,
            onComplete: () => msg.destroy()
        });
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
    }
    
    createButton(x, y, width, height, text, callback) {
        const container = this.scene.add.container(x, y);
        
        const bg = this.scene.add.rectangle(0, 0, width, height, 0x2a2a2a);
        bg.setStrokeStyle(2, 0xffcc00);
        
        const label = this.scene.add.text(0, 0, text, {
            fontFamily: 'Press Start 2P',
            fontSize: '16px',
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
    
    createDrugDropdown(x, y) {
        this.drugDropdownContainer = this.scene.add.container(0, 0);
        
        // Label
        const label = this.scene.add.text(x, y - 30, 'Select Drug:', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: CONFIG.COLORS.textDark
        }).setOrigin(0.5);
        this.container.add(label);
        
        // Create buttons for each drug type
        const buttonWidth = 150;
        const spacing = 10;
        const startX = x - ((this.drugOptions.length * buttonWidth + (this.drugOptions.length - 1) * spacing) / 2);
        
        this.drugDropdownButtons = [];
        
        this.drugOptions.forEach((drug, index) => {
            const btnX = startX + (buttonWidth / 2) + (index * (buttonWidth + spacing));
            const drugConfig = CONFIG.DRUG_TYPES[drug];
            const yieldInfo = drugConfig ? `Yield: ${drugConfig.yield}` : '';
            
            const btn = this.createDrugButton(btnX, y, buttonWidth, 40, drug, yieldInfo, () => {
                this.selectedDrugType = drug;
                this.updateDropdownSelection();
            });
            
            this.drugDropdownButtons.push({ container: btn, drug: drug });
            this.container.add(btn);
        });
        
        this.updateDropdownSelection();
    }
    
    createDrugButton(x, y, width, height, drugName, yieldInfo, callback) {
        const container = this.scene.add.container(x, y);
        
        const bg = this.scene.add.rectangle(0, 0, width, height, 0x2a2a2a);
        bg.setStrokeStyle(2, 0x666666);
        
        const nameLabel = this.scene.add.text(0, -8, drugName, {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: CONFIG.COLORS.text
        }).setOrigin(0.5);
        
        const yieldLabel = this.scene.add.text(0, 8, yieldInfo, {
            fontFamily: 'Arial',
            fontSize: '10px',
            color: CONFIG.COLORS.primary
        }).setOrigin(0.5);
        
        container.add([bg, nameLabel, yieldLabel]);
        container.setSize(width, height);
        container.setInteractive({ useHandCursor: true });
        
        container.on('pointerover', () => {
            bg.setFillStyle(0x3a3a3a);
        });
        
        container.on('pointerout', () => {
            bg.setFillStyle(0x2a2a2a);
        });
        
        container.on('pointerup', () => {
            if (callback) callback();
        });
        
        container.drugName = drugName;
        container.bg = bg;
        
        return container;
    }
    
    updateDropdownSelection() {
        if (!this.drugDropdownButtons) return;
        
        this.drugDropdownButtons.forEach(({ container, drug }) => {
            const bg = container.bg;
            if (drug === this.selectedDrugType) {
                bg.setStrokeStyle(2, 0xffcc00);
                bg.setFillStyle(0x3a3a3a);
            } else {
                bg.setStrokeStyle(2, 0x666666);
                bg.setFillStyle(0x2a2a2a);
            }
        });
    }
    
    createProcessingTypeButtons(x, y) {
        const buttonWidth = 180;
        const spacing = 10;
        const startX = x - ((this.processingTypes.length * buttonWidth + (this.processingTypes.length - 1) * spacing) / 2);
        
        this.processingTypeButtons = [];
        
        this.processingTypes.forEach((type, index) => {
            const btnX = startX + (buttonWidth / 2) + (index * (buttonWidth + spacing));
            
            const container = this.scene.add.container(btnX, y);
            
            const bg = this.scene.add.rectangle(0, 0, buttonWidth, 50, 0x2a2a2a);
            bg.setStrokeStyle(2, 0x666666);
            
            const nameLabel = this.scene.add.text(0, -10, type.name, {
                fontFamily: 'Arial',
                fontSize: '11px',
                color: CONFIG.COLORS.text
            }).setOrigin(0.5);
            
            const descLabel = this.scene.add.text(0, 10, type.description, {
                fontFamily: 'Arial',
                fontSize: '9px',
                color: CONFIG.COLORS.primary
            }).setOrigin(0.5);
            
            container.add([bg, nameLabel, descLabel]);
            container.setSize(buttonWidth, 50);
            container.setInteractive({ useHandCursor: true });
            
            container.on('pointerover', () => {
                bg.setFillStyle(0x3a3a3a);
            });
            
            container.on('pointerout', () => {
                bg.setFillStyle(0x2a2a2a);
            });
            
            container.on('pointerup', () => {
                this.selectedProcessingType = type.id;
                this.updateProcessingTypeSelection();
                this.updateDisplay();
            });
            
            container.processingType = type.id;
            container.bg = bg;
            
            // Store reference to meth button for conditional display
            if (type.id === 'meth') {
                this.methButton = container;
            }
            
            this.container.add(container);
            this.processingTypeButtons.push(container);
        });
        
        this.updateProcessingTypeSelection();
    }
    
    createDrugTypeButtons(x, y) {
        // Drug type buttons are now handled by the drug dropdown
        // This method kept for compatibility but does nothing
    }
    
    updateRecipeDisplay() {
        // Recipe display is handled by updateDisplay() for each processing type
        // This method kept for compatibility but does nothing additional
    }
    
    updateProcessingTypeSelection() {
        if (!this.processingTypeButtons) return;
        
        this.processingTypeButtons.forEach(container => {
            const bg = container.bg;
            if (container.processingType === this.selectedProcessingType) {
                bg.setStrokeStyle(2, 0xffcc00);
                bg.setFillStyle(0x3a3a3a);
            } else {
                bg.setStrokeStyle(2, 0x666666);
                bg.setFillStyle(0x2a2a2a);
            }
        });
    }
}
