import React from 'react';
import Draggable from 'react-draggable';
import styled from 'styled-components';

const DraggableContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  z-index: ${props => props.$zIndex};
  display: flex;
  flex-direction: column;
  
  &.minimized {
    display: none;
  }
`;

const WindowWrapper = styled.div`
  background-color: #fff;
  border: 1px solid #dcdcdc;
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  padding: 0;
  width: ${props => props.$width || '400px'};
  height: ${props => props.$height || '300px'};
  transform: rotate(-1deg); /* Slight rotation for natural paper feel */
`;

const TitleBar = styled.div`
  background: #333; /* Dark tape look */
  color: white;
  padding: 8px 15px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: grab;
  font-size: 14px;
  height: 40px;
  border-bottom: 2px solid #222;
  font-family: 'Courier New', monospace;

  &:active {
    cursor: grabbing;
  }
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const Controls = styled.div`
  display: flex;
  gap: 2px;
`;

const Button = styled.button`
  width: 20px;
  height: 20px;
  border: 1px solid white;
  border-radius: 50%;
  background: transparent;
  color: white;
  font-size: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  padding: 0;
  border: 1px solid #aaa;
  margin-left: 5px;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }

  &.close {
    background-color: #ff5f56;
    border: 1px solid #e0443e;
    color: transparent;
    
    &:hover {
       color: #550000;
    }
  }
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: white;
  margin: 0;
  border: none;
  overflow: hidden;
  position: relative;
  background-image: 
    linear-gradient(#A4C3E3 1px, transparent 1px);
  background-size: 100% 25px; /* Line spacing */
  padding: 0 20px; /* Margins */
  
  /* Vertical red line margin */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 40px;
    width: 2px;
    background-color: #FFB6C1; /* Light red margin line */
    z-index: 1;
  }
`;

const Window = ({ 
  id, 
  title, 
  children, 
  onClose, 
  onMinimize, 
  onFocus, 
  zIndex,
  width,
  height,
  isMinimized
}) => {
  const nodeRef = React.useRef(null);
  
  const getPosition = () => {
      // Safely parse dimensions or use defaults
      const w = parseInt(width, 10) || 400;
      const h = parseInt(height, 10) || 300;
      
      // Ensure window dimensions are available
      const screenW = typeof window !== 'undefined' ? window.innerWidth : 1024;
      const screenH = typeof window !== 'undefined' ? window.innerHeight : 768;

      // Calculate center, but ensure we don't go off-screen (negative values)
      const x = Math.max(0, (screenW - w) / 2);
      const y = Math.max(0, (screenH - h) / 2);
      
      return { x, y };
  };

  return (
    <Draggable 
      nodeRef={nodeRef} 
      handle=".title-bar" 
      onMouseDown={() => onFocus(id)}
      defaultPosition={getPosition()}
    >
      <DraggableContainer
        ref={nodeRef}
        $zIndex={zIndex}
        className={isMinimized ? 'minimized' : ''}
        onClick={() => onFocus(id)}
      >
        <WindowWrapper 
          $width={width} 
          $height={height} 
        >
          <TitleBar className="title-bar">
            <Title>{title}</Title>
            <Controls>
              <Button onClick={(e) => { e.stopPropagation(); onMinimize(id); }}>_</Button>
              <Button>□</Button>
              <Button className="close" onClick={(e) => { e.stopPropagation(); onClose(id); }}>X</Button>
            </Controls>
          </TitleBar>
          <Content>
            {children}
          </Content>
        </WindowWrapper>
      </DraggableContainer>
    </Draggable>
  );
};

export default Window;
