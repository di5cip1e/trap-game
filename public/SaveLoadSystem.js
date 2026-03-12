/**
 * SaveLoadSystem.js - LocalStorage persistence for Trap game
 * Handles saving and loading game state
 * 
 * VERSION HISTORY:
 * - Version 2 (current): Added achievements system
 *   Includes: player stats, resources, equipment, heat, hustle, calendar, 
 *   runner, NPC relationships, supplier relations, quest system, 
 *   level/XP/abilities, neighborhood navigation, achievements
 * - Version 1: Initial version with level/XP, neighborhoods, skills
 */

const SAVE_KEY = 'trap_game_save';
const SAVE_SLOT_PREFIX = 'trap_save_slot_';
const MAX_SAVE_SLOTS = 3;
const CURRENT_VERSION = 3; // Version 3: Added drugs and precursors inventory system

/**
 * Error codes for localStorage operations
 */
const STORAGE_ERRORS = {
    QUOTA_EXCEEDED: 'QuotaExceededError',
    NOT_AVAILABLE: 'SecurityError',
    UNKNOWN: 'Unknown'
};

/**
 * Detect the type of localStorage error
 * @param {Error} error - The error object
 * @returns {string} - The error type
 */
function detectStorageErrorType(error) {
    if (!error) return STORAGE_ERRORS.UNKNOWN;
    const name = error.name || '';
    const message = error.message || '';
    
    if (name.includes('QuotaExceeded') || message.includes('quota')) {
        return STORAGE_ERRORS.QUOTA_EXCEEDED;
    }
    if (name.includes('Security') || message.includes('access') || message.includes('private')) {
        return STORAGE_ERRORS.NOT_AVAILABLE;
    }
    return STORAGE_ERRORS.UNKNOWN;
}

/**
 * Safely get an item from localStorage with error handling
 * @param {string} key - The storage key
 * @returns {Object|null} - { success: boolean, data: any, error: string }
 */
function safeGetItem(key) {
    try {
        const data = localStorage.getItem(key);
        return { success: true, data: data, error: null };
    } catch (error) {
        const errorType = detectStorageErrorType(error);
        console.warn(`SaveLoadSystem: localStorage.getItem failed for "${key}":`, errorType, error.message);
        return { success: false, data: null, error: errorType };
    }
}

/**
 * Safely set an item in localStorage with error handling
 * @param {string} key - The storage key
 * @param {string} value - The value to store
 * @returns {Object} - { success: boolean, error: string }
 */
function safeSetItem(key, value) {
    try {
        localStorage.setItem(key, value);
        return { success: true, error: null };
    } catch (error) {
        const errorType = detectStorageErrorType(error);
        
        if (errorType === STORAGE_ERRORS.QUOTA_EXCEEDED) {
            console.error('SaveLoadSystem: Storage quota exceeded. Consider deleting old saves.');
        } else if (errorType === STORAGE_ERRORS.NOT_AVAILABLE) {
            console.warn('SaveLoadSystem: localStorage not available (private browsing mode?).');
        } else {
            console.error('SaveLoadSystem: localStorage.setItem failed:', error.message);
        }
        
        return { success: false, error: errorType };
    }
}

/**
 * Safely remove an item from localStorage with error handling
 * @param {string} key - The storage key
 * @returns {Object} - { success: boolean, error: string }
 */
function safeRemoveItem(key) {
    try {
        localStorage.removeItem(key);
        return { success: true, error: null };
    } catch (error) {
        const errorType = detectStorageErrorType(error);
        console.warn(`SaveLoadSystem: localStorage.removeItem failed for "${key}":`, errorType);
        return { success: false, error: errorType };
    }
}

export default class SaveLoadSystem {
    /**
     * Static: Convert neighborhood display name to key (e.g., "Old Town" -> "OLD_TOWN")
     */
    static convertNeighborhoodToKey(neighborhood) {
        if (!neighborhood) return 'OLD_TOWN';
        
        // If it's already a key (all caps with underscores), return it
        if (neighborhood === neighborhood.toUpperCase() && neighborhood.includes('_')) {
            return neighborhood;
        }
        
        // Convert display name to key
        const keyMap = {
            'Old Town': 'OLD_TOWN',
            'Skid Row': 'SKID_ROW',
            'The Flats': 'THE_FLATS',
            'Ironworks': 'IRONWORKS',
            'The Harbor': 'THE_HARBOR',
            'The Maw': 'THE_MAW',
            'Industrial Zone': 'INDUSTRIAL_ZONE',
            'Salvage Yard': 'SALVAGE_YARD'
        };
        
        return keyMap[neighborhood] || 'OLD_TOWN';
    }
    
