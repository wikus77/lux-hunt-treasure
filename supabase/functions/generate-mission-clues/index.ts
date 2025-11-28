// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// GENERATE MISSION CLUES - Generatore automatico indizi per missione

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface MissionData {
  prize_id: string;
  city: string;
  country: string;
  region?: string;
  prize_type: string;
  prize_color?: string;
  prize_material?: string;
  prize_category?: string;
}

// ============================================
// TEMPLATE INDIZI PER SETTIMANA E CATEGORIA
// ============================================

const LOCATION_TEMPLATES = {
  week1: [
    // Molto generici - Paese/Macro-zona
    "Nel cuore di {country}, dove la storia incontra il presente...",
    "Una terra famosa per la sua arte e cultura ti attende...",
    "Dove il sole del Mediterraneo scalda antiche pietre...",
    "In una nazione a forma di stivale, il destino ti chiama...",
    "Tra colline e pianure, un segreto attende di essere scoperto...",
    "Nel paese dei mille campanili, qualcosa ti aspetta...",
    "Dove la tradizione culinaria è patrimonio dell'umanità...",
    "Una terra di poeti, navigatori e sognatori...",
    "Nel regno della bellezza eterna, cerca con il cuore...",
    "Dove ogni pietra racconta una storia millenaria...",
    "In una terra benedetta dal clima mite tutto l'anno...",
    "Dove l'innovazione danza con la tradizione...",
  ],
  week2: [
    // Generici ma più concreti - Regione/Caratteristiche
    "Nel nord industrioso, dove i sogni prendono forma...",
    "Una regione famosa per la sua operosità ti nasconde qualcosa...",
    "Dove la nebbia mattutina cela segreti preziosi...",
    "Terra di risaie e grandi industrie, cerca bene...",
    "Una zona dove il design è di casa...",
    "Regione di laghi e montagne all'orizzonte...",
    "Dove la moda detta legge nel mondo intero...",
    "Terra di grandi imprenditori e visionari...",
    "Una zona metropolitana che non dorme mai...",
    "Dove antico e moderno convivono in armonia...",
    "Regione che ha dato i natali a grandi artisti...",
    "Terra fertile di idee e innovazione...",
  ],
  week3: [
    // Affinati - Zona/Quartiere senza nome
    "Vicino a dove i treni veloci si fermano...",
    "In una zona dove gli affari si concludono ogni giorno...",
    "Non lontano da un importante centro culturale...",
    "Dove i giovani si ritrovano per studiare e sognare...",
    "Vicino a un parco dove la natura respira in città...",
    "In un quartiere che ha visto la storia cambiare...",
    "Dove le vetrine brillano di lusso e eleganza...",
    "Non lontano da dove l'arte contemporanea vive...",
    "In una zona rinomata per la sua vivacità notturna...",
    "Vicino a dove antiche mura raccontano storie...",
    "Dove il commercio ha radici centenarie...",
    "In un'area che guarda al futuro con ottimismo...",
  ],
  week4: [
    // Comprensibili - Coordinate vaghe/Landmark
    "Latitudine approssimativa: {lat_approx}°N, cerca verso {direction}...",
    "A pochi passi da un importante snodo dei trasporti...",
    "L'anagramma della zona è: {anagram}...",
    "Coordinate approssimative: {lat_approx}°N, {lng_approx}°E (±500m)...",
    "Vicino a un edificio che tocca il cielo...",
    "Dove una famosa piazza accoglie visitatori da tutto il mondo...",
    "Non lontano da un museo di fama internazionale...",
    "A pochi isolati da un teatro storico...",
    "Nelle vicinanze di un importante centro finanziario...",
    "Dove una chiesa antica veglia sui passanti...",
  ]
};

