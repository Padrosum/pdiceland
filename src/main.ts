import { Game } from './core/Game';

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement | null;
if (!canvas) {
  throw new Error('game-canvas not found');
}

new Game(canvas, 'ui-root');
