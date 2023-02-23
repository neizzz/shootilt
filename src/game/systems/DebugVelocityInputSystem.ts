import { VelocityComponent } from '@game/models/component';
import { ISystem } from '@game/models/system';

const DEBUG_VELOCITY_UNIT = 5;

export default class DebugVelocityInputSystem implements ISystem {
  constructor(targetVelocityComponent: VelocityComponent) {
    window.addEventListener('keydown', (e) => {
      e.preventDefault();
      switch (e.code) {
        case 'ArrowLeft':
          targetVelocityComponent.vx = -DEBUG_VELOCITY_UNIT;
          break;
        case 'ArrowUp':
          targetVelocityComponent.vy = -DEBUG_VELOCITY_UNIT;
          break;
        case 'ArrowRight':
          targetVelocityComponent.vx = DEBUG_VELOCITY_UNIT;
          break;
        case 'ArrowDown':
          targetVelocityComponent.vy = DEBUG_VELOCITY_UNIT;
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      e.preventDefault();
      switch (e.code) {
        case 'ArrowLeft':
        case 'ArrowRight':
          targetVelocityComponent.vx = 0;
          break;
        case 'ArrowUp':
        case 'ArrowDown':
          targetVelocityComponent.vy = 0;
          break;
      }
    });
  }

  update() {}
}

