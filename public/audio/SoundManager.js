/**
 * SoundManager.js - Audio system for Trap game
 * Handles all sound effects, music, and ambient audio
 * 
 * Features:
 * - Web Audio API for generated placeholder sounds (works out of box!)
 * - Real audio file loading support (when .mp3 files exist)
 * - Volume control per category
 * - Music crossfading
 * - Ambient sound layers
 * 
 * Usage:
 *   import SoundManager from './audio/SoundManager.js';
 *   const soundManager = new SoundManager(scene);
 *   soundManager.play('FOOTSTEP');
 *   soundManager.playMusic('MUSIC_STREET');
 */

import Phaser from 'phaser';

// Web Audio API context singleton
let audioContext = null;

function getAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

// Audio asset paths
export const AUDIO_PATHS = {
    // Sound Effects
    FOOTSTEP: 'audio/sfx/footstep',
    UI_CLICK: 'audio/sfx/ui_click',
    UI_HOVER: 'audio/sfx/ui_hover',
    CASH_REGISTER: 'audio/sfx/cash_register',
    POLICE_SIREN: 'audio/sfx/police_siren',
    ARREST_ALARM: 'audio/sfx/arrest_alarm',
    DOOR_OPEN: 'audio/sfx/door_open',
    DOOR_CLOSE: 'audio/sfx/door_close',
    ITEM_PICKUP: 'audio/sfx/item_pickup',
    BATTLE_PUNCH: 'audio/sfx/battle_punch',
    BATTLE_DEFEND: 'audio/sfx/battle_defend',
    BATTLE_HURT: 'audio/sfx/battle_hurt',
    SUCCESS_JINGLE: 'audio/sfx/success',
    FAILURE_JINGLE: 'audio/sfx/failure',
    HEAT_WARNING: 'audio/sfx/heat_warning',
    BELL_NOTIFICATION: 'audio/sfx/bell_notification',
    
    // Music
    MUSIC_STREET: 'audio/music/street',
    MUSIC_SAFEHOUSE: 'audio/music/safehouse',
    MUSIC_BATTLE: 'audio/music/battle',
    MUSIC_MENU: 'audio/music/menu',
    
    // Ambient
    AMBIENT_CITY: 'audio/ambient/city',
    AMBIENT_TRAFFIC: 'audio/ambient/traffic',
    AMBIENT_RAIN: 'audio/ambient/rain',
    AMBIENT_DISTANT_SIRENS: 'audio/ambient/distant_sirens',
};

// Sound categories for volume control
export const SOUND_CATEGORIES = {
    SFX: 'sfx',
    MUSIC: 'music',
    AMBIENT: 'ambient',
    UI: 'ui',
};

export default class SoundManager {
    constructor(scene) {
        this.scene = scene;
        this.sounds = {};
        this.music = {};
        this.ambient = {};
        this.activeOscillators = [];
        this.musicOscillators = [];
        this.sirenInterval = null;
        
        // Volume settings (0.0 - 1.0)
        this.volumes = {
            [SOUND_CATEGORIES.SFX]: 0.7,
            [SOUND_CATEGORIES.MUSIC]: 0.5,
            [SOUND_CATEGORIES.AMBIENT]: 0.4,
            [SOUND_CATEGORIES.UI]: 0.6,
        };
        
        // Track current music/ambient for crossfading
        this.currentMusic = null;
        this.currentAmbient = null;
        
        // Master volume
        this.masterVolume = 1.0;
        this.isMuted = false;
        
        // Initialize sounds
        this.initializeSounds();
    }
    
    // ============================================
    // WEB AUDIO API - Generated Sound Effects
    // ============================================
    
    /**
     * Generate a simple tone burst
     */
    _playTone(frequency, duration, type = 'sine', volume = 0.3) {
        if (this.isMuted) return;
        
        try {
            const ctx = getAudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = type;
            osc.frequency.setValueAtTime(frequency, ctx.currentTime);
            
            gain.gain.setValueAtTime(volume * this.masterVolume, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + duration);
            
            this.activeOscillators.push(osc);
            osc.onended = () => {
                const idx = this.activeOscillators.indexOf(osc);
                if (idx > -1) this.activeOscillators.splice(idx, 1);
            };
        } catch (e) {
            console.warn('[SoundManager] Audio playback failed:', e);
        }
    }
    
