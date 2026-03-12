/**
 * EventBus.js - Simple event emitter for TRAP game
 * Provides pub/sub pattern for loose coupling between game systems
 */

class _EventBus {
    constructor() {
        this.listeners = new Map();
    }

    /**
     * Subscribe to an event
     * @param {string} eventName - Name of the event
     * @param {Function} callback - Function to call when event fires
     * @returns {Function} Unsubscribe function
     */
    on(eventName, callback) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, new Set());
        }
        this.listeners.get(eventName).add(callback);
        
        // Return unsubscribe function
        return () => this.off(eventName, callback);
    }

    /**
     * Subscribe to an event once
     * @param {string} eventName - Name of the event
     * @param {Function} callback - Function to call when event fires
     */
    once(eventName, callback) {
        const wrapper = (...args) => {
            this.off(eventName, wrapper);
            callback(...args);
        };
        this.on(eventName, wrapper);
    }

    /**
     * Unsubscribe from an event
     * @param {string} eventName - Name of the event
     * @param {Function} callback - Function to remove
     */
    off(eventName, callback) {
        if (this.listeners.has(eventName)) {
            this.listeners.get(eventName).delete(callback);
        }
    }

    /**
     * Emit an event
     * @param {string} eventName - Name of the event
     * @param {*} data - Data to pass to listeners
     */
    emit(eventName, data) {
        if (this.listeners.has(eventName)) {
            this.listeners.get(eventName).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for '${eventName}':`, error);
                }
            });
        }
    }

    /**
     * Remove all listeners for an event
     * @param {string} eventName - Name of the event (optional, clears all if not provided)
     */
    clear(eventName) {
        if (eventName) {
            this.listeners.delete(eventName);
        } else {
            this.listeners.clear();
        }
    }

    /**
     * Remove all listeners for a specific event (alias for clear)
     * @param {string} eventName - Name of the event
     */
    removeAllListeners(eventName) {
        if (eventName) {
            this.listeners.delete(eventName);
        }
    }

    /**
     * Remove all listeners from all events
     */
    removeAll() {
        this.listeners.clear();
    }

    /**
     * Get listener count for an event
     * @param {string} eventName - Name of the event
     * @returns {number} Number of listeners
     */
    listenerCount(eventName) {
        return this.listeners.has(eventName) ? this.listeners.get(eventName).size : 0;
    }
}

// Singleton instance
export const EventBus = new _EventBus();

// Event names - central registry for type safety
export const EVENTS = {
    // Player events
    PLAYER_MONEY_CHANGED: 'player:moneyChanged',
    PLAYER_STATS_CHANGED: 'player:statsChanged',
    PLAYER_HEAT_CHANGED: 'player:heatChanged',
    PLAYER_HUSTLE_CHANGED: 'player:hustleChanged',
    PLAYER_NEIGHBORHOOD_CHANGED: 'player:neighborhoodChanged',
    PLAYER_EQUIPMENT_CHANGED: 'player:equipmentChanged',
    PLAYER_INVENTORY_CHANGED: 'player:inventoryChanged',

    // Game state events
    GAME_STATE_CHANGED: 'game:stateChanged',
    GAME_PAUSED: 'game:paused',
    GAME_RESUMED: 'game:resumed',
    GAME_SAVED: 'game:saved',
    GAME_LOADED: 'game:loaded',

    // Time events
    TIME_ADVANCED: 'time:advanced',
    DAY_CHANGED: 'time:dayChanged',

    // Combat events
    COMBAT_STARTED: 'combat:started',
    COMBAT_ENDED: 'combat:ended',
    PLAYER_DAMAGED: 'player:damaged',
    ENEMY_DEFEATED: 'enemy:defeated',

    // Quest events
    QUEST_STARTED: 'quest:started',
    QUEST_COMPLETED: 'quest:completed',
    QUEST_FAILED: 'quest:failed',
    QUEST_UPDATED: 'quest:updated',

    // Interaction events
    NPC_INTERACTION_START: 'npc:interactionStart',
    NPC_INTERACTION_END: 'npc:interactionEnd',
    SHOP_OPENED: 'shop:opened',
    SHOP_CLOSED: 'shop:closed',

    // UI events
    UI_OPENED: 'ui:opened',
    UI_CLOSED: 'ui:closed',
    NOTIFICATION_SHOWN: 'ui:notification',

    // Economy events
    ECONOMY_EVENT_STARTED: 'economy:eventStarted',
    ECONOMY_EVENT_ENDED: 'economy:eventEnded'
};

export default EventBus;