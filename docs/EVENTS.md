# Event Patterns Documentation

This document describes the event-driven architecture used in TRAP.

## EventBus

The `EventBus` is a simple pub/sub implementation that enables loose coupling between game systems.

### Usage

```javascript
import { EventBus, EVENTS } from './EventBus.js';

// Subscribe to an event
const unsubscribe = EventBus.on(EVENTS.PLAYER_MONEY_CHANGED, (data) => {
    console.log(`Money changed: ${data.oldValue} -> ${data.newValue}`);
});

// Emit an event
EventBus.emit(EVENTS.PLAYER_MONEY_CHANGED, {
    oldValue: 100,
    newValue: 150
});

// Unsubscribe
unsubscribe();

// One-time listener
EventBus.once(EVENTS.GAME_LOADED, (data) => {
    console.log('Game loaded!');
});
```

## Core Events

### Player Events
| Event | Data | Description |
|-------|------|-------------|
| `player:moneyChanged` | `{ oldValue, newValue, delta }` | Player's money changed |
| `player:statsChanged` | `{ stat, oldValue, newValue }` | Player stat changed |
| `player:heatChanged` | `{ oldValue, newValue, delta }` | Player heat level changed |
| `player:hustleChanged` | `{ oldValue, newValue, delta }` | Player hustle changed |
| `player:neighborhoodChanged` | `{ from, to }` | Player moved to new neighborhood |
| `player:equipmentChanged` | `{ item, equipped }` | Equipment changed |
| `player:inventoryChanged` | `{ type, oldValue, newValue }` | Inventory changed (rawMaterials, product) |

### Game State Events
| Event | Data | Description |
|-------|------|-------------|
| `game:stateChanged` | `{ from, to, data }` | Game mode changed |
| `game:paused` | `{ from }` | Game was paused |
| `game:resumed` | `{ to }` | Game was resumed |
| `game:saved` | `{ slot, timestamp }` | Game saved |
| `game:loaded` | `{ slot, timestamp }` | Game loaded |

### Time Events
| Event | Data | Description |
|-------|------|-------------|
| `time:advanced` | `{ minutes, totalMinutes, hour, minute, day }` | Time advanced |
| `time:dayChanged` | `{ fromDay, toDay, timeString }` | Day changed (midnight) |

### Combat Events
| Event | Data | Description |
|-------|------|-------------|
| `combat:started` | `{ enemy, location }` | Combat encounter started |
| `combat:ended` | `{ victory, rewards }` | Combat ended |
| `player:damaged` | `{ amount, source }` | Player took damage |
| `enemy:defeated` | `{ enemy, xp, loot }` | Enemy defeated |

### Quest Events
| Event | Data | Description |
|-------|------|-------------|
| `quest:started` | `{ questId, quest } | Quest started |
| `quest:completed` | `{ questId, rewards }` | Quest completed |
| `quest:failed` | `{ questId, reason }` | Quest failed |
| `quest:updated` | `{ questId, objective, progress }` | Quest progress updated |

### UI Events
| Event | Data | Description |
|-------|------|-------------|
| `ui:opened` | `{ uiType, data }` | UI opened |
| `ui:closed` | `{ uiType }` | UI closed |
| `ui:notification` | `{ message, type, duration }` | Show notification |

### NPC Events
| Event | Data | Description |
|-------|------|-------------|
| `npc:interactionStart` | `{ npcId, type }` | NPC interaction started |
| `npc:interactionEnd` | `{ npcId, outcome }` | NPC interaction ended |
| `shop:opened` | `{ vendorId, inventory }` | Shop opened |
| `shop:closed` | `{ vendorId }` | Shop closed |

## State Machine (GameState)

The `GameState` manages game mode transitions and provides state-aware logic.

### Usage

```javascript
import { GameState, GAME_MODES } from './GameState.js';

// Check current state
if (GameState.is(GAME_MODES.COMBAT)) {
    // Handle combat mode
}

// Transition to new state
GameState.transitionTo(GAME_MODES.SHOP, { vendorId: 'supplier1' });

// Push nested state (e.g., opening a dialog during combat)
GameState.pushState(GAME_MODES.DIALOGUE, { npcId: 'cop' });

// Return to previous state
GameState.popState();

// Listen for state changes
import { EventBus, EVENTS } from './EventBus.js';

EventBus.on(EVENTS.GAME_STATE_CHANGED, ({ from, to, data }) => {
    console.log(`State: ${from} -> ${to}`);
});
```

### Game Modes

- `MENU` - Main menu
- `CHARACTER_CREATION` - Character creation flow
- `EXPLORATION` - Free movement in game world
- `COMBAT` - Combat encounter
- `DIALOGUE` - NPC dialogue
- `SHOP` - Shopping interface
- `SAFEHOUSE` - Safehouse management
- `QUEST` - Quest interface
- `PAUSED` - Game paused
- `GAMEOVER` - Game over screen

## Refactored Systems

### TimeSystem → CalendarSystem

**Before:**
```javascript
// TimeSystem.js
advanceToNextDay() {
    this.day++;
    // Direct call to scene method
    if (this.scene && this.scene.onNewDay) {
        this.scene.onNewDay();
    }
}

// GameScene.js
onNewDay() {
    this.calendarSystem.advanceDay(this.timeSystem.day);
    this.hud.update();
    // ... many more direct calls
}
```

**After (Event-driven):**
```javascript
// TimeSystem.js
advanceToNextDay() {
    this.day++;
    // Emit event
    EventBus.emit(EVENTS.DAY_CHANGED, {
        fromDay: oldDay,
        toDay: this.day
    });
}

// CalendarSystem.js
constructor(scene) {
    // Subscribe to events
    EventBus.on(EVENTS.DAY_CHANGED, (data) => {
        this.advanceDay(data.toDay);
    });
}
```

### Benefits

1. **Decoupling**: TimeSystem doesn't need to know about CalendarSystem
2. **Extensibility**: New systems can listen to time events without modifying TimeSystem
3. **Testability**: Each system can be tested in isolation
4. **Debugging**: Events are logged, making it easier to trace issues

## Adding Events to New Systems

When adding new functionality:

1. **Define event name** in `EventBus.js` EVENTS constant
2. **Emit events** when state changes in the source system
3. **Subscribe to events** in dependent systems
4. **Document** the event in this file

Example:
```javascript
// 1. Add to EVENTS in EventBus.js
PLAYER_ITEM_PICKED: 'player:itemPicked',

// 2. Emit from source
EventBus.emit(EVENTS.PLAYER_ITEM_PICKED, {
    itemId: 'health_pack',
    quantity: 1
});

// 3. Listen in consumer
EventBus.on(EVENTS.PLAYER_ITEM_PICKED, ({ itemId, quantity }) => {
    this.updateInventoryUI();
});
```