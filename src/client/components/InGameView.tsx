import { useEffect, useRef } from 'react';
import styled from 'styled-components';

import { useAppContext } from '@client/providers/AppContextProvider';
import { useGameDispatcher } from '@client/providers/GameDispatcherProvider';

import Modal from './Modal';
import RoundEndModalContent from './RoundEndModalContent';

const StyledContainer = styled.div`
  width: 100%;
  height: 100%;

  position: absolute;
  top: 0;
  left: 0;
`;

const InGameView = () => {
  const [{ currentScreen }] = useAppContext();
  const dispatch = useGameDispatcher();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentScreen !== 'game') {
      return;
    }

    if (!containerRef.current) {
      throw new Error('game container is not initialized.');
    }

    dispatch({
      type: 'start-round',
      payload: {
        parentEl: containerRef.current,
      },
    });
  }, [currentScreen]);

  return (
    <StyledContainer ref={containerRef}>
      {currentScreen === 'game-round-end-modal' && (
        <Modal>
          <RoundEndModalContent />
        </Modal>
      )}
    </StyledContainer>
  );
};

export default InGameView;

