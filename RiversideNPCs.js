/**
 * RiversideNPCs.js - NPC definitions, schedules, and quest hooks for Riverside
 * Starting area for the game - player becomes "main plug" through these quests
 */

import { EventBus, EVENTS } from './EventBus.js';

// ============================================================
// RIVERSIDE NPC DEFINITIONS
// ============================================================

export const RIVERSIDE_NPCS = {
    // ============================================================
    // SHOP NPCs
    // ============================================================
    
    'kim-shopkeeper': {
        name: 'Mr. Kim',
        fullName: 'Sang-Min Kim',
        role: 'Convenience Store Owner',
        location: 'Riverside Convenience Store',
        description: 'Middle-aged Korean immigrant who runs the 24/7 Quick-Mart. Knows everyone in town.',
        sprite: 'npc-shop-owner',
        schedule: {
            // Mr. Kim is always at the store (24/7)
            default: { x: 5, y: 5 } // Store location
        },
        dialog: {
            greeting: [
                "Welcome to Quick-Mart! Anything I can help you find?",
                "Ah, our local entrepreneur! What can I do for you today?",
                "The usual supplies, or looking for something special?"
            ],
            quest: [
                "You know, I've been thinking... there's good money in the herb business.",
                "My cousin in The Docks can connect you with real suppliers.",
                "You seem reliable. I might have some... opportunities... for you."
            ],
            trade: [
                "I can get you weed plants. Best prices in Riverside.",
                "Need supplies? I know a guy who knows a guy."
            ]
        },
        questHub: true,
        quests: ['riverside_intro', 'riverside_first_delivery', 'riverside_become_plug']
    },
    
    'martmart-employee': {
        name: 'Wayne',
        fullName: 'Wayne Martinez',
        role: 'MartMart Floor Manager',
        location: 'MartMart',
        description: 'Tired-looking manager who has seen better days. Works at the local Walmart knockoff.',
        sprite: 'npc-shop-owner',
        schedule: {
            default: { x: 10, y: 5 } // MartMart location
        },
        dialog: {
            greeting: [
                "Welcome to MartMart. If we don't have it, you don't need it.",
                "Can I help you find something? Or are you just browsing?"
            ],
            quest: [
                "Between you and me... we throw out a lot of expired goods.",
                "The back room has some... salvageable items.",
                "Boss is always looking for people who can move product."
            ]
        }
    },
    
    'sally-diner': {
        name: 'Sally',
        fullName: 'Sally Thompson',
        role: 'Diner Owner/Cook',
        location: 'Riverside Diner',
        description: 'Late 50s, jolly cook who feeds the whole town. Gossip central.',
        sprite: 'npc-shop-owner',
        schedule: {
            // Sally opens at 6AM, closes at 10PM
            6: { x: 8, y: 8 },   // Opens diner
            12: { x: 8, y: 8 },  // Lunch rush
            18: { x: 8, y: 8 },  // Dinner
            22: { x: 8, y: 8 }   // Closes
        },
        dialog: {
            greeting: [
                "Sit down, hon! What can I get you?",
                "Coffee's hot, pie's fresh!",
                "You look like you've had a long day. Sit!"
            ],
            quest: [
                "You know, the gas station guy mentioned something interesting...",
                "My nephew in The Docks says there's big money in the business.",
                "People in this town... they need things. And you seem like a provider."
            ],
            intel: [
                "I hear the gas station attendant knows a guy...",
                "That pharmacist? Don't let the wholesome act fool you.",
                "The train to The Docks runs twice a day. 8AM and 6PM."
            ]
        }
    },
    
    'taco-vendor': {
        name: 'Carlos',
        fullName: 'Carlos Rodriguez',
        role: 'Taco Truck Owner',
        location: 'Main Street (Taco Truck)',
        description: 'Friendly taco vendor with connections to The Docks.',
        sprite: 'npc-vendor',
        schedule: {
            11: { x: 12, y: 6 }, // Sets up
            14: { x: 12, y: 6 }, // Lunch
            19: { x: 12, y: 6 }, // Dinner
            21: { x: 12, y: 6 }  // Closes
        },
        dialog: {
            greeting: [
                "¡Amigo! Tacos? Best in Riverside!",
                "What can I get you? Al pastor, carnitas, pastor..."
            ],
            quest: [
                "My brother runs a restaurant in The Docks. Might need supplies...",
                "You seem like someone who can... acquire things."
            ]
        }
    },
    
    'luigi-pizza': {
        name: 'Luigi',
        fullName: 'Luigi Bianchi',
        role: 'Pizza Shop Owner',
        location: "Luigi's Pizza",
        description: 'Italian immigrant who came to America for the dream. Makes excellent pizza.',
        sprite: 'npc-shop-owner',
        schedule: {
            default: { x: 9, y: 9 }
        },
        dialog: {
            greeting: [
                "Best pizza in Riverside! No lie!",
                "You want pizza? I make it fresh, every day!"
            ],
            quest: [
                "My suppliers... they can get things other places can't.",
                "The restaurant business in The Docks needs product."
            ]
        }
    },
    
    'gas-attendant': {
        name: 'Bud',
        fullName: 'Bud Henderson',
        role: 'Gas Station Attendant',
        location: 'Gas & Go',
        description: 'Retired trucker who works part-time at the gas station. Knows everyone passing through.',
        sprite: 'npc-shop-owner',
        schedule: {
            // Gas station is 24/7 but Bud works shifts
            default: { x: 11, y: 7 }
        },
        dialog: {
            greeting: [
                "Fill 'er up? Oh, you need supplies. Right this way.",
                "Welcome to Gas & Go. We got everything."
            ],
            quest: [
                "I've been in this business 30 years. I know a plug when I see one.",
                "Truckers coming through... they got needs. You could help.",
                "The big time is in The Docks. But you gotta start somewhere."
            ],
            trade: [
                "I can get you weed. Good stuff, local grown.",
                "Need supplies? I know people."
            ]
        },
        questHub: true,
        quests: ['riverside_gas_connection']
    },
    
    'pharmacist': {
        name: 'Dr. Chen',
        fullName: 'Dr. Margaret Chen',
        role: 'Pharmacist',
        location: 'Riverside Pharmacy',
        description: 'Former hospital pharmacist who opened a private pharmacy. Has a mysterious backstory.',
        sprite: 'npc-shop-owner',
        schedule: {
            default: { x: 13, y: 5 }
        },
        dialog: {
            greeting: [
                "Riverside Pharmacy. How can I help you?",
                "Do you have a prescription? No? That's fine."
            ],
            quest: [
                "Before I was a pharmacist... I worked in a hospital.",
                "The things I've seen... the things I've supplied...",
                "I know people in The Docks who need... particular items."
            ],
            trade: [
                "I can get you medical supplies. But that's not all...",
                "Weed? I can get you weed. Very good quality."
            ]
        },
        questHub: true,
        quests: ['riverside_pharmacy_connection']
    },
    
    // ============================================================
    // RESIDENTIAL NPCs
    // ============================================================
    
    'obrien-family': {
        name: 'Tom O\'Brien',
        fullName: 'Thomas O\'Brien',
        role: 'Factory Worker',
        location: 'Riverside House 1',
        description: 'Hard-working family man. Works at the factory in Industrial Zone.',
        sprite: 'npc-casual',
        schedule: {
            6: { x: 2, y: 3 },   // Leaves for work
            17: { x: 2, y: 3 }   // Returns home
        },
        dialog: {
            greeting: [
                "Morning! Beautiful day, isn't it?",
                "Just getting back from my shift."
            ],
            quest: [
                "My cousin in The Docks got into some trouble. Needs help.",
                "You seem connected. Could you help a family out?"
            ]
        }
    },
    
    'bottle-collector': {
        name: 'Old Man Jenkins',
        fullName: 'Walter Jenkins',
        role: 'Bottle Collector',
        location: 'Riverside House 7',
        description: 'Elderly man who collects bottles for extra cash. Knows all the town secrets.',
        sprite: 'npc-old-head',
        schedule: {
            8: { x: 4, y: 10 },  // Goes out collecting
            16: { x: 4, y: 10 }  // Returns home
        },
        dialog: {
            greeting: [
                "Bottles? Got any bottles?",
                "I've seen a lot in my years. A lot."
            ],
            quest: [
                "You want to know about the business? I know things...",
                "The train station... that's your ticket to bigger things.",
                "Everyone in this town owes someone. Except me. I'm neutral."
            ],
            intel: [
                "Sally at the diner knows everything.",
                "The gas station guy? He's got connections.",
                "MartMart throws out good stuff. Talk to Wayne."
            ]
        }
    },
    
    // ============================================================
    // STREET NPCs
    // ============================================================
    
    'homeless-person': {
        name: 'Shaky',
        fullName: 'Unknown',
        role: 'Homeless/Street Person',
        location: 'Various (Alley, Streets)',
        description: 'Mysterious homeless person who seems to know more than they let on.',
        sprite: 'npc-junkie',
        schedule: {
            8: { x: 6, y: 8 },   // Morning - often near diner
            14: { x: 10, y: 4 }, // Afternoon - near MartMart
            20: { x: 4, y: 6 }   // Evening - alley
        },
        dialog: {
            greeting: [
                "*nods* You got any spare change?",
                "I see things. Don't I just see things..."
            ],
            quest: [
                "I used to be someone. Before the fall.",
                "The pharmacy... Dr. Chen... she knows things.",
                "You want to make it big? Talk to Kim at the convenience store."
            ],
            intel: [
                "Train to The Docks leaves at 8AM and 6PM.",
                "MartMart back room... they throw away good stuff.",
                "Everyone's looking for a plug. Maybe that's you?"
            ]
        }
    },
    
    // ============================================================
    // TRANSPORT NPC
    // ============================================================
    
    'train-conductor': {
        name: 'Frank',
        fullName: 'Frank Morrison',
        role: 'Train Conductor',
        location: 'Riverside Train Station',
        description: 'Old railroad worker who operates the train to The Docks.',
        sprite: 'npc-shop-owner',
        schedule: {
            7: { x: 15, y: 8 },  // Preps train
            8: { x: 15, y: 8 },  // Departure 1
            17: { x: 15, y: 8 }, // Preps train 2
            18: { x: 15, y: 8 }  // Departure 2
        },
        dialog: {
            greeting: [
                "Ticket to The Docks? One-way or round-trip?",
                "All aboard! Next stop, The Harbor!"
            ],
            travel: [
                "The Docks is a rough place. You sure you want to go?",
                "Harbor's where the action is. But also the heat.",
                "I been driving this route 20 years. Seen a lot of kids go up there. Some come back. Some don't."
            ]
        }
    }
};

