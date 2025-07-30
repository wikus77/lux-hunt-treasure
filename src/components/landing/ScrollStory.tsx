// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ScrollStorySection = () => {
  console.log("📜 ScrollStorySection component mounting");
  const containerRef = useRef<HTMLDivElement>(null);
  const section1Ref = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);
  const section3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Section 1 Animation
      gsap.fromTo(section1Ref.current, 
        { 
          opacity: 0, 
          y: 100,
          clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)'
        },
        {
          opacity: 1,
          y: 0,
          clipPath: 'polygon(0 0%, 100% 0%, 100% 100%, 0 100%)',
          duration: 1.5,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section1Ref.current,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Section 2 Animation with parallax
      gsap.fromTo(section2Ref.current,
        {
          opacity: 0,
          x: -200,
          skewX: 15
        },
        {
          opacity: 1,
          x: 0,
          skewX: 0,
          duration: 1.5,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section2Ref.current,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Section 3 Animation with scale
      gsap.fromTo(section3Ref.current,
        {
          opacity: 0,
          scale: 0.8,
          filter: 'blur(10px)'
        },
        {
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          duration: 1.5,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section3Ref.current,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Parallax background effect
      gsap.to('.parallax-bg', {
        yPercent: -50,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Parallax background */}
      <div className="parallax-bg absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-black -z-10"></div>

      {/* Section 1 - Innovation */}
      <section ref={section1Ref} className="min-h-screen flex items-center justify-center py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-7xl font-light mb-8 text-white">
            Innovation
            <span className="block text-2xl md:text-4xl font-thin text-cyan-400 mt-4">
              Redefined
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            We push boundaries to create experiences that matter. Every detail crafted with precision and purpose.
          </p>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:bg-gray-700/50 transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 mx-auto mb-6 bg-cyan-500/20 rounded-2xl flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-medium mb-4 text-white">Performance</h3>
              <p className="text-gray-300">Lightning-fast experiences optimized for every device.</p>
            </div>
            <div className="group p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:bg-gray-700/50 transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 mx-auto mb-6 bg-cyan-500/20 rounded-2xl flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-xl font-medium mb-4 text-white">Design</h3>
              <p className="text-gray-300">Beautiful interfaces that inspire and delight users.</p>
            </div>
            <div className="group p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:bg-gray-700/50 transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 mx-auto mb-6 bg-cyan-500/20 rounded-2xl flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-xl font-medium mb-4 text-white">Technology</h3>
              <p className="text-gray-300">Cutting-edge solutions for tomorrow's challenges.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 - Experience */}
      <section ref={section2Ref} className="min-h-screen flex items-center justify-center py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl md:text-6xl font-light mb-8 text-white">
                Immersive
                <span className="block text-cyan-400">Experiences</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Step into a world where technology meets artistry. Our platform delivers experiences that engage, inspire, and transform.
              </p>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-lg text-white">Real-time 3D interactions</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-lg text-white">Seamless cross-platform support</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-lg text-white">Advanced AI integration</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-cyan-500/20 rounded-3xl backdrop-blur-sm border border-cyan-500/30 flex items-center justify-center">
                <div className="text-8xl opacity-60 text-cyan-400">🌟</div>
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 rounded-3xl blur-3xl opacity-20 -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 - Future */}
      <section ref={section3Ref} className="min-h-screen flex items-center justify-center py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-7xl font-light mb-8 text-white">
            The Future
            <span className="block text-2xl md:text-4xl font-thin text-cyan-400 mt-4">
              Is Now
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
            Join us in shaping tomorrow's digital landscape. Be part of the revolution.
          </p>
          <button className="group relative px-16 py-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full text-xl font-medium overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25">
            <span className="relative z-10">Get Started</span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </button>
        </div>
      </section>
    </div>
  );
};

export default ScrollStorySection;