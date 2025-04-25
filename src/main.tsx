
import React from 'react';
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

import Events from './pages/Events'
import MainLayout from './components/layout/MainLayout'
import Home from './pages/Home'
import Map from './pages/Map'
import NotFound from './pages/NotFound'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Subscriptions from './pages/Subscriptions'
import Notifications from './pages/Notifications'
import Buzz from './pages/Buzz'
import PaymentMethods from './pages/PaymentMethods'
import Stats from './pages/Stats'
import Index from './pages/Index'
import Register from './pages/Register'

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<MainLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/map" element={<Map />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/buzz" element={<Buzz />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/payment-methods" element={<PaymentMethods />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </App>
    </BrowserRouter>
  </React.StrictMode>
);
