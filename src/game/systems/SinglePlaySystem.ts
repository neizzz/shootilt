import * as Ecs from 'bitecs';

import Game from '@game';

import { ISystem, PlayerTag } from '@game/models/ecs';

export default class SinglePlaySystem implements ISystem {
  private _game: Game;

  private _queryExitedPlayer = Ecs.exitQuery(Ecs.defineQuery([PlayerTag]));

  constructor(game: Game) {
    this._game = game;
  }

  update(world: Ecs.IWorld) {
    const player = this._queryExitedPlayer(world)[0];

    if (player !== undefined) {
      this._game.endRound();
    }
  }
}

