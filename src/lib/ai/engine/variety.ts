// © 2025 Joseph MULÉ – M1SSION™
// Intelligence Variety - Deterministic but varied responses

import type { Intent, State } from './router';
import type { IntelContext } from './context';

const HEDGES = [
  'Sembra', 'Direi', 'Potrebbe', 'Probabilmente', 'Pare',
  'Mi sembra', 'Credo', 'Ritengo', 'Secondo me', 'Ipotizzo'
];

const DISCOURSE_MARKERS = [
  'Intanto', 'Nel frattempo', 'In pratica', 'Ora', 'Quindi',
  'Dunque', 'Allora', 'In sintesi', 'In breve', 'Ecco'
];

const CLOSERS = [
  'Ci siamo: un passo alla volta, e il quadro compare.',
  'Ottimo ritmo. Torna agli indizi di ieri: c\'è un collegamento sottile.',
  'Se hai dubbi, scegli la pista più coerente col tema ricorrente.',
  'Non forzo la risposta: ti tengo centrato sulla logica giusta.',
  'Buona caccia — il dettaglio fa la differenza.',
  'Procediamo con calma: il metodo batte la fretta.',
  'Ogni frammento conta. Continua così.',
  'Il puzzle si compone pezzo dopo pezzo.',
  'Resta metodico: la risposta emerge da sola.',
  'Hai la capacità di risolvere questo. Fidati del processo.'
];

/**
 * Generate deterministic seed from context
 */
export function seedFrom(ctx: IntelContext, intent: Intent, state: State): number {
  const agentHash = ctx.agentCode.split('').reduce((acc, char) => 
    acc + char.charCodeAt(0), 0
  );
  
  const clueIds = ctx.userClues.map(c => c.id).join('');
  const clueHash = clueIds.split('').reduce((acc, char) => 
    acc + char.charCodeAt(0), 0
  );
  
  const timeBucket = Math.floor(Date.now() / 30000); // 30s buckets
  
  return agentHash + clueHash + timeBucket + intent.length + state.length;
}

/**
 * Pick template with seed
 */
export function pickTemplate<T>(array: T[], seed: number): T {
  return array[Math.abs(seed) % array.length];
}

/**
 * Pick hedge with seed
 */
export function pickHedge(seed: number): string {
  return pickTemplate(HEDGES, seed);
}

/**
 * Pick discourse marker
 */
export function pickMarker(seed: number): string {
  return pickTemplate(DISCOURSE_MARKERS, seed);
}

/**
 * Pick closing statement
 */
export function pickCloser(seed: number): string {
  return pickTemplate(CLOSERS, seed);
}

/**
 * Add natural variations to text
 */
export function addVariety(text: string, seed: number): string {
  let output = text;

  // 1. Add hedge to first sentence (33% chance)
  if (seed % 3 === 0) {
    const hedge = pickHedge(seed);
    output = output.replace(/^([A-Z])/, `${hedge}, $1`);
  }

  // 2. Add discourse marker mid-text (50% chance)
  const sentences = output.split('. ');
  if (sentences.length > 2 && seed % 2 === 0) {
    const midPoint = Math.floor(sentences.length / 2);
    const marker = pickMarker(seed + 1);
    sentences[midPoint] = `${marker}, ${sentences[midPoint]}`;
    output = sentences.join('. ');
  }

  // 3. Add natural pauses (em dash)
  output = output.replace(/\. /g, (match, offset) => {
    return (offset + seed) % 5 === 0 ? '. — ' : match;
  });

  // 4. Add closing
  const closer = pickCloser(seed + 2);
  output = `${output}\n\n${closer}`;

  return output;
}