    /**
     * Get default values for fields that may not exist in older saves (forward-compatibility)
     * @returns {Object} - Default values for new fields
     */
    static getDefaultSaveFields() {
        return {
            // Level & XP System defaults
            level: 1,
            xp: 0,
            xpToNextLevel: 100,
            abilityPoints: 0,
            statPoints: 0,
            classType: null,
            unlockedSkills: [],
            skillCooldowns: {},
            
            // Neighborhood Navigation defaults
            unlockedNeighborhoods: ['OLD_TOWN'],
            visitedNeighborhoods: ['OLD_TOWN'],
            
            // Runner defaults
            hasRunner: false,
            runnerProduct: 0,
            
            // Supplier defaults
            supplierRelations: {},
            
            // Daily flags defaults
            corruptCopUsedToday: false,
            
            // Quest defaults
            questSystem: null,
            
            // Safehouse default
            safehouseTier: 1,
            
            // NEW GAME+ defaults
            newGamePlusCount: 0,
            ngpMoneyCarriedOver: 0,
            ngpUnlockedItems: []
        };
    }
    
    /**
     * Migrate save data from version 0 to version 1
     * Version 0: Pre-versioning saves (no saveVersion field)
     * Version 1: Added version field, level/XP, neighborhoods, skills systems
     * @param {Object} saveData - The save data to migrate
     * @returns {Object} - Migrated save data
     */
    static migrateFromV0toV1(saveData) {
                
        const defaults = SaveLoadSystem.getDefaultSaveFields();
        
        // Add version field
        saveData.saveVersion = 1;
        
        // Level & XP - initialize if not present
        if (saveData.level === undefined) {
            // Calculate level from existing stats if possible
            const totalStats = saveData.stats 
                ? Object.values(saveData.stats).reduce((a, b) => a + b, 0) 
                : 20;
            saveData.level = Math.floor(totalStats / 10) || 1;
            saveData.xp = 0;
            saveData.xpToNextLevel = 100;
        }
        
        // Ability points
        if (saveData.abilityPoints === undefined) {
            saveData.abilityPoints = 0;
        }
        
        // Stat points
        if (saveData.statPoints === undefined) {
            saveData.statPoints = 0;
        }
        
        // Class type
        if (saveData.classType === undefined) {
            saveData.classType = null;
        }
        
        // Unlocked skills
        if (!saveData.unlockedSkills) {
            saveData.unlockedSkills = [];
        }
        
        // Skill cooldowns
        if (!saveData.skillCooldowns) {
            saveData.skillCooldowns = {};
        }
        
        // Neighborhoods - convert old neighborhood to unlocked/visited
        if (!saveData.unlockedNeighborhoods) {
            const neighborhood = saveData.neighborhood || saveData.race || 'OLD_TOWN';
            const key = SaveLoadSystem.convertNeighborhoodToKey(neighborhood);
            saveData.unlockedNeighborhoods = [key];
        }
        
        if (!saveData.visitedNeighborhoods) {
            const neighborhood = saveData.neighborhood || saveData.race || 'OLD_TOWN';
            const key = SaveLoadSystem.convertNeighborhoodToKey(neighborhood);
            saveData.visitedNeighborhoods = [key];
        }
        
        // Supplier relations
        if (!saveData.supplierRelations) {
            saveData.supplierRelations = {};
        }
        
        // Safehouse tier
        if (saveData.safehouseTier === undefined) {
            saveData.safehouseTier = 1;
        }
        
                return saveData;
    }
    
    /**
     * Migrate save data from version 1 to version 2
     * Version 2: Added New Game+ support
     * @param {Object} saveData - The save data to migrate
     * @returns {Object} - Migrated save data
     */
    static migrateFromV1toV2(saveData) {
                
        // Add New Game+ fields
        if (saveData.newGamePlusCount === undefined) {
            saveData.newGamePlusCount = 0;
        }
        if (!saveData.ngpMoneyCarriedOver) {
            saveData.ngpMoneyCarriedOver = 0;
        }
        if (!saveData.ngpUnlockedItems) {
            saveData.ngpUnlockedItems = [];
        }
        
                return saveData;
    }
    
