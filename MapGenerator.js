import { CONFIG } from './config.js';

// ============================================================
// THE DOCKS - WORLD BUILDING
// ============================================================
// A comprehensive spatial design system for The Docks underworld
// Organized by neighborhoods, factions, POIs, and contested zones

// Neighborhood definitions - each has unique tiles, atmosphere, and faction presence
export const NEIGHBORHOODS = {
    RIVERSIDE: {
        name: 'Riverside',
        description: "A small, impoverished town on the outskirts. The gateway to The Docks. Player starts here.",
        tiles: { main: 'tile-dirt', border: 'tile-wall-wood', accent: 'tile-concrete-cracked' },
        factions: [], // No major factions - player builds their network here
        dangerLevel: 2, // Relatively safe - starting area
        atmosphere: 'impoverished',
        color: '#556B2F',
        isStartingArea: true
    },
    OLD_TOWN: {
        name: 'Old Town',
        description: "Victorian district with brownstones and hidden wine cellars. The Don and Rook's domain.",
        tiles: { main: 'tile-brick-dark', border: 'tile-wall-brick', accent: 'tile-wood-floor' },
        factions: ['The Don', 'Rook'],
        dangerLevel: 2, // 1-5 scale
        atmosphere: 'elegant',
        color: '#8B4513'
    },
    SKID_ROW: {
        name: 'Skid Row',
        description: "Desperate alleyways and abandoned SROs. The desperate gather here.",
        tiles: { main: 'tile-alley', border: 'tile-wall-rusty', accent: 'tile-concrete-cracked' },
        factions: ['Viper', 'Blaze'],
        dangerLevel: 5,
        atmosphere: 'desperate',
        color: '#4a4a4a'
    },
    THE_FLATS: {
        name: 'The Flats',
        description: "Low-income housing blocks and the Salvage Yard. Survival is the only law.",
        tiles: { main: 'tile-concrete-cracked', border: 'tile-wall-concrete', accent: 'tile-dirty-floor' },
        factions: ['Fang', 'Blaze'],
        dangerLevel: 4,
        atmosphere: 'scavenged',
        color: '#696969'
    },
    IRONWORKS: {
        name: 'Ironworks',
        description: "Old shipyard and auto repair shops along the waterfront. Grease and blood.",
        tiles: { main: 'tile-concrete', border: 'tile-wall-metal', accent: 'tile-metal-floor' },
        factions: ['Iron'],
        dangerLevel: 3,
        atmosphere: 'industrial',
        color: '#2F4F4F'
    },
    THE_HARBOR: {
        name: 'The Harbor',
        description: "Houseboats, docked ships, and camps on abandoned piers. Storm's domain.",
        tiles: { main: 'tile-wood-floor', border: 'tile-wall-wood', accent: 'tile-plank' },
        factions: ['Storm', 'Frost'],
        dangerLevel: 3,
        atmosphere: 'nomadic',
        color: '#4682B4'
    },
    THE_MAW: {
        name: 'The Maw',
        description: "Underground tunnels and abandoned subway stations beneath Old Town.",
        tiles: { main: 'tile-stone-dark', border: 'tile-wall-stone', accent: 'tile-grate' },
        factions: ['Shade'],
        dangerLevel: 4,
        atmosphere: 'underground',
        color: '#1a1a2e'
    },
    INDUSTRIAL_ZONE: {
        name: 'Industrial Zone',
        description: "Factories, warehouses, and the decommissioned power plant. Razor's arms operation.",
        tiles: { main: 'tile-concrete', border: 'tile-wall-factory', accent: 'tile-metal-floor' },
        factions: ['Razor', 'Frost'],
        dangerLevel: 4,
        atmosphere: 'hazardous',
        color: '#3d3d3d'
    },
    SALVAGE_YARD: {
        name: 'Salvage Yard',
        description: "Mountains of scrap metal and discarded treasures. Fang's territory.",
        tiles: { main: 'tile-dirt', border: 'tile-wall-rusty', accent: 'tile-scrap' },
        factions: ['Fang'],
        dangerLevel: 3,
        atmosphere: 'ramshackle',
        color: '#8B7355'
    },
    
    // ============================================================
    // BIG CITY - THE DOCKS PROPER
    // ============================================================
    // New neighborhoods for the expanded Big City (The Docks proper)
    // These unlock after the player is arrested and transported from Riverside
    
    DOWNTOWN: {
        name: 'Downtown',
        description: "The heart of Big City. Skyscrapers, corporate headquarters, and heavy police presence. The real game begins here.",
        tiles: { main: 'tile-concrete', border: 'tile-wall-glass', accent: 'tile-tile-floor' },
        factions: [], // Corporate influence, not gang territory
        dangerLevel: 3,
        atmosphere: 'corporate',
        color: '#1a1a3e',
        isDowntown: true
    },
    DOWNTOWN_EXPANSION: {
        name: 'Downtown East',
        description: "Eastern business district with mixed-use developments and transit hubs.",
        tiles: { main: 'tile-concrete', border: 'tile-wall-brick', accent: 'tile-tile-floor' },
        factions: [],
        dangerLevel: 2,
        atmosphere: 'commercial',
        color: '#2e2e5e'
    },
    WAREHOUSE_DISTRICT: {
        name: 'Warehouse District',
        description: "Old industrial area being converted to lofts and art studios. Transitional zone.",
        tiles: { main: 'tile-concrete', border: 'tile-wall-metal', accent: 'tile-metal-floor' },
        factions: ['Frost'],
        dangerLevel: 3,
        atmosphere: 'transitional',
        color: '#4a4a6a'
    },
    RIVERSIDE_PRISON: {
        name: 'State Prison',
        description: "Big City State Penitentiary - where the player starts after arrest. Maximum security.",
        tiles: { main: 'tile-stone-dark', border: 'tile-wall-concrete', accent: 'tile-concrete' },
        factions: [], // No factions inside prison
        dangerLevel: 5,
        atmosphere: 'carceral',
        color: '#2f2f2f',
        isPrison: true,
        isStartingArea: true
    }
};

// Faction headquarters - where each faction operates from
export const FACTION_HQ = {
    'The Don': {
        neighborhood: 'OLD_TOWN',
        description: "Moretti Estate - a disguised Victorian mansion with wine cellars hiding cargo",
        tile: 'tile-wood-floor',
        color: '#8B4513'
    },
    'Viper': {
        neighborhood: 'SKID_ROW',
        description: "The Lab - abandoned SRO converted to a pharmaceutical research facility",
        tile: 'tile-concrete-cracked',
        color: '#9ACD32'
    },
    'Rook': {
        neighborhood: 'OLD_TOWN',
        description: "The Crown - underground casino hidden behind a Brownian storefront",
        tile: 'tile-wood-floor',
        color: '#FFD700'
    },
    'Ghost': {
        neighborhood: 'THE_MAW',
        description: "Unknown - they operate from everywhere and nowhere",
        tile: 'tile-stone-dark',
        color: '#2F2F2F'
    },
    'Iron': {
        neighborhood: 'IRONWORKS',
        description: "Ironworks Auto - a massive chop shop in an old shipyard warehouse",
        tile: 'tile-metal-floor',
        color: '#708090'
    },
    'Fang': {
        neighborhood: 'SALVAGE_YARD',
        description: "The Warren - a network of converted shipping containers and trailers",
        tile: 'tile-dirt',
        color: '#CD853F'
    },
    'Storm': {
        neighborhood: 'THE_HARBOR',
        description: "The Drift - a fleet of houseboats anchored at the abandoned pier",
        tile: 'tile-plank',
        color: '#00CED1'
    },
    'Shade': {
        neighborhood: 'THE_MAW',
        description: "The Catacombs - tunnels dating back to the city's founding",
        tile: 'tile-stone-dark',
        color: '#4B0082'
    },
    'Blaze': {
        neighborhood: 'SKID_ROW',
        description: "The Kitchen - a fortified meth lab in an abandoned warehouse",
        tile: 'tile-concrete',
        color: '#FF4500'
    },
    'Frost': {
        neighborhood: 'THE_HARBOR',
        description: "Cold Storage - a network of refrigerated containers at the port",
        tile: 'tile-concrete',
        color: '#E0FFFF'
    },
    'Razor': {
        neighborhood: 'INDUSTRIAL_ZONE',
        description: "The Armory - former military depot turned weapons manufacturing",
        tile: 'tile-metal-floor',
        color: '#C0C0C0'
    },
    'Byte': {
        neighborhood: 'OLD_TOWN',
        description: "The Network - hidden server rooms beneath a laundromat",
        tile: 'tile-wood-floor',
        color: '#00FF00'
    }
};

