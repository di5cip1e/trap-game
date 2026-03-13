import Phaser from 'phaser';
import { CONFIG } from './config.js';

export default class SupplierMeetingSystem {
    constructor(scene) {
        this.scene = scene;
        this.activeSupplier = null;
        this.supplierCycle = 0;
        this.supplierRelations = {};  // { gangId: loyalty }
        this.availableSuppliers = [];
        this.isMeeting = false;
        
        // Default supplier dialogue
        this.defaultGreetings = [
            "You've got my attention.",
            "I hear you've been making moves.",
            "Let's talk business.",
            "You wanted to meet?",
            "Good to see you came alone."
        ];
        
        this.defaultFarewells = [
            "Don't waste my time again.",
            "Until next time.",
            "Watch your back out there.",
            "Same time next cycle.",
            "Don't get greedy."
        ];
        
        this.defaultBuyDialog = [
            "What's the order?",
            "I can hook you up.",
            "Quality costs, but you're worth it.",
            "Name your price.",
            "Let's see what you're carrying."
        ];
        
        this.defaultLoyaltyDialog = [
            "You've earned my trust.",
            "You're one of us now.",
            "Family treats family right.",
            "I knew you had potential.",
            "You're in deep now."
        ];
        
        this.defaultWarningDialog = [
            "I'm watching you.",
            "Don't try anything stupid.",
            "You better have the cash.",
            "I don't trust you yet.",
            "One wrong move and we're done."
        ];
    }
    
    // Initialize supplier relations from save data
    loadRelations(savedRelations) {
        if (savedRelations) {
            this.supplierRelations = savedRelations;
        }
    }
    
    // Get relations for saving
    getRelations() {
        return this.supplierRelations;
    }
    
    // Generate new suppliers for the cycle
    generateSupplierCycle() {
        const allGangs = Object.values(CONFIG.GANG_AFFILIATIONS);
        const available = [];
        
        // Get already active suppliers
        const activeIds = Object.keys(this.supplierRelations);
        
        // Shuffle and pick available gangs
        const shuffled = allGangs.sort(() => Math.random() - 0.5);
        
        for (const gang of shuffled) {
            if (available.length >= CONFIG.SUPPLIER_CONFIG.SUPPLIERS_PER_CYCLE) break;
            
            // Already have active relation with this gang
            if (this.supplierRelations[gang.id] !== undefined) {
                continue;
            }
            
            // Check if we have room for more
            if (activeIds.length >= CONFIG.SUPPLIER_CONFIG.MAX_ACTIVE_SUPPLIERS) {
                break;
            }
            
            available.push(gang);
            // Start with base loyalty
            this.supplierRelations[gang.id] = 1;
        }
        
        this.availableSuppliers = available;
        this.supplierCycle++;
        
        return available;
    }
    
    // Get current available suppliers
    getAvailableSuppliers() {
        return this.availableSuppliers;
    }
    
    // Get supplier by ID
    getSupplier(gangId) {
        return CONFIG.GANG_AFFILIATIONS[gangId];
    }
    
    // Get loyalty for a supplier
    getLoyalty(gangId) {
        return this.supplierRelations[gangId] || 0;
    }
    
    // Modify loyalty
    modifyLoyalty(gangId, amount) {
        if (this.supplierRelations[gangId] === undefined) {
            this.supplierRelations[gangId] = 1;
        }
        
        this.supplierRelations[gangId] = Math.max(0, 
            Math.min(CONFIG.MAX_LOYALTY, this.supplierRelations[gangId] + amount));
        
        return this.supplierRelations[gangId];
    }
    
    // Calculate price for a supplier
    getPrice(gangId, basePrice = CONFIG.RAW_MATERIAL_COST) {
        const gang = this.getSupplier(gangId);
        if (!gang) return basePrice;
        
        const loyaltyBonus = this.getLoyalty(gangId) >= CONFIG.LOYALTY_THRESHOLD ? 0.9 : 1.0;
        return Math.floor(basePrice * gang.priceMultiplier * loyaltyBonus);
    }
    
