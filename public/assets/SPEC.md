# TRAP Game - Animated Sprite Specification

**Art Direction:** Mirren  
**2D/3D Modeling:** Prism  
**Date:** 2026-03-10  
**Style:** "The Underworld" - gritty urban crime aesthetic (per VISION.md)

---

## 📋 Overview

This document specifies all animated sprite requirements for The Trap game. All sprites use pixel art style with the gritty underworld aesthetic defined in VISION.md. Sprites are organized into three categories: Player, NPCs, and Objects.

---

## 🎮 1. Player Sprites

### 1.1 Walking Animation (Top-Down View)

**Sprite Sheet Layout:** 4 directions × 8 frames = 32 frames total  
**Frame Size:** 32×32 pixels  
**Animation Timing:** 100ms per frame (10 FPS)

| Direction | Frames | Description |
|-----------|--------|-------------|
| Down (south) | 1-8 | Walking down, slight bob, feet alternating |
| Up (north) | 9-16 | Walking up, hood moves slightly |
| Left (west) | 17-24 | Walking left, profile view |
| Right (east) | 25-32 | Walking right, profile view |

**Animation Breakdown:**
- Frame 1: Standing pose
- Frames 2-3: First step (right foot forward)
- Frame 4: Mid-stride
- Frames 5-6: Second step (left foot forward)
- Frame 7: Mid-stride
- Frame 8: Return to standing

**Colors:**
- Hoodie body: `#1a1a1a` (Asphalt Black)
- Hood opening: `#3a3a3a` (dark gray)
- Face (visible): `#d4a574` (skin tone)
- Shadow: `#000000` at 40% opacity

---

### 1.2 Battle Sprites (Side View)

**Sprite Sheet Layout:** 5 poses × 4 frames = 20 frames total  
**Frame Size:** 48×48 pixels  
**Animation Timing:** 150ms per frame (idle: 500ms hold)

| Pose | Frames | Description |
|------|--------|-------------|
| Idle | 1-4 | Slight breathing motion, weight shift |
| Attack | 5-8 | Punch/swing motion, 3-frame attack + 1 recovery |
| Defend | 9-12 | Arms up, crouching slightly |
| Hurt | 13-16 | Recoil backward, brief flash |
| Dead | 17-20 | Falls to ground, final pose holds |

**Idle Animation (subtle):**
- Frame 1: Neutral stance
- Frame 2: Slight rise (inhale)
- Frame 3: Neutral
- Frame 4: Slight fall (exhale)

**Attack Animation:**
- Frame 1: Wind-up (arm back)
- Frame 2: Strike (arm forward)
- Frame 3: Contact (impact frame)
- Frame 4: Recovery (return to idle)

---

### 1.3 Player Portraits (UI)

**Frame Size:** 128×128 pixels  
**Expressions:** 5 emotions

| Expression | Description | Visual Notes |
|------------|-------------|--------------|
| Happy | Confident smirk | Eyebrows raised, slight smile, challenge in eyes |
| Neutral | Default expression | Slight squint, guarded expression |
| Angry | Confrontational | Eyebrows furrowed, jaw set tight, intense stare |
| Hurt | Injured/pained | One eye squinted, blood spatter optional |
| Dead | KO/fainted | Eyes X'd or closed, pale tint |

**Usage:** Dialogue screens, inventory selection, game over

---

### 1.4 Player Animation Summary

| Category | Sheet File | Directions/Poses | Frames/Dir | Total Frames | Frame Size | FPS |
|----------|------------|------------------|------------|--------------|------------|-----|
| Walking | `player-walk.png` | 4 directions | 8 | 32 | 32×32 | 10 |
| Battle | `player-battle.png` | 5 poses | 4 | 20 | 48×48 | 7 |
| Portraits | `player-portraits.png` | 5 expressions | 1 | 5 | 128×128 | N/A |

---

## 👮 2. NPC Sprites

Each NPC requires: Walking animation (4 directions), Battle sprites (side view), and Portraits (expressions).

### 2.1 Police Officer (npc-police)

