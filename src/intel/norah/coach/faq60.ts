// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// NORAH v6.8 - FAQ 60s Module (Alternative to BUZZ)

export interface FAQItem {
  question: string;
  answer: string;
  cta?: string;
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
export const FAQ_ESSENTIALS: FAQItem[] = [
  {
    question: 'Come funziona M1SSION?',
    answer: 'Raccogli indizi veri → trova pattern → fai Final Shot sul punto esatto → vinci premio reale. Zero spoiler, solo deduzione.',
    cta: 'Vuoi iniziare?'
  },
  {
    question: 'Cos\'è Final Shot?',
    answer: 'È il momento in cui tiri una coordinata precisa. Se è nel raggio giusto (calcolato dai tuoi indizi), vinci. Max 2 tentativi/giorno. È "safe" se hai 8+ indizi.',
    cta: 'Vuoi vedere un esempio safe?'
  },
  {
    question: 'BUZZ Map a cosa serve?',
    answer: 'Visualizza i tuoi indizi su mappa e ti mostra il "raggio di confidenza". Più indizi hai, più il cerchio si stringe. Usi BUZZ Map DOPO aver raccolto 5+ indizi.',
    cta: 'Apri BUZZ Map?'
  },
  {
    question: 'Quanto costa?',
    answer: 'BUZZ è gratuito (1 indizio/giorno). BUZZ Map e Final Shot sono a pagamento ma opzionali. Puoi vincere anche con solo BUZZ gratis se sei metodico.',
    cta: 'Vedi piani'
  }
];

/**
 * Generate FAQ 60s summary
 */
export function generateFAQ60(): string {
  const faqText = FAQ_ESSENTIALS
    .map((item, i) => `**${i + 1}. ${item.question}**\n${item.answer}`)
    .join('\n\n');
  
  return `📚 **FAQ Essenziale** (60s di lettura, zero spoiler)\n\n${faqText}\n\nVuoi approfondire qualcosa?`;
}

/**
 * Get specific FAQ item
 */
export function getFAQItem(index: number): FAQItem | null {
  return FAQ_ESSENTIALS[index] || null;
}

/**
 * Search FAQ by keyword
 */
export function searchFAQ(keyword: string): FAQItem[] {
  const normalized = keyword.toLowerCase();
  return FAQ_ESSENTIALS.filter(
    item => 
      item.question.toLowerCase().includes(normalized) ||
      item.answer.toLowerCase().includes(normalized)
  );
}
