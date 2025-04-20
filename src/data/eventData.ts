
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
}

export const currentEvent: Event = {
  title: "Patek Philippe Nautilus",
  carModel: "Nautilus Ref. 5711",
  carBrand: "Patek Philippe",
  date: "19 Apr - 15 Mag 2025",
  imageUrl: "/lovable-uploads/42b25071-8e68-4f8e-8897-06a6b2bdb8f4.png",
  description: "Un'icona dell'orologeria di lusso, il Nautilus in oro rosa con quadrante blu è il simbolo dell'eleganza senza tempo.",
  isCurrent: true,
  gender: "man",
  images: [
    {
      url: "/lovable-uploads/42b25071-8e68-4f8e-8897-06a6b2bdb8f4.png",
      description: "Vista frontale del Patek Philippe Nautilus in oro rosa, che mostra il caratteristico quadrante blu con pattern orizzontale."
    },
    {
      url: "/lovable-uploads/55b484c2-04bc-4fb2-a650-1910fd650b89.png",
      description: "Dettaglio del bracciale integrato in oro rosa, simbolo di lusso ed eleganza."
    },
    {
      url: "/lovable-uploads/79b6f8b7-66b3-4dee-a705-0d3f0b1f16b9.png",
      description: "Vista laterale che evidenzia il profilo iconico della cassa Nautilus."
    }
  ],
  detailedDescription: `Il Patek Philippe Nautilus Ref. 5711 rappresenta il pinnacolo dell'orologeria di lusso.

Caratteristiche principali:
• Cassa in oro rosa 18k
• Quadrante blu con pattern orizzontale
• Movimento automatico calibro 26-330 S C
• Impermeabile fino a 120 metri
• Bracciale integrato in oro rosa
• Diametro della cassa: 40mm

Il Nautilus è molto più di un semplice orologio - è un'opera d'arte da polso che combina l'eccellenza tecnica con un design senza tempo.`
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

