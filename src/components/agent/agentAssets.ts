/**
 * AGENT ASSETS - Configuration for 3D Agent Models, Outfits & Skin Tones
 * COMPLETE LIBRARY - 140 GLB Files
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

// ============================================
// SKIN TONE TYPES & CONFIG
// ============================================

export type SkinToneId =
  | 'skin_light'
  | 'skin_medium'
  | 'skin_tan'
  | 'skin_dark'
  | 'skin_bronze'
  | 'skin_cyan_matte'
  | 'skin_pink_matte'
  | 'skin_black_matte'
  | 'skin_green_matte'
  | 'skin_red_matte';

export interface SkinToneConfig {
  id: SkinToneId;
  label: string;
  color: string;
  isSpecial?: boolean;
}

export const SKIN_TONES: SkinToneConfig[] = [
  { id: 'skin_light', label: 'Light', color: '#f6d2b8' },
  { id: 'skin_medium', label: 'Medium', color: '#d9a27c' },
  { id: 'skin_tan', label: 'Tan', color: '#c68c5c' },
  { id: 'skin_dark', label: 'Dark', color: '#8a5a3b' },
  { id: 'skin_bronze', label: 'Bronze', color: '#b3703b' },
  { id: 'skin_cyan_matte', label: 'Cyan', color: '#42f2ff', isSpecial: true },
  { id: 'skin_pink_matte', label: 'Pink', color: '#ff7ab2', isSpecial: true },
  { id: 'skin_black_matte', label: 'Obsidian', color: '#1a1a1a', isSpecial: true },
  { id: 'skin_green_matte', label: 'Neon', color: '#34e47a', isSpecial: true },
  { id: 'skin_red_matte', label: 'Crimson', color: '#ff4a4a', isSpecial: true },
];

export const DEFAULT_SKIN_TONE: SkinToneId = 'skin_medium';

export function getSkinToneById(id: SkinToneId): SkinToneConfig {
  return SKIN_TONES.find(s => s.id === id) || SKIN_TONES[1];
}

// ============================================
// AGENT MODEL TYPES
// ============================================

export type AgentGender = 'male' | 'female';

export type AgentModelId =
  | 'male_default'
  | 'male_alt'
  | 'male_02'
  | 'male_03'
  | 'female_default'
  | 'female_alt'
  | 'female_01'
  | 'special_wolfman'
  | 'special_agent';

export interface AgentModelConfig {
  id: AgentModelId;
  label: string;
  gender: AgentGender | 'any';
  glbPath: string;
  description?: string;
}

// ============================================
// AGENT MODELS - 11 Available Characters
// ============================================

export const AGENT_MODELS: AgentModelConfig[] = [
  { id: 'male_default', label: 'M1 Field Operative', gender: 'male', glbPath: '/models/agent/agent_male.glb', description: 'Standard field agent' },
  { id: 'male_alt', label: 'M1 Field Alt', gender: 'male', glbPath: '/models/agent/agent_ male.glb', description: 'Alternative field agent' },
  { id: 'male_02', label: 'Shadow Operative', gender: 'male', glbPath: '/models/agent/agent_male02.glb', description: 'Stealth specialist' },
  { id: 'male_03', label: 'Tactical Agent', gender: 'male', glbPath: '/models/agent/agent_male03.glb', description: 'Field tactical unit' },
  { id: 'female_default', label: 'M1 Elite Operative', gender: 'female', glbPath: '/models/agent/agent_female01.glb', description: 'Elite field agent' },
  { id: 'female_alt', label: 'M1 Elite Alt', gender: 'female', glbPath: '/models/agent/agent_ female.glb', description: 'Alternative elite agent' },
  { id: 'female_01', label: 'Field Specialist', gender: 'female', glbPath: '/models/agent/agent_ female01.glb', description: 'Field specialist' },
  { id: 'special_wolfman', label: 'Wolfman', gender: 'any', glbPath: '/models/agent/agent_wolfman.glb', description: 'Special creature agent' },
  { id: 'special_agent', label: 'Special Ops', gender: 'any', glbPath: '/models/agent/special_agent.glb', description: 'Special operations unit' },
];

export function getModelsByGender(gender: AgentGender): AgentModelConfig[] {
  return AGENT_MODELS.filter(m => m.gender === gender || m.gender === 'any');
}

export function getDefaultModel(gender: AgentGender): AgentModelConfig {
  const defaultId = gender === 'male' ? 'male_default' : 'female_default';
  return AGENT_MODELS.find(m => m.id === defaultId) || AGENT_MODELS[0];
}

export function getModelById(id: AgentModelId): AgentModelConfig | undefined {
  return AGENT_MODELS.find(m => m.id === id);
}

// ============================================
// OUTFIT TYPES
// ============================================

export type AgentOutfitCategory = 'armor' | 'pants' | 'shirt' | 'dress';
export type OutfitRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface AgentOutfitConfig {
  id: string;
  label: string;
  category: AgentOutfitCategory;
  glbPath: string;
  rarity: OutfitRarity;
  gender: AgentGender | 'any';
  price: number;
}

// ============================================
// ARMOR CATALOG - 34 Items
// ============================================

const ARMOR_OUTFITS: AgentOutfitConfig[] = [
  { id: 'armor_arkthzand', label: 'Arkthzand Medium Armor', category: 'armor', glbPath: '/models/agent/armor/arkthzand_medium_armor.glb', rarity: 'rare', gender: 'any', price: 500 },
  { id: 'armor_set', label: 'Tactical Armor Set', category: 'armor', glbPath: '/models/agent/armor/armor_set.glb', rarity: 'epic', gender: 'any', price: 1500 },
  { id: 'armor_warrior_game', label: 'Armored Warrior', category: 'armor', glbPath: '/models/agent/armor/armored_warrior_-_game_asset.glb', rarity: 'epic', gender: 'any', price: 1500 },
  { id: 'armor_artorias', label: 'Artorias Armor', category: 'armor', glbPath: '/models/agent/armor/artorias_armor.glb', rarity: 'legendary', gender: 'any', price: 5000 },
  { id: 'armor_artorias_alt', label: 'Artorias Classic', category: 'armor', glbPath: '/models/agent/armor/artorias.glb', rarity: 'legendary', gender: 'any', price: 5000 },
  { id: 'armor_boots_artemis', label: 'Artemis Combat Boots', category: 'armor', glbPath: '/models/agent/armor/boots_artemis_-_character_clothing_free.glb', rarity: 'common', gender: 'any', price: 100 },
  { id: 'armor_boots_artemis_alt', label: 'Artemis Boots', category: 'armor', glbPath: '/models/agent/armor/boots_artemis.glb', rarity: 'common', gender: 'any', price: 100 },
  { id: 'armor_female', label: 'Female Combat Armor', category: 'armor', glbPath: '/models/agent/armor/female_armour.glb', rarity: 'epic', gender: 'female', price: 1500 },
  { id: 'armor_female2', label: 'Elite Female Armor', category: 'armor', glbPath: '/models/agent/armor/female_armour2.glb', rarity: 'epic', gender: 'female', price: 1500 },
  { id: 'armor_royal_guard_f', label: 'Royal Guard Armor', category: 'armor', glbPath: '/models/agent/armor/female_royal_guard.glb', rarity: 'legendary', gender: 'female', price: 5000 },
  { id: 'armor_free_female_1', label: 'Free Female Armor 1', category: 'armor', glbPath: '/models/agent/armor/free_-_female_armour_-_game_ready_-__2.glb', rarity: 'common', gender: 'female', price: 100 },
  { id: 'armor_free_female_2', label: 'Free Female Armor 2', category: 'armor', glbPath: '/models/agent/armor/free_-_female_armour_-_game_ready.glb', rarity: 'common', gender: 'female', price: 100 },
  { id: 'armor_free_male_3', label: 'Free Male Armor 3', category: 'armor', glbPath: '/models/agent/armor/free_-_male_armour_-_3_-_game_ready.glb', rarity: 'common', gender: 'male', price: 100 },
  { id: 'armor_free_male_4', label: 'Free Male Armor 4', category: 'armor', glbPath: '/models/agent/armor/free_-_male_armour_-4-_game_ready.glb', rarity: 'common', gender: 'male', price: 100 },
  { id: 'armor_free_female_game', label: 'Female Armor Game', category: 'armor', glbPath: '/models/agent/armor/free_female_armor__game.glb', rarity: 'rare', gender: 'female', price: 500 },
  { id: 'armor_futuristic_cargo', label: 'Futuristic Apocalypse Cargo', category: 'armor', glbPath: '/models/agent/armor/futuristic_apocalypse_female_cargo_pants.glb', rarity: 'epic', gender: 'female', price: 1500 },
  { id: 'armor_lion', label: 'Lion Armor', category: 'armor', glbPath: '/models/agent/armor/lion_armor.glb', rarity: 'legendary', gender: 'any', price: 5000 },
  { id: 'armor_male', label: 'Male Combat Armor', category: 'armor', glbPath: '/models/agent/armor/male_armour.glb', rarity: 'epic', gender: 'male', price: 1500 },
  { id: 'armor_male2', label: 'Elite Male Armor', category: 'armor', glbPath: '/models/agent/armor/male_armour2.glb', rarity: 'epic', gender: 'male', price: 1500 },
  { id: 'armor_man_clothed', label: 'Man With Clothing', category: 'armor', glbPath: '/models/agent/armor/man_1_with_clothing_rigged_skeleton.glb', rarity: 'rare', gender: 'male', price: 500 },
  { id: 'armor_medium', label: 'Medium Armor', category: 'armor', glbPath: '/models/agent/armor/medium_armor.glb', rarity: 'rare', gender: 'any', price: 500 },
  { id: 'armor_power_wolf', label: 'Power Armor Wolf', category: 'armor', glbPath: '/models/agent/armor/power_armor_-_wolf._new_ordercolossus.glb', rarity: 'legendary', gender: 'any', price: 5000 },
  { id: 'armor_procedural_2', label: 'Procedural Armor 2.0', category: 'armor', glbPath: '/models/agent/armor/procedural_armor_2.0_test_2.glb', rarity: 'epic', gender: 'any', price: 1500 },
  { id: 'armor_procedural_3', label: 'Procedural Armor 3.0', category: 'armor', glbPath: '/models/agent/armor/procedural_armor_2.0_test_3.glb', rarity: 'epic', gender: 'any', price: 1500 },
  { id: 'armor_procedural_4', label: 'Procedural Armor 4.0', category: 'armor', glbPath: '/models/agent/armor/procedural_armor_2.0_test_4.glb', rarity: 'epic', gender: 'any', price: 1500 },
  { id: 'armor_procedural_5', label: 'Procedural Armor 5.0', category: 'armor', glbPath: '/models/agent/armor/procedural_armor_2.0_test_5.glb', rarity: 'epic', gender: 'any', price: 1500 },
  { id: 'armor_procedural_6', label: 'Procedural Armor 6.0', category: 'armor', glbPath: '/models/agent/armor/procedural_armor_2.0_test_6.glb', rarity: 'epic', gender: 'any', price: 1500 },
  { id: 'armor_procedural_scifi', label: 'Procedural Sci-Fi Armor', category: 'armor', glbPath: '/models/agent/armor/procedural_female_scifi_armor_test_3.glb', rarity: 'legendary', gender: 'female', price: 5000 },
  { id: 'armor_royal_guard', label: 'Royal Guard', category: 'armor', glbPath: '/models/agent/armor/royal_guard.glb', rarity: 'legendary', gender: 'any', price: 5000 },
  { id: 'armor_scifi_clothing', label: 'Sci-Fi Armor Clothing', category: 'armor', glbPath: '/models/agent/armor/sci-fi_armor_clothing.glb', rarity: 'epic', gender: 'any', price: 1500 },
  { id: 'armor_scifi', label: 'Sci-Fi Armor', category: 'armor', glbPath: '/models/agent/armor/sci-fi_armor.glb', rarity: 'epic', gender: 'any', price: 1500 },
  { id: 'armor_t60_power', label: 'T-60 Power Armor', category: 'armor', glbPath: '/models/agent/armor/t-60_power_armorfortnite (1).glb', rarity: 'legendary', gender: 'any', price: 5000 },
  { id: 'armor_titan_drillman', label: 'Titan Drillman', category: 'armor', glbPath: '/models/agent/armor/titan_drillman_3.0_body.glb', rarity: 'legendary', gender: 'any', price: 5000 },
  { id: 'armor_warrior', label: 'Warrior Armor', category: 'armor', glbPath: '/models/agent/armor/warrior.glb', rarity: 'legendary', gender: 'any', price: 5000 },
];

// ============================================
// PANTS CATALOG - 20 Items
// ============================================

const PANTS_OUTFITS: AgentOutfitConfig[] = [
  { id: 'pants_blue_jeans_full', label: 'Blue Jeans Pants', category: 'pants', glbPath: '/models/agent/pants/blue_jeans_pants.glb', rarity: 'common', gender: 'any', price: 100 },
  { id: 'pants_blue_jeans', label: 'Blue Jeans', category: 'pants', glbPath: '/models/agent/pants/blue_jeans.glb', rarity: 'common', gender: 'any', price: 100 },
  { id: 'pants_cargo', label: 'Cargo Pants', category: 'pants', glbPath: '/models/agent/pants/cargo.glb', rarity: 'common', gender: 'any', price: 100 },
  { id: 'pants_clothes', label: 'Clothes Pants', category: 'pants', glbPath: '/models/agent/pants/clothes_pants.glb', rarity: 'common', gender: 'any', price: 100 },
  { id: 'pants_clothing', label: 'Clothing Pants', category: 'pants', glbPath: '/models/agent/pants/clothing_pants.glb', rarity: 'common', gender: 'any', price: 100 },
  { id: 'pants_denim', label: 'Denim Jeans', category: 'pants', glbPath: '/models/agent/pants/denim.glb', rarity: 'common', gender: 'any', price: 100 },
  { id: 'pants_utility_scarf', label: 'Utility Scarf Pants', category: 'pants', glbPath: '/models/agent/pants/embroidered_utility_scarf_pants__3d_model.glb', rarity: 'rare', gender: 'any', price: 500 },
  { id: 'pants_hoodie_set', label: 'Hoodie & Pants Set', category: 'pants', glbPath: '/models/agent/pants/hoodie_set.glb', rarity: 'rare', gender: 'any', price: 500 },
  { id: 'pants_hoodie_and', label: 'Hoodie and Pants', category: 'pants', glbPath: '/models/agent/pants/hoodieandpants.glb', rarity: 'rare', gender: 'any', price: 500 },
  { id: 'pants_jeans_denim', label: 'Jeans Denim Pants', category: 'pants', glbPath: '/models/agent/pants/jeans_denim_pants.glb', rarity: 'common', gender: 'any', price: 100 },
  { id: 'pants_joggers', label: 'Modern Joggers', category: 'pants', glbPath: '/models/agent/pants/joggers.glb', rarity: 'common', gender: 'any', price: 100 },
  { id: 'pants_latex', label: 'Latex Leggings', category: 'pants', glbPath: '/models/agent/pants/latex_leggings.glb', rarity: 'epic', gender: 'female', price: 1500 },
  { id: 'pants_leather_zippers', label: 'Leather Pants Zippers', category: 'pants', glbPath: '/models/agent/pants/leather_pants_with_zippers.glb', rarity: 'epic', gender: 'any', price: 1500 },
  { id: 'pants_leather', label: 'Leather Pants', category: 'pants', glbPath: '/models/agent/pants/leather.glb', rarity: 'epic', gender: 'any', price: 1500 },
  { id: 'pants_modern_joggers', label: 'Modern Pants Joggers', category: 'pants', glbPath: '/models/agent/pants/modern_pants_joggers.glb', rarity: 'rare', gender: 'any', price: 500 },
  { id: 'pants_odin_full', label: 'Odin Pants Full', category: 'pants', glbPath: '/models/agent/pants/odin_pants.glb', rarity: 'epic', gender: 'any', price: 1500 },
  { id: 'pants_odin', label: 'Odin Pants', category: 'pants', glbPath: '/models/agent/pants/odin.glb', rarity: 'epic', gender: 'any', price: 1500 },
  { id: 'pants_baked', label: 'Pants Baked', category: 'pants', glbPath: '/models/agent/pants/pants_baked_ver.glb', rarity: 'rare', gender: 'any', price: 500 },
  { id: 'pants_basic', label: 'Basic Pants', category: 'pants', glbPath: '/models/agent/pants/pants.glb', rarity: 'common', gender: 'any', price: 100 },
  { id: 'pants_tactical', label: 'Tactical Pants', category: 'pants', glbPath: '/models/agent/pants/tactical.glb', rarity: 'rare', gender: 'any', price: 500 },
];

// ============================================
// SHIRT CATALOG - 28 Items
// ============================================

const SHIRT_OUTFITS: AgentOutfitConfig[] = [
  { id: 'shirt_red_arrow', label: 'Arsenal Red Arrow Jacket', category: 'shirt', glbPath: '/models/agent/shirt/arsenal__red_arrow_jacket.glb', rarity: 'legendary', gender: 'any', price: 5000 },
  { id: 'shirt_beige_business', label: 'Beige Business Suit', category: 'shirt', glbPath: '/models/agent/shirt/beige_business_suit_with_short_skirt.glb', rarity: 'epic', gender: 'female', price: 1500 },
  { id: 'shirt_black_sleeveless', label: 'Black Sleeveless Cotton', category: 'shirt', glbPath: '/models/agent/shirt/black_sleeveless_cotton_dress_with_chain.glb', rarity: 'rare', gender: 'female', price: 500 },
  { id: 'shirt_body_suit_clothing', label: 'Body Suit Clothing', category: 'shirt', glbPath: '/models/agent/shirt/body_suit_-_clothing.glb', rarity: 'rare', gender: 'any', price: 500 },
  { id: 'shirt_body_suit', label: 'Body Suit', category: 'shirt', glbPath: '/models/agent/shirt/body_suit.glb', rarity: 'rare', gender: 'any', price: 500 },
  { id: 'shirt_jacket_copia', label: 'Clothing Jacket Alt', category: 'shirt', glbPath: '/models/agent/shirt/clothing_jacket copia.glb', rarity: 'rare', gender: 'any', price: 500 },
  { id: 'shirt_jacket', label: 'Clothing Jacket', category: 'shirt', glbPath: '/models/agent/shirt/clothing_jacket.glb', rarity: 'rare', gender: 'any', price: 500 },
  { id: 'shirt_practice', label: 'Clothing Practice', category: 'shirt', glbPath: '/models/agent/shirt/clothing_practice.glb', rarity: 'common', gender: 'any', price: 100 },
  { id: 'shirt_sports_jacket', label: 'Sports Jacket', category: 'shirt', glbPath: '/models/agent/shirt/clothing_sculpt_-_sports_jacket.glb', rarity: 'epic', gender: 'any', price: 1500 },
  { id: 'shirt_first_clothing', label: 'First Clothing Item', category: 'shirt', glbPath: '/models/agent/shirt/first_clothing_item.glb', rarity: 'common', gender: 'any', price: 100 },
  { id: 'shirt_first_item', label: 'Field Shirt', category: 'shirt', glbPath: '/models/agent/shirt/first_item.glb', rarity: 'common', gender: 'any', price: 100 },
  { id: 'shirt_tactical_jacket', label: 'Tactical Jacket', category: 'shirt', glbPath: '/models/agent/shirt/jacket.glb', rarity: 'rare', gender: 'any', price: 500 },
  { id: 'shirt_leather_jacket_alt', label: 'Leather Jacket Alt', category: 'shirt', glbPath: '/models/agent/shirt/leather_jacket copia.glb', rarity: 'epic', gender: 'any', price: 1500 },
  { id: 'shirt_leather_jacket', label: 'Leather Jacket', category: 'shirt', glbPath: '/models/agent/shirt/leather_jacket.glb', rarity: 'epic', gender: 'any', price: 1500 },
  { id: 'shirt_lab_coat', label: 'Lab Coat and Pants', category: 'shirt', glbPath: '/models/agent/shirt/male_lab_coat_and_pants.glb', rarity: 'rare', gender: 'male', price: 500 },
  { id: 'shirt_denim_jacket', label: 'Modern Denim Jacket', category: 'shirt', glbPath: '/models/agent/shirt/modern_denim_jacket.glb', rarity: 'rare', gender: 'any', price: 500 },
  { id: 'shirt_oversized_tshirt', label: 'Oversized T-Shirt', category: 'shirt', glbPath: '/models/agent/shirt/oversized_t-shirt.glb', rarity: 'common', gender: 'any', price: 100 },
  { id: 'shirt_pink_hoodie', label: 'Pink Drawstring Hoodie', category: 'shirt', glbPath: '/models/agent/shirt/pink_drawstring_hooded_sweatshirt.glb', rarity: 'rare', gender: 'any', price: 500 },
  { id: 'shirt_practice_alt', label: 'Training Shirt', category: 'shirt', glbPath: '/models/agent/shirt/practice.glb', rarity: 'common', gender: 'any', price: 100 },
  { id: 'shirt_red_arrow_alt', label: 'Red Arrow Jacket', category: 'shirt', glbPath: '/models/agent/shirt/red_arrow.glb', rarity: 'legendary', gender: 'any', price: 5000 },
  { id: 'shirt_sculpted_jacket', label: 'Sculpted Jacket', category: 'shirt', glbPath: '/models/agent/shirt/sculpted_jacket.glb', rarity: 'epic', gender: 'any', price: 1500 },
  { id: 'shirt_sweater_pack', label: 'Sweater Pack', category: 'shirt', glbPath: '/models/agent/shirt/sweater_pack.glb', rarity: 'rare', gender: 'any', price: 500 },
  { id: 'shirt_sweatshirt_jacket_alt', label: 'Sweatshirt & Jacket Alt', category: 'shirt', glbPath: '/models/agent/shirt/sweatshirt_and_jacket_and_workwear_pants copia.glb', rarity: 'epic', gender: 'any', price: 1500 },
  { id: 'shirt_sweatshirt_jacket', label: 'Sweatshirt & Jacket', category: 'shirt', glbPath: '/models/agent/shirt/sweatshirt_and_jacket_and_workwear_pants.glb', rarity: 'epic', gender: 'any', price: 1500 },
  { id: 'shirt_tshirt_female', label: 'T-Shirt Female', category: 'shirt', glbPath: '/models/agent/shirt/t-shirt_for_female.glb', rarity: 'common', gender: 'female', price: 100 },
  { id: 'shirt_urban_hoodie', label: 'Urban Streetwear Hoodie', category: 'shirt', glbPath: '/models/agent/shirt/urban_streetwear_hoodie__3d_clothing.glb', rarity: 'epic', gender: 'any', price: 1500 },
  { id: 'shirt_white_leather', label: 'White Shirt Black Leather', category: 'shirt', glbPath: '/models/agent/shirt/white_shirt_black_leather_skirt_outfit.glb', rarity: 'epic', gender: 'female', price: 1500 },
  { id: 'shirt_xd_hoodie', label: 'XD Hoodie Full Outfit', category: 'shirt', glbPath: '/models/agent/shirt/xd_hoodie_-_full_outfit.glb', rarity: 'rare', gender: 'any', price: 500 },
];

// ============================================
// DRESS/FULL OUTFIT CATALOG - 47 Items
// ============================================

const DRESS_OUTFITS: AgentOutfitConfig[] = [
  { id: 'dress_waistcoat', label: 'Fashionable Waistcoat', category: 'dress', glbPath: '/models/agent/dress/a_fashionable_waistcoat.glb', rarity: 'rare', gender: 'any', price: 500 },
  { id: 'dress_black', label: 'Black Dress', category: 'dress', glbPath: '/models/agent/dress/black_dress.glb', rarity: 'common', gender: 'female', price: 100 },
  { id: 'dress_black_simple', label: 'Black Simple Outfit', category: 'dress', glbPath: '/models/agent/dress/black_simple_outfit.glb', rarity: 'common', gender: 'any', price: 100 },
  { id: 'dress_chinese_clothing', label: 'Chinese Clothing', category: 'dress', glbPath: '/models/agent/dress/chinese_clothing.glb', rarity: 'rare', gender: 'any', price: 500 },
  { id: 'dress_chinese', label: 'Chinese Outfit', category: 'dress', glbPath: '/models/agent/dress/chinese.glb', rarity: 'rare', gender: 'any', price: 500 },
  { id: 'dress_practice_md', label: 'Practice Outfit MD', category: 'dress', glbPath: '/models/agent/dress/cloth_practice_md.glb', rarity: 'common', gender: 'any', price: 100 },
  { id: 'dress_clothing', label: 'Clothing', category: 'dress', glbPath: '/models/agent/dress/clothing.glb', rarity: 'common', gender: 'any', price: 100 },
  { id: 'dress_corrupted_hoodie_pants', label: 'Corrupted Hoodie & Pants', category: 'dress', glbPath: '/models/agent/dress/corrupted_hoodie_and_pants.glb', rarity: 'epic', gender: 'any', price: 1500 },
  { id: 'dress_corrupted_hoodie', label: 'Corrupted Hoodie Set', category: 'dress', glbPath: '/models/agent/dress/corrupted_hoodie.glb', rarity: 'epic', gender: 'any', price: 1500 },
  { id: 'dress_cyber_cop', label: 'Cyber Cop Clothing Set', category: 'dress', glbPath: '/models/agent/dress/cyber_cop_clothing_set.glb', rarity: 'epic', gender: 'any', price: 1500 },
  { id: 'dress_cyber_pop', label: 'Cyber Pop', category: 'dress', glbPath: '/models/agent/dress/cyber_pop.glb', rarity: 'epic', gender: 'any', price: 1500 },
  { id: 'dress_cyber_pop_low', label: 'Cyber Pop Low Poly', category: 'dress', glbPath: '/models/agent/dress/cyber-pop_low_poly.glb', rarity: 'rare', gender: 'any', price: 500 },
  { id: 'dress_cyberpunk_suit', label: 'Cyberpunk Suit', category: 'dress', glbPath: '/models/agent/dress/cyberpunk_suit.glb', rarity: 'legendary', gender: 'any', price: 5000 },
  { id: 'dress_cyberpunk', label: 'Cyberpunk', category: 'dress', glbPath: '/models/agent/dress/cyberpunk.glb', rarity: 'epic', gender: 'any', price: 1500 },
  { id: 'dress_overalls', label: 'Distressed Overalls', category: 'dress', glbPath: '/models/agent/dress/distressed_overalls.glb', rarity: 'rare', gender: 'any', price: 500 },
  { id: 'dress_plague_doctor', label: 'Plague Doctor Costume', category: 'dress', glbPath: '/models/agent/dress/doctor_plague_costume_disguise_outfit_clothing_2.glb', rarity: 'legendary', gender: 'any', price: 5000 },
  { id: 'dress_dragon_newyear', label: 'Dragon New Year Suit', category: 'dress', glbPath: '/models/agent/dress/dragon_new_year-suit-01.glb', rarity: 'legendary', gender: 'any', price: 5000 },
  { id: 'dress_elegant_set', label: 'Elegant Clothing Set', category: 'dress', glbPath: '/models/agent/dress/elegant_clothing_set__waistcoat_shirt__pants.glb', rarity: 'epic', gender: 'any', price: 1500 },
  { id: 'dress_fantasy_female', label: 'Fantasy Cloth Female', category: 'dress', glbPath: '/models/agent/dress/free_female_fantasy_cloth.glb', rarity: 'epic', gender: 'female', price: 1500 },
  { id: 'dress_gilded_scifi', label: 'Gilded Sci-Fi Top & Pants', category: 'dress', glbPath: '/models/agent/dress/full_outfit_-_gilded_sci-fi_top__pants.glb', rarity: 'legendary', gender: 'any', price: 5000 },
  { id: 'dress_sweater_hoodie', label: 'Sweater Hoodie Pants', category: 'dress', glbPath: '/models/agent/dress/full_outfit_-_sweater__hoodie__pants.glb', rarity: 'epic', gender: 'any', price: 1500 },
  { id: 'dress_holtoniii', label: 'Holtoniii Harry Clothing', category: 'dress', glbPath: '/models/agent/dress/holtoniii_harry_clothing.glb', rarity: 'rare', gender: 'any', price: 500 },
  { id: 'dress_hoodie', label: 'Hoodie', category: 'dress', glbPath: '/models/agent/dress/hoodie.glb', rarity: 'common', gender: 'any', price: 100 },
  { id: 'dress_jin_roh', label: 'Jin Roh', category: 'dress', glbPath: '/models/agent/dress/jin_roh.glb', rarity: 'legendary', gender: 'any', price: 5000 },
  { id: 'dress_layton', label: 'Layton Paul Clothing', category: 'dress', glbPath: '/models/agent/dress/layton_paul_clothing.glb', rarity: 'rare', gender: 'any', price: 500 },
  { id: 'dress_yoga_outfit', label: 'Light Blue Yoga Outfit', category: 'dress', glbPath: '/models/agent/dress/light_blue_floral_tight-fit_yoga_outfit.glb', rarity: 'rare', gender: 'female', price: 500 },
  { id: 'dress_lost_ark', label: 'Lost Ark Ninave Cloth', category: 'dress', glbPath: '/models/agent/dress/lost_ark_ninave_cloth.glb', rarity: 'epic', gender: 'any', price: 1500 },
  { id: 'dress_jumpsuit', label: 'Low Poly Jumpsuit', category: 'dress', glbPath: '/models/agent/dress/low_poly_jumpsuit.glb', rarity: 'common', gender: 'any', price: 100 },
  { id: 'dress_black_business', label: 'Man Black Business Suit', category: 'dress', glbPath: '/models/agent/dress/man_black_business_suit.glb', rarity: 'epic', gender: 'male', price: 1500 },
  { id: 'dress_marty_mcfly', label: 'Marty McFly Clothes', category: 'dress', glbPath: '/models/agent/dress/marty_mcfly_clothes.glb', rarity: 'legendary', gender: 'male', price: 5000 },
  { id: 'dress_mens_game', label: 'Mens Clothing for Game', category: 'dress', glbPath: '/models/agent/dress/mens_clothing_for_game.glb', rarity: 'rare', gender: 'male', price: 500 },
  { id: 'dress_mens', label: 'Mens Clothing', category: 'dress', glbPath: '/models/agent/dress/mens_clothing.glb', rarity: 'rare', gender: 'male', price: 500 },
  { id: 'dress_military_post', label: 'Military Post-Apocalypse', category: 'dress', glbPath: '/models/agent/dress/military_clothingpost-apocalypse.download.glb', rarity: 'epic', gender: 'any', price: 1500 },
  { id: 'dress_overalls_alt', label: 'Overalls', category: 'dress', glbPath: '/models/agent/dress/overalls.glb', rarity: 'rare', gender: 'any', price: 500 },
  { id: 'dress_practice', label: 'Practice Outfit', category: 'dress', glbPath: '/models/agent/dress/practice.glb', rarity: 'common', gender: 'any', price: 100 },
  { id: 'dress_rusticated', label: 'Rusticated Clothing', category: 'dress', glbPath: '/models/agent/dress/rusticated_clothing.glb', rarity: 'rare', gender: 'any', price: 500 },
  { id: 'dress_shoes', label: 'Shoes Clothing', category: 'dress', glbPath: '/models/agent/dress/shoes_-_clothing.glb', rarity: 'common', gender: 'any', price: 100 },
  { id: 'dress_simple_black', label: 'Simple Black Outfit', category: 'dress', glbPath: '/models/agent/dress/simple_black.glb', rarity: 'rare', gender: 'any', price: 500 },
  { id: 'dress_bunny', label: 'Tough Bunny Clothing Set', category: 'dress', glbPath: '/models/agent/dress/tough_bunny_clothing_set.glb', rarity: 'epic', gender: 'any', price: 1500 },
  { id: 'dress_trench_wear_2', label: 'Trench Wear 2', category: 'dress', glbPath: '/models/agent/dress/trench_wear copia 2.glb', rarity: 'epic', gender: 'any', price: 1500 },
  { id: 'dress_trench_wear_alt', label: 'Trench Wear Alt', category: 'dress', glbPath: '/models/agent/dress/trench_wear copia.glb', rarity: 'epic', gender: 'any', price: 1500 },
  { id: 'dress_trench_wear', label: 'Trench Wear', category: 'dress', glbPath: '/models/agent/dress/trench_wear.glb', rarity: 'epic', gender: 'any', price: 1500 },
  { id: 'dress_turtle_peacoat', label: 'Turtle Neck and Peacoat', category: 'dress', glbPath: '/models/agent/dress/turtle_neck_and_peacoat.glb', rarity: 'epic', gender: 'any', price: 1500 },
  { id: 'dress_turtle_neck', label: 'Turtle Neck', category: 'dress', glbPath: '/models/agent/dress/turtle_neck.glb', rarity: 'rare', gender: 'any', price: 500 },
  { id: 'dress_utsm', label: 'UTSM Body Part', category: 'dress', glbPath: '/models/agent/dress/utsm_3.0_body_part.glb', rarity: 'rare', gender: 'any', price: 500 },
  { id: 'dress_waistcoat_alt', label: 'Waistcoat', category: 'dress', glbPath: '/models/agent/dress/waistcoat.glb', rarity: 'rare', gender: 'any', price: 500 },
  { id: 'dress_whitson', label: 'Whitson Jesse Clothing', category: 'dress', glbPath: '/models/agent/dress/whitson_jesse_clothing.glb', rarity: 'rare', gender: 'any', price: 500 },
];

// ============================================
// COMBINED OUTFIT CATALOG - 129 Total Items
// ============================================

export const AGENT_OUTFITS: AgentOutfitConfig[] = [
  ...ARMOR_OUTFITS,
  ...PANTS_OUTFITS,
  ...SHIRT_OUTFITS,
  ...DRESS_OUTFITS,
];

// ============================================
// OUTFIT HELPERS
// ============================================

export function getOutfitsByCategory(category: AgentOutfitCategory): AgentOutfitConfig[] {
  return AGENT_OUTFITS.filter(o => o.category === category);
}

export function getOutfitsByGender(gender: AgentGender): AgentOutfitConfig[] {
  return AGENT_OUTFITS.filter(o => o.gender === gender || o.gender === 'any');
}

export function getOutfitById(id: string): AgentOutfitConfig | undefined {
  return AGENT_OUTFITS.find(o => o.id === id);
}

// Rarity colors for UI
export const RARITY_COLORS: Record<OutfitRarity, { bg: string; border: string; text: string }> = {
  common: { bg: 'from-gray-500/20 to-gray-600/20', border: 'border-gray-500/40', text: 'text-gray-400' },
  rare: { bg: 'from-blue-500/20 to-blue-600/20', border: 'border-blue-500/40', text: 'text-blue-400' },
  epic: { bg: 'from-purple-500/20 to-purple-600/20', border: 'border-purple-500/40', text: 'text-purple-400' },
  legendary: { bg: 'from-yellow-500/20 to-orange-500/20', border: 'border-yellow-500/40', text: 'text-yellow-400' },
};

// Category labels for UI
export const CATEGORY_LABELS: Record<AgentOutfitCategory, string> = {
  armor: 'Armor',
  pants: 'Pants',
  shirt: 'Shirts & Jackets',
  dress: 'Full Outfits',
};

// ============================================
// AGENT CUSTOMIZATION STATE TYPE
// ============================================

export interface AgentCustomization {
  modelId: AgentModelId;
  skinToneId: SkinToneId;
  equippedOutfits: string[];
}

export const DEFAULT_CUSTOMIZATION: AgentCustomization = {
  modelId: 'male_default',
  skinToneId: 'skin_medium',
  equippedOutfits: [],
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
