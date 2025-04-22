
import { MapPin, Car, Image, Folder } from "lucide-react";

export const CATEGORY_STYLES: Record<
  string,
  { gradient: string; textColor: string }
> = {
  Luoghi: {
    gradient: "bg-gradient-to-r from-projectx-blue via-[#1eaedb] to-[#8b5cf6]",
    textColor: "text-white",
  },
  Car: {
    gradient: "bg-gradient-to-r from-[#a855f7] via-[#00a3ff] to-[#ec4899]",
    textColor: "text-white",
  },
  Photo: {
    gradient: "bg-gradient-to-r from-[#8b5cf6] via-[#00a3ff] to-[#22d3ee]",
    textColor: "text-white",
  },
  General: {
    gradient: "bg-gradient-to-r from-[#221F26] via-[#7e69ab] to-[#1a1f2c]",
    textColor: "text-white",
  },
};

export const clueCategories = [
  {
    name: "Luoghi",
    icon: MapPin,
    matcher: (clue: any) =>
      /città|luogo|parcheggi|parcheggiata|monumento|posizion|localizz|place|location|indirizzo|dove|map|via/i.test(
        clue.title + " " + clue.description
      ),
  },
  {
    name: "Car",
    icon: Car,
    matcher: (clue: any) =>
      /auto|car|modello|marca|veicolo|interno|esterno|motore|carrozzeria|carrozzerie|motori/i.test(
        clue.title + " " + clue.description
      ),
  },
  {
    name: "Photo",
    icon: Image,
    matcher: (clue: any) =>
      /foto|immagine|immagini|scatto|phot|picture|jpg|png|selfie/i.test(
        clue.title + " " + clue.description
      ),
  },
];

// Categoria Generica per indizi che non combaciano con le altre
export const getClueCategory = (clue: any) => {
  for (const cat of clueCategories) {
    if (cat.matcher(clue)) return cat;
  }
  return { name: "General", icon: Folder };
};

