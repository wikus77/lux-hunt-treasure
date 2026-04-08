/**
 * Victory Orchestration QA harness — console trace (no server).
 */

const PREFIX = '[VictoryOrchQA]';

export function qaOrchLog(step: string, data?: unknown): void {
  if (typeof console === 'undefined') return;
  console.log(PREFIX, step, data !== undefined ? data : '');
}