// ============================================================
// RIVERSIDE QUESTS - Main Quest Line
// ============================================================

export const RIVERSIDE_QUESTS = {
    // ============================================================
    // ACT 1: Introduction (Become Known)
    // ============================================================
    
    'riverside_intro': {
        id: 'riverside_intro',
        title: 'Getting Started',
        description: 'Talk to Mr. Kim at the convenience store to learn about opportunities in Riverside.',
        giver: 'kim-shopkeeper',
        location: 'Riverside Convenience Store',
        objectives: [
            { type: 'talk', target: 'kim-shopkeeper', description: 'Talk to Mr. Kim' }
        ],
        rewards: {
            cash: 50,
            items: ['Weed Plants'],
            unlock: ['riverside_first_delivery']
        },
        nextQuest: 'riverside_first_delivery'
    },
    
    'riverside_first_delivery': {
        id: 'riverside_first_delivery',
        title: 'First Delivery',
        description: 'Make your first delivery to a customer in Riverside. Learn the ropes.',
        giver: 'kim-shopkeeper',
        location: 'Riverside Diner',
        objectives: [
            { type: 'deliver', target: 'sally-diner', description: 'Deliver supplies to Sally at the diner', amount: 2 }
        ],
        rewards: {
            cash: 100,
            reputation: 1,
            unlock: ['riverside_become_plug']
        },
        nextQuest: 'riverside_become_plug'
    },
    
    // ============================================================
    // ACT 2: Building the Network
    // ============================================================
    
    'riverside_become_plug': {
        id: 'riverside_become_plug',
        title: 'The Main Plug',
        description: 'Mr. Kim introduces you to his contacts. You become Riverside\'s main plug.',
        giver: 'kim-shopkeeper',
        location: 'Multiple Locations',
        objectives: [
            { type: 'talk', target: 'gas-attendant', description: 'Meet Bud at Gas & Go' },
            { type: 'talk', target: 'pharmacist', description: 'Meet Dr. Chen at the Pharmacy' },
            { type: 'talk', target: 'luigi-pizza', description: 'Meet Luigi at the Pizza Shop' },
            { type: 'establish_connection', description: 'Establish yourself as the main supplier' }
        ],
        rewards: {
            cash: 500,
            reputation: 3,
            unlock: ['riverside_train_to_docks', 'riverside_expand_network']
        },
        nextQuest: 'riverside_train_to_docks',
        isMainQuest: true,
        isMainPlugMoment: true
    },
    
    'riverside_gas_connection': {
        id: 'riverside_gas_connection',
        title: 'Gas Station Connections',
        description: 'Bud at Gas & Go has trucker contacts who need supplies.',
        giver: 'gas-attendant',
        location: 'Gas & Go',
        objectives: [
            { type: 'supply', description: 'Supply Bud\'s trucker contacts', amount: 5 }
        ],
        rewards: {
            cash: 200,
            reputation: 1,
            unlock: ['riverside_trucker_network']
        },
        isSideQuest: true
    },
    
    'riverside_pharmacy_connection': {
        id: 'riverside_pharmacy_connection',
        title: 'Medical Supplies',
        description: 'Dr. Chen needs a reliable supplier for her "special" customers.',
        giver: 'pharmacist',
        location: 'Riverside Pharmacy',
        objectives: [
            { type: 'supply', description: 'Provide medical-grade supplies', amount: 3 }
        ],
        rewards: {
            cash: 250,
            reputation: 1,
            unlockspecial: 'pharmacy_backdoor'
        },
        isSideQuest: true
    },
    
    // ============================================================
    // ACT 3: Gateway to The Docks
    // ============================================================
    
    'riverside_train_to_docks': {
        id: 'riverside_train_to_docks',
        title: 'Gateway to The Docks',
        description: 'You\'ve established yourself in Riverside. Now take the train to The Docks to expand your empire.',
        giver: 'train-conductor',
        location: 'Riverside Train Station',
        objectives: [
            { type: 'travel', destination: 'THE_HARBOR', description: 'Take the train to The Docks' }
        ],
        rewards: {
            cash: 100,
            unlock: ['docks_arrival']
        },
        nextQuest: null, // Transitions to The Docks content
        isMainQuest: true,
        isTransition: true
    },
    
    'riverside_expand_network': {
        id: 'riverside_expand_network',
        title: 'Expanding Operations',
        description: 'Continue building your network in Riverside before moving to The Docks.',
        giver: 'multiple',
        location: 'Riverside',
        objectives: [
            { type: 'complete_quests', count: 3, description: 'Complete 3 more quests in Riverside' }
        ],
        rewards: {
            cash: 300,
            reputation: 2
        },
        isSideQuest: true
    },
    
    'riverside_trucker_network': {
        id: 'riverside_trucker_network',
        title: 'The Trucker Route',
        description: 'Supply truckers passing through Riverside.',
        giver: 'gas-attendant',
        location: 'Riverside',
        objectives: [
            { type: 'deliver', description: 'Make 5 deliveries to truckers', amount: 5 }
        ],
        rewards: {
            cash: 400,
            reputation: 2,
            unlock: 'trucker_route_pass'
        },
        isSideQuest: true
    }
};