**Walking Animation:**
- Sheet: `npc-police-walk.png`
- Size: 32×32 per frame
- Frames: 4 directions × 6 frames = 24 frames
- Timing: 120ms/frame (slight march rhythm)

**Animation (per direction):**
- Frame 1-2: Standing alert
- Frame 3-4: Left foot march
- Frame 5-6: Right foot march

**Battle Sprites:**
- Sheet: `npc-police-battle.png`
- Size: 48×48 per frame
- Poses: Idle, Attack (baton swing), Defend (shield up), Hurt, Arrest (hands out)

**Portraits:**
- Sheet: `npc-police-portraits.png` (128×128)
- Expressions: Stern, Alert, Angry, Surprised, Bribable (corruption hint)

**Color Palette:**
- Uniform: `#1a2a4a` (dark navy)
- Badge: `#ffd700` (gold)
- Hat: `#0f1a2a` (darker navy)
- Skin: `#e8c4a0`
- Belt: `#2a2a2a` with `#ffaa00` buckle

---

### 2.2 Corrupt Cop (npc-corrupt-cop)

**Walking Animation:**
- Sheet: `npc-corrupt-cop-walk.png`
- Size: 32×32 per frame
- Frames: 4 directions × 6 frames = 24 frames
- Timing: 120ms/frame (slower, lazier walk)

**Battle Sprites:**
- Sheet: `npc-corrupt-cop-battle.png`
- Size: 48×48 per frame
- Poses: Idle (leaning), Attack (punch), Defend (hands up), Hurt, Bribe (waves money)

**Portraits:**
- Sheet: `npc-corrupt-cop-portraits.png` (128×128)
- Expressions: Smug, Greedy, Suspicious, Threatening, Nervous (when caught)

**Color Palette:**
- Uniform: `#334455` (steel blue, worn)
- Sunglasses: `#111111` with `#333333` reflection
- Gold chain: `#ffd700`
- Skin: `#d4a574`

---

### 2.3 Rival (npc-rival)

**Walking Animation:**
- Sheet: `npc-rival-walk.png`
- Size: 32×32 per frame
- Frames: 4 directions × 8 frames = 32 frames
- Timing: 100ms/frame (aggressive, quick pace)

**Battle Sprites:**
- Sheet: `npc-rival-battle.png`
- Size: 48×48 per frame
- Poses: Idle (bouncing stance), Attack (knife swing), Defend (dodge), Hurt, Taunt (gesture)

**Portraits:**
- Sheet: `npc-rival-portraits.png` (128×128)
- Expressions: Menacing, Confident, Furious, Injured, Defeated

**Color Palette:**
- Jacket: `#222222` (black leather)
- Accents: `#ff00aa` (neon pink stripes)
- Bandana: `#ff00aa`
- Skin: `#c4866a`

---

### 2.4 Buyer (npc-buyer)

**Walking Animation:**
- Sheet: `npc-buyer-walk.png`
- Size: 32×32 per frame
- Frames: 4 directions × 6 frames = 24 frames
- Timing: 150ms/frame (nervous, shuffling)

**Battle Sprites:**
- Sheet: `npc-buyer-battle.png`
- Size: 48×48 per frame
- Poses: Idle (shifting weight), Attack (panicked flail), Defend (hands up), Hurt (cower), Flee (run away)

**Portraits:**
- Sheet: `npc-buyer-portraits.png` (128×128)
- Expressions: Nervous, Eager, Scared, Greedy, Sorry

**Color Palette:**
- Hoodie: `#4a4a4a` (gray)
- Cap: `#333333` (backwards)
- Skin: `#e8c4a0`
- Sweat: `#88ccff` droplets

---

### 2.5 Vendor (npc-vendor)

**Walking Animation:**
- Sheet: `npc-vendor-walk.png`
- Size: 32×32 per frame
- Frames: 4 directions × 6 frames = 24 frames
- Timing: 140ms/frame (casual stroll)

**Battle Sprites:**
- Sheet: `npc-vendor-battle.png`
- Size: 48×48 per frame
- Poses: Idle (hands on counter pose), Attack (grab weapon), Defend (duck), Hurt, Surrender (hands up)

