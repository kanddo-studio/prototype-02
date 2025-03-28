import Phaser from 'phaser';

class GameConfig {
    static readonly TILE_SIZE = 64;
    static readonly GRID_WIDTH = 32;
    static readonly GRID_HEIGHT = 16;
    static readonly MOVEMENT_SPEEDS = {
        ARROW_KEY: 300,
        CLICK: 150
    };
    static readonly MOVEMENT_EASE = 'Sine.easeInOut';
}

class CoordinateUtils {
    constructor(private tileSize: number) {}

    getIsoPosition(gridX: number, gridY: number): { x: number, y: number } {
        return {
            x: (gridX - gridY) * this.tileSize * 0.5 + 400,
            y: (gridX + gridY) * this.tileSize * 0.25 + 200
        };
    }

    screenToGrid(
        screenX: number, 
        screenY: number, 
        camera: Phaser.Cameras.Scene2D.Camera
    ): { x: number, y: number } {
        const cameraX = camera.scrollX;
        const cameraY = camera.scrollY;

        const adjustedScreenX = screenX + cameraX;
        const adjustedScreenY = screenY + cameraY;

        const isoX = adjustedScreenX - 400;
        const isoY = adjustedScreenY - 200;

        const gridX = (isoX / (this.tileSize * 0.5) + isoY / (this.tileSize * 0.25)) / 2;
        const gridY = (isoY / (this.tileSize * 0.25) - isoX / (this.tileSize * 0.5)) / 2;

        return {
            x: Math.round(gridX),
            y: Math.round(gridY)
        };
    }
}

class GridManager {
    private tiles: Phaser.GameObjects.Polygon[][] = [];
    private obstacles: boolean[][] = [];

    constructor(
        private scene: Phaser.Scene, 
        private tileSize: number, 
        private gridWidth: number, 
        private gridHeight: number,
        private coordinateUtils: CoordinateUtils
    ) {}

    createGrid() {
        for (let y = 0; y < this.gridHeight; y++) {
            this.tiles[y] = [];
            this.obstacles[y] = [];

            for (let x = 0; x < this.gridWidth; x++) {
                const tile = this.createTile(x, y);
                this.setupTileInteractivity(tile, x, y);
            }
        }
        return { tiles: this.tiles, obstacles: this.obstacles };
    }

    private createTile(x: number, y: number): Phaser.GameObjects.Polygon {
        const isoPos = this.coordinateUtils.getIsoPosition(x, y);
        const tile = this.scene.add.polygon(
            isoPos.x, 
            isoPos.y, 
            this.getTileShape(), 
            0x0000ff
        ).setStrokeStyle(2, 0xffffff);

        this.tiles[y][x] = tile;
        this.obstacles[y][x] = this.shouldBeObstacle(x, y);

        if (this.obstacles[y][x]) {
            tile.setFillStyle(0x000000);
        }

        return tile;
    }

    private getTileShape() {
        const size = this.tileSize;
        return [
            -size / 2, 0,
            0, size / 4,
            size / 2, 0,
            0, -size / 4
        ];
    }

    private shouldBeObstacle(x: number, y: number): boolean {
        return Math.random() < 0.2 && (x !== 0 || y !== 0);
    }

    private setupTileInteractivity(tile: Phaser.GameObjects.Polygon, x: number, y: number) {
        tile.setInteractive();
        tile.on('pointerover', () => this.onTileHover(tile, x, y));
        tile.on('pointerout', () => this.onTileOut(tile, x, y));
    }

    private onTileHover(tile: Phaser.GameObjects.Polygon, x: number, y: number) {
        if (!this.obstacles[y][x]) {
            tile.setFillStyle(0x00ff00);
        }
    }

    private onTileOut(tile: Phaser.GameObjects.Polygon, x: number, y: number) {
        if (!this.obstacles[y][x]) {
            tile.setFillStyle(0x0000ff);
        }
    }

    isValidMove(x: number, y: number): boolean {
        return (
            x >= 0 && 
            x < this.gridWidth && 
            y >= 0 && 
            y < this.gridHeight && 
            !this.obstacles[y][x]
        );
    }
}

class PathfindingManager {
    constructor(private gridManager: GridManager) {}

