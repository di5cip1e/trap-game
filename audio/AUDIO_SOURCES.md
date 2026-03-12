# 🎵 Trap Game - Royalty-Free Audio Sources Guide

> FLUX's audio research for the Trap game. Gritty underworld vibes required.

## Recommended Sources

### 1. **Freesound.org** (CC0 / CC-BY)
- **URL:** https://freesound.org
- **License:** CC0 (most reliable) + CC-BY (credit required)
- **Best for:** SFX, one-shots, specific sound effects
- **Tip:** Search with `CC0` filter for royalty-free

### 2. **Pixabay Music** (Royalty-Free)
- **URL:** https://pixabay.com/music/
- **License:** Royalty-free, no attribution required
- **Best for:** Background music, ambient

### 3. **OpenGameArt.org** (CC0 / CC-BY)
- **URL:** https://opengameart.org/content/sound-effects
- **License:** CC0, CC-BY, CC-BY-SA
- **Best for:** Game-specific SFX, themed packs

### 4. **ZapSplat** (Royalty-Free)
- **URL:** https://zapsplat.com
- **License:** Royalty-free for commercial use
- **Best for:** Professional-quality SFX

---

## 🎯 Sound Mapping Guide

### SFX - Sound Effects

| Needed Sound | Recommended Source | Search Terms | Notes |
|--------------|-------------------|--------------|-------|
| **FOOTSTEP** | Freesound | `footsteps concrete CC0` | Get multiple for variation |
| **UI_CLICK** | ZapSplat | `button click interface` | Short, crisp |
| **UI_HOVER** | ZapSplat | `hover interface` | Subtle tick |
| **CASH_REGISTER** | Freesound | `cash register CC0` | Classic "cha-ching" |
| **POLICE_SIREN** | Freesound | `police siren CC0` | Get 2-3 variations |
| **ARREST_ALARM** | Freesound | `alarm bell CC0` | Harsh/alarming |
| **DOOR_OPEN** | Freesound | `door creak open CC0` | Creaky door fits theme |
| **DOOR_CLOSE** | Freesound | `door close slam CC0` | Heavy thud |
| **ITEM_PICKUP** | ZapSplat | `pickup collect coin` | Satisfying grab |
| **BATTLE_PUNCH** | Freesound | `punch impact CC0` | Meatier = better |
| **BATTLE_DEFEND** | Freesound | `block parry CC0` | Metallic clang |
| **BATTLE_HURT** | Freesound | `hurt pain grunt CC0` | Grunt/take hit |
| **SUCCESS_JINGLE** | OpenGameArt | `victory jingle` | Short triumphant |
| **FAILURE_JINGLE** | OpenGameArt | `defeat failure` | Short, somber |
| **HEAT_WARNING** | Freesound | `warning beep alert` | Urgent beep pattern |
| **BELL_NOTIFICATION** | ZapSplat | `notification bell` | Service bell style |

### 🎵 Music

| Needed Sound | Recommended Source | Search Terms | Notes |
|--------------|-------------------|--------------|-------|
| **MUSIC_STREET** | Pixabay | `urban hip hop` or `street tension` | Gritty, looping |
| **MUSIC_SAFEHOUSE** | Pixabay | `lo-fi chill` or `calm ambient` | Restful, warm |
| **MUSIC_BATTLE** | Pixabay | `action intense battle` | High energy, fast |
| **MUSIC_MENU** | Pixabay | `atmospheric suspense` | Dark, mysterious |

### 🌆 Ambient

| Needed Sound | Recommended Source | Search Terms | Notes |
|--------------|-------------------|--------------|-------|
| **AMBIENT_CITY** | Freesound | `city ambience urban CC0` | Busy street noise |
| **AMBIENT_TRAFFIC** | Freesound | `traffic distant CC0` | Cars passing |
| **AMBIENT_RAIN** | Freesound | `rain heavy CC0` | Good for night scenes |
| **AMBIENT_DISTANT_SIRENS** | Freesound | `sirens distant CC0` | Wailing in distance |

---

## 📥 Download & Organization