// Points of Interest - landmarks, dangerous areas, secret passages
export const POINTS_OF_INTEREST = {
    // Abandoned buildings
    'Abandoned Hotel': {
        type: 'building',
        description: "A crumbling SRO hotel - perfect for desperate deals or hiding",
        tile: 'tile-alley',
        dangerLevel: 4,
        usable: true
    },
    'Burned-out Store': {
        type: 'building',
        description: "Fire gutted this shop - now just ash and shadows",
        tile: 'tile-concrete-cracked',
        dangerLevel: 3,
        usable: true
    },
    'Old Pharmacy': {
        type: 'building',
        description: "Abandoned pharmacy - Viper sometimes sources chemicals from here",
        tile: 'tile-dirty-floor',
        dangerLevel: 3,
        usable: true
    },
    'Defunct Factory': {
        type: 'building',
        description: "Shell of an old factory - Razor's people scout for scrap metal",
        tile: 'tile-concrete',
        dangerLevel: 4,
        usable: true
    },
    'Abandoned Warehouse': {
        type: 'building',
        description: "Empty warehouse - good for large deals",
        tile: 'tile-concrete',
        dangerLevel: 3,
        usable: true
    },
    'Old Laundromat': {
        type: 'building',
        description: "Abandoned laundromat - Byte's people sometimes operate from here",
        tile: 'tile-wood-floor',
        dangerLevel: 2,
        usable: true
    },
    'Auto Shop': {
        type: 'building',
        description: "Abandoned auto repair shop - Iron's territory nearby",
        tile: 'tile-concrete',
        dangerLevel: 3,
        usable: true
    },
    
    // Hidden locations
    'Hidden Alley': {
        type: 'passage',
        description: "A narrow passage between buildings - perfect for evading pursuit",
        tile: 'tile-alley',
        dangerLevel: 2,
        usable: true
    },
    'Secret Door': {
        type: 'passage',
        description: "Disguised entrance to Shade's tunnel network",
        tile: 'tile-stone-dark',
        dangerLevel: 2,
        usable: true
    },
    'Rooftop Access': {
        type: 'passage',
        description: "Fire escape leading to the roofs - high ground for observation",
        tile: 'tile-concrete',
        dangerLevel: 2,
        usable: true
    },
    'Sewer Entrance': {
        type: 'passage',
        description: "Grate leading down into the Maw's tunnel network",
        tile: 'tile-grate',
        dangerLevel: 3,
        usable: true
    },
    'Subway Platform': {
        type: 'passage',
        description: "Abandoned subway station platform - a hub for Shade's network",
        tile: 'tile-stone-dark',
        dangerLevel: 2,
        usable: true
    },
    'Utility Tunnel': {
        type: 'passage',
        description: "Narrow maintenance tunnel connecting different sections of the underground",
        tile: 'tile-stone-dark',
        dangerLevel: 2,
        usable: true
    },
    'Steam Tunnel': {
        type: 'passage',
        description: "Old steam pipes creates a maze of metallic passages",
        tile: 'tile-metal-floor',
        dangerLevel: 3,
        usable: true
    },
    'Catacombs': {
        type: 'passage',
        description: "Ancient burial tunnels extend deep beneath the city",
        tile: 'tile-stone-dark',
        dangerLevel: 4,
        usable: true
    },
    'Maintenance Shaft': {
        type: 'passage',
        description: "Vertical shaft connecting multiple underground levels",
        tile: 'tile-grate',
        dangerLevel: 3,
        usable: true
    },
    
    // Waterfront
    'Abandoned Pier': {
        type: 'waterfront',
        description: "Rotting pier - Storm uses this for dead drops",
        tile: 'tile-plank',
        dangerLevel: 3,
        usable: true
    },
    'Boat Yard': {
        type: 'waterfront',
        description: "Sunken and derelict vessels - Iron strips what he can",
        tile: 'tile-wood-floor',
        dangerLevel: 3,
        usable: true
    },
    'Container Stack': {
        type: 'waterfront',
        description: "Maze of shipping containers - Frost hides product here",
        tile: 'tile-concrete',
        dangerLevel: 3,
        usable: true
    },
    
    // Danger zones
    'Drug Corner': {
        type: 'danger',
        description: "Blaze's people sell here - violent and unpredictable",
        tile: 'tile-concrete-cracked',
        dangerLevel: 5,
        usable: false
    },
    'Gang Turf': {
        type: 'danger',
        description: "Marked territory - crossing means trouble",
        tile: 'tile-alley',
        dangerLevel: 4,
        usable: false
    },
    'Police Patrol': {
        type: 'danger',
        description: "Frequent police presence - keep your head down",
        tile: 'tile-sidewalk',
        dangerLevel: 3,
        usable: false
    },
    
    // Neutral/Useful
    '24/7 Diner': {
        type: 'service',
        description: "The only place in The Docks with hot food and no questions",
        tile: 'tile-wood-floor',
        dangerLevel: 1,
        usable: true
    },
    'Pawn Shop': {
        type: 'service',
        description: "Fences stolen goods - Fang's people bring their finds here",
        tile: 'tile-dirty-floor',
        dangerLevel: 2,
        usable: true
    },
    'Street Vendor': {
        type: 'service',
        description: "Hot dog cart - decent food, excellent intel",
        tile: 'tile-sidewalk',
        dangerLevel: 2,
        usable: true
    },
    'Payphone': {
        type: 'service',
        description: "Working payphone - Ghost uses these for dead drops",
        tile: 'tile-sidewalk',
        dangerLevel: 2,
        usable: true
    },

    // ============================================================
    // BIG CITY - THE DOCKS PROPER POIs
    // ============================================================
    // New locations for the expanded Big City (unlocked after raid/arrest)
    
    // Law Enforcement
    'Metro Police Station': {
        type: 'service',
        name: 'Metro Police Station',
        description: "Big City's main police precinct. Bureaucratic, overworked, but dangerous. Don't get on their radar.",
        tile: 'tile-concrete',
        dangerLevel: 3,
        usable: true,
        locationType: 'police',
        hours: { open: 0, close: 24 },
        isMainPlugQuestHub: false,
        neighborhood: 'DOWNTOWN'
    },
    'SWAT Headquarters': {
        type: 'service',
        name: 'SWAT Headquarters',
        description: "Metro SWAT Division - elite tactical unit. They don't patrol; they raid. Extremely dangerous.",
        tile: 'tile-concrete',
        dangerLevel: 5,
        usable: false,
        locationType: 'police',
        hours: { open: 0, close: 24 },
        isMainPlugQuestHub: false,
        neighborhood: 'DOWNTOWN'
    },
    'Big City Prison': {
        type: 'service',
        name: 'Big City State Penitentiary',
        description: "Maximum security prison. You wake up here after arrest. The start of your new life.",
        tile: 'tile-stone-dark',
        dangerLevel: 5,
        usable: true,
        locationType: 'prison',
        hours: { open: 0, close: 24 },
        isMainPlugQuestHub: false,
        isPrison: true,
        neighborhood: 'RIVERSIDE_PRISON'
    },
    
    // Government
    'City Hall': {
        type: 'service',
        name: 'City Hall',
        description: "Big City municipal building. Permits, licenses, and corruption. The bureaucratic heart of the city.",
        tile: 'tile-tile-floor',
        dangerLevel: 2,
        usable: true,
        locationType: 'government',
        hours: { open: 9, close: 17 },
        isMainPlugQuestHub: false,
        neighborhood: 'DOWNTOWN'
    },
    'Courthouse': {
        type: 'service',
        name: 'Courthouse',
        description: "Big City Courthouse - where trials happen. If you're summoned, it's bad news.",
        tile: 'tile-tile-floor',
        dangerLevel: 2,
        usable: true,
        locationType: 'government',
        hours: { open: 9, close: 17 },
        isMainPlugQuestHub: false,
        neighborhood: 'DOWNTOWN'
    },
    
    // Downtown Services
    'Downtown Bank': {
        type: 'service',
        name: 'First National Bank',
        description: "Downtown branch of First National. High security, but they handle large transactions.",
        tile: 'tile-tile-floor',
        dangerLevel: 2,
        usable: true,
        locationType: 'bank',
        hours: { open: 9, close: 16 },
        isMainPlugQuestHub: false,
        neighborhood: 'DOWNTOWN'
    },
    'Downtown Hotel': {
        type: 'building',
        name: 'Grand Hotel',
        description: "Luxury hotel in the downtown core. Expensive, but safe. Meeting place for high rollers.",
        tile: 'tile-wood-floor',
        dangerLevel: 1,
        usable: true,
        locationType: 'hotel',
        isMainPlugQuestHub: false,
        neighborhood: 'DOWNTOWN'
    },
    'Corporate Office': {
        type: 'building',
        name: 'Nexus Tower',
        description: "Major corporation headquarters. The suits don't deal with street-level criminals... officially.",
        tile: 'tile-tile-floor',
        dangerLevel: 2,
        usable: true,
        locationType: 'corporate',
        isMainPlugQuestHub: false,
        neighborhood: 'DOWNTOWN'
    },
    
    // Warehouse District
    'Abandoned Warehouse Big': {
        type: 'building',
        name: 'Warehouse 42',
        description: "Massive abandoned warehouse in the warehouse district. Perfect for large-scale operations.",
        tile: 'tile-concrete',
        dangerLevel: 3,
        usable: true,
        locationType: 'warehouse',
        isMainPlugQuestHub: false,
        neighborhood: 'WAREHOUSE_DISTRICT'
    },
    'Storage Facility': {
        type: 'service',
        name: 'Secure Storage',
        description: "Climate-controlled storage units. Rent one to stash your product safely.",
        tile: 'tile-concrete',
        dangerLevel: 2,
        usable: true,
        locationType: 'storage',
        isMainPlugQuestHub: false,
        neighborhood: 'WAREHOUSE_DISTRICT'
    },
    
    // Downtown East
    'Transit Hub': {
        type: 'service',
        name: 'Central Station',
        description: "Big City's main transit hub. Trains, buses, and crowds. Good for blending in.",
        tile: 'tile-concrete',
        dangerLevel: 3,
        usable: true,
        locationType: 'transit',
        hours: { open: 5, close: 23 },
        isMainPlugQuestHub: false,
        neighborhood: 'DOWNTOWN_EXPANSION'
    },
    'Food Court': {
        type: 'service',
        name: 'City Food Court',
        description: "Downtown food court with multiple restaurants. Good spot for casual meetings.",
        tile: 'tile-tile-floor',
        dangerLevel: 1,
        usable: true,
        locationType: 'food',
        hours: { open: 10, close: 21 },
        isMainPlugQuestHub: false,
        neighborhood: 'DOWNTOWN_EXPANSION'
    },

    // ============================================================
    // RIVERSIDE - Starting Area POIs
    // ============================================================
    
    // Houses - Residential buildings (5-8 homes)
    'Riverside House 1': {
        type: 'building',
        description: "A run-down wooden house. Home to the O'Brien family.",
        tile: 'tile-wood-floor',
        dangerLevel: 1,
        usable: true,
        locationType: 'residence',
        npc: 'obrien-family',
        questAvailable: true
    },
    'Riverside House 2': {
        type: 'building',
        description: "Small clapboard house with peeling paint.",
        tile: 'tile-wood-floor',
        dangerLevel: 1,
        usable: true,
        locationType: 'residence',
        questAvailable: true
    },
    'Riverside House 3': {
        type: 'building',
        description: "Abandoned house, windows boarded up.",
        tile: 'tile-dirty-floor',
        dangerLevel: 2,
        usable: true,
        locationType: 'residence',
        questAvailable: false
    },
    'Riverside House 4': {
        type: 'building',
        description: "Small cottage with a rusted fence.",
        tile: 'tile-wood-floor',
        dangerLevel: 1,
        usable: true,
        locationType: 'residence',
        questAvailable: true
    },
    'Riverside House 5': {
        type: 'building',
        description: "House with a broken porch step.",
        tile: 'tile-wood-floor',
        dangerLevel: 1,
        usable: true,
        locationType: 'residence',
        questAvailable: true
    },
    'Riverside House 6': {
        type: 'building',
        description: "Family home with laundry out back.",
        tile: 'tile-wood-floor',
        dangerLevel: 1,
        usable: true,
        locationType: 'residence',
        questAvailable: true
    },
    'Riverside House 7': {
        type: 'building',
        description: "Older man's place - collects bottles.",
        tile: 'tile-wood-floor',
        dangerLevel: 1,
        usable: true,
        locationType: 'residence',
        npc: 'bottle-collector',
        questAvailable: true
    },
    'Riverside House 8': {
        type: 'building',
        description: "Empty house, for sale sign in yard.",
        tile: 'tile-dirty-floor',
        dangerLevel: 1,
        usable: true,
        locationType: 'residence',
        questAvailable: false
    },
    
    // Convenience Store - 24/7 shop
    'Riverside Convenience Store': {
        type: 'service',
        description: "Quick-Mart: 24/7 convenience store. Run by Mr. Kim.",
        tile: 'tile-concrete',
        dangerLevel: 1,
        usable: true,
        locationType: 'shop',
        npc: 'kim-shopkeeper',
        shopInventory: ['Weed Plants', 'Mushroom Spores', 'Supplies'],
        questAvailable: true,
        isMainPlugQuestHub: true
    },
    
    // Knock-off Walmart
    'MartMart': {
        type: 'service',
        description: "MartMart - 'If we don't have it, you don't need it.' Impoverished's Walmart.",
        tile: 'tile-concrete',
        dangerLevel: 2,
        usable: true,
        locationType: 'store',
        npc: 'martmart-employee',
        shopInventory: ['All supplies', 'Weed Plants'],
        questAvailable: true
    },
    
    // Eating Places
    'Riverside Diner': {
        type: 'service',
        description: "Sally's Diner - Best burgers in Riverside. Open 6AM-10PM.",
        tile: 'tile-wood-floor',
        dangerLevel: 1,
        usable: true,
        locationType: 'restaurant',
        npc: 'sally-diner',
        shopInventory: ['Food', 'Intel'],
        questAvailable: true,
        hours: { open: 6, close: 22 }
    },
    'Taco Truck': {
        type: 'service',
        description: "El Fuego Taco Truck - Parked on Main Street.",
        tile: 'tile-sidewalk',
        dangerLevel: 1,
        usable: true,
        locationType: 'food-truck',
        npc: 'taco-vendor',
        shopInventory: ['Food', 'Supplies'],
        questAvailable: true,
        hours: { open: 11, close: 21 }
    },
    'Pizza Joint': {
        type: 'service',
        description: " Luigi's Pizza - Cash only, no questions.",
        tile: 'tile-wood-floor',
        dangerLevel: 1,
        usable: true,
        locationType: 'restaurant',
        npc: 'luigi-pizza',
        shopInventory: ['Food', 'Supplies'],
        questAvailable: true
    },
    
    // Gas Station
    'Riverside Gas & Go': {
        type: 'service',
        description: "Gas & Go - Fuel, snacks, and lottery tickets.",
        tile: 'tile-concrete',
        dangerLevel: 2,
        usable: true,
        locationType: 'gas-station',
        npc: 'gas-attendant',
        shopInventory: ['Fuel', 'Supplies', 'Weed Plants'],
        questAvailable: true,
        isMainPlugQuestHub: true
    },
    
    // Pharmacy
    'Riverside Pharmacy': {
        type: 'service',
        description: "Riverside Pharmacy - 'We have what you need.' For medical backstory.",
        tile: 'tile-dirty-floor',
        dangerLevel: 1,
        usable: true,
        locationType: 'pharmacy',
        npc: 'pharmacist',
        shopInventory: ['Medical Supplies', 'Weed Plants'],
        questAvailable: true,
        isMainPlugQuestHub: true
    },
    
    // Police Station - Law enforcement in Riverside
    'Riverside Police Station': {
        type: 'service',
        description: "Riverside Police Station - Chief Thompson runs a tight ship. Stay on their good side.",
        tile: 'tile-concrete',
        dangerLevel: 2,
        usable: true,
        locationType: 'police',
        npc: 'chief-thompson',
        questAvailable: false, // Police don't give quests initially
        hours: { open: 0, close: 24 }, // 24/7 operation
        isLawEnforcement: true // Special flag for police interactions
    },
    
    // Train Station - Gateway to The Docks
    'Riverside Train Station': {
        type: 'passage',
        description: "The Train Station - Your ticket to The Docks. Departs daily at 8AM and 6PM.",
        tile: 'tile-concrete',
        dangerLevel: 1,
        usable: true,
        locationType: 'transport',
        isTransportHub: true,
        destination: 'THE_HARBOR',
        travelTime: '30 minutes',
        questAvailable: true,
        isMainPlugQuestHub: true
    },
    
    // Homeless/Street NPCs
    'Street Person': {
        type: 'npc',
        description: "A homeless person resting in the alley. Might have useful intel.",
        tile: 'tile-alley',
        dangerLevel: 2,
        usable: true,
        locationType: 'street-npc',
        npc: 'homeless-person',
        questAvailable: true
    },
    
    // Drug Labs - discoverable production facilities
    'Weed Grow House': {
        type: 'lab',
        description: "Indoor cannabis operation - yields +25% bonus",
        tile: 'tile-wood-floor',
        dangerLevel: 1,
        usable: true,
        labType: 'Weed Grow House',
        yieldsBonus: 0.25,
        color: '#4CAF50'
    },
    'Mushroom Room': {
        type: 'lab',
        description: "Climate-controlled mushroom cultivation - yields +20% bonus",
        tile: 'tile-stone-dark',
        dangerLevel: 2,
        usable: true,
        labType: 'Mushroom Room',
        yieldsBonus: 0.20,
        color: '#9C27B0'
    },
    'Cocaine Lab': {
        type: 'lab',
        description: "Cocaine processing lab - yields +35% bonus (HIGH HEAT)",
        tile: 'tile-concrete',
        dangerLevel: 4,
        usable: true,
        labType: 'Cocaine Lab',
        yieldsBonus: 0.35,
        color: '#FFFFFF'
    },
    'Crack House': {
        type: 'lab',
        description: "Crack cooking operation - yields +40% bonus (EXTREME DANGER)",
        tile: 'tile-concrete-cracked',
        dangerLevel: 5,
        usable: true,
        labType: 'Crack House',
        yieldsBonus: 0.40,
        color: '#FF9800'
    },
    'Meth Lab': {
        type: 'lab',
        description: "Meth synthesis lab - yields +50% bonus (MOST VALUABLE)",
        tile: 'tile-metal-floor',
        dangerLevel: 5,
        usable: true,
        labType: 'Meth Lab',
        yieldsBonus: 0.50,
        color: '#F44336'
    },
    'MDMA Lab': {
        type: 'lab',
        description: "MDMA synthesis lab - yields +30% bonus",
        tile: 'tile-concrete',
        dangerLevel: 3,
        usable: true,
        labType: 'MDMA Lab',
        yieldsBonus: 0.30,
        color: '#E91E63'
    }
};

