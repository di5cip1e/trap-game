import Phaser from 'phaser';
import { CONFIG } from './config.js';
import { EventBus, EVENTS } from './EventBus.js';

export default class TutorialUI {
    constructor(scene) {
        this.scene = scene;
        this.isOpen = false;
        this.currentSection = 0;
        
        // Hints System - non-blocking contextual tips
        this.hintsSystem = new HintsSystem(scene);
        
        // Tutorial sections - matches TUTORIAL.md content
        this.sections = [
            {
                title: 'MOVEMENT',
                icon: '👟',
                content: `The streets belong to those who know how to navigate them.

CONTROLS:
• WASD Keys - Move up, left, down, right
• Arrow Keys - Alternative movement
• Click/Tap - Walk to that spot

TIPS:
- Each step costs time and HUSTLE
- Stick to alleyways - less heat, more speed
- Running burns hustle fast - walk when you can`
            },
            {
                title: 'MAKING MONEY',
                icon: '💰',
                content: `This is a business. Master the cycle or get crushed.

STEP 1: BUY RAW
Find a Supplier (📦 on map)
Cost: $50 per unit
Watch your inventory limit!

STEP 2: PROCESS
Go to Workstation (🔥 in Safehouse)
Convert raw → product
Costs HUSTLE - watch your energy!
Yield: 2 product per 1 raw

STEP 3: SELL
Find a Buyer (💵 on map)
Sell for $100 per unit
Each sale generates HEAT

PROFIT: ~$85 per cycle, minus heat costs`
            },
            {
                title: 'SAFEHOUSE',
                icon: '🏠',
                content: `Your base. Upgrade it or die in the streets.

SLEEP:
- Recover HUSTLE (energy)
- Reduces HEAT by 20
- Essential for survival

STASH:
- Store raw & product safely
- Protected from police seizures
- More slots with upgrades

WORKSTATION:
- Process raw → product
- Upgrade for speed/efficiency

SAFEHOUSE TIERS:
- Crib (Tier 1): 2 stash slots
- Apartment (Tier 3): +Workstation
- House (Tier 5): +Runners, 6 slots
- Mansion (Tier 7): Full power`
            },
            {
                title: 'HEAT & POLICE',
                icon: '🚔',
                content: `The law is watching. Stay below the radar.

HEAT LEVELS:
• 0-25%: Clean - ignore police
• 26-50%: Suspicious - more police
• 51-75%: Wanted - active hunting
• 76-100%: BUSTED - non-stop pursuit

HEAT SOURCES:
• Selling: +5 per sale
• Passing out: +25
• Running from police: +10

REDUCE HEAT:
• Sleep at safehouse: -20
• New day passes: -10
• Time heals all wounds

If caught: lose product, pay fine!`
            },
            {
                title: 'RUNNERS',
                icon: '🏃',
                content: `Work smart. Let others work for you.

WHAT THEY DO:
• Auto-sell product while you're away
• Zero heat from their sales
• Take a cut, but volume makes profit

HOW TO HIRE:
• Unlock at Safehouse Tier 3
• Visit Safehouse menu
• Pay hiring fee
• Assign product to runner

TIPS:
- Stock runner before sleeping
- Higher tier = faster + more profit
- Build a network for full automation

THE KEY TO GETTING RICH!`
            },
            {
                title: 'CALENDAR EVENTS',
                icon: '📅',
                content: `The streets change every week. Adapt or die.

TIME SYSTEM:
- Morning, Afternoon, Evening, Night
- Some spots only open at certain times
- Weekends = special opportunities

WEEKLY EVENTS:

🔴 CRACKDOWN
Police everywhere. Heat builds fast.
TIP: Stay low, limit sales

🟢 DROUGHT
Prices 2x-3x! Supply scarce.
TIP: Buy raw early, profit big

⚡ POWER OUTAGE
Some locations close. Workstations slow.
TIP: Plan processing ahead

Watch the calendar in your HUD!`
            },
            {
                title: 'COMBAT',
                icon: '⚔️',
                content: `Sometimes you can't run. Fight smart.

ROCK-PAPER-SCISSORS:
• 🔨 HAMMER beats ✂️ KNIFE
• ✂️ KNIFE beats 🛡️ SHIELD
• 🛡️ SHIELD beats 🔨 HAMMER

DAMAGE:
- Based on ABILITY stat
- INTUITION helps predict opponent
- LUCK = critical hits

TIPS:
- Read patterns in opponent choices
- Don't fight fair - run if outmatched
- Winning = respect + loot
- Losing = product lost + medical bills

Sometimes running is the smart play.`
            },
            {
                title: 'QUICK START',
                icon: '✅',
                content: `YOUR MISSION (if you choose to accept it):

□ Buy raw materials from Supplier (📦)
□ Process at Safehouse Workstation (🔥)
□ Sell product at Buyer (💵)
□ Monitor heat - sleep to reduce
□ Upgrade safehouse when possible
□ Watch calendar for events
□ Avoid fights unless necessary

PROFIT FORMULA:
Sell $100 - Buy $50 - Hustle Cost = ~$85 profit

Remember:
Stay smart. Stay alive.
Welcome to the game.`
            }
        ];
    }
    