    // Calculate quality bonus for a supplier
    getQuality(gangId) {
        const gang = this.getSupplier(gangId);
        if (!gang) return 1.0;
        
        const loyaltyBonus = this.getLoyalty(gangId) >= CONFIG.LOYALTY_THRESHOLD ? 0.1 : 0;
        return gang.productQuality + loyaltyBonus;
    }
    
    // Start a meeting with a supplier
    startMeeting(gangId) {
        const gang = this.getSupplier(gangId);
        if (!gang) return false;
        
        this.activeSupplier = gang;
        this.isMeeting = true;
        return true;
    }
    
    // End the meeting
    endMeeting() {
        this.activeSupplier = null;
        this.isMeeting = false;
    }
    
    // Get random greeting
    getGreeting(gangId) {
        const gang = this.getSupplier(gangId);
        if (!gang) return "Need supplies?";
        
        const greetings = gang.greetings || this.defaultGreetings;
        return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    // Get random farewell
    getFarewell(gangId) {
        const gang = this.getSupplier(gangId);
        if (!gang) return "Get out of here.";
        
        const farewells = gang.farewells || this.defaultFarewells;
        return farewells[Math.floor(Math.random() * farewells.length)];
    }
    
    // Get dialog based on context
    getDialog(gangId, context = 'buy') {
        const gang = this.getSupplier(gangId);
        if (!gang) return "Let's do business.";
        
        const loyalty = this.getLoyalty(gangId);
        const dialog = gang.dialog || {};
        
        // Adjust context based on loyalty
        if (loyalty < 2 && context === 'buy') {
            return dialog.warning || this.defaultWarningDialog[Math.floor(Math.random() * this.defaultWarningDialog.length)];
        } else if (loyalty >= CONFIG.LOYALTY_THRESHOLD) {
            return dialog.loyalty || this.defaultLoyaltyDialog[Math.floor(Math.random() * this.defaultLoyaltyDialog.length)];
        }
        
        const contextDialog = dialog[context] || this.defaultBuyDialog[Math.floor(Math.random() * this.defaultBuyDialog.length)];
        return contextDialog;
    }
    
    // Get all supplier summaries
    getSupplierSummaries() {
        return Object.entries(this.supplierRelations).map(([gangId, loyalty]) => {
            const gang = this.getSupplier(gangId);
            return {
                id: gangId,
                name: gang.name,
                fullName: gang.fullName,
                loyalty: loyalty,
                quality: this.getQuality(gangId),
                price: this.getPrice(gangId),
                dangerLevel: gang.dangerLevel,
                meetingLocation: gang.meetingLocation
            };
        });
    }
    
    // Check if supplier is available
    isSupplierAvailable(gangId) {
        return this.availableSuppliers.some(s => s.id === gangId);
    }
    
    // Get current active supplier
    getActiveSupplier() {
        return this.activeSupplier;
    }
    
    // Handle new day - decay loyalty for missed meetings
    onNewDay() {
        let decayCount = 0;
        let decayedSuppliers = [];
        
        for (const gangId of Object.keys(this.supplierRelations)) {
            // Only decay if not at max loyalty
            if (this.supplierRelations[gangId] < CONFIG.MAX_LOYALTY) {
                const oldLoyalty = this.supplierRelations[gangId];
                this.supplierRelations[gangId] = Math.max(0, 
                    this.supplierRelations[gangId] - CONFIG.SUPPLIER_CONFIG.LOYALTY_DECAY_PER_MISS);
                
                // Track if loyalty actually decayed
                if (this.supplierRelations[gangId] < oldLoyalty) {
                    decayCount++;
                    const gang = this.getSupplier(gangId);
                    if (gang) {
                        decayedSuppliers.push(gang.name);
                    }
                }
            }
        }
        
        // Show HUD notification if any supplier loyalty decayed
        if (decayCount > 0 && this.scene && this.scene.showFloatingText) {
            const supplierList = decayedSuppliers.slice(0, 3).join(', ');
            const moreText = decayedSuppliers.length > 3 ? ` and ${decayCount - 3} more` : '';
            this.scene.showFloatingText(
                `Supplier Loyalty Decayed: ${supplierList}${moreText}`,
                0xffaa00 // Orange/warning color
            );
        }
        
        return { decayCount, decayedSuppliers };
    }
}
