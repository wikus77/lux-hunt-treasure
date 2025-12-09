// © 2025 Joseph MULÉ – M1SSION™ – NORAH AI Local KB Cache
// Fallback knowledge when RAG returns 0 results

interface LocalDoc {
  slug: string;
  title: string;
  content: string;
  keywords: string[];
}

const LOCAL_DOCS: LocalDoc[] = [
  {
    slug: 'mission-buzz',
    title: 'BUZZ — definizione e regole base',
    keywords: ['buzz', 'scansione', 'indizi', 'costo', 'raggio'],
    content: `BUZZ è l'azione di scansione attiva che sblocca indizi o aree. Il costo e il raggio sono dinamici in base al tier e alla progressione. Il BUZZ può essere lanciato anche fuori dalla mappa.

**Caratteristiche chiave:**
• Azione singola di scansione
• Costo e raggio variano per tier (Free/Silver/Gold/Black)
• Sblocca indizi progressivi
• Disponibile anche fuori mappa`
  },
  {
    slug: 'mission-buzz-map',
    title: 'BUZZ Map — come funziona',
    keywords: ['buzz map', 'mappa', 'differenza', 'overlay', 'marker', 'contestuale'],
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
    slug: 'mission-final-shot',
    title: 'Final Shot — intento finale',
    keywords: ['final shot', 'claim', 'premio', 'antifrode', 'tentativo finale'],
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
    slug: 'mission-tiers',
    title: 'Tiers e limiti M1SSION™',
    keywords: ['tier', 'free', 'silver', 'gold', 'black', 'titanium', 'limiti', 'pricing', 'vantaggi', 'abbonamento'],
    content: `Abbonamenti M1SSION™: Free/Silver/Gold/Black/Titanium con BUZZ settimanali e indizi progressivi.

**Free Tier (Gratuito):**
• 1 BUZZ gratuito/settimana
• 1 indizio/settimana (Livello 1)
• BUZZ MAP: solo a pagamento
• Cooldown BUZZ MAP: 24h

**Silver Tier (3,99€/mese):**
• 3 BUZZ gratuiti/settimana
• 3 indizi/settimana (Livelli 1-2)
• BUZZ MAP: solo a pagamento
• Cooldown BUZZ MAP: 12h

**Gold Tier (6,99€/mese):**
• 4 BUZZ gratuiti/settimana
• 5 indizi/settimana (Livelli 1-3)
• BUZZ MAP: solo a pagamento
• Cooldown BUZZ MAP: 8h

**Black Tier (9,99€/mese):**
• 5 BUZZ gratuiti/settimana
• 7 indizi/settimana (Livelli 1-4)
• 1 BUZZ MAP gratuito/mese
• Cooldown BUZZ MAP: 4h

**Titanium Tier (29,99€/mese):**
• 7 BUZZ gratuiti/settimana
• 7 indizi/settimana (tutti i livelli 1-5)
• 2 BUZZ MAP gratuiti/mese
• Nessun cooldown BUZZ MAP
• Supporto prioritario`
  }
];

export function get(query: string): string | null {
  const normalizedQuery = query.toLowerCase();
  
  // Match keywords
  for (const doc of LOCAL_DOCS) {
    const hasKeyword = doc.keywords.some(kw => normalizedQuery.includes(kw));
    if (hasKeyword) {
      return `📚 **${doc.title}**\n\n${doc.content}\n\n*(fonte: documenti M1SSION locali)*`;
    }
  }
  
  // Fallback for generic questions
  if (normalizedQuery.includes('cos') || normalizedQuery.includes('cosa') || normalizedQuery.includes('spiega')) {
    return LOCAL_DOCS[0].content + '\n\n' + LOCAL_DOCS[1].content;
  }
  
  return null;
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
