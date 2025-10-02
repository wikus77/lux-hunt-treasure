// © 2025 Joseph MULÉ – M1SSION™ – NORAH AI Answer Blueprint
// Coach-first response formatter

import type { IntentResult } from './intentRouter';

export interface AnswerSection {
  direct: string;           // Risposta diretta (max 2 frasi)
  details: string[];        // Dettagli contestuali (max 3 bullet)
  ctas: string[];           // Call-to-action (max 3)
  motivation: string;       // Spinta motivazionale (1 riga)
}

export interface BlueprintInput {
  intentResult: IntentResult;  // Full intent result from router
  ragChunks?: Array<{ title: string; chunk_text: string; similarity: number }>;
  toolResults?: Record<string, any>;
  userContext?: any;
}

/**
 * Format answer using coach-first blueprint
 */
export function formatAnswer(input: BlueprintInput): AnswerSection {
  const { intentResult, ragChunks = [], toolResults = {} } = input;
  const intent = intentResult.intent;

  const answer: AnswerSection = {
    direct: '',
    details: [],
    ctas: [],
    motivation: ''
  };

  // Map old intents to broader categories
  const isDefineIntent = intent === 'about_buzz' || intent === 'about_finalshot' || 
                         intent === 'about_mission' || intent === 'diff_buzz_vs_map';
  const isHowtoIntent = intent === 'rules' || intent === 'help_start' || intent === 'rules_short';
  const isStatusIntent = intent === 'progress' || intent === 'profile';
  const isMotivateIntent = intent === 'mentor';
  const isSmallTalkIntent = intent === 'smalltalk' || intent === 'saluto';

  // DEFINE intent (info/explanation)
  if (isDefineIntent) {
    if (ragChunks.length > 0) {
      const topChunk = ragChunks[0];
      answer.direct = `Secondo i documenti M1SSION: ${topChunk.chunk_text.substring(0, 150)}...`;
      
      if (intent === 'about_buzz' || intent === 'diff_buzz_vs_map') {
        answer.details = [
          '**BUZZ** = Sistema di localizzazione premi tramite GPS',
          '**BUZZ Map** = Mappa interattiva per visualizzare la zona',
          'Il BUZZ genera un raggio, la BUZZ Map te lo mostra visivamente'
        ];
        answer.ctas = ['Apri BUZZ', 'Apri Mappa', 'Regole BUZZ'];
      } else if (intent === 'about_finalshot') {
        answer.details = [
          'Tentativo finale per trovare il premio esatto',
          'Massimo 2 tentativi al giorno per missione',
          'Disponibile solo dopo aver raccolto abbastanza indizi'
        ];
        answer.ctas = ['Prepara Final Shot', 'Vedi Indizi', 'Strategia'];
      } else if (intent === 'about_mission') {
        answer.details = [
          'M1SSION è una treasure hunt reale con premi fisici',
          'Raccogli indizi, usa BUZZ, trova il premio',
          'Ogni settimana nuove missioni e premi'
        ];
        answer.ctas = ['Inizia Missione', 'Vedi Premi', 'Come Funziona'];
      }
    } else {
      answer.direct = 'M1SSION è un gioco di caccia al tesoro reale. Ti serve più contesto?';
      answer.ctas = ['Info BUZZ', 'Info Missioni', 'Parla con me'];
    }
    
    answer.motivation = '🎯 Ogni risposta ti avvicina al premio!';
  }

  // HOWTO intent
  if (isHowtoIntent) {
    if (ragChunks.length > 0) {
      answer.direct = `Ecco come procedere: ${ragChunks[0].chunk_text.substring(0, 120)}`;
      answer.details = ragChunks.slice(0, 3).map(c => `• ${c.chunk_text.substring(0, 80)}...`);
    } else {
      answer.direct = 'Ti serve una guida passo-passo?';
      answer.details = [
        'Posso aiutarti con BUZZ, BUZZ Map o Final Shot',
        'Dimmi quale procedura ti serve!'
      ];
    }
    answer.ctas = ['Guida BUZZ', 'Guida Final Shot', 'FAQ'];
    answer.motivation = '📚 Conoscere la procedura è metà del successo!';
  }

  // ACTION intent (buzz_map)
  if (intent === 'buzz_map') {
    if (intentResult.needs_tool?.includes('get_nearby_prizes')) {
      const nearbyData = toolResults.get_nearby_prizes;
      if (nearbyData && nearbyData.prizes) {
        answer.direct = `Ci sono ${nearbyData.prizes.length} premi nelle vicinanze!`;
        answer.details = nearbyData.prizes.slice(0, 3).map((p: any) => 
          `• ${p.title} a ${p.distance_m}m`
        );
        answer.ctas = ['Apri Mappa', 'Filtra Premi', 'Navigazione'];
      } else {
        answer.direct = 'Al momento non vedo premi vicini. Prova ad esplorare un\'altra zona!';
        answer.ctas = ['Apri Mappa', 'Zone Consigliate'];
      }
    } else {
      answer.direct = 'La BUZZ Map ti mostra la zona di ricerca visivamente!';
      answer.ctas = ['Apri Mappa', 'Info BUZZ', 'Tutorial'];
    }
    answer.motivation = '⚡ L\'azione porta risultati!';
  }

  // STATUS intent
  if (isStatusIntent) {
    const userData = toolResults.get_user_state;
    if (userData) {
      answer.direct = `Ecco il tuo stato: ${userData.clues_found} indizi trovati, tier ${userData.tier}.`;
      answer.details = [
        `XP: ${userData.xp}`,
        `Livello: ${userData.level}`,
        `BUZZ disponibili: ${userData.buzz_count || 0}`
      ];
      answer.ctas = ['Vedi Profilo', 'Prossimi Obiettivi', 'Statistiche'];
    } else {
      answer.direct = 'Carico il tuo stato...';
    }
    answer.motivation = '🎖️ Continua così, agente!';
  }

  // BUG/HELP intent (support needed)
  if (intent === 'help' && intentResult.needs_tool?.includes('open_support_ticket')) {
    answer.direct = 'Mi dispiace per il problema! Apro subito un ticket di supporto.';
    answer.details = [
      'Il team M1SSION riceverà la segnalazione',
      'Ti risponderanno entro 24-48h',
      'Puoi continuare a usare le funzioni disponibili'
    ];
    answer.ctas = ['Torna Home', 'FAQ Comuni', 'Chat Supporto'];
    answer.motivation = '🛠️ Sistemeremo tutto al più presto!';
  }

  // MOTIVATE intent
  if (isMotivateIntent) {
    answer.direct = 'Sei sulla strada giusta! Ogni indizio conta.';
    answer.details = [
      'Concentrati su una zona alla volta',
      'Usa BUZZ per restringere il campo',
      'Il Final Shot arriva quando sei pronto'
    ];
    answer.ctas = ['Strategia', 'Prossima Mossa', 'Community'];
    answer.motivation = '💪 Tu puoi farcela!';
  }

  // SMALLTALK intent
  if (isSmallTalkIntent) {
    answer.direct = 'Ciao! Sono NORAH, la tua assistente M1SSION. Come posso aiutarti oggi?';
    answer.ctas = ['Info BUZZ', 'Stato Missione', 'FAQ'];
    answer.motivation = '🌟 Pronta a supportarti!';
  }

  // UNKNOWN or low confidence → clarify
  if (intent === 'unknown' || intent === 'help' || intentResult.confidence < 0.55) {
    if (intentResult.slots?.suggestedIntents) {
      const suggestions = intentResult.slots.suggestedIntents as string[];
      answer.direct = 'Non sono sicura di aver capito. Vuoi info su:';
      answer.ctas = suggestions.slice(0, 3).map(i => `Info ${i}`);
    } else {
      answer.direct = 'Non sono sicura di aver capito. Vuoi sapere di BUZZ, Final Shot o altro?';
      answer.ctas = ['Info BUZZ', 'Info Final Shot', 'Regole M1SSION'];
    }
    answer.motivation = '❓ Chiedi pure, sono qui per te!';
  }

  return answer;
}

/**
 * Render answer to markdown string with ENFORCED blueprint structure
 */
export function renderAnswer(answer: AnswerSection): string {
  // (1) Direct answer (≤2 sentences)
  let md = `${answer.direct}\n\n`;
  
  // (2) Details (2-3 contextual bullets)
  if (answer.details.length > 0) {
    md += answer.details.slice(0, 3).join('\n') + '\n\n';
  }
  
  // (3) CTAs (2-3 actions) - MANDATORY for DEFINE/HOWTO/STATUS
  if (answer.ctas.length > 0) {
    md += `**Prossime mosse:**\n`;
    md += answer.ctas.slice(0, 3).map(cta => `🎯 ${cta}`).join('\n') + '\n\n';
  } else {
    // Fallback CTAs if none provided (should never happen with proper intent routing)
    md += `**Prossime mosse:**\n🎯 Apri regole complete\n🎯 Visualizza tutorial\n\n`;
  }
  
  // (4) Motivation (1 line closer)
  md += answer.motivation;
  
  return md;
}