    /**
     * Generate noise burst (for impacts, footsteps)
     */
    _playNoise(duration, volume = 0.2) {
        if (this.isMuted) return;
        
        try {
            const ctx = getAudioContext();
            const bufferSize = ctx.sampleRate * duration;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            
            const noise = ctx.createBufferSource();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, ctx.currentTime);
            
            noise.buffer = buffer;
            gain.gain.setValueAtTime(volume * this.masterVolume, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            
            noise.start(ctx.currentTime);
        } catch (e) {
            console.warn('[SoundManager] Noise playback failed:', e);
        }
    }
    
    /**
     * Generate synthesized sound based on type
     */
    _playSynthesizedSound(soundKey, volume = 0.5) {
        if (this.isMuted) return;
        
        switch (soundKey) {
            case 'FOOTSTEP':
                this._playNoise(0.08, 0.15);
                this._playTone(80, 0.05, 'sine', 0.1);
                break;
            case 'UI_CLICK':
                this._playTone(1200, 0.03, 'square', 0.15);
                this._playTone(800, 0.02, 'sine', 0.1);
                break;
            case 'UI_HOVER':
                this._playTone(600, 0.015, 'sine', 0.08);
                break;
            case 'CASH_REGISTER':
                this._playTone(800, 0.1, 'sine', 0.25);
                setTimeout(() => this._playTone(1200, 0.15, 'sine', 0.25), 100);
                break;
            case 'POLICE_SIREN':
                this._playSiren(600);
                break;
            case 'ARREST_ALARM':
                this._playTone(400, 0.3, 'sawtooth', 0.2);
                this._playTone(600, 0.3, 'square', 0.15);
                break;
            case 'DOOR_OPEN':
                this._playTone(200, 0.2, 'sine', 0.15);
                this._playNoise(0.3, 0.1);
                break;
            case 'DOOR_CLOSE':
                this._playNoise(0.15, 0.2);
                this._playTone(100, 0.1, 'sine', 0.15);
                break;
            case 'ITEM_PICKUP':
                this._playTone(880, 0.1, 'sine', 0.25);
                this._playTone(1320, 0.15, 'sine', 0.2);
                break;
            case 'BATTLE_PUNCH':
                this._playNoise(0.1, 0.3);
                this._playTone(150, 0.08, 'sine', 0.2);
                break;
            case 'BATTLE_DEFEND':
                this._playTone(800, 0.15, 'square', 0.15);
                this._playTone(1200, 0.1, 'sine', 0.1);
                break;
            case 'BATTLE_HURT':
                this._playNoise(0.2, 0.15);
                this._playTone(200, 0.15, 'sawtooth', 0.1);
                break;
            case 'SUCCESS_JINGLE':
                this._playJingle([523, 659, 784], [0.15, 0.15, 0.3], 'sine', 0.25);
                break;
            case 'FAILURE_JINGLE':
                this._playJingle([400, 350, 300], [0.2, 0.2, 0.4], 'triangle', 0.2);
                break;
            case 'HEAT_WARNING':
                this._playTone(1000, 0.1, 'square', 0.2);
                setTimeout(() => this._playTone(1000, 0.1, 'square', 0.2), 150);
                setTimeout(() => this._playTone(1000, 0.1, 'square', 0.2), 300);
                break;
            case 'BELL_NOTIFICATION':
                this._playTone(2000, 0.3, 'sine', 0.15);
                this._playTone(2500, 0.2, 'sine', 0.1);
                break;
            default:
                this._playTone(440, 0.05, 'sine', 0.1);
        }
    }
    
