
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white p-4 pt-20">
      <div className="container mx-auto max-w-4xl">
        <Link to="/">
          <Button variant="outline" className="mb-8">
            <ArrowLeft className="mr-2 w-4 h-4" /> Torna alla Home
          </Button>
        </Link>
        
        <h1 className="text-3xl font-bold mb-6">Termini e Condizioni</h1>
        
        <div className="space-y-6">
          <p className="text-gray-300">
            L'utilizzo dell'app M1SSION implica l'accettazione integrale dei seguenti termini e condizioni:
          </p>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Oggetto</h2>
            <p className="text-gray-300">
              L'app M1SSION è un'esperienza interattiva basata su missioni, enigmi e premi reali.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">2. Requisiti</h2>
            <p className="text-gray-300">
              L'uso è consentito solo agli utenti maggiorenni o con il consenso dei genitori.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">3. Responsabilità dell'utente</h2>
            <p className="text-gray-300">
              L'utente si impegna a non utilizzare l'app per scopi illeciti o fraudolenti.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">4. Proprietà Intellettuale</h2>
            <p className="text-gray-300">
              Tutti i contenuti, loghi, meccaniche di gioco e layout sono protetti da copyright.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">5. Modifiche ai Termini</h2>
            <p className="text-gray-300">
              Ci riserviamo il diritto di modificare i presenti termini. Le modifiche saranno comunicate via app o email.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">6. Clausola legale aggiuntiva</h2>
            <p className="text-gray-300 font-bold">
              È vietata ogni riproduzione, copia, distribuzione o rielaborazione, anche parziale, dell'applicazione, del concept di gioco, del regolamento, delle missioni, dell'interfaccia utente o della narrativa di M1SSION. Ogni infrazione sarà perseguita legalmente ai sensi della normativa sulla proprietà intellettuale (art. 2575 c.c. e Direttiva UE 2001/29/CE).
            </p>
          </section>
          
          <p className="text-gray-300 italic mt-8">
            Ultimo aggiornamento: Maggio 2025
          </p>
        </div>
        
        <div className="mt-10 mb-10 text-center">
          <Link to="/">
            <Button className="bg-gradient-to-r from-projectx-blue to-projectx-pink">
              Torna alla Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Terms;
