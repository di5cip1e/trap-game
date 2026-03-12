/**
 * MapController.js - Handles all map/world generation and management
 * Neighborhood transitions, interior maps, building entry/exit
 */

import { EventBus, EVENTS } from './EventBus.js';

export default class MapController {
    constructor(scene, playerState) {
        this.scene = scene;
        this.playerState = playerState;
        
        // Track indoor/outdoor state
        this.isIndoor = false;
        this.outdoorState = null;
        this.currentInterior = null;
        this.interiorExit = null;
    }

    // ============================================================
    // WORLD CREATION
    // ============================================================

    /**
     * Generate and create the game world
     */
    createWorld(mapData, objects) {
        const { CONFIG, biomeType } = this.scene;
        
        this.scene.worldMap = [];
        this.scene.worldObjects = [];
        
        // Create tiles from map data
        for (let y = 0; y < CONFIG.GRID_HEIGHT; y++) {
            this.scene.worldMap[y] = [];
            for (let x = 0; x < CONFIG.GRID_WIDTH; x++) {
                const tileData = mapData[y][x];
                
                const tile = this.scene.add.image(
                    x * CONFIG.TILE_SIZE,
                    y * CONFIG.TILE_SIZE,
                    tileData.type
                );
                tile.setOrigin(0, 0);
                tile.setDisplaySize(CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                
                this.scene.worldMap[y][x] = {
                    type: tileData.type,
                    sprite: tile,
                    walkable: tileData.walkable
                };
            }
        }
        
        // Place objects
        objects.forEach(obj => {
            this.placeObject(obj);
        });
        
        // Animate POI markers
        this.animatePOIMarkers();
        
        // Emit event
        EventBus.emit(EVENTS.GAME_STATE_CHANGED, { state: 'worldCreated' });
    }

    /**
     * Place a single object on the map
     */
    placeObject(obj) {
        const { CONFIG } = this.scene;
        
        let sprite;
        
        if (obj.type === 'safehouse') {
            const tier = CONFIG.SAFEHOUSE_TIERS[this.playerState.safehouseTier];
            sprite = this.scene.add.image(
                obj.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                obj.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                tier.sprite
            );
            sprite.setScale(tier.scale);
            sprite.setDepth(50);
            
            obj.safehouseSprite = sprite;
            
            // Add interaction indicator
            const indicator = this.scene.add.text(
                obj.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                obj.y * CONFIG.TILE_SIZE - 10,
                '[E]',
                {
                    fontFamily: 'Press Start 2P',
                    fontSize: '12px',
                    color: CONFIG.COLORS.primary,
                    stroke: '#000000',
                    strokeThickness: 3
                }
            ).setOrigin(0.5).setDepth(51).setAlpha(0);
            
            obj.indicator = indicator;
            
        } else if (obj.type === 'dumpster') {
            sprite = this.scene.add.image(
                obj.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                obj.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                'dumpster'
            );
            sprite.setScale(CONFIG.SCALE.DUMPSTER);
            sprite.setDepth(50);
            
            this.scene.worldMap[obj.y][obj.x].walkable = false;
            
        } else if (obj.type === 'workstation') {
            sprite = this.scene.add.image(
                obj.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                obj.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                'workstation'
            );
            sprite.setScale(CONFIG.SCALE.WORKSTATION);
            sprite.setDepth(50);
            
            const indicator = this.scene.add.text(
                obj.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                obj.y * CONFIG.TILE_SIZE - 10,
                '[E]',
                {
                    fontFamily: 'Press Start 2P',
                    fontSize: '12px',
                    color: CONFIG.COLORS.secondary,
                    stroke: '#000000',
                    strokeThickness: 3
                }
            ).setOrigin(0.5).setDepth(51).setAlpha(0);
            
            obj.indicator = indicator;
            
        } else if (obj.type === 'vendor') {
            sprite = this.scene.add.image(
                obj.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                obj.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                'npc-vendor'
            );
            sprite.setScale(CONFIG.SCALE.NPC_VENDOR);
            sprite.setDepth(50);
            
            const indicator = this.scene.add.text(
                obj.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                obj.y * CONFIG.TILE_SIZE - 10,
                '[E] SUPPLIER',
                {
                    fontFamily: 'Press Start 2P',
                    fontSize: '10px',
                    color: CONFIG.COLORS.success,
                    stroke: '#000000',
                    strokeThickness: 3
                }
            ).setOrigin(0.5).setDepth(51).setAlpha(0);
            
            obj.indicator = indicator;
            
        } else if (obj.type === 'buyer') {
            sprite = this.scene.add.image(
                obj.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                obj.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                'npc-buyer'
            );
            sprite.setScale(CONFIG.SCALE.NPC_BUYER);
            sprite.setDepth(50);
            
            const indicator = this.scene.add.text(
                obj.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                obj.y * CONFIG.TILE_SIZE - 10,
                '[E] BUYER',
                {
                    fontFamily: 'Press Start 2P',
                    fontSize: '10px',
                    color: CONFIG.COLORS.primary,
                    stroke: '#000000',
                    strokeThickness: 3
                }
            ).setOrigin(0.5).setDepth(51).setAlpha(0);
            
            obj.indicator = indicator;
            
        } else if (obj.type === 'poi') {
            const poiColors = {
                'building': 0xFFD700,
                'passage': 0x00CED1,
                'waterfront': 0x4169E1,
                'danger': 0xFF4500,
                'service': 0x32CD32
            };
            const color = poiColors[obj.poiType] || 0xFFD700;
            
            const marker = this.scene.add.circle(
                obj.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                obj.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                CONFIG.TILE_SIZE * 0.3,
                color,
                0.3
            );
            marker.setDepth(49);
            
            const indicator = this.scene.add.text(
                obj.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                obj.y * CONFIG.TILE_SIZE - 10,
                '[E] ' + obj.poiKey.toUpperCase(),
                {
                    fontFamily: 'Press Start 2P',
                    fontSize: '8px',
                    color: '#' + color.toString(16).padStart(6, '0'),
                    stroke: '#000000',
                    strokeThickness: 3
                }
            ).setOrigin(0.5).setDepth(51).setAlpha(0);
            
            obj.indicator = indicator;
            obj.marker = marker;
        }
        
        obj.sprite = sprite;
        this.scene.worldObjects.push(obj);
    }

    /**
     * Animate POI markers for discoverability
     */
    animatePOIMarkers() {
        this.scene.worldObjects.forEach(obj => {
            if (obj.type === 'poi' && obj.marker) {
                this.scene.tweens.add({
                    targets: obj.marker,
                    alpha: { from: 0.2, to: 0.5 },
                    scale: { from: 0.8, to: 1.2 },
                    duration: 1000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        });
    }

    /**
     * Clear the existing world
     */
    clearWorld() {
        if (this.scene.layer) {
            this.scene.layer.destroy();
        }
        if (this.scene.map) {
            this.scene.map.destroy();
        }
        
        if (this.scene.objects) {
            this.scene.objects.getChildren().forEach(obj => obj.destroy());
        }
        
        if (this.scene.safehouse) {
            this.scene.safehouse.destroy();
        }
    }

    // ============================================================
    // NEIGHBORHOOD NAVIGATION
    // ============================================================

    /**
     * Generate a new map for a specific neighborhood
     */
    generateMapForNeighborhood(neighborhoodKey) {
        const { MapGenerator } = this.scene;
        const { CONFIG } = this.scene;
        
        // Prevent transitions while indoors
        if (this.isIndoor) {
            this.scene.showFloatingText('Exit building first!', CONFIG.COLORS.danger);
            return;
        }
        
        const neighborhood = neighborhoodKey || this.playerState.neighborhood;
        const hoodConfig = MapGenerator.NEIGHBORHOODS[neighborhood];
        
        if (!hoodConfig) {
            console.error(`Unknown neighborhood: ${neighborhood}`);
            return;
        }
        
        const factions = hoodConfig.factions || [];
        const primaryFaction = factions.length > 0 ? factions[0] : null;
        const isContested = this.scene.isNeighborhoodContested(neighborhood);
        
        const mapGen = new MapGenerator(this.scene, this.scene.biomeType, {
            neighborhood: neighborhood,
            faction: primaryFaction,
            includeHQ: true,
            includePOIs: true,
            isContested: isContested
        });
        
        const { map, objects, safehousePos } = mapGen.generate();
        
        // Clear existing world
        this.clearWorld();
        
        // Recreate world
        this.createWorld(map, objects);
        
        // Update safehouse position
        this.scene.safehousePos = safehousePos;
        
        // Set player start
        this.playerState.gridX = safehousePos.x + 2;
        this.playerState.gridY = safehousePos.y;
        
        if (this.scene.player) {
            this.scene.player.x = this.playerState.gridX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
            this.scene.player.y = this.playerState.gridY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        }
        
        // Update player state
        this.playerState.neighborhood = neighborhood;
        
        if (!this.playerState.visitedNeighborhoods.includes(neighborhood)) {
            this.playerState.visitedNeighborhoods.push(neighborhood);
        }
        
        this.unlockNeighborNeighborhoods(neighborhood);
        
                
        if (this.scene.hud) {
            this.scene.hud.update();
        }
        
        EventBus.emit(EVENTS.PLAYER_NEIGHBORHOOD_CHANGED, { neighborhood });
    }

    /**
     * Unlock neighboring neighborhoods
     */
    unlockNeighborNeighborhoods(neighborhood) {
        const adjacency = {
            'OLD_TOWN': ['THE_MAW', 'THE_FLATS', 'INDUSTRIAL_ZONE'],
            'SKID_ROW': ['THE_FLATS'],
            'THE_FLATS': ['OLD_TOWN', 'SKID_ROW', 'INDUSTRIAL_ZONE', 'SALVAGE_YARD'],
            'INDUSTRIAL_ZONE': ['OLD_TOWN', 'THE_FLATS', 'THE_HARBOR', 'THE_MAW'],
            'THE_MAW': ['OLD_TOWN', 'INDUSTRIAL_ZONE'],
            'SALVAGE_YARD': ['THE_FLATS', 'IRONWORKS'],
            'IRONWORKS': ['SALVAGE_YARD', 'THE_HARBOR'],
            'THE_HARBOR': ['INDUSTRIAL_ZONE', 'IRONWORKS']
        };
        
        const neighbors = adjacency[neighborhood] || [];
        
        neighbors.forEach(neighbor => {
            if (!this.playerState.unlockedNeighborhoods.includes(neighbor)) {
                this.playerState.unlockedNeighborhoods.push(neighbor);
                            }
        });
    }

    /**
     * Check if player is at the edge of the map
     */
    checkNeighborhoodBorder() {
        const { CONFIG, GRID_WIDTH, GRID_HEIGHT } = this.scene;
        const borderThreshold = 2;
        
        let atBorder = false;
        let direction = '';
        
        if (this.playerState.gridX <= borderThreshold) {
            atBorder = true;
            direction = 'west';
        } else if (this.playerState.gridX >= GRID_WIDTH - borderThreshold - 1) {
            atBorder = true;
            direction = 'east';
        } else if (this.playerState.gridY <= borderThreshold) {
            atBorder = true;
            direction = 'north';
        } else if (this.playerState.gridY >= GRID_HEIGHT - borderThreshold - 1) {
            atBorder = true;
            direction = 'south';
        }
        
        if (atBorder && !this.scene.borderPromptShown) {
            this.scene.borderPromptShown = true;
            this.offerNeighborhoodTransition(direction);
        } else if (!atBorder) {
            this.scene.borderPromptShown = false;
        }
    }

    /**
     * Offer to travel to neighboring area
     */
    offerNeighborhoodTransition(direction) {
        const { MapGenerator } = this.scene;
        const { neighborhood } = this.playerState;
        const hoodConfig = MapGenerator.NEIGHBORHOODS[neighborhood];
        
        const adjacency = {
            'OLD_TOWN': ['THE_MAW', 'THE_FLATS', 'INDUSTRIAL_ZONE'],
            'SKID_ROW': ['THE_FLATS'],
            'THE_FLATS': ['OLD_TOWN', 'SKID_ROW', 'INDUSTRIAL_ZONE', 'SALVAGE_YARD'],
            'INDUSTRIAL_ZONE': ['OLD_TOWN', 'THE_FLATS', 'THE_HARBOR', 'THE_MAW'],
            'THE_MAW': ['OLD_TOWN', 'INDUSTRIAL_ZONE'],
            'SALVAGE_YARD': ['THE_FLATS', 'IRONWORKS'],
            'IRONWORKS': ['SALVAGE_YARD', 'THE_HARBOR'],
            'THE_HARBOR': ['INDUSTRIAL_ZONE', 'IRONWORKS']
        };
        
        const neighbors = adjacency[neighborhood] || [];
        const availableNeighbors = neighbors.filter(n => 
            this.playerState.unlockedNeighborhoods.includes(n)
        );
        
        if (availableNeighbors.length === 0) return;
        
        const { width, height } = this.scene.scale;
        
        const popup = this.scene.add.rectangle(width/2, height/2, 400, 200, 0x1a1a2e);
        popup.setStrokeStyle(2, 0x666666);
        
        const text = this.scene.add.text(width/2, height/2 - 40, 
            `You're leaving ${hoodConfig.name}.\nTravel to a new area?`, {
            fontSize: '18px',
            fontFamily: 'Courier, monospace',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        const travelBtn = this.scene.add.text(width/2 - 80, height/2 + 40, '[ TRAVEL ]', {
            fontSize: '20px',
            fontFamily: 'Courier, monospace',
            color: '#00ff00'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        const stayBtn = this.scene.add.text(width/2 + 80, height/2 + 40, '[ STAY ]', {
            fontSize: '20px',
            fontFamily: 'Courier, monospace',
            color: '#ff4444'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        travelBtn.on('pointerdown', () => {
            popup.destroy();
            text.destroy();
            travelBtn.destroy();
            stayBtn.destroy();
            this.scene.openWorldMap();
        });
        
        stayBtn.on('pointerdown', () => {
            popup.destroy();
            text.destroy();
            travelBtn.destroy();
            stayBtn.destroy();
            
            const { CONFIG } = this.scene;
            
            if (direction === 'west') this.playerState.gridX = 3;
            else if (direction === 'east') this.playerState.gridX = CONFIG.GRID_WIDTH - 4;
            else if (direction === 'north') this.playerState.gridY = 3;
            else if (direction === 'south') this.playerState.gridY = CONFIG.GRID_HEIGHT - 4;
            
            if (this.scene.player) {
                this.scene.player.x = this.playerState.gridX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
                this.scene.player.y = this.playerState.gridY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
            }
        });
    }

    // ============================================================
    // INTERIOR/BUILDING SYSTEM
    // ============================================================

    INTERIOR_MAPS = {
        'Abandoned Hotel': {
            name: 'Abandoned Hotel',
            tiles: 'tile-dirty-floor',
            walls: 'tile-wall-brick',
            objects: ['bed', 'desk', 'trash'],
            size: { width: 8, height: 8 }
        },
        'Burned-out Store': {
            name: 'Burned-out Store',
            tiles: 'tile-concrete-cracked',
            walls: 'tile-wall-brick',
            objects: ['rubble', 'ash', 'debris'],
            size: { width: 6, height: 6 }
        },
        'Old Pharmacy': {
            name: 'Old Pharmacy',
            tiles: 'tile-wood-floor',
            walls: 'tile-wall-interior',
            objects: ['shelf', 'counter', 'trash'],
            size: { width: 6, height: 6 }
        },
        'Defunct Factory': {
            name: 'Defunct Factory',
            tiles: 'tile-concrete-cracked',
            walls: 'tile-wall-brick',
            objects: ['machine', 'crate', 'barrel'],
            size: { width: 10, height: 8 }
        },
        'Abandoned Warehouse': {
            name: 'Abandoned Warehouse',
            tiles: 'tile-concrete-cracked',
            walls: 'tile-wall-brick',
            objects: ['crate', 'pallet', 'forklift'],
            size: { width: 12, height: 10 }
        },
        'Old Laundromat': {
            name: 'Old Laundromat',
            tiles: 'tile-wood-floor',
            walls: 'tile-wall-interior',
            objects: ['washer', 'dryer', 'folding-table'],
            size: { width: 6, height: 5 }
        },
        'Auto Shop': {
            name: 'Auto Shop',
            tiles: 'tile-concrete-cracked',
            walls: 'tile-wall-brick',
            objects: ['car-lift', 'toolbox', 'tire'],
            size: { width: 8, height: 7 }
        },
        'Secret Door': {
            name: 'Shade\'s Tunnels',
            tiles: 'tile-dirty-floor',
            walls: 'tile-wall-brick',
            objects: ['torch', 'rubble', 'web'],
            size: { width: 8, height: 10 }
        },
        'Sewer Entrance': {
            name: 'The Maw',
            tiles: 'tile-dirty-floor',
            walls: 'tile-wall-brick',
            objects: ['grate', 'water', 'rubble'],
            size: { width: 8, height: 12 }
        },
        'Rooftop Access': {
            name: 'Rooftop',
            tiles: 'tile-concrete-cracked',
            walls: 'tile-wall-brick',
            objects: ['antenna', 'ac-unit', 'water-tank'],
            size: { width: 8, height: 6 }
        },
        '24/7 Diner': {
            name: '24/7 Diner',
            tiles: 'tile-wood-floor',
            walls: 'tile-wall-interior',
            objects: ['table', 'counter', 'jukebox'],
            size: { width: 8, height: 6 }
        },
        'Pawn Shop': {
            name: 'Pawn Shop',
            tiles: 'tile-wood-floor',
            walls: 'tile-wall-brick',
            objects: ['display-case', 'counter', 'safe'],
            size: { width: 6, height: 6 }
        },
        'Hidden Alley': {
            name: 'Hidden Alley',
            tiles: 'tile-alley',
            walls: 'tile-wall-brick',
            objects: ['dumpster', 'boxes', 'trash'],
            size: { width: 4, height: 8 }
        },
        'default': {
            name: 'Interior',
            tiles: 'tile-dirty-floor',
            walls: 'tile-wall-brick',
            objects: ['crate', 'trash'],
            size: { width: 6, height: 6 }
        }
    };

    /**
     * Enter a building through a POI
     */
    enterBuilding(poiObj) {
        const template = this.INTERIOR_MAPS[poiObj.poiKey] || this.INTERIOR_MAPS['default'];
        
        this.outdoorState = {
            map: this.scene.worldMap,
            objects: this.scene.worldObjects,
            gridX: this.playerState.gridX,
            gridY: this.playerState.gridY,
            biomeType: this.scene.biomeType,
            neighborhood: this.playerState.neighborhood
        };
        
        this.transitionToInterior(template, poiObj);
    }

    /**
     * Transition animation from outdoor to indoor
     */
    transitionToInterior(template, poiObj) {
        const { width, height } = this.scene.scale;
        
        const overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000);
        overlay.setScrollFactor(0).setDepth(2000);
        
        this.scene.tweens.add({
            targets: overlay,
            alpha: 1,
            duration: 500,
            onComplete: () => {
                this.scene.cameras.main.setAlpha(0);
                this.createInterior(template, poiObj);
                
                this.scene.time.delayedCall(300, () => {
                    this.scene.tweens.add({
                        targets: overlay,
                        alpha: 0,
                        duration: 500,
                        onComplete: () => {
                            overlay.destroy();
                            this.scene.cameras.main.setAlpha(1);
                        }
                    });
                });
            }
        });
        
        this.scene.time.delayedCall(600, () => {
            this.scene.showFloatingText(`Entering: ${template.name}`, this.scene.CONFIG.COLORS.primary);
        });
        
        this.isIndoor = true;
    }

    /**
     * Create interior map
     */
    createInterior(template, poiObj) {
        const { CONFIG } = this.scene;
        
        this.scene.worldMap = [];
        this.scene.worldObjects = [];
        
        const interiorWidth = template.size.width;
        const interiorHeight = template.size.height;
        
        // Create tiles
        for (let y = 0; y < interiorHeight; y++) {
            this.scene.worldMap[y] = [];
            for (let x = 0; x < interiorWidth; x++) {
                const isWall = x === 0 || x === interiorWidth - 1 || y === 0 || y === interiorHeight - 1;
                const tileType = isWall ? template.walls : template.tiles;
                
                const tile = this.scene.add.image(
                    x * CONFIG.TILE_SIZE,
                    y * CONFIG.TILE_SIZE,
                    tileType
                );
                tile.setOrigin(0, 0);
                tile.setDisplaySize(CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                
                this.scene.worldMap[y][x] = {
                    type: tileType,
                    sprite: tile,
                    walkable: !isWall
                };
            }
        }
        
        this.addInteriorObjects(template, interiorWidth, interiorHeight);
        
        // Exit point
        const exitX = Math.floor(interiorWidth / 2);
        const exitY = interiorHeight - 2;
        this.scene.worldMap[exitY][exitX].walkable = true;
        
        const exitIndicator = this.scene.add.text(
            exitX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
            exitY * CONFIG.TILE_SIZE - 10,
            '[E] EXIT',
            {
                fontFamily: 'Press Start 2P',
                fontSize: '10px',
                color: CONFIG.COLORS.success,
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5).setDepth(51);
        
        this.interiorExit = {
            x: exitX,
            y: exitY,
            indicator: exitIndicator,
            poiObj: poiObj
        };
        
        this.playerState.gridX = Math.floor(interiorWidth / 2);
        this.playerState.gridY = interiorHeight - 3;
        
        this.scene.player.x = this.playerState.gridX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        this.scene.player.y = this.playerState.gridY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        
        this.currentInterior = template;
        
        if (this.scene.minimap) {
            this.scene.minimap.setVisible(false);
        }
        
        const { width, height } = this.scene.scale;
        
        this.scene.interactionHintText = this.scene.add.text(
            width / 2, height - 50,
            '[E] Exit Building',
            {
                fontFamily: 'Press Start 2P',
                fontSize: '14px',
                color: CONFIG.COLORS.success
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(100);
    }

    /**
     * Add random objects to interior
     */
    addInteriorObjects(template, width, height) {
        const numObjects = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < numObjects; i++) {
            const x = Math.floor(Math.random() * (width - 2)) + 1;
            const y = Math.floor(Math.random() * (height - 2)) + 1;
            
            if (!this.scene.worldMap[y][x].walkable) continue;
            if (Math.abs(x - width/2) < 2 && y > height - 3) continue;
            
            this.scene.worldMap[y][x].walkable = false;
            
            const objSprite = this.scene.add.rectangle(
                x * this.scene.CONFIG.TILE_SIZE + this.scene.CONFIG.TILE_SIZE / 2,
                y * this.scene.CONFIG.TILE_SIZE + this.scene.CONFIG.TILE_SIZE / 2,
                this.scene.CONFIG.TILE_SIZE * 0.6,
                this.scene.CONFIG.TILE_SIZE * 0.6,
                0x8B4513
            );
            objSprite.setDepth(50);
        }
    }

    /**
     * Check if near interior exit
     */
    checkInteriorExit() {
        if (!this.isIndoor || !this.interiorExit) return false;
        
        const dist = Phaser.Math.Distance.Between(
            this.playerState.gridX, this.playerState.gridY,
            this.interiorExit.x, this.interiorExit.y
        );
        
        return dist <= 1;
    }

    /**
     * Exit building and return to outdoor
     */
    exitBuilding() {
        if (!this.isIndoor || !this.outdoorState) return;
        
        const { width, height } = this.scene.scale;
        
        const overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000);
        overlay.setScrollFactor(0).setDepth(2000);
        
        this.scene.tweens.add({
            targets: overlay,
            alpha: 1,
            duration: 500,
            onComplete: () => {
                this.cleanupInterior();
                
                this.scene.worldMap = this.outdoorState.map;
                this.scene.worldObjects = this.outdoorState.objects;
                this.playerState.gridX = this.outdoorState.gridX;
                this.playerState.gridY = this.outdoorState.gridY;
                this.scene.biomeType = this.outdoorState.biomeType;
                this.playerState.neighborhood = this.outdoorState.neighborhood;
                
                this.scene.player.x = this.playerState.gridX * this.scene.CONFIG.TILE_SIZE + this.scene.CONFIG.TILE_SIZE / 2;
                this.scene.player.y = this.playerState.gridY * this.scene.CONFIG.TILE_SIZE + this.scene.CONFIG.TILE_SIZE / 2;
                
                this.scene.cameras.main.setAlpha(1);
                
                this.scene.tweens.add({
                    targets: overlay,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => overlay.destroy()
                });
                
                this.scene.showFloatingText('Exited to streets', this.scene.CONFIG.COLORS.success);
                
                if (this.scene.minimap) {
                    this.scene.minimap.setVisible(true);
                }
                
                this.isIndoor = false;
                this.outdoorState = null;
                this.currentInterior = null;
                this.interiorExit = null;
            }
        });
    }

    /**
     * Clean up interior resources
     */
    cleanupInterior() {
        for (let y = 0; y < this.scene.worldMap.length; y++) {
            for (let x = 0; x < this.scene.worldMap[y].length; x++) {
                if (this.scene.worldMap[y][x].sprite) {
                    this.scene.worldMap[y][x].sprite.destroy();
                }
            }
        }
        
        if (this.interiorExit && this.interiorExit.indicator) {
            this.interiorExit.indicator.destroy();
        }
        
        if (this.scene.interactionHintText) {
            this.scene.interactionHintText.destroy();
        }
    }

    // ============================================================
    // INTERACTION HELPERS
    // ============================================================

    /**
     * Check for nearby interactive objects
     */
    checkInteractionProximity() {
        this.scene.worldObjects.forEach(obj => {
            if (!obj.indicator) return;
            
            const dist = Phaser.Math.Distance.Between(
                this.playerState.gridX, this.playerState.gridY,
                obj.x, obj.y
            );
            
            obj.indicator.setAlpha(dist <= 1.5 ? 1 : 0);
        });
    }

    /**
     * Get nearby interactive object
     */
    getNearbyInteractive() {
        for (const obj of this.scene.worldObjects) {
            const dist = Phaser.Math.Distance.Between(
                this.playerState.gridX, this.playerState.gridY,
                obj.x, obj.y
            );
            
            if (dist <= 1.5) {
                return obj;
            }
        }
        return null;
    }
}
