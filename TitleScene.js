// TitleScene.js - Stormy title screen
export default class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
    }

    create() {
        // Dark stormy background
        this.cameras.main.setBackgroundColor('#0a0a12');
        
        // Create rain particles (exactly 100)
        this.createRain();
        
        // Create lightning system
        this.createLightning();
        
        // Create glowing TRAP title
        this.createTitle();
        
        // Create pulsing TAP TO START
        this.createStartPrompt();
        
        // Input to start game
        this.input.on('pointerdown', () => {
            this.cameras.main.fade(500, 0, 0, 0);
            this.time.delayedCall(500, () => {
                this.scene.start('GameScene');
            });
        });
        
        // Also allow keyboard input
        this.input.keyboard.on('keydown', () => {
            this.cameras.main.fade(500, 0, 0, 0);
            this.time.delayedCall(500, () => {
                this.scene.start('GameScene');
            });
        });
    }

    createRain() {
        // Clear any existing graphics
        this.rainGraphics = this.add.graphics();
        
        // Create exactly 100 rain drops
        this.rainDrops = [];
        for (let i = 0; i < 100; i++) {
            const drop = {
                x: Phaser.Math.Between(0, this.scale.width),
                y: Phaser.Math.Between(0, this.scale.height),
                length: Phaser.Math.Between(10, 25),
                speed: Phaser.Math.Between(800, 1500)
            };
            this.rainDrops.push(drop);
        }
        
        // Animate rain
        this.time.addEvent({
            delay: 16,
            callback: () => {
                this.rainGraphics.clear();
                this.rainGraphics.fillStyle(0x8899aa, 0.3);
                
                this.rainDrops.forEach(drop => {
                    drop.y += drop.speed * 0.016;
                    if (drop.y > this.scale.height) {
                        drop.y = -drop.length;
                        drop.x = Phaser.Math.Between(0, this.scale.width);
                    }
                    this.rainGraphics.fillRect(drop.x, drop.y, 1, drop.length);
                });
            },
            loop: true
        });
    }

    createLightning() {
        // White overlay for lightning flash
        this.lightningOverlay = this.add.rectangle(
            this.scale.width / 2,
            this.scale.height / 2,
            this.scale.width,
            this.scale.height,
            0xffffff,
            0
        );
        
        // Random lightning flashes
        this.scheduleLightning();
    }

    scheduleLightning() {
        this.time.addEvent({
            delay: Phaser.Math.Between(2000, 6000),
            callback: () => {
                this.triggerLightning();
                this.scheduleLightning();
            }
        });
    }

    triggerLightning() {
        // Flash
        this.lightningOverlay.setFillStyle(0xffffff, 0.8);
        this.tweens.add({
            targets: this.lightningOverlay,
            alpha: 0,
            duration: 150,
            ease: 'Power2',
            onComplete: () => {
                // Secondary flash sometimes
                if (Math.random() > 0.5) {
                    this.time.delayedCall(100, () => {
                        this.lightningOverlay.setFillStyle(0xffffff, 0.4);
                        this.tweens.add({
                            targets: this.lightningOverlay,
                            alpha: 0,
                            duration: 100
                        });
                    });
                }
            }
        });
        
        // Flash background briefly
        this.cameras.main.setBackgroundColor('#1a1a2e');
        this.time.delayedCall(100, () => {
            this.cameras.main.setBackgroundColor('#0a0a12');
        });
    }

    createTitle() {
        // Glow layers (behind text) using setShadow
        const title = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 - 50,
            'TRAP',
            {
                fontFamily: 'Arial Black',
                fontSize: '80px',
                color: '#00ffff',
                fontStyle: 'bold'
            }
        );
        title.setOrigin(0.5);
        
        // Use setShadow for glow effect
        title.setShadow(0, 0, '#00ffff', 10, true, true);
        
        // Pulsing glow effect
        this.tweens.add({
            targets: title,
            alpha: 0.6,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createStartPrompt() {
        const startText = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2 + 80,
            'TAP TO START',
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#aaaaaa'
            }
        );
        startText.setOrigin(0.5);
        
        // Pulsing effect
        this.tweens.add({
            targets: startText,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Slight scale pulse
        this.tweens.add({
            targets: startText,
            scale: 1.05,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
}