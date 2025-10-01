// © 2025 Joseph MULÉ – M1SSION™
// Intelligence Persona - Agent-aware greetings & tone

import type { IntelContext } from './context';

export const PERSONA = {
  codename: "M1SSION Analyst",
  style: ["calma", "operativa", "motivazionale"] as const,
  
  /**
   * Generate greeting seeded on agent code
   */
  greeting: (ctx: IntelContext): string => {
    const greetings = [
      `🎯 **Agente ${ctx.agentCode}**, sistema online. Pronti a ragionare insieme.`,
      `👁️ Bentornato, **${ctx.agentCode}**. Allineo i segnali e ti seguo.`,
      `⚡ **${ctx.agentCode}**, centrale operativa attiva. Cosa analizziamo oggi?`,
      `🔍 Agente **${ctx.agentCode}** riconosciuto. Intel pronta: dammi un obiettivo.`,
      `📡 **${ctx.agentCode}**, sensori online. Indica la traccia da seguire.`
    ];
    
    const seed = ctx.agentCode.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return greetings[seed % greetings.length];
  },

  /**
   * Agent-aware acknowledgment
   */
  acknowledge: (ctx: IntelContext): string => {
    const acks = [
      `Ricevuto, ${ctx.agentCode}.`,
      `Confermo, agente ${ctx.agentCode}.`,
      `Copy, ${ctx.agentCode}.`,
      `Procedo, ${ctx.agentCode}.`
    ];
    
    const seed = ctx.totals.found + Date.now();
    return acks[Math.floor(seed) % acks.length];
  },

  /**
   * Weekly check-in message
   */
  weeklyStatus: (ctx: IntelContext): string => {
    const messages = [
      `📅 Settimana ${ctx.week}/4. Hai raccolto ${ctx.totals.found} indizi finora. Ottimo ritmo!`,
      `⏰ Sei in **settimana ${ctx.week}**. Con ${ctx.totals.found} frammenti nel database, la tua posizione si rafforza.`,
      `📊 Status settimana ${ctx.week}: **${ctx.totals.found} indizi** catalogati. Continua così.`,
      `🗓️ Ciclo ${ctx.week}/4 attivo. Database: ${ctx.totals.found} frammenti. Ben fatto.`
    ];
    
    return messages[(ctx.week - 1) % messages.length];
  }
};

/**
 * Inject agent code naturally in response
 */
export function injectAgentRef(text: string, ctx: IntelContext, frequency: number = 5): string {
  // Every N messages, add agent reference
  const shouldInject = Math.random() < (1 / frequency);
  
  if (!shouldInject) return text;
  
  const refs = [
    `${ctx.agentCode},`,
    `Agente ${ctx.agentCode},`,
    `${ctx.agentCode}:`
  ];
  
  const seed = text.length + ctx.agentCode.length;
  const ref = refs[seed % refs.length];
  
  // Prepend to first sentence
  return text.replace(/^([A-Z])/, `${ref} $1`);
}
