import Phaser from 'phaser';

export interface ConstructorProps {
    name: string,
    path: string,
    frameSize: number,
    scale: number;
    scene: Phaser.Scene,
}

abstract class Spritesheet {
    protected scene: Phaser.Scene;
    protected config: ConstructorProps;


    constructor(config: ConstructorProps) {
        this.scene = config.scene;
        this.config = config;
    }

    preload() {
        this.scene.load.spritesheet(this.config.name, this.config.path, {
            frameWidth: this.config.frameSize,
            frameHeight: this.config.frameSize,
        });
    }
}

export { Spritesheet };
