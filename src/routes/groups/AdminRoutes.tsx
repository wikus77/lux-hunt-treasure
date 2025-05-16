AdminRoutes.tsx
import { Routes, Route } from 'react-router-dom';
import Admin from '../../pages/Admin';

export default function AdminRoutes() {
  return (
    <>
      <Route path="/admin" element={<Admin />} />
    </>
  );
}
