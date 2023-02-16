import { Application } from 'pixi.js';

import { ISystem } from '@game/models/system';

export default class DebugDashboardSystem implements ISystem {
  private _gameApp: Application;
  private _dashboardEl: HTMLDivElement;
  private _onDeviceOrientation: EventListener;
  private _fpsEl: HTMLSpanElement;

  constructor(gameApp: Application) {
    this._gameApp = gameApp;
    this._dashboardEl = this._render();
    document.body.appendChild(this._dashboardEl);

    this._onDeviceOrientation = (e: Event) => {
      const betaEl = document.querySelector('#beta') as HTMLElement;
      const gammaEl = document.querySelector('#gamma') as HTMLElement;
      betaEl.innerText = Number((e as DeviceOrientationEvent).beta)
        .toFixed(2)
        .toString();
      gammaEl.innerText = Number((e as DeviceOrientationEvent).gamma)
        .toFixed(2)
        .toString();
    };

    setTimeout(() => {
      window.addEventListener('deviceorientation', this._onDeviceOrientation);
    });

    this._fpsEl = document.querySelector('#fps') as HTMLElement;
  }

  update(delta: number) {
    this._fpsEl.innerText = this._gameApp.ticker.FPS.toFixed(0);
  }

  destroy() {
    this._dashboardEl.remove();
    window.removeEventListener('deviceorientation', this._onDeviceOrientation);
  }

  private _render(): HTMLDivElement {
    const dashboardEl = document.createElement('div');
    dashboardEl.innerHTML = `
      <div style="position: fixed; left: 0; top: 0;">
        <div><span>beta(x):</span><span id="beta"/></div>
        <div><span>gamm(y):</span><span id="gamma"/></div>
        <div><span>fps:</span><span id="fps"/></div>
      </div>
    `;

    return dashboardEl;
  }
}

