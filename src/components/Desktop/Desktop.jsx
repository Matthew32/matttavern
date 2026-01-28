import React, { useState } from 'react';
import styled from 'styled-components';
import Taskbar from './Taskbar';
import DesktopIcon from './DesktopIcon';
import Window from '../Window/Window';
import Blog from '../Apps/Blog/Blog';
import Presentation from '../Apps/Presentation/Presentation';
import AdminPanel from '../Apps/Admin/AdminPanel';

const DesktopWrapper = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  /* background-color: #3B6EA5; defined in global, but good to be safe */
`;

const IconsContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  height: 90vh; /* Adjust based on icon layout preference */
  align-content: flex-start;
  padding: 10px;
`;

const Desktop = () => {
  const apps = [
    { id: 'presentation', label: 'Welcome', icon: '👋', color: '#ffcc00', component: Presentation, width: '500px', height: '400px' },
    { id: 'my-computer', label: 'My Computer', icon: '💻', color: '#4287f5', component: () => <div style={{padding: 20}}>System Specs: Node.js Project</div> },
    { id: 'recycle-bin', label: 'Recycle Bin', icon: '🗑️', color: '#aaa', component: () => <div style={{padding: 20}}>The bin is empty.</div> },
    { id: 'blog', label: 'My Blog', icon: '📝', color: '#ff9900', component: Blog, width: '600px', height: '500px' },
    { id: 'admin', label: 'Admin', icon: '🔧', color: '#00897B', component: AdminPanel, width: '600px', height: '500px' },
    { id: 'about', label: 'About Me', icon: '👤', color: '#cc00ff', component: () => <div style={{padding: 20}}><h3>Hello!</h3><p>I am a developer who loves retro UIs.</p></div> },
  ];

  const [windows, setWindows] = useState([
    {
      id: 1,
      appId: 'presentation',
      title: 'Welcome',
      component: Presentation,
      zIndex: 10,
      minimized: false,
      width: '500px',
      height: '400px'
    }
  ]);
  const [activeWindowId, setActiveWindowId] = useState(1);
  const [nextZIndex, setNextZIndex] = useState(11);
  const [idCounter, setIdCounter] = useState(2);

  const openWindow = (app) => {
    const existingWindow = windows.find(w => w.appId === app.id);
    
    if (existingWindow) {
      focusWindow(existingWindow.id);
      if (existingWindow.minimized) {
        setWindows(prev => prev.map(w => w.id === existingWindow.id ? { ...w, minimized: false } : w));
      }
      return;
    }

    const newId = idCounter;
    setIdCounter(prev => prev + 1);

    const newWindow = {
      id: newId,
      appId: app.id,
      title: app.label,
      component: app.component,
      zIndex: nextZIndex,
      minimized: false,
      width: app.width,
      height: app.height
    };

    setWindows([...windows, newWindow]);
    setActiveWindowId(newWindow.id);
    setNextZIndex(nextZIndex + 1);
  };

  const closeWindow = (id) => {
    setWindows(windows.filter(w => w.id !== id));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  const minimizeWindow = (id) => {
    setWindows(windows.map(w => w.id === id ? { ...w, minimized: true } : w));
    setActiveWindowId(null);
  };

  const focusWindow = (id) => {
    const win = windows.find(w => w.id === id);
    if (!win) return;
    
    if (win.zIndex !== nextZIndex - 1) {
        setWindows(windows.map(w => w.id === id ? { ...w, zIndex: nextZIndex } : w));
        setNextZIndex(nextZIndex + 1);
    }
    setActiveWindowId(id);
  };

  const toggleMinimize = (id) => {
    const win = windows.find(w => w.id === id);
    if (win.minimized) {
      setWindows(windows.map(w => w.id === id ? { ...w, minimized: false, zIndex: nextZIndex } : w));
      setNextZIndex(nextZIndex + 1);
      setActiveWindowId(id);
    } else if (activeWindowId === id) {
      minimizeWindow(id);
    } else {
      focusWindow(id);
    }
  };

  return (
    <DesktopWrapper>
      <IconsContainer>
        {apps.map(app => (
          <DesktopIcon 
            key={app.id} 
            label={app.label} 
            icon={app.icon} 
            color={app.color}
            onClick={() => openWindow(app)} 
          />
        ))}
      </IconsContainer>

      {windows.map(win => (
        <Window
          key={win.id}
          id={win.id}
          title={win.title}
          zIndex={win.zIndex}
          onClose={closeWindow}
          onMinimize={minimizeWindow}
          onFocus={focusWindow}
          isActive={activeWindowId === win.id}
          width={win.width}
          height={win.height}
          isMinimized={win.minimized}
        >
          <win.component />
        </Window>
      ))}

      <Taskbar 
        windows={windows} 
        activeWindowId={activeWindowId} 
        onTaskClick={toggleMinimize} 
      />
    </DesktopWrapper>
  );
};

export default Desktop;
