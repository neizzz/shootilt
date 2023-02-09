import { useEffect, useRef } from 'react';
import styled from 'styled-components';

import Game from '@game';

const StyledContainer = styled.div`
  width: 100%;
  height: 100%;
  background: orangered;

  position: absolute;
  top: 0;
  left: 0;
`;

type Props = {};

/** 인게임 모듈(@game/*)과의 통신 포인트 */
const InGameView = (props: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef(new Game());

  useEffect(() => {
    if (!containerRef.current) {
      throw new Error('game container is not initialized.');
    }

    gameInstanceRef.current.start(containerRef.current);
  }, []);

  return <StyledContainer ref={containerRef} />;
};

export default InGameView;

