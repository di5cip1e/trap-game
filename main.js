import Phaser from 'phaser';
import CharacterCreationScene from './CharacterCreationScene.js';
import GameScene from './GameScene.js';

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1920,
        height: 1080
    },
    backgroundColor: '#000000',
    scene: [CharacterCreationScene, GameScene],
    parent: document.body,
    pixelArt: true
};

const game = new Phaser.Game(config);
