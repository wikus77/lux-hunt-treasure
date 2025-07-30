// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { Suspense } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
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
  console.log("✅ CINEMATOGRAPHIC LANDING PAGE LOADED - Apple-style design with Three.js + GSAP");

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white overflow-x-hidden">
        <Suspense fallback={<LoadingFallback />}>
          {/* Hero Section with 3D WebGL */}
          <Hero3DScene />
          
          {/* Scroll-driven storytelling sections */}
          <ScrollStorySection />
          
          {/* Features with 3D elements */}
          <FeaturesSection />
          
          {/* Minimal footer */}
          <MinimalFooter />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
};

export default LandingPage;
