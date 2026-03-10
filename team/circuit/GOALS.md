# GOALS.md - Circuit

## Current Sprint Goals

### Priority 1: Stabilize & Audit
- [ ] Review QA bug report (5 bugs identified)
- [ ] Fix biome string comparisons (IncomeSystem.js, BattleSystem.js)
- [ ] Connect DiplomacyManager to WorldManager
- [ ] Verify all systems load without errors

### Priority 2: Victory Conditions
- [ ] Design VictorySystem framework
- [ ] Implement 5 victory types (Domination, Diplomatic, Economic, Conquest, Prestige)
- [ ] Create defeat conditions (elimination, optional bankruptcy)
- [ ] Build end-game UI (victory/defeat modals, stats summary)

### Priority 3: Event System
- [ ] Design EventSystem framework
- [ ] Implement 15+ random events (natural, political, military, mystery)
- [ ] Integrate events into game loop (every 10-20 turns)
- [ ] Create event UI (notifications, decision prompts)

### Priority 4: Technology Tree
- [ ] Design TechTree framework
- [ ] Implement 3 tech categories (Military, Economic, Civic) with 4 tiers each
- [ ] Build research points system
- [ ] Create tech UI panel

## Success Metrics

- [ ] Full game playable start-to-victory in <60 minutes
- [ ] No critical bugs in core loop
- [ ] All 5 victory types achievable
- [ ] At least 20 unique events triggering
- [ ] Tech tree provides meaningful progression