    /**
     * Migrate save data from version 2 to version 3
     * Version 3: Added drugs and precursors inventory system
     * @param {Object} saveData - The save data to migrate
     * @returns {Object} - Migrated save data
     */
    static migrateFromV2toV3(saveData) {
                
        // Convert legacy product field to drugs object
        // Old saves used: product (total product), cocaine, crack
        // New system uses: drugs { cocaine, crack, heroin, methamphetamine, ecstasy, marijuana }
        if (!saveData.drugs) {
            saveData.drugs = {
                cocaine: saveData.cocaine || 0,
                crack: saveData.crack || 0,
                heroin: 0,
                methamphetamine: 0,
                ecstasy: 0,
                marijuana: 0
            };
        }
        
        // Add precursors if not present
        if (!saveData.precursors) {
            saveData.precursors = {
                pseudoephedrine: 0,
                ammonia: 0,
                lithium: 0,
                toluene: 0,
                aceticAnhydride: 0,
                ether: 0
            };
        }
        
                return saveData;
    }
    
    /**
     * Migrate save data to the latest version
     * @param {Object} saveData - The save data to migrate
     * @returns {Object} - Migrated save data
     */
    static migrateToLatest(saveData) {
        if (!saveData) return saveData;
        
        // Determine current save version (default to 0 for old saves without version)
        const version = saveData.saveVersion || 0;
        
        if (version >= CURRENT_VERSION) {
                        return saveData;
        }
        
                
        // Run migrations sequentially
        if (version < 1) {
            saveData = SaveLoadSystem.migrateFromV0toV1(saveData);
        }
        
        if (version < 2) {
            saveData = SaveLoadSystem.migrateFromV1toV2(saveData);
        }

        if (version < 3) {
            saveData = SaveLoadSystem.migrateFromV2toV3(saveData);
        }

                return saveData;
    }
    
    /**
     * Save the current game state to localStorage
     * @param {Object} gameScene - The GameScene instance
     * @returns {boolean} - Whether save was successful
     */
    static saveGame(gameScene) {
        if (!gameScene || !gameScene.playerState) {
            console.error('SaveLoadSystem: Invalid gameScene or playerState');
            return false;
        }

        try {
            const saveData = {
                // Version
                saveVersion: CURRENT_VERSION,
                
                // Player basic info
                name: gameScene.playerState.name,
                gender: gameScene.playerState.gender,
                neighborhood: gameScene.characterData?.neighborhood || gameScene.playerState.neighborhood,
                neighborhoodBonus: gameScene.characterData?.neighborhoodBonus || gameScene.playerState.neighborhoodBonus,
                
                // Stats
                stats: { ...gameScene.playerState.stats },
                
                // Resources
                money: gameScene.playerState.money,
                rawMaterials: gameScene.playerState.rawMaterials,
                product: gameScene.playerState.product,
                
                // NEW: Drugs inventory
                drugs: { ...gameScene.playerState.drugs },
                
                // NEW: Precursors inventory
                precursors: { ...gameScene.playerState.precursors },
                
                // Equipment/Inventory
                equipment: { ...gameScene.playerState.equipment },
                
                // Safehouse
                safehouseTier: gameScene.playerState.safehouseTier,
                
                // Heat & Hustle
                heat: gameScene.playerState.heat,
                hustle: gameScene.playerState.hustle,
                
                // NEW: Neighborhood demand history
                neighborhoodHistory: gameScene.playerState.neighborhoodHistory || {},
                
                // Time/Calendar
                currentDay: gameScene.currentDay,
                week: gameScene.calendarSystem?.week || 1,
                calendarEvents: gameScene.calendarSystem?.events || [],
                
                // Runner
                hasRunner: gameScene.playerState.hasRunner,
                runnerProduct: gameScene.playerState.runnerProduct,
                
                // Position
                gridX: gameScene.playerState.gridX,
                gridY: gameScene.playerState.gridY,
                
                // NPC Relationships
                npcRelationships: { ...gameScene.playerState.npcRelationships },
                
                // Supplier Relations
                supplierRelations: gameScene.supplierSystem?.getRelations() || {},
                
                // Daily flags
                corruptCopUsedToday: gameScene.playerState.corruptCopUsedToday,
                
                // Quest System
                questSystem: gameScene.questSystem?.getSaveData() || null,
                
                // NEW: Level & XP System
                level: gameScene.playerState.level,
                xp: gameScene.playerState.xp,
                xpToNextLevel: gameScene.playerState.xpToNextLevel,
                abilityPoints: gameScene.playerState.abilityPoints,
                statPoints: gameScene.playerState.statPoints,
                classType: gameScene.playerState.classType,
                unlockedSkills: gameScene.playerState.unlockedSkills || [],
                skillCooldowns: gameScene.playerState.skillCooldowns || {},
                
                // NEW: Neighborhood Navigation System
                unlockedNeighborhoods: gameScene.playerState.unlockedNeighborhoods || ['OLD_TOWN'],
                visitedNeighborhoods: gameScene.playerState.visitedNeighborhoods || ['OLD_TOWN'],
                
                // NEW: Achievements System
                achievements: gameScene.achievements?.getSaveData() || null,
                
                // NEW GAME+ tracking
                newGamePlusCount: gameScene.playerState.newGamePlusCount || 0,
                ngpMoneyCarriedOver: gameScene.playerState.ngpMoneyCarriedOver || 0,
                ngpUnlockedItems: gameScene.playerState.ngpUnlockedItems || [],
                
                // Timestamps
                savedAt: new Date().toISOString()
            };

            const result = safeSetItem(SAVE_KEY, JSON.stringify(saveData));
            if (!result.success) {
                console.error('SaveLoadSystem: Failed to save game - storage error:', result.error);
                return false;
            }
                        return true;
        } catch (error) {
            console.error('SaveLoadSystem: Failed to save game:', error);
            return false;
        }
    }

