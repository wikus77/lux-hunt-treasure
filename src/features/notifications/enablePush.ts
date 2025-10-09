/**
 * Thin wrapper, build-safe.
 * Delegates to the canonical push manager to avoid syntax drift.
 */
import { enableWebPush as coreEnableWebPush } from '@/lib/push/enableWebPush';

export type EnablePushOptions = {
  userId?: string;
  tags?: string[];
  silent?: boolean;
};

export async function enablePush(options: EnablePushOptions = {}) {
  return coreEnableWebPush(options);
}

// Manteniamo anche il default export per compatibilità con gli import esistenti.
export default enablePush;
