import React from 'react';
import { Route } from 'wouter';
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
    <>
      {/* Remove the "/" route from here since it's handled in main AppRoutes */}
      <Route path="/register" component={() => <PublicLayout showBottomNav={showBottomNav}><Register /></PublicLayout>} />
      <Route path="/login" component={() => <PublicLayout showBottomNav={showBottomNav}><Login /></PublicLayout>} />
      <Route path="/auth" component={() => <PublicLayout showBottomNav={showBottomNav}><Auth /></PublicLayout>} />
      <Route path="/kyc" component={() => <PublicLayout showBottomNav={showBottomNav}><KYC /></PublicLayout>} />
      <Route path="/verification" component={() => <PublicLayout showBottomNav={showBottomNav}><EmailVerificationPage /></PublicLayout>} />
      <Route path="/contact" component={() => <PublicLayout showBottomNav={showBottomNav}><Contacts /></PublicLayout>} />
      <Route path="/contatti" component={() => <PublicLayout showBottomNav={showBottomNav}><Contacts /></PublicLayout>} /> {/* Italian alias */}
      <Route path="/email-test" component={() => <PublicLayout showBottomNav={showBottomNav}><EmailTest /></PublicLayout>} />
      <Route path="/terms" component={() => <PublicLayout showBottomNav={showBottomNav}><Terms /></PublicLayout>} />
      <Route path="/termini-e-condizioni" component={() => <PublicLayout showBottomNav={showBottomNav}><Terms /></PublicLayout>} /> {/* Italian alias */}
      <Route path="/privacy" component={() => <PublicLayout showBottomNav={showBottomNav}><PrivacyPolicy /></PublicLayout>} />
      <Route path="/privacy-policy" component={() => <PublicLayout showBottomNav={showBottomNav}><PrivacyPolicy /></PublicLayout>} /> {/* Alternative path */}
      <Route path="/cookie-policy" component={() => <PublicLayout showBottomNav={showBottomNav}><CookiePolicy /></PublicLayout>} />
      <Route path="/how-it-works" component={() => <PublicLayout showBottomNav={showBottomNav}><HowItWorks /></PublicLayout>} />
      <Route path="/access-denied" component={() => <PublicLayout showBottomNav={showBottomNav}><AccessDenied /></PublicLayout>} />
    </>
  );
};

export default PublicRoutes;