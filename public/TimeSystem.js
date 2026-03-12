import { CONFIG } from './config.js';
import { EventBus, EVENTS } from './EventBus.js';

export default class TimeSystem {
    constructor(scene) {
        this.scene = scene;
        this.day = 1;
        this.timeInMinutes = CONFIG.DAY_START_HOUR * 60; // Start at 6 AM
        
        // Subscribe to events from other systems
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Listen for external time control events
        EventBus.on('time:setDay', (data) => {
            this.day = data.day;
        });
        
        EventBus.on('time:setTime', (data) => {
            this.timeInMinutes = data.minutes;
        });
    }
    
    advanceTime(minutes) {
        const oldDay = this.day;
        this.timeInMinutes += minutes;
        
        // Check if we've passed midnight
        if (this.timeInMinutes >= CONFIG.MINUTES_PER_DAY) {
            this.timeInMinutes -= CONFIG.MINUTES_PER_DAY;
            this.day++;
            
            // Emit day changed event
            EventBus.emit(EVENTS.DAY_CHANGED, {
                fromDay: oldDay,
                toDay: this.day
            });
        }
        
        // Emit time advanced event
        EventBus.emit(EVENTS.TIME_ADVANCED, {
            minutes: minutes,
            totalMinutes: this.timeInMinutes,
            hour: this.getHour(),
            minute: this.getMinute(),
            day: this.day
        });
    }
    
    advanceToNextDay() {
        const oldDay = this.day;
        this.day++;
        this.timeInMinutes = CONFIG.DAY_START_HOUR * 60; // 6 AM
        
        // Emit day changed event
        EventBus.emit(EVENTS.DAY_CHANGED, {
            fromDay: oldDay,
            toDay: this.day,
            timeString: this.getTimeString()
        });
        
        // Trigger daily events in the scene (legacy support)
        if (this.scene && this.scene.onNewDay) {
            this.scene.onNewDay();
        }
    }
    
    getHour() {
        return Math.floor(this.timeInMinutes / 60);
    }
    
    getMinute() {
        return this.timeInMinutes % 60;
    }
    
    getTimeString() {
        const hour = this.getHour();
        const minute = this.getMinute();
        const isPM = hour >= 12;
        const displayHour = hour === 0 ? 12 : (hour > 12 ? hour - 12 : hour);
        const minuteStr = minute.toString().padStart(2, '0');
        const period = isPM ? 'PM' : 'AM';
        
        return `${displayHour}:${minuteStr} ${period}`;
    }
    
    isNight() {
        const hour = this.getHour();
        return hour >= CONFIG.NIGHT_START_HOUR || hour < CONFIG.DAY_START_HOUR;
    }
    
    isDaytime() {
        return !this.isNight();
    }
}
