import { CONFIG } from './config.js';

export default class MapGenerator {
    constructor(scene, biomeType) {
        this.scene = scene;
        this.biomeType = biomeType; // 'block' or 'traphouse'
        this.seed = Math.random();
    }
    
    // Simple seeded random for consistent generation
    seededRandom(min = 0, max = 1) {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        const rnd = this.seed / 233280;
        return min + rnd * (max - min);
    }
    
    generate() {
        if (this.biomeType === 'block') {
            return this.generateBlock();
        } else {
            return this.generateTrapHouse();
        }
    }
    
    generateBlock() {
        // Male character - outdoor alley environment
        const map = [];
        const objects = [];
        
        // Initialize with alley floors
        for (let y = 0; y < CONFIG.GRID_HEIGHT; y++) {
            map[y] = [];
            for (let x = 0; x < CONFIG.GRID_WIDTH; x++) {
                map[y][x] = {
                    type: 'tile-alley',
                    walkable: true
                };
            }
        }
        
        // Add brick walls as borders
        for (let x = 0; x < CONFIG.GRID_WIDTH; x++) {
            map[0][x] = { type: 'tile-wall-brick', walkable: false };
            map[CONFIG.GRID_HEIGHT - 1][x] = { type: 'tile-wall-brick', walkable: false };
        }
        
        for (let y = 0; y < CONFIG.GRID_HEIGHT; y++) {
            map[y][0] = { type: 'tile-wall-brick', walkable: false };
            map[y][CONFIG.GRID_WIDTH - 1] = { type: 'tile-wall-brick', walkable: false };
        }
        
        // Add some cracked concrete patches (walkable)
        for (let i = 0; i < 15; i++) {
            const x = Math.floor(this.seededRandom(2, CONFIG.GRID_WIDTH - 2));
            const y = Math.floor(this.seededRandom(2, CONFIG.GRID_HEIGHT - 2));
            const width = Math.floor(this.seededRandom(2, 5));
            const height = Math.floor(this.seededRandom(2, 5));
            
            for (let dy = 0; dy < height; dy++) {
                for (let dx = 0; dx < width; dx++) {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx < CONFIG.GRID_WIDTH - 1 && ny < CONFIG.GRID_HEIGHT - 1) {
                        map[ny][nx] = { type: 'tile-concrete-cracked', walkable: true };
                    }
                }
            }
        }
        
