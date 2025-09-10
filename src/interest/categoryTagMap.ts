/**
 * © 2025 Joseph MULÉ – M1SSION™ Category → Tag Mapping
 * Mappa centralizzata categorie UI → tag feed per notifiche
 */

export const CATEGORY_TAGS: Record<string, string[]> = {
  'Luxury & moda': ['luxury', 'fashion', 'watch', 'luxurycar'],
  'Viaggi & esperienze': ['travel', 'experience'],
  'Sport & fitness': ['sport'],
  'Tecnologia': ['tech'],
  'Food & beverage': ['food', 'beverage'],
  'Arte & cultura': ['art', 'culture', 'design'],
};

// Lista ordinata delle categorie per UI
export const AVAILABLE_CATEGORIES = Object.keys(CATEGORY_TAGS);

// Funzione helper per ottenere tutti i tag da una lista di categorie
export function getTagsForCategories(categories: string[]): string[] {
  const allTags = new Set<string>();
  categories.forEach(category => {
    if (CATEGORY_TAGS[category]) {
      CATEGORY_TAGS[category].forEach(tag => allTags.add(tag));
    }
  });
  return Array.from(allTags);
}

// Funzione reverse: trova categorie che contengono un tag specifico
export function getCategoriesForTag(searchTag: string): string[] {
  return AVAILABLE_CATEGORIES.filter(category => 
    CATEGORY_TAGS[category].includes(searchTag)
  );
}