/**
 * SaveLoadSystem.js - LocalStorage persistence for Trap game
 * Handles saving and loading game state
 */

const SAVE_KEY = 'trap_game_save';

export default class SaveLoadSystem {
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
                // Player basic info
                name: gameScene.playerState.name,
                gender: gameScene.playerState.gender,
                race: gameScene.characterData?.race || gameScene.playerState.race,
                raceBonus: gameScene.characterData?.raceBonus || gameScene.playerState.raceBonus,
                
                // Stats
                stats: { ...gameScene.playerState.stats },
                
                // Resources
                money: gameScene.playerState.money,
                rawMaterials: gameScene.playerState.rawMaterials,
                product: gameScene.playerState.product,
                
                // Equipment/Inventory
                equipment: { ...gameScene.playerState.equipment },
                
                // Safehouse
                safehouseTier: gameScene.playerState.safehouseTier,
                
                // Heat & Hustle
                heat: gameScene.playerState.heat,
                hustle: gameScene.playerState.hustle,
                
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
                
                // Daily flags
                corruptCopUsedToday: gameScene.playerState.corruptCopUsedToday,
                
                // Timestamps
                savedAt: new Date().toISOString()
            };

            localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
            console.log('Game saved successfully at', saveData.savedAt);
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
            const savedData = localStorage.getItem(SAVE_KEY);
            if (!savedData) {
                return null;
            }
            return JSON.parse(savedData);
        } catch (error) {
            console.error('SaveLoadSystem: Failed to load game:', error);
            return null;
        }
    }

    /**
     * Check if a saved game exists
     * @returns {boolean} - Whether a save exists
     */
    static hasSavedGame() {
        try {
            return localStorage.getItem(SAVE_KEY) !== null;
        } catch (error) {
            console.error('SaveLoadSystem: Failed to check save:', error);
            return false;
        }
    }

    /**
     * Delete the saved game from localStorage
     * @returns {boolean} - Whether deletion was successful
     */
    static deleteSave() {
        try {
            localStorage.removeItem(SAVE_KEY);
            console.log('Save deleted successfully');
            return true;
        } catch (error) {
            console.error('SaveLoadSystem: Failed to delete save:', error);
            return false;
        }
    }

    /**
     * Apply loaded save data to the game scene
     * @param {Object} gameScene - The GameScene instance
     * @param {Object} saveData - The loaded save data
     */
    static applySaveData(gameScene, saveData) {
        if (!gameScene || !saveData) return false;

        try {
            // Restore basic info
            gameScene.playerState.name = saveData.name;
            gameScene.playerState.gender = saveData.gender;
            gameScene.playerState.raceBonus = saveData.raceBonus || null;
            
            // Restore stats
            if (saveData.stats) {
                gameScene.playerState.stats = { ...saveData.stats };
            }
            
            // Restore resources
            gameScene.playerState.money = saveData.money;
            gameScene.playerState.rawMaterials = saveData.rawMaterials;
            gameScene.playerState.product = saveData.product;
            
            // Restore equipment
            if (saveData.equipment) {
                gameScene.playerState.equipment = { ...saveData.equipment };
            }
            
            // Restore safehouse
            gameScene.playerState.safehouseTier = saveData.safehouseTier;
            
            // Restore heat & hustle
            gameScene.playerState.heat = saveData.heat;
            gameScene.playerState.hustle = saveData.hustle;
            
            // Restore time/calendar
            gameScene.currentDay = saveData.currentDay;
            if (gameScene.calendarSystem) {
                gameScene.calendarSystem.week = saveData.week || 1;
                gameScene.calendarSystem.events = saveData.calendarEvents || [];
            }
            
            // Restore runner
            gameScene.playerState.hasRunner = saveData.hasRunner;
            gameScene.playerState.runnerProduct = saveData.runnerProduct;
            
            // Restore position
            gameScene.playerState.gridX = saveData.gridX;
            gameScene.playerState.gridY = saveData.gridY;
            
            // Restore NPC relationships
            if (saveData.npcRelationships) {
                gameScene.playerState.npcRelationships = { ...saveData.npcRelationships };
            }
            
            // Restore daily flags
            gameScene.playerState.corruptCopUsedToday = saveData.corruptCopUsedToday;

            console.log('Save data applied successfully');
            return true;
        } catch (error) {
            console.error('SaveLoadSystem: Failed to apply save data:', error);
            return false;
        }
    }
}
