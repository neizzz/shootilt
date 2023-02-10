import { PropsWithChildren } from 'react';
import styled from 'styled-components';

const StyledDimmedLayer = styled.div`
  width: 100%;
  height: 100%;
  pointer-events: none;
  background-color: rgba(0, 0, 0, 0.5);

  display: flex;
  justify-content: center;
  align-items: center;

  position: absolute;
  top: 0;
  left: 0;
`;

type Props = PropsWithChildren;

const Modal = ({ children }: Props) => {
  return <StyledDimmedLayer>{children}</StyledDimmedLayer>;
};

export default Modal;

