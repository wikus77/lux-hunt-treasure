
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from './pages/Index';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import TestAgent from './pages/TestAgent';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CookiePolicy from './pages/CookiePolicy';
import Terms from './pages/Terms';
import Contacts from './pages/Contacts';
import Clues from './pages/Clues';
import Map from './pages/Map';
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/auth/AuthProvider";
import { SoundProvider } from "./contexts/SoundContext";
import { ErrorBoundary } from "./components/error/ErrorBoundary";
import GlobalLayout from "./components/layout/GlobalLayout";

function App() {
  return (
    <Router>
      <SoundProvider>
        <AuthProvider>
          <ErrorBoundary>
            <GlobalLayout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/home" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/test-agent" element={<TestAgent />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/cookie-policy" element={<CookiePolicy />} />
                <Route path="/termini-e-condizioni" element={<Terms />} />
                <Route path="/contatti" element={<Contacts />} />
                <Route path="/clues" element={<Clues />} />
                <Route path="/clues/:id" element={<Clues />} />
                <Route path="/map" element={<Map />} />
              </Routes>
              <Toaster position="top-right" />
            </GlobalLayout>
          </ErrorBoundary>
        </AuthProvider>
      </SoundProvider>
    </Router>
  );
}

export default App;
