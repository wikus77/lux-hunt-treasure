
import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import UnifiedHeader from "@/components/layout/UnifiedHeader";

const CookiePolicy: React.FC = () => {
  return (
    <PublicLayout>
      <UnifiedHeader />
      <div className="h-[72px] w-full" />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link 
          to="/" 
          className="inline-flex items-center text-white/70 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Torna alla home
        </Link>
        
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">Cookie Policy</h1>
        
        <div className="prose prose-invert max-w-none">
          {/* Inserisci qui il contenuto della Cookie Policy */}
          <p className="text-white/80">
            Ultimo aggiornamento: Maggio 2025
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">1. Introduzione</h2>
          <p>
            La presente Cookie Policy ha lo scopo di informare l'utente riguardo all'utilizzo 
            dei cookie sul sito web M1SSION.com e sull'applicazione mobile correlata.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">2. Cosa sono i Cookie</h2>
          <p>
            I cookie sono piccoli file di testo che i siti visitati dall'utente inviano al suo 
            dispositivo (computer, tablet, smartphone), dove vengono memorizzati per essere 
            poi ritrasmessi agli stessi siti alla successiva visita.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">3. Tipologie di Cookie utilizzati</h2>
          <p>
            [Inserire qui i dettagli sui tipi di cookie utilizzati]
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">4. Come gestire i Cookie</h2>
          <p>
            [Inserire qui le informazioni su come l'utente può gestire i cookie]
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">5. Contatti</h2>
          <p>
            Per qualsiasi domanda o chiarimento riguardo la presente Cookie Policy, è possibile 
            contattarci all'indirizzo email: privacy@m1ssion.com
          </p>
        </div>
      </div>
    </PublicLayout>
  );
};

export default CookiePolicy;