    /**
     * Play a siren pattern
     */
    _playSiren(baseFreq) {
        if (this.isMuted) return;
        if (this.sirenInterval) clearInterval(this.sirenInterval);
        
        let phase = 0;
        this.sirenInterval = setInterval(() => {
            if (this.isMuted || !this.currentMusic) {
                clearInterval(this.sirenInterval);
                this.sirenInterval = null;
                return;
            }
            const freq = baseFreq + Math.sin(phase) * 300;
            this._playTone(freq, 0.4, 'sine', 0.15);
            phase += 0.3;
        }, 400);
    }
    
    /**
     * Play a jingle (sequence of tones)
     */
    _playJingle(frequencies, durations, type, volume) {
        let time = 0;
        frequencies.forEach((freq, i) => {
            setTimeout(() => {
                this._playTone(freq, durations[i], type, volume);
            }, time * 1000);
            time += durations[i];
        });
    }
    
    // ============================================
    // MUSIC GENERATION (Ambient Drone)
    // ============================================
    
    /**
     * Generate ambient music/drone
     */
    _playMusic(key, volume = 0.3) {
        if (this.isMuted) return;
        
        // Stop existing music
        this._stopMusic();
        
        try {
            const ctx = getAudioContext();
            
            switch (key) {
                case 'MUSIC_STREET':
                    this._createDrone([55, 110], volume, 'sawtooth', true);
                    this._createDrone([220, 330], volume * 0.5, 'sine', false);
                    break;
                case 'MUSIC_SAFEHOUSE':
                    this._createDrone([130, 165, 196], volume * 0.6, 'sine', false);
                    break;
                case 'MUSIC_BATTLE':
                    this._createDrone([80, 100], volume, 'square', true);
                    this._createDrone([160, 200], volume * 0.5, 'sawtooth', false);
                    break;
                case 'MUSIC_MENU':
                    this._createDrone([65, 82], volume * 0.7, 'sine', true);
                    this._createDrone([130, 146], volume * 0.4, 'triangle', false);
                    break;
            }
        } catch (e) {
            console.warn('[SoundManager] Music playback failed:', e);
        }
    }
    
