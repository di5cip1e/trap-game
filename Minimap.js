import Phaser from 'phaser';
import { CONFIG } from './config.js';

export default class Minimap {
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.create();
    }
    
    create() {
        const mapSize = 180;
        const cellSize = mapSize / CONFIG.GRID_WIDTH;
        
        // Background
        this.bg = this.scene.add.rectangle(
            this.x, this.y, 
            mapSize + 20, mapSize + 40,
            0x1a1a1a, 0.9
        ).setOrigin(0).setScrollFactor(0).setDepth(500);
        
        this.bg.setStrokeStyle(2, 0xffcc00);
        
        // Title
        this.title = this.scene.add.text(this.x + 10, this.y + 5, 'MAP', {
            fontFamily: 'Press Start 2P',
            fontSize: '12px',
            color: CONFIG.COLORS.primary
        }).setScrollFactor(0).setDepth(501);
        
        // Map container
        const mapOffsetY = 25;
        this.mapContainer = this.scene.add.container(this.x + 10, this.y + mapOffsetY);
        this.mapContainer.setScrollFactor(0);
        this.mapContainer.setDepth(501);
        
        // Draw grid cells
        this.cells = [];
        for (let y = 0; y < CONFIG.GRID_HEIGHT; y++) {
            this.cells[y] = [];
            for (let x = 0; x < CONFIG.GRID_WIDTH; x++) {
                const tile = this.scene.worldMap[y][x];
                let color = 0x333333; // Default street color
                
                if (tile.type === 'tile-sidewalk') {
                    color = 0x555555; // Lighter for sidewalk
                }
                
                const cell = this.scene.add.rectangle(
                    x * cellSize,
                    y * cellSize,
                    cellSize - 0.5,
                    cellSize - 0.5,
                    color
                ).setOrigin(0);
                
                this.cells[y][x] = cell;
                this.mapContainer.add(cell);
            }
        }
        
        // Player marker
        this.playerMarker = this.scene.add.text(0, 0, 'P', {
            fontFamily: 'Press Start 2P',
            fontSize: '10px',
            color: CONFIG.COLORS.primary,
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.mapContainer.add(this.playerMarker);
        
        this.cellSize = cellSize;
        this.update();
    }
    
    update() {
        const player = this.scene.playerState;
        
        // Clear old markers
        if (this.buyerMarkers) {
            this.buyerMarkers.forEach(m => m.destroy());
        }
        this.buyerMarkers = [];
        
        // Update player marker position
        this.playerMarker.setPosition(
            player.gridX * this.cellSize + this.cellSize / 2,
            player.gridY * this.cellSize + this.cellSize / 2
        );
        
        // Add buyer markers
        if (this.scene.buyers) {
            this.scene.buyers.forEach(buyer => {
                const marker = this.scene.add.circle(
                    buyer.x * this.cellSize + this.cellSize / 2,
                    buyer.y * this.cellSize + this.cellSize / 2,
                    2,
                    0xffcc00
                );
                this.mapContainer.add(marker);
                this.buyerMarkers.push(marker);
            });
        }
        
        // Optional: pulse effect
        this.scene.tweens.add({
            targets: this.playerMarker,
            scale: { from: 1, to: 1.3 },
            duration: 300,
            yoyo: true,
            ease: 'Sine.easeInOut'
        });
    }
}
