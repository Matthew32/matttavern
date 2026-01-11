import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const TaskbarWrapper = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: #5D4037; /* Dark leather/wood color */
  border-top: 2px solid #3E2723;
  display: flex;
  align-items: center;
  padding: 0 10px;
  z-index: 9999;
  user-select: none;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.5);
`;

const StartButton = styled.button`
  height: 30px;
  padding: 0 15px;
  background: #EFEBE9;
  border: 1px solid #8D6E63;
  border-radius: 2px;
  color: #3E2723;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  margin-right: 15px;
  box-shadow: 2px 2px 0px rgba(0,0,0,0.2);

  &:hover {
    background: #FFF;
  }
  
  &:active {
    transform: translateY(1px);
    box-shadow: 1px 1px 0px rgba(0,0,0,0.2);
  }
`;

const TaskList = styled.div`
  flex: 1;
  display: flex;
  gap: 2px;
  padding: 2px;
  height: 100%;
`;

const TaskButton = styled.button`
  background: ${props => props.$active ? '#FFF' : '#D7CCC8'};
  color: #3E2723;
  border: 1px solid #A1887F;
  border-bottom: none;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  padding: 0 15px;
  height: 30px; /* Stick up from bottom */
  margin-top: 10px; /* Align to bottom */
  min-width: 120px;
  max-width: 200px;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  cursor: pointer;
  font-family: 'Courier New', monospace;
  box-shadow: ${props => props.$active ? '0 -2px 5px rgba(0,0,0,0.1)' : 'inset 0 -5px 10px rgba(0,0,0,0.1)'};
  position: relative;
  top: ${props => props.$active ? '2px' : '6px'};

  &:hover {
    background-color: #FFF;
    top: 2px;
  }
`;

const Clock = styled.div`
  background: #3E2723;
  border: 1px solid #5D4037;
  padding: 5px 10px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #EFEBE9;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  margin-left: auto;
  border-radius: 2px;
  box-shadow: inset 1px 1px 3px rgba(0,0,0,0.5);
`;

const StartMenuContainer = styled.div`
  position: absolute;
  bottom: 40px;
  left: 10px;
  width: 220px;
  background-color: #FFF8E1; /* Paper color */
  border: 1px solid #8D6E63;
  box-shadow: 3px 3px 10px rgba(0,0,0,0.3);
  z-index: 10000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Courier New', monospace;
  transform: rotate(1deg); /* Slight rotation */
`;

const StartHeader = styled.div`
  background: #5D4037;
  padding: 15px;
  color: #EFEBE9;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 2px dashed #8D6E63;
`;

const StartBody = styled.div`
  padding: 10px;
  background-color: #FFF8E1;
`;

const StartItem = styled.div`
  padding: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #3E2723;
  border-bottom: 1px solid #EFEBE9;
  
  &:hover {
    background-color: #FFE0B2;
    color: #3E2723;
  }
`;

const Taskbar = ({ windows, activeWindowId, onTaskClick }) => {
  const [time, setTime] = useState(new Date());
  const [startOpen, setStartOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const handleClickOutside = (e) => {
      if (startOpen && !e.target.closest('.start-menu-trigger') && !e.target.closest('.start-menu')) {
        setStartOpen(false);
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => {
      clearInterval(timer);
      window.removeEventListener('click', handleClickOutside);
    };
  }, [startOpen]);

  return (
    <TaskbarWrapper>
      {startOpen && (
        <StartMenuContainer className="start-menu">
          <StartHeader>
             <span style={{ fontSize: '20px' }}>👤</span> Admin
          </StartHeader>
          <StartBody>
            {/* <StartItem>My Documents</StartItem>
            <StartItem>My Pictures</StartItem>
            <StartItem>My Computer</StartItem>
            <div style={{ height: '1px', background: '#ccc', margin: '5px 0' }} /> */}
            <StartItem onClick={() => window.open('/blog', '_blank')}>My Blog</StartItem>
          </StartBody>
          <div style={{ background: '#245EDC', padding: '5px', display: 'flex', justifyContent: 'flex-end' }}>
             <span style={{ color: 'white', fontSize: '11px', cursor: 'pointer' }}>Turn Off Computer</span>
          </div>
        </StartMenuContainer>
      )}
      <StartButton 
        className="start-menu-trigger" 
        onClick={() => setStartOpen(!startOpen)}
        style={{ filter: startOpen ? 'brightness(0.8)' : 'none' }}
      >
        <span style={{ fontSize: '18px' }}>❖</span> start
      </StartButton>
      <TaskList>
        {windows.map(win => (
          <TaskButton 
            key={win.id} 
            $active={activeWindowId === win.id && !win.minimized}
            onClick={() => onTaskClick(win.id)}
          >
            {win.title}
          </TaskButton>
        ))}
      </TaskList>
      <Clock>
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Clock>
    </TaskbarWrapper>
  );
};

export default Taskbar;
