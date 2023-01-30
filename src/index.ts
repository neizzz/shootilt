import Game from '@game';

declare global {
  interface Window {
    GameContext: any;
  }
}

document.body.style.margin = '0';
document.body.style.padding = '0';

document.addEventListener('DOMContentLoaded', () => {
  const currentGame = new Game();
  currentGame.start();
});

