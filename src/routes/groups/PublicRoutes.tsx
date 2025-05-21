
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
import Index from "../../pages/Index";
import { EmailVerificationPage } from "../../components/auth/EmailVerificationHandler";

const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<PublicLayout><Index /></PublicLayout>} />
      <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
      <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
      <Route path="/auth" element={<PublicLayout><Auth /></PublicLayout>} />
      <Route path="/kyc" element={<PublicLayout><KYC /></PublicLayout>} />
      <Route path="/verification" element={<PublicLayout><EmailVerificationPage /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><Contacts /></PublicLayout>} />
      <Route path="/contatti" element={<PublicLayout><Contacts /></PublicLayout>} /> {/* Italian alias */}
      <Route path="/email-test" element={<PublicLayout><EmailTest /></PublicLayout>} />
      <Route path="/terms" element={<PublicLayout><Terms /></PublicLayout>} />
      <Route path="/termini-e-condizioni" element={<PublicLayout><Terms /></PublicLayout>} /> {/* Italian alias */}
      <Route path="/privacy" element={<PublicLayout><PrivacyPolicy /></PublicLayout>} />
      <Route path="/privacy-policy" element={<PublicLayout><PrivacyPolicy /></PublicLayout>} /> {/* Alternative path */}
      <Route path="/cookie-policy" element={<PublicLayout><CookiePolicy /></PublicLayout>} />
      <Route path="/how-it-works" element={<PublicLayout><HowItWorks /></PublicLayout>} />
      <Route path="/access-denied" element={<PublicLayout><AccessDenied /></PublicLayout>} />
    </Routes>
  );
};

export default PublicRoutes;
