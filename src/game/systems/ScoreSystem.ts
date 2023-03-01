import { BitmapFont, BitmapText, Container } from 'pixi.js';

import { GameContext } from '@game';

import { ISystem } from '@game/models/ecs';

export default class ScoreSystem implements ISystem {
  private _score = 0;
  private _scoreText: BitmapText;
  private _intervalTimer: ReturnType<typeof setInterval>;

  constructor(stage: Container) {
    /** TODO: 외부 ttf를 BitmapFont로 로드하는 거는 좀더 리서치 필요 */
    BitmapFont.from(
      __SCORE_FONT_NAME__,
      {
        // fontFamily: 'Gamer',
        fill: '#ffffff',
        fontSize: 20,
        stroke: 'olive',
        strokeThickness: 1,
      },
      { resolution: window.devicePixelRatio }
    );

    this._scoreText = new BitmapText(this._score.toString(), {
      fontName: __SCORE_FONT_NAME__,
      align: 'right',
    });
    this._scoreText.anchor.set(1, 0);
    this._scoreText.x = GameContext.VIEW_WIDTH - 5;
    stage.addChild(this._scoreText);

    this._intervalTimer = setInterval(() => {
      this._addScore(1); // TODO: apply factor
    }, 1000);
  }

  destroy() {
    clearInterval(this._intervalTimer);
  }

  update() {
    this._scoreText.text = this._score.toString();
    this._scoreText.updateText();
  }

  private _trackerDeadListener({ stateValue }: { stateValue?: string }) {
    this._addScore(3); // TODO: apply factor
  }

  private _addScore(scoreToAdd: number) {
    this._score += scoreToAdd;
    this.update();
  }
}

