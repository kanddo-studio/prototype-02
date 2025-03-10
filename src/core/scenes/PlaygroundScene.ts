import Phaser from 'phaser';
import { Platforms } from '../entities/Platforms';
import { FPSScene } from './config/FPSScene';
import { Player } from '../entities/Player';
import { PLATFORM_CONFIG, PLAYER_CONFIG } from '../../constants/PlaygroundConfig';

class PlaygroundScene extends FPSScene {
    private platforms!: Platforms;
    private player!: Player;
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

    constructor() {
        super('MainScene');
    }

    preload() {
        this.platforms = new Platforms({
            scene: this,
            name: PLATFORM_CONFIG.name,
            path: PLATFORM_CONFIG.path,
            frameSize: 16,
            scale: 4
        });

        this.player = new Player({
            scene: this,
            name: PLAYER_CONFIG.name,
            path: PLAYER_CONFIG.path,
            frameSize: 32,
            scale: 4
        });

        super.preload();
        this.platforms.preload();
        this.player.preload();
    }

    create() {
        this.createPlatforms();
        this.player.create({ positionX: 320, positionY: 448 });

        this.physics.add.collider(
            this.player.Entity,
            this.platforms.Entity.getChildren()
        );
        this.physics.world.setBounds(0, 0, 1472, 800);
    }

    private createPlatforms() {
        const BASE_X = 32;
        const BASE_Y = 596;
        const platformPositions = [
            { startX: BASE_X, startY: BASE_Y, count: 4 },
            { startX: BASE_X * 20, startY: BASE_Y, count: 2 },
            { startX: BASE_X * 31, startY: BASE_Y - (BASE_X * 3), count: 4 },
            { startX: BASE_X * 24, startY: BASE_Y - (BASE_X * 6), count: 1 },
            { startX: BASE_X * 31, startY: BASE_Y - (BASE_X * 9), count: 1 },
            { startX: BASE_X * 38, startY: BASE_Y - (BASE_X * 12), count: 1 },
        ];

        platformPositions.forEach(({ startX, startY, count }) => {
            Array(count).fill(0).forEach((_, i) => {
                const posX = startX + (i * 128) - 4;
                this.createPlatformPair(posX, startY);
            });
        });
    }

    private createPlatformPair(posX: number, posY: number) {
        this.platforms.create({ spriteNumber: 1, positionX: posX, positionY: posY });
        this.platforms.create({ spriteNumber: 2, positionX: posX + 64, positionY: posY });
    }

    update(time: number) {
        this.player.update();
        super.update(time);
    }
}

export { PlaygroundScene };
