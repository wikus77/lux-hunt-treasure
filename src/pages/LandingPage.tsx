// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { Suspense } from 'react';
import Hero3DScene from '@/components/landing/Hero3D';
import ScrollStorySection from '@/components/landing/ScrollStory';
import FeaturesSection from '@/components/landing/Features';
import MinimalFooter from '@/components/landing/Footer';
import { usePerformanceMonitor } from '@/utils/performanceOptimization';

const LoadingFallback = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
      <p className="text-muted-foreground">Loading M1SSION™ Experience...</p>
    </div>
  </div>
);

const LandingPage = () => {
  usePerformanceMonitor('LandingPage');
  
  console.log("✅ CINEMATOGRAPHIC LANDING PAGE LOADED - Apple-style design with Three.js + GSAP");

  return (
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
  );
};

export default LandingPage;
