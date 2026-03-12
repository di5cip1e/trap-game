# TRAP Sprite Atlas Consolidation Plan

## Overview
This document outlines the sprite atlas consolidation strategy to reduce draw calls and improve performance. Currently, TRAP loads ~237 individual sprite images, each requiring a separate draw call when rendered.

## Current Asset Analysis

### Asset Categories & Counts
| Category | Count | Examples |
|----------|-------|----------|
| Player Sprites | ~60 | walk-*, portrait-*, battle-* |
| Supplier NPCs (10 gangs) | ~100 | TheDon, Shade, Byte, Razor, Storm, Ghost, Iron, Fang, Frost, Blaze, Viper, Rook |
| Enemy Sprites | ~12 | gangster-*, thug-*, boss-*, enforcer-* |
| Tiles | ~8 | tile-street, tile-sidewalk, tile-alley, etc. |
| Environment Objects | ~40 | cardboard-box, dumpster, workstations, etc. |
| Combat UI | ~10 | hp-bar-*, combat-frame, damage-numbers |
| Skills/Icons | ~20 | luck-*, ability-*, intuition-* |
| Status Effects | ~3 | status-burn, status-freeze, status-poison |

### Current Preload Pattern (GameScene.js)
```javascript
this.load.image('player-top', 'https://rosebud.ai/assets/player-top-down.png.webp?8YJk');
this.load.image('tile-street', 'https://rosebud.ai/assets/tile-sidewalk.png.webp?WAgM');
// ... 20+ individual image loads
```

## Recommended Atlas Configuration

### Atlas 1: atlases/tiles.png (256x256)
**Purpose:** Ground tiles and floor textures
**Contents:**
- tile-street.png
- tile-sidewalk.png  
- tile-alley.png
- tile-concrete-cracked.png
- tile-dirty-floor.png
- tile-wood-floor.png
- tile-wall-brick.png
- tile-wall-interior.png

**Usage:** Background layer rendering

---

### Atlas 2: atlases/ui-combat.png (512x256)
**Purpose:** Combat UI elements
**Contents:**
- combat-frame.png
- hp-bar-player.png
- hp-bar-enemy.png
- xp-bar.png
- damage-numbers.png
- health-potion.png
- run-button.png
- victory-screen.png
- defeat-screen.png

**Usage:** CombatScene UI rendering

---

### Atlas 3: atlases/ui-hud.png (256x128)
**Purpose:** HUD and interface elements
**Contents:**
- hud-panel-bar.png
- ui-panel.png
- icon-raw-materials.png
- icon-product.png

**Usage:** HUD, inventory displays

---

### Atlas 4: atlases/environment.png (512x512)
**Purpose:** Interactive world objects
**Contents:**
- cardboard-box.png
- storage-unit.png
- dumpster.png (tile-dumpster)
- workstation.png

**Usage:** World object rendering

---

### Atlas 5: atlases/npcs.png (512x256)
**Purpose:** Static NPCs (vendors, buyers, shop owners)
**Contents:**
- npc-vendor.png
- npc-buyer.png
- npc-shop-owner.png
- npc-police.png
- npc-corrupt-cop.png
- npc-rival.png

**Usage:** NPC rendering in world

---

### Atlas 6: atlases/player-main.png (256x128)
**Purpose:** Player character sprites
**Contents:**
- player-top-down.png (or walk sprites)
- portrait-happy.png
- portrait-neutral.png
- portrait-hurt.png
- portrait-angry.png
- portrait-dead.png
- battle-idle.png
- battle-attack.png
- battle-defend.png
- battle-hurt.png
- battle-dead.png

**Usage:** Player sprite rendering

---

### Atlas 7: atlases/enemies.png (256x128)
**Purpose:** Enemy combat sprites
**Contents:**
- gangster-idle.png
- gangster-defeat.png
- thug-idle.png
- thug-attack.png
- thug-hurt.png
- boss-idle.png
- boss-attack.png
- boss-hurt.png
- boss-defeat.png
- enforcer-idle.png
- enforcer-attack.png
- enforcer-defeat.png

**Usage:** CombatScene enemy rendering

---

### Atlas 8: atlases/status-effects.png (128x64)
**Purpose:** Status effect icons
**Contents:**
- status-burn.png
- status-freeze.png
- status-poison.png

**Usage:** Combat status display

---

### Atlas 9: atlases/suppliers.png (512x512)
**Purpose:** All 12 supplier gang sprites
**Contents:**
- TheDon: walk_*, portrait_*
- Shade: walk_*, portrait_*
- Byte: walk_*, portrait_*
- Razor: walk_*, portrait_*
- Storm: walk_*, portrait_*
- Ghost: walk_*, portrait_*
- Iron: walk_*, portrait_*
- Fang: walk_*, portrait_*
- Frost: walk_*, portrait_*
- Blaze: walk_*, portrait_*
- Viper: walk_*, portrait_*
- Rook: walk_*, portrait_*

**Note:** Each supplier has 5 directions × 2 frames + 5 portraits = ~15 sprites each

**Usage:** Supplier NPC rendering

---

### Atlas 10: atlases/skills.png (256x64)
**Purpose:** Skill and ability icons
**Contents:**
- luck-card-shark.png
- luck-escape-artist.png
- luck-fast-talk.png
- luck-fortune.png
- luck-game-of-chance.png
- luck-lucky-break.png
- ability-toughness.png
- ability-unbreakable.png
- ability-last-stand.png
- ability-iron-fist.png
- ability-berserk.png
- ability-power-strike.png
- intuition-intimidate.png
- intuition-deadly-precision.png
- intuition-sneak.png
- intuition-street-sense.png
- intuition-shadow-walk.png
- intuition-lockpick.png

