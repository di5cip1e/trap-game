/**
 * GameState.js - State machine for TRAP game modes
 * Manages game state transitions and provides state-aware logic
 */

import { EventBus, EVENTS } from './EventBus.js';

// Game mode states
export const GAME_MODES = {
    MENU: 'MENU',
    CHARACTER_CREATION: 'CHARACTER_CREATION',
    EXPLORATION: 'EXPLORATION',
    COMBAT: 'COMBAT',
    DIALOGUE: 'DIALOGUE',
    SHOP: 'SHOP',
    SAFEHOUSE: 'SAFEHOUSE',
    QUEST: 'QUEST',
    PAUSED: 'PAUSED',
    GAMEOVER: 'GAMEOVER'
};

// State machine class
class GameState {
    constructor() {
        this.currentState = GAME_MODES.MENU;
        this.previousState = null;
        this.stateData = {};
        this.stateStack = []; // For nested states
        
        // Setup event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for state change requests
        EventBus.on('state:change', (data) => {
            this.transitionTo(data.state, data.data);
        });
    }

    /**
     * Get current state
     * @returns {string} Current game mode
     */
    getState() {
        return this.currentState;
    }

    /**
     * Get previous state
     * @returns {string|null} Previous game mode
     */
    getPreviousState() {
        return this.previousState;
    }

    /**
     * Check if in specific state
     * @param {string} state - State to check
     * @returns {boolean}
     */
    is(state) {
        return this.currentState === state;
    }

    /**
     * Check if in any of the given states
     * @param {string[]} states - States to check
     * @returns {boolean}
     */
    isAny(states) {
        return states.includes(this.currentState);
    }

    /**
     * Transition to a new state
     * @param {string} newState - New game mode
     * @param {*} data - Optional data to pass with state
     */
    transitionTo(newState, data = null) {
        if (newState === this.currentState) {
            return; // No change
        }

        const oldState = this.currentState;
        
        // Store previous state
        this.previousState = oldState;
        
        // Update current state
        this.currentState = newState;
        
        // Store state data
        if (data) {
            this.stateData[newState] = { ...data, timestamp: Date.now() };
        }

        // Emit state change events
        EventBus.emit(EVENTS.GAME_STATE_CHANGED, {
            from: oldState,
            to: newState,
            data: data
        });

        // Emit specific events for certain transitions
        if (newState === GAME_MODES.PAUSED) {
            EventBus.emit(EVENTS.GAME_PAUSED, { from: oldState });
        } else if (oldState === GAME_MODES.PAUSED) {
            EventBus.emit(EVENTS.GAME_RESUMED, { to: newState });
        }

            }

    /**
     * Push a state onto the stack (for nested states)
     * @param {string} state - State to push
     * @param {*} data - Optional data
     */
    pushState(state, data = null) {
        this.stateStack.push(this.currentState);
        this.transitionTo(state, data);
    }

    /**
     * Pop the previous state from the stack
     * @param {*} data - Optional data for the popped state
     */
    popState(data = null) {
        if (this.stateStack.length > 0) {
            const previousState = this.stateStack.pop();
            this.transitionTo(previousState, data);
        }
    }

    /**
     * Get state data
     * @param {string} state - State to get data for (defaults to current)
     * @returns {*} State data
     */
    getStateData(state = null) {
        const targetState = state || this.currentState;
        return this.stateData[targetState] || null;
    }

    /**
     * Clear state data
     * @param {string} state - State to clear (defaults to current)
     */
    clearStateData(state = null) {
        const targetState = state || this.currentState;
        delete this.stateData[targetState];
    }

    /**
     * Reset to initial state
     */
    reset() {
        this.currentState = GAME_MODES.MENU;
        this.previousState = null;
        this.stateData = {};
        this.stateStack = [];
        
        EventBus.emit(EVENTS.GAME_STATE_CHANGED, {
            from: null,
            to: GAME_MODES.MENU,
            data: null
        });
    }
}

// Singleton instance (lowercase to avoid conflict with class name)
export const gameState = new GameState();

export default GameState;