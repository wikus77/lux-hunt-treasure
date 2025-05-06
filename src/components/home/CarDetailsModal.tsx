
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface CarDetails {
  id: string;
  name: string;
  description: string;
  engine: string;
  acceleration: string;
  prize: string;
  imageUrl?: string;
  color?: string;
}

interface CarDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  car: CarDetails | null;
}

export const CarDetailsModal: React.FC<CarDetailsModalProps> = ({ isOpen, onClose, car }) => {
  if (!car) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-black/95 border border-white/10 text-white max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold" style={{ color: car.color || '#FFFFFF' }}>
            {car.name}
          </DialogTitle>
          <DialogClose className="absolute right-4 top-4 p-1 rounded-full bg-black/80 hover:bg-white/20 transition-colors">
            <X className="h-4 w-4" />
          </DialogClose>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image */}
          <div className="w-full h-full min-h-[250px] sm:min-h-[300px] relative rounded-xl overflow-hidden">
            <AnimatePresence>
              <motion.img 
                key={car.id}
                src={car.imageUrl || '/lovable-uploads/14f94617-e821-4a59-9b90-32d1dfd615e4.png'}
                alt={car.name}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            </AnimatePresence>
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none"></div>
            
            {/* Logo or brand name in corner */}
            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm py-1 px-3 rounded-lg text-sm font-bold" style={{ color: car.color }}>
              {car.id.toUpperCase()}
            </div>
          </div>
          
          {/* Details */}
          <div className="space-y-4">
            <DialogDescription className="text-white/80 text-base">
              {car.description}
            </DialogDescription>
            
            <div className="space-y-3 mt-4">
              <div className="bg-white/5 p-3 rounded-lg">
                <div className="text-sm text-white/50 mb-1">Motore</div>
                <div className="text-white">{car.engine}</div>
              </div>
              
              <div className="bg-white/5 p-3 rounded-lg">
                <div className="text-sm text-white/50 mb-1">Accelerazione</div>
                <div className="text-white">{car.acceleration}</div>
              </div>
              
              <div className="bg-white/5 p-3 rounded-lg">
                <div className="text-sm text-white/50 mb-1">Premio</div>
                <div className="text-white">{car.prize}</div>
              </div>
            </div>
            
            <div className="text-xs text-white/40 mt-6">
              Le immagini e le specifiche sono a scopo illustrativo. I premi effettivi possono variare.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
