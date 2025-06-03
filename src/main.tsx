
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

const Home = () => (
  <div className="flex justify-center items-center h-screen bg-black text-white">
    <h1 className="text-4xl font-bold">M1SSION APP - HOME</h1>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