    open(sectionIndex = 0) {
        if (this.isOpen) {
            this.currentSection = sectionIndex;
            this.render();
            return;
        }
        
        this.isOpen = true;
        this.currentSection = sectionIndex;
        this.render();
    }
    
    close() {
        this.isOpen = false;
        this.clearUI();
    }
    
    clearUI() {
        if (this.overlay) {
            this.overlay.destroy();
            this.overlay = null;
        }
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
        if (this.navContainer) {
            this.navContainer.destroy();
            this.navContainer = null;
        }
    }
    
    render() {
        this.clearUI();
        
        const { width, height } = this.scene.scale;
        const section = this.sections[this.currentSection];
        
        // Darken background
        this.overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9);
        this.overlay.setScrollFactor(0);
        this.overlay.setDepth(950);
        this.overlay.setInteractive();
        
        // Main panel - dark grungy style
        const panelWidth = 800;
        const panelHeight = 650;
        
        // Panel background with border
        const panelBg = this.scene.add.rectangle(width / 2, height / 2, panelWidth, panelHeight, 0x1a1a1a);
        panelBg.setScrollFactor(0);
        panelBg.setDepth(951);
        panelBg.setStrokeStyle(4, 0xff6600); // Orange border for gritty look
        
        // Title bar
        const titleBar = this.scene.add.rectangle(width / 2, height / 2 - panelHeight/2 + 30, panelWidth, 60, 0x2a2a2a);
        titleBar.setScrollFactor(0);
        titleBar.setDepth(952);
        
