import { BaseScene } from './BaseScene';

export class FPSScene extends BaseScene {
    private fpsText!: Phaser.GameObjects.Text;
    private lastFrameTime = 0;
    private frameCount = 0;
    private fps = 0;

    constructor(sceneKey: string) {
        super(sceneKey);
    }

    preload() {
        this.fpsText = this.add.text(16, 16, 'FPS: 0', {
            font: '16px Arial',
        }).setScrollFactor(0);
    }

    create() {
        this.time.addEvent({
            delay: 1000,
            callback: () => { },
            callbackScope: this,
            loop: true
        });
    }

    update(time: number) {
        this.frameCount++;

        const elapsedTime = time - this.lastFrameTime;

        if (elapsedTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFrameTime = time;
        }

        this.fpsText.setText('FPS: ' + this.fps);
    }
}