// ============================================================
// QUEST PROGRESSION - How player becomes main plug
// ============================================================

export const RIVERSIDE_QUEST_PROGRESSION = {
    // Step 1: Introduction
    start: {
        quest: 'riverside_intro',
        playerStatus: 'new_arrival',
        message: 'Welcome to Riverside. Talk to Mr. Kim at the convenience store.'
    },
    
    // Step 2: First Task
    afterIntro: {
        quest: 'riverside_first_delivery',
        playerStatus: 'learning',
        message: 'Make your first delivery to learn the business.'
    },
    
    // Step 3: Become the Plug
    afterFirstDelivery: {
        quest: 'riverside_become_plug',
        playerStatus: 'rising_star',
        message: 'You\'re becoming the main plug in Riverside! Meet the key players.'
    },
    
    // Step 4: Side Opportunities
    afterBecomingPlug: {
        quests: ['riverside_gas_connection', 'riverside_pharmacy_connection'],
        playerStatus: 'established',
        message: 'You\'re the main plug! But there\'s more to do in Riverside.'
    },
    
    // Step 5: Transition to The Docks
    readyForDocks: {
        quest: 'riverside_train_to_docks',
        playerStatus: 'ready_for_expansion',
        message: 'Riverside is your territory. Time to take the train to The Docks.'
    }
};

