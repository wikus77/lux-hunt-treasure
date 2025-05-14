
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from './pages/Index';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/auth/AuthProvider";
import { SoundProvider } from "./contexts/SoundContext";
import { ErrorBoundary } from "./components/error/ErrorBoundary";

function App() {
  return (
    <Router>
      <SoundProvider>
        <AuthProvider>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/home" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
            <Toaster position="top-right" />
          </ErrorBoundary>
        </AuthProvider>
      </SoundProvider>
    </Router>
  );
}

export default App;
