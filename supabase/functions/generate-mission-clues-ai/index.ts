// © 2025 M1SSION™ – INTELLIGENCE-GRADE CLUE ENGINE V7
// FIXED: Robust JSON parsing, mixed LOCATION+PRIZE per batch
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

// ═══════════════════════════════════════════════════════════════════════════
// CORS CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const allowedOrigins = new Set([
  "https://m1ssion.eu",
  "https://www.m1ssion.eu",
  "http://localhost:5173",
  "http://localhost:4173",
  "http://localhost:3000",
]);

function getCorsOrigin(req: Request): string {
  const origin = req.headers.get("origin") ?? "";
  return allowedOrigins.has(origin) ? origin : "https://m1ssion.eu";
}

function corsHeaders(req: Request): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": getCorsOrigin(req),
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ROBUST JSON PARSER
// ═══════════════════════════════════════════════════════════════════════════

function extractAndParseJSON(text: string): any[] {
  // Clean markdown code blocks
  let cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .replace(/^\s*\n/gm, '')
    .trim();
  
  // Find array boundaries
  const start = cleaned.indexOf('[');
  const end = cleaned.lastIndexOf(']');
  
  if (start === -1) {
    console.error('No [ found in response');
    return [];
  }
  
  let jsonStr = end !== -1 && end > start 
    ? cleaned.substring(start, end + 1)
    : cleaned.substring(start);
  
  // Try direct parse first
  try {
    return JSON.parse(jsonStr);
  } catch (e1) {
    console.log('Direct parse failed, attempting repair...');
  }
  
  // Repair common issues
  try {
    // Fix trailing commas
    jsonStr = jsonStr.replace(/,\s*]/g, ']').replace(/,\s*}/g, '}');
    // Fix missing closing bracket
    if (!jsonStr.endsWith(']')) jsonStr += ']';
    // Fix unescaped quotes in strings
    jsonStr = jsonStr.replace(/:\s*"([^"]*)"([^,}\]]*)"([^"]*)",/g, ': "$1\\"$2\\"$3",');
    
    return JSON.parse(jsonStr);
  } catch (e2) {
    console.log('Repair attempt 1 failed, trying line-by-line...');
  }
  
  // Try extracting individual objects
  try {
    const objectMatches = jsonStr.matchAll(/\{[^{}]*\}/g);
    const objects: any[] = [];
    for (const match of objectMatches) {
      try {
        objects.push(JSON.parse(match[0]));
      } catch {}
    }
    if (objects.length > 0) return objects;
  } catch (e3) {
    console.log('Line-by-line extraction failed');
  }
  
  return [];
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════════════

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(req) });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const GEMINI_MODEL = Deno.env.get('GEMINI_MODEL') || 'gemini-2.0-flash';
    
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ success: false, error: 'No GEMINI_API_KEY' }), { 
        headers: corsHeaders(req)
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    let body: any = {};
    try {
      const text = await req.text();
      body = text ? JSON.parse(text) : {};
    } catch { body = {}; }

    const prize_id = body.prize_id || 'mission-clues';
    const country = body.country || 'Italia';
    const city = body.city || 'Milano';
    const prize_type = body.prize_type || 'Orologio di lusso';
    const prize_color = body.prize_color || 'Oro';
    const batchNumber = body.batchNumber || 1;
    const clearExisting = body.clearExisting !== false && batchNumber === 1;
    const requestedCount = Math.min(body.batchSize || 100, 100);

    console.log(`🔐 [CLUE-V7] Batch ${batchNumber}/4 | ${requestedCount} clues | prize_id: ${prize_id}`);

    if (clearExisting) {
      console.log('🗑️ [CLUE-V7] Clearing existing clues...');
      await supabase.from('prize_clues').delete().eq('prize_id', prize_id);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // GENERATE 50 LOCATION + 50 PRIZE PER BATCH (mixed)
    // ═══════════════════════════════════════════════════════════════════════════
    
    const prompt = `Genera ${requestedCount} indizi per M1SSION caccia al tesoro.

CONTESTO SEGRETO (non rivelare mai):
- Luogo: ${city}, ${country}
- Premio: ${prize_type} (${prize_color})
- Batch: ${batchNumber}/4

REGOLE:
1. MAI nominare città/paese/brand direttamente
2. 50% tipo "LOCATION" (dove si trova)
3. 50% tipo "PRIZE" (cosa si vince)
4. 25% con is_decoy:true (falsi credibili)
5. Distribuzione: 25 week 1, 25 week 2, 25 week 3, 25 week 4
6. Week 1=vaghi, Week 4=più precisi (ma mai ovvi)

STILE: Codici, anagrammi, numeri criptici, riferimenti indiretti.
NO: frasi turistiche, Wikipedia, ovvietà.

OUTPUT SOLO JSON (nessun altro testo):
[
{"week":1,"type":"LOCATION","title_it":"Titolo","description_it":"Testo 30-50 parole","difficulty":"LOW","is_decoy":false},
{"week":1,"type":"PRIZE","title_it":"Titolo","description_it":"Testo 30-50 parole","difficulty":"LOW","is_decoy":false},
...
]`;

    console.log('📡 [CLUE-V7] Calling Gemini...');
    
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { 
            temperature: 0.7,  // Lower for more consistent JSON
            maxOutputTokens: 32768,
            topP: 0.9
          }
        })
      }
    );

    if (geminiResponse.status === 429) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Rate limit - riprova tra 1 minuto',
        retryable: true
      }), { headers: corsHeaders(req) });
    }

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error('❌ [CLUE-V7] Gemini error:', errText.substring(0, 300));
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Gemini ${geminiResponse.status}`,
        retryable: true
      }), { headers: corsHeaders(req) });
    }

    const geminiData = await geminiResponse.json();
    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    console.log(`📝 [CLUE-V7] Response length: ${generatedText.length} chars`);

    // ROBUST PARSING
    const clues = extractAndParseJSON(generatedText);
    
    console.log(`📊 [CLUE-V7] Parsed ${clues.length} clues`);

    if (clues.length < 10) {
      console.error('❌ [CLUE-V7] Too few clues parsed');
      console.error('Raw response preview:', generatedText.substring(0, 500));
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Solo ${clues.length} indizi parsati`,
        retryable: true,
        preview: generatedText.substring(0, 300)
      }), { headers: corsHeaders(req) });
    }

    // Transform and validate
    const records = clues.map((c: any, i: number) => {
      const week = Math.min(4, Math.max(1, Number(c.week) || Math.floor(i / 25) + 1));
      const rawType = String(c.type || '').toUpperCase();
      const type = rawType === 'PRIZE' ? 'PRIZE' : 'LOCATION';
      
      return {
        prize_id,
        week,
        type,
        clue_category: type.toLowerCase(),
        clue_type: type.toLowerCase(),
        title_it: String(c.title_it || c.title || 'Indizio').substring(0, 100),
        description_it: String(c.description_it || c.description || '').substring(0, 800),
        difficulty: validateDifficulty(c.difficulty, week),
        cipher_type: null,
        is_decoy: Boolean(c.is_decoy),
        is_fake: Boolean(c.is_decoy),
        difficulty_level: week,
        tier: week,
      };
    });

    // Insert
    const { error: insertError } = await supabase.from('prize_clues').insert(records);

    if (insertError) {
      console.error('❌ [CLUE-V7] Insert error:', insertError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `DB: ${insertError.message}`
      }), { headers: corsHeaders(req) });
    }

    // Stats
    const stats = {
      total: records.length,
      location_clues: records.filter(r => r.type === 'LOCATION').length,
      prize_clues: records.filter(r => r.type === 'PRIZE').length,
      decoy_clues: records.filter(r => r.is_decoy).length,
      week1: records.filter(c => c.week === 1).length,
      week2: records.filter(c => c.week === 2).length,
      week3: records.filter(c => c.week === 3).length,
      week4: records.filter(c => c.week === 4).length,
    };

    console.log(`✅ [CLUE-V7] Batch ${batchNumber} SUCCESS:`, stats);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Batch ${batchNumber}: ${records.length} indizi`,
      clues_generated: records.length,
      batchNumber,
      breakdown: stats
    }), { headers: corsHeaders(req) });

  } catch (error: any) {
    console.error('❌ [CLUE-V7] Fatal:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      retryable: true
    }), { 
      status: 500,
      headers: corsHeaders(req)
    });
  }
});

function validateDifficulty(input: any, week: number): string {
  const valid = ['LOW', 'MEDIUM', 'HIGH', 'INTELLIGENCE'];
  const val = String(input || '').toUpperCase();
  if (valid.includes(val)) return val;
  return ['LOW', 'MEDIUM', 'HIGH', 'INTELLIGENCE'][week - 1] || 'MEDIUM';
}
