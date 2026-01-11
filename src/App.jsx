import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Desktop from './components/Desktop/Desktop';
import Blog from './components/Apps/Blog/Blog';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Desktop />} />
        <Route path="/blog" element={<div style={{ padding: 20 }}><Blog /></div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
