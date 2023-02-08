import styled from 'styled-components';

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
  return <StyledContainer>InGameView</StyledContainer>;
};

export default InGameView;