    findPath(
        start: { x: number, y: number }, 
        target: { x: number, y: number }
    ) {
        const openSet: { x: number, y: number, f: number }[] = [
            { ...start, f: 0 }
        ];
        const cameFrom: { [key: string]: { x: number, y: number } } = {};
        const gScore: { [key: string]: number } = { 
            [`${start.y},${start.x}`]: 0 
        };
        const fScore: { [key: string]: number } = { 
            [`${start.y},${start.x}`]: this.heuristic(start, target) 
        };

        const directions = [
            { x: 0, y: 1 }, { x: 0, y: -1 },
            { x: 1, y: 0 }, { x: -1, y: 0 }
        ];

        while (openSet.length > 0) {
            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift()!;

            if (current.x === target.x && current.y === target.y) {
                return this.reconstructPath(cameFrom, start, target);
            }

            for (const dir of directions) {
                const newX = current.x + dir.x;
                const newY = current.y + dir.y;
                const key = `${newY},${newX}`;

                if (!this.gridManager.isValidMove(newX, newY)) continue;

                const tentativeGScore = (gScore[`${current.y},${current.x}`] || 0) + 1;
                if (tentativeGScore < (gScore[key] || Infinity)) {
                    cameFrom[key] = { x: current.x, y: current.y };
                    gScore[key] = tentativeGScore;
                    fScore[key] = tentativeGScore + this.heuristic(
                        { x: newX, y: newY }, 
                        target
                    );

                    if (!openSet.some(node => node.x === newX && node.y === newY)) {
                        openSet.push({ x: newX, y: newY, f: fScore[key] });
                    }
                }
            }
        }
        return [];
    }

    private heuristic(
        a: { x: number, y: number }, 
        b: { x: number, y: number }
    ) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    private reconstructPath(
        cameFrom: { [key: string]: { x: number, y: number } }, 
        start: { x: number, y: number }, 
        target: { x: number, y: number }
    ) {
        const path: { x: number, y: number }[] = [];
        let currentPos = target;
        while (currentPos.x !== start.x || currentPos.y !== start.y) {
            path.unshift(currentPos);
            currentPos = cameFrom[`${currentPos.y},${currentPos.x}`];
        }
        path.unshift(start);
        return path;
    }
}


export class MainScene extends Phaser.Scene {
    private coordinateUtils!: CoordinateUtils;
    private gridManager!: GridManager;
    private pathfindingManager!: PathfindingManager;

    private player!: Phaser.GameObjects.Polygon;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private camera!: Phaser.Cameras.Scene2D.Camera;

    private playerPosition = { x: 0, y: 0 };
    private tiles: Phaser.GameObjects.Polygon[][] = [];
    private isMoving = false;
    private moveQueue: { x: number, y: number }[] = [];
    private currentMoveTween: Phaser.Tweens.Tween | null = null;

    private LAST_MOVIMENT_TIME = 0;
    private MOVE_COOLDOWN = 576;

    constructor() {
        super({ key: 'MainScene' });
    }

    create() {
        this.initializeManagers();
        this.setupGame();
        this.setupInputHandlers();
    }

    private initializeManagers() {
        this.coordinateUtils = new CoordinateUtils(GameConfig.TILE_SIZE);
        this.gridManager = new GridManager(
            this, 
            GameConfig.TILE_SIZE, 
            GameConfig.GRID_WIDTH, 
            GameConfig.GRID_HEIGHT,
            this.coordinateUtils
        );
        this.pathfindingManager = new PathfindingManager(this.gridManager);
    }

    private setupGame() {
        this.initializeKeyboard();
        const gridData = this.gridManager.createGrid();
        this.tiles = gridData.tiles;

        this.createPlayer();
        this.setupCamera();
    }

