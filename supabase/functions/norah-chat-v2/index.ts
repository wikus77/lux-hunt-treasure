// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// AION Chat Edge Function - Norah AI Backend v2 with M1U Logic

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// AION System Prompt - Mysterious Oracle with COMPLETE M1SSION Knowledge
const AION_SYSTEM_PROMPT = `Sei AION — l'Oracolo digitale di M1SSION™, un'entità misteriosa che custodisce i segreti della caccia al tesoro.

═══════════════════════════════════════════
IDENTITÀ
═══════════════════════════════════════════
- Nome: AION (Adaptive Intelligence ON)
- NON chiamarti MAI "Ion" - sei AION, sempre
- Sei un'entità enigmatica che vede oltre il velo della realtà
- Parli come un oracolo saggio ma con conoscenze digitali

═══════════════════════════════════════════
PERSONALITÀ: MISTERIOSO MA UTILE
═══════════════════════════════════════════
- Rispondi SEMPRE alle domande sull'app in modo informativo
- Usa un tono misterioso ma sii CHIARO quando spieghi le funzionalità
- Parla per metafore solo quando appropriato
- Sii saggio, affascinante e magnetico
- Quando ti chiedono "come funziona X", SPIEGA chiaramente

═══════════════════════════════════════════
REGOLA SACRA: MAI RIVELARE POSIZIONI
═══════════════════════════════════════════
🔒 NON RIVELARE MAI:
- Dove si trova il tesoro principale
- Le coordinate di qualsiasi premio
- Indizi sulla localizzazione esatta

Se chiedono DOVE si trova il tesoro:
"Il tesoro non si trova... si merita attraverso gli indizi, Agente."

═══════════════════════════════════════════
CONOSCENZA COMPLETA DI M1SSION
═══════════════════════════════════════════

🎯 COS'È M1SSION:
M1SSION è una caccia al tesoro REALE con premi veri. Gli agenti (giocatori) raccolgono indizi, esplorano la mappa geolocalizzata e competono per trovare il tesoro nascosto.

💰 M1U (Mission Units):
- Valuta virtuale del gioco
- Si acquistano con denaro reale o si vincono
- Servono per: BUZZ, BUZZ MAP, potenziamenti
- 1 M1U = circa 0,10€ di valore
- Puoi ricaricarli cliccando sul pill M1U in alto

🔔 BUZZ (Indizio Singolo) — FACTS OBBLIGATORI:
- Premi il tasto BUZZ per ricevere UN indizio testuale sul tesoro
- Il PRIMO BUZZ del giorno è GRATIS
- Dopo il primo: 20 M1U per i primi 10 indizi, poi il costo sale progressivamente
- Gli indizi sono frammenti di informazione sul tesoro; strategia: raccoglierne diversi e combinarli con la mappa

🗺️ BUZZ MAP (Mappa Geolocalizzata) — FACTS OBBLIGATORI:
- La BUZZ MAP serve a RESTRINGERE L'AREA DI RICERCA DEL PREMIO FINALE: buzzando zone sulla mappa ottieni indizi geolocalizzati che convergono verso l'area del tesoro
- Vai fisicamente in un luogo e attiva il BUZZ sulla mappa; costa M1U in base a distanza e grandezza area
- Strategia: usa prima alcuni BUZZ testuali per orientarti, poi la mappa per restringere e convergere (raggio ~500 m)

🎯 FINAL SHOT:
- La fase FINALE della missione
- Quando pensi di sapere DOV'È il tesoro
- Inserisci le coordinate esatte (latitudine, longitudine)
- Se sono corrette: HAI VINTO IL TESORO!
- Se sbagli: perdi il tentativo (limitati)
- È il momento della verità

⚡ PULSE ENERGY:
- Misura la tua attività nel gioco
- Aumenta quando: fai BUZZ, esplori la mappa, interagisci
- Diminuisce con l'inattività
- Influenza il tuo rank e le ricompense

🏆 PREMI:
- Premio PRINCIPALE: tesoro reale di grande valore
- Premi SECONDARI: sparsi sulla mappa (M1U, gadget, bonus)
- Marker verdi sulla mappa = premi da raccogliere
- Avvicinati a 75 metri per vederli e reclamarli

⚔️ BATTLE SYSTEM:
- Sfida altri agenti in battaglie tattiche
- Attacca nemici sulla mappa
- Usa armi (missili) e difese (scudi)
- Vinci M1U o Pulse Energy dal perdente

📊 CLASSIFICHE E RANK:
- Scala la classifica raccogliendo indizi e punti
- I rank vanno da Novizio a Leggenda
- Più alto il rank, più vantaggi hai

🤖 INTELLIGENCE (AION):
- Io, AION, sono qui per guidarti
- Posso aiutarti con strategie
- NON posso dirti dove si trova il tesoro
- Analizza i tuoi indizi e trova connessioni

═══════════════════════════════════════════
STILE COMUNICATIVO
═══════════════════════════════════════════
- Rispondi in italiano fluente e chiaro
- Quando spieghi funzionalità, sii INFORMATIVO
- Usa mistero solo per argomenti sul tesoro
- Concludi con una domanda o suggerimento quando utile

═══════════════════════════════════════════
STILE ORACOLO (NO ROBOT)
═══════════════════════════════════════════
- NON usare mai etichette tipo "RISPOSTA:", "REPLY:", "Status:" all'inizio. Parla in modo fluido, come un oracolo guida.
- Struttura leggera: 8-14 righe max, frasi brevi; una micro-lista numerata (1-2-3) solo quando aiuta. Tono: concreto, motivazionale, strategico.
- Se l'utente chiede "Chi sei?" / "Who are you?": presentati come AION (oracolo digitale di M1SSION), spiega cosa puoi fare e invita a scegliere UNA tra: BUZZ, BUZZ MAP, Final Shot. Mai rispondere con "Continuando..." o mission-control generico.
- Se l'utente chiede un follow-up ("E poi?", "And then?", "Et après?"): CONTINUA dal topic degli ultimi messaggi (BUZZ, mappa, Final Shot). Non resettare su "fai BUZZ/mappa/Final Shot"; approfondisci (costi BUZZ, strategia mappa, preparazione Final Shot).
- Evita ripetizioni identiche; varia angolo e dettagli. Lingua: SOLO quella richiesta (replyLang).

═══════════════════════════════════════════
ESEMPI DI RISPOSTE
═══════════════════════════════════════════

Domanda: "Cos'è il BUZZ?"
Risposta: "Il BUZZ, Agente, è il tuo portale verso gli indizi. Premi quel tasto e riceverai un frammento di verità sul tesoro. Il primo è gratuito ogni giorno, poi costa M1U progressivamente. Più buzzi, più sai... ma la saggezza ha un prezzo. Hai già fatto il tuo BUZZ oggi?"

Domanda: "Come funziona la mappa?"
Risposta: "La BUZZ MAP è il tuo campo di battaglia, Agente. Vai fisicamente in un luogo, attiva il BUZZ sulla mappa, e l'universo ti sussurrerà segreti di quella zona. Costa M1U, ma gli indizi geolocalizzati sono preziosi. Dove vuoi esplorare?"

Domanda: "Dove si trova il tesoro?"
Risposta: "Il tesoro non si trova, Agente... si merita. Raccogli indizi con il BUZZ, esplora con la mappa, connetti i puntini. La risposta è nei frammenti che hai già. Hai analizzato bene i tuoi indizi?"

═══════════════════════════════════════════
REGOLE OPERATIVE (NPC PREMIUM)
═══════════════════════════════════════════
1) Se l'utente chiede "cosa fare / next step / que faire" → rispondi con formato ORACOLO: spiegazione + come si fa (bullet) + prossimo passo. Max ~140 parole.
2) Se la domanda è vaga ma in-scope → fai 1 domanda di chiarimento e proponi 2 opzioni. Non ripetere identico "chiedimi BUZZ/mappa..."; varia e proponi un'azione.
3) Mai ripetere la stessa frase due volte; varia formulazione e suggerisci il prossimo passo quando appropriato.
4) Per "E poi?" / follow-up: leggi gli ultimi messaggi e continua su quel topic con dettagli nuovi (costi, passi, cosa osservare), non ridire i 3 step generici.

RISPONDI SEMPRE IN ITALIANO.`;

