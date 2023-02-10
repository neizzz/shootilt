import {
  Dispatch,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';

import Game from '@game';

import { useAppContext } from './AppContextProvider';

export type GameContextActionType = {
  type:
    | 'set-mode'
    | 'start-round'
    | 'restart-round'
    | 'end-round'
    | 'destroy'
    | 'pause';
  payload?: any;
};

const gameDispatcherContext = createContext<Dispatch<GameContextActionType>>(
  (action: GameContextActionType) => {}
);

export const useGameDispatcher = () => {
  return useContext(gameDispatcherContext);
};

// FIXME: ??
let mode: 'single' | 'battle';

type Props = PropsWithChildren;

const GameDispatcherProvider = ({ children }: Props) => {
  const [_, dispatchAppContext] = useAppContext();
  const gameInstanceRef = useRef<Game>();

  useEffect(() => {
    gameInstanceRef.current = new Game({
      onEndRound: () => dispatch({ type: 'end-round' }),
    });
  }, []);

  const dispatch = useCallback((action: GameContextActionType) => {
    if (!gameInstanceRef.current) {
      throw new Error('game instance is not initialized');
    }

    const gameInstance = gameInstanceRef.current;

    switch (action.type) {
      case 'set-mode':
        mode = action.payload.mode;
        break;

      case 'start-round':
        gameInstance.init();
        gameInstance.appendViewTo(action.payload.parentEl);
        gameInstance.startRound();
        break;

      case 'restart-round':
        gameInstance.restartRound();
        break;

      case 'end-round':
        dispatchAppContext({ type: 'end-game-round' });
        break;

      case 'destroy':
        gameInstance.destroy();
        break;

      case 'pause':
    }
  }, []);

  return (
    <gameDispatcherContext.Provider value={dispatch}>
      {children}
    </gameDispatcherContext.Provider>
  );
};

export default GameDispatcherProvider;