        // Section title
        const titleText = this.scene.add.text(
            width / 2, 
            height / 2 - panelHeight/2 + 30,
            `${section.icon} ${section.title}`,
            {
                fontFamily: 'Press Start 2P',
                fontSize: '24px',
                color: CONFIG.COLORS.primary,
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(953);
        
        // Content - scrollable area
        const contentBg = this.scene.add.rectangle(
            width / 2, 
            height / 2 + 20, 
            panelWidth - 60, 
            panelHeight - 160, 
            0x0d0d0d
        );
        contentBg.setScrollFactor(0).setDepth(952);
        
        // Content text - word wrap manually
        const contentText = this.scene.add.text(
            width / 2 - panelWidth/2 + 50,
            height / 2 - panelHeight/2 + 100,
            section.content,
            {
                fontFamily: 'Courier New',
                fontSize: '16px',
                color: CONFIG.COLORS.text,
                lineSpacing: 6,
                wordWrap: { width: panelWidth - 100 }
            }
        ).setScrollFactor(0).setDepth(953);
        
        // Navigation container
        this.navContainer = this.scene.add.container(0, 0);
        this.navContainer.setScrollFactor(0);
        this.navContainer.setDepth(954);
        
        // Previous button
        const prevBtn = this.createNavButton(
            width / 2 - 300,
            height / 2 + panelHeight/2 - 50,
            '◀ PREV',
            this.currentSection > 0 ? 0x666666 : 0x333333,
            () => {
                if (this.currentSection > 0) {
                    this.currentSection--;
                    this.render();
                }
            }
        );
        this.navContainer.add(prevBtn);
        
        // Section indicator
        const sectionIndicator = this.scene.add.text(
            width / 2,
            height / 2 + panelHeight/2 - 50,
            `${this.currentSection + 1} / ${this.sections.length}`,
            {
                fontFamily: 'Press Start 2P',
                fontSize: '14px',
                color: CONFIG.COLORS.textDark
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(954);
        this.navContainer.add(sectionIndicator);
        
        // Next button
        const nextBtn = this.createNavButton(
            width / 2 + 300,
            height / 2 + panelHeight/2 - 50,
            this.currentSection < this.sections.length - 1 ? 'NEXT ▶' : 'CLOSE ✕',
            0xff6600,
            () => {
                if (this.currentSection < this.sections.length - 1) {
                    this.currentSection++;
                    this.render();
                } else {
                    this.close();
                }
            }
        );
        this.navContainer.add(nextBtn);
        
        // Section tabs at bottom
        const tabsY = height / 2 + panelHeight/2 - 90;
        const tabWidth = 80;
        const tabSpacing = 10;
        const totalTabsWidth = this.sections.length * tabWidth + (this.sections.length - 1) * tabSpacing;
        const tabsStartX = width / 2 - totalTabsWidth / 2;
        
        this.sections.forEach((sec, index) => {
            const tabX = tabsStartX + index * (tabWidth + tabSpacing) + tabWidth / 2;
            const tabColor = index === this.currentSection ? 0xff6600 : 0x444444;
            
            const tab = this.scene.add.rectangle(tabX, tabsY, tabWidth, 25, tabColor);
            tab.setScrollFactor(0).setDepth(954).setInteractive({ useHandCursor: true });
            
            tab.on('pointerover', () => {
                tab.setFillStyle(0x666666);
            });
            
            tab.on('pointerout', () => {
                tab.setFillStyle(index === this.currentSection ? 0xff6600 : 0x444444);
            });
            
            tab.on('pointerdown', () => {
                this.currentSection = index;
                this.render();
            });
            
            this.navContainer.add(tab);
        });
    }
    
    createNavButton(x, y, text, color, callback) {
        const btnWidth = 150;
        const btnHeight = 50;
        
        const btn = this.scene.add.rectangle(x, y, btnWidth, btnHeight, color);
        btn.setScrollFactor(0).setDepth(954).setInteractive({ useHandCursor: true });
        
        const btnText = this.scene.add.text(x, y, text, {
            fontFamily: 'Press Start 2P',
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(955);
        
        btn.on('pointerover', () => {
            btn.setFillStyle(color === 0x333333 ? 0x444444 : 0xff8833);
        });
        
        btn.on('pointerout', () => {
            btn.setFillStyle(color);
        });
        
        btn.on('pointerdown', callback);
        
        return btn;
    }
    
    // Called when clicking outside panel to close
    handleClick(x, y) {
        if (this.isOpen && this.overlay) {
            // Check if click is outside panel area
            const { width, height } = this.scene.scale;
            const panelWidth = 800;
            const panelHeight = 650;
            
            const inPanel = 
                x > width/2 - panelWidth/2 &&
                x < width/2 + panelWidth/2 &&
                y > height/2 - panelHeight/2 &&
                y < height/2 + panelHeight/2;
            
            if (!inPanel) {
                this.close();
            }
        }
    }
    
    // ============================================================
    // HINTS SYSTEM - Non-blocking contextual tips
    // ============================================================
    
    /**
     * Update hints system with current player state
     * Call this regularly from GameScene update loop
     */
    updateHints(playerState) {
        if (this.hintsSystem) {
            this.hintsSystem.update(playerState);
        }
    }
    
    /**
     * Trigger a specific hint manually
     */
    showHint(hintId) {
        if (this.hintsSystem) {
            this.hintsSystem.showHintById(hintId);
        }
    }
    
    /**
     * Called when player enters combat
     */
    onCombatStarted() {
        if (this.hintsSystem) {
            this.hintsSystem.onCombatStarted();
        }
    }
    
    /**
     * Called when combat ends
     */
    onCombatEnded(won) {
        if (this.hintsSystem) {
            this.hintsSystem.onCombatEnded(won);
        }
    }
    
    /**
     * Called when player makes a sale
     */
    onSale(amount) {
        if (this.hintsSystem) {
            this.hintsSystem.onSale(amount);
        }
    }
    
    /**
     * Called when player buys raw materials
     */
    onBuyRaw() {
        if (this.hintsSystem) {
            this.hintsSystem.onBuyRaw();
        }
    }
    
    /**
     * Called when heat changes
     */
    onHeatChanged(newHeat) {
        if (this.hintsSystem) {
            this.hintsSystem.onHeatChanged(newHeat);
        }
    }
    
    /**
     * Clean up hints system
     */
    destroyHints() {
        if (this.hintsSystem) {
            this.hintsSystem.destroy();
            this.hintsSystem = null;
        }
    }
}

// ============================================================
// HintsSystem - Non-blocking contextual hints
// ============================================================

class HintsSystem {
    constructor(scene) {
        this.scene = scene;
        this.activeHint = null;
        this.hintContainer = null;
        this.hintText = null;
        this.hintTimeout = null;
        this.isVisible = false;
        
        // Track trigger states
        this.state = {
            combatCount: 0,
            hasSeenCombat: false,
            inCombat: false,
            hasBoughtRaw: false,
            hasSoldProduct: false,
            totalSales: 0,
            inventoryFull: false,
            isRunning: false,
            hasEnemyEngaged: false,
            hasRunningShoes: false,
            stepsTaken: 0,
            heat: 0,
            hustle: 100,
            money: 100,
            rawMaterials: 0,
            product: 0,
            safehouseTier: 0,
            playerHealth: 100,
            enemyHealth: 0,
            shownRunHint: false,
            shownInventoryHint: false,
            shownShoesHint: false,
            shownAlleyHint: false,
            shownHeatBasics: false,
            shownSleepHeatHint: false,
            shownWorldMapHint: false,
            inSafehouse: false,
            timeOfDay: 'morning'
        };
        
        // All hint definitions
        this.hints = this.initializeHints();
    }
    
    initializeHints() {
        return [
            // ===== COMBAT HINTS =====
            {
                id: 'combat_first',
                category: 'combat',
                text: 'First time fighting? Rock beats Scissors, Scissors beats Shield, Shield beats Rock!',
                trigger: (s) => s.combatCount === 0 && s.hasSeenCombat,
                once: true,
                priority: 1
            },
            {
                id: 'combat_rock_paper_scissors',
                category: 'combat',
                text: 'Rock beats Scissors | Scissors beats Shield | Shield beats Rock',
                trigger: (s) => s.inCombat,
                once: false,
                priority: 2
            },
            {
                id: 'combat_run_option',
                category: 'combat',
                text: 'Running from combat costs HEAT but saves your product!',
                trigger: (s) => s.inCombat && s.combatCount > 0 && !s.shownRunHint,
                once: true,
                priority: 1
            },
            {
                id: 'combat_outmatched',
                category: 'combat',
                text: 'Outmatched? Running is sometimes the smart play!',
                trigger: (s) => s.inCombat && s.playerHealth < 30 && s.enemyHealth > 70,
                once: false,
                priority: 2
            },
            
            // ===== TRADING HINTS =====
            {
                id: 'trading_first_buy',
                category: 'trading',
                text: 'Find a Supplier on the map to buy raw materials - $50 each',
                trigger: (s) => s.rawMaterials === 0 && s.money >= 50 && !s.hasBoughtRaw,
                once: true,
                priority: 1
            },
            {
                id: 'trading_first_sell',
                category: 'trading',
                text: 'Find a Buyer on the map to sell your product - $100 each',
                trigger: (s) => s.product > 0 && !s.hasSoldProduct,
                once: true,
                priority: 1
            },
            {
                id: 'trading_process_raw',
                category: 'trading',
                text: 'Process raw materials at Safehouse workstation (2x value!)',
                trigger: (s) => s.rawMaterials > 0 && s.product === 0 && s.safehouseTier >= 1,
                once: true,
                priority: 2
            },
            {
                id: 'trading_profit_cycle',
                category: 'trading',
                text: 'Profit formula: Buy $50, Process, Sell $100 = ~$85 profit',
                trigger: (s) => s.totalSales >= 3,
                once: false,
                priority: 3
            },
            {
                id: 'trading_inventory_full',
                category: 'trading',
                text: 'Inventory full! Sell product or visit Safehouse to stash items.',
                trigger: (s) => s.inventoryFull && !s.shownInventoryHint,
                once: true,
                priority: 1
            },
            
            // ===== RUNNING HINTS =====
            {
                id: 'running_hustle_drain',
                category: 'running',
                text: 'Running burns HUSTLE fast! Walk when you are low on energy.',
                trigger: (s) => s.hustle < 30 && s.isRunning,
                once: true,
                priority: 1
            },
            {
                id: 'running_shoes_help',
                category: 'running',
                text: 'Running Shoes let you escape combat and move faster!',
                trigger: (s) => s.hasEnemyEngaged && !s.hasRunningShoes && !s.shownShoesHint,
                once: true,
                priority: 1
            },
            {
                id: 'running_alleyways',
                category: 'running',
                text: 'Stick to alleyways - less heat, more speed, safer routes.',
                trigger: (s) => s.stepsTaken > 50 && !s.shownAlleyHint,
                once: true,
                priority: 2
            },
            
            // ===== HEAT HINTS =====
            {
                id: 'heat_basics',
                category: 'heat',
                text: 'HEAT: 0-25% safe, 26-50% suspicious, 51-75% wanted, 76%+ BUSTED!',
                trigger: (s) => s.heat > 0 && s.heat < 25 && !s.shownHeatBasics,
                once: true,
                priority: 1
            },
            {
                id: 'heat_elevated',
                category: 'heat',
                text: 'Heat rising! Sleep at Safehouse (-20) or wait for a new day (-10)',
                trigger: (s) => s.heat > 50 && s.heat < 75,
                once: false,
                priority: 1
            },
            {
                id: 'heat_dangerous',
                category: 'heat',
                text: 'HIGH HEAT! Limit sales, avoid police, sleep to reduce heat fast!',
                trigger: (s) => s.heat >= 75,
                once: false,
                priority: 1
            },
            {
                id: 'heat_reducing',
                category: 'heat',
                text: 'Sleeping at Safehouse reduces HEAT by 20 - plan your rest!',
                trigger: (s) => s.heat > 25 && s.safehouseTier >= 0 && !s.shownSleepHeatHint,
                once: true,
                priority: 2
            },
            {
                id: 'heat_selling_adds',
                category: 'heat',
                text: 'Each sale adds +5 HEAT. Balance profit vs heat!',
                trigger: (s) => s.totalSales >= 1 && s.heat > 0,
                once: true,
                priority: 2
            },
            
            // ===== WORLD NAVIGATION HINTS =====
            {
                id: 'world_map_hint',
                category: 'world',
                text: 'Press M for World Map - see all neighborhoods and locations!',
                trigger: (s) => s.stepsTaken > 20 && !s.shownWorldMapHint,
                once: true,
                priority: 1
            },
            {
                id: 'world_unlock neighborhoods',
                category: 'world',
                text: 'Unlock new neighborhoods to access more Suppliers and Buyers!',
                trigger: (s) => s.stepsTaken > 100 && s.heat < 30,
                once: true,
                priority: 2
            }
        ];
    }
    
    // Update hints system with player state
    update(playerState) {
        if (!playerState) return;
        
        // Sync state from playerState
        this.state.heat = playerState.heat || 0;
        this.state.hustle = playerState.hustle || 100;
        this.state.money = playerState.money || 0;
        this.state.rawMaterials = playerState.rawMaterials || 0;
        this.state.product = playerState.product || 0;
        this.state.safehouseTier = playerState.safehouseTier || 0;
        
        // Check inventory capacity
        const rawCap = playerState.rawCapacity || 10;
        const prodCap = playerState.productCapacity || 10;
        this.state.inventoryFull = (this.state.rawMaterials >= rawCap) || (this.state.product >= prodCap);
        
        // Check for running shoes
        if (playerState.equipment) {
            this.state.hasRunningShoes = playerState.equipment.runningShoes || false;
        }
        
        // Check if hint already showing
        if (this.isVisible) return;
        
        // Find highest priority hint that triggers
        const sortedHints = [...this.hints].sort((a, b) => a.priority - b.priority);
        
        for (const hint of sortedHints) {
            if (hint.trigger(this.state)) {
                // Check if "once" hints already shown
                if (hint.once && this.state.shownIds && this.state.shownIds.has(hint.id)) {
                    continue;
                }
                this.showHint(hint);
                break;
            }
        }
    }
    
    showHint(hint) {
        if (this.isVisible) return;
        
        this.activeHint = hint;
        this.isVisible = true;
        
        // Mark as shown
        if (!this.state.shownIds) this.state.shownIds = new Set();
        this.state.shownIds.add(hint.id);
        
        // Update state flags
        if (hint.id === 'trading_first_buy') this.state.hasBoughtRaw = true;
        if (hint.id === 'trading_first_sell') this.state.hasSoldProduct = true;
        if (hint.id === 'combat_run_option') this.state.shownRunHint = true;
        if (hint.id === 'trading_inventory_full') this.state.shownInventoryHint = true;
        if (hint.id === 'running_shoes_help') this.state.shownShoesHint = true;
        if (hint.id === 'running_alleyways') this.state.shownAlleyHint = true;
        if (hint.id === 'heat_basics') this.state.shownHeatBasics = true;
        if (hint.id === 'heat_reducing') this.state.shownSleepHeatHint = true;
        if (hint.id === 'heat_selling_adds') this.state.shownHeatFromSales = true;
        if (hint.id === 'world_map_hint') this.state.shownWorldMapHint = true;
        
        // Create hint UI - small toast in bottom right
        this.createHintUI(hint);
        
        // Auto-hide after 6 seconds
        this.hintTimeout = setTimeout(() => {
            this.hideHint();
        }, 6000);
    }
    
    createHintUI(hint) {
        const { width, height } = this.scene.scale;
        const hintWidth = 400;
        const hintHeight = 60;
        const padding = 20;
        
        // Container
        this.hintContainer = this.scene.add.container(width - hintWidth/2 - padding, height - hintHeight/2 - padding);
        this.hintContainer.setScrollFactor(0);
        this.hintContainer.setDepth(900);
        
        // Background
        const bg = this.scene.add.rectangle(0, 0, hintWidth, hintHeight, 0x1a1a1a, 0.95);
        bg.setStrokeStyle(2, 0xff6600);
        this.hintContainer.add(bg);
        
        // Hint text
        this.hintText = this.scene.add.text(0, 0, hint.text, {
            fontFamily: 'Courier New',
            fontSize: '14px',
            color: '#ffffff',
            wordWrap: { width: hintWidth - 20 }
        }).setOrigin(0.5);
        this.hintContainer.add(this.hintText);
        
        // Make hint clickable to dismiss
        bg.setInteractive({ useHandCursor: true });
        bg.on('pointerdown', () => {
            this.hideHint();
        });
        
        // Fade in
        this.hintContainer.setAlpha(0);
        this.scene.tweens.add({
            targets: this.hintContainer,
            alpha: 1,
            duration: 300
        });
    }
    
    hideHint() {
        if (!this.isVisible) return;
        
        if (this.hintTimeout) {
            clearTimeout(this.hintTimeout);
            this.hintTimeout = null;
        }
        
        if (this.hintContainer) {
            this.scene.tweens.add({
                targets: this.hintContainer,
                alpha: 0,
                duration: 200,
                onComplete: () => {
                    if (this.hintContainer) {
                        this.hintContainer.destroy();
                        this.hintContainer = null;
                    }
                    this.hintText = null;
                    this.activeHint = null;
                    this.isVisible = false;
                }
            });
        } else {
            this.isVisible = false;
            this.activeHint = null;
        }
    }
    
    showHintById(hintId) {
        const hint = this.hints.find(h => h.id === hintId);
        if (hint && !this.isVisible) {
            this.showHint(hint);
        }
    }
    
    // Event handlers
    onCombatStarted() {
        this.state.hasSeenCombat = true;
        this.state.inCombat = true;
        this.state.combatCount++;
    }
    
    onCombatEnded(won) {
        this.state.inCombat = false;
    }
    
    onSale(amount) {
        this.state.totalSales++;
        this.state.hasSoldProduct = true;
    }
    
    onBuyRaw() {
        this.state.hasBoughtRaw = true;
    }
    
    onHeatChanged(newHeat) {
        this.state.heat = newHeat;
    }
    
    onPlayerRunning(isRunning) {
        this.state.isRunning = isRunning;
    }
    
    onEnemyEngaged() {
        this.state.hasEnemyEngaged = true;
    }
    
    onStepsTaken(count) {
        this.state.stepsTaken = count;
    }
    
    onTimeOfDayChange(timeOfDay) {
        this.state.timeOfDay = timeOfDay;
    }
    
    destroy() {
        if (this.hintTimeout) {
            clearTimeout(this.hintTimeout);
        }
        if (this.hintContainer) {
            this.hintContainer.destroy();
        }
    }
}
