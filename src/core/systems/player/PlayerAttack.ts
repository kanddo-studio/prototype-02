import Phaser from 'phaser';

class PlayerAttack {
    public isAttacking: boolean = false;
    private attackHitbox: Phaser.GameObjects.Zone | null = null;

    constructor(private scene: Phaser.Scene) { }

    handleAttack(entity: Phaser.Physics.Arcade.Sprite) {
        if (this.isAttacking) return;
        this.initiateAttack(entity);
    }

    private initiateAttack(entity: Phaser.Physics.Arcade.Sprite) {
        this.isAttacking = true;
        entity.play('attack', true);

        setTimeout(() => entity.setVelocityX(0), 100);
        setTimeout(() => this.createAttackHitbox(entity), 200);

        this.shakeScreen();
    }

    private createAttackHitbox(entity: Phaser.Physics.Arcade.Sprite) {
        const hitboxOffsetX = entity.flipX ? -54 : 44;

        this.attackHitbox = this.scene.add.zone(entity.x + hitboxOffsetX, entity.y, 16, 64);
        this.attackHitbox.setOrigin(0, 0);
        this.attackHitbox.setInteractive();

        this.scene.physics.world.enable(this.attackHitbox);
        (this.attackHitbox.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
        this.setupAttackCollision(entity);

        this.attackHitbox.once('pointerdown', this.handleHitboxCollision);
    }

    private setupAttackCollision(entity: Phaser.Physics.Arcade.Sprite) {
        if (this.attackHitbox) {
            this.scene.physics.add.overlap(this.attackHitbox, entity, () => {
                console.log('Colisão detectada durante o ataque com inimigo!');
            });
        }

        entity.once(Phaser.Animations.Events.ANIMATION_COMPLETE, this.endAttack);
    }

    private handleHitboxCollision() {
        console.log('Colisão detectada durante o ataque!');
    }

    private shakeScreen() {
        setTimeout(() => this.scene.cameras.main.zoom = 1.006, 300);
        setTimeout(() => this.scene.cameras.main.zoom = 1.00, 400);
    }

    private endAttack = () => {
        this.isAttacking = false;
        if (this.attackHitbox) {
            this.attackHitbox.destroy();
            this.attackHitbox = null;
        }
    };
}

export { PlayerAttack };