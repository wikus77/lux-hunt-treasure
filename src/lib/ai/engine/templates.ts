// © 2025 Joseph MULÉ – M1SSION™
// Intelligence Templates - 250 responses organized by intent/state

import type { Intent, State } from './router';
import type { IntelContext } from './context';
import type { Analysis } from './heuristics';
import { ANALYST_TEMPLATES } from '../analystTemplates';

export type TemplateContext = {
  ctx: IntelContext;
  analysis: Analysis;
  hedges: string;
  marker: string;
  closer: string;
};

export type TemplateFn = (tc: TemplateContext) => string;

/**
 * Convert static templates to template functions
 */
function staticToFn(template: string): TemplateFn {
  return (tc) => {
    let output = template;
    
    // Replace placeholders with context
    output = output.replace(/\{agentCode\}/g, tc.ctx.agentCode);
    output = output.replace(/\{clueCount\}/g, tc.ctx.userClues.length.toString());
    output = output.replace(/\{week\}/g, tc.ctx.week.toString());
    
    // Add keyword if analysis has them
    if (tc.analysis.keywords.length > 0 && Math.random() > 0.5) {
      const keyword = tc.analysis.keywords[0];
      output += ` Noto ricorrenze su: "${keyword}".`;
    }
    
    return output;
  };
}

/**
 * Organize templates by intent and state
 */
export const TEMPLATES: Record<Intent, Record<State, TemplateFn[]>> = {
  about: {
    idle: [
      () => `M1SSION è una caccia al tesoro moderna: trovi indizi, unisci i puntini e avanzi verso il Final Shot. Ogni BUZZ sblocca nuove tracce; io ti aiuto a organizzarle, collegarle e interpretarle senza rivelare soluzioni. Sei tu a risolvere: io sono il tuo compagno di missione.`,
      () => `In breve: M1SSION è un percorso di scoperta. Indizi sparsi, segnali da intercettare, decisioni tattiche. Io resto al tuo fianco per ordinare le informazioni e darti traiettorie, senza spoiler. Quando sei pronto, Final Shot ti aspetta.`,
      () => `Pensa a M1SSION come a un'indagine seriale: ogni indizio apre una pista. Il mio ruolo? Farti ragionare meglio: classifico, trovo pattern, decodifico l'essenziale. Niente soluzioni pronte — solo vantaggi leali. Buona caccia.`
    ],
    collect: [], analyze: [], advise: []
  },

  classify: {
    collect: [
      (tc) => `Con solo ${tc.ctx.userClues.length} indizi è presto per classificare. Raccogli almeno 3-5 frammenti, poi possiamo dividerli per categoria.`
    ],
    analyze: ANALYST_TEMPLATES.classify.slice(0, 30).map(staticToFn),
    advise: ANALYST_TEMPLATES.classify.slice(30).map(staticToFn),
    idle: []
  },

  patterns: {
    collect: [
      (tc) => `Servono almeno 3 indizi per trovare pattern significativi. Ora ne hai ${tc.ctx.userClues.length}. Usa BUZZ per sbloccare altri frammenti.`
    ],
    analyze: ANALYST_TEMPLATES.patterns.slice(0, 35).map(staticToFn),
    advise: ANALYST_TEMPLATES.patterns.slice(35).map(staticToFn),
    idle: []
  },

  decode: {
    collect: [
      (tc) => `Nessun frammento da decodificare. Raccogli indizi con pattern numerici o testuali strani, poi riprova.`
    ],
    analyze: ANALYST_TEMPLATES.decode.slice(0, 30).map(staticToFn),
    advise: [
      (tc) => {
        if (tc.analysis.decoded.length > 0) {
          return `Ho provato alcune decodifiche:\n${tc.analysis.decoded.join('\n')}\nVerifica se qualcuna ha senso nel contesto.`;
        }
        return `Nessuna decodifica base ha funzionato. Può essere un codice custom o un red herring.`;
      },
      ...ANALYST_TEMPLATES.decode.slice(30).map(staticToFn)
    ],
    idle: []
  },

  probability: {
    collect: [
      (tc) => `Con ${tc.ctx.userClues.length} indizi, la probabilità è ancora **bassa**. Serve una base di 5-8 frammenti per valutazioni solide.`
    ],
    analyze: ANALYST_TEMPLATES.probability.slice(0, 25).map(staticToFn),
    advise: [
      (tc) => {
        const confidence = Math.round(tc.analysis.confidence * 100);
        const tier = confidence < 30 ? 'Bassa' : confidence < 60 ? 'Media' : 'Buona';
        return `Con ${tc.ctx.userClues.length} indizi e analisi incrociate, stimo confidenza **${tier}** (~${confidence}%). ${
          confidence < 60 
            ? 'Raccogli ancora 2-3 frammenti per aumentarla.' 
            : 'Sei in buona posizione: cerca ora le connessioni finali.'
        }`;
      },
      ...ANALYST_TEMPLATES.probability.slice(25).map(staticToFn)
    ],
    idle: []
  },

  mentor: {
    idle: ANALYST_TEMPLATES.mentor.slice(0, 15).map(staticToFn),
    collect: [
      (tc) => `📥 Fase raccolta attiva. Hai ${tc.ctx.userClues.length} frammenti: ottimo inizio. Continua con BUZZ, eventi e QR per raggiungere i 5-8 indizi necessari all'analisi seria.`,
      ...ANALYST_TEMPLATES.mentor.slice(15, 30).map(staticToFn)
    ],
    analyze: ANALYST_TEMPLATES.mentor.slice(30, 45).map(staticToFn),
    advise: ANALYST_TEMPLATES.mentor.slice(45).map(staticToFn)
  }
};

/**
 * Get templates for intent/state combo
 */
export function getTemplates(intent: Intent, state: State): TemplateFn[] {
  const templates = TEMPLATES[intent]?.[state] || [];
  
  // Fallback to mentor/idle if no templates
  if (templates.length === 0) {
    return TEMPLATES.mentor.idle;
  }
  
  return templates;
}
