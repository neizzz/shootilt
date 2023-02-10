import { PropsWithChildren } from 'react';
import styled from 'styled-components';

import InGameView from './components/InGameView';
import MainMenu from './components/MainMenu';
import { useAppContext } from './providers/AppContextProvider';
import GameContextProvider from './providers/GameDispatcherProvider';

const StyledContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  top: 0;
  left: 0;
`;

const StyledBackground = styled.div<{ inGame: boolean }>`
  width: 100%;
  height: 100%;
  background-color: olive;
  position: absolute;
  top: 0;
  left: 0;
  transition: 200ms transform;
  transform: translateX(
      ${({ inGame }) => (inGame ? `${-window.innerWidth - 50}px` : 0)}
    )
    translateZ(0);
`;

const App = () => {
  const [appContext] = useAppContext();
  const inGame = appContext.currentScreen !== 'main';

  return (
    <GameContextProvider>
      <StyledContainer>
        {inGame && <InGameView />}
        <StyledBackground inGame={inGame} />
        <MainMenu inGame={inGame} />
      </StyledContainer>
    </GameContextProvider>
  );
};

export default App;