// Lab POI types for filtering (to match neighborhood preferences)
export const LAB_POI_TYPES = [
    'Weed Grow House',
    'Mushroom Room', 
    'Cocaine Lab',
    'Crack House',
    'Meth Lab',
    'MDMA Lab'
];

// Map lab types to their preferred neighborhoods
export const LAB_NEIGHBORHOOD_MAP = {
    'Weed Grow House': ['THE_FLATS', 'INDUSTRIAL_ZONE', 'SALVAGE_YARD'],
    'Mushroom Room': ['THE_MAW', 'SKID_ROW', 'THE_FLATS'],
    'Cocaine Lab': ['OLD_TOWN', 'THE_HARBOR', 'INDUSTRIAL_ZONE'],
    'Crack House': ['SKID_ROW', 'THE_FLATS'],
    'Meth Lab': ['INDUSTRIAL_ZONE', 'SKID_ROW', 'THE_MAW'],
    'MDMA Lab': ['OLD_TOWN', 'THE_HARBOR', 'INDUSTRIAL_ZONE']
};

// Contested zones - areas where factions fight for control
export const CONTESTED_ZONES = {
    'Skid Row Border': {
        factions: ['Viper', 'Blaze'],
        description: "Viper and Blaze clash over drug territory here",
        dangerLevel: 5,
        frequency: 3
    },
    'The Flats Edge': {
        factions: ['Fang', 'Blaze'],
        description: "Blaze pushes into Fang's scavenging territory",
        dangerLevel: 4,
        frequency: 3
    },
    'Harbor Industrial': {
        factions: ['Frost', 'Storm'],
        description: "Competing smuggling operations create tension",
        dangerLevel: 4,
        frequency: 2
    },
    'Old Town Underground': {
        factions: ['Shade', 'Rook'],
        description: "Underground economies collide beneath Old Town",
        dangerLevel: 4,
        frequency: 2
    },
    'Ironworks Shore': {
        factions: ['Iron', 'Frost'],
        description: "Competition for waterfront space and routes",
        dangerLevel: 3,
        frequency: 2
    },
    'Industrial Border': {
        factions: ['Razor', 'Frost'],
        description: "Weapons and smuggling routes overlap",
        dangerLevel: 4,
        frequency: 2
    }
};

