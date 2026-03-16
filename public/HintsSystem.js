/**
 * HintsSystem.js - Non-blocking contextual hints for TRAP
 * Shows small, dismissible tips based on player progress and game events
 */

import { EventBus, EVENTS } from './EventBus.js';

export default class HintsSystem {
    constructor(scene) {
        this.scene = scene;
        this.activeHints = [];
        this.dismissedHints = new Set(); // Hints user manually dismissed this session
        this.shownHints = new Set(); // Hints that have been shown (for "once" hints)
        
        // Hint configuration
        this.hints = this.initializeHints();
        
        // Subscribe to game events
        this.setupEventListeners();
        
        // Track state for triggers
        this.triggerState = {
            combatCount: 0,
            hasSeenCombat: false,
            inCombat: false,
            hasBoughtRaw: false,
            hasSoldProduct: false,
            totalSales: 0,
            inventoryFull: false,
            isRunning: false,
            hasEnemyEngaged: false,
            hasRunningShoes: false,
            stepsTaken: 0,
            heat: 0,
            hustle: 100,
            money: 100,
            rawMaterials: 0,
            product: 0,
            safehouseTier: 0,
            playerHealth: 100,
            enemyHealth: 0,
            shownRunHint: false,
            shownInventoryHint: false,
            shownShoesHint: false,
            shownAlleyHint: false,
            shownHeatBasics: false,
            shownSleepHeatHint: false,
            shownWorldMapHint: false,
            inSafehouse: false,
            hasSupplier: false,
            hasBuyer: false,
            timeOfDay: 'morning'
        };
        
        // Container for hint UI elements
        this.hintsContainer = null;
    }
    
    /**
     * Initialize all hint definitions with trigger conditions
     */
    initializeHints() {
        return [
            // ===== COMBAT HINTS =====
            {
                id: 'combat_first',
                category: 'combat',
                text: "Combat is real-time! You auto-attack, but use your AP to cast Skills and turn the tide!",
                trigger: (state) => state.combatCount === 0 && state.hasSeenCombat,
                once: true,
                priority: 1
            },
            {
                id: 'combat_skills',
                category: 'combat',
                text: "Check your Skill Tree (K). Passive skills apply automatically, active skills use cooldowns.",
                trigger: (state) => state.inCombat,
                once: true,
                priority: 2
            },
            {
                id: 'combat_run_option',
                category: 'combat',
                text: "Running from combat costs Hustle, but saves your stash and your life!",
                trigger: (state) => state.inCombat && state.combatCount > 0 && !state.shownRunHint,
                once: true,
                priority: 1,
                onShow: () => { this.triggerState.shownRunHint = true; }
            },
            {
                id: 'combat_outmatched',
                category: 'combat',
                text: "Outmatched? Running is sometimes the smart play! Keep an eye on your HP.",
                trigger: (state) => state.inCombat && state.playerHealth < 30 && state.enemyHealth > 70,
                once: false,
                priority: 2
            },
            
            // ===== TRADING HINTS =====
            {
                id: 'trading_first_buy',
                category: 'trading',
                text: "Find a Supplier on the map to buy raw materials - $50 each.",
                trigger: (state) => state.rawMaterials === 0 && state.money >= 50 && !state.hasBoughtRaw,
                once: true,
                priority: 1,
                onShow: () => { this.triggerState.hasBoughtRaw = true; }
            },
            {
                id: 'trading_first_sell',
                category: 'trading',
                text: "Find a Buyer on the map to sell your drugs - look for the yellow markers.",
                trigger: (state) => {
                    const hasDrugs = state.drugs && Object.values(state.drugs).some(v => v > 0);
                    return hasDrugs && !state.hasSoldProduct;
                },
                once: true,
                priority: 1,
                onShow: () => { this.triggerState.hasSoldProduct = true; }
            },
            {
                id: 'trading_process_raw',
                category: 'trading',
                text: "Process raw materials at Workstations to vastly increase their value!",
                trigger: (state) => state.rawMaterials > 0 && (!state.drugs || Object.values(state.drugs).every(v => v === 0)),
                once: true,
                priority: 2
            },
            {
                id: 'trading_inventory_full',
                category: 'trading',
                text: "Inventory full! Sell product, buy a backpack, or stash items at the Safehouse.",
                trigger: (state) => state.inventoryFull && !state.shownInventoryHint,
                once: true,
                priority: 1,
                onShow: () => { this.triggerState.shownInventoryHint = true; }
            },
            
            // ===== RUNNING / MOVEMENT HINTS =====
            {
                id: 'running_hustle_drain',
                category: 'running',
                text: "Running burns HUSTLE fast! Walk when you're low on energy.",
                trigger: (state) => state.hustle < 30 && state.isRunning,
                once: true,
                priority: 1
            },
            {
                id: 'running_shoes_help',
                category: 'running',
                text: "Running Shoes let you move faster across the city. Check the equipment shop!",
                trigger: (state) => state.hasEnemyEngaged && !state.hasRunningShoes && !state.shownShoesHint,
                once: true,
                priority: 1,
                onShow: () => { this.triggerState.shownShoesHint = true; }
            },
            {
                id: 'running_alleyways',
                category: 'running',
                text: "Stick to alleyways - less heat, more speed, safer routes.",
                trigger: (state) => state.stepsTaken > 50 && !state.shownAlleyHint,
                once: true,
                priority: 2,
                onShow: () => { this.triggerState.shownAlleyHint = true; }
            },
            
            // ===== HEAT HINTS =====
            {
                id: 'heat_basics',
                category: 'heat',
                text: "HEAT: 0-25% safe, 26-50% suspicious, 51-75% wanted, 76%+ BUSTED!",
                trigger: (state) => state.heat > 0 && state.heat < 25 && !state.shownHeatBasics,
                once: true,
                priority: 1,
                onShow: () => { this.triggerState.shownHeatBasics = true; }
            },
            {
                id: 'heat_elevated',
                category: 'heat',
                text: "Heat rising! Sleep at Safehouse (-20) or wait for a new day (-10)",
                trigger: (state) => state.heat > 50 && state.heat < 75,
                once: false,
                priority: 1
            },
            {
}
