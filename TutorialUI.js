import Phaser from 'phaser';
import { CONFIG } from './config.js';

export default class TutorialUI {
    constructor(scene) {
        this.scene = scene;
        this.isOpen = false;
        this.currentSection = 0;
        
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
}