    /**
     * Load game state from localStorage
     * @returns {Object|null} - The saved game data or null if no save exists
     */
    static loadGame() {
        try {
            const result = safeGetItem(SAVE_KEY);
            if (!result.success) {
                console.warn('SaveLoadSystem: Failed to load game - storage error:', result.error);
                return null;
            }
            
            const savedData = result.data;
            if (!savedData) {
                return null;
            }
            
            const parsedData = JSON.parse(savedData);
            
            // Migrate to latest version if needed
            const migratedData = SaveLoadSystem.migrateToLatest(parsedData);
            
            return migratedData;
        } catch (error) {
            console.error('SaveLoadSystem: Failed to load game:', error);
            return null;
        }
    }

    // ========== MULTI-SLOT SAVE SYSTEM ==========

    /**
     * Get the save key for a specific slot
     * @param {number} slot - Slot number (0, 1, 2)
     * @returns {string} - The localStorage key for that slot
     */
    static getSlotKey(slot) {
        return `${SAVE_SLOT_PREFIX}${slot}`;
    }

    /**
     * Get all available save slots with their metadata
     * @returns {Array} - Array of slot info objects
     */
    static getAllSlots() {
        const slots = [];
        for (let i = 0; i < MAX_SAVE_SLOTS; i++) {
            const key = SaveLoadSystem.getSlotKey(i);
            const result = safeGetItem(key);
            
            if (!result.success) {
                // Handle localStorage failures (private browsing, quota exceeded, etc.)
                console.warn('SaveLoadSystem: Failed to read slot', i, '- error:', result.error);
                slots.push({
                    slot: i,
                    exists: false,
                    name: `Empty Slot ${i + 1}`,
                    savedAt: null,
                    level: null,
                    day: null,
                    money: null,
                    error: result.error
                });
                continue;
            }
            
            const data = result.data;
            if (data) {
                try {
                    const parsed = JSON.parse(data);
                    slots.push({
                        slot: i,
                        exists: true,
                        name: parsed.saveName || `Save ${i + 1}`,
                        savedAt: parsed.savedAt,
                        level: parsed.level || 1,
                        day: parsed.currentDay || 1,
                        money: parsed.money || 0
                    });
                } catch (parseError) {
                    console.warn('SaveLoadSystem: Failed to parse slot', i, parseError);
                    slots.push({
                        slot: i,
                        exists: false,
                        name: `Empty Slot ${i + 1}`,
                        savedAt: null,
                        level: null,
                        day: null,
                        money: null,
                        error: 'ParseError'
                    });
                }
            } else {
                slots.push({
                    slot: i,
                    exists: false,
                    name: `Empty Slot ${i + 1}`,
                    savedAt: null,
                    level: null,
                    day: null,
                    money: null
                });
            }
        }
        return slots;
    }

