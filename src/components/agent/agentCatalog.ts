/**
 * AGENT CATALOG - Configuration for Agent Shop
 * BASE (FREE) / SPECIAL (50 M1U) / PREMIUM (100 M1U)
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

export type AgentCategory = 'BASE' | 'SPECIAL' | 'PREMIUM';
export type AgentRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';
export type AgentGender = 'MALE' | 'FEMALE' | 'ANY';

export interface AgentDefinition {
  id: string;
  name: string;
  category: AgentCategory;
  priceM1U: number;
  glbPath: string;
  gender: AgentGender;
  rarity: AgentRarity;
  description?: string;
}

// ============================================
// BASE AGENTS - FREE (8 agents)
// ============================================

const BASE_AGENTS: AgentDefinition[] = [
  { id: 'base_male_default', name: 'M1 Field Operative', category: 'BASE', priceM1U: 0, glbPath: '/models/agent/agent_male.glb', gender: 'MALE', rarity: 'Common', description: 'Standard field agent' },
  { id: 'base_male_alt', name: 'M1 Field Alt', category: 'BASE', priceM1U: 0, glbPath: '/models/agent/agent_ male.glb', gender: 'MALE', rarity: 'Common', description: 'Alternative field agent' },
  { id: 'base_male_02', name: 'Shadow Operative', category: 'BASE', priceM1U: 0, glbPath: '/models/agent/agent_male02.glb', gender: 'MALE', rarity: 'Common', description: 'Stealth specialist' },
  { id: 'base_male_03', name: 'Tactical Agent', category: 'BASE', priceM1U: 0, glbPath: '/models/agent/agent_male03.glb', gender: 'MALE', rarity: 'Common', description: 'Field tactical unit' },
  { id: 'base_female_default', name: 'M1 Elite Operative', category: 'BASE', priceM1U: 0, glbPath: '/models/agent/agent_female01.glb', gender: 'FEMALE', rarity: 'Common', description: 'Elite field agent' },
  { id: 'base_female_alt', name: 'M1 Elite Alt', category: 'BASE', priceM1U: 0, glbPath: '/models/agent/agent_ female.glb', gender: 'FEMALE', rarity: 'Common', description: 'Alternative elite agent' },
  { id: 'base_wolfman', name: 'Wolfman', category: 'BASE', priceM1U: 0, glbPath: '/models/agent/agent_wolfman.glb', gender: 'ANY', rarity: 'Rare', description: 'Special creature agent' },
  { id: 'base_special', name: 'Special Ops', category: 'BASE', priceM1U: 0, glbPath: '/models/agent/special_agent.glb', gender: 'ANY', rarity: 'Rare', description: 'Special operations unit' },
];

// ============================================
// SPECIAL AGENTS - 50 M1U (16 agents)
// ============================================

const SPECIAL_AGENTS: AgentDefinition[] = [
  { id: 'special_scifi_armor_1', name: 'Sci-Fi Armor MK1', category: 'SPECIAL', priceM1U: 50, glbPath: '/models/agent/special/3d_trellis_ai-_scifi_armor_test_1.glb', gender: 'ANY', rarity: 'Rare' },
  { id: 'special_scifi_armor_2', name: 'Sci-Fi Armor MK2', category: 'SPECIAL', priceM1U: 50, glbPath: '/models/agent/special/3d_trellis_ai-_scifi_armor_test_2.glb', gender: 'ANY', rarity: 'Rare' },
  { id: 'special_scifi_armor_3', name: 'Sci-Fi Armor MK3', category: 'SPECIAL', priceM1U: 50, glbPath: '/models/agent/special/3d_trellis_ai-_scifi_armor_test_3.glb', gender: 'ANY', rarity: 'Epic' },
  { id: 'special_scifi_armor_4', name: 'Sci-Fi Armor MK4', category: 'SPECIAL', priceM1U: 50, glbPath: '/models/agent/special/3d_trellis_ai-_scifi_armor_test_4.glb', gender: 'ANY', rarity: 'Epic' },
  { id: 'special_scifi_armor_5', name: 'Sci-Fi Armor MK5', category: 'SPECIAL', priceM1U: 50, glbPath: '/models/agent/special/3d_trellis_ai-_scifi_armor_test_5.glb', gender: 'ANY', rarity: 'Epic' },
  { id: 'special_mechatron', name: 'Mechatron Soldier', category: 'SPECIAL', priceM1U: 50, glbPath: '/models/agent/special/bulletstorm_-_final_echo_mechatron_soldier.glb', gender: 'ANY', rarity: 'Epic' },
  { id: 'special_grayson', name: 'Grayson Hunt Space Pirate', category: 'SPECIAL', priceM1U: 50, glbPath: '/models/agent/special/bulletstorm_-_grayson_hunt_space_pirate.glb', gender: 'MALE', rarity: 'Epic' },
  { id: 'special_automaton', name: 'Heavy Echo Automaton', category: 'SPECIAL', priceM1U: 50, glbPath: '/models/agent/special/bulletstorm_-_heavy_echo_automaton_variant.glb', gender: 'ANY', rarity: 'Epic' },
  { id: 'special_shocktrooper', name: 'Elite Shocktrooper', category: 'SPECIAL', priceM1U: 50, glbPath: '/models/agent/special/bulletstorm_-_heavy_echo_elite_shocktroopers.glb', gender: 'ANY', rarity: 'Epic' },
  { id: 'special_cyber_marshal', name: 'Cyber Marshal', category: 'SPECIAL', priceM1U: 50, glbPath: '/models/agent/special/cyber_marshal.glb', gender: 'ANY', rarity: 'Epic' },
  { id: 'special_cyberpunk_hero', name: 'Cyberpunk Hero', category: 'SPECIAL', priceM1U: 50, glbPath: '/models/agent/special/cyberpunk_hero copia.glb', gender: 'ANY', rarity: 'Epic' },
  { id: 'special_ultron_s5', name: 'Ultron Season 5', category: 'SPECIAL', priceM1U: 50, glbPath: '/models/agent/special/ultron_-_season_5.glb', gender: 'ANY', rarity: 'Legendary' },
  { id: 'special_ultron_s5_alt', name: 'Ultron Season 5 Alt', category: 'SPECIAL', priceM1U: 50, glbPath: '/models/agent/special/ultron_-_season_5 copia.glb', gender: 'ANY', rarity: 'Legendary' },
  { id: 'special_ultron_wasteland', name: 'Ultron Wasteland', category: 'SPECIAL', priceM1U: 50, glbPath: '/models/agent/special/ultron_-_wasteland_robot.glb', gender: 'ANY', rarity: 'Legendary' },
  { id: 'special_ultron_wasteland_alt', name: 'Ultron Wasteland Alt', category: 'SPECIAL', priceM1U: 50, glbPath: '/models/agent/special/ultron_-_wasteland_robot copia.glb', gender: 'ANY', rarity: 'Legendary' },
  { id: 'special_scifi_armor_3_alt', name: 'Sci-Fi Armor MK3 Alt', category: 'SPECIAL', priceM1U: 50, glbPath: '/models/agent/special/3d_trellis_ai-_scifi_armor_test_3 copia.glb', gender: 'ANY', rarity: 'Epic' },
];

// ============================================
// PREMIUM AGENTS - 100 M1U (22 agents)
// ============================================

const PREMIUM_AGENTS: AgentDefinition[] = [
  { id: 'premium_angela_2099', name: 'Angela 2099', category: 'PREMIUM', priceM1U: 100, glbPath: '/models/agent/premium/angela_-_2099.glb', gender: 'FEMALE', rarity: 'Legendary' },
  { id: 'premium_angela_rivals', name: 'Angela Marvel Rivals', category: 'PREMIUM', priceM1U: 100, glbPath: '/models/agent/premium/angela_-_marvel_rivals.glb', gender: 'FEMALE', rarity: 'Legendary' },
  { id: 'premium_angela_s5', name: 'Angela Season 5', category: 'PREMIUM', priceM1U: 100, glbPath: '/models/agent/premium/angela_-_season_5.glb', gender: 'FEMALE', rarity: 'Legendary' },
  { id: 'premium_android_soldier', name: 'Android Final Echo Soldier', category: 'PREMIUM', priceM1U: 100, glbPath: '/models/agent/premium/bulletstorm_-_android_final_echo_soldier.glb', gender: 'ANY', rarity: 'Epic' },
  { id: 'premium_confederate', name: 'Confederate Soldier', category: 'PREMIUM', priceM1U: 100, glbPath: '/models/agent/premium/bulletstorm_-_confederate_soldier.glb', gender: 'MALE', rarity: 'Epic' },
  { id: 'premium_bio_engineer', name: 'Bio Engineer Soldier', category: 'PREMIUM', priceM1U: 100, glbPath: '/models/agent/premium/bulletstorm_-_final_echo_bio_engineer_soldier.glb', gender: 'ANY', rarity: 'Epic' },
  { id: 'premium_cog_soldier', name: 'COG Soldier', category: 'PREMIUM', priceM1U: 100, glbPath: '/models/agent/premium/bulletstorm_-_final_echo_cog_soldier.glb', gender: 'ANY', rarity: 'Epic' },
  { id: 'premium_cyborg_soldier', name: 'Cyborg Soldier', category: 'PREMIUM', priceM1U: 100, glbPath: '/models/agent/premium/bulletstorm_-_final_echo_cyborg_soldier.glb', gender: 'ANY', rarity: 'Epic' },
  { id: 'premium_elite_soldier', name: 'Elite Soldier', category: 'PREMIUM', priceM1U: 100, glbPath: '/models/agent/premium/bulletstorm_-_final_echo_elite_soldier.glb', gender: 'ANY', rarity: 'Epic' },
  { id: 'premium_masked_cyborg', name: 'Masked Cyborg Soldier', category: 'PREMIUM', priceM1U: 100, glbPath: '/models/agent/premium/bulletstorm_-_final_echo_masked_cyborg_soldier.glb', gender: 'ANY', rarity: 'Legendary' },
  { id: 'premium_cyberpunk_hero', name: 'Cyberpunk Hero Premium', category: 'PREMIUM', priceM1U: 100, glbPath: '/models/agent/premium/cyberpunk_hero.glb', gender: 'ANY', rarity: 'Legendary' },
  { id: 'premium_cyborg_mutant', name: 'Cyborg Mutant', category: 'PREMIUM', priceM1U: 100, glbPath: '/models/agent/premium/cyborg_mutant.glb', gender: 'ANY', rarity: 'Legendary' },
  { id: 'premium_cybernet_warrior', name: 'Cybernet Warrior', category: 'PREMIUM', priceM1U: 100, glbPath: '/models/agent/premium/futuristic_cybernet_warrior_high_detail_sci_fi.glb', gender: 'ANY', rarity: 'Legendary' },
  { id: 'premium_meshy_armor', name: 'Meshy AI Armor', category: 'PREMIUM', priceM1U: 100, glbPath: '/models/agent/premium/meshy_ai_generated_scifi_armor_test_1.glb', gender: 'ANY', rarity: 'Epic' },
  { id: 'premium_moon_knight', name: 'Moon Knight Mech', category: 'PREMIUM', priceM1U: 100, glbPath: '/models/agent/premium/moon_knight_mech.glb', gender: 'MALE', rarity: 'Legendary' },
  { id: 'premium_pale_knight', name: 'Pale Knight Animated', category: 'PREMIUM', priceM1U: 100, glbPath: '/models/agent/premium/pale_knight_animated.glb', gender: 'ANY', rarity: 'Legendary' },
  { id: 'premium_scifi_operative', name: 'Sci-Fi Operative', category: 'PREMIUM', priceM1U: 100, glbPath: '/models/agent/premium/player_character_scifi_operative.glb', gender: 'ANY', rarity: 'Epic' },
  { id: 'premium_power_armor', name: 'Power Armor', category: 'PREMIUM', priceM1U: 100, glbPath: '/models/agent/premium/power_armor.glb', gender: 'ANY', rarity: 'Legendary' },
  { id: 'premium_rodin_armor', name: 'Rodin AI Armor', category: 'PREMIUM', priceM1U: 100, glbPath: '/models/agent/premium/rodin_ai_generated_scifi_armor_test_1.glb', gender: 'ANY', rarity: 'Epic' },
  { id: 'premium_scifi_soldier', name: 'Sci-Fi Soldier', category: 'PREMIUM', priceM1U: 100, glbPath: '/models/agent/premium/scifi_soldier_character_low-poly.glb', gender: 'ANY', rarity: 'Epic' },
  { id: 'premium_winter_soldier', name: 'Winter Soldier UCM', category: 'PREMIUM', priceM1U: 100, glbPath: '/models/agent/premium/winter_soldier_ucm.glb', gender: 'MALE', rarity: 'Legendary' },
  { id: 'premium_wolverine', name: 'Wolverine Weapon X', category: 'PREMIUM', priceM1U: 100, glbPath: '/models/agent/premium/wolverine_weapon_x.glb', gender: 'MALE', rarity: 'Legendary' },
];

// ============================================
// COMBINED CATALOG
// ============================================

export const AGENT_CATALOG: AgentDefinition[] = [
  ...BASE_AGENTS,
  ...SPECIAL_AGENTS,
  ...PREMIUM_AGENTS,
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getAgentsByCategory(category: AgentCategory): AgentDefinition[] {
  return AGENT_CATALOG.filter(a => a.category === category);
}

export function getAgentById(id: string): AgentDefinition | undefined {
  return AGENT_CATALOG.find(a => a.id === id);
}

export function getDefaultAgent(): AgentDefinition {
  return BASE_AGENTS[0]; // M1 Field Operative
}

// Category styling for UI
export const CATEGORY_STYLES: Record<AgentCategory, { 
  bg: string; 
  border: string; 
  text: string; 
  icon: string;
  gradient: string;
}> = {
  BASE: { 
    bg: 'from-gray-500/20 to-gray-600/20', 
    border: 'border-gray-500/40', 
    text: 'text-gray-400',
    icon: '👤',
    gradient: 'from-gray-500 to-gray-600'
  },
  SPECIAL: { 
    bg: 'from-cyan-500/20 to-blue-500/20', 
    border: 'border-cyan-500/40', 
    text: 'text-cyan-400',
    icon: '⚡',
    gradient: 'from-cyan-500 to-blue-500'
  },
  PREMIUM: { 
    bg: 'from-yellow-500/20 to-orange-500/20', 
    border: 'border-yellow-500/40', 
    text: 'text-yellow-400',
    icon: '👑',
    gradient: 'from-yellow-500 to-orange-500'
  },
};

// Rarity styling for UI
export const RARITY_STYLES: Record<AgentRarity, { bg: string; border: string; text: string }> = {
  Common: { bg: 'from-gray-500/20 to-gray-600/20', border: 'border-gray-500/40', text: 'text-gray-400' },
  Rare: { bg: 'from-blue-500/20 to-blue-600/20', border: 'border-blue-500/40', text: 'text-blue-400' },
  Epic: { bg: 'from-purple-500/20 to-purple-600/20', border: 'border-purple-500/40', text: 'text-purple-400' },
  Legendary: { bg: 'from-yellow-500/20 to-orange-500/20', border: 'border-yellow-500/40', text: 'text-yellow-400' },
};

// Category labels for UI
export const CATEGORY_LABELS: Record<AgentCategory, string> = {
  BASE: 'Agents',
  SPECIAL: 'Special Agents',
  PREMIUM: 'Premium Agents',
};

// Category prices
export const CATEGORY_PRICES: Record<AgentCategory, number> = {
  BASE: 0,
  SPECIAL: 50,
  PREMIUM: 100,
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™




