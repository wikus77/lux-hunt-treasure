
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ParallaxImage } from '@/components/ui/parallax-image';
import { motion } from 'framer-motion';

interface DetailsModalProps {
  open: boolean;
  onClose: () => void;
  type: 'prizes' | 'game' | 'subscription';
  title: string;
}

const DetailsModal: React.FC<DetailsModalProps> = ({
  open,
  onClose,
  type,
  title
}) => {
  const renderContent = () => {
    switch (type) {
      case 'prizes':
        return (
          <div className="space-y-6">
            <p className="text-lg text-white/80">
              Partecipando alla missione M1SSION potrai vincere auto di lusso e altri premi straordinari. Ecco cosa ti aspetta:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <ParallaxImage
                  src="/lovable-uploads/32a96c45-2a5d-4579-bbb8-8bff4a195655.png"
                  alt="Ferrari"
                  className="rounded-lg h-48 md:h-64"
                  speed={0.2}
                  priority
                />
                <h3 className="mt-2 text-lg font-medium text-cyan-400">Ferrari SF90 Stradale</h3>
                <p className="text-sm text-white/70">Un capolavoro ingegneristico con oltre 1000CV di potenza.</p>
              </div>
              
              <div>
                <ParallaxImage
                  src="/public/events/lamborghini-huracan.jpg"
                  alt="Lamborghini"
                  className="rounded-lg h-48 md:h-64"
                  speed={0.2}
                />
                <h3 className="mt-2 text-lg font-medium text-cyan-400">Lamborghini Huracán</h3>
                <p className="text-sm text-white/70">Prestazioni straordinarie e design italiano inconfondibile.</p>
              </div>
              
              <div className="md:col-span-2">
                <ParallaxImage
                  src="/public/events/porsche-911.jpg"
                  alt="Altri premi"
                  className="rounded-lg h-40 md:h-48"
                  speed={0.2}
                />
                <h3 className="mt-2 text-lg font-medium text-cyan-400">Altri premi esclusivi</h3>
                <p className="text-sm text-white/70">Orologi di lusso, viaggi esclusivi e molto altro ancora.</p>
              </div>
            </div>
          </div>
        );
        
      case 'game':
        return (
          <div className="space-y-6">
            <p className="text-lg text-white/80">
              M1SSION è un gioco rivoluzionario che combina cacce al tesoro nel mondo reale, puzzle digitali e competizione sociale.
            </p>
            
            <div className="space-y-4">
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-cyan-400 font-medium mb-2">Come funziona</h3>
                <p className="text-sm text-white/70">
                  Ricevi indizi tramite l'app, risolvili e sbloccane di nuovi per avanzare nella tua missione. 
                  Ogni indizio ti avvicina alla soluzione finale e alla possibilità di vincere premi straordinari.
                </p>
              </div>
              
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-cyan-400 font-medium mb-2">Le regole del gioco</h3>
                <ul className="text-sm text-white/70 list-disc pl-5 space-y-1">
                  <li>Risolvi indizi e puzzle di difficoltà crescente</li>
                  <li>Sblocca nuovi livelli e contenuti speciali</li>
                  <li>Collabora o competi con altri giocatori</li>
                  <li>Segui la mappa e scopri i punti d'interesse</li>
                  <li>Vinci premi reali completando le missioni</li>
                </ul>
              </div>
              
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-cyan-400 font-medium mb-2">Abbonamenti e vantaggi</h3>
                <p className="text-sm text-white/70">
                  Scegli tra diversi piani di abbonamento per ottenere più indizi, accessi anticipati e maggiori possibilità di vincita.
                  Il piano Gold offre il miglior rapporto qualità-prezzo con indizi illimitati e accesso prioritario.
                </p>
              </div>
            </div>
          </div>
        );
        
      case 'subscription':
        return (
          <div className="space-y-6">
            <p className="text-lg text-white/80">
              Scegli l'abbonamento più adatto alle tue esigenze. Tutti i piani ti consentono di partecipare a M1SSION, ma con vantaggi diversi.
            </p>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-[#00E5FF]/10 to-black/70 border border-[#00E5FF]/30 p-4 rounded-lg">
                <h3 className="text-[#00E5FF] font-medium mb-2">Confronto abbonamenti</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-2">Piano</th>
                      <th className="text-left py-2">Prezzo</th>
                      <th className="text-left py-2">Indizi</th>
                      <th className="hidden md:table-cell text-left py-2">Vantaggi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/5">
                      <td className="py-2">Base</td>
                      <td className="py-2">Gratuito</td>
                      <td className="py-2">1/settimana</td>
                      <td className="hidden md:table-cell py-2">Accesso base</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="py-2">Silver</td>
                      <td className="py-2">€6,99/mese</td>
                      <td className="py-2">3/settimana</td>
                      <td className="hidden md:table-cell py-2">Tracciamento base, supporto chat</td>
                    </tr>
                    <tr className="border-b border-white/5 bg-[#00E5FF]/5">
                      <td className="py-2 font-medium">Gold</td>
                      <td className="py-2">€9,99/mese</td>
                      <td className="py-2">5/settimana</td>
                      <td className="hidden md:table-cell py-2">Accesso anticipato, supporto prioritario</td>
                    </tr>
                    <tr>
                      <td className="py-2">Black</td>
                      <td className="py-2">€13,99/mese</td>
                      <td className="py-2">Illimitati</td>
                      <td className="hidden md:table-cell py-2">Contenuti esclusivi, supporto VIP</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="bg-white/5 p-4 rounded-lg">
                <h3 className="text-cyan-400 font-medium mb-2">Perché scegliere Gold?</h3>
                <p className="text-sm text-white/70">
                  Il piano Gold è il più consigliato per chi vuole vivere l'esperienza completa di M1SSION. 
                  Con 5 indizi a settimana e accesso anticipato di 24 ore ai nuovi contenuti, avrai un vantaggio competitivo sostanziale.
                </p>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[700px] bg-black/90 border-white/10 text-white backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#00E5FF] via-white to-[#00E5FF] inline-block text-transparent bg-clip-text">
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4"
        >
          {renderContent()}
        </motion.div>
        
        <DialogFooter>
          <Button onClick={onClose} className="bg-gradient-to-r from-[#00E5FF] to-[#00BFFF] text-black">
            Chiudi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DetailsModal;