// Street names - to make the world feel lived-in
export const STREET_NAMES = [
    // Riverside - Small town/impoverished
    "Main Street", "River Road", "Old Mill Lane", "Park Avenue",
    "First Street", "Second Street", "Railroad Ave", "Bridge Way",
    "Elm Street", "Oak Street", "Maple Drive", "Cedar Lane",
    "School House Road", "Church Street", "Town Square", "Station Road",
    // Old Town - Victorian/elegant
    "Moretti Way", "Thornwood Lane", "Crown Street", "Brownian Ave",
    "Victorian Row", "Heritage Lane", "Estate Drive", "Wine Cellar Alley",
    // Skid Row - desperate/gritty
    "Needle Lane", "Hopeless St", "Withdrawal Ave", "Desperation Alley",
    "SRO Row", "Broken Window Way", "Rust Belt Road", "Fallen Star Street",
    // The Flats - working class
    "Flatline Ave", "Scrap Heap Lane", "Salvage Road", "Foundry Street",
    "Housing Block Way", "Community Ave", "Survivor Lane", "Scavenger Alley",
    // Ironworks - industrial
    "Forge Road", "Welding Way", "Grease Monkey Lane", "Shipyard Ave",
    "Chop Shop Circle", "Rusty Anchor Rd", "Machine Shop St", "Scrap Metal Ave",
    // The Harbor - nautical
    "Pier Street", "Dock Worker Lane", "Anchor Way", "Tidewater Ave",
    "Houseboat Harbor", "Captain's Walk", "Net Mender Lane", "Wharf Road",
    // The Maw - underground
    "Tunnel Way", "Catacomb Lane", "Subway Shadow St", "Underground Ave",
    "Lost Passage", "Echo Chamber Alley", "Stone Cold Lane", "Dark Way",
    // Industrial Zone - factory
    "Power Plant Road", "Warehouse Way", "Smokestack Lane", "Assembly Ave",
    "Generator Road", "Transformer Lane", "Factory Floor St", "Decommission Rd",
    // The Docks general
    "The Docks Main", "Waterfront Ave", "Cargo Way", "Harbor Road"
];

// Generate neighborhood grid for world map (used for world-level navigation)
export function generateNeighborhoodGrid(gridWidth, gridHeight) {
    const grid = [];
    
    // Layout neighborhoods in a semi-realistic geographic arrangement
    // Northwest: Old Town (elite)
    // Northeast: Industrial Zone
    // Southwest: The Flats, Skid Row
    // Southeast: Harbor, Ironworks, Salvage Yard
    // Underground: The Maw (accessible from multiple locations)
    // Starting Area: Riverside (gateway to The Docks, player starts here)
    
    const layout = [
        // Row 0 (top) - Entry from Riverside
        ['RIVERSIDE', 'OLD_TOWN', 'OLD_TOWN', 'INDUSTRIAL_ZONE', 'INDUSTRIAL_ZONE'],
        // Row 1
        ['RIVERSIDE', 'OLD_TOWN', 'THE_MAW', 'INDUSTRIAL_ZONE', 'INDUSTRIAL_ZONE'],
        // Row 2
        ['RIVERSIDE', 'SKID_ROW', 'THE_FLATS', 'INDUSTRIAL_ZONE', 'THE_HARBOR'],
        // Row 3
        ['RIVERSIDE', 'SKID_ROW', 'THE_FLATS', 'SALVAGE_YARD', 'THE_HARBOR'],
        // Row 4
        ['RIVERSIDE', 'SKID_ROW', 'THE_FLATS', 'IRONWORKS', 'THE_HARBOR']
    ];
    
    for (let y = 0; y < gridHeight; y++) {
        grid[y] = [];
        for (let x = 0; x < gridWidth; x++) {
            // Map to layout with some randomization
            const layoutY = Math.min(Math.floor(y / (gridHeight / layout.length)), layout.length - 1);
            const layoutX = Math.min(Math.floor(x / (gridWidth / layout[0].length)), layout[0].length - 1);
            
            let neighborhoodKey = layout[layoutY][layoutX];
            
            // Add some noise/variation
            if (Math.random() < 0.15) {
                // Blend into neighboring neighborhood
                const neighbors = [];
                if (y > 0) neighbors.push(layout[y-1]?.[layoutX]);
                if (y < gridHeight - 1) neighbors.push(layout[y+1]?.[layoutX]);
                if (x > 0) neighbors.push(layout[layoutY]?.[layoutX-1]);
                if (x < gridWidth - 1) neighbors.push(layout[layoutY]?.[layoutX+1]);
                const validNeighbors = neighbors.filter(n => n);
                if (validNeighbors.length > 0) {
                    neighborhoodKey = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
                }
            }
            
            grid[y][x] = {
                neighborhood: NEIGHBORHOODS[neighborhoodKey],
                key: neighborhoodKey,
                x: x,
                y: y,
                // Add POIs with low probability
                poi: Math.random() < 0.08 ? getRandomPOI() : null,
                // Mark contested zones
                contested: isContestedZone(x, y)
            };
        }
    }
    
    return grid;
}

function isContestedZone(x, y) {
    // Define contested zones by approximate grid locations
    const contestedLocations = [
        { x: 1, y: 2, radius: 1, key: 'Skid Row Border' },
        { x: 1, y: 3, radius: 1, key: 'The Flats Edge' },
        { x: 3, y: 2, radius: 1, key: 'Harbor Industrial' },
        { x: 1, y: 1, radius: 1, key: 'Old Town Underground' },
        { x: 3, y: 4, radius: 1, key: 'Ironworks Shore' },
        { x: 2, y: 1, radius: 1, key: 'Industrial Border' }
    ];
    
    for (const zone of contestedLocations) {
        const dist = Math.sqrt(Math.pow(x - zone.x, 2) + Math.pow(y - zone.y, 2));
        if (dist <= zone.radius) {
            return CONTESTED_ZONES[zone.key];
        }
    }
    return null;
}

function getRandomPOI() {
    const poiKeys = Object.keys(POINTS_OF_INTEREST);
    const key = poiKeys[Math.floor(Math.random() * poiKeys.length)];
    return { key, ...POINTS_OF_INTEREST[key] };
}

// Environmental object definitions for procedural placement
// Organized by category and suitable map types

