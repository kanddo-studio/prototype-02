import Phaser from 'phaser';
import { InputManager } from '../systems/InputManager';
import { AnimationManager } from '../systems/AnimationManager';
import { CameraManager } from '../systems/CameraManager';
import { Spritesheet } from './Spritesheet';

interface CreateProps {
    positionX: number;
    positionY: number;
}

interface ConstructorProps {
    scene: Phaser.Scene;
    name: string;
    path: string;
    frameSize: number;
    scale: number;
}

class Player extends Spritesheet {
    private entity!: Phaser.Physics.Arcade.Sprite;
    private inputManager!: InputManager;
    private animationManager!: AnimationManager;
    private cameraManager!: CameraManager;

    constructor(config: ConstructorProps) {
        super(config);
    }

    preload() {
        super.preload();
    }

    create(props: CreateProps) {
        this.createEntity(props.positionX, props.positionY);

        this.inputManager = new InputManager(this.scene);
        this.animationManager = new AnimationManager(this.scene, this.config.name);
        this.cameraManager = new CameraManager(this.scene, this.entity);

        this.animationManager.create();
        this.cameraManager.create();
    }

    update() {
        const isJumping = !this.isOnGround();

        this.inputManager.handleMovement(isJumping, this.entity);
        this.inputManager.handleJump(isJumping, this.entity);
        this.inputManager.handleAttack(this.entity);
        this.inputManager.handleWaiting(this.entity);

        this.checkBounds();
    }

    private createEntity(startX: number, startY: number) {
        this.entity = this.scene.physics.add.sprite(startX, startY, this.config.name)
            .setScale(this.config.scale)
            .setCollideWorldBounds(true)
            .setSize(14, 12)
            .setOffset(10, 18)
    }

    private isOnGround(): boolean {
        return !!(this.entity.body?.blocked.down || this.entity.body?.touching.down);
    }

    private checkBounds() {
        const playerBounds = this.entity.getBounds();
        const worldBounds = this.scene.physics.world.bounds;

        if (playerBounds.bottom > worldBounds.bottom) {
            this.entity.setPosition(320, 448);
        }
    }

    get Entity() {
        return this.entity;
    }

    set Entity(entity: Phaser.Physics.Arcade.Sprite) {
        this.entity = entity;
    }
}

export { Player };
