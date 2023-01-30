import { ISystem } from '@game/models/system';

export default class DebugDashboardSystem implements ISystem {
  constructor() {
    document.body.appendChild(this._dashboardEl());

    setTimeout(() => {
      const betaEl = document.querySelector('#beta') as HTMLElement;
      const gammaEl = document.querySelector('#gamma') as HTMLElement;

      window.addEventListener('deviceorientation', (e) => {
        betaEl.innerText = Number(e.beta).toFixed(2).toString();
        gammaEl.innerText = Number(e.gamma).toFixed(2).toString();
      });
    });
  }

  update(delta: number) {
    const fdEl = document.querySelector('#fd') as HTMLElement;
    fdEl.innerText = delta.toFixed(2).toString();
  }

  private _dashboardEl(): HTMLElement {
    const dashboardEl = document.createElement('div');
    dashboardEl.innerHTML = `
      <div style="position: fixed; left: 0; top: 0;">
        <div><span>beta(x):</span><span id="beta"/></div>
        <div><span>gamm(y):</span><span id="gamma"/></div>
        <div><span>frame delta(ms):</span><span id="fd"/></div>
      </div>
    `;

    return dashboardEl;
  }
}

