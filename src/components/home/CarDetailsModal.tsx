
import React from "react";
import { motion } from "framer-motion";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CarDetails {
  id: string;
  name: string;
  description: string;
  engine: string;
  acceleration: string;
  prize: string;
  imageUrl: string;
  color: string;
}

interface CarDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  car: CarDetails | null;
}

export const CarDetailsModal: React.FC<CarDetailsModalProps> = ({
  isOpen,
  onClose,
  car,
}) => {
  if (!car) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center p-4",
          isOpen ? "pointer-events-auto" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{
            opacity: isOpen ? 1 : 0,
            y: isOpen ? 0 : 20,
            scale: isOpen ? 1 : 0.95,
          }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{
            opacity: isOpen ? 1 : 0,
            y: isOpen ? 0 : 20,
            scale: isOpen ? 1 : 0.95,
          }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 300,
            delay: 0.1,
          }}
          className="relative z-50 w-full max-w-3xl overflow-hidden rounded-3xl bg-gradient-to-b from-black to-gray-900 border border-white/10 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-all duration-200"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative h-64 sm:h-80 overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${car.imageUrl})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
            </div>
            <div
              className="absolute bottom-0 left-0 right-0 h-32 opacity-60"
              style={{
                background: `linear-gradient(to top, ${car.color || "#000"}, transparent)`,
              }}
            />
          </div>

          <div className="relative p-6 pb-8">
            <h2
              className="text-3xl sm:text-4xl font-bold mb-2"
              style={{ color: car.color }}
            >
              {car.name}
            </h2>
            <p className="text-white/80 text-lg italic mb-6">{car.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="bg-black/40 rounded-lg p-4 border border-white/5">
                  <h3 className="text-white/60 text-sm uppercase mb-1">Motore</h3>
                  <p className="text-white text-lg">{car.engine}</p>
                </div>
                <div className="bg-black/40 rounded-lg p-4 border border-white/5">
                  <h3 className="text-white/60 text-sm uppercase mb-1">
                    Accelerazione
                  </h3>
                  <p className="text-white text-lg">{car.acceleration}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-black/40 rounded-lg p-4 border border-white/5">
                  <h3 className="text-white/60 text-sm uppercase mb-1">
                    Premio M1SSION
                  </h3>
                  <p className="text-white text-lg">{car.prize}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-8">
              <Button
                onClick={onClose}
                variant="outline"
                className="bg-black/30 text-white border-white/20 hover:bg-black/50"
              >
                Chiudi
              </Button>
              <Button variant="default">Partecipa ora</Button>
            </div>
          </div>
        </motion.div>
      </div>
    </Dialog>
  );
};
