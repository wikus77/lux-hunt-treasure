import { Routes, Route } from 'react-router-dom';
import Admin from '@/pages/Admin'; // o usa ../../pages/Admin se @ non funziona

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}
