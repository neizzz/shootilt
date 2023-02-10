import {
  Dispatch,
  PropsWithChildren,
  createContext,
  useContext,
  useReducer,
} from 'react';

export type AppContext = {
  currentScreen: 'main' | 'game' | 'game-round-end-modal';
};

export type AppContextActionType = {
  type: 'start-game' | 'end-game' | 'end-game-round';
  payload?: any;
};

const initialAppContext: AppContext = { currentScreen: 'main' };

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
      switch (action.type) {
        case 'start-game':
          return {
            currentScreen: 'game',
          };

        case 'end-game-round':
          return {
            currentScreen: 'game-round-end-modal',
          };

        case 'end-game':
          return {
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

