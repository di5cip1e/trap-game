# TRAP Project - Master Issue Tracker

## Compiled from 9 Agent Audits (2026-03-11)

---

## 🔴 CRITICAL (P0 - Must Fix)

### Race/Content Issues
- [ ] Race as gameplay mechanic (config.js) - Replace with fictional gang affiliations
- [ ] Real-world gangs in SUPPLIERS.md (Bloods, Crips, MS-13, Triad, Yakuza) - Replace with fictional

### Broken Systems
- [ ] Status effect damage never applied (CombatScene.js line ~720)
- [ ] Quest completion logic broken - wrong object reference (QuestSystem.js:312)
- [ ] Race bonus not restored on load (SaveLoadSystem.js)
- [ ] Loyalty bonus typo: LOALTY vs LOYALTY (SupplierMeetingSystem.js:563)

### Combat Balance
- [ ] Berserk + Unbreakable = immortality (CombatScene.js)
- [ ] Economy too easy - 300% ROI (config.js)

### Broken Assets
- [ ] Delete 49 broken PNG files (contain XML error responses)

---

## 🟠 HIGH PRIORITY (P1)

### Code Quality
- [ ] Implement pistol ammo system (defined but not tracked)
- [ ] Fix memory leaks - tween accumulation in QuestSystem
- [ ] Add null checks in save/load for questSystem
- [ ] Fix duplicate XP granting (double rewards possible)

### World/Design
- [ ] Wire up generateNeighborhoodGrid() for world navigation
- [ ] Add neighborhood selection to CharacterCreation
- [ ] Implement building entry via POI triggers
- [ ] Add contested zone patrol/encounter logic

### Narrative
- [ ] Choose ONE canonical backstory - merge/remove duplicate STORY.md
- [ ] Clarify safehouse tier progression
- [ ] Fix faction relationship matrix (Ghost = all neutral makes no sense)

### Visual Assets
- [ ] Resize assets to actual display size (tiles 64x64, sprites 256x256)
- [ ] Delete 213 unused .ppm files

---

## 🟡 MEDIUM PRIORITY (P2)

### UI/UX
- [ ] Create responsive base class for UI positioning
- [ ] Add keyboard navigation (ESC to close)
- [ ] Standardize button component
- [ ] Add scroll handling for Safehouse stash
- [ ] Define depth constants (HUD: 500-599, Panels: 900-999, etc.)

### Systems
- [ ] Fix HP scaling (makes late-game trivial)
- [ ] Fix XP curve too flat
- [ ] Add equipment unequip/sell-back
- [ ] Rival doesn't respawn

### Rendering
- [ ] Add sprite atlases for related assets
- [ ] Convert to local asset loading
- [ ] Add CONFIG.SCALE constants
- [ ] Add loading progress bar
- [ ] Add view culling for off-screen tiles

### Narrative
- [ ] Add Wall lore or remove from map
- [ ] Add police/law enforcement context
- [ ] Add history of The Docks
- [ ] Standardize location names

---

## 🟢 LOW PRIORITY (P3)

### Code Quality
- [ ] Split GameScene (3000 lines) into subsystems
- [ ] Add event emitter for component communication
- [ ] Create state machine for game modes
- [ ] Add JSDoc comments
- [ ] Remove magic numbers → CONFIG constants
- [ ] Add error boundaries

### UI/UX
- [ ] Add ARIA labels for accessibility
- [ ] Color-blind friendly status icons
- [ ] Consistent typography scale
- [ ] Add tooltip for all systems
- [ ] Add tutorial UI

### Visual Assets
- [ ] Create actual sprite sheets at proper game resolution
- [ ] Add animation frames (need 6-8, have 1-2)
- [ ] Resolve character design consistency
- [ ] Fill empty NPC folders

---

## 📋 ISSUES BY AGENT DOMAIN

### Pixel (UI/UX) - 65+ issues
- Responsive base class, keyboard nav, button standardization, scroll handling, depth constants

### Mirren (Visual Assets) - 49 broken files
- Delete broken PNGs, delete PPM files, resize assets

### Cipher (AI)
- Status effect damage, police pathfinding, enemy behaviors

### Circuit (Systems)
- Quest logic, save/load, economy balance, berserk/immortal

### Tomothy (World)
- Wire up neighborhood grid, POI triggers, contested zones

### Wren (Narrative)
- Single backstory, remove real gangs, fix faction relations

### Prism (Rendering)
- Sprite atlases, local loading, scale constants, loading bar

### Quill (QA)
- Equipment unequip, code consistency

### Flux (Code Quality)
- Ammo system, memory leaks, null checks, GameScene refactor

---

## PROGRESS TRACKING

| Category | Total | Done | In Progress |
|----------|-------|------|-------------|
| Critical (P0) | 10 | 0 | 0 |
| High (P1) | 13 | 0 | 0 |
| Medium (P2) | 21 | 0 | 0 |
| Low (P3) | 18 | 0 | 0 |
| **TOTAL** | **62** | **0** | **0** |