// ============================================================
// NPC SCHEDULES - For game time system
// ============================================================

export function getNPCSchedule(npcId, gameHour) {
    const npc = RIVERSIDE_NPCS[npcId];
    if (!npc || !npc.schedule) return null;
    
    // If default schedule (always in one place)
    if (npc.schedule.default) {
        return npc.schedule.default;
    }
    
    // Find the closest schedule time
    const times = Object.keys(npc.schedule).map(Number).sort((a, b) => a - b);
    let closest = times[0];
    
    for (const time of times) {
        if (gameHour >= time) {
            closest = time;
        }
    }
    
    return npc.schedule[closest] || npc.schedule.default;
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

export function getRiversideNPC(npcId) {
    return RIVERSIDE_NPCS[npcId] || null;
}

export function getQuest(questId) {
    return RIVERSIDE_QUESTS[questId] || null;
}

export function getQuestHubNPCs() {
    return Object.values(RIVERSIDE_NPCS).filter(npc => npc.questHub);
}

export function getQuestsByGiver(npcId) {
    return Object.values(RIVERSIDE_QUESTS).filter(quest => quest.giver === npcId);
}

export function getNextQuest(currentQuestId) {
    const quest = RIVERSIDE_QUESTS[currentQuestId];
    return quest ? getQuest(quest.nextQuest) : null;
}

export default {
    NPCs: RIVERSIDE_NPCS,
    quests: RIVERSIDE_QUESTS,
    progression: RIVERSIDE_QUEST_PROGRESSION,
    getNPC: getRiversideNPC,
    getQuest: getQuest,
    getQuestHubNPCs,
    getQuestsByGiver,
    getNextQuest,
    getNPCSchedule
};