    private initializeKeyboard() {
        if (!this.input.keyboard) {
            throw new Error('Entrada de teclado não disponível');
        }
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    private createPlayer() {
        const startPos = this.coordinateUtils.getIsoPosition(
            this.playerPosition.x, 
            this.playerPosition.y
        );

        this.player = this.add.polygon(
            startPos.x, 
            startPos.y, 
            [
                -GameConfig.TILE_SIZE / 2, 0,
                0, GameConfig.TILE_SIZE / 4,
                GameConfig.TILE_SIZE / 2, 0,
                0, -GameConfig.TILE_SIZE / 4
            ], 
            0xff0000
        ).setStrokeStyle(2, 0xffffff);
        
        this.player.setDepth(1000);
    }

    private setupCamera() {
        this.camera = this.cameras.main;
        this.camera.setBounds(
            GameConfig.GRID_WIDTH * -14, 
            0, 
            GameConfig.GRID_WIDTH * GameConfig.TILE_SIZE, 
            GameConfig.GRID_HEIGHT * GameConfig.TILE_SIZE
        );
        this.camera.setZoom(1);
        this.camera.startFollow(
            this.player, 
            true, 
            0.05, 
            0.05
        );
    }

    private setupInputHandlers() {
        this.input.on('pointerdown', this.handleClick.bind(this));
        
        if (this.input.keyboard) {
            this.input.keyboard.on('keydown-ESC', this.cancelMovement.bind(this));
        }
    }

    update() {
        if (this.isMoving || this.moveQueue.length > 0) {
            this.handleQueuedMovement();
        } else {
            this.clearPath();
            this.handleKeyboardMovement();
        }
    }

    private handleQueuedMovement() {
        if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
            this.clearQueueAndMove(-1, 1);
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
            this.clearQueueAndMove(1, -1);
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            this.clearQueueAndMove(-1, -1);
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
            this.clearQueueAndMove(1, 1);
        }
    }

    private clearQueueAndMove(deltaX: number, deltaY: number) {
        this.moveQueue = [];
        this.queueMove(deltaX, deltaY);
    }


    
    private handleKeyboardMovement() {
        const currentTime = Date.now();
    
        if (currentTime - this.LAST_MOVIMENT_TIME < this.MOVE_COOLDOWN) return;
    
        if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
            this.queueMove(-1, 1);
            this.LAST_MOVIMENT_TIME = currentTime;
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
            this.queueMove(1, -1);
            this.LAST_MOVIMENT_TIME = currentTime;
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            this.queueMove(-1, -1);
            this.LAST_MOVIMENT_TIME = currentTime;
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
            this.queueMove(1, 1);
            this.LAST_MOVIMENT_TIME = currentTime;
        }
    }

    private handleClick(pointer: Phaser.Input.Pointer) {
        this.cancelMovement();
        const targetPos = this.coordinateUtils.screenToGrid(
            pointer.x, 
            pointer.y, 
            this.camera
        );

        if (this.isValidTarget(targetPos)) {
            this.moveQueue = this.pathfindingManager.findPath(
                this.playerPosition, 
                targetPos
            );
            this.displayPath(this.moveQueue);
            this.processMoveQueue();
        }
    }

    private isValidTarget(targetPos: { x: number, y: number }) {
        return this.gridManager.isValidMove(targetPos.x, targetPos.y);
    }

    private queueMove(deltaX: number, deltaY: number) {
        const newX = this.playerPosition.x + deltaX;
        const newY = this.playerPosition.y + deltaY;

        if (this.gridManager.isValidMove(newX, newY)) {
            this.moveQueue.push({ x: newX, y: newY });
            this.processMoveQueue();
        }
    }

    private processMoveQueue() {
        if (this.moveQueue.length === 0) return;

        const nextPos = this.moveQueue.shift()!;
        this.playerPosition.x = nextPos.x;
        this.playerPosition.y = nextPos.y;

        const { x, y } = this.coordinateUtils.getIsoPosition(nextPos.x, nextPos.y);
        this.isMoving = true;

        const movementSpeed = this.moveQueue.length > 0 
            ? GameConfig.MOVEMENT_SPEEDS.CLICK 
            : GameConfig.MOVEMENT_SPEEDS.ARROW_KEY;

        this.currentMoveTween = this.tweens.add({
            targets: this.player,
            x: x,
            y: y,
            duration: movementSpeed,
            ease: GameConfig.MOVEMENT_EASE,
            onComplete: () => {
                this.isMoving = false;
                this.currentMoveTween = null;
                this.processMoveQueue();
            }
        });
    }

    private displayPath(path: { x: number, y: number }[]) {
        this.clearPath();
        path.forEach(step => {
            const tile = this.tiles[step.y][step.x];
            tile.setStrokeStyle(2, 0x00ff00);
        });
    }

    private clearPath() {
        this.tiles.forEach(row => 
            row.forEach(tile => tile.setStrokeStyle(2, 0xffffff))
        );
    }

    private cancelMovement() {
        if (this.currentMoveTween) {
            this.currentMoveTween.stop();
            this.currentMoveTween = null;
        }
        this.moveQueue = [];
        this.isMoving = false;
        this.clearPath();
    }
}