export const ENVIRONMENTAL_OBJECTS = {
    // Street/Urban Objects - for outdoor/block maps
    street: [
        { name: 'street-lamp', sprite: 'street-lamp', walkable: false, blocks: true },
        { name: 'fire-hydrant', sprite: 'fire-hydrant', walkable: false, blocks: true },
        { name: 'trash-can-metal', sprite: 'trash-can-metal', walkable: false, blocks: true },
        { name: 'dumpster-closed', sprite: 'dumpster-closed', walkable: false, blocks: true },
        { name: 'dumpster-open', sprite: 'dumpster-open', walkable: false, blocks: true },
        { name: 'cardboard-box-scattered', sprite: 'cardboard-box-scattered', walkable: true, blocks: false },
        { name: 'shopping-cart', sprite: 'shopping-cart', walkable: false, blocks: true },
        { name: 'park-bench', sprite: 'park-bench', walkable: false, blocks: true },
        { name: 'newspaper-stand', sprite: 'newspaper-stand', walkable: false, blocks: true },
        { name: 'phone-booth', sprite: 'phone-booth', walkable: false, blocks: true },
        { name: 'mailbox', sprite: 'mailbox', walkable: false, blocks: true },
        { name: 'traffic-cone', sprite: 'traffic-cone', walkable: true, blocks: false },
        { name: 'barricade', sprite: 'barricade', walkable: false, blocks: true },
        { name: 'fence-section', sprite: 'fence-section', walkable: false, blocks: true },
        { name: 'guard-rail', sprite: 'guard-rail', walkable: false, blocks: true },
        { name: 'pothole', sprite: 'pothole', walkable: true, blocks: false },
    ],
    // Vehicles - for outdoor/block maps
    vehicles: [
        { name: 'car-sedan', sprite: 'car-sedan', walkable: false, blocks: true },
        { name: 'car-suv', sprite: 'car-suv', walkable: false, blocks: true },
        { name: 'van-cargo', sprite: 'van-cargo', walkable: false, blocks: true },
        { name: 'motorcycle', sprite: 'motorcycle', walkable: false, blocks: true },
        { name: 'truck-delivery', sprite: 'truck-delivery', walkable: false, blocks: true },
        { name: 'bicycle', sprite: 'bicycle', walkable: true, blocks: false },
    ],
    // Urban Details - for both map types
    urban: [
        { name: 'graffiti-wall', sprite: 'graffiti-wall', walkable: true, blocks: false, isDecoration: true },
        { name: 'broken-window', sprite: 'broken-window', walkable: true, blocks: false },
        { name: 'brick-wall', sprite: 'brick-wall', walkable: true, blocks: false, isDecoration: true },
        { name: 'faded-paint', sprite: 'faded-paint', walkable: true, blocks: false, isDecoration: true },
        { name: 'steam-vent', sprite: 'steam-vent', walkable: true, blocks: false },
        { name: 'manhole-cover', sprite: 'manhole-cover', walkable: true, blocks: false },
        { name: 'sprinkler', sprite: 'sprinkler', walkable: true, blocks: false },
        { name: 'pool-water', sprite: 'pool-water', walkable: true, blocks: false },
        { name: 'oil-stain', sprite: 'oil-stain', walkable: true, blocks: false },
    ],
    // Indoor/Safehouse Objects - for traphouse maps
    indoor: [
        { name: 'mattress', sprite: 'mattress', walkable: true, blocks: false },
        { name: 'old-chair', sprite: 'old-chair', walkable: true, blocks: false },
        { name: 'table', sprite: 'table', walkable: false, blocks: true },
        { name: 'crates', sprite: 'crates', walkable: false, blocks: true },
        { name: 'barrels', sprite: 'barrels', walkable: false, blocks: true },
        { name: 'lockers', sprite: 'lockers', walkable: false, blocks: true },
        { name: 'safe', sprite: 'safe', walkable: false, blocks: true },
        { name: 'scale', sprite: 'scale', walkable: true, blocks: false },
        { name: 'burner-phone', sprite: 'burner-phone', walkable: true, blocks: false },
        { name: 'cash-pile', sprite: 'cash-pile', walkable: true, blocks: false },
    ],
    // Nature Objects - for outdoor maps
    nature: [
        { name: 'dead-tree', sprite: 'dead-tree', walkable: false, blocks: true },
        { name: 'bushes', sprite: 'bushes', walkable: false, blocks: true },
        { name: 'weeds', sprite: 'weeds', walkable: true, blocks: false },
        { name: 'puddle', sprite: 'puddle', walkable: true, blocks: false },
    ]
};

// Flatten all objects for easy lookup
export const ALL_ENVIRONMENTAL_OBJECTS = [
    ...ENVIRONMENTAL_OBJECTS.street,
    ...ENVIRONMENTAL_OBJECTS.vehicles,
    ...ENVIRONMENTAL_OBJECTS.urban,
    ...ENVIRONMENTAL_OBJECTS.indoor,
    ...ENVIRONMENTAL_OBJECTS.nature
];

// Get object config by name
export function getEnvironmentalObject(name) {
    return ALL_ENVIRONMENTAL_OBJECTS.find(obj => obj.name === name);
}

