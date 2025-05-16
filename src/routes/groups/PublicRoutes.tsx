
import { Route } from 'react-router-dom';
import Index from '../../pages/Index';
import Login from '../../pages/Login';
import Register from '../../pages/Register';
import Auth from '../../pages/Auth';
import PublicLayout from '../../components/layout/PublicLayout';
import HowItWorks from '../../pages/HowItWorks';
import PrivacyPolicy from '../../pages/PrivacyPolicy';
import Terms from '../../pages/Terms';
import CookiePolicy from '../../pages/CookiePolicy';

// Public routes that don't require authentication
const PublicRoutes = () => {
  return (
    <>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/cookie-policy" element={<CookiePolicy />} />
    </>
  );
};

export default PublicRoutes;