    /**
     * Save game to a specific slot
     * @param {Object} gameScene - The GameScene instance
     * @param {number} slot - Slot number (0, 1, 2)
     * @param {string} saveName - Optional custom name for the save
     * @returns {boolean} - Whether save was successful
     */
    static saveToSlot(gameScene, slot, saveName = null) {
        if (slot < 0 || slot >= MAX_SAVE_SLOTS) {
            console.error('SaveLoadSystem: Invalid slot number', slot);
            return false;
        }
        
        if (!gameScene || !gameScene.playerState) {
            console.error('SaveLoadSystem: Invalid gameScene or playerState');
            return false;
        }

        try {
            // Generate save name if not provided
            const name = saveName || `Day ${gameScene.currentDay} - ${new Date().toLocaleTimeString()}`;
            
            const saveData = {
                // Version
                saveVersion: CURRENT_VERSION,
                
                // Save metadata
                saveName: name,
                
                // Player basic info
                name: gameScene.playerState.name,
                gender: gameScene.playerState.gender,
                neighborhood: gameScene.characterData?.neighborhood || gameScene.playerState.neighborhood,
                neighborhoodBonus: gameScene.characterData?.neighborhoodBonus || gameScene.playerState.neighborhoodBonus,
                
                // Stats
                stats: { ...gameScene.playerState.stats },
                
                // Resources
                money: gameScene.playerState.money,
                rawMaterials: gameScene.playerState.rawMaterials,
                product: gameScene.playerState.product,
                
                // NEW: Drugs inventory
                drugs: { ...gameScene.playerState.drugs },
                
                // NEW: Precursors inventory
                precursors: { ...gameScene.playerState.precursors },
                
                // Equipment/Inventory
                equipment: { ...gameScene.playerState.equipment },
                
                // Safehouse
                safehouseTier: gameScene.playerState.safehouseTier,
                
                // Heat & Hustle
                heat: gameScene.playerState.heat,
                hustle: gameScene.playerState.hustle,
                
                // NEW: Neighborhood demand history
                neighborhoodHistory: gameScene.playerState.neighborhoodHistory || {},
                
                // Time/Calendar
                currentDay: gameScene.currentDay,
                week: gameScene.calendarSystem?.week || 1,
                calendarEvents: gameScene.calendarSystem?.events || [],
                
                // Runner
                hasRunner: gameScene.playerState.hasRunner,
                runnerProduct: gameScene.playerState.runnerProduct,
                
                // Position
                gridX: gameScene.playerState.gridX,
                gridY: gameScene.playerState.gridY,
                
                // NPC Relationships
                npcRelationships: { ...gameScene.playerState.npcRelationships },
                
                // Supplier Relations
                supplierRelations: gameScene.supplierSystem?.getRelations() || {},
                
                // Daily flags
                corruptCopUsedToday: gameScene.playerState.corruptCopUsedToday,
                
                // Quest System
                questSystem: gameScene.questSystem?.getSaveData() || null,
                
                // Level & XP System
                level: gameScene.playerState.level,
                xp: gameScene.playerState.xp,
                xpToNextLevel: gameScene.playerState.xpToNextLevel,
                abilityPoints: gameScene.playerState.abilityPoints,
                statPoints: gameScene.playerState.statPoints,
                classType: gameScene.playerState.classType,
                unlockedSkills: gameScene.playerState.unlockedSkills || [],
                skillCooldowns: gameScene.playerState.skillCooldowns || {},
                
                // Neighborhood Navigation System
                unlockedNeighborhoods: gameScene.playerState.unlockedNeighborhoods || ['OLD_TOWN'],
                visitedNeighborhoods: gameScene.playerState.visitedNeighborhoods || ['OLD_TOWN'],
                
                // Achievements
                achievements: gameScene.achievements?.getSaveData() || null,
                
                // Timestamps
                savedAt: new Date().toISOString()
            };

            const slotKey = SaveLoadSystem.getSlotKey(slot);
            const saveJson = JSON.stringify(saveData);
            const result = safeSetItem(slotKey, saveJson);
            
            if (!result.success) {
                console.error('SaveLoadSystem: Failed to save to slot:', result.error);
                return false;
            }
            
            // Also update the legacy single save for compatibility
            const legacyResult = safeSetItem(SAVE_KEY, saveJson);
            if (!legacyResult.success) {
                console.warn('SaveLoadSystem: Failed to update legacy save:', legacyResult.error);
                // Non-fatal - the slot save succeeded
            }
            
                        return true;
        } catch (error) {
            console.error('SaveLoadSystem: Failed to save to slot:', error);
            return false;
        }
    }

    /**
     * Load game from a specific slot
     * @param {number} slot - Slot number (0, 1, 2)
     * @returns {Object|null} - The saved game data or null if no save exists
     */
    static loadFromSlot(slot) {
        if (slot < 0 || slot >= MAX_SAVE_SLOTS) {
            console.error('SaveLoadSystem: Invalid slot number', slot);
            return null;
        }
        
        try {
            const slotKey = SaveLoadSystem.getSlotKey(slot);
            const result = safeGetItem(slotKey);
            
            if (!result.success) {
                console.warn('SaveLoadSystem: Failed to load from slot', slot, '- error:', result.error);
                return null;
            }
            
            const savedData = result.data;
            if (!savedData) {
                return null;
            }
            
            const parsedData = JSON.parse(savedData);
            
            // Migrate to latest version if needed
            const migratedData = SaveLoadSystem.migrateToLatest(parsedData);
            
            return migratedData;
        } catch (error) {
            console.error('SaveLoadSystem: Failed to load from slot:', error);
            return null;
        }
    }