// Get random objects suitable for a map type
export function getRandomObjectsForMap(mapType, count, excludeNames = []) {
    let pool;
    
    if (mapType === 'block') {
        // Outdoor block maps get street, vehicles, urban, and nature objects
        pool = [
            ...ENVIRONMENTAL_OBJECTS.street,
            ...ENVIRONMENTAL_OBJECTS.vehicles,
            ...ENVIRONMENTAL_OBJECTS.urban,
            ...ENVIRONMENTAL_OBJECTS.nature
        ];
    } else {
        // Indoor traphouse maps get indoor and urban objects
        pool = [
            ...ENVIRONMENTAL_OBJECTS.indoor,
            ...ENVIRONMENTAL_OBJECTS.urban
        ];
    }
    
    // Filter out excluded names
    pool = pool.filter(obj => !excludeNames.includes(obj.name));
    
    // Shuffle and pick
    const shuffled = pool.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

export default class MapGenerator {
    constructor(scene, biomeType, options = {}) {
        this.scene = scene;
        this.biomeType = biomeType; // 'block' or 'traphouse'
        this.seed = Math.random();
        
        // NEW: Spatial design options
        this.neighborhood = options.neighborhood || null; // Neighborhood key (e.g., 'OLD_TOWN', 'SKID_ROW')
        this.faction = options.faction || null; // Primary faction for this map
        this.includeHQ = options.includeHQ !== false; // Whether to place faction HQ
        this.includePOIs = options.includePOIs !== false; // Whether to place Points of Interest
        this.isContested = options.isContested || false; // Whether this is a contested zone
    }
    
    // Simple seeded random for consistent generation
    seededRandom(min = 0, max = 1) {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        const rnd = this.seed / 233280;
        return min + rnd * (max - min);
    }
    
    generate() {
        if (this.biomeType === 'block') {
            return this.generateBlock();
        } else {
            return this.generateTrapHouse();
        }
    }
    
    generateBlock() {
        // Outdoor alley environment - now with neighborhood-specific tiles
        const map = [];
        const objects = [];
        
        // Get neighborhood config if specified
        const neighborhood = this.neighborhood ? NEIGHBORHOODS[this.neighborhood] : null;
        const defaultMainTile = neighborhood?.tiles?.main || 'tile-alley';
        const defaultBorderTile = neighborhood?.tiles?.border || 'tile-wall-brick';
        
        // Initialize with neighborhood-appropriate floor tiles
        for (let y = 0; y < CONFIG.GRID_HEIGHT; y++) {
            map[y] = [];
            for (let x = 0; x < CONFIG.GRID_WIDTH; x++) {
                map[y][x] = {
                    type: defaultMainTile,
                    walkable: true,
                    neighborhood: this.neighborhood
                };
            }
        }
        
        // Add neighborhood-appropriate borders
        for (let x = 0; x < CONFIG.GRID_WIDTH; x++) {
            map[0][x] = { type: defaultBorderTile, walkable: false };
            map[CONFIG.GRID_HEIGHT - 1][x] = { type: defaultBorderTile, walkable: false };
        }
        
        for (let y = 0; y < CONFIG.GRID_HEIGHT; y++) {
            map[y][0] = { type: defaultBorderTile, walkable: false };
            map[y][CONFIG.GRID_WIDTH - 1] = { type: defaultBorderTile, walkable: false };
        }
        
        // Add neighborhood-specific tile variations
        this.addNeighborhoodTiles(map, neighborhood);
        
        // Add dumpsters as obstacles
        for (let i = 0; i < 5; i++) {
            const x = Math.floor(this.seededRandom(3, CONFIG.GRID_WIDTH - 4));
            const y = Math.floor(this.seededRandom(3, CONFIG.GRID_HEIGHT - 4));
            
            if (map[y][x].walkable) {
                objects.push({
                    type: 'dumpster',
                    x: x,
                    y: y,
                    walkable: false
                });
                map[y][x].walkable = false;
            }
        }
        
        // === NEW: Place random environmental objects ===
        this.placeRandomEnvironmentalObjects(map, objects, 'block');
        
        // === NEW: Place faction headquarters if applicable ===
        if (this.includeHQ && this.faction && FACTION_HQ[this.faction]) {
            this.placeFactionHQ(map, objects, this.faction);
        }
        
        // === NEW: Place Points of Interest ===
        if (this.includePOIs) {
            this.placePointsOfInterest(map, objects, neighborhood);
        }
        
        // === NEW: Mark contested zones ===
        if (this.isContested) {
            this.addContestedZoneMarkers(map, objects);
        }
        
        // Place safehouse (cardboard box) in a safe spot
        const safehouseX = Math.floor(CONFIG.GRID_WIDTH / 4);
        const safehouseY = Math.floor(CONFIG.GRID_HEIGHT / 2);
        
        objects.push({
            type: 'safehouse',
            x: safehouseX,
            y: safehouseY,
            walkable: true
        });
        
        // Return comprehensive map data including spatial info
        return { 
            map, 
            objects, 
            safehousePos: { x: safehouseX, y: safehouseY },
            // NEW: Include spatial design data
            spatial: {
                neighborhood: this.neighborhood,
                neighborhoodData: neighborhood,
                faction: this.faction,
                isContested: this.isContested,
                dangerLevel: neighborhood?.dangerLevel || 3,
                atmosphere: neighborhood?.atmosphere || 'neutral'
            }
        };
    }
    
    /**
     * Add neighborhood-specific tile variations
     */
    addNeighborhoodTiles(map, neighborhood) {
        if (!neighborhood) {
            // Default: add cracked concrete and sidewalks
            this.addDefaultTileVariations(map);
            return;
        }
        
        const accentTile = neighborhood.tiles?.accent || 'tile-concrete-cracked';
        const atmosphere = neighborhood.atmosphere;
        
        // Different tile patterns based on neighborhood atmosphere
        switch (atmosphere) {
            case 'impoverished':
                // Riverside: Small town - dirt, cracked concrete, wood
                this.addTilePatches(map, 'tile-dirt', 8, 2, 4);
                this.addTilePatches(map, 'tile-concrete-cracked', 8, 2, 4);
                this.addTilePatches(map, 'tile-wood-floor', 6, 2, 3);
                this.addTilePatches(map, 'tile-sidewalk', 6, 2, 3);
                break;
                
            case 'elegant':
                // Old Town: Wood floors, polished surfaces
                this.addTilePatches(map, 'tile-wood-floor', 8, 3, 5);
                this.addTilePatches(map, 'tile-brick-dark', 5, 2, 4);
                break;
                
            case 'desperate':
                // Skid Row: Cracked concrete, dirt, desperation
                this.addTilePatches(map, 'tile-concrete-cracked', 12, 3, 6);
                this.addTilePatches(map, 'tile-dirty-floor', 8, 2, 4);
                break;
                
            case 'scavenged':
                // The Flats: Mixed surfaces, dirt paths
                this.addTilePatches(map, 'tile-dirt', 10, 2, 5);
                this.addTilePatches(map, 'tile-scrap', 6, 2, 3);
                break;
                
            case 'industrial':
                // Ironworks: Concrete, metal
                this.addTilePatches(map, 'tile-concrete', 10, 3, 5);
                this.addTilePatches(map, 'tile-metal-floor', 6, 2, 4);
                break;
                
            case 'nomadic':
                // The Harbor: Wood planks, weathered surfaces
                this.addTilePatches(map, 'tile-plank', 10, 2, 5);
                this.addTilePatches(map, 'tile-wood-floor', 6, 2, 4);
                break;
                
            case 'underground':
                // The Maw: Dark stone, grates
                this.addTilePatches(map, 'tile-stone-dark', 12, 3, 6);
                this.addTilePatches(map, 'tile-grate', 4, 1, 3);
                break;
                
            case 'hazardous':
                // Industrial Zone: Toxic surfaces
                this.addTilePatches(map, 'tile-concrete', 10, 3, 5);
                this.addTilePatches(map, 'tile-metal-floor', 6, 2, 4);
                break;
                
            case 'ramshackle':
                // Salvage Yard: Dirt, scrap
                this.addTilePatches(map, 'tile-dirt', 12, 3, 6);
                this.addTilePatches(map, 'tile-scrap', 8, 2, 4);
                break;
                
            default:
                this.addDefaultTileVariations(map);
        }
        
        // Always add sidewalks for navigability
        this.addTilePatches(map, 'tile-sidewalk', 6, 3, 5);
    }
    
    /**
     * Add default tile variations (used when no neighborhood specified)
     */
    addDefaultTileVariations(map) {
        // Add some cracked concrete patches (walkable)
        for (let i = 0; i < 15; i++) {
            const x = Math.floor(this.seededRandom(2, CONFIG.GRID_WIDTH - 2));
            const y = Math.floor(this.seededRandom(2, CONFIG.GRID_HEIGHT - 2));
            const width = Math.floor(this.seededRandom(2, 5));
            const height = Math.floor(this.seededRandom(2, 5));
            
            for (let dy = 0; dy < height; dy++) {
                for (let dx = 0; dx < width; dx++) {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx < CONFIG.GRID_WIDTH - 1 && ny < CONFIG.GRID_HEIGHT - 1) {
                        map[ny][nx] = { type: 'tile-concrete-cracked', walkable: true };
                    }
                }
            }
        }
        
        // Add some sidewalk areas
        for (let i = 0; i < 8; i++) {
            const x = Math.floor(this.seededRandom(2, CONFIG.GRID_WIDTH - 2));
            const y = Math.floor(this.seededRandom(2, CONFIG.GRID_HEIGHT - 2));
            const width = Math.floor(this.seededRandom(3, 6));
            const height = Math.floor(this.seededRandom(3, 6));
            
            for (let dy = 0; dy < height; dy++) {
                for (let dx = 0; dx < width; dx++) {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx < CONFIG.GRID_WIDTH - 1 && ny < CONFIG.GRID_HEIGHT - 1) {
                        map[ny][nx] = { type: 'tile-sidewalk', walkable: true };
                    }
                }
            }
        }
    }
    
    /**
     * Add patches of a specific tile type
     */
    addTilePatches(map, tileType, count, minSize, maxSize) {
        for (let i = 0; i < count; i++) {
            const x = Math.floor(this.seededRandom(2, CONFIG.GRID_WIDTH - 2));
            const y = Math.floor(this.seededRandom(2, CONFIG.GRID_HEIGHT - 2));
            const width = Math.floor(this.seededRandom(minSize, maxSize));
            const height = Math.floor(this.seededRandom(minSize, maxSize));
            
            for (let dy = 0; dy < height; dy++) {
                for (let dx = 0; dx < width; dx++) {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx < CONFIG.GRID_WIDTH - 1 && ny < CONFIG.GRID_HEIGHT - 1) {
                        map[ny][nx] = { type: tileType, walkable: true, neighborhood: this.neighborhood };
                    }
                }
            }
        }
    }
    
    /**
     * Place faction headquarters on the map
     */
    placeFactionHQ(map, objects, factionName) {
        const hq = FACTION_HQ[factionName];
        if (!hq) return;
        
        // Place HQ in a prominent but not central location
        const hqX = Math.floor(this.seededRandom(3, CONFIG.GRID_WIDTH - 5));
        const hqY = Math.floor(this.seededRandom(3, CONFIG.GRID_HEIGHT - 5));
        
        // Create a small building footprint (3x3)
        const hqSize = 3;
        for (let dy = -1; dy <= hqSize - 2; dy++) {
            for (let dx = -1; dx <= hqSize - 2; dx++) {
                const nx = hqX + dx;
                const ny = hqY + dy;
                if (nx > 0 && nx < CONFIG.GRID_WIDTH - 1 && ny > 0 && ny < CONFIG.GRID_HEIGHT - 1) {
                    // Mark as faction territory
                    map[ny][nx].faction = factionName;
                    map[ny][nx].hq = true;
                }
            }
        }
        
        // Add the HQ object
        objects.push({
            type: 'faction-hq',
            faction: factionName,
            x: hqX,
            y: hqY,
            description: hq.description,
            walkable: true,
            interactive: true
        });
        
            }
    
    /**
     * Place Points of Interest on the map
     */
    placePointsOfInterest(map, objects, neighborhood) {
        // Determine number of POIs based on neighborhood danger and type
        // Increased from 2-5 to 3-6 for more building entry opportunities
        let numPOIs = Math.floor(this.seededRandom(3, 7));
        
        // Higher chance of POIs in contested zones
        if (this.isContested) {
            numPOIs += Math.floor(this.seededRandom(1, 3));
        }
        
        const availablePOIs = Object.entries(POINTS_OF_INTEREST).filter(([key, poi]) => {
            // Filter by neighborhood compatibility if specified
            if (neighborhood) {
                // Allow all POIs in generic areas, but filter in specific neighborhoods
                const allowedTypes = this.getAllowedPOITypes(neighborhood);
                return allowedTypes.includes(poi.type);
            }
            // Only allow usable POIs (buildings, passages, services) - not danger zones
            return poi.usable === true;
        });
        
        for (let i = 0; i < numPOIs && i < availablePOIs.length; i++) {
            const x = Math.floor(this.seededRandom(3, CONFIG.GRID_WIDTH - 4));
            const y = Math.floor(this.seededRandom(3, CONFIG.GRID_HEIGHT - 4));
            
            // Check if position is valid
            if (!map[y] || !map[y][x] || !map[y][x].walkable) continue;
            
            // Check if there's already an object here
            const existingObject = objects.find(o => o.x === x && o.y === y);
            if (existingObject) continue;
            
            // Pick a random POI
            const poiIndex = Math.floor(this.seededRandom(0, availablePOIs.length));
            const [poiKey, poiData] = availablePOIs[poiIndex];
            
            // Don't place danger POIs too close to safehouse
            const safehouseX = Math.floor(CONFIG.GRID_WIDTH / 4);
            const safehouseY = Math.floor(CONFIG.GRID_HEIGHT / 2);
            const distToSafehouse = Math.abs(x - safehouseX) + Math.abs(y - safehouseY);
            
            if (poiData.type === 'danger' && distToSafehouse < 5) continue;
            
            // Create the POI object
            const poi = {
                type: 'poi',
                poiKey: poiKey,
                poiType: poiData.type,
                x: x,
                y: y,
                description: poiData.description,
                walkable: poiData.usable,
                interactive: poiData.usable,
                dangerLevel: poiData.dangerLevel
            };
            
            objects.push(poi);
            
            // Mark the tile
            if (!poiData.usable) {
                map[y][x].walkable = false;
            }
            map[y][x].poi = poiKey;
            
            // Remove used POI from available
            availablePOIs.splice(poiIndex, 1);
        }
        
        // === NEW: Spawn labs as special POIs using LAB_TYPES from config ===
        this.spawnLabPOIs(map, objects, neighborhood);
    }
    
    /**
     * Spawn lab POIs randomly on the map using LAB_TYPES from config
     */
    spawnLabPOIs(map, objects, neighborhood) {
        // Determine number of labs to spawn (0-2 labs)
        const numLabs = Math.floor(this.seededRandom(0, 3));
        
        if (numLabs === 0) return;
        
        // Get lab types from CONFIG
        const labTypes = Object.keys(CONFIG.LAB_TYPES);
        
        for (let i = 0; i < numLabs; i++) {
            // Pick a random lab type
            const labTypeName = labTypes[Math.floor(this.seededRandom(0, labTypes.length))];
            const labConfig = CONFIG.LAB_TYPES[labTypeName];
            
            // Check neighborhood compatibility if specified
            if (neighborhood) {
                const preferredNeighborhoods = LAB_NEIGHBORHOOD_MAP[labTypeName] || [];
                if (!preferredNeighborhoods.includes(this.neighborhood)) {
                    // Skip this lab type for this neighborhood
                    continue;
                }
            }
            
            // Find a valid position on the map
            const x = Math.floor(this.seededRandom(3, CONFIG.GRID_WIDTH - 4));
            const y = Math.floor(this.seededRandom(3, CONFIG.GRID_HEIGHT - 4));
            
            // Check if position is valid
            if (!map[y] || !map[y][x] || !map[y][x].walkable) continue;
            
            // Check if there's already an object here
            const existingObject = objects.find(o => o.x === x && o.y === y);
            if (existingObject) continue;
            
            // Don't place labs too close to safehouse
            const safehouseX = Math.floor(CONFIG.GRID_WIDTH / 4);
            const safehouseY = Math.floor(CONFIG.GRID_HEIGHT / 2);
            const distToSafehouse = Math.abs(x - safehouseX) + Math.abs(y - safehouseY);
            
            if (distToSafehouse < 5) continue;
            
            // Create the lab POI object
            const labPOI = {
                type: 'poi',
                poiKey: labTypeName,
                poiType: 'lab',
                x: x,
                y: y,
                description: labConfig.description,
                walkable: true,
                interactive: true,
                dangerLevel: labConfig.riskLevel,
                // Lab-specific properties
                labType: labTypeName,
                produces: labConfig.produces,
                yieldBonus: labConfig.yieldBonus,
                heatGain: labConfig.heatGain,
                sprite: labConfig.sprite,
                color: labConfig.color
            };
            
            objects.push(labPOI);
            
            // Mark the tile
            map[y][x].poi = labTypeName;
            map[y][x].lab = labTypeName;
        }
    }
    
    /**
     * Get allowed POI types for a neighborhood
     */
    getAllowedPOITypes(neighborhood) {
        const typeMap = {
            'RIVERSIDE': ['building', 'passage', 'service', 'npc'], // Starting area - all types
            'OLD_TOWN': ['building', 'passage', 'service'],
            'SKID_ROW': ['building', 'danger', 'passage'],
            'THE_FLATS': ['building', 'service', 'danger'],
            'IRONWORKS': ['building', 'waterfront', 'danger'],
            'THE_HARBOR': ['waterfront', 'passage', 'building'],
            'THE_MAW': ['passage', 'building'],
            'INDUSTRIAL_ZONE': ['building', 'danger', 'waterfront'],
            'SALVAGE_YARD': ['building', 'service', 'danger']
        };
        
        return typeMap[this.neighborhood] || ['building', 'passage', 'service', 'danger'];
    }
    
    /**
     * Add contested zone markers to the map
     */
    addContestedZoneMarkers(map, objects) {
        // Add warning markers in contested areas
        const numMarkers = Math.floor(this.seededRandom(3, 6));
        
        for (let i = 0; i < numMarkers; i++) {
            const x = Math.floor(this.seededRandom(2, CONFIG.GRID_WIDTH - 2));
            const y = Math.floor(this.seededRandom(2, CONFIG.GRID_HEIGHT - 2));
            
            if (!map[y] || !map[y][x] || !map[y][x].walkable) continue;
            
            // Add a contested zone marker object
            objects.push({
                type: 'contested-marker',
                x: x,
                y: y,
                walkable: true,
                interactive: false,
                description: "Contested territory - enter with caution"
            });
            
            map[y][x].contested = true;
        }
    }
    
    generateTrapHouse() {
        // Female character - indoor trap house
        const map = [];
        const objects = [];
        
        // Initialize with dirty floors
        for (let y = 0; y < CONFIG.GRID_HEIGHT; y++) {
            map[y] = [];
            for (let x = 0; x < CONFIG.GRID_WIDTH; x++) {
                map[y][x] = {
                    type: 'tile-dirty-floor',
                    walkable: true
                };
            }
        }
        
        // Add interior walls as borders
        for (let x = 0; x < CONFIG.GRID_WIDTH; x++) {
            map[0][x] = { type: 'tile-wall-interior', walkable: false };
            map[CONFIG.GRID_HEIGHT - 1][x] = { type: 'tile-wall-interior', walkable: false };
        }
        
        for (let y = 0; y < CONFIG.GRID_HEIGHT; y++) {
            map[y][0] = { type: 'tile-wall-interior', walkable: false };
            map[y][CONFIG.GRID_WIDTH - 1] = { type: 'tile-wall-interior', walkable: false };
        }
        
        // Create rooms with hallways
        // Vertical hallway
        const hallwayX = Math.floor(CONFIG.GRID_WIDTH / 2);
        for (let y = 1; y < CONFIG.GRID_HEIGHT - 1; y++) {
            map[y][hallwayX] = { type: 'tile-wood-floor', walkable: true };
            if (hallwayX > 0) map[y][hallwayX - 1] = { type: 'tile-wood-floor', walkable: true };
            if (hallwayX < CONFIG.GRID_WIDTH - 1) map[y][hallwayX + 1] = { type: 'tile-wood-floor', walkable: true };
        }
        
        // Horizontal hallway
        const hallwayY = Math.floor(CONFIG.GRID_HEIGHT / 2);
        for (let x = 1; x < CONFIG.GRID_WIDTH - 1; x++) {
            map[hallwayY][x] = { type: 'tile-wood-floor', walkable: true };
            if (hallwayY > 0) map[hallwayY - 1][x] = { type: 'tile-wood-floor', walkable: true };
        }
        
        // Add some room dividers (interior walls)
        // Top-left room
        for (let x = 5; x < 10; x++) {
            if (x !== hallwayX) {
                map[6][x] = { type: 'tile-wall-interior', walkable: false };
            }
        }
        
        // Bottom-right room
        for (let x = CONFIG.GRID_WIDTH - 10; x < CONFIG.GRID_WIDTH - 5; x++) {
            if (x !== hallwayX) {
                map[CONFIG.GRID_HEIGHT - 7][x] = { type: 'tile-wall-interior', walkable: false };
            }
        }
        
        // Add some wood floor rooms
        for (let i = 0; i < 6; i++) {
            const x = Math.floor(this.seededRandom(3, CONFIG.GRID_WIDTH - 5));
            const y = Math.floor(this.seededRandom(3, CONFIG.GRID_HEIGHT - 5));
            const width = Math.floor(this.seededRandom(3, 6));
            const height = Math.floor(this.seededRandom(3, 6));
            
            for (let dy = 0; dy < height; dy++) {
                for (let dx = 0; dx < width; dx++) {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx < CONFIG.GRID_WIDTH - 1 && ny < CONFIG.GRID_HEIGHT - 1 && 
                        map[ny][nx].type !== 'tile-wall-interior') {
                        map[ny][nx] = { type: 'tile-wood-floor', walkable: true };
                    }
                }
            }
        }
        
        // === NEW: Place random environmental objects ===
        this.placeRandomEnvironmentalObjects(map, objects, 'traphouse');
        
        // Place safehouse (cardboard box) near the entrance
        const safehouseX = 3;
        const safehouseY = 3;
        
        // Make sure safehouse area is clear
        map[safehouseY][safehouseX] = { type: 'tile-wood-floor', walkable: true };
        
        objects.push({
            type: 'safehouse',
            x: safehouseX,
            y: safehouseY,
            walkable: true
        });
        
        return { map, objects, safehousePos: { x: safehouseX, y: safehouseY } };
    }
    
    /**
     * Place random environmental objects on the map
     * @param {Array} map - The map grid
     * @param {Array} objects - Array to add objects to
     * @param {string} mapType - 'block' or 'traphouse'
     */
    placeRandomEnvironmentalObjects(map, objects, mapType) {
        // Determine number of objects based on map type
        const numObjects = mapType === 'block' 
            ? Math.floor(this.seededRandom(15, 30))  // More objects for outdoor maps
            : Math.floor(this.seededRandom(8, 15));   // Fewer for indoor
        
        // Get objects suitable for this map type
        const availableObjects = mapType === 'block'
            ? [...ENVIRONMENTAL_OBJECTS.street, ...ENVIRONMENTAL_OBJECTS.vehicles, 
                ...ENVIRONMENTAL_OBJECTS.urban, ...ENVIRONMENTAL_OBJECTS.nature]
            : [...ENVIRONMENTAL_OBJECTS.indoor, ...ENVIRONMENTAL_OBJECTS.urban];
        
        // Place objects randomly
        let placed = 0;
        let attempts = 0;
        const maxAttempts = numObjects * 10; // Prevent infinite loop
        
        while (placed < numObjects && attempts < maxAttempts) {
            attempts++;
            
            const x = Math.floor(this.seededRandom(2, CONFIG.GRID_WIDTH - 2));
            const y = Math.floor(this.seededRandom(2, CONFIG.GRID_HEIGHT - 2));
            
            // Check if position is valid and walkable
            if (!map[y] || !map[y][x] || !map[y][x].walkable) {
                continue;
            }
            
            // Check if there's already an object here
            const existingObject = objects.find(o => o.x === x && o.y === y);
            if (existingObject) {
                continue;
            }
            
            // Pick a random object type
            const objIndex = Math.floor(this.seededRandom(0, availableObjects.length));
            const objTemplate = availableObjects[objIndex];
            
            // Don't block corridors or the safehouse area
            const safehouseX = Math.floor(CONFIG.GRID_WIDTH / 4);
            const safehouseY = Math.floor(CONFIG.GRID_HEIGHT / 2);
            const distToSafehouse = Math.abs(x - safehouseX) + Math.abs(y - safehouseY);
            
            // For block maps, also avoid center corridor area
            const isCenterCorridor = mapType === 'block' && 
                (Math.abs(x - CONFIG.GRID_WIDTH/2) < 3 || Math.abs(y - CONFIG.GRID_HEIGHT/2) < 3);
            
            // Only place blocking objects away from safehouse and corridors
            if (objTemplate.blocks && (distToSafehouse < 5 || isCenterCorridor)) {
                continue;
            }
            
            // Create the object
            const newObject = {
                type: objTemplate.name,
                sprite: objTemplate.sprite,
                x: x,
                y: y,
                walkable: objTemplate.walkable,
                isDecoration: objTemplate.isDecoration || false
            };
            
            objects.push(newObject);
            
            // Mark the tile appropriately
            if (!objTemplate.walkable) {
                map[y][x].walkable = false;
            }
            
            placed++;
        }
        
            }
}

