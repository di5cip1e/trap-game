/**
 * WorldMapScene.js - Pokemon-style world navigation for TRAP
 * Shows all neighborhoods and allows travel between unlocked areas
 */

import { NEIGHBORHOODS } from './MapGenerator.js';

// ============================================================
// SHARED WORLD CONSTANTS (synced with MapController)
// ============================================================

// Adjacency graph - defines which neighborhoods connect to which
const WORLD_ADJACENCY = {
    'RIVERSIDE': [], // Isolated starter town. No physical connections to Big City.
    'OLD_TOWN': ['THE_MAW', 'THE_FLATS', 'INDUSTRIAL_ZONE'],
    'SKID_ROW': ['THE_FLATS', 'THE_MAW'],
    'THE_FLATS': ['OLD_TOWN', 'SKID_ROW', 'INDUSTRIAL_ZONE', 'SALVAGE_YARD', 'THE_MAW'],
    'INDUSTRIAL_ZONE': ['OLD_TOWN', 'THE_FLATS', 'THE_HARBOR', 'THE_MAW'],
    'THE_MAW': ['OLD_TOWN', 'INDUSTRIAL_ZONE', 'SKID_ROW', 'THE_FLATS'],
    'SALVAGE_YARD': ['THE_FLATS', 'IRONWORKS'],
    'IRONWORKS': ['SALVAGE_YARD', 'THE_HARBOR'],
    'THE_HARBOR': ['INDUSTRIAL_ZONE', 'IRONWORKS']
};

// Unlock requirements by danger level
const UNLOCK_REQUIREMENTS = {
    'RIVERSIDE': { minLevel: 1, dangerLevel: 2 },
    'OLD_TOWN': { minLevel: 1, dangerLevel: 2 },
    'SKID_ROW': { minLevel: 1, dangerLevel: 5 },
    'THE_FLATS': { minLevel: 2, dangerLevel: 4 },
    'IRONWORKS': { minLevel: 2, dangerLevel: 3 },
    'THE_HARBOR': { minLevel: 2, dangerLevel: 3 },
    'INDUSTRIAL_ZONE': { minLevel: 4, dangerLevel: 4 },
    'THE_MAW': { minLevel: 4, dangerLevel: 4 },
    'SALVAGE_YARD': { minLevel: 4, dangerLevel: 3 }
};

