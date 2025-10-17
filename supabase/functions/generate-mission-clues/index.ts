// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// M1SSION™ AI Clue Generator - Sistema generativo indizi per missioni mensili

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2.49.8';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ClueRequest {
  missionId: string;
  targetLocation: {
    city: string;
    country: string;
    coordinates: { lat: number; lng: number };
  };
  prizeDescription: string;
  areaRadiusKm: number;
}

interface GeneratedClue {
  text: string;
  week: number;
  type: 'real' | 'decoy';
  tier: 'base' | 'silver' | 'gold' | 'black' | 'titanium';
  difficulty: number;
  category: string;
}

const TIER_DISTRIBUTION = {
  base: { weekly: 1, total: 4 },
  silver: { weekly: 3, total: 12 },
  gold: { weekly: 5, total: 20 },
  black: { weekly: 7, total: 28 },
  titanium: { weekly: 9, total: 36, decoy: 1 }
};

const WEEKLY_THEMES = {
  1: {
    theme: "Simbolico e Mitologico",
    style: "Indizi criptici, simboli antichi, riferimenti mitologici, metafore eleganti",
    difficulty: "Molto alta - richiede cultura generale e intuizione"
  },
  2: {
    theme: "Geografia Macro e Cultura",
    style: "Continenti, nazioni, culture, storia antica, tradizioni",
    difficulty: "Alta - geografia e storia generale"
  },
  3: {
    theme: "Microzona e Premio",
    style: "Dettagli architettonici, caratteristiche locali, descrizione premio",
    difficulty: "Media - osservazione e deduzione"
  },
  4: {
    theme: "Coordinate e Precisione",
    style: "Anagrammi, coordinate velate, riferimenti storici precisi",
    difficulty: "Bassa - risoluzione meccanica"
  }
};

async function generateCluesWithAI(request: ClueRequest): Promise<GeneratedClue[]> {
  console.log('🧠 M1SSION™: Generazione AI indizi per missione:', request.missionId);

  const systemPrompt = `
Sei il generatore ufficiale di indizi per M1SSION™, un gioco di caccia al tesoro globale di elite.

CONTESTO:
- Missione mensile con premio reale nascosto in: ${request.targetLocation.city}, ${request.targetLocation.country}
- Area iniziale: ${request.areaRadiusKm}km di raggio
- Premio: ${request.prizeDescription}
- Coordinate: ${request.targetLocation.coordinates.lat}, ${request.targetLocation.coordinates.lng}

REGOLE CREATIVE:
1. Stile elegante, criptico ma comprensibile
2. Mai citare vie, indirizzi o nomi reali specifici
3. Usa metafore, simboli, riferimenti culturali
4. Progressione difficoltà: Week 1 (simbolico) → Week 4 (preciso)
5. Linguaggio poetico, evocativo, misterioso

DISTRIBUZIONE TIERS:
- Base: indizi generici, facili
- Silver: cultura generale richiesta  
- Gold: deduzione complessa
- Black: expertise specifica
- Titanium: massima difficoltà + decoy falsi

Genera esattamente 50 indizi per ogni settimana (200 totali).
`;

  const allClues: GeneratedClue[] = [];

  for (let week = 1; week <= 4; week++) {
    const weekTheme = WEEKLY_THEMES[week as keyof typeof WEEKLY_THEMES];
    
    const weekPrompt = `
SETTIMANA ${week}: ${weekTheme.theme}

STILE: ${weekTheme.style}
DIFFICOLTÀ: ${weekTheme.difficulty}

Genera ESATTAMENTE 50 indizi per questa settimana con questa distribuzione:
- 10 indizi tier BASE (semplici, generici)
- 12 indizi tier SILVER (cultura generale)
- 10 indizi tier GOLD (deduzione complessa)
- 14 indizi tier BLACK (expertise)
- 4 indizi tier TITANIUM (3 reali + 1 decoy falso)

Ogni indizio deve essere:
- Massimo 150 caratteri
- Stile elegante e misterioso
- Appropriato per settimana ${week}
- Progressivamente più specifico verso il target

FORMATO JSON:
{
  "clues": [
    {
      "text": "Dove l'aquila dorata guarda l'alba, tra le antiche colonne del tempo...",
      "tier": "base",
      "type": "real",
      "category": "simbolico"
    }
  ]
}
`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: weekPrompt }
          ],
          temperature: 0.8,
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const weekClues = JSON.parse(data.choices[0].message.content);
      
      // Aggiungi metadati a ogni indizio
      weekClues.clues.forEach((clue: any, index: number) => {
        allClues.push({
          text: clue.text,
          week: week,
          type: clue.type || 'real',
          tier: clue.tier,
          difficulty: week === 1 ? 5 : week === 2 ? 4 : week === 3 ? 3 : 2,
          category: clue.category || 'general'
        });
      });

      console.log(`✅ Settimana ${week}: ${weekClues.clues.length} indizi generati`);
      
    } catch (error) {
      console.error(`❌ Errore generazione settimana ${week}:`, error);
      throw error;
    }
  }

  console.log(`🎯 M1SSION™: Generati ${allClues.length} indizi totali`);
  return allClues;
}

