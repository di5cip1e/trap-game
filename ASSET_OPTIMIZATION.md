# TRAP Game - Asset Optimization Guide

## Problem Summary

Prism's audit revealed that **1024x1024 assets are being scaled down massively**, causing unnecessary memory usage and loading times.

---

## Current Asset Sizes vs Display Sizes

| Asset File | Native Size | Display Size | Scale Factor | Memory Waste |
|------------|-------------|--------------|--------------|--------------|
| **Tiles (64x64 display)** |||||
| tile-street.png | 1024x1024 | 64x64 | 0.0625x | ~256x |
| tile-sidewalk.png | 1024x1024 | 64x64 | 0.0625x | ~256x |
| tile-alley.png | 1024x1024 | 64x64 | 0.0625x | ~256x |
| tile-wall-brick.png | 1024x1024 | 64x64 | 0.0625x | ~256x |
| tile-concrete-cracked.png | 1024x1024 | 64x64 | 0.0625x | ~256x |
| tile-dirty-floor.png | 1024x1024 | 64x64 | 0.0625x | ~256x |
| tile-wood-floor.png | 1024x1024 | 64x64 | 0.0625x | ~256x |
| tile-wall-interior.png | 1024x1024 | 64x64 | 0.0625x | ~256x |
| **NPCs/Sprites (128x128 display)** |||||
| player-top-down.png | 1024x1024 | ~150x150 | 0.15x | ~44x |
| npc-vendor.png | 1024x1024 | ~150x150 | 0.15x | ~44x |
| npc-buyer.png | 1024x1024 | ~150x150 | 0.15x | ~44x |
| npc-rival.png | 1024x1024 | ~130x130 | 0.13x | ~59x |
| npc-police.png | 1024x1024 | ~130x130 | 0.13x | ~59x |
| npc-shop-owner.png | 1024x1024 | ~130x130 | 0.13x | ~59x |
| npc-corrupt-cop.png | 1024x1024 | ~130x130 | 0.13x | ~59x |
| **Objects** |||||
| cardboard-box.png | 48x48 | 64x64 | 1.33x | OK |
| storage-unit.png | 64x64 | ~40x40 | 0.12x | OK |
| workstation.png | 64x64 | ~40x40 | 0.12x | OK |
| tile-dumpster.png | 1024x1024 | ~120x120 | 0.12x | ~59x |
| **Icons (already optimal)** |||||
| icon-raw-materials.png | 32x32 | 32x32 | 1x | ✅ Optimal |
| icon-product.png | 32x32 | 32x32 | 1x | ✅ Optimal |

---

## Optimal Asset Sizes

### Tiles (Grid-based, 64x64 display)
- **Optimal size:** 64x64 or 128x128 (for 2x retina)
- **Recommended export:** 64x64 PNG (no alpha needed for floor tiles)
- **File format:** PNG (8-bit) or WebP (lossless)

### Character/NPC Sprites (128x128 or 256x256 display)
- **Optimal size:** 128x128 or 256x256 (for detailed sprites)
- **Character sheet:** 256x256 with transparent background
- **NPC portraits:** 128x128
- **File format:** PNG (32-bit with alpha) or WebP

### UI Elements
- **Icons:** 32x32 or 64x64 (2x for retina)
- **Panels/Backgrounds:** Vector-friendly or 2x resolution
- **File format:** PNG or WebP

### Objects (Environment)
- **Small objects (cardboard boxes, trash):** 64x64
- **Medium objects (workstations, dumpsters):** 128x128
- **Large objects (buildings, vehicles):** 256x256

---

## Recommended Sprite Atlas Consolidation

Instead of loading individual 1024x1024 images, consolidate related assets into atlases:

### Atlas 1: `tileset.json` (64x64 tiles, ~512x512 total)
```
tiles/
  ├── tile-street.png      (64x64)
  ├── tile-sidewalk.png    (64x64)
  ├── tile-alley.png       (64x64)
  ├── tile-wall-brick.png  (64x64)
  └── tile-concrete.png    (64x64)
```

### Atlas 2: `characters.json` (256x256 sprites, ~1024x1024 total)
```
characters/
  ├── player-male.png      (256x256)
  ├── player-female.png    (256x256)
  ├── npc-vendor.png       (256x256)
  ├── npc-buyer.png        (256x256)
  ├── npc-police.png       (256x256)
  └── npc-rival.png        (256x256)
```

### Atlas 3: `objects.json` (128x128 objects)
```
objects/
  ├── cardboard-box.png    (64x64)
  ├── storage-unit.png     (128x128)
  ├── workstation.png      (128x128)
  └── dumpster.png         (128x128)
```

---

## Implementation Status

| Task | Status | Notes |
|------|--------|-------|
| Document current sizes | ✅ Complete | This file |
| Create optimal size guide | ✅ Complete | Section above |
| CONFIG.SCALE constants | ✅ Complete | Added to config.js |
| Loading progress bar | ✅ Complete | Added to GameScene.js preload() |
| Sprite atlas recommendations | ✅ Complete | Section above |
| Use CONFIG.SCALE in code | ✅ Partial | Updated key sprites in GameScene.js |

### Updated Sprite Scales in GameScene.js

The following hardcoded scale values have been replaced with CONFIG.SCALE constants:

```javascript
// Before (hardcoded)
sprite.setScale(0.15);
sprite.setScale(0.13);
sprite.setScale(0.12);

// After (using CONFIG)
sprite.setScale(CONFIG.SCALE.PLAYER);
sprite.setScale(CONFIG.SCALE.NPC_VENDOR);
sprite.setScale(CONFIG.SCALE.DUMPSTER);
```

Updated sprites:
- `CONFIG.SCALE.DUMPSTER` (line 434)
- `CONFIG.SCALE.WORKSTATION` (line 445)
- `CONFIG.SCALE.NPC_VENDOR` (lines 469, 1254)
- `CONFIG.SCALE.NPC_BUYER` (line 493)
- `CONFIG.SCALE.PLAYER` (line 604)
- `CONFIG.SCALE.NPC_SHOP_OWNER` (line 1293)
- `CONFIG.SCALE.NPC_CORRUPT_COP` (line 1331)

---

## Memory Impact Calculation

**Current (1024x1024 assets):**
- 1 tile = 1024 × 1024 × 4 bytes = **4 MB**
- 20 tile types = **80 MB** (just for visible tiles)
- 1 NPC = 4 MB × 7 types = **28 MB**

**Optimized (64x64 tiles, 256x256 sprites):**
- 1 tile = 64 × 64 × 4 bytes = **16 KB**
- 20 tile types = **320 KB**
- 1 NPC = 256 × 256 × 4 bytes = **256 KB**
- 7 NPCs = **1.8 MB**

**Savings: ~98% reduction in texture memory**