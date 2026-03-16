import Phaser from 'phaser';

import CharacterCreationScene from './CharacterCreationScene.js';
import GameScene from './GameScene.js';
import WorldMapScene from './WorldMapScene.js';
import CombatScene from './CombatScene.js';

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1920,
        height: 1080
    },
    backgroundColor: '#000000',
    scene: [CharacterCreationScene, GameScene, WorldMapScene, CombatScene],
    parent: document.body,
    pixelArt: true
};

window.game = new Phaser.Game(config);
