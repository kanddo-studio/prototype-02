import Phaser from 'phaser';

class PlayerJump {
    jump(entity: Phaser.Physics.Arcade.Sprite) {
        entity.setVelocityY(-960);
        entity.play('jump');
    }
}

export { PlayerJump }