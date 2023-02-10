import styled from 'styled-components';

import { useAppContext } from '@client/providers/AppContextProvider';
import { useGameDispatcher } from '@client/providers/GameDispatcherProvider';

const StyledContainer = styled.div`
  border: 0.2em solid white;
  background-color: olive;
  color: black;
  padding: 1em;

  display: flex;
  justify-content: center;
  align-items: center;

  pointer-events: all;

  button + button {
    margin-left: 0.6em;
  }
`;

type Props = {};

const RoundEndModalContent = (props: Props) => {
  const [_, dispatchAppContext] = useAppContext();
  const dispatchGame = useGameDispatcher();

  return (
    <StyledContainer>
      <button
        onClick={() => {
          dispatchAppContext({ type: 'end-game' });
          dispatchGame({ type: 'destroy' });
        }}
      >
        그만하기
      </button>
      <button
        onClick={() => {
          dispatchAppContext({ type: 'start-game' });
          dispatchGame({ type: 'restart-round' });
        }}
      >
        다시하기
      </button>
    </StyledContainer>
  );
};

export default RoundEndModalContent;

