// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ScrollStorySection = () => {
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
    <div ref={containerRef} className="relative">
      {/* Parallax background */}
      <div className="parallax-bg absolute inset-0 bg-gradient-to-b from-background via-muted/50 to-background -z-10"></div>

      {/* Section 1 - Innovation */}
      <section ref={section1Ref} className="min-h-screen flex items-center justify-center py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-7xl font-light mb-8 text-foreground">
            Innovation
            <span className="block text-2xl md:text-4xl font-thin text-muted-foreground mt-4">
              Redefined
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We push boundaries to create experiences that matter. Every detail crafted with precision and purpose.
          </p>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-2xl bg-card hover:bg-accent/5 transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-medium mb-4">Performance</h3>
              <p className="text-muted-foreground">Lightning-fast experiences optimized for every device.</p>
            </div>
            <div className="group p-8 rounded-2xl bg-card hover:bg-accent/5 transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-xl font-medium mb-4">Design</h3>
              <p className="text-muted-foreground">Beautiful interfaces that inspire and delight users.</p>
            </div>
            <div className="group p-8 rounded-2xl bg-card hover:bg-accent/5 transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-xl font-medium mb-4">Technology</h3>
              <p className="text-muted-foreground">Cutting-edge solutions for tomorrow's challenges.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 - Experience */}
      <section ref={section2Ref} className="min-h-screen flex items-center justify-center py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl md:text-6xl font-light mb-8 text-foreground">
                Immersive
                <span className="block text-muted-foreground">Experiences</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Step into a world where technology meets artistry. Our platform delivers experiences that engage, inspire, and transform.
              </p>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-lg">Real-time 3D interactions</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-lg">Seamless cross-platform support</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-lg">Advanced AI integration</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/20 via-cyan-500/20 to-primary/20 rounded-3xl backdrop-blur-sm border border-primary/20 flex items-center justify-center">
                <div className="text-8xl opacity-30">🌟</div>
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-primary via-cyan-500 to-primary rounded-3xl blur-3xl opacity-20 -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 - Future */}
      <section ref={section3Ref} className="min-h-screen flex items-center justify-center py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-7xl font-light mb-8 text-foreground">
            The Future
            <span className="block text-2xl md:text-4xl font-thin text-muted-foreground mt-4">
              Is Now
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed">
            Join us in shaping tomorrow's digital landscape. Be part of the revolution.
          </p>
          <button className="group relative px-16 py-6 bg-primary text-primary-foreground rounded-full text-xl font-medium overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <span className="relative z-10">Get Started</span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-cyan-500 to-primary bg-size-200 bg-pos-0 group-hover:bg-pos-100 transition-all duration-500"></div>
          </button>
        </div>
      </section>
    </div>
  );
};

export default ScrollStorySection;