// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Google Cloud TTS Edge Function - Natural voice synthesis

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, voice = 'it-IT-Wavenet-A' } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Usa la stessa API key di Gemini (deve avere Cloud TTS abilitato)
    const GOOGLE_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!GOOGLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Google API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalizza il testo
    const normalizedText = text
      .replace(/M1SSION/gi, 'Mission')
      .replace(/\bAION\b/gi, 'Aion')
      .replace(/\bION\b/g, 'Aion')
      .replace(/M1U/gi, 'emme uno u')
      .replace(/[™®©]/g, '');

    // Google Cloud Text-to-Speech API
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text: normalizedText },
          voice: {
            languageCode: 'it-IT',
            name: voice,  // it-IT-Wavenet-A (female) or it-IT-Wavenet-C (male)
            ssmlGender: 'FEMALE'
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 1.0,
            pitch: 0.0,
            volumeGainDb: 0.0
          }
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('[TTS] Google Cloud error:', error);
      
      // Se Cloud TTS non è abilitato, prova con un fallback
      return new Response(
        JSON.stringify({ 
          error: 'Google Cloud TTS not enabled',
          hint: 'Enable Cloud Text-to-Speech API in Google Cloud Console'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
    return new Response(
      JSON.stringify({
        audio: data.audioContent,  // Base64 encoded
        format: 'mp3',
        voice: voice
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[TTS] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});




