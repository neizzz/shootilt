import { AppContext } from '@client/App';

export type AppContextActionType = {
  type: 'start-game' | 'end-game' | 'pause-game';
  payload?: any;
};

const appContextReducer = (
  state: AppContext,
  action: AppContextActionType
): AppContext => {
  switch (action.type) {
    case 'start-game':
      return {
        startGame: true,
        gameContext: {
          ...action.payload.gameConext,
        },
      };
    case 'end-game':
    case 'pause-game':
  }

  return state;
};

export default appContextReducer;

