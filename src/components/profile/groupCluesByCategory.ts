
import { getClueCategory } from "./cluesCategories";

const groupCluesByCategory = (clues: any[]) => {
  const grouped: Record<string, { icon: any; clues: any[] }> = {};
  for (const clue of clues) {
    const cat = getClueCategory(clue);
    if (!grouped[cat.name]) grouped[cat.name] = { icon: cat.icon, clues: [] };
    grouped[cat.name].clues.push(clue);
  }
  return grouped;
};

export default groupCluesByCategory;