// ============================================================
// UTILITY FUNCTIONS FOR WORLD NAVIGATION
// ============================================================

/**
 * Get a random street name appropriate for a neighborhood
 */
export function getStreetName(neighborhoodKey = null) {
    const names = STREET_NAMES;
    if (!neighborhoodKey) {
        return names[Math.floor(Math.random() * names.length)];
    }
    
    // Filter by neighborhood if specified
    let filtered;
    switch (neighborhoodKey) {
        case 'RIVERSIDE':
            filtered = names.filter(n => 
                n.includes('Main') || n.includes('River') || 
                n.includes('Mill') || n.includes('Park') ||
                n.includes('Street') || n.includes('Road') ||
                n.includes('Avenue') || n.includes('Lane') ||
                n.includes('School') || n.includes('Church') ||
                n.includes('Station') || n.includes('Square')
            );
            break;
        case 'OLD_TOWN':
            filtered = names.filter(n => 
                n.includes('Moretti') || n.includes('Thornwood') || 
                n.includes('Crown') || n.includes('Brownian') ||
                n.includes('Victorian') || n.includes('Heritage') ||
                n.includes('Estate') || n.includes('Wine')
            );
            break;
        case 'SKID_ROW':
            filtered = names.filter(n => 
                n.includes('Needle') || n.includes('Hopeless') ||
                n.includes('Withdrawal') || n.includes('Desperation') ||
                n.includes('SRO') || n.includes('Broken') ||
                n.includes('Rust') || n.includes('Fallen')
            );
            break;
        case 'THE_FLATS':
            filtered = names.filter(n => 
                n.includes('Flatline') || n.includes('Scrap') ||
                n.includes('Salvage') || n.includes('Foundry') ||
                n.includes('Housing') || n.includes('Community') ||
                n.includes('Survivor') || n.includes('Scavenger')
            );
            break;
        case 'IRONWORKS':
            filtered = names.filter(n => 
                n.includes('Forge') || n.includes('Welding') ||
                n.includes('Grease') || n.includes('Shipyard') ||
                n.includes('Chop') || n.includes('Rusty') ||
                n.includes('Machine') || n.includes('Metal')
            );
            break;
        case 'THE_HARBOR':
            filtered = names.filter(n => 
                n.includes('Pier') || n.includes('Dock') ||
                n.includes('Anchor') || n.includes('Tidewater') ||
                n.includes('Houseboat') || n.includes('Captain') ||
                n.includes('Net') || n.includes('Wharf')
            );
            break;
        case 'THE_MAW':
            filtered = names.filter(n => 
                n.includes('Tunnel') || n.includes('Catacomb') ||
                n.includes('Subway') || n.includes('Underground') ||
                n.includes('Lost') || n.includes('Echo') ||
                n.includes('Stone') || n.includes('Dark')
            );
            break;
        case 'INDUSTRIAL_ZONE':
            filtered = names.filter(n => 
                n.includes('Power') || n.includes('Warehouse') ||
                n.includes('Smokestack') || n.includes('Assembly') ||
                n.includes('Generator') || n.includes('Transformer') ||
                n.includes('Factory') || n.includes('Decommission')
            );
            break;
        case 'SALVAGE_YARD':
            filtered = names.filter(n => 
                n.includes('Scrap') || n.includes('Salvage') ||
                n.includes('Junk') || n.includes('Salvage')
            );
            break;
        default:
            filtered = names;
    }
    
    return filtered.length > 0 
        ? filtered[Math.floor(Math.random() * filtered.length)]
        : names[Math.floor(Math.random() * names.length)];
}

