// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// SAFE MODE FOOTER - Static Version Without GSAP

import React from 'react';

const SafeModeFooter = () => {
  console.log("🛡️ SafeModeFooter - Static version active");
  
  return (
    <footer className="relative py-20 bg-black border-t border-gray-800 opacity-100">
      {/* Static gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h3 className="text-3xl font-light text-white mb-4">
                M1SSION™
              </h3>
              <p className="text-lg text-gray-400 leading-relaxed max-w-lg">
                Transforming digital experiences through innovation, creativity, and cutting-edge technology.
              </p>
            </div>
            
            {/* Static social links */}
            <div className="flex space-x-6">
              {['Twitter', 'LinkedIn', 'GitHub', 'Discord'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-gray-400 hover:text-cyan-400 transition-colors duration-300"
                >
                  <span className="text-sm">{social}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-medium text-white mb-6">Platform</h4>
            <ul className="space-y-4">
              {['Features', 'Documentation', 'API Reference', 'Status'].map((link) => (
                <li key={link}>
                  <a 
                    href="#" 
                    className="text-gray-400 hover:text-cyan-400 transition-colors duration-300"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-lg font-medium text-white mb-6">Company</h4>
            <ul className="space-y-4">
              {['About', 'Careers', 'Press', 'Contact'].map((link) => (
                <li key={link}>
                  <a 
                    href="#" 
                    className="text-gray-400 hover:text-cyan-400 transition-colors duration-300"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="text-sm text-gray-500">
              © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
            </div>
            
            <div className="flex space-x-8">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((legal) => (
                <a
                  key={legal}
                  href="#"
                  className="text-sm text-gray-400 hover:text-cyan-400 transition-colors duration-300"
                >
                  {legal}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Static decorative elements */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-1 h-16 bg-gradient-to-b from-cyan-400 to-transparent"></div>
        </div>
      </div>

      {/* Static back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 w-12 h-12 bg-cyan-500 text-white rounded-full flex items-center justify-center transition-transform duration-300 shadow-lg z-50"
      >
        <span className="text-lg">↑</span>
      </button>
    </footer>
  );
};

export default SafeModeFooter;