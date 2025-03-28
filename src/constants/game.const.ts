export const PHYSICS_CONFIG: Phaser.Types.Core.PhysicsConfig = {
    default: 'arcade',
    arcade: {
        gravity: { x: 0, y: 3100 },
        debug: true,
    },
};

export const RENDER_CONFIG: Phaser.Types.Core.RenderConfig = {
    antialias: false,
    preserveDrawingBuffer: true,
    pixelArt: true,
    clearBeforeRender: true,
};

export const FPS_CONFIG: Phaser.Types.Core.FPSConfig = {
    target: 60,
    forceSetTimeOut: true,
};

export const PARENT_CONFIG = 'app';

export const SIZE_CONFIG = {
    width: 800,
    height: 600,
};