**Portraits:**
- Sheet: `npc-vendor-portraits.png` (128×128)
- Expressions: Business-like, Friendly, Annoyed, Threatening, Worried

**Color Palette:**
- Apron: `#2d5a2d` (dark green)
- Shirt: `#f0f0f0` (white, stained)
- Skin: `#d4a574`

---

### 2.6 Shop Owner (npc-shop-owner)

**Walking Animation:**
- Sheet: `npc-shop-owner-walk.png`
- Size: 32×32 per frame
- Frames: 4 directions × 6 frames = 24 frames
- Timing: 160ms/frame (slow, deliberate)

**Battle Sprites:**
- Sheet: `npc-shop-owner-battle.png`
- Size: 48×48 per frame
- Poses: Idle (behind-counter), Attack (reach for gun), Defend (hide behind counter), Hurt, Negotiate (hands out)

**Portraits:**
- Sheet: `npc-shop-owner-portraits.png` (128×128)
- Expressions: Smug, Calculating, Angry, Scared, Deal-maker

**Color Palette:**
- Suit: `#2a2a3a` (worn formal)
- Tie: `#8b0000` (loosened, dark red)
- Glasses: `#333333` frames
- Skin: `#e0c0a0`

---

### 2.7 NPC Animation Summary

| NPC | Walk Sheet | Battle Sheet | Portrait Sheet | Walk Frames | Battle Poses | Portrait Expr |
|-----|------------|--------------|----------------|-------------|--------------|---------------|
| Police | ✅ | ✅ | ✅ | 24 | 5 | 5 |
| Corrupt Cop | ✅ | ✅ | ✅ | 24 | 5 | 5 |
| Rival | ✅ | ✅ | ✅ | 32 | 5 | 5 |
| Buyer | ✅ | ✅ | ✅ | 24 | 5 | 5 |
| Vendor | ✅ | ✅ | ✅ | 24 | 5 | 5 |
| Shop Owner | ✅ | ✅ | ✅ | 24 | 5 | 5 |

---

## 📦 3. Object Sprites (Animated)

### 3.1 Cardboard Box

**Sheet:** `cardboard-box-animated.png`  
**Frame Size:** 48×48  
**States:**

| State | Frames | Description |
|-------|--------|-------------|
| Idle | 1-4 | Static with subtle shadow shift (wind) |
| Damaged | 5-8 | Crushed appearance, flaps bent |
| Destroyed | 9-12 | Flattened, contents scattered |

**Timing:** 200ms/frame for idle, 150ms for damaged/destroyed

**Colors:**
- Cardboard: `#a08060` (tan brown)
- Tape: `#c0a080` (lighter tan)
- Interior: `#1a1a1a` (dark void)

---

### 3.2 Storage Unit

**Sheet:** `storage-unit-animated.png`  
**Frame Size:** 64×64  
**States:**

| State | Frames | Description |
|-------|--------|-------------|
| Closed | 1-2 | Roll-up door down, padlock visible |
| Opening | 3-8 | Door rolling up (6 frames) |
| Open | 9-10 | Door fully up, darkness inside |
| Closing | 11-16 | Door rolling down (6 frames) |

**Timing:** 100ms/frame for animation, 500ms hold for states

**Colors:**
- Door: `#4a4a5a` (metal gray)
- Ridges: `#3a3a4a` (darker)
- Lock: `#8b7355` (rusty brown)
- Frame: `#2a2a2a`

---

### 3.3 Workstation

**Sheet:** `workstation-animated.png`  
**Frame Size:** 64×48  
**States:**

| State | Hands | Description |
|-------|-------|-------------|
| Idle | None | Empty table, items stationary |
| Working | Yes | Hands moving, scale clicking, items shifting |
| Alert | Yes + phone | Burner phone ringing, LED flashing |

**Animation Details:**
- Idle: 2 frames (subtle item shift)
- Working: 8 frames (hands busy, scale moves)
- Alert: 4 frames (phone vibrates, LED pulses)

**Timing:** 150ms/frame working, 500ms idle

