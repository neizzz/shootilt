import styled from 'styled-components';

import { useAppContext } from '@client/providers/AppContextProvider';
import { useGameDispatcher } from '@client/providers/GameDispatcherProvider';

import MainMenuButton from './MainMenuButton';

const StyledContainer = styled.div<{ inGame: boolean }>`
  box-sizing: border-box;
  background-color: rgba(0, 0, 0, 0.3);
  width: 14.5em;
  position: absolute;
  top: 0;
  right: 0;
  margin-top: 6em;
  padding-right: 1em;
  padding-top: 1.5em;
  padding-bottom: 1.5em;
  border-radius: 2em 0 0 2em;

  display: flex;
  flex-direction: column;
  align-items: end;

  transition: 200ms transform;
  transform: translateX(${({ inGame }) => (inGame ? '300px' : 0)}) translateZ(0);
`;

type Props = {
  inGame: boolean;
};

const MainMenu = ({ inGame }: Props) => {
  const dispatchAppContext = useAppContext()[1];
  const dispatchGameContext = useGameDispatcher();

  return (
    <StyledContainer inGame={inGame}>
      <MainMenuButton
        text={'Single Play'}
        onClick={() => {
          dispatchAppContext({
            type: 'start-game',
          });
          dispatchGameContext({
            type: 'set-mode',
            payload: {
              mode: 'single',
            },
          });
        }}
      />
      <MainMenuButton
        text={'Battle Play'}
        onClick={() => {
          /** TODO: */
        }}
      />
    </StyledContainer>
  );
};

export default MainMenu;

