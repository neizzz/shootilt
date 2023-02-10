import styled from 'styled-components';

const StyledButtonOutline = styled.button`
  width: 14em;
  height: auto;
  border: 1px solid black;
  border-radius: 1rem;
  outline: none;
  padding: 0;

  & + & {
    margin-top: 1em;
  }
`;

const StyledContainer = styled.div`
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  border: 0.4em solid white;
  border-radius: 1.2rem;
  padding-top: 0.4em;
  padding-bottom: 0.4em;

  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  background-color: #12e532;
  color: white;
  font-size: 1.4em;
  font-weight: 600;
`;

type Props = {
  text: string;
  onClick: () => void;
};

const MainMenuButton = ({ text, onClick }: Props) => {
  return (
    <StyledButtonOutline onClick={onClick}>
      <StyledContainer>{text}</StyledContainer>
    </StyledButtonOutline>
  );
};

export default MainMenuButton;