    /**
     * Create a drone (continuous tone)
     */
    _createDrone(frequencies, volume, type, withLFO) {
        const ctx = getAudioContext();
        
        frequencies.forEach(freq => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            
            gain.gain.setValueAtTime(volume * this.masterVolume * 0.3, ctx.currentTime);
            
            if (withLFO) {
                const lfo = ctx.createOscillator();
                const lfoGain = ctx.createGain();
                lfo.frequency.setValueAtTime(0.5, ctx.currentTime);
                lfoGain.gain.setValueAtTime(freq * 0.02, ctx.currentTime);
                lfo.connect(lfoGain);
                lfoGain.connect(osc.frequency);
                lfo.start(ctx.currentTime);
                this.musicOscillators.push(lfo);
            }
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            
            this.musicOscillators.push(osc);
            this.musicOscillators.push(gain);
        });
    }
    
    /**
     * Stop all music
     */
    _stopMusic() {
        if (this.sirenInterval) {
            clearInterval(this.sirenInterval);
            this.sirenInterval = null;
        }
        this.musicOscillators.forEach(node => {
            try { node.stop(); } catch (e) {}
            try { node.disconnect(); } catch (e) {}
        });
        this.musicOscillators = [];
    }
    
    // ============================================
    // PUBLIC API
    // ============================================
    
    /**
     * Initialize all sound assets
     */
    initializeSounds() {
        // Sound Effects (one-shot)
        const sfxKeys = [
            'FOOTSTEP', 'UI_CLICK', 'UI_HOVER', 'CASH_REGISTER',
            'POLICE_SIREN', 'ARREST_ALARM', 'DOOR_OPEN', 'DOOR_CLOSE',
            'ITEM_PICKUP', 'BATTLE_PUNCH', 'BATTLE_DEFEND', 'BATTLE_HURT',
            'SUCCESS_JINGLE', 'FAILURE_JINGLE', 'HEAT_WARNING', 'BELL_NOTIFICATION'
        ];
        
        sfxKeys.forEach(key => {
            const path = AUDIO_PATHS[key];
            if (path) {
                this.sounds[key] = {
                    key: key,
                    path: path,
                    loaded: false,
                    instance: null,
                    category: key.startsWith('UI') ? SOUND_CATEGORIES.UI : SOUND_CATEGORIES.SFX
                };
            }
        });
        
        // Music (looped)
        const musicKeys = ['MUSIC_STREET', 'MUSIC_SAFEHOUSE', 'MUSIC_BATTLE', 'MUSIC_MENU'];
        musicKeys.forEach(key => {
            const path = AUDIO_PATHS[key];
            if (path) {
                this.music[key] = {
                    key: key,
                    path: path,
                    loaded: false,
                    instance: null,
                    category: SOUND_CATEGORIES.MUSIC
                };
            }
        });
        
        // Ambient (looped)
        const ambientKeys = ['AMBIENT_CITY', 'AMBIENT_TRAFFIC', 'AMBIENT_RAIN', 'AMBIENT_DISTANT_SIRENS'];
        ambientKeys.forEach(key => {
            const path = AUDIO_PATHS[key];
            if (path) {
                this.ambient[key] = {
                    key: key,
                    path: path,
                    loaded: false,
                    instance: null,
                    category: SOUND_CATEGORIES.AMBIENT
                };
            }
        });
    }
    
    /**
     * Load a specific sound into the scene
     * @param {string} soundKey - Key from AUDIO_PATHS
     * @returns {Promise} - Resolves when sound is loaded
     */
    load(soundKey) {
        const soundData = this.sounds[soundKey] || this.music[soundKey] || this.ambient[soundKey];
        
        if (!soundData) {
            console.warn(`SoundManager: Unknown sound key: ${soundKey}`);
            return Promise.resolve();
        }
        
        if (soundData.loaded) {
            return Promise.resolve();
        }
        
        // Try to load from file, fall back to synthesized
        return new Promise((resolve) => {
            this.scene.load.audio(soundData.key, `${soundData.path}.mp3`);
            this.scene.load.once('complete', () => {
                soundData.loaded = true;
                resolve();
            });
            this.scene.load.once('filecomplete-error', (key) => {
                if (key === soundData.key) {
                    // File not found - will use synthesized sound
                    soundData.loaded = true;
                    resolve();
                }
            });
            this.scene.load.start();
        });
    }
    
    /**
     * Play a sound effect
     * @param {string} soundKey - Key from AUDIO_PATHS
     * @param {object} options - Playback options (volume, rate, etc.)
     */
    play(soundKey, options = {}) {
        const soundData = this.sounds[soundKey];
        
        if (!soundData) {
            console.warn(`SoundManager: Unknown SFX: ${soundKey}`);
            return null;
        }
        
        const category = soundData.category;
        const baseVolume = this.volumes[category];
        const volume = options.volume !== undefined ? options.volume : baseVolume;
        
        // Use synthesized sound (works without audio files)
        this._playSynthesizedSound(soundKey, volume);
        
                
        return {
            key: soundKey,
            volume,
            stop: () => {}
        };
    }
    
    /**
     * Play music with optional crossfade
     * @param {string} musicKey - Key from AUDIO_PATHS
     * @param {number} fadeDuration - Crossfade duration in ms
     */
    playMusic(musicKey, fadeDuration = 1000) {
        const musicData = this.music[musicKey];
        
        if (!musicData) {
            console.warn(`SoundManager: Unknown music: ${musicKey}`);
            return;
        }
        
        // If same music is playing, don't restart
        if (this.currentMusic === musicKey) {
            return;
        }
        
        const oldMusic = this.currentMusic;
        this.currentMusic = musicKey;
        
        // Use synthesized music (works without audio files)
        this._playMusic(musicKey, this.volumes[SOUND_CATEGORIES.MUSIC]);
        
                
        return { key: musicKey };
    }
    
    /**
     * Stop current music
     * @param {number} fadeDuration - Fade out duration in ms
     */
    stopMusic(fadeDuration = 500) {
        if (this.currentMusic) {
            this._stopMusic();
                        this.currentMusic = null;
        }
    }
    
    /**
     * Play ambient sound
     * @param {string} ambientKey - Key from AUDIO_PATHS
     */
    playAmbient(ambientKey) {
        const ambientData = this.ambient[ambientKey];
        
        if (!ambientData) {
            console.warn(`SoundManager: Unknown ambient: ${ambientKey}`);
            return;
        }
        
        if (this.currentAmbient === ambientKey) {
            return;
        }
        
        this.currentAmbient = ambientKey;
        
        // Use similar synthesis to music for ambient
        this._playMusic(ambientKey, this.volumes[SOUND_CATEGORIES.AMBIENT]);
        
                
        return { key: ambientKey };
    }
    
    /**
     * Stop ambient sound
     */
    stopAmbient() {
        if (this.currentAmbient) {
            this._stopMusic();
                        this.currentAmbient = null;
        }
    }
    
    /**
     * Set volume for a category
     * @param {string} category - Category from SOUND_CATEGORIES
     * @param {number} volume - Volume level (0.0 - 1.0)
     */
    setVolume(category, volume) {
        if (this.volumes.hasOwnProperty(category)) {
            this.volumes[category] = Math.max(0, Math.min(1, volume));
                    }
    }
    
    /**
     * Set master volume
     * @param {number} volume - Master volume (0.0 - 1.0)
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
            }
    
    /**
     * Mute all audio
     */
    mute() {
        this.isMuted = true;
        this._stopMusic();
            }
    
    /**
     * Unmute all audio
     */
    unmute() {
        this.isMuted = false;
        // Resume music if was playing
        if (this.currentMusic) {
            this._playMusic(this.currentMusic, this.volumes[SOUND_CATEGORIES.MUSIC]);
        }
            }
    
    /**
     * Pause all sounds
     */
    pauseAll() {
        this._stopMusic();
            }
    
    /**
     * Resume all sounds
     */
    resumeAll() {
        if (this.currentMusic) {
            this._playMusic(this.currentMusic, this.volumes[SOUND_CATEGORIES.MUSIC]);
        }
            }
    
    /**
     * Cleanup - destroy all sounds
     */
    destroy() {
        this._stopMusic();
        this.stopAmbient();
        this.sounds = {};
        this.music = {};
        this.ambient = {};
            }
}

