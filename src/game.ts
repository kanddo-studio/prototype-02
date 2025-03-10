import './styles/global.css';
import Phaser from 'phaser';
import { PlaygroundScene } from './core/scenes/PlaygroundScene';
import { FPS_CONFIG, PARENT_CONFIG, PHYSICS_CONFIG, RENDER_CONFIG, SIZE_CONFIG } from './constants/GameConfig';

const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: SIZE_CONFIG.width,
  height: SIZE_CONFIG.height,
  physics: PHYSICS_CONFIG,
  render: RENDER_CONFIG,
  fps: FPS_CONFIG,
  parent: PARENT_CONFIG,
  pixelArt: true,
  scene: new PlaygroundScene(),
};

function init() {
  new Phaser.Game(gameConfig);
}

init();
