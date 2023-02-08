import { Dispatch, PropsWithChildren, createContext, useReducer } from 'react';
import styled from 'styled-components';

import InGameView from './components/InGameView';
import MainMenu from './components/MainMenu';
import appContextReducer, {
  AppContextActionType,
} from './reducers/appContextReducer';

const StyledContainer = styled.div<PropsWithChildren>`
  width: 100%;
  height: 100%;
  position: relative;
  top: 0;
  left: 0;
`;

const StyledBackground = styled.div<{ startGame: boolean }>`
  width: 100%;
  height: 100%;
  background-color: olive;
  position: absolute;
  top: 0;
  left: 0;
  transition: 400ms transform;
  transform: translateX(
      ${({ startGame }) => (startGame ? `${-window.innerWidth}px` : 0)}
    )
    translateZ(0);
`;

export type AppContext = {
  startGame: boolean;
  gameContext?: {
    phase: 'start' | 'pause';
    mode: 'single' | 'battle';
  };
  // TODO: 국제화 정보, 배틀 정보, ..
};

const initialAppContext = { startGame: false } as AppContext;

export const appContext = createContext<
  [AppContext, Dispatch<AppContextActionType>]
>([initialAppContext, (action: AppContextActionType) => {}]);

const App = () => {
  const [state, dispatch] = useReducer(appContextReducer, initialAppContext);

  return (
    <appContext.Provider value={[state, dispatch]}>
      <StyledContainer>
        <>
          {state.startGame && <InGameView />}
          <StyledBackground startGame={state.startGame} />
          <MainMenu />
        </>
      </StyledContainer>
    </appContext.Provider>
  );
};

export default App;

