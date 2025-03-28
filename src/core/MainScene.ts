export class MainScene extends Phaser.Scene {
    private player!: Phaser.GameObjects.Polygon;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private tileSize = 64;
    private gridWidth = 96;
    private gridHeight = 48;
    private playerPosition = { x: 0, y: 0 };
    private tiles: Phaser.GameObjects.Polygon[][] = [];
    private obstacles: boolean[][] = [];
    private isMoving = false;
    private moveQueue: { x: number, y: number }[] = [];
    private currentMoveTween: Phaser.Tweens.Tween | null = null;
    private camera!: Phaser.Cameras.Scene2D.Camera;

    private ARROW_KEY_MOVE_SPEED = 300; 
    private CLICK_MOVE_SPEED = 150; 
    private MOVEMENT_EASE = 'Sine.easeInOut'; 

    constructor() {
        super({ key: 'MainScene' });
    }

    create() {
        if (!this.input.keyboard) {
            console.error('Keyboard input not available');
            return;
        }
        this.cursors = this.input.keyboard.createCursorKeys();

        try {
            this.drawIsometricGrid();
            this.createPlayer();

            this.camera = this.cameras.main;
            this.camera.setBounds(this.gridWidth * -14, 0, this.gridWidth * this.tileSize, this.gridHeight * this.tileSize);
            this.camera.setZoom(1);
            this.camera.startFollow(this.player, true, 0.05, 0.05);
        } catch (error) {
            console.error('Failed to initialize scene:', error);
            return;
        }

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            try {
                this.handleClick(pointer);
            } catch (error) {
                console.error('Click handling failed:', error);
            }
        });

        this.input.keyboard!.on('keydown-ESC', () => {
            this.cancelMovement();
        });
    }

    drawIsometricGrid() {
        if (!this.add) {
            throw new Error('Graphics system not initialized');
        }
        for (let y = 0; y < this.gridHeight; y++) {
            this.tiles[y] = [];
            this.obstacles[y] = [];
            for (let x = 0; x < this.gridWidth; x++) {
                const isoX = (x - y) * this.tileSize * 0.5 + 400;
                const isoY = (x + y) * this.tileSize * 0.25 + 200;
                const tile = this.add.polygon(isoX, isoY, [
                    -this.tileSize / 2, 0,
                    0, this.tileSize / 4,
                    this.tileSize / 2, 0,
                    0, -this.tileSize / 4
                ], 0x0000ff).setStrokeStyle(2, 0xffffff);

                tile.setInteractive();
                tile.on('pointerover', () => this.onTileHover(tile, x, y));
                tile.on('pointerout', () => this.onTileOut(tile, x, y));

                this.tiles[y][x] = tile;
                this.obstacles[y][x] = Math.random() < 0.2 && (x !== 0 || y !== 0);
                if (this.obstacles[y][x]) {
                    tile.setFillStyle(0x000000);
                }
            }
        }
    }

    onTileHover(tile: Phaser.GameObjects.Polygon, x: number, y: number) {
        if (!this.obstacles[y][x]) {
            tile.setFillStyle(0x00ff00);
        }
    }

    onTileOut(tile: Phaser.GameObjects.Polygon, x: number, y: number) {
        if (!this.obstacles[y][x]) {
            tile.setFillStyle(0x0000ff);
        }
    }

    createPlayer() {
        const { x, y } = this.getIsoPosition(this.playerPosition.x, this.playerPosition.y);
        this.player = this.add.polygon(x, y, [
            -this.tileSize / 2, 0,
            0, this.tileSize / 4,
            this.tileSize / 2, 0,
            0, -this.tileSize / 4
        ], 0xff0000).setStrokeStyle(2, 0xffffff);
        this.player.setDepth(1000);
    }

    update() {
        if (this.isMoving || this.moveQueue.length > 0) {
            this.handleQueueMovement();
        } else {
            this.clearPath();
            this.handleKeyboardMovement();
        }
    }

    handleQueueMovement() {
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

    clearQueueAndMove(deltaX: number, deltaY: number) {
        this.moveQueue = [];
        this.queueMove(deltaX, deltaY);
    }

    handleKeyboardMovement() {
        if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
            this.queueMove(-1, 1);
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
            this.queueMove(1, -1);
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            this.queueMove(-1, -1);
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
            this.queueMove(1, 1);
        }
    }

    handleClick(pointer: Phaser.Input.Pointer) {
        this.cancelMovement();
        const targetPos = this.screenToGrid(pointer.x, pointer.y);

        if (this.isValidTarget(targetPos)) {
            this.moveQueue = this.findPath(this.playerPosition, targetPos);
            this.displayPath(this.moveQueue);
            this.processMoveQueue();
        }
    }

    isValidTarget(targetPos: { x: number, y: number }) {
        return targetPos.x >= 0 && targetPos.x < this.gridWidth &&
            targetPos.y >= 0 && targetPos.y < this.gridHeight &&
            !this.obstacles[targetPos.y][targetPos.x];
    }

    queueMove(deltaX: number, deltaY: number) {
        const newX = this.playerPosition.x + deltaX;
        const newY = this.playerPosition.y + deltaY;

        if (this.isValidMove(newX, newY)) {
            this.moveQueue.push({ x: newX, y: newY });
            this.processMoveQueue();
        }
    }

    isValidMove(x: number, y: number) {
        return x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight && !this.obstacles[y][x];
    }

    processMoveQueue() {
        if (this.moveQueue.length === 0) return;

        const nextPos = this.moveQueue.shift()!;
        this.playerPosition.x = nextPos.x;
        this.playerPosition.y = nextPos.y;

        const { x, y } = this.getIsoPosition(nextPos.x, nextPos.y);
        this.isMoving = true;

        const movementSpeed = this.moveQueue.length > 0 ? 
            this.CLICK_MOVE_SPEED : 
            this.ARROW_KEY_MOVE_SPEED;

        this.currentMoveTween = this.tweens.add({
            targets: this.player,
            x: x,
            y: y,
            duration: movementSpeed,
            ease: this.MOVEMENT_EASE,
            onComplete: () => {
                this.isMoving = false;
                this.currentMoveTween = null;
                this.processMoveQueue();
            }
        });
    }

    findPath(start: { x: number, y: number }, target: { x: number, y: number }) {
        const openSet: { x: number, y: number, f: number }[] = [{ ...start, f: 0 }];
        const cameFrom: { [key: string]: { x: number, y: number } } = {};
        const gScore: { [key: string]: number } = { [`${start.y},${start.x}`]: 0 };
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

                if (!this.isValidMove(newX, newY)) continue;

                const tentativeGScore = (gScore[`${current.y},${current.x}`] || 0) + 1;
                if (tentativeGScore < (gScore[key] || Infinity)) {
                    cameFrom[key] = { x: current.x, y: current.y };
                    gScore[key] = tentativeGScore;
                    fScore[key] = tentativeGScore + this.heuristic({ x: newX, y: newY }, target);

                    if (!openSet.some(node => node.x === newX && node.y === newY)) {
                        openSet.push({ x: newX, y: newY, f: fScore[key] });
                    }
                }
            }
        }
        return [];
    }

    heuristic(a: { x: number, y: number }, b: { x: number, y: number }) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    reconstructPath(cameFrom: { [key: string]: { x: number, y: number } }, start: { x: number, y: number }, target: { x: number, y: number }) {
        const path: { x: number, y: number }[] = [];
        let currentPos = target;
        while (currentPos.x !== start.x || currentPos.y !== start.y) {
            path.unshift(currentPos);
            currentPos = cameFrom[`${currentPos.y},${currentPos.x}`];
        }
        path.unshift(start);
        return path;
    }

    getIsoPosition(gridX: number, gridY: number) {
        return {
            x: (gridX - gridY) * this.tileSize * 0.5 + 400,
            y: (gridX + gridY) * this.tileSize * 0.25 + 200
        };
    }

    screenToGrid(screenX: number, screenY: number) {

        const cameraX = this.camera.scrollX;
        const cameraY = this.camera.scrollY;

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

    displayPath(path: { x: number, y: number }[]) {
        this.clearPath();
        path.forEach(step => {
            const tile = this.tiles[step.y][step.x];
            tile.setStrokeStyle(2, 0x00ff00);
        });
    }

    clearPath() {
        this.tiles.forEach(row => row.forEach(tile => tile.setStrokeStyle(2, 0xffffff)));
    }

    cancelMovement() {
        if (this.currentMoveTween) {
            this.currentMoveTween.stop();
            this.currentMoveTween = null;
        }
        this.moveQueue = [];
        this.isMoving = false;
        this.clearPath();
    }

    setMovementSpeeds(arrowKeySpeed: number, clickMoveSpeed: number) {
        this.ARROW_KEY_MOVE_SPEED = arrowKeySpeed;
        this.CLICK_MOVE_SPEED = clickMoveSpeed;
    }
}