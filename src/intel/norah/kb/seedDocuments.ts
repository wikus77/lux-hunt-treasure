// © 2025 Joseph MULÉ – M1SSION™ – NORAH AI KB Seed Documents
// Base knowledge for immediate RAG responses

export const SEED_DOCUMENTS = [
  {
    slug: 'mission-buzz',
    title: 'BUZZ — definizione e regole base',
    body: `BUZZ è l'azione di scansione attiva che sblocca indizi o aree. Il costo e il raggio sono dinamici in base al tier e alla progressione. Il BUZZ può essere lanciato anche fuori dalla mappa. Il primo BUZZ Map ha condizioni speciali documentate a parte.`,
    tags: ['buzz', 'regole', 'onboarding']
  },
  {
    slug: 'mission-buzz-map',
    title: 'BUZZ Map — come funziona',
    body: `BUZZ Map è l'interazione contestuale dalla mappa: l'utente vede overlay e marker, e può lanciare il BUZZ direttamente dalla mappa. Differenza chiave: BUZZ = azione singola, BUZZ Map = azione dalla mappa con feedback visivo. Primo BUZZ Map: raggio 500 km, prezzo 4,99€ (se confermato nelle policy attuali).`,
    tags: ['buzz-map', 'mappa', 'onboarding']
  },
  {
    slug: 'mission-final-shot',
    title: 'Final Shot — intento finale',
    body: `Final Shot è il tentativo finale di claim del premio secondo regole antifrode (posizione, finestra temporale, limiti per tier). Prima del Final Shot viene consigliato rivedere gli indizi raccolti. I dettagli vanno aggiornati con le policy ufficiali.`,
    tags: ['final-shot', 'regole']
  },
  {
    slug: 'mission-tiers',
    title: 'Tiers e limiti',
    body: `Free/Silver/Gold/Black: limiti mensili di BUZZ, costo/raggio e vantaggi accessori. L'assistente deve sempre rispettare i limiti del tier corrente.`,
    tags: ['tiers', 'pricing']
  }
];
