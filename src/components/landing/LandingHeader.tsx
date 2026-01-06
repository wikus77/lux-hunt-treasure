// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
// Landing Header - AAA WOW Effects

import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Eye, Menu, X, MessageSquare } from 'lucide-react';

const navLinks = [
  { href: '/about', label: "Cos'è M1SSION" },
  { href: '/how-to-play', label: 'Come si gioca' },
  { href: '/prizes', label: 'Premi' },
  { href: '/team', label: 'Chi siamo' },
  { href: '/subscriptions-info', label: 'Abbonamenti' },
  { href: '/spectator', label: 'Spectator', icon: Eye },
  { href: '/forum', label: 'Forum', icon: MessageSquare },
];

export const LandingHeader: React.FC = () => {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const isActive = (href: string) => location === href;

  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-cyan-500/20"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo with hover effect */}
        <Link href="/landing" className="flex items-center cursor-pointer group">
          <motion.h2 
            className="text-2xl font-bold relative"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <motion.span 
              className="absolute inset-0 text-[#00E5FF] blur-lg opacity-0 group-hover:opacity-50"
              animate={{ opacity: hoveredLink === 'logo' ? 0.5 : 0 }}
              transition={{ duration: 0.3 }}
            >
              M1SSION™
            </motion.span>
            <span className="relative">
              <span className="text-[#00E5FF]">M1</span>
              <span className="text-white">SSION<span className="text-xs align-top">™</span></span>
            </span>
          </motion.h2>
        </Link>

        {/* Desktop Navigation with WOW effects */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isHovered = hoveredLink === link.href;
            const active = isActive(link.href);
            
            return (
              <motion.div
                key={link.href}
                className="relative"
                onMouseEnter={() => setHoveredLink(link.href)}
                onMouseLeave={() => setHoveredLink(null)}
              >
                <Link
                  href={link.href}
                  className="relative z-10 block"
                >
                  <motion.div
                    className={`text-sm font-medium flex items-center gap-1.5 px-4 py-2.5 rounded-xl relative overflow-hidden ${
                      active ? 'text-cyan-400' : 'text-white/70'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    {/* Glow background on hover */}
                    <motion.div
                      className="absolute inset-0 rounded-xl"
                      initial={{ opacity: 0 }}
                      animate={{ 
                        opacity: isHovered ? 1 : active ? 0.5 : 0,
                        background: isHovered 
                          ? 'linear-gradient(135deg, rgba(0,229,255,0.15) 0%, rgba(168,85,247,0.1) 100%)'
                          : active
                          ? 'rgba(0,229,255,0.1)'
                          : 'transparent'
                      }}
                      transition={{ duration: 0.3 }}
                    />
                    
                    {/* Border glow */}
                    <motion.div
                      className="absolute inset-0 rounded-xl border"
                      initial={{ opacity: 0, borderColor: 'transparent' }}
                      animate={{ 
                        opacity: isHovered || active ? 1 : 0,
                        borderColor: isHovered ? 'rgba(0,229,255,0.4)' : active ? 'rgba(0,229,255,0.3)' : 'transparent'
                      }}
                      transition={{ duration: 0.3 }}
                    />
                    
                    {/* Icon with animation */}
                    {link.icon && (
                      <motion.span
                        animate={{ 
                          rotate: isHovered ? 360 : 0,
                          scale: isHovered ? 1.2 : 1
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        <link.icon className="w-4 h-4" />
                      </motion.span>
                    )}
                    
                    {/* Text */}
                    <motion.span 
                      className="relative z-10"
                      animate={{ 
                        color: isHovered || active ? '#00E5FF' : 'rgba(255,255,255,0.7)',
                        textShadow: isHovered ? '0 0 20px rgba(0,229,255,0.5)' : 'none'
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {link.label}
                    </motion.span>
                  </motion.div>
                </Link>
                
                {/* Floating glow indicator */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      className="absolute -bottom-1 left-1/2 w-8 h-1 rounded-full bg-cyan-400"
                      initial={{ opacity: 0, scale: 0, x: '-50%' }}
                      animate={{ opacity: 1, scale: 1, x: '-50%' }}
                      exit={{ opacity: 0, scale: 0, x: '-50%' }}
                      transition={{ duration: 0.2 }}
                      style={{ boxShadow: '0 0 15px rgba(0,229,255,0.8)' }}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </nav>

        {/* CTA Button with WOW effect */}
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={() => setLocation('/register')}
              className="relative bg-gradient-to-r from-cyan-500 to-purple-500 text-black text-xs font-bold px-5 py-2.5 rounded-full overflow-hidden"
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-200%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              />
              {/* Pulse ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-cyan-300/50"
                animate={{ scale: [1, 1.2], opacity: [0.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="relative z-10">ENTRA NELLA MISSIONE</span>
            </Button>
          </motion.div>

          {/* Mobile Menu Button */}
          <motion.button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-white/70 hover:text-white p-2 rounded-lg"
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(0,229,255,0.1)' }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              {mobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                >
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                >
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu with animation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            className="lg:hidden bg-black/98 border-t border-cyan-500/10 px-4 py-4 overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <nav className="flex flex-col gap-2">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-sm font-medium transition-all flex items-center gap-2 px-4 py-3 rounded-xl ${
                      isActive(link.href)
                        ? 'text-cyan-400 bg-cyan-400/10 border border-cyan-400/30'
                        : 'text-white/70 hover:text-cyan-400 hover:bg-white/5'
                    }`}
                  >
                    {link.icon && <link.icon className="w-4 h-4" />}
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default LandingHeader;
