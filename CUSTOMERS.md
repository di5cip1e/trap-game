# Trap Game - Customer System Documentation

## Overview

The customer system introduces diverse customer types to the drug dealing gameplay in Trap. Each customer type has unique behaviors, pricing, spawn rates, and special interactions.

---

## Customer Types

### 1. Junkie
- **Description:** Desperate, shaky, will do anything for a fix
- **Spawn Rate:** Common
- **Price Multiplier:** 0.6x (pays 60% of base price - desperate!)
- **Purchase Amount:** 1 unit
- **Special Behavior:** Steal - 15% chance to steal product and run
- **Dialog:**
  - "Got anything... anything at all?"
  - "I need it so bad, man..."
  - "Please, I'll pay whatever you want"
  - "*shaking* Just one hit..."
  - "I got cash, I got cash! Look!"

**Strategy:** Low profit but high risk. Watch for steal attempts!

---

### 2. Casual User
- **Description:** Weekend user, middle-class customer
- **Spawn Rate:** Common
- **Price Multiplier:** 1.0x (fair market price)
- **Purchase Amount:** 2 units
- **Special Behavior:** None - straightforward transactions
- **Dialog:**
  - "Hey, got any good stuff?"
  - "Just getting some for the weekend"
  - "What's the quality like today?"
  - "I'll take a couple, thanks"

**Strategy:** Reliable, fair customers. Your bread and butter.

---

### 3. Party Guy
- **Description:** Wealthy, spends big at night
- **Spawn Rate:** Uncommon
- **Price Multiplier:** 1.3x (pays 30% premium)
- **Purchase Amount:** 4 units
- **Special Behavior:** Quality - pays extra 20% for good quality product
- **Time Preference:** Night (more likely to spawn at night)
- **Dialog:**
  - "Need something for tonight's party!"
  - "Got the good stuff? Money's no problem"
  - "Hook me up, I got a big night ahead"
  - "Premium only, I deserve the best"

**Strategy:** High profit, especially at night. Stock up on quality product!

---

### 4. Hipster
- **Description:** Thinks they're above the street life
- **Spawn Rate:** Common
- **Price Multiplier:** 0.9x (slightly below market)
- **Purchase Amount:** 1 unit
- **Special Behavior:** Judge - makes comments about product quality
- **Dialog:**
  - "Is this... authentic?"
  - "I prefer organic, you know what I mean"
  - "My dealer usually gets me the artisanal stuff"
  - "I mean, I'm not really into this scene, but..."

**Strategy:** Lower profit, but can be entertaining. Won't cause problems.

---

### 5. Old Head
- **Description:** Been in the game forever, wise
- **Spawn Rate:** Rare
- **Price Multiplier:** 1.2x (pays well)
- **Purchase Amount:** 3 units
- **Special Behavior:** Tip - 25% chance to give $50 bonus
- **Dialog:**
  - "I've seen it all, kid... respect the game"
  - "Word of advice: don't mix business with pleasure"
  - "You got good stuff? Been around long enough to tell"
  - "The game's changed, but the money's still green"

**Strategy:** Great customers! Pays well and might give tips. Listen for advice.

---

### 6. Undercover Cop
- **Description:** Buys to entrap players - DANGEROUS!
- **Spawn Rate:** Rare
- **Price Multiplier:** 1.0x (normal price)
- **Purchase Amount:** 2 units
- **Special Behavior:** Bust - will arrest if heat is high enough
- **Hidden Identity:** Yes (shows as "CUSTOMER" until interaction)
- **Can Be Bribed:** Yes ($500 bribe reduces heat)
- **Dialog:**
  - "Hey, I'm looking for something"
  - "A friend told me you might have what I need"
  - "What's a good price these days?"
  - "Just a small amount, for a friend"

**Strategy:** ⚠️ DANGER! Keep your heat low. If you have $500, you can bribe them. High heat increases bust chance significantly!

---

### 7. Gangbanger
- **Description:** Buys for the crew - bulk orders
- **Spawn Rate:** Uncommon
- **Price Multiplier:** 1.1x (slightly above market)
- **Purchase Amount:** 5 units (bulk!)
- **Special Behavior:** Bulk - always wants larger amounts
- **Dialog:**
  - "I need a good amount for the crew"
  - "My people need supplies"
  - "Don't mess with me, just give me the product"
  - "Got a big order coming, be ready"

**Strategy:** Good for moving lots of product at once. Build up inventory before dealing.

---

### 8. Tourist
- **Description:** Out of towner looking for a good time - easy money!
- **Spawn Rate:** Very Rare (5% chance)
- **Price Multiplier:** 1.5x (huge 50% premium!)
- **Purchase Amount:** 2 units
- **Special Behavior:** Easy - straightforward, won't cause trouble
- **Dialog:**
  - "So this is where the magic happens?"
  - "My buddy told me this is the spot"
  - "Whoa, this is kinda intense, man"
  - "Like, can you hook a brother up?"

**Strategy:** 🎰 Rare but profitable! They're naive and pay premium prices. Don't miss an opportunity!

---

## Spawn Rates

| Type | Rate | Weight |
|------|------|--------|
| Junkie | Common | 50 |
| Casual | Common | 50 |
| Hipster | Common | 50 |
| Party Guy | Uncommon | 30 |
| Gangbanger | Uncommon | 30 |
| Old Head | Rare | 15 |
| Cop | Rare | 15 |
| Tourist | Very Rare | 5 |

**Note:** Party Guys are more likely to spawn at night.

---

## Special Interactions

### Steal (Junkie)
- 15% chance to steal 1-2 product instead of buying
- They run away immediately after stealing
- Adds +10 heat from the theft

### Tip (Old Head)
- 25% chance to receive $50 bonus on sale
- Random dialog hints at game strategy

### Quality Bonus (Party Guy)
- If you have high-quality product (from better processing), they pay 20% extra

### Bribe (Undercover Cop)
- If you have $500, can bribe to avoid arrest
- Bribe reduces heat by 30 points
- If heat is too high, they might bust anyway

### Bust (Undercover Cop)
- Bust chance scales with heat level (0-80%)
- If busted: lose 50% product + 30% cash + 30 heat
- Can escape via combat minigame

---

## Customer UI Indicators

- **Junkie:** [E] JUNKIE (yellow)
- **Casual:** [E] CASUAL USER (primary)
- **Party Guy:** [E] PARTY GUY (primary)
- **Hipster:** [E] HIPSTER (primary)
- **Old Head:** [E] OLD HEAD (success green)
- **Undercover Cop:** [E] CUSTOMER (white - hidden identity!)
- **Gangbanger:** [E] GANGBANGER (danger red)
- **Tourist:** [E] TOURIST (primary)

---

## Tips for Managing Customers

1. **Diversify your customers** - Don't rely on just one type
2. **Watch for cops** - Keep heat below 50 to avoid undercover busts
3. **Stock up for Party Guys** - They buy in bulk at night for premium prices
4. **Listen to Old Heads** - Their tips can help your strategy
5. **Don't trust everyone** - Junkies might steal, cops might bust
6. **Treasure Tourists** - They're rare but pay the best!

---

## Technical Notes

- Customer sprites stored in: `/assets/sprites/npcs/[type]/`
- Each customer has walking sprites (4 directions) and portraits (5 emotions)
- Customer type determines sprite set used
- Undercover cops use different sprite key to hide identity
- Customer selection happens at daily spawn based on weighted random pool