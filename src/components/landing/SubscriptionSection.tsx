
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

export const SubscriptionSection = () => {
  return (
    <section className="w-full py-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 gradient-text-cyan">
          Scegli il Tuo Piano
        </h2>
        <p className="text-center text-white/80 mb-12 max-w-2xl mx-auto">
          Inizia gratuitamente o sblocca funzionalità premium per aumentare le tue possibilità di vittoria
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {/* Free Plan */}
          <div className="glass-card p-6 relative hover-scale">
            <Badge className="absolute -top-2 left-6 bg-gradient-to-r from-white/80 to-white/60 text-black">
              Piano Base
            </Badge>
            <h3 className="text-xl font-bold mt-4 mb-2">Gratuito</h3>
            <div className="mb-6">
              <span className="text-3xl font-bold">€0</span>
              <span className="text-sm text-gray-400">/mese</span>
            </div>
            
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center mt-0.5 mr-2 flex-shrink-0">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm text-gray-300">Accesso gratuito agli eventi mensili</span>
              </li>
              <li className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center mt-0.5 mr-2 flex-shrink-0">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm text-gray-300">1 indizio incluso a settimana</span>
              </li>
              <li className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center mt-0.5 mr-2 flex-shrink-0">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm text-gray-300">Partecipazione alle estrazioni base</span>
              </li>
            </ul>
          </div>
          
          {/* Silver Plan */}
          <div className="glass-card p-6 relative hover-scale">
            <h3 className="text-xl font-bold mb-2">Silver</h3>
            <div className="mb-6">
              <span className="text-3xl font-bold">€3.99</span>
              <span className="text-sm text-gray-400">/mese</span>
            </div>
            
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center mt-0.5 mr-2 flex-shrink-0">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm text-gray-300">Tutti i vantaggi Base</span>
              </li>
              <li className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center mt-0.5 mr-2 flex-shrink-0">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm text-gray-300">3 indizi premium aggiuntivi a settimana</span>
              </li>
              <li className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center mt-0.5 mr-2 flex-shrink-0">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm text-gray-300">Accesso anticipato ai nuovi eventi</span>
              </li>
            </ul>
          </div>
          
          {/* Gold Plan */}
          <div className="glass-card p-6 relative transform scale-105 z-10 hover-scale">
            <Badge className="absolute -top-2 right-6 bg-gradient-to-r from-amber-500 to-amber-600">
              Più popolare
            </Badge>
            <h3 className="text-xl font-bold mb-2">Gold</h3>
            <div className="mb-6">
              <span className="text-3xl font-bold">€6.99</span>
              <span className="text-sm text-gray-400">/mese</span>
            </div>
            
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center mt-0.5 mr-2 flex-shrink-0">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm text-gray-300">Tutti i vantaggi Silver</span>
              </li>
              <li className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center mt-0.5 mr-2 flex-shrink-0">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm text-gray-300">Indizi illimitati durante l'evento</span>
              </li>
              <li className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center mt-0.5 mr-2 flex-shrink-0">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm text-gray-300">Partecipazione alle estrazioni Gold</span>
              </li>
            </ul>
          </div>
          
          {/* Black Plan */}
          <div className="glass-card p-6 relative hover-scale">
            <h3 className="text-xl font-bold mb-2">Black</h3>
            <div className="mb-6">
              <span className="text-3xl font-bold">€9.99</span>
              <span className="text-sm text-gray-400">/mese</span>
            </div>
            
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-gray-900 to-gray-700 flex items-center justify-center mt-0.5 mr-2 flex-shrink-0">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm text-gray-300">Tutti i vantaggi Gold</span>
              </li>
              <li className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-gray-900 to-gray-700 flex items-center justify-center mt-0.5 mr-2 flex-shrink-0">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm text-gray-300">Accesso VIP ad eventi esclusivi</span>
              </li>
              <li className="flex items-start">
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-gray-900 to-gray-700 flex items-center justify-center mt-0.5 mr-2 flex-shrink-0">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm text-gray-300">Premi misteriosi aggiuntivi</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