**Colors:**
- Table: `#3a2a1a` (dark wood)
- Scale: `#666666` (metal)
- Bags: `#1a1a1a` (black bags)
- LED: `#ff0000` (red) / `#00ff00` (green)

---

## 🎨 4. Color Palette Reference

All sprites must adhere to VISION.md color palette:

### Primary Colors
| Name | Hex | Usage |
|------|-----|-------|
| Asphalt Black | `#0a0a0a` | Shadows, backgrounds |
| Storm Gray | `#2d2d2d` | Floors, walls base |
| Burnt Orange | `#8b4513` | Rust, danger accents |
| Neon Amber | `#ffaa00` | Money, highlights |
| Neon Teal | `#00ffcc` | Safe, success |

### Secondary Colors
| Name | Hex | Usage |
|------|-----|-------|
| Danger Red | `#cc2222` | Heat, police, wounds |
| Graffiti Pink | `#ff00aa` | Rival territories |
| Mold Green | `#334433` | Decay, alleys |
| Steel Blue | `#334455` | Police uniforms |

### Character Skin Tones
| Type | Hex |
|------|-----|
| Light | `#e8c4a0` |
| Medium | `#d4a574` |
| Dark | `#a67c52` |

---

## 📁 5. File Naming Convention

```
assets/
├── sprites/
│   ├── player/
│   │   ├── player-walk.png
│   │   ├── player-battle.png
│   │   └── player-portraits.png
│   ├── npcs/
│   │   ├── npc-police-walk.png
│   │   ├── npc-police-battle.png
│   │   ├── npc-police-portraits.png
│   │   ├── npc-corrupt-cop-walk.png
│   │   └── ... (same pattern for all NPCs)
│   └── objects/
│       ├── cardboard-box-animated.png
│       ├── storage-unit-animated.png
│       └── workstation-animated.png
└── SPEC.md
```

---

## ⏱️ 6. Animation Timing Reference

| Animation Type | Frame Duration | FPS | Hold Time |
|----------------|----------------|-----|-----------|
| Player Walk | 100ms | 10 | N/A |
| NPC Walk (standard) | 120-160ms | 6-8 | N/A |
| NPC Walk (aggressive) | 100ms | 10 | N/A |
| Battle Idle | 150ms | 7 | 500ms |
| Battle Attack | 100ms | 10 | N/A |
| Battle Hurt | 80ms | 12 | N/A |
| Object Idle | 200-500ms | 2-5 | N/A |
| Object Working | 150ms | 7 | N/A |
| Object Door | 100ms | 10 | 500ms |

---

## 🔧 7. Implementation Notes

### For Artists
1. **Reference the palette** - All colors must come from VISION.md
2. **Shadows are critical** - Every character needs a shadow beneath feet
3. **Consistency** - Use same line weight and dithering patterns
4. **Expression is everything** - Portraits carry the narrative weight

### For Developers
1. **Sprite loading** - Implement frame caching for smooth playback
2. **Animation system** - Support: loop, ping-pong, once, hold-last
3. **State machine** - NPCs use state machine for battle animations
4. **Hitbox mapping** - Map animation frames to collision boxes

### For Future AI Generation
1. **Use DALL-E for reference** - Generate concept art first
2. **Manual pixel work** - Actual pixel art must be hand-crafted or use specialized tools
3. **Test at scale** - Preview at actual game size (32×32, 48×48)

---

## ✅ 8. Checklist

- [ ] Player walking (4 directions, 8 frames each)
- [ ] Player battle (5 poses, 4 frames each)
- [ ] Player portraits (5 expressions)
- [ ] Police walk, battle, portraits
- [ ] Corrupt Cop walk, battle, portraits
- [ ] Rival walk, battle, portraits
- [ ] Buyer walk, battle, portraits
- [ ] Vendor walk, battle, portraits
- [ ] Shop Owner walk, battle, portraits
- [ ] Cardboard box animation (3 states)
- [ ] Storage unit animation (4 states)
- [ ] Workstation animation (3 states)

---

*This spec provides the complete blueprint for The Trap's animated sprite needs. Use generate-animated.js to create placeholder silhouettes for development.*