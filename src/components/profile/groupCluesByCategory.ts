
import { getClueCategory } from "./cluesCategories";

// Group clues by their category
const groupCluesByCategory = (clues: any[]) => {
  const grouped: Record<string, { icon: any; clues: any[] }> = {};
  
  console.log("Starting to group clues, total:", clues.length);
  
  clues.forEach((clue) => {
    // Get category for this clue
    const category = getClueCategory(clue);
    const categoryName = category.name;
    
    console.log(`Clue "${clue.title}" categorized as: ${categoryName}`);
    
    // Initialize category if it doesn't exist
    if (!grouped[categoryName]) {
      grouped[categoryName] = {
        icon: category.icon,
        clues: []
      };
    }
    
    // Add clue to its category
    grouped[categoryName].clues.push(clue);
  });
  
  console.log("Final grouped categories:", Object.keys(grouped));
  
  return grouped;
};

export default groupCluesByCategory;