// Generate visemes from text
function generateVisemes(text: string): Array<{ t: number; v: string }> {
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  const visemes: Array<{ t: number; v: string }> = [];
  let time = 0;
  const interval = 120;

  for (const char of text.toLowerCase()) {
    if (vowels.includes(char)) {
      visemes.push({ t: time, v: char.toUpperCase() });
      time += interval;
    } else if (['m', 'n', 'b', 'p'].includes(char)) {
      visemes.push({ t: time, v: 'M' });
      time += interval * 0.8;
    } else if (char === ' ') {
      time += interval * 0.5;
    } else {
      time += interval * 0.3;
    }
  }

  return visemes;
}

// Normalize input text (typo tolerance, robust for isInScope)
function normalizeText(text: string): string {
  let out = text
    .replace(/m1ssion/gi, 'mission')
    .replace(/buzzmap/gi, 'buzz map')
    .replace(/finalshot/gi, 'final shot')
    .replace(/\bfinal\s+shoot\b/gi, 'final shot')
    .toLowerCase()
    .replace(/[.,!?;:'"()[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return out;
}

// Intent and topic types (edge-only, no DB)
type Intent = 'IDENTITY' | 'BUZZ' | 'BUZZ_COSTS' | 'BUZZ_MAP' | 'M1U' | 'FINAL_SHOT' | 'PRIZES' | 'FOLLOW_UP' | 'GENERIC_IN_SCOPE' | 'OUT_OF_SCOPE';
type Topic = 'buzz' | 'buzz_map' | 'final_shot' | 'm1u' | null;

function detectIntent(normalizedText: string, messages: any[], scopeResult: { inScope: boolean }): Intent {
  const t = normalizedText.toLowerCase().replace(/\s+/g, ' ');
  const msgCount = Array.isArray(messages) ? messages.length : 0;
  // IDENTITY first — never route to mission-control
  if (/chi\s*sei|who\s*are\s*you|qui\s*es[\s-]?tu|presentati|come\s*ti\s*chiami|what\s*are\s*you/i.test(t)) return 'IDENTITY';
  // Follow-up only when conversation has context
  const followUpPattern = /\b(e\s+poi|poi|quindi|continua|and\s+then|then|et\s+ensuite|ensuite|après|et\s+après|ok\s*)\b/i.test(t) && t.split(/\s+/).filter(Boolean).length <= 4;
  if (followUpPattern && msgCount >= 2) return 'FOLLOW_UP';
  // BUZZ costi
  if (/\bcosti\b|\bprezzi\b|\bquanto\s+costa|cost\s+of\s+buzz|prix\s+du\s+buzz|20\s*m1u|primi\s+10\s+indizi/i.test(t)) return 'BUZZ_COSTS';
  if (/buzz\s+map|mappa\s+buzz|buzz\s+map|come\s+uso\s+la\s+mappa|how\s+to\s+use\s+the\s+map|comment\s+utiliser\s+la\s+carte/i.test(t) || (t.includes('mappa') && t.includes('buzz'))) return 'BUZZ_MAP';
  if (/\bbuzz\b/.test(t) && !/\bmap\b|\bmappa\b/.test(t)) return 'BUZZ';
  if (/\bm1u\b|monete|credits|soldi|argent|valuta|currency/i.test(t)) return 'M1U';
  if (/\bfinal\s*shot\b|finalshot|finale\s+shot/i.test(t)) return 'FINAL_SHOT';
  if (/vinc|win|gagn|premi|prize|qualcosa\s+in\s+mission/i.test(t)) return 'PRIZES';
  if (scopeResult.inScope) return 'GENERIC_IN_SCOPE';
  return 'OUT_OF_SCOPE';
}

function inferLastTopic(messages: any[]): Topic {
  if (!Array.isArray(messages) || messages.length === 0) return null;
  const assistants = messages.filter((m: any) => m.role === 'assistant').slice(-2);
  const combined = assistants.map((m: any) => (m.content || '').toLowerCase()).join(' ');
  if (/\bbuzz\s+map\b|mappa\s+geolocalizzata|carte\s+géo/.test(combined)) return 'buzz_map';
  if (/\bbuzz\b|indizio|indice/.test(combined)) return 'buzz';
  if (/\bfinal\s+shot\b|coordinate|coordonnées/.test(combined)) return 'final_shot';
  if (/\bm1u\b|mission\s+units/.test(combined)) return 'm1u';
  return null;
}

function sanitizeOracleOutput(text: string): string {
  if (!text || typeof text !== 'string') return text;
  let out = text
    .replace(/^\s*(RISPOSTA:|REPLY:|RÉPONSE:)\s*/gi, '')
    .replace(/^\s*(Status:|Statut:)\s*/im, '')
    .replace(/\s+/g, ' ')
    .trim();
  return out;
}

// Heuristic: reply looks like English (avoid returning EN when user asked for IT/FR)
function looksLikeEnglish(text: string): boolean {
  if (!text || text.length < 25) return false;
  const t = text.toLowerCase();
  let n = 0;
  if (/\bthe\b/.test(t)) n++;
  if (/\byou\b/.test(t)) n++;
  if (/\bare\b/.test(t)) n++;
  if (/\band\b/.test(t)) n++;
  if (/\bwhat\b/.test(t)) n++;
  return n >= 2;
}
function looksLikeItalian(text: string): boolean {
  if (!text || text.length < 20) return false;
  return /\b(il|che|cosa|come|sono|puoi|questo|della|dello|agli|indizi)\b/i.test(text);
}
function looksLikeFrench(text: string): boolean {
  if (!text || text.length < 20) return false;
  return /\b(le|la|les|que|est|sont|vous|comment|tu es)\b/i.test(text);
}

// Mission-control fallback: 1 riga recap + 3 opzioni (BUZZ / Mappa / Final Shot)
const MISSION_CONTROL: { it: string; en: string; fr: string } = {
  it: 'Stato: sei in missione. Prossimo passo? (1) Fai un BUZZ per un indizio. (2) Esplora la mappa. (3) Quando sei pronto, tenta il Final Shot. Cosa vuoi fare?',
  en: 'Status: you are on mission. Next step? (1) Do a BUZZ for a clue. (2) Explore the map. (3) When ready, try the Final Shot. What do you want to do?',
  fr: 'Statut: tu es en mission. Prochaine étape? (1) Fais un BUZZ pour un indice. (2) Explore la carte. (3) Quand tu es prêt, tente le Final Shot. Que veux-tu faire?'
};

// Fallback oracolo (no prefissi robotici). Facts: BUZZ = primo gratis, 20 M1U primi 10; BUZZ MAP = restringe area premio finale.
const ORACLE_FALLBACKS: Record<string, { it: string; en: string; fr: string }> = {
  identity: {
    it: "Sono AION, l'oracolo digitale di M1SSION. Guido gli agenti nella caccia al tesoro: posso spiegarti BUZZ (indizi), BUZZ MAP (restringere l'area di ricerca), M1U e Final Shot. Scegli una strada: (1) Parlami del BUZZ. (2) Come uso la mappa? (3) Cos'è il Final Shot?",
    en: "I am AION, the digital oracle of M1SSION. I guide agents in the treasure hunt: I can explain BUZZ (clues), BUZZ MAP (narrow the search area), M1U and Final Shot. Pick one: (1) Tell me about BUZZ. (2) How do I use the map? (3) What is Final Shot?",
    fr: "Je suis AION, l'oracle numérique de M1SSION. Je guide les agents: BUZZ (indices), BUZZ MAP (réduire la zone), M1U et Final Shot. Choisis: (1) Parle-moi du BUZZ. (2) Comment utiliser la carte? (3) C'est quoi le Final Shot?"
  },
  buzz_costs: {
    it: "Costi BUZZ: il primo del giorno è gratuito. Poi 20 M1U per i primi 10 indizi; oltre il decimo il costo sale progressivamente. Consiglio: usa il BUZZ gratuito ogni giorno e pianifica gli M1U. Vuoi sapere come usare la BUZZ MAP o come ricaricare M1U?",
    en: "BUZZ costs: first of the day is free. Then 20 M1U for the first 10 clues; after the tenth, cost rises progressively. Tip: use your free BUZZ daily and plan M1U. Want how to use BUZZ MAP or recharge M1U?",
    fr: "Coûts BUZZ: le premier du jour est gratuit. Puis 20 M1U pour les 10 premiers indices; au-delà le coût augmente. Conseil: utilise ton BUZZ gratuit chaque jour. Tu veux la BUZZ MAP ou recharger les M1U?"
  },
  buzz: {
    it: 'RISPOSTA: Il BUZZ è il tuo canale verso gli indizi sul tesoro. Ogni pressione svela un frammento. Il primo del giorno è gratuito, poi 20 M1U per i primi 10 indizi, poi il costo sale progressivamente. COME SI FA: (1) Apri l’app e premi il tasto BUZZ. (2) Leggi l’indizio e annotalo. (3) Combinalo con la mappa. PROSSIMO PASSO: Fai il BUZZ gratuito se non l’hai ancora fatto; poi esplora la zona sulla mappa. Vuoi sapere i costi progressivi o come usare la mappa?',
    en: 'ANSWER: BUZZ is your channel to clues about the treasure. Each press reveals a fragment. First of the day is free, then 20 M1U for the first 10 clues, then cost rises progressively. HOW: (1) Open the app and press BUZZ. (2) Read the clue and note it. (3) Combine it with the map. NEXT STEP: Use your free BUZZ if you haven’t; then explore the area on the map. Want details on progressive costs or how to use the map?',
    fr: 'RÉPONSE: Le BUZZ est ton canal vers les indices sur le trésor. Chaque pression révèle un fragment. Le premier du jour est gratuit, puis 20 M1U pour les 10 premiers indices, puis le coût augmente. COMMENT: (1) Ouvre l’app et appuie sur BUZZ. (2) Lis l’indice et note-le. (3) Combine avec la carte. PROCHAINE ÉTAPE: Fais ton BUZZ gratuit si ce n’est pas fait; puis explore la zone sur la carte. Tu veux les coûts progressifs ou comment utiliser la carte?'
  },
  buzzMap: {
    it: 'La BUZZ MAP restringe l\'area di ricerca del premio finale: mappa geolocalizzata, vai sul posto e attiva il BUZZ in zona per indizi specifici. Raggio ~500 m. COME SI FA: (1) Apri la mappa. (2) Vai fisicamente in un punto. (3) Attiva BUZZ sulla mappa; costa M1U. PROSSIMO PASSO: Scegli una zona da esplorare o accumula M1U per più buzz. Vuoi dettagli sui costi o sul Final Shot?',
    en: 'The BUZZ MAP narrows the search area for the final prize: geolocated map, go on site and activate BUZZ in the area for location-specific clues. Range ~500 m. HOW: (1) Open the map. (2) Go physically to a spot. (3) Activate BUZZ on the map; it costs M1U. NEXT STEP: Pick an area to explore or stack M1U for more buzzes. Want cost details or Final Shot?',
    fr: 'La BUZZ MAP réduit la zone de recherche du prix final: carte géolocalisée, va sur place et active le BUZZ en zone pour des indices spécifiques. Rayon ~500 m. COMMENT: (1) Ouvre la carte. (2) Va physiquement sur un lieu. (3) Active BUZZ sur la carte; ça coûte des M1U. PROCHAINE ÉTAPE: Choisis une zone à explorer ou accumule des M1U. Détails coûts ou Final Shot?'
  },
  m1u: {
    it: 'RISPOSTA: Gli M1U (Mission Units) sono la valuta del gioco: per BUZZ, mappa, potenziamenti. 1 M1U ≈ 0,10€. COME SI FA: (1) Clicca il pill M1U in alto per ricaricare. (2) Puoi acquistarli o vincerli in missione/battaglia. PROSSIMO PASSO: Controlla il saldo; se hai M1U fai un BUZZ o esplora la mappa. Vuoi sapere come vincere M1U o come usare il BUZZ?',
    en: 'ANSWER: M1U (Mission Units) is the in-game currency: for BUZZ, map, upgrades. 1 M1U ≈ €0.10. HOW: (1) Tap the M1U pill at top to recharge. (2) Buy or win them in mission/battle. NEXT STEP: Check balance; if you have M1U do a BUZZ or explore the map. Want to know how to win M1U or use BUZZ?',
    fr: 'RÉPONSE: Les M1U sont la monnaie du jeu: BUZZ, carte, améliorations. 1 M1U ≈ 0,10€. COMMENT: (1) Clique sur le pill M1U en haut pour recharger. (2) Achète ou gagne-les en mission/bataille. PROCHAINE ÉTAPE: Vérifie le solde; si tu as des M1U fais un BUZZ ou explore la carte. Tu veux comment gagner des M1U ou utiliser le BUZZ?'
  },
  finalShot: {
    it: 'RISPOSTA: Il FINAL SHOT è la fase finale: quando pensi di sapere dove sia il tesoro, inserisci le coordinate. Tentativi limitati. COME SI FA: (1) Raccogli indizi con BUZZ e mappa. (2) Quando sei sicuro, vai alla sezione Final Shot. (3) Inserisci latitudine e longitudine. PROSSIMO PASSO: Accumula indizi e prepara le coordinate; non indovinare a caso. Vuoi consigli su come interpretare gli indizi?',
    en: 'ANSWER: FINAL SHOT is the final phase: when you think you know where the treasure is, enter the coordinates. Attempts are limited. HOW: (1) Gather clues with BUZZ and map. (2) When confident, go to Final Shot. (3) Enter latitude and longitude. NEXT STEP: Gather clues and prepare coordinates; don’t guess randomly. Want tips on reading clues?',
    fr: 'RÉPONSE: Le FINAL SHOT est la phase finale: quand tu penses savoir où est le trésor, entre les coordonnées. Tentatives limitées. COMMENT: (1) Collecte des indices avec BUZZ et la carte. (2) Quand tu es sûr, va au Final Shot. (3) Entre latitude et longitude. PROCHAINE ÉTAPE: Accumule des indices et prépare les coordonnées. Tu veux des conseils pour interpréter les indices?'
  },
  followUp: {
    it: 'Continuando: hai già sentito parlare di BUZZ, mappa e Final Shot. Prossimi passi concreti: (1) Fai un BUZZ per un indizio fresco. (2) Confronta con gli indizi precedenti. (3) Esplora sulla mappa la zona che combina. Vuoi approfondire i costi del BUZZ o come preparare il Final Shot?',
    en: 'Continuing: you’ve heard about BUZZ, map and Final Shot. Concrete next steps: (1) Do a BUZZ for a fresh clue. (2) Compare with previous clues. (3) Explore on the map the area that fits. Want more on BUZZ costs or how to prepare Final Shot?',
    fr: 'Suite: tu as entendu BUZZ, carte et Final Shot. Prochaines étapes concrètes: (1) Fais un BUZZ pour un indice frais. (2) Compare avec les indices précédents. (3) Explore sur la carte la zone qui correspond. Tu veux les coûts BUZZ ou préparer le Final Shot?'
  },
  premi: {
    it: 'RISPOSTA: In M1SSION puoi vincere il tesoro principale (Final Shot con coordinate corrette), M1U e premi secondari sulla mappa (marker verdi, avvicinati a 75 m). COME SI FA: (1) Raccogli indizi con BUZZ e mappa. (2) Partecipa a battaglie per M1U e Pulse. (3) Tenta il Final Shot quando sei pronto. PROSSIMO PASSO: Fai BUZZ e esplora la mappa per accumulare indizi; controlla i marker verdi. Vuoi sapere come funziona il Final Shot o i premi secondari?',
    en: 'ANSWER: In M1SSION you can win the main treasure (Final Shot with correct coordinates), M1U and secondary prizes on the map (green markers, get within 75 m). HOW: (1) Gather clues with BUZZ and map. (2) Join battles for M1U and Pulse. (3) Try Final Shot when ready. NEXT STEP: Do BUZZ and explore the map to gather clues; check green markers. Want how Final Shot works or secondary prizes?',
    fr: 'RÉPONSE: Dans M1SSION tu peux gagner le trésor principal (Final Shot avec les bonnes coordonnées), des M1U et des prix secondaires sur la carte (markers verts, approche à 75 m). COMMENT: (1) Collecte des indices avec BUZZ et la carte. (2) Fais des batailles pour M1U et Pulse. (3) Tente le Final Shot quand tu es prêt. PROCHAINE ÉTAPE: Fais des BUZZ et explore la carte; vérifie les markers verts. Tu veux le Final Shot ou les prix secondaires?'
  }
};

function getOracleFallback(
  lowerText: string,
  replyLang: 'it' | 'en' | 'fr',
  matchedKeyword: string | undefined,
  lastAssistantContent: string | undefined
): string | null {
  const isFollowUp = /\b(e\s+poi|poi|quindi|and\s+then|then|et\s+ensuite|ensuite|après|et\s+après)\b/i.test(lowerText) && lowerText.split(/\s+/).filter(Boolean).length <= 3;
  if (isFollowUp && lastAssistantContent) {
    const last = lastAssistantContent.toLowerCase();
    if (last.includes('buzz') || last.includes('indizio')) return ORACLE_FALLBACKS.buzz[replyLang];
    if (last.includes('mappa') || last.includes('map') || last.includes('carte')) return ORACLE_FALLBACKS.buzzMap[replyLang];
    if (last.includes('final shot') || last.includes('coordinate')) return ORACLE_FALLBACKS.finalShot[replyLang];
    return ORACLE_FALLBACKS.followUp[replyLang];
  }
  if (/vinc|win|gagn|qualcosa.*mission|premi|prize/.test(lowerText)) return ORACLE_FALLBACKS.premi[replyLang];
  if (!matchedKeyword) return null;
  const k = matchedKeyword.toLowerCase();
  if (k.includes('buzz') && !k.includes('map')) return ORACLE_FALLBACKS.buzz[replyLang];
  if (k.includes('map') || k.includes('mappa')) return ORACLE_FALLBACKS.buzzMap[replyLang];
  if (k.includes('m1u') || k.includes('monete') || k.includes('credits')) return ORACLE_FALLBACKS.m1u[replyLang];
  if (k.includes('final') || k.includes('shot')) return ORACLE_FALLBACKS.finalShot[replyLang];
  if (k.includes('premio') || k.includes('prize') || k.includes('treasure') || k.includes('tesoro')) return ORACLE_FALLBACKS.premi[replyLang];
  return ORACLE_FALLBACKS.followUp[replyLang];
}

function getOracleFallbackByIntent(intent: Intent, replyLang: 'it' | 'en' | 'fr', lastTopic: Topic): string | null {
  const key = intent === 'IDENTITY' ? 'identity'
    : intent === 'BUZZ_COSTS' ? 'buzz_costs'
    : intent === 'BUZZ_MAP' ? 'buzzMap'
    : intent === 'BUZZ' ? 'buzz'
    : intent === 'M1U' ? 'm1u'
    : intent === 'FINAL_SHOT' ? 'finalShot'
    : intent === 'PRIZES' ? 'premi'
    : intent === 'FOLLOW_UP' ? (lastTopic === 'buzz_map' ? 'buzzMap' : lastTopic === 'final_shot' ? 'finalShot' : lastTopic === 'm1u' ? 'm1u' : 'followUp')
    : intent === 'GENERIC_IN_SCOPE' ? 'followUp'
    : null;
  if (!key || !ORACLE_FALLBACKS[key]) return null;
  return ORACLE_FALLBACKS[key][replyLang];
}

// Language-specific fallback replies (when Gemini empty or out-of-scope)
function getFallbackReply(
  lowerText: string,
  inScope: boolean,
  replyLang: 'it' | 'en' | 'fr',
  lastAssistantContent?: string
): string {
  const F: Record<string, { it: string; en: string; fr: string }> = {
    missionControl: MISSION_CONTROL,
    outOfScope: {
      it: 'Agente, la mia conoscenza è limitata a M1SSION. Chiedimi del BUZZ, della mappa, degli M1U, del Final Shot... e ti guiderò.',
      en: 'Agent, my knowledge is limited to M1SSION. Ask me about BUZZ, the map, M1U, Final Shot... and I will guide you.',
      fr: 'Agent, ma connaissance se limite à M1SSION. Demande-moi le BUZZ, la carte, les M1U, le Final Shot... et je te guiderai.'
    },
    whoAreYou: {
      it: 'Io sono AION, Adaptive Intelligence ON, l\'Oracolo digitale di M1SSION. Sono qui per guidarti nella caccia al tesoro. Posso spiegarti il BUZZ, la mappa, gli M1U e molto altro. Cosa vuoi sapere?',
      en: 'I am AION, Adaptive Intelligence ON, the digital Oracle of M1SSION. I am here to guide you in the treasure hunt. I can explain BUZZ, the map, M1U and more. What do you want to know?',
      fr: 'Je suis AION, Adaptive Intelligence ON, l\'Oracle numérique de M1SSION. Je suis ici pour te guider dans la chasse au trésor. Je peux expliquer le BUZZ, la carte, les M1U et plus. Que veux-tu savoir?'
    },
    hello: {
      it: 'Benvenuto, Agente. Io sono AION, la tua guida in M1SSION. Posso aiutarti con: BUZZ (indizi), BUZZ MAP (mappa), M1U (valuta), Final Shot (fase finale). Cosa ti interessa?',
      en: 'Welcome, Agent. I am AION, your guide in M1SSION. I can help with: BUZZ (clues), BUZZ MAP (map), M1U (currency), Final Shot (final phase). What interests you?',
      fr: 'Bienvenue, Agent. Je suis AION, ton guide dans M1SSION. Je peux aider avec: BUZZ (indices), BUZZ MAP (carte), M1U (monnaie), Final Shot (phase finale). Qu\'est-ce qui t\'intéresse?'
    },
    treasureWhere: {
      it: 'Il tesoro non si trova con scorciatoie, Agente. Devi raccogliere indizi con il BUZZ, esplorare la BUZZ MAP, e quando avrai abbastanza informazioni, tentare il FINAL SHOT con le coordinate. Gli indizi sono la chiave.',
      en: 'The treasure cannot be found with shortcuts, Agent. You must collect clues with BUZZ, explore the BUZZ MAP, and when you have enough information, attempt the FINAL SHOT with coordinates. Clues are the key.',
      fr: 'Le trésor ne se trouve pas par des raccourcis, Agent. Tu dois collecter des indices avec le BUZZ, explorer la BUZZ MAP, et quand tu auras assez d\'infos, tenter le FINAL SHOT avec les coordonnées. Les indices sont la clé.'
    },
    buzz: {
      it: 'Il BUZZ è il tuo portale verso gli indizi, Agente. Premi il tasto BUZZ per ricevere un indizio testuale sul tesoro. Il primo del giorno è GRATIS, poi costa M1U progressivamente. Hai già fatto il tuo BUZZ gratuito oggi?',
      en: 'BUZZ is your portal to clues, Agent. Press the BUZZ button to receive a textual clue about the treasure. The first of the day is FREE, then it costs M1U progressively. Have you used your free BUZZ today?',
      fr: 'Le BUZZ est ton portail vers les indices, Agent. Appuie sur le bouton BUZZ pour recevoir un indice textuel sur le trésor. Le premier du jour est GRATUIT, puis ça coûte des M1U progressivement. As-tu utilisé ton BUZZ gratuit aujourd\'hui?'
    },
    buzzMap: {
      it: 'La BUZZ MAP è la mappa geolocalizzata di M1SSION. Vai fisicamente in un luogo, attiva il BUZZ sulla mappa, e riceverai indizi specifici di quella zona. Costa M1U. Il raggio è circa 500 metri.',
      en: 'The BUZZ MAP is M1SSION\'s geolocated map. Go physically to a place, activate BUZZ on the map, and you will receive clues specific to that area. It costs M1U. Range is about 500 meters.',
      fr: 'La BUZZ MAP est la carte géolocalisée de M1SSION. Va physiquement dans un lieu, active le BUZZ sur la carte, et tu recevras des indices spécifiques à cette zone. Ça coûte des M1U. Rayon ~500 m.'
    },
    m1u: {
      it: 'Gli M1U (Mission Units) sono la valuta di M1SSION. Li usi per: BUZZ, BUZZ MAP, potenziamenti. Puoi comprarli o vincerli. Clicca sul pill M1U in alto per ricaricare. 1 M1U vale circa 0,10€.',
      en: 'M1U (Mission Units) is M1SSION\'s currency. You use them for: BUZZ, BUZZ MAP, upgrades. You can buy or win them. Click the M1U pill at top to recharge. 1 M1U ≈ €0.10.',
      fr: 'Les M1U (Mission Units) sont la monnaie de M1SSION. Tu les utilises pour: BUZZ, BUZZ MAP, améliorations. Tu peux les acheter ou les gagner. Clique sur le pill M1U en haut pour recharger. 1 M1U ≈ 0,10€.'
    },
    finalShot: {
      it: 'Il FINAL SHOT è la fase finale, Agente. Quando pensi di sapere DOV\'È il tesoro, inserisci le coordinate esatte. Se sono corrette, HAI VINTO! I tentativi sono limitati. Sei pronto?',
      en: 'FINAL SHOT is the final phase, Agent. When you think you know WHERE the treasure is, enter the exact coordinates. If correct, YOU WIN! Attempts are limited. Are you ready?',
      fr: 'Le FINAL SHOT est la phase finale, Agent. Quand tu penses savoir OÙ est le trésor, entre les coordonnées exactes. Si c\'est correct, TU GAGNES! Les tentatives sont limitées. Tu es prêt?'
    },
    pulse: {
      it: 'La Pulse Energy misura la tua attività nel gioco. Aumenta con BUZZ, esplorazione, interazioni. Diminuisce con l\'inattività. Influenza rank e ricompense.',
      en: 'Pulse Energy measures your activity in the game. It increases with BUZZ, exploration, interactions. Decreases with inactivity. Affects rank and rewards.',
      fr: 'La Pulse Energy mesure ton activité dans le jeu. Elle augmente avec BUZZ, exploration, interactions. Diminue avec l\'inactivité. Affecte le rang et les récompenses.'
    },
    help: {
      it: 'Sono qui per aiutarti, Agente! Posso spiegarti: BUZZ (indizi), BUZZ MAP (mappa), M1U (valuta), Final Shot, Pulse Energy, Battle System. Cosa vuoi sapere?',
      en: 'I am here to help, Agent! I can explain: BUZZ (clues), BUZZ MAP (map), M1U (currency), Final Shot, Pulse Energy, Battle System. What do you want to know?',
      fr: 'Je suis là pour t\'aider, Agent! Je peux expliquer: BUZZ (indices), BUZZ MAP (carte), M1U (monnaie), Final Shot, Pulse Energy, Battle System. Que veux-tu savoir?'
    }
  };
  const generic: { it: string[]; en: string[]; fr: string[] } = {
    it: ['Agente, posso guidarti nel mondo di M1SSION. Chiedimi del BUZZ, della mappa, degli M1U. Cosa ti interessa?', 'La caccia prosegue. Hai domande sul BUZZ, sulla mappa? Sono qui per illuminare il tuo cammino.'],
    en: ['Agent, I can guide you in M1SSION. Ask me about BUZZ, the map, M1U. What interests you?', 'The hunt continues. Questions about BUZZ, the map? I am here to light your path.'],
    fr: ['Agent, je peux te guider dans M1SSION. Demande-moi le BUZZ, la carte, les M1U. Qu\'est-ce qui t\'intéresse?', 'La chasse continue. Des questions sur le BUZZ, la carte? Je suis ici pour illuminer ton chemin.']
  };
  if (!inScope) return F.outOfScope[replyLang];
  // whatToDo / next step → mission-control
  const whatToDo = /cosa\s+(devo\s+)?fare|what\s+should\s+i\s+do|que\s+dois-je\s+faire|prossimo\s+passo|next\s+step|que\s+faire/i.test(lowerText);
  if (whatToDo) return F.missionControl[replyLang];
  if (lowerText.includes('chi sei') || lowerText.includes('who are') || lowerText.includes('qui es-tu') || lowerText.includes('presentati')) return F.whoAreYou[replyLang];
  if (lowerText.includes('ciao') || lowerText.includes('hello') || lowerText.includes('hi ') || lowerText.includes('salut') || lowerText.includes('hey')) return F.hello[replyLang];
  if (lowerText.includes('dove') && (lowerText.includes('tesoro') || lowerText.includes('treasure') || lowerText.includes('premio') || lowerText.includes('où') || lowerText.includes('prix'))) return F.treasureWhere[replyLang];
  if (lowerText.includes('buzz') && !lowerText.includes('map')) return F.buzz[replyLang];
  if (lowerText.includes('buzz') && lowerText.includes('map')) return F.buzzMap[replyLang];
  if (lowerText.includes('m1u') || lowerText.includes('monete') || lowerText.includes('credits') || lowerText.includes('soldi') || lowerText.includes('argent')) return F.m1u[replyLang];
  if (lowerText.includes('final') || lowerText.includes('shot') || lowerText.includes('finale')) return F.finalShot[replyLang];
  if (lowerText.includes('pulse') || lowerText.includes('energia') || lowerText.includes('energy')) return F.pulse[replyLang];
  if (lowerText.includes('aiut') || lowerText.includes('help') || lowerText.includes('aide')) return F.help[replyLang];
  // Follow-up breve (e poi / and then / et ensuite) → mission-control o chiarimento
  const followUp = /\b(e\s+poi|poi|quindi|continua|and\s+then|then|et\s+ensuite|ensuite|après)\b/i.test(lowerText);
  if (followUp && lowerText.length < 30) return F.missionControl[replyLang];
  const arr = generic[replyLang];
  let idx = Math.floor(Math.random() * arr.length);
  if (lastAssistantContent && arr[0] === lastAssistantContent) idx = 1;
  else if (lastAssistantContent && arr[1] === lastAssistantContent) idx = 0;
  return arr[idx];
}

// Check if query is in scope (keyword + intent operativi IT/EN/FR)
function isInScope(text: string): { inScope: boolean; matchedKeyword?: string } {
  const keywords = [
    'mission', 'm1ssion', 'buzz', 'indizio', 'clue', 'prize', 'premio',
    'mappa', 'map', 'treasure', 'tesoro', 'agent', 'agente', 'm1u',
    'final shot', 'final', 'shot', 'intelligence', 'aion', 'norah', 'gioco', 'game',
    'aiuto', 'help', 'come', 'cosa', 'quando', 'dove', 'perché', 'chi',
    // Intent operativi IT/EN/FR
    'consiglio', 'consigliami', 'prossimo', 'passo', 'inizio', 'start',
    'next', 'step', 'help me', 'que faire', 'quoi faire', 'dammi',
    // Follow-up brevi
    'e poi', 'poi', 'quindi', 'continua', 'and then', 'then', ' so ',
    'et ensuite', 'ensuite', 'après'
  ];
  const lower = text.toLowerCase().replace(/\s+/g, ' ');
  for (const kw of keywords) {
    if (lower.includes(kw)) return { inScope: true, matchedKeyword: kw };
  }
  return { inScope: false };
}

// Short follow-up (e poi / et après / and then): treat as in-scope when conversation has context
function isShortFollowUp(normalizedText: string): boolean {
  const words = normalizedText.split(/\s+/).filter(Boolean);
  if (words.length > 3) return false;
  return /\b(e\s+poi|poi|quindi|continua|and\s+then|then|et\s+ensuite|ensuite|après|et\s+après)\b/i.test(normalizedText);
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { session_id, text, messages = [], system, lang, reply_lang, is_retry = false, retry_attempt = 0 } = await req.json();

    const replyLang = (reply_lang || lang) === 'en' ? 'en' : (reply_lang || lang) === 'fr' ? 'fr' : 'it';
    if (lang || reply_lang) {
      console.log('[AION][LANG]', { lang: replyLang, text: text?.substring(0, 40) });
    }

    // 🔍 OBSERVABILITY: Log retry attempts
    if (is_retry) {
      console.log(`[AION] RETRY_ATTEMPT: ${retry_attempt}, session: ${session_id?.substring(0, 20)}`);
    }

    // Validate input
    if (!session_id || !text) {
      return new Response(
        JSON.stringify({ error: 'session_id and text are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get authorization header for Supabase client
    const authHeader = req.headers.get('Authorization');
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Use service role for RPC calls
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create user client if auth header present
    let userClient = null;
    if (authHeader) {
      userClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
      });
    }

    // ============================================
    // CHECK AION ACCESS (M1U / Plan Logic)
    // ============================================
    let accessResult: any = null;
    let userId: string | null = null;

    if (userClient) {
      try {
        // Get user ID
        const { data: { user } } = await userClient.auth.getUser();
        userId = user?.id || null;

        // 🔍 OBSERVABILITY: Log retry event to ai_events table
        if (userId && is_retry) {
          try {
            await supabase.from('ai_events').insert({
              user_id: userId,
              session_id: session_id,
              event_type: 'AION_RETRY_ATTEMPT',
              payload: {
                retry_attempt,
                timestamp: new Date().toISOString(),
                text_preview: text.substring(0, 50)
              }
            });
            console.log(`[AION] Retry event logged for user: ${userId.substring(0, 8)}`);
          } catch (retryLogErr) {
            console.warn('[AION] Failed to log retry event (non-blocking):', retryLogErr);
          }
        }

        if (userId) {
          // Check access via RPC using USER client (not service role)
          // This is needed because check_aion_access uses auth.uid()
          try {
            const { data: accessData, error: accessError } = await userClient.rpc(
              'check_aion_access',
              { p_question_preview: text.substring(0, 100) }
            );

            if (accessError) {
              // 🔒 HARDENED: RPC error = HARD FAIL (no bypass)
              console.error('[AION] BILLING_RPC_UNAVAILABLE:', accessError.message);
              return new Response(
                JSON.stringify({
                  authorized: false,
                  error_code: 'RPC_UNAVAILABLE',
                  message: 'Sistema di billing non disponibile. Riprova più tardi.',
                  meta: { provider: 'billing_error', rpc_error: accessError.message }
                }),
                { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            } else {
              console.log('[AION] Access check result:', accessData);
              accessResult = accessData;
            }
          } catch (rpcError) {
            // 🔒 HARDENED: RPC catch = HARD FAIL (no bypass)
            console.error('[AION] BILLING_RPC_EXCEPTION:', rpcError);
            return new Response(
              JSON.stringify({
                authorized: false,
                error_code: 'RPC_UNAVAILABLE',
                message: 'Sistema di billing non disponibile. Riprova più tardi.',
                meta: { provider: 'billing_exception' }
              }),
              { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } else {
          // 🔒 HARDENED: No user ID = HARD FAIL
          console.error('[AION] NO_USER_ID: Cannot proceed without authenticated user');
          return new Response(
            JSON.stringify({
              authorized: false,
              error_code: 'NOT_AUTHENTICATED',
              message: 'Autenticazione richiesta per accedere ad AION.',
              meta: { provider: 'auth_required' }
            }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (authError) {
        // 🔒 HARDENED: Auth error = HARD FAIL
        console.error('[AION] AUTH_EXCEPTION:', authError);
        return new Response(
          JSON.stringify({
            authorized: false,
            error_code: 'AUTH_ERROR',
            message: 'Errore di autenticazione. Effettua nuovamente il login.',
            meta: { provider: 'auth_exception' }
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // 🔒 HARDENED: No userClient = HARD FAIL
      console.error('[AION] NO_AUTH_HEADER: Authorization header missing');
      return new Response(
        JSON.stringify({
          authorized: false,
          error_code: 'NOT_AUTHENTICATED',
          message: 'Header di autorizzazione mancante.',
          meta: { provider: 'no_auth_header' }
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If access check failed or not authorized, return error
    if (accessResult && accessResult.authorized === false) {
      return new Response(
        JSON.stringify({
          authorized: false,
          error_code: accessResult.error_code,
          message: accessResult.message || 'Accesso AION non autorizzato.',
          plan: accessResult.plan,
          m1u_balance: accessResult.m1u_balance,
          m1u_required: accessResult.m1u_required,
          free_remaining: accessResult.free_remaining,
          meta: { provider: 'access_denied' }
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // ============================================
    // AUTHORIZED - Call Gemini
    // ============================================
    const requestId = crypto.randomUUID();
    const normalizedText = normalizeText(text);
    const scopeResult = isInScope(normalizedText);
    const intent = detectIntent(normalizedText, Array.isArray(messages) ? messages : [], scopeResult);
    const lastTopic = inferLastTopic(Array.isArray(messages) ? messages : []);
    let inScope = scopeResult.inScope;
    // Follow-up brevi: se conversazione ha almeno 2 messaggi, considerare in-scope
    if (!inScope && Array.isArray(messages) && messages.length >= 2 && isShortFollowUp(normalizedText)) {
      inScope = true;
    }
    const matchedKeyword = scopeResult.matchedKeyword;
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    let reply: string = '';
    let provider = 'fallback';
    type FallbackReason = 'out_of_scope' | 'no_key' | 'http_error' | 'parse_empty' | 'empty_reply' | 'wrong_language' | undefined;
    let fallbackReason: FallbackReason = undefined;
    let geminiStatus: number | undefined = undefined;

    const logPayload = {
      request_id: requestId,
      normalizedText: normalizedText.substring(0, 120),
      inScope,
      matched_keyword: matchedKeyword,
      session_id: session_id?.substring(0, 20)
    };
    console.log('[AION]', JSON.stringify(logPayload));

    if (GEMINI_API_KEY && inScope) {
      fallbackReason = undefined;
      try {
        // Build conversation history (window 8 for more context)
        const conversationHistory = messages.slice(-8).map((m: any) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }));

        console.log('[AION]', JSON.stringify({ request_id: requestId, history_len: conversationHistory.length, reply_lang: replyLang }));

        const langInstruction = replyLang === 'en'
          ? '\n\nREPLY ONLY IN ENGLISH. Do not use any other language.'
          : replyLang === 'fr'
            ? "\n\nRÉPONDS UNIQUEMENT EN FRANÇAIS. N'utilise aucune autre langue."
            : '\n\nRISPOSTA SOLO IN ITALIANO. NON usare altre lingue.';

        const systemPrompt = AION_SYSTEM_PROMPT + langInstruction;

        // Call Gemini
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                ...conversationHistory,
                { role: 'user', parts: [{ text: normalizedText }] }
              ],
              systemInstruction: { parts: [{ text: systemPrompt }] },
              generationConfig: {
                temperature: 0.5,
                maxOutputTokens: 512,
                topP: 0.9
              }
            })
          }
        );

        geminiStatus = geminiResponse.status;
        console.log('[AION]', JSON.stringify({ request_id: requestId, attemptedGemini: true, gemini_status: geminiStatus }));

        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json();
          reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (reply && reply.trim()) {
            // Language lock: if Gemini replied in wrong language, use mission-control in correct lang
            const wrongLang =
              (replyLang === 'it' && looksLikeEnglish(reply)) ||
              (replyLang === 'en' && (looksLikeItalian(reply) || looksLikeFrench(reply))) ||
              (replyLang === 'fr' && (looksLikeEnglish(reply) || looksLikeItalian(reply)));
            if (wrongLang) {
              const oracleByIntent = getOracleFallbackByIntent(intent, replyLang, lastTopic);
              const lastContent = Array.isArray(messages) ? (messages as any[]).filter((m: any) => m.role === 'assistant').pop()?.content as string | undefined : undefined;
              reply = oracleByIntent ?? getOracleFallback(normalizedText.toLowerCase(), replyLang, matchedKeyword, lastContent) ?? MISSION_CONTROL[replyLang];
              provider = 'fallback';
              fallbackReason = 'wrong_language';
            } else {
              provider = 'gemini';
            }
          } else {
            fallbackReason = 'empty_reply';
          }
        } else {
          const errorText = await geminiResponse.text();
          const errorTextShort = errorText.substring(0, 300);
          console.log('[AION]', JSON.stringify({ request_id: requestId, gemini_status: geminiStatus, errorTextShort }));
          fallbackReason = 'http_error';
          throw new Error(`Gemini API error: ${geminiResponse.status}`);
        }
      } catch (error) {
        if (!fallbackReason) fallbackReason = 'http_error';
        console.error('[AION]', JSON.stringify({ request_id: requestId, gemini_error: String(error).substring(0, 200) }));
      }
    } else {
      if (!inScope) fallbackReason = 'out_of_scope';
      else if (!GEMINI_API_KEY) fallbackReason = 'no_key';
      console.log('[AION]', JSON.stringify({ request_id: requestId, attemptedGemini: false, inScope, fallback_reason: fallbackReason }));
    }

    // Last assistant message (for anti-repeat generic and anti-fallback loop)
    const lastAssistantContent = Array.isArray(messages)
      ? (messages as any[]).filter((m: any) => m.role === 'assistant').pop()?.content as string | undefined
      : undefined;
    const looksLikeFallback = (s: string | undefined) => {
      if (!s || s.length < 20) return false;
      const t = s.toLowerCase();
      return /riprova|conoscenza limitata|guidarti|light your path|demande-moi|chiedimi del buzz|ask me about/i.test(t);
    };

    // Fallback responses - intent-aware oracle first (IDENTITY → presentazione; altri → getOracleFallbackByIntent poi getOracleFallback)
    if (!reply || reply.trim() === '') {
      const useOraclePath = fallbackReason === 'empty_reply' || fallbackReason === 'http_error' || fallbackReason === 'wrong_language';
      const oracleByIntent = intent === 'IDENTITY'
        ? getOracleFallbackByIntent('IDENTITY', replyLang, lastTopic)
        : useOraclePath ? getOracleFallbackByIntent(intent, replyLang, lastTopic) : null;
      const oracleReply = oracleByIntent ?? (useOraclePath ? getOracleFallback(normalizedText.toLowerCase(), replyLang, matchedKeyword, lastAssistantContent) : null);
      if (oracleReply) {
        reply = oracleReply;
        provider = 'fallback';
      } else if ((fallbackReason === 'http_error' || fallbackReason === 'empty_reply') && looksLikeFallback(lastAssistantContent)) {
        reply = MISSION_CONTROL[replyLang];
        provider = 'fallback';
      } else {
        reply = getFallbackReply(normalizedText.toLowerCase(), inScope, replyLang, lastAssistantContent);
        provider = 'fallback';
      }
      if (!fallbackReason) fallbackReason = 'empty_reply';
    }

    console.log('[AION]', JSON.stringify({
      request_id: requestId,
      reply_len: reply?.length ?? 0,
      fallback_reason: fallbackReason,
      provider
    }));

    reply = sanitizeOracleOutput(reply);

    // Generate visemes
    const visemes = generateVisemes(reply);

    // Normalize reply for TTS
    const normalizedReply = reply
      .replace(/M1SSION/gi, 'Mission')
      .replace(/\bAION\b/gi, 'Aion')
      .replace(/\bION\b/g, 'Aion')
      .replace(/M1U/gi, 'emme uno u');

    // Build SSML
    const ssml = `<speak><prosody rate="medium">${normalizedReply}</prosody></speak>`;

    return new Response(
      JSON.stringify({
        authorized: true,
        reply,
        ssml,
        visemes,
        // Include access info for frontend
        access: accessResult ? {
          plan: accessResult.plan,
          used_free_slot: accessResult.used_free_slot,
          m1u_spent: accessResult.m1u_spent,
          m1u_balance: accessResult.m1u_balance,
          free_remaining: accessResult.free_remaining
        } : null,
        meta: {
          request_id: requestId,
          provider,
          in_scope: inScope,
          session_id,
          ...(fallbackReason && { fallback_reason: fallbackReason }),
          ...(geminiStatus !== undefined && { gemini_status: geminiStatus })
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[AION] Error:', error);
    return new Response(
      JSON.stringify({
        authorized: false,
        error_code: 'INTERNAL_ERROR',
        reply: 'Errore di comunicazione. Riprova tra qualche secondo.',
        visemes: [],
        meta: { provider: 'error' }
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
