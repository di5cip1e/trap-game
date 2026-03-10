# TRAP Game Asset Specification

**Generated:** 2026-03-10  
**Style:** "The Underworld" - gritty urban crime aesthetic  
**Format:** PNG + WebP

---

## Asset Summary

### 🎮 Player Sprites
| File | Description | Size |
|------|-------------|------|
| `player-top-down.png` | Main player character - hoodie silhouette with shadow | 48x64 |
| `male-char.png` | Male character variant | 48x64 |
| `female-char.png` | Female character variant (slimmer) | 48x64 |

**Style:** Black hoodie, gray hood opening, skin tone face, shadow beneath feet, pockets with zippers

---

### 👮 NPC Sprites
| File | Description | Style |
|------|-------------|-------|
| `npc-police.png` | Law enforcement | Dark blue uniform (#1a2a4a), gold badge, tactical hat, belt with flashlight |
| `npc-corrupt-cop.png` | Bribable officer | Steel blue uniform, sunglasses, tilted hat, gold chain, money envelope in pocket |
| `npc-rival.png` | Rival gang member | Neon pink stripes (#ff00aa), backwards bandana, gun silhouette |
| `npc-buyer.png` | Customer/Nervous type | Grey hoodie, backwards cap, shifting pose |
| `npc-vendor.png` | Street dealer | Green apron, store owner style |
| `npc-shop-owner.png` | Backroom shop keeper | Worn formal wear, loosened tie, glasses, cash register |

---

### 🧱 Tiles (64x64, seamless)
| File | Description |
|------|-------------|
| `tile-street.png` | Cracked asphalt, puddles, trash specks |
| `tile-sidewalk.png` | Broken concrete, weeds growing through cracks |
| `tile-wall-brick.png` | Brick pattern with mortar, graffiti tag ("XX"), chipping paint |
| `tile-concrete-cracked.png` | Warehouse floor with cracks, oil stains |
| `tile-wood-floor.png` | Warped wooden planks, nail holes, wear marks |
| `tile-alley.png` | Dark narrow passage, chain-link fence shadow, dumpster, pipes |
| `tile-dumpster.png` | Green dumpster with trash overflow, wheels |
| `tile-dirty-floor.png` | Alias for concrete tile |
| `tile-wall-interior.png` | Alias for brick wall |

---

### 📦 Objects
| File | Description |
|------|-------------|
| `cardboard-box.png` | Worn cardboard with tape, blanket peeking out |
| `storage-unit.png` | Metal roll-up door with ridges, padlock, rust spots |
| `workstation.png` | Cluttered table with scale, bags, burner phone, LED light, coffee stain |

---

### 🖥️ UI Elements
| File | Description |
|------|-------------|
| `hud-panel-bar.png` | Dark metallic bar (320x24), rivets, danger stripe on left |
| `ui-panel.png` | Grungy backdrop (200x150), corner screws, scanline effect |

---

### 🎯 Icons
| File | Description |
|------|-------------|
| `icon-product.png` | Purple bag silhouette on dark circle, amber border |
| `icon-raw-materials.png` | White powder pile on dark circle, steel blue border |

---

### 🌃 Backgrounds
| File | Description |
|------|-------------|
| `background-creation.png` | Night city skyline (320x180), lit windows, neon sign |

---

## Color Palette (from VISION.md)

### Primary
- **Asphalt Black:** `#0a0a0a` - backgrounds, void
- **Storm Gray:** `#2d2d2d` - walls, floor base  
- **Burnt Orange:** `#8b4513` - accents, danger
- **Neon Amber:** `#ffaa00` - UI highlights, money
- **Neon Teal:** `#00ffcc` - safe elements, success

### Secondary
- **Danger:** `#cc2222` - heat, police, danger
- **Graffiti Pink:** `#ff00aa` - rival territories
- **Mold Green:** `#334433` - dirty floors, alleys
- **Steel Blue:** `#334455` - police

---

## Usage Notes

1. **File Extensions:** Both PNG and WebP versions provided for compatibility
2. **Asset Loader:** Game code references `.png.webp` (loads PNG, serves as WebP)
3. **Regeneration:** Run `node generator.js` in the assets folder to regenerate
4. **Customization:** Edit `generator.js` to modify colors or add variants

---

## Key Style Principles Applied

✅ Never clean - all surfaces look used, abused  
✅ Shadows sell atmosphere - dark corners, pools of light  
✅ Color = information - amber = money/safe, red = danger/heat  
✅ Player character anonymous - customizable silhouette  
✅ Consistency - all assets feel from same underworld world