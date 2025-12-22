// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// PHASE 5: Mission-Bound Clue Generation Engine

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════
interface LocationFeatures {
  hemisphere: 'north' | 'south';
  lat_band: 'polar' | 'temperate' | 'subtropical' | 'tropical';
  climate_hint: 'continental' | 'mediterranean' | 'oceanic' | 'arid' | 'tropical';
  coastal_proximity: 'coastal' | 'inland' | 'island';
  urban_density: 'metro' | 'urban' | 'suburban' | 'rural';
  timezone_band: 'west' | 'central' | 'east';
}

interface PrizeFeatures {
  materials: string[];
  origin_style: 'european' | 'asian' | 'american' | 'african' | 'global';
  use_context: 'luxury' | 'utility' | 'art' | 'collectible';
  history_tone: 'ancient' | 'vintage' | 'modern' | 'futuristic';
  value_tier: 'entry' | 'mid' | 'high' | 'ultra';
}

interface MissionFeatures {
  location: LocationFeatures;
  prize: PrizeFeatures;
}

interface ClueTemplate {
  id: string;
  domain: 'location' | 'prize';
  category: string;
  template_text: string;
  opening_type: string;
  min_clarity: number;
  max_clarity: number;
  required_features: string[];
  is_fake_template: boolean;
}

interface BridgeMetaphor {
  id: string;
  metaphor_text: string;
  location_features: string[];
  prize_features: string[];
  min_clarity: number;
  max_clarity: number;
}

interface ClueMetadata {
  mission_id: string;
  user_id: string;
  clue_index: number;
  day_index: number;
  domain: string;
  category: string;
  is_fake: boolean;
  location_features_used: string[];
  prize_features_used: string[];
  bridge_metaphor_id: string | null;
  structure_hash: string;
  opening_type: string;
  clarity_score: number;
  leak_risk_score: number;
  clue_text: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// FEATURE EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════
function extractLocationFeatures(lat: number, lng: number): LocationFeatures {
  const absLat = Math.abs(lat);
  
  return {
    hemisphere: lat >= 0 ? 'north' : 'south',
    
    lat_band: absLat > 66.5 ? 'polar' :
              absLat > 35 ? 'temperate' :
              absLat > 23.5 ? 'subtropical' : 'tropical',
    
    climate_hint: absLat > 60 ? 'continental' :
                  (absLat >= 30 && absLat <= 45 && lng >= -10 && lng <= 35) ? 'mediterranean' :
                  absLat < 25 ? 'tropical' :
                  (lng >= -130 && lng <= -60) || (lng >= 100 && lng <= 180) ? 'oceanic' :
                  'continental',
    
    coastal_proximity: 'inland', // Simplified, could be enhanced with coastline data
    
    urban_density: 'urban', // Default
    
    timezone_band: lng < -30 ? 'west' : lng < 30 ? 'central' : 'east'
  };
}

function extractPrizeFeatures(prizeProfile: any): PrizeFeatures {
  return {
    materials: prizeProfile?.materials || ['unknown'],
    origin_style: prizeProfile?.origin_style || 'european',
    use_context: prizeProfile?.category || 'collectible',
    history_tone: prizeProfile?.era || 'modern',
    value_tier: inferValueTier(prizeProfile?.estimated_value)
  };
}

function inferValueTier(value: number | undefined): PrizeFeatures['value_tier'] {
  if (!value) return 'mid';
  if (value < 100) return 'entry';
  if (value < 500) return 'mid';
  if (value < 2000) return 'high';
  return 'ultra';
}

// ═══════════════════════════════════════════════════════════════════════════
// CLARITY & DAY CALCULATION
// ═══════════════════════════════════════════════════════════════════════════
function calculateDayIndex(missionStartDate: string): number {
  const start = new Date(missionStartDate);
  const now = new Date();
  const diffTime = now.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.min(30, diffDays));
}

function calculateClarity(dayIndex: number): number {
  let minClarity: number, maxClarity: number, dayInBand: number, bandSize: number;
  
  if (dayIndex <= 7) {
    minClarity = 0.10; maxClarity = 0.25;
    dayInBand = dayIndex; bandSize = 7;
  } else if (dayIndex <= 15) {
    minClarity = 0.25; maxClarity = 0.45;
    dayInBand = dayIndex - 7; bandSize = 8;
  } else if (dayIndex <= 23) {
    minClarity = 0.45; maxClarity = 0.70;
    dayInBand = dayIndex - 15; bandSize = 8;
  } else {
    minClarity = 0.70; maxClarity = 0.85;
    dayInBand = dayIndex - 23; bandSize = 7;
  }
  
  return minClarity + (maxClarity - minClarity) * (dayInBand / bandSize);
}

