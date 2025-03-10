import Phaser from 'phaser';
import { PlayerMovement } from './player/PlayerMovement';
import { PlayerJump } from './player/PlayerJump';
import { PlayerAttack } from './player/PlayerAttack';
import { PlayerWaiting } from './player/PlayerWaiting';

class InputManager {
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private keyAlt: Phaser.Input.Keyboard.Key;
    private keyAttack: Phaser.Input.Keyboard.Key;
    private waiting: PlayerWaiting;
    private movement: PlayerMovement;
    private jump: PlayerJump;
    private attack: PlayerAttack;

    constructor(private scene: Phaser.Scene) {
        this.cursors = this.scene.input.keyboard!.createCursorKeys();
        this.keyAlt = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ALT);
        this.keyAttack = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL);

        this.waiting = new PlayerWaiting();
        this.movement = new PlayerMovement();
        this.jump = new PlayerJump();
        this.attack = new PlayerAttack(this.scene);
    }

    handleMovement(isJumping: boolean, entity: Phaser.Physics.Arcade.Sprite) {
        if (this.attack.isAttacking) return;

        if (this.cursors.left.isDown) {
            return this.movement.moveLeft(entity, isJumping);
        }
        if (this.cursors.right.isDown) {
            return this.movement.moveRight(entity, isJumping);
        }

        if (entity.anims.currentAnim?.key === 'waiting') {
            return;
        }
        this.movement.stopMovement(entity, isJumping);
    }

    handleJump(isJumping: boolean, entity: Phaser.Physics.Arcade.Sprite) {
        if (this.keyAlt.isDown && !isJumping) {
            this.jump.jump(entity);
        }
    }

    handleAttack(entity: Phaser.Physics.Arcade.Sprite) {
        if (this.keyAttack.isDown) {
            this.attack.handleAttack(entity);
        }
    }

    handleWaiting(entity: Phaser.Physics.Arcade.Sprite) {
        this.waiting.handleWaiting(entity);
    }
}

export { InputManager };