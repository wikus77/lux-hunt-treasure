const LOCAL_DOCS = [
  {
    slug: "mission-buzz",
    title: "BUZZ — definizione e regole base",
    keywords: ["buzz", "scansione", "indizi", "costo", "raggio"],
    content: `BUZZ è l'azione di scansione attiva che sblocca indizi o aree. Il costo e il raggio sono dinamici in base al tier e alla progressione. Il BUZZ può essere lanciato anche fuori dalla mappa.

**Caratteristiche chiave:**
• Azione singola di scansione
• Costo e raggio variano per tier (Free/Silver/Gold/Black)
• Sblocca indizi progressivi
• Disponibile anche fuori mappa`
  },
  {
    slug: "mission-buzz-map",
    title: "BUZZ Map — come funziona",
    keywords: ["buzz map", "mappa", "differenza", "overlay", "marker", "contestuale"],
    content: `BUZZ Map è l'interazione contestuale dalla mappa: l'utente vede overlay e marker e può lanciare il BUZZ direttamente dalla mappa.

**Differenza chiave BUZZ vs BUZZ Map:**
• BUZZ = azione singola standalone
• BUZZ Map = azione dalla mappa con feedback visivo in tempo reale
• Primo BUZZ Map: raggio 500 km, prezzo 4,99€ (policy tier Free/Silver)

**Vantaggi BUZZ Map:**
• Overlay visivo su mappa
• Marker interattivi
• Feedback contestuale immediato`
  },
  {
    slug: "mission-final-shot",
    title: "Final Shot — intento finale",
    keywords: ["final shot", "claim", "premio", "antifrode", "tentativo finale"],
    content: `Final Shot è il tentativo finale di claim del premio secondo regole antifrode (posizione, finestra temporale, limiti per tier).

**Prima del Final Shot:**
• Rivedi tutti gli indizi raccolti
• Verifica la tua posizione GPS
• Controlla i limiti del tuo tier
• Assicurati di essere nella finestra temporale corretta

**Regole antifrode:**
• Verifica posizione GPS in tempo reale
• Finestra temporale limitata
• Limiti per tier (Free: 1/mese, Silver: 3/mese, Gold: 5/mese, Black: illimitati)`
  },
  {
    slug: "mission-tiers",
    title: "Tiers e limiti",
    keywords: ["tier", "free", "silver", "gold", "black", "limiti", "pricing", "vantaggi"],
    content: `Free/Silver/Gold/Black: limiti mensili di BUZZ, costo/raggio e vantaggi accessori.

**Free Tier:**
• BUZZ mensili: 3
• Raggio base: 100 km
• Final Shot: 1/mese

**Silver Tier:**
• BUZZ mensili: 10
• Raggio base: 250 km
• Final Shot: 3/mese
• Prezzo: 9,99€/mese

**Gold Tier:**
• BUZZ mensili: 30
• Raggio base: 500 km
• Final Shot: 5/mese
• Supporto prioritario
• Prezzo: 29,99€/mese

**Black Tier:**
• BUZZ illimitati
• Raggio personalizzato
• Final Shot illimitati
• Accesso anticipato a nuovi premi
• Concierge personale
• Prezzo: 99,99€/mese`
  }
];
function get(query) {
  const normalizedQuery = query.toLowerCase();
  for (const doc of LOCAL_DOCS) {
    const hasKeyword = doc.keywords.some((kw) => normalizedQuery.includes(kw));
    if (hasKeyword) {
      return `📚 **${doc.title}**

${doc.content}

*(fonte: documenti M1SSION locali)*`;
    }
  }
  if (normalizedQuery.includes("cos") || normalizedQuery.includes("cosa") || normalizedQuery.includes("spiega")) {
    return LOCAL_DOCS[0].content + "\n\n" + LOCAL_DOCS[1].content;
  }
  return null;
}

export { get };
