import Phaser from 'phaser';

export class CameraManager {
    constructor(private scene: Phaser.Scene, private entity: Phaser.Physics.Arcade.Sprite) {}

    create() {
        this.scene.cameras.main.startFollow(this.entity, true, 0.04, 0, 0, 132);
    }
}
