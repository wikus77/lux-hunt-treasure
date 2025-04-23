
import { MapPin, Car, Image, Wrench } from "lucide-react";
import type { LucideIcon } from 'lucide-react';

export const CATEGORY_STYLES: Record<
  string,
  { gradient: string; textColor: string }
> = {
  "Luoghi": {
    gradient: "bg-gradient-to-r from-[#00a3ff] via-[#1eaedb] to-[#8b5cf6]",
    textColor: "text-white",
  },
  "Car": {
    gradient: "bg-gradient-to-r from-[#a855f7] via-[#ec4899] to-[#f43f5e]",
    textColor: "text-white",
  },
  "Foto Interni": {
    gradient: "bg-gradient-to-r from-[#8b5cf6] via-[#00a3ff] to-[#22d3ee]",
    textColor: "text-white",
  },
  "Foto Esterni": {
    gradient: "bg-gradient-to-r from-[#f59e0b] via-[#f97316] to-[#ef4444]",
    textColor: "text-white",
  },
  "Equipaggiamento": {
    gradient: "bg-gradient-to-r from-[#a855f7] via-[#00a3ff] to-[#ec4899]",
    textColor: "text-white",
  },
  "General": {
    gradient: "bg-gradient-to-r from-[#221F26] via-[#7e69ab] to-[#1a1f2c]",
    textColor: "text-white",
  },
};

export const clueCategories = [
  {
    name: "Luoghi",
    icon: MapPin,
    matcher: (clue: any) =>
      /luoghi|posizione|location|place|dove|map|via|città/i.test(
        clue.title + " " + clue.description
      ),
  },
  {
    name: "Car",
    icon: Car,
    matcher: (clue: any) =>
      /auto|car|modello|marca|veicolo|motore|carrozzeria|motori/i.test(
        clue.title + " " + clue.description
      ),
  },
  {
    name: "Foto Interni",
    icon: Image,
    matcher: (clue: any) =>
      /interni|interno|abitacolo|sedili|cruscotto|cockpit|dashboard/i.test(
        clue.title + " " + clue.description
      ),
  },
  {
    name: "Foto Esterni",
    icon: Image,
    matcher: (clue: any) =>
      /esterni|esterno|carrozzeria|foto|immagine|scatto|photo|picture/i.test(
        clue.title + " " + clue.description
      ),
  },
  {
    name: "Equipaggiamento",
    icon: Wrench,
    matcher: (clue: any) =>
      /config|setup|impostazioni|optional|accessori|dotazione/i.test(
        clue.title + " " + clue.description
      ),
  },
];

// Generic category for clues that don't match others
export const getClueCategory = (clue: any) => {
  for (const cat of clueCategories) {
    if (cat.matcher(clue)) return cat;
  }
  return { name: "General", icon: MapPin };
};
