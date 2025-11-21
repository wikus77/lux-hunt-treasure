
import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ColorOption {
  value: "high" | "medium" | "low";
  label: string;
  gradient: string;
}

const colorOptions: ColorOption[] = [
  {
    value: "high",
    label: "Alta Importanza",
    gradient: "from-[#FF4D6B] to-[#FF193C]"
  },
  {
    value: "medium",
    label: "Media Importanza",
    gradient: "from-[#FF9466] to-[#FF6B1E]"
  },
  {
    value: "low",
    label: "Bassa Importanza",
    gradient: "from-[#4ADE80] to-[#22c55e]"
  }
];

interface NoteColorBannerProps {
  open: boolean;
  onClose: () => void;
  onSelectColor: (importance: "high" | "medium" | "low") => void;
}

const NoteColorBanner = ({ open, onClose, onSelectColor }: NoteColorBannerProps) => {
  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!value) onClose();
    }}>
      <DialogContent className="bg-gradient-to-tr from-[#1eaedb]/80 via-[#9b87f5]/80 to-[#d946ef]/80 p-4 rounded-xl shadow-xl backdrop-blur-md border border-[#7209b7]/70">
        <DialogTitle className="text-lg text-white mb-4">
          Seleziona l'importanza della nota
        </DialogTitle>
        <DialogDescription className="text-white">
          <RadioGroup className="gap-3" onValueChange={(value) => onSelectColor(value as "high" | "medium" | "low")}>
            {colorOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/10 transition-colors">
                <RadioGroupItem value={option.value} id={option.value} />
                <label htmlFor={option.value} className="flex items-center gap-3 cursor-pointer flex-1">
                  <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${option.gradient} shadow-lg shadow-current/25 animate-pulse`} />
                  <span className="text-white">{option.label}</span>
                </label>
              </div>
            ))}
          </RadioGroup>
        </DialogDescription>
        <div className="mt-4 flex justify-end">
          <button
            className="px-4 py-2 bg-white/20 hover:bg-white/30 transition-colors rounded text-sm text-white font-medium"
            onClick={onClose}
          >
            Chiudi
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NoteColorBanner;
