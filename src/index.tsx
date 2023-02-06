import { createRoot } from 'react-dom/client';

import App from '@client/index';

// import Game from '@game';
import './gameContext';
import './style.css';

declare global {
  interface Window {
    GameContext: any;
  }
}

// document.addEventListener('DOMContentLoaded', () => {
//   const currentGame = new Game();
//   currentGame.start();
// });

const container = document.getElementById('shootilt-app');
const root = createRoot(container as HTMLElement);
root.render(<App />);

