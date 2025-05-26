
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import PublicLayout from "../../components/layout/PublicLayout";

// Pages
import Login from "../../pages/Login";
import Register from "../../pages/Register";
import Auth from "../../pages/Auth";
import KYC from "../../pages/KYC";
import Contacts from "../../pages/Contacts";
import EmailTest from "../../pages/EmailTest";
import Terms from "../../pages/Terms";
import PrivacyPolicy from "../../pages/PrivacyPolicy";
import CookiePolicy from "../../pages/CookiePolicy";
import HowItWorks from "../../pages/HowItWorks";
import AccessDenied from "../../pages/AccessDenied";
import { EmailVerificationPage } from "../../components/auth/EmailVerificationHandler";

const PublicRoutes = () => {
  // Feature flag for bottom navigation visibility (can be changed later)
  const showBottomNav = false; // Set to false as requested

  return (
    <Routes>
      {/* Remove the "/" route from here since it's handled in main AppRoutes */}
      <Route path="/register" element={<PublicLayout showBottomNav={showBottomNav}><Register /></PublicLayout>} />
      <Route path="/login" element={<PublicLayout showBottomNav={showBottomNav}><Login /></PublicLayout>} />
      <Route path="/auth" element={<PublicLayout showBottomNav={showBottomNav}><Auth /></PublicLayout>} />
      <Route path="/kyc" element={<PublicLayout showBottomNav={showBottomNav}><KYC /></PublicLayout>} />
      <Route path="/verification" element={<PublicLayout showBottomNav={showBottomNav}><EmailVerificationPage /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout showBottomNav={showBottomNav}><Contacts /></PublicLayout>} />
      <Route path="/contatti" element={<PublicLayout showBottomNav={showBottomNav}><Contacts /></PublicLayout>} /> {/* Italian alias */}
      <Route path="/email-test" element={<PublicLayout showBottomNav={showBottomNav}><EmailTest /></PublicLayout>} />
      <Route path="/terms" element={<PublicLayout showBottomNav={showBottomNav}><Terms /></PublicLayout>} />
      <Route path="/termini-e-condizioni" element={<PublicLayout showBottomNav={showBottomNav}><Terms /></PublicLayout>} /> {/* Italian alias */}
      <Route path="/privacy" element={<PublicLayout showBottomNav={showBottomNav}><PrivacyPolicy /></PublicLayout>} />
      <Route path="/privacy-policy" element={<PublicLayout showBottomNav={showBottomNav}><PrivacyPolicy /></PublicLayout>} /> {/* Alternative path */}
      <Route path="/cookie-policy" element={<PublicLayout showBottomNav={showBottomNav}><CookiePolicy /></PublicLayout>} />
      <Route path="/how-it-works" element={<PublicLayout showBottomNav={showBottomNav}><HowItWorks /></PublicLayout>} />
      <Route path="/access-denied" element={<PublicLayout showBottomNav={showBottomNav}><AccessDenied /></PublicLayout>} />
    </Routes>
  );
};

export default PublicRoutes;