const PRIZE_TEMPLATES = {
  week1: [
    // Molto generici - Sensazioni/Status
    "Un oggetto che rappresenta il successo e l'ambizione...",
    "Qualcosa che fa battere il cuore degli appassionati...",
    "Un premio che incarna velocità e potenza...",
    "Il simbolo di chi non si accontenta mai...",
    "Un sogno che diventa realtà tangibile...",
    "L'essenza del lusso italiano...",
    "Qualcosa che fa girare le teste al suo passaggio...",
    "Un capolavoro di ingegneria e design...",
    "Il premio che tutti vorrebbero possedere...",
    "Un oggetto che parla di passione e dedizione...",
    "L'incarnazione della perfezione meccanica...",
    "Qualcosa che vale più di mille parole...",
  ],
  week2: [
    // Generici concreti - Categoria/Materiale
    "Realizzato con materiali di prima qualità...",
    "Il suo colore richiama {color_hint}...",
    "Un oggetto dalla categoria {category}...",
    "Costruito per durare nel tempo...",
    "Design italiano riconosciuto in tutto il mondo...",
    "Materiali nobili per un premio nobile...",
    "La sua silhouette è inconfondibile...",
    "Un mix perfetto di tradizione e innovazione...",
    "Qualcosa che si distingue per eleganza...",
    "Realizzato da mani esperte...",
    "Il frutto di anni di ricerca e sviluppo...",
    "Un oggetto che unisce forma e funzione...",
  ],
  week3: [
    // Affinati - Dettagli estetici
    "Le sue linee ricordano la velocità pura...",
    "Un dettaglio distintivo: cerca il simbolo del cavallo...",
    "Il suo sound è inconfondibile...",
    "Interni che profumano di lusso...",
    "Ogni dettaglio è stato curato con ossessione...",
    "La sua presenza è magnetica...",
    "Un oggetto che emoziona a prima vista...",
    "Il tocco dei materiali rivela la qualità...",
    "Dimensioni che impressionano...",
    "Un oggetto che racconta la sua storia...",
    "La tecnologia al servizio della bellezza...",
    "Ogni curva ha un significato preciso...",
  ],
  week4: [
    // Comprensibili - Indizi finali
    "Il premio è autentico e certificato...",
    "Valore stimato: oltre le aspettative...",
    "Il fortunato vincitore riceverà tutto il necessario...",
    "Documenti e accessori inclusi...",
    "Pronto per essere ritirato dal legittimo vincitore...",
    "La consegna avverrà in modo sicuro e discreto...",
    "Un premio che cambierà la vita del vincitore...",
    "Tutto è stato verificato e garantito...",
    "Il sogno è a portata di mano...",
    "Chi arriva primo, vince tutto...",
  ]
};

const FAKE_LOCATION_TEMPLATES = [
  "Forse nel sud, dove il sole è più caldo...",
  "Potrebbe essere vicino al mare...",
  "Una città con un importante aeroporto...",
  "Dove si parla un dialetto particolare...",
  "Vicino a un confine nazionale...",
  "In una zona collinare...",
  "Dove il vino è protagonista...",
  "Una città universitaria del centro...",
  "Vicino a un importante fiume...",
  "In una zona termale rinomata...",
];

const FAKE_PRIZE_TEMPLATES = [
  "Potrebbe essere qualcosa di tecnologico...",
  "Un premio dal valore inestimabile...",
  "Qualcosa legato al mondo dello sport...",
  "Un oggetto d'arte contemporanea...",
  "Forse qualcosa di vintage...",
  "Un premio esperienziale unico...",
  "Qualcosa che brilla...",
  "Un oggetto da collezione...",
  "Forse un viaggio esclusivo...",
  "Qualcosa legato alla gastronomia...",
];

// Helper functions
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function createAnagram(word: string): string {
  return shuffleArray(word.toUpperCase().split('')).join('');
}

function getRandomDirection(): string {
  const directions = ['nord', 'sud', 'est', 'ovest', 'nordest', 'nordovest', 'sudest', 'sudovest'];
  return directions[Math.floor(Math.random() * directions.length)];
}

function generateClue(
  template: string, 
  missionData: MissionData,
  lat?: number,
  lng?: number
): string {
  let clue = template;
  
  // Replace placeholders
  clue = clue.replace('{country}', missionData.country || 'Italia');
  clue = clue.replace('{color_hint}', getColorHint(missionData.prize_color));
  clue = clue.replace('{category}', missionData.prize_category || 'esclusiva');
  clue = clue.replace('{direction}', getRandomDirection());
  
  if (lat && lng) {
    // Approximate coordinates (add random offset ±0.05)
    const latApprox = (lat + (Math.random() - 0.5) * 0.1).toFixed(2);
    const lngApprox = (lng + (Math.random() - 0.5) * 0.1).toFixed(2);
    clue = clue.replace('{lat_approx}', latApprox);
    clue = clue.replace('{lng_approx}', lngApprox);
  }
  
  // Create anagram of city (without revealing it)
  if (clue.includes('{anagram}') && missionData.city) {
    clue = clue.replace('{anagram}', createAnagram(missionData.city));
  }
  
  return clue;
}

