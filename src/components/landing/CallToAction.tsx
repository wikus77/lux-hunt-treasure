
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

export const CallToAction = () => {
  return (
    <section className="w-full py-16 px-4 md:px-8">
      <div className="max-w-5xl mx-auto glass-card border border-white/20 p-8 md:p-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-gradient-to-tr from-amber-500/20 to-red-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <Badge className="mb-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white">
            <Star className="h-3 w-3 mr-1" />
            Offerta Pre-Lancio
          </Badge>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text-multi">
            Unisciti a M1SSION Oggi
          </h2>
          
          <p className="text-xl text-white/90 mb-8 max-w-3xl">
            Registrati ora per ottenere accesso prioritario e crediti gratuiti quando inizia l'avventura M1SSION!
          </p>
          
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-6 px-8 text-lg"
            >
              Registrati per il Lancio
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Scopri di Più
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
