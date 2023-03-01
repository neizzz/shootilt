import {
  Dispatch,
  PropsWithChildren,
  createContext,
  useContext,
  useReducer,
} from 'react';

/** FIXME: */
type ScreenType = 'main' | 'game' | 'game-round-end-modal';

export type AppContext = {
  previousScreen?: ScreenType;
  currentScreen: ScreenType;
};

export type AppContextActionType = {
  type: 'start-game' | 'end-game' | 'end-game-round';
  payload?: any;
};

const initialAppContext: AppContext = {
  previousScreen: undefined,
  currentScreen: 'main',
};

const appContext = createContext<[AppContext, Dispatch<AppContextActionType>]>([
  initialAppContext,
  (action: AppContextActionType) => {},
]);

export const useAppContext = () => {
  return useContext(appContext);
};

const AppContextProvider = ({ children }: PropsWithChildren) => {
  const [state, dispatch] = useReducer(
    (state: AppContext, action: AppContextActionType): AppContext => {
      console.debug('AppAction:', action.type);
      switch (action.type) {
        case 'start-game':
          return {
            previousScreen: state.currentScreen,
            currentScreen: 'game',
          };

        case 'end-game-round':
          return {
            previousScreen: state.currentScreen,
            currentScreen: 'game-round-end-modal',
          };

        case 'end-game':
          return {
            previousScreen: state.currentScreen,
            currentScreen: 'main',
          };
      }
    },
    initialAppContext
  );

  return (
    <appContext.Provider value={[state, dispatch]}>
      {children}
    </appContext.Provider>
  );
};

export default AppContextProvider;

