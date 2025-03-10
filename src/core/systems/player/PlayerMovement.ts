import Phaser from 'phaser';

class PlayerMovement {
    constructor() {}

    moveLeft(entity: Phaser.Physics.Arcade.Sprite, isJumping: boolean) {
        entity.setVelocityX(-332);
        this.playRunAnimation(isJumping, entity);
        entity.setFlipX(true);
    }

    moveRight(entity: Phaser.Physics.Arcade.Sprite, isJumping: boolean) {
        entity.setVelocityX(332);
        this.playRunAnimation(isJumping, entity);
        entity.setFlipX(false);
    }

    stopMovement(entity: Phaser.Physics.Arcade.Sprite, isJumping: boolean) {
        entity.setVelocityX(0);
        this.playAnimationIfNotPlaying('idle', isJumping, entity);
    }

    private playRunAnimation(isJumping: boolean, entity: Phaser.Physics.Arcade.Sprite) {
        this.playAnimationIfNotPlaying('run', isJumping, entity);
    }

    private playAnimationIfNotPlaying(animation: string, isJumping: boolean, entity: Phaser.Physics.Arcade.Sprite) {
        if (!isJumping && entity.anims.currentAnim?.key !== animation) {;
            entity.play(animation);
        }
    }
}

export { PlayerMovement };