    /**
     * Check if a save exists in a specific slot
     * @param {number} slot - Slot number (0, 1, 2)
     * @returns {boolean} - Whether a save exists in that slot
     */
    static hasSaveInSlot(slot) {
        if (slot < 0 || slot >= MAX_SAVE_SLOTS) return false;
        const result = safeGetItem(SaveLoadSystem.getSlotKey(slot));
        if (!result.success) {
            console.warn('SaveLoadSystem: Failed to check save slot:', result.error);
            return false;
        }
        return result.data !== null;
    }

    /**
     * Delete a save from a specific slot
     * @param {number} slot - Slot number (0, 1, 2)
     * @returns {boolean} - Whether deletion was successful
     */
    static deleteSlot(slot) {
        if (slot < 0 || slot >= MAX_SAVE_SLOTS) {
            console.error('SaveLoadSystem: Invalid slot number', slot);
            return false;
        }
        const result = safeRemoveItem(SaveLoadSystem.getSlotKey(slot));
        if (!result.success) {
            console.error('SaveLoadSystem: Failed to delete slot:', result.error);
            return false;
        }
                return true;
    }

    // ========== END MULTI-SLOT SAVE SYSTEM ==========

    /**
     * Check if a saved game exists (checks any slot or legacy save)
     * @returns {boolean} - Whether a save exists
     */
    static hasSavedGame() {
        try {
            // Check new multi-slot saves first
            const slots = SaveLoadSystem.getAllSlots();
            if (slots.some(s => s.exists)) {
                return true;
            }
            // Fallback to legacy single save
            const result = safeGetItem(SAVE_KEY);
            return result.success && result.data !== null;
        } catch (error) {
            console.error('SaveLoadSystem: Failed to check save:', error);
            return false;
        }
    }

    /**
     * Load game from any available slot or legacy save
     * @returns {Object|null} - The most recent save data or null
     */
    static loadGameFromAnySource() {
        try {
            // Check new multi-slot saves first - load most recent
            const slots = SaveLoadSystem.getAllSlots();
            const existingSlots = slots.filter(s => s.exists);
            
            if (existingSlots.length > 0) {
                // Sort by date and get most recent
                existingSlots.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
                return SaveLoadSystem.loadFromSlot(existingSlots[0].slot);
            }
            
            // Fallback to legacy single save
            const result = safeGetItem(SAVE_KEY);
            if (!result.success || !result.data) {
                return null;
            }
            
            const parsedData = JSON.parse(result.data);
            return SaveLoadSystem.migrateToLatest(parsedData);
        } catch (error) {
            console.error('SaveLoadSystem: Failed to load game:', error);
            return null;
        }
    }

    /**
     * Delete all saved games (slots and legacy)
     * @returns {boolean} - Whether deletion was successful
     */
    static deleteSave() {
        let allSuccess = true;
        
        // Delete all slots
        for (let i = 0; i < MAX_SAVE_SLOTS; i++) {
            const result = safeRemoveItem(SaveLoadSystem.getSlotKey(i));
            if (!result.success) {
                console.warn('SaveLoadSystem: Failed to delete slot', i, ':', result.error);
                allSuccess = false;
            }
        }
        
        // Delete legacy save
        const legacyResult = safeRemoveItem(SAVE_KEY);
        if (!legacyResult.success) {
            console.warn('SaveLoadSystem: Failed to delete legacy save:', legacyResult.error);
            allSuccess = false;
        }
        
        return allSuccess;
    }

