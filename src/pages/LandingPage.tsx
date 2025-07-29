// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ Landing Page per utenti anonimi

import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { Check, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LandingPage: React.FC = () => {
  const [, setLocation] = useLocation();

  console.log('🌟 M1SSION™ LANDING PAGE - Showing to anonymous user');

  const handleStartMission = () => {
    console.log('🚀 M1SSION™ User clicking "Inizia la missione" - redirecting to /register');
    setLocation('/register');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-4xl mx-auto"
      >
        {/* Logo/Title */}
        <motion.h1 
          className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          M1SSION™
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          className="text-xl md:text-2xl mb-12 text-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Il gioco di realtà aumentata più avanzato al mondo
        </motion.p>

        {/* Features */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-bold mb-3 text-yellow-400">🗺️ Esplorazione</h3>
            <p className="text-gray-300">Scopri indizi nascosti nel mondo reale</p>
          </div>
          <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-bold mb-3 text-yellow-400">🏆 Competizione</h3>
            <p className="text-gray-300">Compete with agents worldwide</p>
          </div>
          <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-bold mb-3 text-yellow-400">🎯 Missioni</h3>
            <p className="text-gray-300">Complete complex treasure hunts</p>
          </div>
        </motion.div>

        {/* New Prize Container */}
        <motion.div 
          className="bg-gray-900/50 p-8 rounded-lg border border-gray-700 mb-12 relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="relative">
            <img 
              src="/lovable-uploads/96f032a3-b4d8-4c1d-a838-4bb66a58194c.png" 
              alt="M1SSION Luxury Prizes" 
              className="w-full h-auto rounded-lg object-cover"
            />
            {/* Disclaimer */}
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-sm md:text-lg px-2 py-1 rounded backdrop-blur-sm">
              Image for illustrative purposes only
            </div>
          </div>
          <div className="mt-6 text-center">
            <h3 className="text-2xl font-bold mb-3 text-yellow-400">🏆 Premi in Palio</h3>
            <p className="text-gray-300">Vinci premi di lusso partecipando alle missioni M1SSION™</p>
          </div>
        </motion.div>

        {/* Subscription Plans - All aligned in one row */}
        <motion.section 
          className="w-full max-w-7xl mx-auto mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold inline-block">
              <span className="text-yellow-400">M1</span><span className="text-white">SSION</span> Abbonamenti
            </h2>
            <p className="mt-4 text-gray-300 max-w-2xl mx-auto">
              Scegli il piano più adatto a te e inizia la tua avventura
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
            {[
              {
                title: 'Base – Gratis',
                price: '€0',
                period: '/mese',
                features: [
                  "Funzioni base",
                  "Supporto email standard",
                  "1 indizio settimanale"
                ],
                buttonText: 'Inizia Gratis',
                buttonColor: 'bg-gradient-to-r from-cyan-400 to-cyan-600 text-black'
              },
              {
                title: 'Silver',
                price: '€3.99',
                period: '/mese',
                features: [
                  "Tutti i vantaggi Base",
                  "3 indizi premium",
                  "Accesso anticipato 2h"
                ],
                buttonText: 'Scegli Silver',
                buttonColor: 'bg-gradient-to-r from-gray-300 to-gray-500 text-black'
              },
              {
                title: 'Gold',
                price: '€6.99',
                period: '/mese',
                highlight: true,
                features: [
                  "Tutti i vantaggi Silver",
                  "4 indizi premium",
                  "Accesso anticipato 12h"
                ],
                buttonText: 'Scegli Gold',
                buttonColor: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black'
              },
              {
                title: 'Black',
                price: '€9.99',
                period: '/mese',
                features: [
                  "Tutti i vantaggi Gold",
                  "Accesso VIP 24h",
                  "5 indizi premium"
                ],
                buttonText: 'Scegli Black',
                buttonColor: 'bg-gradient-to-r from-gray-800 to-gray-900 text-white'
              },
              {
                title: 'Titanium',
                price: '€29.99',
                period: '/mese',
                features: [
                  "Tutti i vantaggi Black",
                  "7 indizi premium",
                  "Accesso VIP 48h"
                ],
                buttonText: 'Scegli Titanium',
                buttonColor: 'bg-gradient-to-r from-purple-600 to-purple-800 text-white'
              }
            ].map((sub, index) => (
              <motion.div
                key={index}
                className={`rounded-lg relative p-4 ${sub.highlight ? 'bg-gray-900/70 border-2 border-yellow-400' : 'bg-gray-900/50 border border-gray-700'}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                {sub.highlight && (
                  <div className="absolute -top-3 -right-3 bg-yellow-400 text-black text-xs font-bold py-1 px-3 rounded-full flex items-center">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Consigliato
                  </div>
                )}
                
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-white">{sub.title}</h3>
                  <div className="mt-2">
                    <span className="text-xl font-bold text-white">{sub.price}</span>
                    {sub.period && <span className="text-gray-400 text-xs">{sub.period}</span>}
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  {sub.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center">
                      <Check className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                      <span className="text-gray-300 text-xs">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button className={`w-full text-xs py-2 ${sub.buttonColor}`}>
                  {sub.buttonText}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA Button */}
        <motion.button
          onClick={handleStartMission}
          className="bg-gradient-to-r from-yellow-400 to-red-500 text-black text-xl font-bold py-4 px-12 rounded-lg hover:from-yellow-500 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🚀 Registrati per M1SSION
        </motion.button>

        {/* Footer */}
        <motion.div 
          className="mt-16 text-gray-500 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p>© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LandingPage;

/*
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * M1SSION™ Landing Page - Clean and focused for anonymous users
 */