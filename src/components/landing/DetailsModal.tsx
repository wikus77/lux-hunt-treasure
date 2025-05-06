
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle2, Clock, Gift } from 'lucide-react';

type DetailsModalProps = {
  open: boolean;
  onClose: () => void;
  type: 'prizes' | 'game' | 'subscription';
  title: string;
};

const DetailsModal: React.FC<DetailsModalProps> = ({ open, onClose, type, title }) => {
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl glass-card border-cyan-500/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-orbitron gradient-text-cyan text-center">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-300">
            {type === 'prizes' && 'Dettagli sui premi disponibili in M1SSION'}
            {type === 'game' && 'Come funziona il gioco M1SSION'}
            {type === 'subscription' && 'Dettagli sugli abbonamenti M1SSION'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {type === 'prizes' && <PrizeDetails />}
          {type === 'game' && <GameDetails />}
          {type === 'subscription' && <SubscriptionDetails />}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const PrizeDetails = () => (
  <div className="space-y-6">
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-cyan-400 flex items-center">
        <Gift className="mr-2 h-5 w-5" />
        Premio Principale
      </h3>
      <p className="text-white">
        Il vincitore assoluto della competizione M1SSION avrà l'opportunità di portarsi a casa un'auto di lusso.
        Le auto in palio includono modelli Ferrari, Lamborghini e altre supercar di prestigio.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
        <div className="bg-black/40 rounded-lg p-3 border border-cyan-500/20">
          <p className="text-white font-bold">Ferrari SF90</p>
          <p className="text-sm text-gray-400">986 CV, 0-100 km/h in 2.5 secondi</p>
        </div>
        <div className="bg-black/40 rounded-lg p-3 border border-cyan-500/20">
          <p className="text-white font-bold">Lamborghini Huracán</p>
          <p className="text-sm text-gray-400">640 CV, 0-100 km/h in 2.9 secondi</p>
        </div>
      </div>
    </div>
    
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-purple-400 flex items-center">
        <Gift className="mr-2 h-5 w-5" />
        Premi Secondari
      </h3>
      <p className="text-white">
        I finalisti hanno la possibilità di vincere premi di altissimo valore:
      </p>
      <ul className="space-y-2">
        <li className="flex items-start">
          <CheckCircle2 className="h-5 w-5 text-purple-400 mr-2 flex-shrink-0 mt-0.5" />
          <span>Orologi di lusso delle migliori marche</span>
        </li>
        <li className="flex items-start">
          <CheckCircle2 className="h-5 w-5 text-purple-400 mr-2 flex-shrink-0 mt-0.5" />
          <span>Dispositivi tech all'avanguardia</span>
        </li>
        <li className="flex items-start">
          <CheckCircle2 className="h-5 w-5 text-purple-400 mr-2 flex-shrink-0 mt-0.5" />
          <span>Viaggi esclusivi in località esotiche</span>
        </li>
        <li className="flex items-start">
          <CheckCircle2 className="h-5 w-5 text-purple-400 mr-2 flex-shrink-0 mt-0.5" />
          <span>Altri premi di alta qualità</span>
        </li>
      </ul>
    </div>
    
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-amber-400 flex items-center">
        <Gift className="mr-2 h-5 w-5" />
        Premi di Partecipazione
      </h3>
      <p className="text-white">
        Tutti i partecipanti hanno accesso a:
      </p>
      <ul className="space-y-2">
        <li className="flex items-start">
          <CheckCircle2 className="h-5 w-5 text-amber-400 mr-2 flex-shrink-0 mt-0.5" />
          <span>Sconti esclusivi su prodotti partner</span>
        </li>
        <li className="flex items-start">
          <CheckCircle2 className="h-5 w-5 text-amber-400 mr-2 flex-shrink-0 mt-0.5" />
          <span>Crediti di gioco per sbloccare funzionalità premium</span>
        </li>
        <li className="flex items-start">
          <CheckCircle2 className="h-5 w-5 text-amber-400 mr-2 flex-shrink-0 mt-0.5" />
          <span>Possibilità di vincere premi settimanali</span>
        </li>
      </ul>
    </div>
  </div>
);

const GameDetails = () => (
  <div className="space-y-6">
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-cyan-400 flex items-center">
        <Clock className="mr-2 h-5 w-5" />
        Come Si Gioca
      </h3>
      <p className="text-white">
        M1SSION è un gioco che combina enigmi digitali e ricerche nel mondo reale. I giocatori devono seguire indizi, 
        risolvere puzzle e completare missioni per avanzare.
      </p>
      <div className="bg-black/40 rounded-lg p-4 border border-cyan-500/20">
        <p className="text-white">La competizione si svolge in più fasi:</p>
        <ol className="list-decimal pl-5 mt-2 space-y-2 text-gray-300">
          <li>Fase di qualificazione - Risolvi gli enigmi iniziali</li>
          <li>Fase intermedia - Completa missioni speciali</li>
          <li>Fase finale - Solo i migliori competono per il premio principale</li>
        </ol>
      </div>
    </div>
    
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-purple-400 flex items-center">
        <Clock className="mr-2 h-5 w-5" />
        Regole Principali
      </h3>
      <ul className="space-y-2">
        <li className="flex items-start">
          <CheckCircle2 className="h-5 w-5 text-purple-400 mr-2 flex-shrink-0 mt-0.5" />
          <span>Ogni missione deve essere completata entro la scadenza indicata</span>
        </li>
        <li className="flex items-start">
          <CheckCircle2 className="h-5 w-5 text-purple-400 mr-2 flex-shrink-0 mt-0.5" />
          <span>I giocatori possono collaborare ma i punti sono individuali</span>
        </li>
        <li className="flex items-start">
          <CheckCircle2 className="h-5 w-5 text-purple-400 mr-2 flex-shrink-0 mt-0.5" />
          <span>È vietato condividere soluzioni pubblicamente</span>
        </li>
        <li className="flex items-start">
          <CheckCircle2 className="h-5 w-5 text-purple-400 mr-2 flex-shrink-0 mt-0.5" />
          <span>I partecipanti devono rispettare il codice di condotta</span>
        </li>
      </ul>
    </div>
    
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-amber-400 flex items-center">
        <Clock className="mr-2 h-5 w-5" />
        Punteggi e Classifica
      </h3>
      <p className="text-white">
        I punti vengono assegnati in base a:
      </p>
      <ul className="space-y-2">
        <li className="flex items-start">
          <CheckCircle2 className="h-5 w-5 text-amber-400 mr-2 flex-shrink-0 mt-0.5" />
          <span>Velocità nel risolvere gli enigmi</span>
        </li>
        <li className="flex items-start">
          <CheckCircle2 className="h-5 w-5 text-amber-400 mr-2 flex-shrink-0 mt-0.5" />
          <span>Precisione e completezza delle soluzioni</span>
        </li>
        <li className="flex items-start">
          <CheckCircle2 className="h-5 w-5 text-amber-400 mr-2 flex-shrink-0 mt-0.5" />
          <span>Partecipazione a eventi speciali</span>
        </li>
        <li className="flex items-start">
          <CheckCircle2 className="h-5 w-5 text-amber-400 mr-2 flex-shrink-0 mt-0.5" />
          <span>Bonus per approcci creativi e originali</span>
        </li>
      </ul>
    </div>
  </div>
);

const SubscriptionDetails = () => (
  <div className="space-y-6">
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-cyan-400 flex items-center">
        <Clock className="mr-2 h-5 w-5" />
        Dettagli Abbonamenti
      </h3>
      <p className="text-white">
        Gli abbonamenti M1SSION ti garantiscono vantaggi esclusivi e maggiori possibilità di vincita.
      </p>
    </div>
    
    {/* Subscription details content goes here */}
  </div>
);

export default DetailsModal;
