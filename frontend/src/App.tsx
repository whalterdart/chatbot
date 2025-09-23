import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UserLogin from './pages/UserLogin';
import ChatPage from './pages/ChatPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserLogin />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
