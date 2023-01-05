import Game from '@game';

declare global {
  interface Window {
    GameContext: any;
  }
}

document.body.style.margin = '0';
document.body.style.padding = '0';

/** Dashboard for test */
{
  document.body.innerHTML = `
    <div style="position: fixed; left: 0; top: 0;">
      <div><span>beta(x):</span><span class="beta"/></div>
      <div><span>gamm(y):</span><span class="gamma"/></div>
    </div>
  `;

  document.addEventListener('DOMContentLoaded', () => {
    const betaEl = document.querySelector('.beta') as HTMLElement;
    const gammaEl = document.querySelector('.gamma') as HTMLElement;

    window.addEventListener('deviceorientation', (e) => {
      betaEl.innerText = Number(e.beta).toFixed(2).toString();
      gammaEl.innerText = Number(e.gamma).toFixed(2).toString();
    });

    const currentGame = new Game();
    currentGame.start();
  });
}

