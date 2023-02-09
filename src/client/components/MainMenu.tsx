import { useContext } from 'react';
import styled from 'styled-components';

import { appContext } from '@client/App';

import MainMenuButton from './MainMenuButton';

const StyledContainer = styled.div<{ startGame: boolean }>`
  background-color: rgba(0, 0, 0, 0.3);
  width: 16em;
  position: absolute;
  top: 0;
  right: 0;
  margin-top: 4em;
  padding-top: 2em;
  padding-bottom: 2em;
  border-radius: 2em 0 0 2em;

  display: flex;
  flex-direction: column;
  align-items: center;

  transition: 300ms transform;
  transform: translateX(${({ startGame }) => (startGame ? '300px' : 0)})
    translateZ(0);
`;

const MainMenu = () => {
  const [{ startGame }, dispatch] = useContext(appContext);

  return (
    <StyledContainer startGame={startGame}>
      <MainMenuButton
        text={'Single Play'}
        onClick={() => {
          dispatch({
            type: 'start-game',
            payload: {
              gameContext: {
                phase: 'start',
                mode: 'single',
              },
            },
          });
        }}
      />
    </StyledContainer>
  );
};

export default MainMenu;

