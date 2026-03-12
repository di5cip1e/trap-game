/**
 * WorldMapScene.js - Pokemon-style world navigation for TRAP
 * Shows all 8 neighborhoods and allows travel between unlocked areas
 */

import { NEIGHBORHOODS } from './MapGenerator.js';

export default class WorldMapScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WorldMapScene' });
    }

    init() {
        // Get the game scene reference
        this.gameScene = this.registry.get('gameScene');
        
        // Get player's current neighborhood and unlocked areas
        this.currentNeighborhood = this.gameScene?.playerState?.neighborhood || 'OLD_TOWN';
        this.unlockedNeighborhoods = this.gameScene?.playerState?.unlockedNeighborhoods || ['OLD_TOWN'];
        
        // Store original scene
        this.originalScene = this.gameScene;
    }

    preload() {
        // Load map assets - use solid colors as fallback
    }

    create() {
        const { width, height } = this.scale;
        
        // Dark background
        this.add.rectangle(width/2, height/2, width, height, 0x1a1a2e);
        
        // Title
        const titleText = this.add.text(width/2, 60, 'THE DOCKS', {
            fontSize: '48px',
            fontFamily: 'Courier, monospace',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Subtitle
        this.add.text(width/2, 110, 'Select a neighborhood to travel to', {
            fontSize: '24px',
            fontFamily: 'Courier, monospace',
            color: '#888888'
        }).setOrigin(0.5);
        
        // Create the world map visualization
        this.createWorldMap(width, height);
        
        // Create neighborhood cards
        this.createNeighborhoodCards(width, height);
        
        // Back instruction
        this.add.text(width/2, height - 50, 'Press ESC or M to return to game', {
            fontSize: '20px',
            fontFamily: 'Courier, monospace',
            color: '#666666'
        }).setOrigin(0.5);
        
        // Input
        this.input.keyboard.on('keydown-ESC', () => this.returnToGame());
        this.input.keyboard.on('keydown-M', () => this.returnToGame());
        
        // Fade in effect
        this.cameras.main.fadeIn(300);
    }

    createWorldMap(width, height) {
        // Map layout positions (approximate geographic positions)
        const mapLayout = {
            'OLD_TOWN': { x: 0.2, y: 0.25 },
            'SKID_ROW': { x: 0.15, y: 0.55 },
            'THE_FLATS': { x: 0.35, y: 0.55 },
            'INDUSTRIAL_ZONE': { x: 0.5, y: 0.25 },
            'THE_MAW': { x: 0.35, y: 0.3 },
            'SALVAGE_YARD': { x: 0.55, y: 0.6 },
            'THE_HARBOR': { x: 0.75, y: 0.5 },
            'IRONWORKS': { x: 0.7, y: 0.7 }
        };
        
        const mapWidth = width * 0.6;
        const mapHeight = height * 0.4;
        const mapX = width / 2 - mapWidth / 2;
        const mapY = height / 2 - mapHeight / 2 + 30;
        
        // Draw map background
        const mapBg = this.add.rectangle(width/2, mapY + mapHeight/2, mapWidth, mapHeight, 0x0a0a15);
        mapBg.setStrokeStyle(2, 0x444444);
        
        // Draw connections between neighborhoods
        const connections = [
            ['OLD_TOWN', 'THE_MAW'],
            ['OLD_TOWN', 'INDUSTRIAL_ZONE'],
            ['OLD_TOWN', 'THE_FLATS'],
            ['SKID_ROW', 'THE_FLATS'],
            ['THE_FLATS', 'SALVAGE_YARD'],
            ['THE_FLATS', 'INDUSTRIAL_ZONE'],
            ['INDUSTRIAL_ZONE', 'THE_HARBOR'],
            ['SALVAGE_YARD', 'IRONWORKS'],
            ['IRONWORKS', 'THE_HARBOR'],
            ['THE_MAW', 'INDUSTRIAL_ZONE']
        ];
        
        const graphics = this.add.graphics();
        
        connections.forEach(([from, to]) => {
            const fromPos = mapLayout[from];
            const toPos = mapLayout[to];
            if (fromPos && toPos) {
                const x1 = mapX + fromPos.x * mapWidth;
                const y1 = mapY + fromPos.y * mapHeight;
                const x2 = mapX + toPos.x * mapWidth;
                const y2 = mapY + toPos.y * mapHeight;
                
                // Check if both are unlocked
                const fromUnlocked = this.unlockedNeighborhoods.includes(from);
                const toUnlocked = this.unlockedNeighborhoods.includes(to);
                
                graphics.lineStyle(2, (fromUnlocked && toUnlocked) ? 0x666666 : 0x333333);
                graphics.lineBetween(x1, y1, x2, y2);
            }
        });
        
        // Draw neighborhood markers
        Object.entries(mapLayout).forEach(([key, pos]) => {
            const x = mapX + pos.x * mapWidth;
            const y = mapY + pos.y * mapHeight;
            const neighborhood = NEIGHBORHOODS[key];
            const isUnlocked = this.unlockedNeighborhoods.includes(key);
            const isCurrent = this.currentNeighborhood === key;
            
            // Marker
            const color = isUnlocked ? parseInt(neighborhood.color.replace('#', '0x')) : 0x333333;
            const markerSize = isCurrent ? 20 : 14;
            
            const marker = this.add.circle(x, y, markerSize, color);
            if (isCurrent) {
                marker.setStrokeStyle(3, 0xffffff);
            } else if (!isUnlocked) {
                marker.setAlpha(0.4);
            }
            
            // Label
            this.add.text(x, y + 25, neighborhood.name, {
                fontSize: isCurrent ? '14px' : '12px',
                fontFamily: 'Courier, monospace',
                color: isUnlocked ? '#ffffff' : '#555555'
            }).setOrigin(0.5);
            
            // Store for click detection
            if (isUnlocked) {
                marker.setInteractive({ useHandCursor: true })
                    .on('pointerdown', () => this.travelToNeighborhood(key));
            }
        });
        
        // Current location indicator
        this.currentLabel = this.add.text(width/2, mapY + mapHeight + 20, 
            `Current: ${NEIGHBORHOODS[this.currentNeighborhood].name}`, {
            fontSize: '18px',
            fontFamily: 'Courier, monospace',
            color: '#00ff00'
        }).setOrigin(0.5);
    }

    createNeighborhoodCards(width, height) {
        const startY = 280;
        const cardWidth = 350;
        const cardHeight = 100;
        const gap = 20;
        
        // Neighborhoods to display
        const neighborhoods = Object.entries(NEIGHBORHOODS);
        
        // Create two columns
        const leftCol = [];
        const rightCol = [];
        
        neighborhoods.forEach(([key, data], index) => {
            if (index % 2 === 0) {
                leftCol.push([key, data]);
            } else {
                rightCol.push([key, data]);
            }
        });
        
        this.cards = [];
        
        const createCard = (key, data, x, y) => {
            const isUnlocked = this.unlockedNeighborhoods.includes(key);
            const isCurrent = this.currentNeighborhood === key;
            
            // Card background
            const bgColor = isCurrent ? 0x2a4a2a : (isUnlocked ? 0x2a2a3a : 0x1a1a1a);
            const card = this.add.rectangle(x, y, cardWidth, cardHeight, bgColor);
            card.setStrokeStyle(isCurrent ? 2 : 1, isCurrent ? 0x00ff00 : (isUnlocked ? 0x666666 : 0x333333));
            
            // Neighborhood name
            this.add.text(x - cardWidth/2 + 15, y - 30, data.name, {
                fontSize: '18px',
                fontFamily: 'Courier, monospace',
                color: isUnlocked ? data.color : '#555555',
                fontStyle: 'bold'
            });
            
            // Description (truncated)
            const desc = data.description.length > 45 ? data.description.substring(0, 42) + '...' : data.description;
            this.add.text(x - cardWidth/2 + 15, y, desc, {
                fontSize: '12px',
                fontFamily: 'Courier, monospace',
                color: isUnlocked ? '#aaaaaa' : '#555555'
            });
            
            // Factions
            const factions = data.factions.join(', ');
            this.add.text(x - cardWidth/2 + 15, y + 25, `Factions: ${factions}`, {
                fontSize: '11px',
                fontFamily: 'Courier, monospace',
                color: isUnlocked ? '#888888' : '#444444'
            });
            
            // Danger level
            const dangerText = '⚠'.repeat(data.dangerLevel) + '☆'.repeat(5 - data.dangerLevel);
            this.add.text(x + cardWidth/2 - 15, y - 30, dangerText, {
                fontSize: '12px',
                fontFamily: 'Courier, monospace',
                color: data.dangerLevel >= 4 ? '#ff4444' : (data.dangerLevel >= 3 ? '#ffaa00' : '#44ff44')
            }).setOrigin(1, 0);
            
            // Status indicator
            let statusText = '';
            let statusColor = '#555555';
            
            if (isCurrent) {
                statusText = 'CURRENT';
                statusColor = '#00ff00';
            } else if (isUnlocked) {
                statusText = 'UNLOCKED';
                statusColor = '#888888';
            } else {
                statusText = 'LOCKED';
            }
            
            this.add.text(x + cardWidth/2 - 15, y + 25, statusText, {
                fontSize: '11px',
                fontFamily: 'Courier, monospace',
                color: statusColor,
                fontStyle: 'bold'
            }).setOrigin(1, 0);
            
            // Make interactive if unlocked
            if (isUnlocked && !isCurrent) {
                card.setInteractive({ useHandCursor: true })
                    .on('pointerover', () => card.setFillStyle(isCurrent ? 0x3a5a3a : 0x3a3a4a))
                    .on('pointerout', () => card.setFillStyle(bgColor))
                    .on('pointerdown', () => this.travelToNeighborhood(key));
            }
            
            this.cards.push(card);
        };
        
        // Create left column cards
        leftCol.forEach(([key, data], index) => {
            const x = width * 0.25;
            const y = startY + index * (cardHeight + gap);
            createCard(key, data, x, y);
        });
        
        // Create right column cards
        rightCol.forEach(([key, data], index) => {
            const x = width * 0.75;
            const y = startY + index * (cardHeight + gap);
            createCard(key, data, x, y);
        });
    }

    travelToNeighborhood(key) {
        const neighborhood = NEIGHBORHOODS[key];
        
        // Show confirmation
        const { width, height } = this.scale;
        
        // Create overlay
        const overlay = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.7);
        
        // Confirmation text
        this.add.text(width/2, height/2 - 60, `Travel to ${neighborhood.name}?`, {
            fontSize: '32px',
            fontFamily: 'Courier, monospace',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        this.add.text(width/2, height/2 - 10, neighborhood.description, {
            fontSize: '16px',
            fontFamily: 'Courier, monospace',
            color: '#aaaaaa'
        }).setOrigin(0.5);
        
        // Buttons
        const confirmBtn = this.add.text(width/2 - 100, height/2 + 60, '[ CONFIRM ]', {
            fontSize: '24px',
            fontFamily: 'Courier, monospace',
            color: '#00ff00'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        const cancelBtn = this.add.text(width/2 + 100, height/2 + 60, '[ CANCEL ]', {
            fontSize: '24px',
            fontFamily: 'Courier, monospace',
            color: '#ff4444'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        confirmBtn.on('pointerover', () => confirmBtn.setColor('#44ff44'));
        confirmBtn.on('pointerout', () => confirmBtn.setColor('#00ff00'));
        cancelBtn.on('pointerover', () => cancelBtn.setColor('#ff6666'));
        cancelBtn.on('pointerout', () => cancelBtn.setColor('#ff4444'));
        
        confirmBtn.on('pointerdown', () => {
            this.performTravel(key);
        });
        
        cancelBtn.on('pointerdown', () => {
            overlay.destroy();
            confirmBtn.destroy();
            cancelBtn.destroy();
        });
        
        // Also allow Enter to confirm, ESC to cancel
        this.input.keyboard.once('keydown-ENTER', () => {
            this.performTravel(key);
        });
    }

    performTravel(targetNeighborhood) {
        // Update player state
        if (this.gameScene && this.gameScene.playerState) {
            this.gameScene.playerState.neighborhood = targetNeighborhood;
            
            // Regenerate map for new neighborhood
            this.gameScene.generateMapForNeighborhood(targetNeighborhood);
        }
        
        // Fade out and return
        this.cameras.main.fadeOut(300, 0, 0, 0);
        
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.stop();
            this.scene.resume('GameScene');
        });
    }

    returnToGame() {
        this.cameras.main.fadeOut(300, 0, 0, 0);
        
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.stop();
            this.scene.resume('GameScene');
        });
    }
}