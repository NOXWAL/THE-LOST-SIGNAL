import { Game } from './core/Game';

function initGame() {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  const uiContainer = document.getElementById('ui-container') as HTMLElement;

  if (!canvas || !uiContainer) {
    console.error('Failed to locate mount elements #game-canvas or #ui-container');
    return;
  }

  const game = new Game(canvas, uiContainer);
  game.start();

  // Expose for debugging in dev
  (window as any).__LOST_SIGNAL_GAME__ = game;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}