    /**
     * Apply loaded save data to the game scene
     * @param {Object} gameScene - The GameScene instance
     * @param {Object} saveData - The loaded save data
     */
    static applySaveData(gameScene, saveData) {
        // Input validation - check required properties
        if (!gameScene || !saveData) {
            console.error('SaveLoadSystem: Invalid gameScene or saveData');
            return false;
        }
        
        // Ensure saveData is an object (not a string, number, etc.)
        if (typeof saveData !== 'object' || saveData === null) {
            console.error('SaveLoadSystem: saveData is not a valid object');
            return false;
        }
        
        // Validate required properties exist and have correct types
        const requiredProps = [
            { name: 'name', type: 'string' },
            { name: 'gender', type: 'string' },
            { name: 'currentDay', type: 'number' },
            { name: 'money', type: 'number' }
        ];
        
        const missingProps = [];
        const invalidTypeProps = [];
        
        for (const prop of requiredProps) {
            if (saveData[prop.name] === undefined) {
                missingProps.push(prop.name);
                console.warn(`SaveLoadSystem: Missing required property "${prop.name}" in save data`);
            } else if (typeof saveData[prop.name] !== prop.type) {
                invalidTypeProps.push({ name: prop.name, expected: prop.type, actual: typeof saveData[prop.name] });
                console.warn(`SaveLoadSystem: Property "${prop.name}" has wrong type - expected ${prop.type}, got ${typeof saveData[prop.name]}`);
            }
        }
        
        // Fail if critical properties are missing (name, gender, currentDay are critical)
        if (missingProps.includes('name') || missingProps.includes('gender') || missingProps.includes('currentDay')) {
            console.error('SaveLoadSystem: Critical properties missing, cannot apply save data');
            return false;
        }
        
        // Validate playerState exists
        if (!gameScene.playerState) {
            console.error('SaveLoadSystem: playerState not initialized');
            return false;
        }

        try {
            // Apply defaults for any missing fields (forward-compatibility)
            const defaults = SaveLoadSystem.getDefaultSaveFields();
            for (const [key, value] of Object.entries(defaults)) {
                if (saveData[key] === undefined) {
                    saveData[key] = value;
                }
            }
            
            // Restore basic info
            gameScene.playerState.name = saveData.name;
            gameScene.playerState.gender = saveData.gender;
            // Support both old (race/neighborhood) and new (neighborhood) save data
            // Convert display name to key if needed
            const neighborhoodValue = saveData.neighborhood || saveData.race || null;
            gameScene.playerState.neighborhood = SaveLoadSystem.convertNeighborhoodToKey(neighborhoodValue);
            gameScene.playerState.neighborhoodBonus = saveData.neighborhoodBonus || saveData.raceBonus || null;
            
            // Also support old-style race/neighborhood in characterData
            if (gameScene.characterData) {
                gameScene.characterData.neighborhood = saveData.neighborhood || saveData.race || null;
                gameScene.characterData.neighborhoodBonus = saveData.neighborhoodBonus || saveData.raceBonus || null;
            }
            
            // Restore stats
            if (saveData.stats && typeof saveData.stats === 'object') {
                // Validate required stat properties
                const requiredStats = ['strength', 'agility', 'charisma', 'intelligence'];
                const validStats = {};
                let hasAllStats = true;
                
                for (const stat of requiredStats) {
                    if (typeof saveData.stats[stat] === 'number') {
                        validStats[stat] = saveData.stats[stat];
                    } else {
                        console.warn(`SaveLoadSystem: Missing or invalid stat "${stat}", using default 5`);
                        validStats[stat] = 5;
                        hasAllStats = false;
                    }
                }
                
                gameScene.playerState.stats = validStats;
                
                if (!hasAllStats) {
                    console.warn('SaveLoadSystem: Some stats were missing, defaults applied');
                }
            } else {
                console.warn('SaveLoadSystem: Invalid or missing stats, using defaults');
                gameScene.playerState.stats = { strength: 5, agility: 5, charisma: 5, intelligence: 5 };
            }
            
            // Restore resources
            gameScene.playerState.money = typeof saveData.money === 'number' ? saveData.money : 0;
            gameScene.playerState.rawMaterials = typeof saveData.rawMaterials === 'number' ? saveData.rawMaterials : 0;
            gameScene.playerState.product = typeof saveData.product === 'number' ? saveData.product : 0;
            
            // NEW: Restore drugs inventory
            if (saveData.drugs && typeof saveData.drugs === 'object') {
                gameScene.playerState.drugs = { ...saveData.drugs };
            } else {
                // Initialize default drugs structure for backward compatibility
                gameScene.playerState.drugs = {
                    cocaine: 0,
                    crack: 0,
                    heroin: 0,
                    methamphetamine: 0,
                    ecstasy: 0,
                    marijuana: 0
                };
            }
            
            // NEW: Restore precursors inventory
            if (saveData.precursors && typeof saveData.precursors === 'object') {
                gameScene.playerState.precursors = { ...saveData.precursors };
            } else {
                // Initialize default precursors structure for backward compatibility
                gameScene.playerState.precursors = {
                    pseudoephedrine: 0,
                    ammonia: 0,
                    lithium: 0,
                    toluene: 0,
                    aceticAnhydride: 0,
                    ether: 0
                };
            }
            
            // Restore equipment
            if (saveData.equipment && typeof saveData.equipment === 'object') {
                gameScene.playerState.equipment = { ...saveData.equipment };
            }
            
            // Restore safehouse
            gameScene.playerState.safehouseTier = typeof saveData.safehouseTier === 'number' ? saveData.safehouseTier : 1;
            
            // Restore heat & hustle
            gameScene.playerState.heat = typeof saveData.heat === 'number' ? saveData.heat : 0;
            gameScene.playerState.hustle = typeof saveData.hustle === 'number' ? saveData.hustle : 100;
            
            // NEW: Restore neighborhood demand history
            if (saveData.neighborhoodHistory && typeof saveData.neighborhoodHistory === 'object') {
                gameScene.playerState.neighborhoodHistory = { ...saveData.neighborhoodHistory };
            } else {
                gameScene.playerState.neighborhoodHistory = {};
            }
            
            // Restore time/calendar
            gameScene.currentDay = typeof saveData.currentDay === 'number' ? saveData.currentDay : 1;
            if (gameScene.calendarSystem) {
                gameScene.calendarSystem.week = typeof saveData.week === 'number' ? saveData.week : 1;
                gameScene.calendarSystem.events = Array.isArray(saveData.calendarEvents) ? saveData.calendarEvents : [];
            }
            
            // Restore runner
            gameScene.playerState.hasRunner = !!saveData.hasRunner;
            gameScene.playerState.runnerProduct = typeof saveData.runnerProduct === 'number' ? saveData.runnerProduct : 0;
            
            // Restore position
            gameScene.playerState.gridX = typeof saveData.gridX === 'number' ? saveData.gridX : 0;
            gameScene.playerState.gridY = typeof saveData.gridY === 'number' ? saveData.gridY : 0;
            
            // Restore NPC relationships
            if (saveData.npcRelationships && typeof saveData.npcRelationships === 'object') {
                gameScene.playerState.npcRelationships = { ...saveData.npcRelationships };
            }
            
            // Restore daily flags
            gameScene.playerState.corruptCopUsedToday = saveData.corruptCopUsedToday;
            
            // Restore quest system
            if (saveData.questSystem && gameScene.questSystem) {
                gameScene.questSystem.loadSaveData(saveData.questSystem);
                if (gameScene.questUI) {
                    gameScene.questUI.update();
                }
            }
            
            // NEW: Restore Level & XP System
            if (saveData.level) gameScene.playerState.level = saveData.level;
            if (saveData.xp !== undefined) gameScene.playerState.xp = saveData.xp;
            if (saveData.xpToNextLevel) gameScene.playerState.xpToNextLevel = saveData.xpToNextLevel;
            if (saveData.abilityPoints) gameScene.playerState.abilityPoints = saveData.abilityPoints;
            if (saveData.statPoints) gameScene.playerState.statPoints = saveData.statPoints;
            if (saveData.classType) gameScene.playerState.classType = saveData.classType;
            if (saveData.unlockedSkills) gameScene.playerState.unlockedSkills = saveData.unlockedSkills;
            if (saveData.skillCooldowns) gameScene.playerState.skillCooldowns = saveData.skillCooldowns;
            
            // Re-initialize skill tree with saved data
            if (gameScene.skillTree && gameScene.playerState.classType) {
                gameScene.skillTree.currentTree = gameScene.playerState.classType;
            }
            
            // NEW: Restore Neighborhood Navigation System
            if (saveData.unlockedNeighborhoods && saveData.unlockedNeighborhoods.length > 0) {
                gameScene.playerState.unlockedNeighborhoods = [...saveData.unlockedNeighborhoods];
            }
            if (saveData.visitedNeighborhoods && saveData.visitedNeighborhoods.length > 0) {
                gameScene.playerState.visitedNeighborhoods = [...saveData.visitedNeighborhoods];
            }
            
            // NEW GAME+: Restore NG+ tracking
            if (saveData.newGamePlusCount !== undefined) {
                gameScene.playerState.newGamePlusCount = saveData.newGamePlusCount;
            }
            if (saveData.ngpMoneyCarriedOver !== undefined) {
                gameScene.playerState.ngpMoneyCarriedOver = saveData.ngpMoneyCarriedOver;
            }
            if (saveData.ngpUnlockedItems) {
                gameScene.playerState.ngpUnlockedItems = saveData.ngpUnlockedItems;
            }

                        return true;
        } catch (error) {
            console.error('SaveLoadSystem: Failed to apply save data:', error);
            return false;
        }
    }
}