        // Add some sidewalk areas
        for (let i = 0; i < 8; i++) {
            const x = Math.floor(this.seededRandom(2, CONFIG.GRID_WIDTH - 2));
            const y = Math.floor(this.seededRandom(2, CONFIG.GRID_HEIGHT - 2));
            const width = Math.floor(this.seededRandom(3, 6));
            const height = Math.floor(this.seededRandom(3, 6));
            
            for (let dy = 0; dy < height; dy++) {
                for (let dx = 0; dx < width; dx++) {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx < CONFIG.GRID_WIDTH - 1 && ny < CONFIG.GRID_HEIGHT - 1) {
                        map[ny][nx] = { type: 'tile-sidewalk', walkable: true };
                    }
                }
            }
        }
        
        // Add dumpsters as obstacles
        for (let i = 0; i < 5; i++) {
            const x = Math.floor(this.seededRandom(3, CONFIG.GRID_WIDTH - 4));
            const y = Math.floor(this.seededRandom(3, CONFIG.GRID_HEIGHT - 4));
            
            if (map[y][x].walkable) {
                objects.push({
                    type: 'dumpster',
                    x: x,
                    y: y,
                    walkable: false
                });
                map[y][x].walkable = false;
            }
        }
        
        // Place safehouse (cardboard box) in a safe spot
        const safehouseX = Math.floor(CONFIG.GRID_WIDTH / 4);
        const safehouseY = Math.floor(CONFIG.GRID_HEIGHT / 2);
        
        objects.push({
            type: 'safehouse',
            x: safehouseX,
            y: safehouseY,
            walkable: true
        });
        
        return { map, objects, safehousePos: { x: safehouseX, y: safehouseY } };
    }
    
    generateTrapHouse() {
        // Female character - indoor trap house
        const map = [];
        const objects = [];
        
        // Initialize with dirty floors
        for (let y = 0; y < CONFIG.GRID_HEIGHT; y++) {
            map[y] = [];
            for (let x = 0; x < CONFIG.GRID_WIDTH; x++) {
                map[y][x] = {
                    type: 'tile-dirty-floor',
                    walkable: true
                };
            }
        }
        
        // Add interior walls as borders
        for (let x = 0; x < CONFIG.GRID_WIDTH; x++) {
            map[0][x] = { type: 'tile-wall-interior', walkable: false };
            map[CONFIG.GRID_HEIGHT - 1][x] = { type: 'tile-wall-interior', walkable: false };
        }
        
        for (let y = 0; y < CONFIG.GRID_HEIGHT; y++) {
            map[y][0] = { type: 'tile-wall-interior', walkable: false };
            map[y][CONFIG.GRID_WIDTH - 1] = { type: 'tile-wall-interior', walkable: false };
        }
        
        // Create rooms with hallways
        // Vertical hallway
        const hallwayX = Math.floor(CONFIG.GRID_WIDTH / 2);
        for (let y = 1; y < CONFIG.GRID_HEIGHT - 1; y++) {
            map[y][hallwayX] = { type: 'tile-wood-floor', walkable: true };
            if (hallwayX > 0) map[y][hallwayX - 1] = { type: 'tile-wood-floor', walkable: true };
            if (hallwayX < CONFIG.GRID_WIDTH - 1) map[y][hallwayX + 1] = { type: 'tile-wood-floor', walkable: true };
        }
        
        // Horizontal hallway
        const hallwayY = Math.floor(CONFIG.GRID_HEIGHT / 2);
        for (let x = 1; x < CONFIG.GRID_WIDTH - 1; x++) {
            map[hallwayY][x] = { type: 'tile-wood-floor', walkable: true };
            if (hallwayY > 0) map[hallwayY - 1][x] = { type: 'tile-wood-floor', walkable: true };
        }
        
        // Add some room dividers (interior walls)
        // Top-left room
        for (let x = 5; x < 10; x++) {
            if (x !== hallwayX) {
                map[6][x] = { type: 'tile-wall-interior', walkable: false };
            }
        }
        
        // Bottom-right room
        for (let x = CONFIG.GRID_WIDTH - 10; x < CONFIG.GRID_WIDTH - 5; x++) {
            if (x !== hallwayX) {
                map[CONFIG.GRID_HEIGHT - 7][x] = { type: 'tile-wall-interior', walkable: false };
            }
        }
        
        // Add some wood floor rooms
        for (let i = 0; i < 6; i++) {
            const x = Math.floor(this.seededRandom(3, CONFIG.GRID_WIDTH - 5));
            const y = Math.floor(this.seededRandom(3, CONFIG.GRID_HEIGHT - 5));
            const width = Math.floor(this.seededRandom(3, 6));
            const height = Math.floor(this.seededRandom(3, 6));
            
            for (let dy = 0; dy < height; dy++) {
                for (let dx = 0; dx < width; dx++) {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx < CONFIG.GRID_WIDTH - 1 && ny < CONFIG.GRID_HEIGHT - 1 && 
                        map[ny][nx].type !== 'tile-wall-interior') {
                        map[ny][nx] = { type: 'tile-wood-floor', walkable: true };
                    }
                }
            }
        }
        
        // Place safehouse (cardboard box) near the entrance
        const safehouseX = 3;
        const safehouseY = 3;
        
        // Make sure safehouse area is clear
        map[safehouseY][safehouseX] = { type: 'tile-wood-floor', walkable: true };
        
        objects.push({
            type: 'safehouse',
            x: safehouseX,
            y: safehouseY,
            walkable: true
        });
        
        return { map, objects, safehousePos: { x: safehouseX, y: safehouseY } };
    }
}