export default class WorldMapScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WorldMapScene' });
    }

    init() {
        this.gameScene = this.registry.get('gameScene') || this.scene.manager.getScene('GameScene');
        this.currentNeighborhood = this.gameScene?.playerState?.neighborhood || 'RIVERSIDE';
        this.unlockedNeighborhoods = this.gameScene?.playerState?.unlockedNeighborhoods || ['RIVERSIDE'];
    }

    create() {
        const { width, height } = this.scale;
        
        // Dark background
        this.add.rectangle(width/2, height/2, width, height, 0x1a1a2e);
        
        // Title (Dynamic based on whether they are in Riverside or Big City)
        const isBigCity = this.currentNeighborhood !== 'RIVERSIDE';
        const title = isBigCity ? 'THE DOCKS' : 'RIVERSIDE OUTSKIRTS';
        
        this.add.text(width/2, 40, title, {
            fontSize: '32px',
            fontFamily: 'Courier, monospace',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Subtitle
        this.add.text(width/2, 75, 'Select a neighborhood to travel', {
            fontSize: '14px',
            fontFamily: 'Courier, monospace',
            color: '#888888'
        }).setOrigin(0.5);
        
        // Create neighborhood cards
        this.createNeighborhoodCards();
        
        // Back button
        const backBtn = this.add.rectangle(width - 80, height - 40, 120, 40, 0x2a2a4a);
        backBtn.setStrokeStyle(2, 0x666666);
        backBtn.setInteractive({ useHandCursor: true });
        
        const backText = this.add.text(width - 80, height - 40, 'BACK', {
            fontSize: '14px',
            fontFamily: 'Courier, monospace',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        backBtn.on('pointerover', () => backBtn.setFillStyle(0x3a3a5a));
        backBtn.on('pointerout', () => backBtn.setFillStyle(0x2a2a4a));
        backBtn.on('pointerup', () => this.returnToGame());
        
        // Legend
        this.createLegend(width, height);
    }
    
    createLegend(width, height) {
        const legendY = height - 100;
        
        // Unlocked
        this.add.rectangle(100, legendY, 20, 20, 0x2a2a3a).setStrokeStyle(1, 0x666666);
        this.add.text(120, legendY - 8, 'Unlocked', { fontSize: '10px', color: '#888888' });
        
        // Current
        this.add.rectangle(100, legendY + 30, 20, 20, 0x2a4a2a).setStrokeStyle(1, 0x00ff00);
        this.add.text(120, legendY + 22, 'Current', { fontSize: '10px', color: '#00ff00' });
        
        // Locked
        this.add.rectangle(100, legendY + 60, 20, 20, 0x1a1a1a).setStrokeStyle(1, 0x333333);
        this.add.text(120, legendY + 52, 'Locked', { fontSize: '10px', color: '#555555' });
    }
    
    createNeighborhoodCards() {
        const { width, height } = this.scale;
        
        const neighborhoods = Object.keys(NEIGHBORHOODS);
        const cardWidth = 200;
        const cardHeight = 120;
        const cols = 3;
        const startX = (width - (cols * cardWidth + (cols - 1) * 20)) / 2 + cardWidth / 2;
        const startY = 180;
        
        neighborhoods.forEach((key, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = startX + col * (cardWidth + 20);
            const y = startY + row * (cardHeight + 20);
            
            const data = NEIGHBORHOODS[key];
            const isUnlocked = this.unlockedNeighborhoods.includes(key);
            const isCurrent = this.currentNeighborhood === key;
            
            // Skip Riverside on Big City map
            if (this.currentNeighborhood !== 'RIVERSIDE' && key === 'RIVERSIDE') return;
            
            // Skip Big City neighborhoods on Riverside map
            if (this.currentNeighborhood === 'RIVERSIDE' && key !== 'RIVERSIDE') return;
            
            // Get connected neighborhoods
            const connections = WORLD_ADJACENCY[key] || [];
            const canTravel = isUnlocked && connections.some(c => this.unlockedNeighborhoods.includes(c));
            
            // Card background
            const bgColor = isCurrent ? 0x2a4a2a : (isUnlocked ? 0x2a2a3a : 0x1a1a1a);
            const card = this.add.rectangle(x, y, cardWidth, cardHeight, bgColor);
            card.setStrokeStyle(isCurrent ? 2 : 1, isCurrent ? 0x00ff00 : (isUnlocked ? 0x666666 : 0x333333));
            
            if (isUnlocked && !isCurrent) {
                card.setInteractive({ useHandCursor: canTravel });
                
                if (canTravel) {
                    card.on('pointerover', () => card.setFillStyle(0x3a3a4a));
                    card.on('pointerout', () => card.setFillStyle(bgColor));
                    card.on('pointerup', () => this.performTravel(key));
                }
            }
            
            // Neighborhood name
            this.add.text(x - cardWidth/2 + 15, y - 40, data.name, {
                fontSize: '16px',
                fontFamily: 'Courier, monospace',
                color: isUnlocked ? data.color : '#555555',
                fontStyle: 'bold'
            });
            
            // Danger level
            const dangerLabel = UNLOCK_REQUIREMENTS[key]?.dangerLevel || 2;
            const dangerColor = dangerLabel <= 2 ? '#44ff44' : dangerLabel <= 4 ? '#ffaa00' : '#ff4444';
            this.add.text(x + cardWidth/2 - 60, y - 40, `Lv${dangerLabel}`, {
                fontSize: '10px',
                fontFamily: 'Courier, monospace',
                color: isUnlocked ? dangerColor : '#444444'
            });
            
            // Description
            const desc = data.description.length > 30 ? data.description.substring(0, 27) + '...' : data.description;
            this.add.text(x - cardWidth/2 + 15, y - 15, desc, {
                fontSize: '11px',
                fontFamily: 'Courier, monospace',
                color: isUnlocked ? '#aaaaaa' : '#555555'
            });
            
            // Factions
            const factions = data.factions.join(', ');
            const factionText = factions.length > 25 ? factions.substring(0, 22) + '...' : factions;
            this.add.text(x - cardWidth/2 + 15, y + 20, factionText, {
                fontSize: '9px',
                fontFamily: 'Courier, monospace',
                color: isUnlocked ? '#888888' : '#444444'
            });
            
            // Travel/Status indicator
            let statusText = '';
            let statusColor = '#555555';
            
            if (isCurrent) {
                statusText = 'CURRENT';
                statusColor = '#00ff00';
            } else if (!isUnlocked) {
                statusText = 'LOCKED';
                statusColor = '#555555';
            } else if (!canTravel) {
                statusText = 'NO PATH';
                statusColor = '#ffaa00';
            } else {
                statusText = 'TRAVEL';
                statusColor = '#00aaff';
            }
            
            this.add.text(x, y + 45, statusText, {
                fontSize: '12px',
                fontFamily: 'Courier, monospace',
                color: statusColor
            }).setOrigin(0.5);
        });
    }
    
    performTravel(targetNeighborhood) {
        // Check if we can travel
        const connections = WORLD_ADJACENCY[targetNeighborhood] || [];
        const canTravel = connections.some(c => this.unlockedNeighborhoods.includes(c));
        
        if (!canTravel) {
            this.showMessage('Cannot travel there!', '#ff4444');
            return;
        }
        
        // Get current player state
        const playerState = this.gameScene?.playerState;
        if (!playerState) {
            console.error('No player state found!');
            return;
        }
        
        // Update neighborhood
        playerState.neighborhood = targetNeighborhood;
        
        // Fade out
        this.cameras.main.fadeOut(500, 0, 0, 0);
        
        this.cameras.main.once('camerafadeoutcomplete', () => {
            // Clean restart with player state
            const savedState = JSON.stringify(playerState);
            
            // Stop both scenes
            this.scene.stop('GameScene');
            this.scene.stop('WorldMapScene');
            
            // Restart game scene with saved state
            this.scene.start('GameScene', { playerState: savedState });
        });
    }
    
    returnToGame() {
        this.cameras.main.fadeOut(300, 0, 0, 0);
        
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.stop();
            this.scene.resume('GameScene');
        });
    }
    
    showMessage(text, color) {
        const { width, height } = this.scale;
        
        const msg = this.add.text(width/2, height - 60, text, {
            fontSize: '16px',
            fontFamily: 'Courier, monospace',
            color: color,
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        
        this.time.delayedCall(2000, () => msg.destroy());
    }
}
