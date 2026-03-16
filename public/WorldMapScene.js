/**
 * WorldMapScene.js - Pokemon-style world navigation for TRAP
 */
import { NEIGHBORHOODS } from './MapGenerator.js';

const WORLD_ADJACENCY = {
    'RIVERSIDE': [],
    'OLD_TOWN': ['THE_MAW', 'THE_FLATS', 'INDUSTRIAL_ZONE'],
    'SKID_ROW': ['THE_FLATS', 'THE_MAW'],
    'THE_FLATS': ['OLD_TOWN', 'SKID_ROW', 'INDUSTRIAL_ZONE', 'SALVAGE_YARD', 'THE_MAW'],
    'INDUSTRIAL_ZONE': ['OLD_TOWN', 'THE_FLATS', 'THE_HARBOR', 'THE_MAW'],
    'THE_MAW': ['OLD_TOWN', 'INDUSTRIAL_ZONE', 'SKID_ROW', 'THE_FLATS'],
    'SALVAGE_YARD': ['THE_FLATS', 'IRONWORKS'],
    'IRONWORKS': ['SALVAGE_YARD', 'THE_HARBOR'],
    'THE_HARBOR': ['INDUSTRIAL_ZONE', 'IRONWORKS']
};

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
    constructor() { super({ key: 'WorldMapScene' }); }

    init() {
        this.gameScene = this.registry.get('gameScene') || this.scene.manager.getScene('GameScene');
        this.currentNeighborhood = this.gameScene?.playerState?.neighborhood || 'RIVERSIDE';
        this.unlockedNeighborhoods = this.gameScene?.playerState?.unlockedNeighborhoods || ['RIVERSIDE'];
    }

    create() {
        const { width, height } = this.scale;
        this.add.rectangle(width/2, height/2, width, height, 0x1a1a2e);
        
        const title = this.currentNeighborhood !== 'RIVERSIDE' ? 'THE DOCKS' : 'RIVERSIDE OUTSKIRTS';
        this.add.text(width/2, 60, title, { fontSize: '48px', fontFamily: 'Courier, monospace', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(width/2, 110, 'Select a neighborhood to travel to', { fontSize: '24px', fontFamily: 'Courier, monospace', color: '#888888' }).setOrigin(0.5);
        
        this.createWorldMap(width, height);
        this.createNeighborhoodCards(width, height);
        
        this.add.text(width/2, height - 50, 'Press ESC or M to return to game', { fontSize: '20px', fontFamily: 'Courier, monospace', color: '#666666' }).setOrigin(0.5);
        
        this.input.keyboard.on('keydown-ESC', () => this.returnToGame());
        this.input.keyboard.on('keydown-M', () => this.returnToGame());
        this.cameras.main.fadeIn(300);
    }
    
    createWorldMap(width, height) {
        const mapLayout = {
            'RIVERSIDE': { x: 0.1, y: 0.8 },
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
        
        this.add.rectangle(width/2, mapY + mapHeight/2, mapWidth, mapHeight, 0x0a0a15).setStrokeStyle(2, 0x444444);
        
        const connections = [];
        Object.entries(WORLD_ADJACENCY).forEach(([from, neighbors]) => {
            neighbors.forEach(to => {
                const forward = [from, to].sort().join('-');
                if (!connections.some(c => [...c].sort().join('-') === forward)) connections.push([from, to]);
            });
        });
        
        const graphics = this.add.graphics();
        connections.forEach(([from, to]) => {
            const fromPos = mapLayout[from];
            const toPos = mapLayout[to];
            if (fromPos && toPos) {
                const fromUnlocked = this.unlockedNeighborhoods.includes(from);
                const toUnlocked = this.unlockedNeighborhoods.includes(to);
                graphics.lineStyle(2, (fromUnlocked && toUnlocked) ? 0x666666 : 0x333333);
                graphics.lineBetween(mapX + fromPos.x * mapWidth, mapY + fromPos.y * mapHeight, mapX + toPos.x * mapWidth, mapY + toPos.y * mapHeight);
            }
        });
        
        Object.entries(mapLayout).forEach(([key, pos]) => {
            const neighborhood = NEIGHBORHOODS[key];
            if (!neighborhood) return;
            
            const playerLevel = this.gameScene?.playerState?.level || 1;
            const reqs = UNLOCK_REQUIREMENTS[key] || { minLevel: 1 };
            const isUnlocked = this.unlockedNeighborhoods.includes(key) && playerLevel >= reqs.minLevel;
            const isCurrent = this.currentNeighborhood === key;
            
            const x = mapX + pos.x * mapWidth;
            const y = mapY + pos.y * mapHeight;
            const color = isUnlocked ? parseInt(neighborhood.color.replace('#', '0x')) : 0x333333;
            
            const marker = this.add.circle(x, y, isCurrent ? 20 : 14, color);
            if (isCurrent) marker.setStrokeStyle(3, 0xffffff);
            else if (!isUnlocked) marker.setAlpha(0.4);
            
            this.add.text(x, y + 25, neighborhood.name, { fontSize: isCurrent ? '14px' : '12px', fontFamily: 'Courier, monospace', color: isUnlocked ? '#ffffff' : '#555555' }).setOrigin(0.5);
            
            if (isUnlocked) {
                marker.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.travelToNeighborhood(key));
            }
        });
        
        const currentName = NEIGHBORHOODS[this.currentNeighborhood]?.name || 'Unknown';
        this.add.text(width/2, mapY + mapHeight + 20, `Current: ${currentName}`, { fontSize: '18px', fontFamily: 'Courier, monospace', color: '#00ff00' }).setOrigin(0.5);
    }
    
    createNeighborhoodCards(width, height) {
        const startY = 280;
        const cardWidth = 350;
        const cardHeight = 100;
        
        Object.entries(NEIGHBORHOODS).forEach(([key, data], index) => {
            const playerLevel = this.gameScene?.playerState?.level || 1;
            const reqs = UNLOCK_REQUIREMENTS[key] || { minLevel: 1 };
            const isUnlocked = this.unlockedNeighborhoods.includes(key) && playerLevel >= reqs.minLevel;
            const isCurrent = this.currentNeighborhood === key;
            
            const x = width * 0.5;
            const y = startY + index * (cardHeight + 20);
            
            const bgColor = isCurrent ? 0x2a4a2a : (isUnlocked ? 0x2a2a3a : 0x1a1a1a);
            const card = this.add.rectangle(x, y, cardWidth, cardHeight, bgColor);
            card.setStrokeStyle(isCurrent ? 2 : 1, isCurrent ? 0x00ff00 : (isUnlocked ? 0x666666 : 0x333333));
            
            this.add.text(x - cardWidth/2 + 15, y - 30, data.name, { fontSize: '18px', fontFamily: 'Courier, monospace', color: isUnlocked ? data.color : '#555555', fontStyle: 'bold' });
            this.add.text(x - cardWidth/2 + 15, y, data.description.substring(0, 40), { fontSize: '12px', fontFamily: 'Courier, monospace', color: isUnlocked ? '#aaaaaa' : '#555555' });
            
            const statusText = isCurrent ? 'CURRENT' : (isUnlocked ? 'UNLOCKED' : 'LOCKED');
            const statusColor = isCurrent ? '#00ff00' : (isUnlocked ? '#888888' : '#555555');
            this.add.text(x + cardWidth/2 - 15, y + 25, statusText, { fontSize: '11px', fontFamily: 'Courier, monospace', color: statusColor }).setOrigin(1, 0);
            
            if (isUnlocked && !isCurrent) {
                card.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.travelToNeighborhood(key));
            }
        });
    }
    
    travelToNeighborhood(key) {
        const { width, height } = this.scale;
        const overlay = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.7);
        
        const confirmBtn = this.add.text(width/2 - 80, height/2 + 40, '[ CONFIRM ]', { fontSize: '24px', fontFamily: 'Courier, monospace', color: '#00ff00' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        const cancelBtn = this.add.text(width/2 + 80, height/2 + 40, '[ CANCEL ]', { fontSize: '24px', fontFamily: 'Courier, monospace', color: '#ff4444' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        confirmBtn.on('pointerdown', () => { overlay.destroy(); confirmBtn.destroy(); cancelBtn.destroy(); this.performTravel(key); });
        cancelBtn.on('pointerdown', () => { overlay.destroy(); confirmBtn.destroy(); cancelBtn.destroy(); });
    }
    
    performTravel(targetNeighborhood) {
        try {
            if (this.gameScene && this.gameScene.playerState) {
                this.gameScene.playerState.neighborhood = targetNeighborhood;
            } else {
                return;
            }
            
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                const preservedState = this.gameScene.playerState;
                this.scene.stop();
                this.gameScene.scene.restart({ loadedState: preservedState });
            });
        } catch (e) {
            console.error('Travel error:', e);
        }
    }
    
    returnToGame() {
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.stop();
            this.scene.resume('GameScene');
        });
    }
}
