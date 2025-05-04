
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import LocomotiveScroll from "locomotive-scroll";

interface SmoothScrollProps {
  children: React.ReactNode;
  options?: {
    lerp?: number;
    smooth?: boolean;
    smartphone?: { smooth?: boolean };
    tablet?: { smooth?: boolean };
  };
}

export function SmoothScroll({ children, options = {} }: SmoothScrollProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [locomotiveScroll, setLocomotiveScroll] = useState<any>(null);
  const location = useLocation();

  // Initialize Locomotive Scroll with options
  useEffect(() => {
    if (!scrollContainerRef.current) return;

    // Create new locomotive scroll instance
    // Using type assertion to bypass the TypeScript error with Locomotive Scroll v5 API
    const locomotiveOptions = {
      el: scrollContainerRef.current, // Locomotive Scroll v5 uses 'el' despite the type definitions
      lerp: options.lerp ?? 0.08,
      multiplier: 1,
      class: "is-inview",
      getDirection: true,
      getSpeed: true,
      smooth: options.smooth ?? true,
      smartphone: {
        smooth: options.smartphone?.smooth ?? true,
      },
      tablet: {
        smooth: options.tablet?.smooth ?? true,
      }
    };

    const scrollInstance = new LocomotiveScroll(locomotiveOptions as any);

    // Store the instance reference
    setLocomotiveScroll(scrollInstance);

    // Cleanup on unmount
    return () => {
      if (scrollInstance) {
        scrollInstance.destroy();
      }
    };
  }, [options]);

  // Update scroll on route change
  useEffect(() => {
    if (!locomotiveScroll) return;

    const handleRouteChange = () => {
      setTimeout(() => {
        // Use type assertion to safely call update method
        if (locomotiveScroll && typeof locomotiveScroll.update === 'function') {
          locomotiveScroll.update();
        }
      }, 500);
    };

    // Update scroll after route change
    window.addEventListener("popstate", handleRouteChange);

    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, [locomotiveScroll, location]);

  // Update scroll when content changes
  useEffect(() => {
    if (!locomotiveScroll) return;

    // Allow some time for content to render before updating scroll
    const timeoutId = setTimeout(() => {
      if (typeof locomotiveScroll.update === 'function') {
        locomotiveScroll.update();
      }
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [children, locomotiveScroll]);

  return (
    <div data-scroll-container ref={scrollContainerRef} className="min-h-screen">
      {children}
    </div>
  );
}
