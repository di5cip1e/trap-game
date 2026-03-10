import { CONFIG } from './config.js';

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
    }
    
    advanceDay(absoluteDay) {
        // Calculate week and day of week
        this.dayOfWeek = ((absoluteDay - 1) % CONFIG.CALENDAR_WEEK_LENGTH) + 1;
        this.currentWeek = Math.floor((absoluteDay - 1) / CONFIG.CALENDAR_WEEK_LENGTH) + 1;
        
        // Check if we entered a new week
        if (this.dayOfWeek === 1) {
            this.scheduleWeeklyDrought();
        }
        
        // Update active events
        this.updateActiveEvents();
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
                color: CONFIG.COLORS.danger
            });
        }
        
        if (this.activeEvents.drought) {
            events.push({
                name: 'THE DROUGHT',
                description: 'Raw 2x cost, Product 2x price!',
                color: CONFIG.COLORS.primary
            });
        }
        
        return events;
    }
    
    getDayOfWeekName() {
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        return dayNames[this.dayOfWeek - 1];
    }
    
    getHeatMultiplier() {
        return this.activeEvents.crackdown ? CONFIG.CRACKDOWN_HEAT_MULTIPLIER : 1;
    }
    
    getRawMaterialCostMultiplier() {
        return this.activeEvents.drought ? CONFIG.DROUGHT_COST_MULTIPLIER : 1;
    }
    
    getProductSellMultiplier() {
        return this.activeEvents.drought ? CONFIG.DROUGHT_SELL_MULTIPLIER : 1;
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
            droughtSchedule: this.droughtSchedule
        };
    }
}
