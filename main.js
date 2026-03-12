import Phaser from './lib/phaser.min.js';
import TitleScene from './TitleScene.js';
import CharacterCreationScene from './CharacterCreationScene.js';
import GameScene from './GameScene.js';
import WorldMapScene from './WorldMapScene.js';

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1920,
        height: 1080
    },
    backgroundColor: '#000000',
    scene: [TitleScene, CharacterCreationScene, GameScene, WorldMapScene],
    parent: document.body,
    pixelArt: true
};

window.game = new Phaser.Game(config);
