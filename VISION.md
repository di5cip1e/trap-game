# TRAP - Visual Overhaul Vision Document

**Art Direction:** Mirren, Art Director  
**2D/3D Modeling:** Prism  
**Date:** 2026-03-10

---

## 🎨 Aesthetic Vision: "The Underworld"

The Trap game needs a gritty, street-level crime aesthetic that feels authentic to urban underworld life. Think midnight alleys, neon-lit sidewalks, concrete jungles, and the shadows between streetlights. Not fantasy, not sci-fi — just raw urban decay.

---

## 🎯 Core Visual Philosophy

- **Realism with stylization** — grounded in reality but with bold artistic choices
- **Dark, moody atmosphere** — shadows are your friend
- **Neon accents** — pop of color against darkness (amber, teal, magenta)
- **Texture-heavy** — grime, wear, decay on everything
- **No clean lines** — everything should feel lived-in, broken, worn

---

## 🎨 Color Palette

### Primary Palette
| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Deep Shadow | Asphalt Black | `#0a0a0a` | Backgrounds, void |
| Concrete | Storm Gray | `#2d2d2d` | Walls, floor base |
| Rust | Burnt Orange | `#8b4513` | Accents, danger |
| Neon Amber | Warning Yellow | `#ffaa00` | UI highlights, money |
| Neon Teal | Cyan Electric | `#00ffcc` | Safe elements, success |

### Secondary Palette
| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Blood Red | Danger | `#cc2222` | Heat, police, danger |
| Graffiti Pink | Urban Pop | `#ff00aa` | Rival territories |
| Mold Green | Decay | `#334433` | Dirty floors, alleys |
| Steel Blue | Police | `#334455` | Law enforcement |

### UI Colors
- **Panels:** `#1a1a1a` with `#333333` borders
- **Text:** `#e0e0e0` primary, `#888888` secondary
- **Hustle meter:** Gradient from `#cc2222` (low) → `#ffaa00` (mid) → `#00ff66` (high)
- **Heat indicator:** Pulsing `#cc2222` with fire/glow effect

---

## 📦 Asset Categories & Replacement Priority

### 🔴 Priority 1: Gameplay-Critical Assets

These are seen constantly and define the game feel:

1. **Player Sprite** (`player-top-down.png`)
   - Replace with gritty character art
   - Hoodie silhouette with multiple color variants for customizability
   - Add shadow beneath feet

2. **Tile Sets** (highest impact on atmosphere)
   - `tile-street.png` — cracked asphalt, puddles, trash
   - `tile-sidewalk.png` — broken concrete, weeds growing through
   - `tile-wall-brick.png` — graffitied, chipping paint
   - `tile-concrete-cracked.png` — dirty warehouse floor
   - `tile-wood-floor.png` — creaky, warped planks

3. **Police/NPC Sprites**
   - `npc-police.webp` — tactical gear, badges, flashlight beams
   - `npc-corrupt-cop.webp` — sunglasses, gold chains, bribable look
   - `npc-rival.webp` — territorial, aggressive poses

### 🟠 Priority 2: Economic/UI Assets

4. **Safehouse Visuals**
   - `cardboard-box.png` — worn cardboard, blankets inside
   - `storage-unit.png` — metal roll-up door, padlock visible
   - Add progression visualization (upgrade stages)

5. **Workstation**
   - `workstation.png` — cluttered table with scale, bags, burner phone

6. **UI Elements**
   - `hud-panel-bar.png` — dark metallic texture with rivets
   - `ui-panel.png` — grungy backdrop for menus

### 🟡 Priority 3: Environment/Flavor

7. **Backgrounds**
   - `background-creation.png` — night city skyline silhouette

8. **Street Props**
   - `tile-dumpster.png` — overflowing trash, rats optional
   - `tile-alley.png` — narrow passage with chains, dumpsters

---

## 🎮 Asset Specifications

### Sprites (Top-Down)
- **Size:** 64x64 base tiles, character sprites 48x64
- **Style:** Pixel art with dithering for texture, or hand-drawn with rough edges
- **Animation frames:** 4-directional movement (idle, walk)

### Tiles
- **Seamless tiling** required for street/concrete/floor
- **Edge variants** for walls and transitions
- **Detail layer** — overlays for trash, puddles, bloodstains (seasonal?)

### UI
- **Theme:** Industrial/military surplus aesthetic
- **Fonts:** Stencil orgraffiti-style for headers, monospace for numbers
- **Effects:** Subtle scanlines, CRT flicker on heat warnings

---

## 🚀 Implementation Roadmap

### Phase 1: Core Tiles (Week 1)
- Street, sidewalk, brick wall, concrete floor
- This transforms the entire game feel instantly

### Phase 2: Characters (Week 2)
- Player, police, rival, corrupt cop
- Critical for narrative tension

### Phase 3: Economy/UI (Week 3)
- Safehouse sprites, workstation, inventory UI
- Makes the gameplay loop feel complete

### Phase 4: Polish (Week 4)
- Dumpster, alley props, background art
- Environmental storytelling

---

## 💡 Style References

- **Games:** Hotline Miami (neon + grit), Payday 2 (heist aesthetic), GTA top-down mods
- **Art:** Cyberpunk 2077 concept art, 90s street photography, Banksy stencils
- **Textures:** Weathered concrete, rust, cardboard, chain-link fence

---

## ⚠️ Key Principles

1. **Never clean** — every surface should look used, abused, lived-on
2. **Shadows sell atmosphere** — dark corners, pools of light from streetlights
3. **Color = information** — amber = money/safe, red = danger/heat
4. **Consistency > perfection** — all assets must feel like they're from the same world
5. **Player character should feel anonymous** — customizable silhouette, not a defined face

---

*Let's make this game feel like stepping into a drug-infested urban nightmare.*