**Usage:** SkillTree UI

---

### Atlas 11: atlases/objects.png (512x256)
**Purpose:** Environmental objects and props
**Contents:**
- trash-can-metal.png
- steam-vent.png
- graffiti-wall.png
- mailbox.png
- oil-stain.png
- park-bench.png
- safe.png
- cardboard-box-scattered.png
- lockers.png
- dead-tree.png
- pothole.png
- weeds.png
- barrels.png
- barricade.png
- motorcycle.png
- faded-paint.png
- bushes.png
- shopping-cart.png
- manhole-cover.png
- scale.png
- puddle.png
- street-lamp.png
- car-suv.png
- mattress.png
- cash-pile.png
- sprinkler.png
- car-sedan.png
- dumpster-open.png
- dumpster-closed.png
- bicycle.png
- table.png
- old-chair.png
- guard-rail.png
- newspaper-stand.png
- burner-phone.png
- brick-wall.png
- truck-delivery.png
- crates.png
- broken-window.png
- fire-hydrant.png
- traffic-cone.png
- phone-booth.png
- fence-section.png
- pool-water.png
- van-cargo.png

**Usage:** World object rendering

---

## GameScene Preload Update

Instead of loading individual images:
```javascript
// OLD (current)
this.load.image('player-top', 'https://rosebud.ai/assets/player-top-down.png.webp?8YJk');
this.load.image('tile-street', 'https://rosebud.ai/assets/tile-street.png.webp?ekRg');
```

Use atlas loading:
```javascript
// NEW (recommended)
this.load.atlas('tiles', 'assets/atlases/tiles.png', 'assets/atlases/tiles.json');
this.load.atlas('ui-combat', 'assets/atlases/ui-combat.png', 'assets/atlases/ui-combat.json');
this.load.atlas('player-main', 'assets/atlases/player-main.png', 'assets/atlases/player-main.json');
// etc.
```

### Updated Preload Function
```javascript
preload() {
    // Loading screen setup (unchanged)...
    
    // ==========================================
    // LOAD TEXTURE ATLASES
    // ==========================================
    
    // Core atlases - load these first for initial game start
    this.load.atlas('tiles', 'assets/atlases/tiles.png', 'assets/atlases/tiles.json');
    this.load.atlas('ui-hud', 'assets/atlases/ui-hud.png', 'assets/atlases/ui-hud.json');
    this.load.atlas('player-main', 'assets/atlases/player-main.png', 'assets/atlases/player-main.json');
    this.load.atlas('npcs', 'assets/atlases/npcs.png', 'assets/atlases/npcs.json');
    
    // Conditional atlases - load on demand based on game state
    // Combat: this.load.atlas('ui-combat', ...)
    // Enemies: this.load.atlas('enemies', ...)
    // Skills: this.load.atlas('skills', ...)
    // Suppliers: this.load.atlas('suppliers', ...) - load when meeting suppliers
    
    // Single images not yet consolidated (legacy fallback)
    this.load.image('player-top', 'https://rosebud.ai/assets/player-top-down.png.webp?8YJk');
}
```

## Sprite Frame References

When using atlases, sprites are referenced by frame name (from JSON):
```javascript
// Instead of:
this.add.image(x, y, 'player-top');

// Use:
this.add.image(x, y, 'player-main', 'walk-down-1');
this.add.image(x, y, 'player-main', 'portrait-happy');
this.add.image(x, y, 'tiles', 'tile-street');
this.add.image(x, y, 'npcs', 'npc-vendor');
```

## Expected Performance Impact

### Current State
- ~237 individual image files
- Each sprite = 1 draw call
- Texture swaps between different sprite sheets cause pipeline stalls

### After Consolidation
- ~11 atlas files
- Sprites within same atlas = batched in single draw call
- Reduced texture binding overhead
- **Estimated improvement:** 30-50% reduction in draw calls during gameplay

## Future Asset Creation Guidelines

1. **Consistent Grid:** Create all sprites on consistent grid (e.g., 32x32 or 64x64)
2. **Power of 2:** Keep atlas dimensions power of 2 (256, 512, 1024, 2048)
3. **Padding:** Include 2px padding between sprites to prevent bleeding
4. **Naming:** Use descriptive frame names: `{category}-{state}-{frame}` (e.g., `player-walk-down-1`)
5. **Group by Usage:** Sprites used together should be in same atlas
6. **Max Size:** Keep individual atlases under 2048x2048 for mobile compatibility

## Implementation Priority

1. **HIGH:** tiles.png, ui-combat.png, ui-hud.png (used every frame)
2. **MEDIUM:** player-main.png, npcs.png, enemies.png (frequent use)
3. **LOW:** skills.png, status-effects.png, suppliers.png (on-demand loading)
4. **OPTIONAL:** objects.png (environmental detail - can remain individual)

## JSON Frame Format Example (tiles.json)
```json
{
  "frames": {
    "tile-street": {
      "frame": {"x": 0, "y": 0, "w": 32, "h": 32},
      "sourceSize": {"w": 32, "h": 32}
    },
    "tile-sidewalk": {
      "frame": {"x": 32, "y": 0, "w": 32, "h": 32},
      "sourceSize": {"w": 32, "h": 32}
    }
  },
  "meta": {
    "image": "tiles.png",
    "size": {"w": 256, "h": 256}
  }
}
```