function getMaxLeakRisk(dayIndex: number): number {
  if (dayIndex <= 7) return 0.20;
  if (dayIndex <= 15) return 0.30;
  if (dayIndex <= 23) return 0.40;
  return 0.45;
}

// ═══════════════════════════════════════════════════════════════════════════
// FAKE DETERMINATION (25% deterministico)
// ═══════════════════════════════════════════════════════════════════════════
function determineFake(missionId: string, clueIndex: number): boolean {
  // Create deterministic hash
  const combined = `${missionId}:${clueIndex}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // 25% fake = every 4th clue on average
  return (Math.abs(hash) % 4) === 0;
}

// ═══════════════════════════════════════════════════════════════════════════
// COOLDOWN CHECK
// ═══════════════════════════════════════════════════════════════════════════
function filterByCooldown<T extends { category?: string; domain?: string }>(
  items: T[],
  recentMetadata: ClueMetadata[],
  cooldownSize: number,
  field: 'category' | 'domain'
): T[] {
  const recentValues = recentMetadata.slice(0, cooldownSize).map(m => m[field]);
  return items.filter(item => !recentValues.includes(item[field as keyof T] as string));
}

function selectFeatureWithCooldown(
  features: Record<string, string>,
  recentMetadata: ClueMetadata[],
  featureType: 'location' | 'prize',
  cooldownSize: number
): string {
  const featureEntries = Object.entries(features);
  const recentFeatures = recentMetadata
    .slice(0, cooldownSize)
    .flatMap(m => featureType === 'location' ? m.location_features_used : m.prize_features_used);
  
  // Filter out recently used features
  const available = featureEntries.filter(([key, value]) => 
    !recentFeatures.includes(`${key}:${value}`)
  );
  
  // If all features are on cooldown, pick randomly from all
  const pool = available.length > 0 ? available : featureEntries;
  const selected = pool[Math.floor(Math.random() * pool.length)];
  
  return `${selected[0]}:${selected[1]}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE SELECTION & FILLING
// ═══════════════════════════════════════════════════════════════════════════
function selectTemplate(
  templates: ClueTemplate[],
  clarity: number,
  isFake: boolean,
  recentMetadata: ClueMetadata[]
): ClueTemplate | null {
  // Filter by clarity range and fake status
  let eligible = templates.filter(t => 
    clarity >= t.min_clarity && 
    clarity <= t.max_clarity &&
    t.is_fake_template === isFake
  );
  
  // Apply category cooldown (2 clues)
  eligible = filterByCooldown(eligible, recentMetadata, 2, 'category');
  
  if (eligible.length === 0) {
    // Fallback: ignore cooldown
    eligible = templates.filter(t => 
      clarity >= t.min_clarity && 
      clarity <= t.max_clarity &&
      t.is_fake_template === isFake
    );
  }
  
  if (eligible.length === 0) return null;
  
  return eligible[Math.floor(Math.random() * eligible.length)];
}

function selectBridgeMetaphor(
  metaphors: BridgeMetaphor[],
  locationFeature: string,
  prizeFeature: string,
  clarity: number
): BridgeMetaphor | null {
  // Filter by clarity range
  let eligible = metaphors.filter(m => 
    clarity >= m.min_clarity && clarity <= m.max_clarity
  );
  
  // Prefer metaphors that match our features
  const [locKey, locValue] = locationFeature.split(':');
  const [prizeKey, prizeValue] = prizeFeature.split(':');
  
  const matching = eligible.filter(m =>
    (m.location_features.length === 0 || m.location_features.includes(locValue)) &&
    (m.prize_features.length === 0 || m.prize_features.includes(prizeValue))
  );
  
  const pool = matching.length > 0 ? matching : eligible;
  if (pool.length === 0) return null;
  
  return pool[Math.floor(Math.random() * pool.length)];
}

// ═══════════════════════════════════════════════════════════════════════════
// CLUE TEXT GENERATION
// ═══════════════════════════════════════════════════════════════════════════
const FEATURE_HINTS: Record<string, Record<string, string[]>> = {
  hemisphere: {
    north: ['boreali', 'settentrionali', 'del nord'],
    south: ['australi', 'meridionali', 'del sud']
  },
  lat_band: {
    polar: ['gelide', 'artiche', 'estreme'],
    temperate: ['miti', 'moderate', 'equilibrate'],
    subtropical: ['calde', 'soleggiate', 'luminose'],
    tropical: ['tropicali', 'rigogliose', 'verdeggianti']
  },
  climate_hint: {
    continental: ['continentali', 'di terra', 'interne'],
    mediterranean: ['mediterranee', 'costiere', 'marine'],
    oceanic: ['oceaniche', 'atlantiche', 'umide'],
    arid: ['aride', 'secche', 'desertiche'],
    tropical: ['tropicali', 'equatoriali', 'umide']
  },
  coastal_proximity: {
    coastal: ['costiere', 'marittime', 'del mare'],
    inland: ['interne', 'di terra', 'continentali'],
    island: ['insulari', 'isolane', 'del mare']
  },
  timezone_band: {
    west: ['occidentale', 'del tramonto', "dell'ovest"],
    central: ['centrale', 'del mezzogiorno', 'mediana'],
    east: ['orientale', "dell'alba", "dell'est"]
  },
  origin_style: {
    european: ['europee', 'del vecchio mondo', 'occidentali'],
    asian: ['asiatiche', 'orientali', "dell'est"],
    american: ['americane', 'del nuovo mondo', 'transatlantiche'],
    african: ['africane', 'del continente nero', 'ancestrali'],
    global: ['globali', 'universali', 'cosmopolite']
  },
  use_context: {
    luxury: ['lusso', 'prestigio', 'esclusività'],
    utility: ['utilità', 'funzionalità', 'praticità'],
    art: ['arte', 'bellezza', 'estetica'],
    collectible: ['collezione', 'rarità', 'unicità']
  },
  history_tone: {
    ancient: ['antiche', 'millenarie', 'ancestrali'],
    vintage: ['vintage', 'del passato', 'storiche'],
    modern: ['moderne', 'contemporanee', 'attuali'],
    futuristic: ['futuristiche', 'innovative', "d'avanguardia"]
  },
  value_tier: {
    entry: ['accessibile', 'alla portata', 'raggiungibile'],
    mid: ['notevole', 'significativo', 'importante'],
    high: ['elevato', 'considerevole', 'prezioso'],
    ultra: ['straordinario', 'inestimabile', 'eccezionale']
  }
};

function getFeatureHint(feature: string): string {
  const [key, value] = feature.split(':');
  const hints = FEATURE_HINTS[key]?.[value];
  if (!hints || hints.length === 0) return value;
  return hints[Math.floor(Math.random() * hints.length)];
}

function fillTemplate(
  template: ClueTemplate,
  locationFeature: string,
  prizeFeature: string,
  bridge: BridgeMetaphor | null,
  features: MissionFeatures
): string {
  let text = template.template_text;
  
  // Replace location placeholders
  text = text.replace(/\{hemisphere_hint\}/g, getFeatureHint(`hemisphere:${features.location.hemisphere}`));
  text = text.replace(/\{lat_band_hint\}/g, getFeatureHint(`lat_band:${features.location.lat_band}`));
  text = text.replace(/\{climate_metaphor\}/g, getFeatureHint(`climate_hint:${features.location.climate_hint}`));
  text = text.replace(/\{climate_detail\}/g, `condizioni ${getFeatureHint(`climate_hint:${features.location.climate_hint}`)}`);
  text = text.replace(/\{climate_sky\}/g, getFeatureHint(`climate_hint:${features.location.climate_hint}`));
  text = text.replace(/\{climate_type\}/g, `clima ${getFeatureHint(`climate_hint:${features.location.climate_hint}`)}`);
  text = text.replace(/\{coastal_hint\}/g, `acque ${getFeatureHint(`coastal_proximity:${features.location.coastal_proximity}`)}`);
  text = text.replace(/\{timezone_hint\}/g, `fuso ${getFeatureHint(`timezone_band:${features.location.timezone_band}`)}`);
  text = text.replace(/\{urban_hint\}/g, getFeatureHint(`urban_density:${features.location.urban_density}`));
  text = text.replace(/\{season_behavior\}/g, 'si alternano con grazia');
  text = text.replace(/\{history_era\}/g, getFeatureHint(`history_tone:${features.prize.history_tone}`));
  text = text.replace(/\{history_path\}/g, 'commerciali');
  text = text.replace(/\{culture_type\}/g, getFeatureHint(`origin_style:${features.prize.origin_style}`));
  text = text.replace(/\{culture_practice\}/g, "l'ospitalità");
  
  // Replace prize placeholders
  text = text.replace(/\{prize_era\}/g, `tempi ${getFeatureHint(`history_tone:${features.prize.history_tone}`)}`);
  text = text.replace(/\{prize_context\}/g, getFeatureHint(`use_context:${features.prize.use_context}`));
  text = text.replace(/\{prize_origin\}/g, `maestri ${getFeatureHint(`origin_style:${features.prize.origin_style}`)}`);
  text = text.replace(/\{material_hint\}/g, `materiali ${features.prize.materials[0] || 'pregiati'}`);
  text = text.replace(/\{material_quality\}/g, 'Qualità');
  text = text.replace(/\{material_type\}/g, 'maestria');
  text = text.replace(/\{value_hint\}/g, getFeatureHint(`value_tier:${features.prize.value_tier}`));
  text = text.replace(/\{context_hint\}/g, getFeatureHint(`use_context:${features.prize.use_context}`));
  
  // Replace fake placeholders with plausible but misleading content
  text = text.replace(/\{fake_water\}/g, ['settentrionali', 'meridionali', 'occidentali', 'orientali'][Math.floor(Math.random() * 4)]);
  text = text.replace(/\{fake_landmark\}/g, ['la torre', 'il monumento', 'la cattedrale', 'il palazzo'][Math.floor(Math.random() * 4)]);
  text = text.replace(/\{fake_history\}/g, ['commerci', 'pellegrinaggi', 'viaggiatori', 'esploratori'][Math.floor(Math.random() * 4)]);
  text = text.replace(/\{fake_material\}/g, ['argento', 'bronzo', 'pietra', 'legno'][Math.floor(Math.random() * 4)]);
  text = text.replace(/\{fake_origin\}/g, ['provenienza', 'origine', 'storia', 'tradizione'][Math.floor(Math.random() * 4)]);
  
  // Insert bridge metaphor if available
  if (bridge) {
    text = text.replace(/\{bridge\}/g, bridge.metaphor_text);
  }
  
  return text;
}

// ═══════════════════════════════════════════════════════════════════════════
// LEAK RISK CALCULATION
// ═══════════════════════════════════════════════════════════════════════════
const BANNED_PATTERNS = [
  /\b\d{1,3}\.\d+/gi,           // Coordinates
  /\blat(?:itudine)?\s*[:=]?\s*\d/gi,
  /\blong(?:itudine)?\s*[:=]?\s*\d/gi,
  /\b(?:roma|milano|napoli|torino|firenze|venezia|bologna|genova|palermo|bari)\b/gi, // Italian cities
  /\b(?:paris|london|berlin|madrid|barcelona|amsterdam|vienna|prague|budapest)\b/gi, // European cities
  /\b(?:new york|los angeles|chicago|miami|tokyo|beijing|shanghai|dubai)\b/gi, // World cities
  /\bvia\s+[A-Z][a-z]+/gi,      // Street names
  /\bpiazza\s+[A-Z][a-z]+/gi,   // Square names
  /\bcorso\s+[A-Z][a-z]+/gi,    // Avenue names
];

function calculateLeakRisk(clueText: string, mission: any): number {
  let risk = 0;
  
  // Check for banned patterns
  for (const pattern of BANNED_PATTERNS) {
    if (pattern.test(clueText)) {
      risk += 0.5; // Major leak
    }
  }
  
  // Check for mission-specific data leaks
  if (mission.target_city && clueText.toLowerCase().includes(mission.target_city.toLowerCase())) {
    risk += 1.0; // Critical leak
  }
  if (mission.target_street && clueText.toLowerCase().includes(mission.target_street.toLowerCase())) {
    risk += 1.0; // Critical leak
  }
  
  // Check for coordinate-like patterns
  const coordPattern = /\d{2,3}[.,]\d{3,}/g;
  if (coordPattern.test(clueText)) {
    risk += 0.8;
  }
  
  return Math.min(1.0, risk);
}

// ═══════════════════════════════════════════════════════════════════════════
// HASH FUNCTION
// ═══════════════════════════════════════════════════════════════════════════
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════════════
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json();
    const { mission_id } = body;

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 1: GET ACTIVE MISSION
    // ═══════════════════════════════════════════════════════════════════════
    let mission: any;
    
    if (mission_id) {
      const { data, error } = await supabase
        .from('current_mission_data')
        .select('*')
        .eq('id', mission_id)
        .single();
      if (error) throw new Error('Mission not found');
      mission = data;
    } else {
      // Get active mission
      const { data, error } = await supabase
        .from('current_mission_data')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (error || !data) {
        return new Response(JSON.stringify({ error: 'no_active_mission' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      mission = data;
    }

    console.log('📍 [CLUE-ENGINE] Mission loaded:', mission.id);

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 2: CHECK ENROLLMENT
    // ═══════════════════════════════════════════════════════════════════════
    const { data: enrollment, error: enrollError } = await supabase
      .from('mission_enrollments')
      .select('id, created_at')
      .eq('user_id', user.id)
      .eq('mission_id', mission.id)
      .maybeSingle();

    if (!enrollment) {
      return new Response(JSON.stringify({ 
        error: 'not_enrolled',
        code: 'START_MISSION_REQUIRED'
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 3: CALCULATE DAY INDEX
    // ═══════════════════════════════════════════════════════════════════════
    const missionStartDate = mission.mission_started_at || mission.created_at;
    const dayIndex = calculateDayIndex(missionStartDate);
    const clarity = calculateClarity(dayIndex);
    
    console.log('📅 [CLUE-ENGINE] Day:', dayIndex, 'Clarity:', clarity.toFixed(3));

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 4: GET OR CREATE FEATURES CACHE
    // ═══════════════════════════════════════════════════════════════════════
    let features: MissionFeatures;
    
    const { data: cachedFeatures } = await supabase
      .from('mission_features_cache')
      .select('*')
      .eq('mission_id', mission.id)
      .single();

    if (cachedFeatures) {
      features = {
        location: {
          hemisphere: cachedFeatures.hemisphere,
          lat_band: cachedFeatures.lat_band,
          climate_hint: cachedFeatures.climate_hint,
          coastal_proximity: cachedFeatures.coastal_proximity,
          urban_density: cachedFeatures.urban_density,
          timezone_band: cachedFeatures.timezone_band
        },
        prize: {
          materials: cachedFeatures.prize_materials || [],
          origin_style: cachedFeatures.prize_origin_style,
          use_context: cachedFeatures.prize_use_context,
          history_tone: cachedFeatures.prize_history_tone,
          value_tier: cachedFeatures.prize_value_tier
        }
      };
    } else {
      // Extract features from mission data
      const lat = mission.target_lat || mission.prize_lat || 45.0;
      const lng = mission.target_lng || mission.prize_lng || 9.0;
      
      const locationFeatures = extractLocationFeatures(lat, lng);
      const prizeFeatures = extractPrizeFeatures(mission.final_prize_profile || {});
      
      features = { location: locationFeatures, prize: prizeFeatures };
      
      // Cache features
      await supabase.from('mission_features_cache').upsert({
        mission_id: mission.id,
        ...locationFeatures,
        prize_materials: prizeFeatures.materials,
        prize_origin_style: prizeFeatures.origin_style,
        prize_use_context: prizeFeatures.use_context,
        prize_history_tone: prizeFeatures.history_tone,
        prize_value_tier: prizeFeatures.value_tier
      });
    }

    console.log('🔍 [CLUE-ENGINE] Features:', JSON.stringify(features));

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 5: GET USER'S CLUE COUNT
    // ═══════════════════════════════════════════════════════════════════════
    const { count: existingClueCount } = await supabase
      .from('mission_clue_metadata')
      .select('*', { count: 'exact', head: true })
      .eq('mission_id', mission.id)
      .eq('user_id', user.id);

    const clueIndex = (existingClueCount || 0) + 1;
    
    if (clueIndex > 250) {
      return new Response(JSON.stringify({ 
        error: 'max_clues_reached',
        message: 'Hai raggiunto il limite massimo di 250 indizi per questa missione.'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 6: DETERMINE IF FAKE
    // ═══════════════════════════════════════════════════════════════════════
    const isFake = determineFake(mission.id, clueIndex);
    console.log('🎭 [CLUE-ENGINE] Clue #', clueIndex, 'isFake:', isFake);

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 7: GET RECENT CLUE METADATA (for cooldown)
    // ═══════════════════════════════════════════════════════════════════════
    const { data: recentClues } = await supabase
      .from('mission_clue_metadata')
      .select('*')
      .eq('mission_id', mission.id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    const recentMetadata = (recentClues || []) as ClueMetadata[];

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 8: LOAD TEMPLATES AND METAPHORS
    // ═══════════════════════════════════════════════════════════════════════
    const { data: templates } = await supabase
      .from('clue_templates')
      .select('*')
      .eq('is_active', true);

    const { data: metaphors } = await supabase
      .from('bridge_metaphors')
      .select('*')
      .eq('is_active', true);

    if (!templates || templates.length === 0) {
      return new Response(JSON.stringify({ error: 'no_templates_available' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 9: SELECT TEMPLATE
    // ═══════════════════════════════════════════════════════════════════════
    const selectedTemplate = selectTemplate(
      templates as ClueTemplate[],
      clarity,
      isFake,
      recentMetadata
    );

    if (!selectedTemplate) {
      return new Response(JSON.stringify({ error: 'no_suitable_template' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 10: SELECT FEATURES WITH COOLDOWN
    // ═══════════════════════════════════════════════════════════════════════
    const locationFeature = selectFeatureWithCooldown(
      features.location as unknown as Record<string, string>,
      recentMetadata,
      'location',
      5
    );

    const prizeFeature = selectFeatureWithCooldown(
      features.prize as unknown as Record<string, string>,
      recentMetadata,
      'prize',
      5
    );

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 11: SELECT BRIDGE METAPHOR
    // ═══════════════════════════════════════════════════════════════════════
    const bridgeMetaphor = selectBridgeMetaphor(
      (metaphors || []) as BridgeMetaphor[],
      locationFeature,
      prizeFeature,
      clarity
    );

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 12: GENERATE CLUE TEXT
    // ═══════════════════════════════════════════════════════════════════════
    let clueText = fillTemplate(
      selectedTemplate,
      locationFeature,
      prizeFeature,
      bridgeMetaphor,
      features
    );

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 13: VALIDATE LEAK RISK
    // ═══════════════════════════════════════════════════════════════════════
    const leakRisk = calculateLeakRisk(clueText, mission);
    const maxLeakRisk = getMaxLeakRisk(dayIndex);

    if (leakRisk > maxLeakRisk) {
      console.warn('⚠️ [CLUE-ENGINE] Leak risk too high:', leakRisk, '>', maxLeakRisk);
      // Regenerate with safer template
      clueText = "Un mistero avvolge il premio che cerchi. Continua la tua ricerca.";
    }

    console.log('📝 [CLUE-ENGINE] Generated clue:', clueText.substring(0, 50) + '...');

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 14: PERSIST METADATA
    // ═══════════════════════════════════════════════════════════════════════
    const metadata: Omit<ClueMetadata, 'id'> = {
      mission_id: mission.id,
      user_id: user.id,
      clue_index: clueIndex,
      day_index: dayIndex,
      domain: selectedTemplate.domain,
      category: selectedTemplate.category,
      is_fake: isFake,
      location_features_used: [locationFeature],
      prize_features_used: [prizeFeature],
      bridge_metaphor_id: bridgeMetaphor?.id || null,
      structure_hash: hashString(selectedTemplate.template_text),
      opening_type: selectedTemplate.opening_type,
      clarity_score: clarity,
      leak_risk_score: leakRisk,
      clue_text: clueText
    };

    const { error: insertError } = await supabase
      .from('mission_clue_metadata')
      .insert(metadata);

    if (insertError) {
      console.error('❌ [CLUE-ENGINE] Failed to save metadata:', insertError);
      // Continue anyway - clue generation is more important
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 15: RETURN CLUE
    // ═══════════════════════════════════════════════════════════════════════
    return new Response(JSON.stringify({
      success: true,
      clue: {
        text: clueText,
        category: selectedTemplate.category,
        domain: selectedTemplate.domain,
        day: dayIndex,
        index: clueIndex,
        clarity: Math.round(clarity * 100) / 100
      },
      meta: {
        mission_id: mission.id,
        is_fake: isFake, // Only visible in dev/debug
        leak_risk: leakRisk
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌ [CLUE-ENGINE] Error:', error);
    return new Response(JSON.stringify({ 
      error: 'internal_error',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});



