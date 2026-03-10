# Phase 9: Dynamic Calendar Events - Implementation Summary

## Overview
Implemented a 7-day weekly calendar system with recurring and random market events that create strategic decision points and dynamic gameplay conditions.

## Key Features Implemented

### 1. Calendar System
- **7-Day Weekly Cycle:** Days repeat as Monday through Sunday (Week 1, Week 2, etc.)
- **Day Tracking:** Shows current day of week, week number, and absolute day count
- **Event Scheduling:** Automatic event activation based on calendar position

### 2. Event Types

#### THE CRACKDOWN (Day 7 - Every Sunday)
**Always Active on Day 7 of Every Week**

**Effects:**
- Police spawn rates doubled (increased patrol presence)
- Heat gain from sales doubled (2x as dangerous)
- Forces extra police spawn even if heat is below normal threshold

**Strategic Impact:**
- Sundays become high-risk days for street operations
- Players should focus on production/preparation on Day 7
- High-heat players face extreme danger
- Encourages using runners or stockpiling product for safer days

#### THE DROUGHT (Random 2 Consecutive Days per Week)
**Randomly Occurs Days 1-6 (Never on Crackdown Day)**

**Effects:**
- Raw material costs **doubled** ($50 → $100 per unit)
- Product sell price **doubled** ($100 → $200 per unit)
- Affects both player sales and runner sales
- Visual indicators in vendor UI

**Strategic Impact:**
- High-risk, high-reward market conditions
- Buying raw materials during drought is expensive
- Selling during drought yields massive profits
- Smart players stockpile product before drought hits
- Encourages prediction and planning around weekly schedule

**Scheduling Logic:**
- Drought assigned at start of each week
- Always 2 consecutive days (e.g., Mon-Tue, Wed-Thu, Fri-Sat)
- Never includes Day 7 (Crackdown Day)
- Random start day chosen from Days 1-5

### 3. Visual Integration

#### HUD Display
- **Day of Week:** Shows "Monday (Week 1)" format below time
- **Active Event Banners:** Center-screen warnings when events are active
  - "⚠ THE CRACKDOWN ⚠" in red
  - "⚠ THE DROUGHT ⚠" in gold
- **Event Descriptions:** One-line explanation of effects
- **Persistent Display:** Events remain visible throughout the day

#### Sleep/Wake Message
- Morning message now includes day of week
- Active events announced when waking up
- Color-coded event warnings (red for danger, gold for opportunity)
- Extended display time when events are active (3.5s vs 2s)

#### Vendor UI
- Current raw material price displayed with multiplier color coding
- "DROUGHT - 2X PRICE!" warning when active
- Price updates dynamically based on calendar

### 4. Gameplay Integration

#### Heat System
```javascript
// Crackdown doubles heat gain
heatGain = BASE_HEAT_GAIN * crackdownMultiplier
// Day 7: +10% heat instead of +5%
```

#### Pricing System
```javascript
// Raw materials during drought
rawCost = $50 * 2 = $100

// Product sales during drought (with heat penalty)
salePrice = $100 * (1 - heatPenalty) * droughtMultiplier
// Example with 0 heat: $100 * 1 * 2 = $200
```

#### Runner Integration
- Runners benefit from drought pricing automatically
- Runner bust chance unaffected by calendar (only Intuition matters)
- Daily fee charged regardless of events

### 5. Strategic Gameplay Loop

**Weekly Strategy Example:**

**Monday-Tuesday (Drought):**
- Avoid buying raw materials (2x cost)
- Sell all stockpiled product for massive profit
- Focus on non-economic activities

**Wednesday-Friday (Normal):**
- Buy raw materials at normal price
- Process into product
- Accumulate inventory for next drought

**Saturday (Preparation):**
- Finish production
- Assign product to runners
- Prepare for crackdown

**Sunday (Crackdown Day):**
- Stay off streets (heat doubles!)
- Let runners handle sales if employed
- Focus on safehouse activities
- Plan for next week

