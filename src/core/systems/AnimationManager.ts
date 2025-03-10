import Phaser from 'phaser';

class AnimationManager {
    constructor(private scene: Phaser.Scene, private name: string) { }

    create() {
        this.setup('idle', 0, 3, 6, -1);
        this.setup('waiting', 10, 14, 4, -1);
        this.setup('run', 20, 25, 10, -1);
        this.setup('jump', 30, 34, 10, 0);
        this.setup('attack', 40, 48, 16, 0);
    }

    private setup(key: string, startFrame: number, endFrame: number, frameRate: number, repeat: number) {
        this.scene.anims.create({
            key,
            frames: this.scene.anims.generateFrameNumbers(this.name, { start: startFrame, end: endFrame }),
            frameRate,
            repeat,
        });
    }
}

export { AnimationManager };