function getColorHint(color?: string): string {
  const hints: Record<string, string> = {
    'rosso': 'il fuoco e la passione',
    'nero': 'la notte e l\'eleganza',
    'bianco': 'la purezza e la luce',
    'blu': 'il cielo e il mare',
    'giallo': 'il sole e l\'energia',
    'verde': 'la natura e la speranza',
    'grigio': 'la modernità e il metallo',
    'argento': 'la luna e il prestigio',
  };
  return hints[color?.toLowerCase() || ''] || 'qualcosa di speciale';
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🎯 [GENERATE-CLUES] Function started');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request - handle both JSON and already-parsed body
    let body: any;
    const contentType = req.headers.get('content-type') || '';
    console.log('📥 [GENERATE-CLUES] Content-Type:', contentType);
    
    try {
      body = await req.json();
      console.log('📥 [GENERATE-CLUES] Body parsed successfully:', JSON.stringify(body).substring(0, 200));
    } catch (parseError) {
      console.error('❌ [GENERATE-CLUES] JSON parse error, trying text:', parseError);
      // Try to get as text and parse
      const textBody = await req.text();
      console.log('📥 [GENERATE-CLUES] Text body:', textBody.substring(0, 200));
      body = JSON.parse(textBody);
    }
    
    const { prize_id, city, country, region, prize_type, prize_color, prize_material, prize_category, lat, lng } = body || {};

    if (!prize_id) {
      throw new Error('prize_id is required');
    }

    console.log('📍 [GENERATE-CLUES] Mission data:', { prize_id, city, country, prize_type });

    const missionData: MissionData = {
      prize_id,
      city: city || '',
      country: country || 'Italia',
      region: region || '',
      prize_type: prize_type || '',
      prize_color: prize_color || '',
      prize_material: prize_material || '',
      prize_category: prize_category || '',
    };

    // Delete existing clues for this prize
    const { error: deleteError } = await supabase
      .from('prize_clues')
      .delete()
      .eq('prize_id', prize_id);

    if (deleteError) {
      console.error('❌ [GENERATE-CLUES] Error deleting old clues:', deleteError);
    }

    // Generate clues
    const clues: any[] = [];
    const weeks = [1, 2, 3, 4];
    const categories = ['location', 'prize'];

    for (const week of weeks) {
      for (const category of categories) {
        const templates = category === 'location' 
          ? LOCATION_TEMPLATES[`week${week}` as keyof typeof LOCATION_TEMPLATES]
          : PRIZE_TEMPLATES[`week${week}` as keyof typeof PRIZE_TEMPLATES];
        
        const fakeTemplates = category === 'location' 
          ? FAKE_LOCATION_TEMPLATES 
          : FAKE_PRIZE_TEMPLATES;

        // Generate 25 real clues per week per category (50 total per week)
        // Actually we want ~50 per category per week = 200 per category = 400 total
        // Let's do 12-13 real + 3-4 fake per week per category = ~50 per week per category
        
        const realCount = 12;
        const fakeCount = 4; // ~25% fake

        // Generate real clues
        for (let i = 0; i < realCount; i++) {
          const template = templates[i % templates.length];
          const clueText = generateClue(template, missionData, lat, lng);
          
          clues.push({
            prize_id,
            week,
            clue_category: category,
            description_it: clueText,
            title_it: `Indizio ${category === 'location' ? 'Luogo' : 'Premio'} - Settimana ${week}`,
            is_fake: false,
            difficulty_level: week,
            clue_type: 'real'
          });
        }

        // Generate fake clues
        for (let i = 0; i < fakeCount; i++) {
          const template = fakeTemplates[i % fakeTemplates.length];
          
          clues.push({
            prize_id,
            week,
            clue_category: category,
            description_it: template,
            title_it: `Indizio ${category === 'location' ? 'Luogo' : 'Premio'} - Settimana ${week}`,
            is_fake: true,
            difficulty_level: week,
            clue_type: 'decoy'
          });
        }
      }
    }

    // Shuffle clues to mix real and fake
    const shuffledClues = shuffleArray(clues);

    console.log(`📝 [GENERATE-CLUES] Generated ${shuffledClues.length} clues`);

    // Insert clues in batches
    const batchSize = 50;
    for (let i = 0; i < shuffledClues.length; i += batchSize) {
      const batch = shuffledClues.slice(i, i + batchSize);
      const { error: insertError } = await supabase
        .from('prize_clues')
        .insert(batch);

      if (insertError) {
        console.error(`❌ [GENERATE-CLUES] Error inserting batch ${i}:`, insertError);
        throw insertError;
      }
    }

    console.log('✅ [GENERATE-CLUES] All clues saved successfully!');

    return new Response(
      JSON.stringify({
        success: true,
        message: `Generated ${shuffledClues.length} clues for mission`,
        breakdown: {
          total: shuffledClues.length,
          per_week: shuffledClues.length / 4,
          real_clues: shuffledClues.filter(c => !c.is_fake).length,
          fake_clues: shuffledClues.filter(c => c.is_fake).length,
          location_clues: shuffledClues.filter(c => c.clue_category === 'location').length,
          prize_clues: shuffledClues.filter(c => c.clue_category === 'prize').length,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ [GENERATE-CLUES] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
