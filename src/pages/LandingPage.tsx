// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { Suspense } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import SafeModeController from '@/components/SafeModeController';

// SAFE MODE Components
import SafeModeHero3D from '@/components/landing/SafeModeHero3D';
import SafeModeScrollStory from '@/components/landing/SafeModeScrollStory';
import SafeModeFeatures from '@/components/landing/SafeModeFeatures';
import SafeModeFooter from '@/components/landing/SafeModeFooter';

// FULL Components (activated progressively)
import Hero3DScene from '@/components/landing/Hero3D';
import ScrollStorySection from '@/components/landing/ScrollStory';
import FeaturesSection from '@/components/landing/Features';
import MinimalFooter from '@/components/landing/Footer';

const LoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="w-12 h-12 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin mx-auto"></div>
      <p className="text-gray-300">Loading M1SSION™ Experience...</p>
    </div>
  </div>
);

const LandingPage = () => {
  console.log("✅ CINEMATOGRAPHIC LANDING PAGE LOADED - Progressive Reactivation Mode");
  
  // Get Safe Mode state
  const safeMode = SafeModeController();

  // Prevent any global errors from crashing the app
  React.useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error("🚨 Global error caught:", error);
      // Don't let it propagate
      error.preventDefault();
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("🚨 Unhandled promise rejection caught:", event.reason);
      // Don't let it propagate
      event.preventDefault();
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    console.log("🛡️ Global error handlers installed");

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      console.log("🧹 Global error handlers removed");
    };
  }, []);

  // Extended health check - monitor stability for 20+ seconds
  React.useEffect(() => {
    let healthCheckCount = 0;
    
    const healthCheckInterval = setInterval(() => {
      healthCheckCount++;
      const mode = safeMode.isSafeMode ? 'SAFE MODE' : 'FULL MODE';
      console.log(`💚 Landing Page Health Check #${healthCheckCount} - ${mode} - Running stable`);
      
      // Check if all major components are still mounted
      const heroExists = document.querySelector('.relative.h-screen');
      const scrollExists = document.querySelector('[class*="ScrollStory"], [class*="SafeModeScrollStory"]');
      const featuresExists = document.querySelector('[class*="Features"], [class*="SafeModeFeatures"]');
      const footerExists = document.querySelector('footer');
      
      console.log("🔍 Component Check:", {
        hero: !!heroExists,
        scroll: !!scrollExists,
        features: !!featuresExists,
        footer: !!footerExists,
        safeMode: safeMode.isSafeMode,
        currentStep: safeMode.currentStep
      });
    }, 2000);

    return () => {
      clearInterval(healthCheckInterval);
    };
  }, [safeMode]);

  console.log("🚀 LandingPage component rendering with Safe Mode:", safeMode);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white overflow-x-hidden">
        <Suspense fallback={<LoadingFallback />}>
          {/* Hero Section - Progressive */}
          {safeMode.hero3DEnabled ? (
            <Hero3DScene />
          ) : (
            <SafeModeHero3D />
          )}
          
          {/* Scroll-driven storytelling sections - Progressive */}
          {safeMode.scrollStoryEnabled ? (
            <ScrollStorySection />
          ) : (
            <SafeModeScrollStory />
          )}
          
          {/* Features with 3D elements - Progressive */}
          {safeMode.featuresEnabled ? (
            <FeaturesSection />
          ) : (
            <SafeModeFeatures />
          )}
          
          {/* Footer - Always safe mode initially */}
          <SafeModeFooter />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
};

export default LandingPage;