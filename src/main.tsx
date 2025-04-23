
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

import Events from './pages/Events'
import MainLayout from './components/layout/MainLayout'

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Events />} />
          <Route path="/events" element={<Events />} />
        </Route>
      </Routes>
    </App>
  </BrowserRouter>
);
