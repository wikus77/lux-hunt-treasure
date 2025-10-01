// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Norah Intent Router - Contextual intent detection

import type { NorahContext, NorahIntent } from '@/intel/context/schema';

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Intent patterns (Italian keywords)
const INTENT_PATTERNS: Record<string, RegExp[]> = {
  about_m1ssion: [
    /cos['']?è\s+m1ssion/i,
    /parlami\s+di\s+m1ssion/i,
    /come\s+funziona/i,
    /spiega.*m1ssion/i
  ],
  rules: [
    /regole/i,
    /come\s+si\s+gioca/i,
    /istruzioni/i
  ],
  buzz_help: [
    /buzz/i,
    /come\s+funziona.*buzz/i,
    /indizi/i
  ],
  final_shot: [
    /final\s+shot/i,
    /colpo\s+finale/i,
    /come\s+vincere/i
  ],
  pattern: [
    /pattern/i,
    /schema/i,
    /correlazion/i,
    /analizza.*indizi/i
  ],
  probability: [
    /probabilit[àa]/i,
    /chance/i,
    /possibilit[àa]/i,
    /quanto.*probabile/i
  ],
  profile: [
    /chi\s+sono/i,
    /che\s+agente/i,
    /mio\s+codice/i,
    /agent.*code/i
  ],
  progress: [
    /progress/i,
    /avanzamento/i,
    /quanti\s+indizi/i,
    /stato/i
  ],
  plan: [
    /piano/i,
    /tier/i,
    /abbonamento/i,
    /subscription/i
  ],
  help: [
    /aiuto/i,
    /help/i,
    /cosa\s+puoi/i,
    /comandi/i
  ],
  smalltalk: [
    /ciao/i,
    /buongiorno/i,
    /buonasera/i,
    /come\s+va/i,
    /grazie/i
  ]
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Guard-rail patterns (spoiler prevention)
const SPOILER_PATTERNS = [
  /dove\s+(è|si\s+trova)/i,
  /luogo/i,
  /coordinate/i,
  /indirizzo/i,
  /premio/i,
  /dimmi\s+dove/i,
  /qual['\s]?è\s+il\s+posto/i
];

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
export function routeIntent(input: string, ctx: NorahContext): NorahIntent {
  const normalized = input.toLowerCase().trim();

  // Check for spoiler attempts first
  for (const pattern of SPOILER_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        intent: 'spoiler_guard',
        slots: { query: input },
        confidence: 1.0
      };
    }
  }

  // Match against intent patterns
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(normalized)) {
        return {
          intent,
          slots: extractSlots(intent, normalized, ctx),
          confidence: 0.9
        };
      }
    }
  }

  // Default to help if no match
  return {
    intent: 'help',
    slots: {},
    confidence: 0.5
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
function extractSlots(
  intent: string,
  input: string,
  ctx: NorahContext
): Record<string, any> {
  const slots: Record<string, any> = {
    agentCode: ctx.agentCode,
    displayName: ctx.displayName,
    cluesCount: ctx.stats.cluesTotal,
    buzzToday: ctx.stats.buzzToday,
    planType: ctx.plan?.tier || 'free'
  };

  // Add mission info if available
  if (ctx.mission) {
    slots.missionWeek = ctx.mission.week;
    slots.missionName = ctx.mission.name;
  }

  // Add last clue tag if available
  if (ctx.clues.length > 0 && ctx.clues[0].tag) {
    slots.lastClueTag = ctx.clues[0].tag;
  }

  return slots;
}
