# 🎮 TRAP - Audio Quick Reference Card

## SoundManager.js Keys → Source Mapping

### SFX (One-Shot Sounds)
```
FOOTSTEP         → freesound.org "footsteps concrete CC0"
UI_CLICK         → zapsplat.com "button click interface"  
UI_HOVER         → zapsplat.com "hover interface"
CASH_REGISTER    → freesound.org "cash register CC0"
POLICE_SIREN     → freesound.org "police siren CC0"
ARREST_ALARM     → freesound.org "alarm bell CC0"
DOOR_OPEN        → freesound.org "door creak open CC0"
DOOR_CLOSE       → freesound.org "door close slam CC0"
ITEM_PICKUP      → zapsplat.com "pickup collect coin"
BATTLE_PUNCH     → freesound.org "punch impact CC0"
BATTLE_DEFEND    → freesound.org "block parry CC0"
BATTLE_HURT      → freesound.org "hurt pain grunt CC0"
SUCCESS_JINGLE   → opengameart.org "victory jingle"
FAILURE_JINGLE   → opengameart.org "defeat failure"
HEAT_WARNING     → freesound.org "warning beep alert"
BELL_NOTIFICATION → zapsplat.com "notification bell"
```

### Music (Looping Background)
```
MUSIC_STREET     → pixabay.com "urban hip hop" / "street tension"
MUSIC_SAFEHOUSE  → pixabay.com "lo-fi chill" / "calm ambient"  
MUSIC_BATTLE     → pixabay.com "action intense battle"
MUSIC_MENU       → pixabay.com "atmospheric suspense"
```

### Ambient (Looping Background Layers)
```
AMBIENT_CITY     → freesound.org "city ambience urban CC0"
AMBIENT_TRAFFIC  → freesound.org "traffic distant CC0"
AMBIENT_RAIN     → freesound.org "rain heavy CC0"
AMBIENT_DISTANT_SIRENS → freesound.org "sirens distant CC0"
```

## Trigger Usage
```javascript
import SoundManager, { SOUND_TRIGGERS, ZONE_MUSIC } from './audio/SoundManager.js';

// UI click
this.soundManager.play(SOUND_TRIGGERS.onButtonClick);

// Buying stuff
this.soundManager.play(SOUND_TRIGGERS.onBuy);  // Plays CASH_REGISTER

// Entering safehouse  
this.soundManager.playMusic(ZONE_MUSIC.SAFEHOUSE);

// Combat!
this.soundManager.playMusic(ZONE_MUSIC.BATTLE);
```

## File Format Requirements
- **Format:** MP3 (primary), OGG (fallback)
- **Loopable:** Music & Ambient must seamless loop
- **Duration:** SFX should be <3 seconds
- **Variation:** Get multiple footstep variants

---
*Full guide: AUDIO_SOURCES.md*
