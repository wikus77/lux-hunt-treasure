// M1SSION™ - Clue Detail Component for iOS Capacitor
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  MapPin, 
  Calendar, 
  Star, 
  Copy, 
  Share,
  Sparkles,
  Target,
  Search,
  X
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { preserveFunctionName } from '@/utils/iosCapacitorFunctions';
import { useCapacitorHardware } from '@/hooks/useCapacitorHardware';
import { toast } from 'sonner';

interface Clue {
  id: string;
  title_it: string;
  description_it: string;
  week: number;
  clue_type: string;
  is_unlocked: boolean;
  unlock_cost?: number;
}

interface ClueDetailProps {
  clue: Clue;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ClueDetail: React.FC<ClueDetailProps> = ({
  clue,
  open,
  onOpenChange
}) => {
  const { vibrate } = useCapacitorHardware();

  // Copy clue text to clipboard
  const copyClueText = preserveFunctionName(async () => {
    try {
      await vibrate(30);
      const text = `${clue.title_it}\n\n${clue.description_it}`;
      
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      toast.success('Indizio copiato negli appunti!');
    } catch (err) {
      console.error('Error copying clue:', err);
      toast.error('Errore nella copia');
    }
  }, 'copyClueText');

  // Share clue (if Web Share API is available)
  const shareClue = preserveFunctionName(async () => {
    try {
      await vibrate(30);
      
      if (navigator.share) {
        await navigator.share({
          title: `M1SSION™ - ${clue.title_it}`,
          text: clue.description_it,
          url: window.location.href
        });
      } else {
        // Fallback to copy
        await copyClueText();
      }
    } catch (err) {
      console.error('Error sharing clue:', err);
      // Fallback to copy if share fails
      await copyClueText();
    }
  }, 'shareClue');

  // Get clue type info
  const getClueTypeInfo = (type: string) => {
    switch (type) {
      case 'precise':
        return {
          label: 'Preciso',
          icon: <Target className="w-4 h-4" />,
          color: 'text-red-400',
          bgColor: 'bg-red-500/10 border-red-500/30',
          description: 'Questo indizio fornisce informazioni molto specifiche sulla posizione.'
        };
      case 'medium':
        return {
          label: 'Medio',
          icon: <Search className="w-4 h-4" />,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10 border-yellow-500/30',
          description: 'Questo indizio fornisce informazioni di media precisione.'
        };
      case 'vague':
        return {
          label: 'Vago',
          icon: <Eye className="w-4 h-4" />,
          color: 'text-green-400',
          bgColor: 'bg-green-500/10 border-green-500/30',
          description: 'Questo indizio fornisce informazioni generali sull\'area.'
        };
      default:
        return {
          label: 'Sconosciuto',
          icon: <Sparkles className="w-4 h-4" />,
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/10 border-gray-500/30',
          description: 'Tipo di indizio non specificato.'
        };
    }
  };

  if (!clue.is_unlocked) {
    return null;
  }

  const typeInfo = getClueTypeInfo(clue.clue_type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-md mx-auto max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#F059FF]" />
            Dettaglio Indizio
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Clue Type Card */}
          <Card className={`${typeInfo.bgColor}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`${typeInfo.color}`}>
                  {typeInfo.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    Indizio {typeInfo.label}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      Settimana {clue.week}
                    </Badge>
                    {clue.unlock_cost && (
                      <Badge className="bg-[#F059FF] text-white text-xs">
                        {clue.unlock_cost} crediti
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-300">
                {typeInfo.description}
              </p>
            </CardContent>
          </Card>

          {/* Clue Content */}
          <div className="space-y-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-lg font-bold text-[#00D1FF] mb-3">
                {clue.title_it}
              </h3>
              
              <Card className="bg-gray-800/50 border-gray-600/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <div className="w-3 h-3 rounded-full bg-[#F059FF] animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white leading-relaxed">
                        {clue.description_it}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex gap-3 pt-4"
            >
              <Button
                variant="outline"
                className="flex-1"
                onClick={copyClueText}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copia
              </Button>
              
              <Button
                variant="outline"
                className="flex-1"
                onClick={shareClue}
              >
                <Share className="w-4 h-4 mr-2" />
                Condividi
              </Button>
            </motion.div>

            {/* Tips */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-blue-500/10 border-blue-500/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-400 mb-2">
                        Suggerimento
                      </h4>
                      <p className="text-sm text-gray-300">
                        Usa questo indizio insieme agli altri per triangolare la posizione esatta del premio. 
                        Più indizi sbloccherai, più precisa sarà la tua ricerca!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClueDetail;