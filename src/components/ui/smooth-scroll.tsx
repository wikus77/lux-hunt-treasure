
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "react-router-dom";
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
  const [locomotiveScroll, setLocomotiveScroll] = useState<LocomotiveScroll | null>(null);
  const router = useRouter();

  // Initialize Locomotive Scroll with options
  useEffect(() => {
    if (!scrollContainerRef.current) return;

    const scrollInstance = new LocomotiveScroll({
      el: scrollContainerRef.current,
      smooth: true,
      lerp: 0.08, // Linear Interpolation factor (0 = instant, 1 = smooth)
      smartphone: { smooth: true },
      tablet: { smooth: true },
      ...options,
    });

    setLocomotiveScroll(scrollInstance);

    // Cleanup on unmount
    return () => {
      scrollInstance.destroy();
    };
  }, [options]);

  // Update scroll on route change
  useEffect(() => {
    if (!locomotiveScroll) return;

    const handleRouteChange = () => {
      setTimeout(() => {
        locomotiveScroll.update();
      }, 500);
    };

    // Update scroll after route change
    window.addEventListener("popstate", handleRouteChange);

    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, [locomotiveScroll, router]);

  // Update scroll when content changes
  useEffect(() => {
    if (!locomotiveScroll) return;

    // Allow some time for content to render before updating scroll
    const timeoutId = setTimeout(() => {
      locomotiveScroll.update();
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [children, locomotiveScroll]);

  return (
    <div data-scroll-container ref={scrollContainerRef} className="min-h-screen">
      {children}
    </div>
  );
}