### Quick Start Script
```bash
# Create directories
mkdir -p audio/sfx audio/music audio/ambient

# Suggested file naming (match SoundManager.js)
# audio/sfx/footstep.mp3
# audio/sfx/ui_click.mp3
# audio/sfx/cash_register.mp3
# ...etc
```

### Batch Download Tip
For Freesound, use their bulk download feature or tools like:
- **Freesound Downloader** (Python script)
- **SoundSnap** (premium, but quality)

---

## 🔧 Integration Checklist

- [x] Web Audio API synthesized sounds (works out of box!)
- [ ] Download all SFX from sources above (optional - for higher quality)
- [ ] Convert to MP3 format (if not already)
- [ ] Place in correct `audio/sfx/`, `audio/music/`, `audio/ambient/` directories
- [x] SoundManager.js has built-in synthesized audio fallback
- [ ] Test all sound triggers in-game
- [ ] Balance volume levels (SFX: 0.7, Music: 0.5, Ambient: 0.4)

---

## 🎮 Sound Implementation Status

**Current Status: WORKING** ✅

The SoundManager.js now includes Web Audio API synthesized sounds that work out of the box without any external audio files. Each sound type has a unique synthesized sound:

| Sound | Synthesized Sound |
|-------|------------------|
| FOOTSTEP | Low thud + noise burst |
| UI_CLICK | High click (two tones) |
| UI_HOVER | Subtle tick |
| CASH_REGISTER | "Cha-ching" (ascending tones) |
| POLICE_SIREN | Wailing siren (oscillating) |
| ARREST_ALARM | Harsh alarm |
| DOOR_OPEN | Creaky sound |
| DOOR_CLOSE | Heavy thud |
| ITEM_PICKUP | Satisfying ding |
| BATTLE_PUNCH | Impact noise |
| BATTLE_DEFEND | Metallic clang |
| BATTLE_HURT | Grunt-like noise |
| SUCCESS_JINGLE | Victory fanfare (C-E-G) |
| FAILURE_JINGLE | Defeat descending (G-F-D) |
| HEAT_WARNING | Triple beep |
| BELL_NOTIFICATION | Service bell |

**Music (ambient drones):**
- MUSIC_STREET: Gritty bass drone with LFO
- MUSIC_SAFEHOUSE: Calm Am chord drone
- MUSIC_BATTLE: Aggressive square waves
- MUSIC_MENU: Dark mysterious tones

**Optional Enhancement:** Add real .mp3 files to `audio/sfx/` and `audio/music/` for higher quality sounds. The SoundManager will优先 use loaded files when available.

---

## 💡 Pro Tips

1. **Footsteps variation:** Download 4-5 footstep sounds and randomly pick between them during gameplay to avoid repetition

2. **Sirens:** Get both "approaching" and "departing" variants for depth

3. **Street music:** Look for "beat" or "instrumental hip-hop" without vocals - cleaner for gameplay

4. **Safehouse:** "Lo-fi beats" or "coffee shop ambience" works great for cozy undertones

5. **Test early:** Audio can make or break immersion - test frequently

---

## 📋 Quick Reference: File Paths

```
audio/
├── sfx/
│   ├── footstep.mp3
│   ├── ui_click.mp3
│   ├── ui_hover.mp3
│   ├── cash_register.mp3
│   ├── police_siren.mp3
│   ├── arrest_alarm.mp3
│   ├── door_open.mp3
│   ├── door_close.mp3
│   ├── item_pickup.mp3
│   ├── battle_punch.mp3
│   ├── battle_defend.mp3
│   ├── battle_hurt.mp3
│   ├── success.mp3
│   ├── failure.mp3
│   ├── heat_warning.mp3
│   └── bell_notification.mp3
├── music/
│   ├── street.mp3
│   ├── safehouse.mp3
│   ├── battle.mp3
│   └── menu.mp3
└── ambient/
    ├── city.mp3
    ├── traffic.mp3
    ├── rain.mp3
    └── distant_sirens.mp3
```

---

*FLUX | Lead Engineer | Audio Research Complete*  
*Sources verified: Freesound, Pixabay, OpenGameArt, ZapSplat*
