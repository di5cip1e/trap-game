/**
 * SoundManager.js - Audio system for Trap game
 * Handles all sound effects, music, and ambient audio
 * 
 * Usage:
 *   import SoundManager from './audio/SoundManager.js';
 *   const soundManager = new SoundManager(scene);
 *   soundManager.play('FOOTSTEP');
 */

import Phaser from 'phaser';

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
        
        // Volume settings (0.0 - 1.0)
        this volumes = {
            [SOUND_CATEGORIES.SFX]: 0.7,
            [SOUND_CATEGORIES.MUSIC]: 0.5,
            [SOUND_CATEGORIES.AMBIENT]: 0.4,
            [SOUND_CATEGORIES.UI]: 0.6,
        };
        
        // Track current music/ambient for crossfading
        this.currentMusic = null;
        this.currentAmbient = null;
        
        // Initialize sounds
        this.initializeSounds();
    }
    
    /**
     * Initialize all sound assets
     * Note: Since we can't generate actual audio files, these are placeholder references
     * that will need actual .mp3/.ogg files to work
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
        
        return new Promise((resolve) => {
            this.scene.load.audio(soundData.key, `${soundData.path}.mp3`);
            this.scene.load.once('complete', () => {
                soundData.loaded = true;
                resolve();
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
        const rate = options.rate || 1.0;
        const detune = options.detune || 0;
        
        // In a real implementation, we'd create the actual Phaser sound:
        // const sound = this.scene.sound.add(soundData.key);
        // sound.play({ volume, rate, detune });
        
        // For now, log the intended playback
        console.log(`[SoundManager] Playing: ${soundKey} (volume: ${volume}, rate: ${rate})`);
        
        return {
            key: soundKey,
            volume,
            rate,
            stop: () => console.log(`[SoundManager] Stopped: ${soundKey}`),
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
        
        console.log(`[SoundManager] Playing music: ${musicKey} (fade: ${fadeDuration}ms)`);
        
        // In real implementation:
        // Stop old music with fade
        // Start new music with fade
        
        return { key: musicKey };
    }
    
    /**
     * Stop current music
     * @param {number} fadeDuration - Fade out duration in ms
     */
    stopMusic(fadeDuration = 500) {
        if (this.currentMusic) {
            console.log(`[SoundManager] Stopping music: ${this.currentMusic} (fade: ${fadeDuration}ms)`);
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
        console.log(`[SoundManager] Playing ambient: ${ambientKey}`);
        
        return { key: ambientKey };
    }
    
    /**
     * Stop ambient sound
     */
    stopAmbient() {
        if (this.currentAmbient) {
            console.log(`[SoundManager] Stopping ambient: ${this.currentAmbient}`);
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
            console.log(`[SoundManager] Volume ${category}: ${this.volumes[category]}`);
        }
    }
    
    /**
     * Set master volume
     * @param {number} volume - Master volume (0.0 - 1.0)
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        console.log(`[SoundManager] Master volume: ${this.masterVolume}`);
    }
    
    /**
     * Mute all audio
     */
    mute() {
        this.isMuted = true;
        console.log('[SoundManager] Muted');
    }
    
    /**
     * Unmute all audio
     */
    unmute() {
        this.isMuted = false;
        console.log('[SoundManager] Unmuted');
    }
    
    /**
     * Pause all sounds
     */
    pauseAll() {
        console.log('[SoundManager] Pausing all sounds');
    }
    
    /**
     * Resume all sounds
     */
    resumeAll() {
        console.log('[SoundManager] Resuming all sounds');
    }
    
    /**
     * Cleanup - destroy all sounds
     */
    destroy() {
        this.stopMusic();
        this.stopAmbient();
        this.sounds = {};
        this.music = {};
        this.ambient = {};
        console.log('[SoundManager] Destroyed');
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