// Convenience functions for common sound triggers
export const SOUND_TRIGGERS = {
    // Player actions
    onPlayerWalk: 'FOOTSTEP',
    onPlayerRun: 'FOOTSTEP',
    onItemPickup: 'ITEM_PICKUP',
    
    // UI interactions
    onButtonClick: 'UI_CLICK',
    onButtonHover: 'UI_HOVER',
    onNotification: 'BELL_NOTIFICATION',
    
    // Economic
    onBuy: 'CASH_REGISTER',
    onSell: 'CASH_REGISTER',
    
    // Safehouse
    onDoorOpen: 'DOOR_OPEN',
    onDoorClose: 'DOOR_CLOSE',
    
    // Police/Heat
    onHeatWarning: 'HEAT_WARNING',
    onPoliceSiren: 'POLICE_SIREN',
    onArrested: 'ARREST_ALARM',
    
    // Battle
    onAttack: 'BATTLE_PUNCH',
    onDefend: 'BATTLE_DEFEND',
    onHurt: 'BATTLE_HURT',
    
    // Outcomes
    onSuccess: 'SUCCESS_JINGLE',
    onFailure: 'FAILURE_JINGLE',
};

// Music zone triggers
export const ZONE_MUSIC = {
    STREET: 'MUSIC_STREET',
    SAFEHOUSE: 'MUSIC_SAFEHOUSE',
    BATTLE: 'MUSIC_BATTLE',
    MENU: 'MUSIC_MENU',
};

// Ambient zone triggers
export const ZONE_AMBIENT = {
    CITY: 'AMBIENT_CITY',
    TRAFFIC: 'AMBIENT_TRAFFIC',
    RAIN: 'AMBIENT_RAIN',
    NIGHT: 'AMBIENT_DISTANT_SIRENS',
};