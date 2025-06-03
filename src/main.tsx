
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

const Home = () => (
  <div className="flex justify-center items-center h-screen bg-black text-white">
    <div className="text-center">
      <h1 className="text-6xl font-bold mb-4">
        <span className="text-[#00D1FF]">M1</span>
        <span className="text-white">SSION</span>
        <span className="text-xs align-top">™</span>
      </h1>
      <p className="text-xl text-gray-400">La sfida inizia qui</p>
    </div>
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
