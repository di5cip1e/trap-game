# TRAP Asset Style Guide

**Version:** 1.0  
**Last Updated:** 2026-03-13

---

## 1. Visual Style

### Resolution Tiers
- **Icons/Items:** 32x32 pixels
- **Characters/Sprites:** 64x64 pixels  
- **Large UI/Backgrounds:** 128x128 pixels

### Art Style
- 16-bit pixel art aesthetic
- Retro game feel
- Limited color palette per asset category

---

## 2. Color Palettes

### Light Armor (Casual)
| Color Type | Hex Code |
|------------|----------|
| Primary | #4A6FA5 (denim blue) |
| Secondary | #8B7355 (brown) |
| Accent | #708090 (gray) |
| Highlight | #A0B0C0 |
| Shadow | #3A5070 |

### Medium Armor (Protective)
| Color Type | Hex Code |
|------------|----------|
| Primary | #1A1A1A (black) |
| Secondary | #4A4A4A (dark gray) |
| Accent | #C4A77D (tan) |
| Highlight | #606060 |
| Shadow | #0A0A0A |

### Heavy Armor (Tactical)
| Color Type | Hex Code |
|------------|----------|
| Primary | #2D3A2D (dark green) |
| Secondary | #0D0D0D (black) |
| Accent | #3D5C3D (military green) |
| Highlight | #4A5A4A |
| Shadow | #050A05 |

### Weapons
| Category | Hex Codes |
|----------|-----------|
| Blades | #708090, #C0C0C0 (silver) |
| Grips | #2F1810, #4A3020 (browns) |
| Metal | #505050, #707070 (gunmetal) |

---

## 3. Naming Conventions

### File Naming
- Use **snake_case**: `light_jacket.png`, `ak47.png`
- Prefix by category:
  - `armor_light_`
  - `armor_medium_`
  - `armor_heavy_`
  - `weapon_melee_`
  - `weapon_pistol_`
  - `weapon_rifle_`
  - `ui_slot_`

### Animation Files
- Pattern: `{name}_anim_{action}_{frame}.png`
- Example: `player_walk_01.png`, `player_walk_02.png`

---

## 4. Animation Standards

| Action | Frames | FPS |
|--------|--------|-----|
| Walk | 4 | 8 |
| Attack | 3 | 12 |
| Idle | 2 | 4 |
| Hurt | 2 | 8 |
| Death | 4 | 6 |

---

## 5. Export Formats

- **Images:** PNG (32-bit with alpha)
- **Sprite Sheets:** JSON metadata
- **Storage:** `/projects/trap/assets/`

---

## 6. Directory Structure

```
assets/
├── armor/
│   ├── light/
│   ├── medium/
│   └── heavy/
├── weapons/
│   ├── melee/
│   ├── pistol/
│   └── rifle/
├── ui/
│   └── slots/
└── characters/
```

---

## 7. Using OpenAI DALL-E for Generation

### API Key
Location: `~/.openclaw/secrets.json` (OpenAI API key)

### Generation Process
1. Write detailed text prompt following style guide
2. Generate image with DALL-E (1024x1024 or 1024x512)
3. Download and convert to sprite sizes
4. Verify against color palette specs

### Prompt Format
```
[Asset name], pixel art style, 16-bit aesthetic, [detailed description], [color palette], isometric view, game asset, transparent background
```

### Example Prompts
- "Empty equipment slot icon, hat slot, dark gray background #2A2A2A, white outline, pixel art style, 64x64, game UI"
- "Denim jacket, light armor, blue-jean color #4A6FA5, pixel art, 16-bit game sprite, isometric"
- "9mm pistol weapon, gunmetal gray #505050, black grip #2F1810, pixel art style, 64x64"

### Output Requirements
- Save to `/projects/trap/assets/`
- Convert to appropriate sprite sizes (32x32, 64x64)
- Maintain color palette accuracy
- PNG format with transparency

---

## Quality Checklist

Before finalizing any asset:
- [ ] Correct dimensions (32x32, 64x64, or 128x128)
- [ ] Colors match palette specifications
- [ ] File name follows snake_case convention
- [ ] Transparent background (if applicable)
- [ ] Animation frames match FPS requirements
- [ ] Saved to correct directory

---

## Quick Color Reference

| Item | Hex |
|------|-----|
| Light Armor Primary | #4A6FA5 |
| Medium Armor Primary | #1A1A1A |
| Heavy Armor Primary | #2D3A2D |
| Blade Metal | #708090 |
| Gunmetal | #505050 |
| UI Slot BG | #2A2A2A |