async function saveCluesDatabase(missionId: string, clues: GeneratedClue[]) {
  console.log('💾 Salvataggio indizi nel database...');

  const clueRecords = clues.map((clue, index) => ({
    prize_id: missionId,
    week: clue.week,
    title_it: `Indizio ${clue.week}-${index + 1}`,
    description_it: clue.text,
    clue_type: clue.type,
    created_at: new Date().toISOString()
  }));

  const { error } = await supabase
    .from('prize_clues')
    .insert(clueRecords);

  if (error) {
    console.error('❌ Errore salvataggio database:', error);
    throw error;
  }

  console.log('✅ Indizi salvati nel database');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { missionId, targetLocation, prizeDescription, areaRadiusKm } = await req.json() as ClueRequest;

    if (!missionId || !targetLocation || !prizeDescription) {
      return new Response(
        JSON.stringify({ error: 'Parametri mancanti' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🚀 M1SSION™ Clue Generator avviato per missione:', missionId);

    // Genera indizi con AI
    const generatedClues = await generateCluesWithAI({
      missionId,
      targetLocation,
      prizeDescription,
      areaRadiusKm
    });

    // Salva nel database
    await saveCluesDatabase(missionId, generatedClues);

    // Log operazione
    await supabase.from('panel_logs').insert({
      event_type: 'clues_generated',
      mission_id: missionId,
      details: {
        total_clues: generatedClues.length,
        target_location: targetLocation,
        area_radius_km: areaRadiusKm,
        generation_time: new Date().toISOString()
      }
    });

    const response = {
      success: true,
      mission_id: missionId,
      total_clues: generatedClues.length,
      clues_by_week: {
        week_1: generatedClues.filter(c => c.week === 1).length,
        week_2: generatedClues.filter(c => c.week === 2).length,
        week_3: generatedClues.filter(c => c.week === 3).length,
        week_4: generatedClues.filter(c => c.week === 4).length,
      },
      clues_by_tier: {
        base: generatedClues.filter(c => c.tier === 'base').length,
        silver: generatedClues.filter(c => c.tier === 'silver').length,
        gold: generatedClues.filter(c => c.tier === 'gold').length,
        black: generatedClues.filter(c => c.tier === 'black').length,
        titanium: generatedClues.filter(c => c.tier === 'titanium').length,
      },
      decoy_clues: generatedClues.filter(c => c.type === 'decoy').length,
      preview_clues: generatedClues.slice(0, 5).map(c => ({
        week: c.week,
        tier: c.tier,
        text: c.text.substring(0, 100) + '...'
      }))
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ M1SSION™ Clue Generator Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Errore generazione indizi',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});