/**
 * Get factions present in a neighborhood
 */
export function getFactionsInNeighborhood(neighborhoodKey) {
    const hood = NEIGHBORHOODS[neighborhoodKey];
    return hood ? hood.factions : [];
}

/**
 * Get faction HQ location info
 */
export function getFactionHQInfo(factionName) {
    return FACTION_HQ[factionName] || null;
}

/**
 * Get POI by key
 */
export function getPOI(poiKey) {
    return POINTS_OF_INTEREST[poiKey] || null;
}

/**
 * Check if a position is in a contested zone (world coordinates)
 */
export function isPositionContested(worldX, worldY, gridWidth = 4, gridHeight = 5) {
    const normalizedX = worldX / gridWidth;
    const normalizedY = worldY / gridHeight;
    
    for (const [key, zone] of Object.entries(CONTESTED_ZONES)) {
        // Approximate positions based on layout
        const zonePositions = {
            'Skid Row Border': { x: 0.25, y: 0.4 },
            'The Flats Edge': { x: 0.25, y: 0.6 },
            'Harbor Industrial': { x: 0.75, y: 0.4 },
            'Old Town Underground': { x: 0.25, y: 0.2 },
            'Ironworks Shore': { x: 0.75, y: 0.8 },
            'Industrial Border': { x: 0.5, y: 0.2 }
        };
        
        const pos = zonePositions[key];
        if (pos) {
            const dist = Math.sqrt(Math.pow(normalizedX - pos.x, 2) + Math.pow(normalizedY - pos.y, 2));
            if (dist < 0.25) {
                return { ...zone, key };
            }
        }
    }
    return null;
}

/**
 * Generate options for creating a neighborhood-specific map
 */
export function createMapOptions(neighborhood, faction = null, options = {}) {
    return {
        neighborhood: neighborhood,
        faction: faction,
        includeHQ: options.includeHQ !== false,
        includePOIs: options.includePOIs !== false,
        isContested: options.isContested || false
    };
}
