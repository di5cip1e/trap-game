import { CONFIG } from './config.js';
import { EventBus, EVENTS } from './EventBus.js';

export default class CalendarSystem {
    constructor(scene) {
        this.scene = scene;
        
        // Track current week and day
        this.currentWeek = 1;
        this.dayOfWeek = 1; // 1-7
        
        // Active events
        this.activeEvents = {
            crackdown: false,
            drought: false
        };
        
        // Drought tracking
        this.droughtDaysRemaining = 0;
        this.droughtSchedule = []; // Days when drought will occur in current week
        
        // Initialize first week's drought
        this.scheduleWeeklyDrought();
        
        // ==========================================
        // RANDOM ECONOMY EVENTS SYSTEM
        // ==========================================
        this.activeEconomyEvent = null;           // Currently active random economy event
        this.economyEventDaysRemaining = 0;       // Days until event ends
        this.daysUntilNextEvent = this.getRandomEventInterval(); // Days until next event
        this.shortageTargetDrug = null;           // Which drug is affected by shortage
        
        // Subscribe to events
        this.setupEventListeners();
    }
    
    /**
     * Get random interval between economy events (3-7 days)
     */
    getRandomEventInterval() {
        const min = CONFIG.ECONOMY_EVENT_MIN_DAYS;
        const max = CONFIG.ECONOMY_EVENT_MAX_DAYS;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    /**
     * Trigger a random economy event
     */
    triggerRandomEvent() {
        const eventTypes = Object.keys(CONFIG.ECONOMY_EVENTS);
        const randomEventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        return this.triggerEvent(randomEventType);
    }
    
    /**
     * Trigger a specific economy event by type
     * @param {string} eventType - The event type key (e.g., 'POLICE_RAID', 'SHORTAGE', 'BOOM')
     * @returns {object|null} The triggered event or null if invalid type
     */
    triggerEvent(eventType) {
        const eventConfig = CONFIG.ECONOMY_EVENTS[eventType];
        
        if (!eventConfig) {
            console.warn(`Unknown economy event type: ${eventType}`);
            return null;
        }
        
        // Don't override existing event
        if (this.activeEconomyEvent) {
            console.warn('An economy event is already active');
            return null;
        }
        
        this.activeEconomyEvent = {
            type: eventType,
            ...eventConfig,
            startDay: this.scene?.timeSystem?.day || 1
        };
        
        this.economyEventDaysRemaining = eventConfig.duration;
        
        // For shortage events, pick a random drug
        if (eventType === 'SHORTAGE') {
            const drugTypes = Object.keys(CONFIG.DRUG_TYPES);
            this.shortageTargetDrug = drugTypes[Math.floor(Math.random() * drugTypes.length)];
            this.activeEconomyEvent.targetDrug = this.shortageTargetDrug;
        }
        
        // Reset countdown for next event
        this.daysUntilNextEvent = this.getRandomEventInterval();
        
        // Show event notification in game
        if (this.scene && this.scene.showFloatingText) {
            this.scene.showFloatingText(
                `${eventConfig.name}! ${eventConfig.description}`,
                eventConfig.color
            );
        }
        
        // Emit event for notifications
        EventBus.emit(EVENTS.ECONOMY_EVENT_STARTED, {
            name: eventConfig.name,
            type: eventType,
            description: eventConfig.description,
            priceEffect: eventConfig.priceMultiplier !== 1 ? 
                `${Math.round((eventConfig.priceMultiplier - 1) * 100)}% Price` : 
                'See description',
            color: eventConfig.color,
            affectedArea: 'All neighborhoods',
            daysRemaining: this.economyEventDaysRemaining
        });
        
        return this.activeEconomyEvent;
    }
    
    // ==========================================
    // EXPLICIT EVENT TRIGGER METHODS
    // ==========================================
    
    /**
     * Trigger a Police Raid event
     * - Prices drop 30%
     * - Heat gains 2x
     * - Duration: 2 days
     */
    triggerPoliceRaid() {
        return this.triggerEvent('POLICE_RAID');
    }
    
    /**
     * Trigger a Supply Shortage event
     * - One random drug sells for 2x
     * - Raw materials cost 1.5x
     * - Duration: 3 days
     */
    triggerShortage() {
        return this.triggerEvent('SHORTAGE');
    }
    
    /**
     * Trigger an Economic Drought event
     * - All prices 1.5x
     * - Raw materials 1.5x
     * - Duration: 2 days
     */
    triggerEconomicDrought() {
        return this.triggerEvent('ECONOMIC_DROUGHT');
    }
    
    /**
     * Trigger a Market Boom event
     * - All prices 0.7x (better for buyers)
     * - Raw materials 0.7x
     * - Heat gain 0.5x
     * - Duration: 3 days
     */
    triggerBoom() {
        return this.triggerEvent('BOOM');
    }
    
    /**
     * Trigger a Gang War event
     * - Prices 1.2x
     * - Heat 1.5x
     * - Raw materials 1.3x
     * - Blocks travel between neighborhoods
     * - Duration: 2 days
     */
    triggerGangWar() {
        return this.triggerEvent('GANG_WAR');
    }
    
    /**
     * Get all active economy events with their effects
     * @returns {Array} Array of active economy events with effects
     */
    getActiveEconomyEvents() {
        const events = [];
        
        // Add active random economy event if present
        if (this.activeEconomyEvent) {
            const event = this.activeEconomyEvent;
            events.push({
                name: event.name,
                type: event.type,
                description: event.description,
                color: event.color,
                daysRemaining: this.economyEventDaysRemaining,
                effects: {
                    priceMultiplier: event.priceMultiplier || 1,
                    heatGainMultiplier: event.heatGainMultiplier || 1,
                    rawCostMultiplier: event.rawCostMultiplier || 1,
                    targetDrugMultiplier: event.targetDrugMultiplier || 1,
                    blocksTravel: event.blocksTravel || false
                },
                targetDrug: this.shortageTargetDrug
            });
        }
        
        return events;
    }
    
    /**
     * Check if a random event should trigger today
     */
    checkRandomEventTrigger() {
        // Don't trigger if there's already an active event
        if (this.activeEconomyEvent) return false;
        
        this.daysUntilNextEvent--;
        
        if (this.daysUntilNextEvent <= 0) {
            this.triggerRandomEvent();
            return true;
        }
        
        return false;
    }
    
    setupEventListeners() {
        // Listen for day changes from TimeSystem
        EventBus.on(EVENTS.DAY_CHANGED, (data) => {
            this.advanceDay(data.toDay);
        });
    }
    
    advanceDay(absoluteDay) {
        // Calculate week and day of week
        this.dayOfWeek = ((absoluteDay - 1) % CONFIG.CALENDAR_WEEK_LENGTH) + 1;
        this.currentWeek = Math.floor((absoluteDay - 1) / CONFIG.CALENDAR_WEEK_LENGTH) + 1;
        
        // Store previous state to detect event changes
        const previousCrackdown = this.activeEvents.crackdown;
        const previousDrought = this.activeEvents.drought;
        
        // Check if we entered a new week
        if (this.dayOfWeek === 1) {
            this.scheduleWeeklyDrought();
        }
        
        // Update active events
        this.updateActiveEvents();
        
        // Check for random economy event trigger
        const previousEconomyEvent = this.activeEconomyEvent;
        this.checkRandomEventTrigger();
        
        // Update economy event duration if active
        if (this.activeEconomyEvent) {
            this.economyEventDaysRemaining--;
            
            if (this.economyEventDaysRemaining <= 0) {
                // Event ended
                if (this.scene && this.scene.showFloatingText) {
                    this.scene.showFloatingText(
                        `${this.activeEconomyEvent.name} ended!`,
                        '#ffffff'
                    );
                }
                this.activeEconomyEvent = null;
                this.shortageTargetDrug = null;
            }
        }
        
        // Emit events for state changes
        if (this.activeEvents.crackdown && !previousCrackdown) {
            EventBus.emit(EVENTS.ECONOMY_EVENT_STARTED, {
                name: 'POLICE CRACKDOWN',
                type: 'crackdown',
                description: 'Police presence doubled! Heat gains 2x!',
                priceEffect: '+100% Heat',
                color: CONFIG.COLORS.danger,
                affectedArea: 'All neighborhoods'
            });
        }
        
        if (this.activeEvents.drought && !previousDrought) {
            EventBus.emit(EVENTS.ECONOMY_EVENT_STARTED, {
                name: 'SUPPLY SHORTAGE',
                type: 'shortage',
                description: 'Raw materials 2x cost, Product 2x price!',
                priceEffect: 'Materials +100%, Product +100%',
                color: CONFIG.COLORS.primary,
                affectedArea: 'All neighborhoods'
            });
        }
        
        // Emit event for new economy event started
        if (this.activeEconomyEvent && !previousEconomyEvent) {
            EventBus.emit(EVENTS.ECONOMY_EVENT_STARTED, {
                name: this.activeEconomyEvent.name,
                type: this.activeEconomyEvent.type,
                description: this.activeEconomyEvent.description,
                priceEffect: this.activeEconomyEvent.priceMultiplier !== 1 ? 
                    `${Math.round((this.activeEconomyEvent.priceMultiplier - 1) * 100)}% Price` : 
                    'See description',
                color: this.activeEconomyEvent.color,
                affectedArea: 'All neighborhoods'
            });
        }
    }
    
    scheduleWeeklyDrought() {
        // Schedule 2 consecutive days for drought, avoiding day 7 (crackdown day)
        // Possible start days: 1-5 (so drought can be days 1-2, 2-3, 3-4, 4-5, or 5-6)
        const possibleStartDays = [1, 2, 3, 4, 5];
        const startDay = possibleStartDays[Math.floor(Math.random() * possibleStartDays.length)];
        
        this.droughtSchedule = [startDay, startDay + 1];
    }
    
    updateActiveEvents() {
        // Check for Crackdown (always day 7)
        this.activeEvents.crackdown = (this.dayOfWeek === CONFIG.CRACKDOWN_DAY);
        
        // Check for Drought (scheduled days)
        this.activeEvents.drought = this.droughtSchedule.includes(this.dayOfWeek);
    }
    
    isCrackdownActive() {
        return this.activeEvents.crackdown;
    }
    
    isDroughtActive() {
        return this.activeEvents.drought;
    }
    
    getActiveEvents() {
        const events = [];
        
        if (this.activeEvents.crackdown) {
            events.push({
                name: 'THE CRACKDOWN',
                description: 'Police doubled! Heat gains 2x!',
                color: CONFIG.COLORS.danger,
                icon: '👮',
                daysRemaining: 'Ongoing'
            });
        }
        
        if (this.activeEvents.drought) {
            events.push({
                name: 'THE DROUGHT',
                description: 'Raw 2x cost, Product 2x price!',
                color: CONFIG.COLORS.primary,
                icon: '🏜️',
                daysRemaining: 'Ongoing'
            });
        }
        
        // Add active economy events with days remaining
        const economyEvents = this.getActiveEconomyEvents();
        economyEvents.forEach(event => {
            events.push({
                name: event.name,
                description: event.description,
                color: event.color,
                icon: this.getEventIcon(event.type),
                daysRemaining: `${event.daysRemaining} day${event.daysRemaining !== 1 ? 's' : ''}`,
                effects: event.effects
            });
        });
        
        return events;
    }
    
    /**
     * Get icon for economy event type
     * @param {string} eventType - The event type
     * @returns {string} Emoji icon
     */
    getEventIcon(eventType) {
        const icons = {
            'POLICE_RAID': '🚨',
            'SHORTAGE': '📦',
            'ECONOMIC_DROUGHT': '🏜️',
            'BOOM': '📈',
            'GANG_WAR': '💥'
        };
        return icons[eventType] || '⚡';
    }
    
    getDayOfWeekName() {
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        return dayNames[this.dayOfWeek - 1];
    }
    
    getHeatMultiplier() {
        let multiplier = this.activeEvents.crackdown ? CONFIG.CRACKDOWN_HEAT_MULTIPLIER : 1;
        
        // Apply economy event heat multiplier
        if (this.activeEconomyEvent?.heatGainMultiplier) {
            multiplier *= this.activeEconomyEvent.heatGainMultiplier;
        }
        
        return multiplier;
    }
    
    getRawMaterialCostMultiplier() {
        let multiplier = this.activeEvents.drought ? CONFIG.DROUGHT_COST_MULTIPLIER : 1;
        
        // Apply economy event raw cost multiplier
        if (this.activeEconomyEvent?.rawCostMultiplier) {
            multiplier *= this.activeEconomyEvent.rawCostMultiplier;
        }
        
        return multiplier;
    }
    
    getProductSellMultiplier(drugType = null) {
        let multiplier = this.activeEvents.drought ? CONFIG.DROUGHT_SELL_MULTIPLIER : 1;
        
        // Apply economy event price multiplier
        if (this.activeEconomyEvent?.priceMultiplier) {
            multiplier *= this.activeEconomyEvent.priceMultiplier;
        }
        
        // Apply shortage-specific drug multiplier
        if (this.activeEconomyEvent?.type === 'SHORTAGE' && 
            drugType === this.shortageTargetDrug && 
            this.activeEconomyEvent.targetDrugMultiplier) {
            multiplier *= this.activeEconomyEvent.targetDrugMultiplier;
        }
        
        return multiplier;
    }
    
    /**
     * Check if gang war is active (blocks travel)
     */
    isGangWarActive() {
        return this.activeEconomyEvent?.type === 'GANG_WAR';
    }
    
    /**
     * Check if travel is blocked by gang war
     */
    isTravelBlocked() {
        return this.isGangWarActive();
    }
    
    /**
     * Get the current economy event info
     */
    getEconomyEvent() {
        return this.activeEconomyEvent;
    }
    
    shouldSpawnExtraPolice() {
        // During crackdown, double police spawn chance
        return this.activeEvents.crackdown;
    }
    
    getCalendarInfo() {
        return {
            week: this.currentWeek,
            dayOfWeek: this.dayOfWeek,
            dayName: this.getDayOfWeekName(),
            activeEvents: this.getActiveEvents(),
            activeEconomyEvents: this.getActiveEconomyEvents(),
            droughtSchedule: this.droughtSchedule,
            economyEvent: this.activeEconomyEvent,
            economyEventDaysRemaining: this.economyEventDaysRemaining,
            daysUntilNextEvent: this.daysUntilNextEvent
        };
    }
    
    // Trigger a random neighborhood event (can be called randomly)
    triggerRandomNeighborhoodEvent() {
        const neighborhoods = ['Old Town', 'Skid Row', 'The Flats', 'Ironworks', 'The Harbor', 'The Maw', 'Industrial Zone', 'Salvage Yard'];
        const randomNeighborhood = neighborhoods[Math.floor(Math.random() * neighborhoods.length)];
        
        const eventTypes = [
            {
                name: 'POLICE RAID',
                description: 'Police raid in ' + randomNeighborhood + '! Supplies seized!',
                priceEffect: 'Prices dropping!',
                color: CONFIG.COLORS.danger,
                priceModifier: 0.5
            },
            {
                name: 'SHORTAGE',
                description: 'Supply shortage in ' + randomNeighborhood + '. Scarcity!',
                priceEffect: 'Prices +50%',
                color: CONFIG.COLORS.primary,
                priceModifier: 1.5
            },
            {
                name: 'DEMAND SPIKE',
                description: 'High demand in ' + randomNeighborhood + '! Buyers paying more!',
                priceEffect: 'Product +75%',
                color: CONFIG.COLORS.success,
                priceModifier: 1.75
            },
            {
                name: 'COMPETITION',
                description: 'Rival operation in ' + randomNeighborhood + '. Market flooded!',
                priceEffect: 'Prices -30%',
                color: CONFIG.COLORS.warning,
                priceModifier: 0.7
            }
        ];
        
        const event = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        
        EventBus.emit(EVENTS.ECONOMY_EVENT_STARTED, {
            name: event.name,
            type: 'random',
            description: event.description,
            priceEffect: event.priceEffect,
            color: event.color,
            affectedArea: randomNeighborhood,
            priceModifier: event.priceModifier
        });
        
        return event;
    }
}
