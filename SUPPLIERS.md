# Gang Suppliers Documentation

This document describes the gang supplier system for the Trap game. Players can build relationships with different gang-affiliated suppliers to purchase raw materials at varying prices and quality levels.

## Overview

Suppliers are different from regular vendors in several key ways:

1. **Relationship-Based**: Suppliers have loyalty levels that affect pricing and product quality
2. **Rotating Availability**: New suppliers become available every few days
3. **Danger Levels**: Meeting locations have varying danger levels
4. **Quality Variations**: Each gang offers different product quality

## Available Suppliers

### 1. Mafia Boss (Italian-American)
- **Full Name**: Don Antonio Moretti
- **Origin**: Italian-American
- **Product Quality**: 120% (Premium)
- **Price**: 1.5x base
- **Reliability**: Very High (95%)
- **Danger Level**: Medium
- **Meeting Location**: Restaurant (Downtown)
- **Special**: Premium product, wants respect

### 2. Bloods Capo (West Coast)
- **Full Name**: Vicious O
- **Origin**: West Coast
- **Product Quality**: 100%
- **Price**: 1.0x base (Fair)
- **Reliability**: High (80%)
- **Danger Level**: High
- **Meeting Location**: Alley (Hood)
- **Special**: Good prices, dangerous area

### 3. Crips Lieutenant (West Coast)
- **Full Name**: Big Blue
- **Origin**: West Coast
- **Product Quality**: 110%
- **Price**: 0.9x base (Volume discount)
- **Reliability**: High (85%)
- **Danger Level**: High
- **Meeting Location**: Parking Lot (Hood)
- **Special**: Protective, bulk discounts

### 4. Latin King (Latin Gang)
- **Full Name**: Rey Sol
- **Origin**: Latin Gang
- **Product Quality**: 100%
- **Price**: 1.0x base
- **Reliability**: High (90%)
- **Danger Level**: Medium
- **Meeting Location**: Warehouse (Industrial)
- **Special**: Wants loyalty, fair prices

### 5. MS-13 (Central American)
- **Full Name**: La Araña
- **Origin**: Central American
- **Product Quality**: 90%
- **Price**: 0.7x base (Cheap!)
- **Reliability**: Low (60%)
- **Danger Level**: Extreme
- **Meeting Location**: Safehouse (Skid Row)
- **Special**: Very cheap but very dangerous

### 6. 18th Street (Central American)
- **Full Name**: El Diablo
- **Origin**: Central American
- **Product Quality**: 95%
- **Price**: 0.85x base
- **Reliability**: Medium (70%)
- **Danger Level**: High
- **Meeting Location**: Tunnel (Underground)
- **Special**: Rival to MS-13, competitive pricing

### 7. Triad Boss (Chinese)
- **Full Name**: Dragon Master Chen
- **Origin**: Chinese
- **Product Quality**: 130% (Best!)
- **Price**: 1.4x base
- **Reliability**: Very High (95%)
- **Danger Level**: Medium
- **Meeting Location**: Restaurant (Chinatown)
- **Special**: Best quality, secret meetings

### 8. Yakuza Lieutenant (Japanese)
- **Full Name**: Tanaka-san
- **Origin**: Japanese
- **Product Quality**: 125%
- **Price**: 1.6x base
- **Reliability**: High (90%)
- **Danger Level**: Medium
- **Meeting Location**: Dojo (Downtown)
- **Special**: Expensive but top quality

### 9. Irish Mob (Irish-American)
- **Full Name**: Mick O'Brien
- **Origin**: Irish-American
- **Product Quality**: 100%
- **Price**: 0.9x base
- **Reliability**: High (80%)
- **Danger Level**: High
- **Meeting Location**: Bar (Southside)
- **Special**: Good prices, fights dirty

### 10. Hells Angels (Biker Gang)
- **Full Name**: Skullcrusher
- **Origin**: Biker Gang
- **Product Quality**: 100%
- **Price**: 1.0x base
- **Reliability**: High (85%)
- **Danger Level**: High
- **Meeting Location**: Clubhouse (Industrial)
- **Special**: Reliable, rough area

## Loyalty System

### Gaining Loyalty
- **Buying Supplies**: Small loyalty boost (0.5) per purchase
- **Building Loyalty**: Spend $100 for +1 loyalty

### Loyalty Benefits
- **5+ Loyalty**: 10% price reduction
- **10 Loyalty**: 10% quality bonus + best prices

### Loyalty Decay
- Missing meetings causes loyalty to decay
- Each missed interaction: -1 loyalty

## Meeting Locations

| Location | Danger | Vibe |
|----------|--------|------|
| Restaurant | Low | Classy |
| Dojo | Low | Classy |
| Alley | High | Street |
| Parking Lot | Medium | Neutral |
| Warehouse | Medium | Industrial |
| Safehouse | High | Underground |
| Tunnel | High | Underground |
| Bar | Medium | Rough |
| Clubhouse | High | Rough |

## Danger Levels

- **Low**: Safe meetings, minimal risk
- **Medium**: Some risk, generally safe
- **High**: Dangerous areas, risk of confrontation
- **Extreme**: Very risky, potential for violence

## Product Quality

Quality affects how much product you get when processing:
- 90% quality = less yield per raw material
- 130% quality = more yield per raw material

## Usage

```javascript
// Initialize in game scene
this.supplierSystem = new SupplierMeetingSystem(this);
this.supplierUI = new SupplierUI(this);

// Generate new supplier cycle
const suppliers = this.supplierSystem.generateSupplierCycle();

// Open supplier meeting UI
this.supplierUI.open(selectedSupplier);

// Get pricing
const price = this.supplierSystem.getPrice(supplierId);
const quality = this.supplierSystem.getQuality(supplierId);

// Modify loyalty
this.supplierSystem.modifyLoyalty(supplierId, amount);

// Save/load
saveData.supplierRelations = this.supplierSystem.getRelations();
this.supplierSystem.loadRelations(saveData.supplierRelations);
```

## Sprite Files

Each supplier requires the following sprites in `/assets/sprites/suppliers/[gang-id]/`:

### Walking Sprites (4 directions)
- `walk-down.ppm`
- `walk-left.ppm`
- `walk-right.ppm`
- `walk-up.ppm`

### Battle Sprites
- `battle-idle.ppm`
- `battle-attack.ppm`
- `battle-defend.ppm`
- `battle-hurt.ppm`
- `battle-dead.ppm`

### Portraits
- `portrait-happy.ppm`
- `portrait-neutral.ppm`
- `portrait-angry.ppm`
- `portrait-hurt.ppm`
- `portrait-dead.ppm`
