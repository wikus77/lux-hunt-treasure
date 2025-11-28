// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// ElevenLabs TTS Edge Function - Natural voice synthesis

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Voci italiane ElevenLabs (ID delle voci multilingual)
const VOICES = {
  // Voci predefinite ElevenLabs (multilingual, supportano italiano)
  'rachel': 'EXAVITQu4vr4xnSDxMaL',      // Femminile, calda
  'domi': 'AZnzlk1XvdvUeBnXmlld',        // Femminile, forte  
  'bella': 'EXAVITQu4vr4xnSDxMaL',       // Femminile, morbida
  'antoni': 'ErXwobaYiN019PkySvjV',      // Maschile, profondo
  'josh': 'TxGEqnHWrfWFTfGW9XjX',        // Maschile, narratore
  'arnold': 'VR6AewLTigWG4xSOukaG',      // Maschile, potente
  'adam': 'pNInz6obpgDQGcFmaJgB',        // Maschile, profondo
  'sam': 'yoZ06aMxZJJ28mfd3POQ',         // Maschile, rauco
  'callum': 'N2lVS1w4EtoT3dr4eOWO',      // Maschile, britannico, intenso
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, voice = 'callum' } = await req.json();

    console.log('[TTS] Request:', { textLength: text?.length, voice });

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');

    if (!ELEVENLABS_API_KEY) {
      console.error('[TTS] ElevenLabs API key not configured!');
      return new Response(
        JSON.stringify({ error: 'ElevenLabs API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalizza il testo per pronuncia corretta
    const normalizedText = text
      .replace(/M1SSION/gi, 'Mission')
      .replace(/\bAION\b/gi, 'Aion')
      .replace(/\bION\b/g, 'Aion')
      .replace(/M1U/gi, 'emme uno u')
      .replace(/[™®©]/g, '');

    // Get voice ID
    const voiceId = VOICES[voice] || VOICES['rachel'];

    // Call ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: normalizedText,
          model_id: 'eleven_multilingual_v2',  // Supporta italiano
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true
          }
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('[TTS] ElevenLabs error:', error);
      return new Response(
        JSON.stringify({ error: 'ElevenLabs TTS failed', details: error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get audio as ArrayBuffer
    const audioBuffer = await response.arrayBuffer();
    
    // Convert to base64
    const base64Audio = btoa(
      new Uint8Array(audioBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    return new Response(
      JSON.stringify({
        audio: base64Audio,
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

