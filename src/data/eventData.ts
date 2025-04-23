import { MysteryPrize } from "./mysteryPrizesData";

export interface EventImage {
  url: string;
  description: string;
}

export interface Event {
  title: string;
  carModel: string;
  carBrand: string;
  date: string;
  imageUrl: string;
  description: string;
  gender: "man" | "woman";
  images: EventImage[];
  detailedDescription: string;
  isCurrent?: boolean;
  mysteryPrizes?: MysteryPrize[];
}

// Aggiorniamo tutti gli eventi, nessun Patek Philippe orologio, solo auto & borse
export const currentEvent: Event = {
  title: "Auto Supercar Showdown",
  carModel: "",
  carBrand: "",
  date: "19 Apr - 15 Mag 2025",
  imageUrl: "/lovable-uploads/159027e7-9756-49fa-a771-b886e6c8f8e9.png", // Lamborghini Huracán image
  description: "Slideshow esclusiva: Lamborghini Huracán, Ferrari 488 GTB, Porsche 911 (992), Ferrari SF90 Stradale. Performance ed eleganza uniche in una sola esperienza!",
  isCurrent: true,
  gender: "man",
  images: [
    {
      url: "/lovable-uploads/159027e7-9756-49fa-a771-b886e6c8f8e9.png",
      description: "Lamborghini Huracán EVO, potenza pura V10 con 640 CV, 0-100 km/h in 2.9 secondi."
    },
    {
      url: "/lovable-uploads/d6dc12b2-928f-4448-b728-f5e59b6175a8.png",
      description: "Ferrari 488 GTB, V8 biturbo da 670 CV, un capolavoro di ingegneria italiana."
    },
    {
      url: "/lovable-uploads/441b250e-b843-489a-9664-0b1f971fbc59.png",
      description: "Porsche 911 (992) Turbo S: l'essenza della sportività tedesca."
    },
    {
      url: "/lovable-uploads/507c2f6d-4ed0-46dc-b53c-79e1d5b7515e.png",
      description: "Ferrari SF90 Stradale, V8 ibrido plug-in da 1.000 CV, il futuro è qui."
    }
  ],
  detailedDescription: `Auto Supercar Showdown riunisce le più iconiche sportive del mondo:

• Lamborghini Huracán EVO: V10 aspirato, trazione integrale e design inconfondibile.
• Ferrari 488 GTB: Prestazioni da pista, eleganza italiana e motore V8 biturbo.
• Porsche 911 (992) Turbo S: Precisione tedesca e potenza senza rivali.
• Ferrari SF90 Stradale: Tecnologia ibrida plug-in e 1.000 CV.

Un evento da non perdere per tutti gli appassionati di auto e performance estreme!`
};

export const upcomingEvents: Event[] = [
  {
    title: "Hermès Kelly Bag",
    carModel: "Kelly 28",
    carBrand: "Hermès",
    date: "16 Mag - 15 Giu 2025",
    imageUrl: "/lovable-uploads/b349206f-bdf7-42e2-a1a6-b87988bc94f4.png",
    description: "L'iconica borsa Kelly in verde smeraldo, simbolo di eleganza e raffinatezza.",
    gender: "woman",
    images: [
      {
        url: "/lovable-uploads/b349206f-bdf7-42e2-a1a6-b87988bc94f4.png",
        description: "La Kelly bag in verde smeraldo, un'icona di stile intramontabile."
      }
    ],
    detailedDescription: `La borsa Kelly di Hermès è un'icona senza tempo della moda di lusso.

Specifiche:
• Pelle Epsom verde smeraldo
• Hardware placcato oro
• Dimensioni: 28 x 22 x 10 cm
• Tracolla removibile
• Chiusura con lucchetto e chiavi
• Fodera in pelle di capra

Ogni borsa Kelly è realizzata a mano da un singolo artigiano, richiedendo circa 18-25 ore di lavoro.`
  },
  {
    title: "McLaren 720S Spider",
    carModel: "720S Spider",
    carBrand: "McLaren",
    date: "16 Giu - 15 Lug 2025",
    imageUrl: "/lovable-uploads/f6438a3c-d978-47ff-b010-4fd09dc9cc28.png",
    description: "La supercar britannica che ridefinisce il concetto di prestazioni e design.",
    gender: "man",
    images: [
      {
        url: "/lovable-uploads/f6438a3c-d978-47ff-b010-4fd09dc9cc28.png",
        description: "McLaren 720S Spider in nero satinato, un capolavoro di ingegneria automobilistica."
      },
      {
        url: "/lovable-uploads/0cf2adbf-7e29-43e4-9028-27a47b8057eb.png",
        description: "Vista posteriore che mostra l'aerodinamica attiva e il diffusore."
      }
    ],
    detailedDescription: `La McLaren 720S Spider è l'incarnazione della perfezione ingegneristica.

Specifiche tecniche:
• Motore V8 biturbo da 4.0L
• 720 CV di potenza
• 0-100 km/h in 2.9 secondi
• Velocità massima: 341 km/h
• Tetto rigido retrattile
• Telaio in fibra di carbonio MonoCage II-S`
  },
  {
    title: "Porsche Cayenne",
    carModel: "Cayenne Turbo GT",
    carBrand: "Porsche",
    date: "16 Lug - 15 Ago 2025",
    imageUrl: "/lovable-uploads/7f787e38-d579-4b24-8a57-1ede818cdca3.png",
    description: "Il SUV che combina lusso e prestazioni estreme.",
    gender: "woman",
    images: [
      {
        url: "/lovable-uploads/7f787e38-d579-4b24-8a57-1ede818cdca3.png",
        description: "Porsche Cayenne Turbo GT, il SUV più potente della gamma."
      },
      {
        url: "/lovable-uploads/48b9a28f-59eb-4010-9bb2-37de88a4d7b1.png",
        description: "Gli interni sportivi con finiture in carbonio e Alcantara."
      }
    ],
    detailedDescription: `Il Porsche Cayenne Turbo GT rappresenta il vertice dei SUV sportivi.

Specifiche tecniche:
• Motore V8 biturbo da 4.0L
• 640 CV di potenza
• 0-100 km/h in 3.3 secondi
• Velocità massima: 300 km/h
• Sospensioni pneumatiche adattive
• Sistema di sterzo integrale`
  }
];
