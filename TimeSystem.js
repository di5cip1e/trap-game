import { CONFIG } from './config.js';

export default class TimeSystem {
    constructor(scene) {
        this.scene = scene;
        this.day = 1;
        this.timeInMinutes = CONFIG.DAY_START_HOUR * 60; // Start at 6 AM
    }
    
    advanceTime(minutes) {
        this.timeInMinutes += minutes;
        
        // Check if we've passed midnight
        if (this.timeInMinutes >= CONFIG.MINUTES_PER_DAY) {
            this.timeInMinutes -= CONFIG.MINUTES_PER_DAY;
            this.day++;
        }
    }
    
    advanceToNextDay() {
        this.day++;
        this.timeInMinutes = CONFIG.DAY_START_HOUR * 60; // 6 AM
        
        // Trigger daily events in the scene
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