## Technical Implementation

### Files Created
1. **`/CalendarSystem.js`** - Core calendar and event management
   - Week/day tracking
   - Event scheduling logic
   - Multiplier calculations
   - Event state queries

### Files Modified
1. **`/config.js`**
   - Added calendar constants (week length, event multipliers)
   - Event duration and scheduling parameters

2. **`/GameScene.js`**
   - Integrated CalendarSystem initialization
   - Updated onNewDay() to advance calendar
   - Applied heat multiplier to street sales
   - Applied drought multiplier to product prices
   - Extra police spawn during crackdown

3. **`/VendorUI.js`**
   - Added getCurrentRawPrice() method
   - Displays dynamic pricing based on drought
   - Visual drought indicator
   - Color-coded price display

4. **`/SafehouseUI.js`**
   - Enhanced sleep message with calendar info
   - Event announcements on waking
   - Dynamic message timing based on events

5. **`/HUD.js`**
   - Calendar display showing day/week
   - Active event banner system
   - Event description tooltips
   - Dynamic event text management

## Balance Considerations

### The Crackdown (Every 7 Days)
- **Frequency:** Predictable, 1/7 days = ~14% of time
- **Severity:** Doubles danger, highly punishing
- **Counterplay:** Plan around it, use runners, avoid streets

### The Drought (2/7 Days, Random)
- **Frequency:** ~28% of time (2 out of 7 days)
- **Impact:** High-risk economy, forces strategic timing
- **Profit Potential:** 2x revenue = 100% profit increase during event

### Combined Risk
- Drought and Crackdown **never overlap** (by design)
- Max risk days: 3/7 (Crackdown + Drought)
- Normal operation: 4/7 days minimum

### Economic Math Examples

**Drought Profit Calculation:**
- Processing: 1 Raw ($50) → 2 Product (base)
- Normal Sale: 2 × $100 = $200 revenue, $150 profit (300% ROI)
- Drought Sale: 2 × $200 = $400 revenue, $350 profit (700% ROI)
- **Strategic Value:** Stockpile 10 product before drought = +$1000 extra profit

**Crackdown Risk:**
- Normal heat: +5% per sale
- Crackdown heat: +10% per sale
- Police spawn at 50% heat
- Crackdown: Reach danger threshold in 5 sales vs 10 sales
- **Risk Mitigation:** Use runners (no heat for player)

## Future Enhancement Ideas
- Weather events affecting movement speed
- Holiday events with special bonuses/penalties
- Rival gang territories changing weekly
- News system explaining why events are happening
- "Market Intel" NPCs who predict next week's drought
- Weekly "Boss Missions" that must be completed by Sunday
- Seasonal events (4-week cycles with meta-changes)
- Player-triggered events (e.g., "The Heist" special day)

## Testing Checklist
- [x] Calendar advances correctly day by day
- [x] Week counter increments after day 7
- [x] Crackdown always occurs on day 7
- [x] Drought randomly assigned each week (2 consecutive days)
- [x] Drought never occurs on day 7
- [x] Heat doubles during crackdown
- [x] Raw material costs double during drought
- [x] Product prices double during drought
- [x] HUD shows correct day of week
- [x] Event banners display when active
- [x] Sleep message shows events
- [x] Vendor UI reflects drought pricing
- [x] Runner sales use drought multiplier
- [x] Police spawn more during crackdown

## Player Experience

**Visual Feedback:**
- Immediate awareness of events via center-screen banners
- Color coding makes threats/opportunities clear
- Day-of-week display helps with planning

**Strategic Depth:**
- Weekly rhythm creates predictable danger windows
- Drought randomness keeps gameplay fresh
- Risk/reward calculations shift based on calendar
- Multiple viable strategies (street sales vs runners vs hoarding)

**Narrative Flavor:**
- "Crackdown" implies police pressure/political will
- "Drought" suggests supply chain disruption
- Events feel like natural market forces, not arbitrary mechanics
