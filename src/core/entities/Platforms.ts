import { ConstructorProps, Spritesheet } from './Spritesheet';

interface CreateProps {
    spriteNumber: number;
    positionX: number;
    positionY: number;
}

export class Platforms extends Spritesheet {
    private entity!: Phaser.Physics.Arcade.StaticGroup;

    constructor(props: ConstructorProps) {
        super(props);
        this.scene = props.scene;
        this.config = props;
    }
    create(props: CreateProps) {
        this.entity.create(
            props.positionX,
            props.positionY,
            this.config.name,
            props.spriteNumber
        ).setScale(this.config.scale).refreshBody()
            .setSize(64, 32)
            .setOffset(0, 0);

    }

    preload() {
        super.preload();
        this.entity = this.scene.physics.add.staticGroup();
    }

    get Entity() {
        return this.entity;
    }
}
