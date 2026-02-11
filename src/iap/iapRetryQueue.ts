/**
 * M1SSION™ IAP Retry Queue
 * 
 * Gestisce le transazioni pendenti quando la validazione server fallisce.
 * Implementa retry automatico con exponential backoff.
 * 
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

const QUEUE_KEY = 'm1ssion_iap_pending_validations';
const MAX_ATTEMPTS = 8;
const BACKOFF_DELAYS = [2000, 5000, 15000, 60000, 300000, 600000, 900000, 1800000]; // 2s, 5s, 15s, 1m, 5m, 10m, 15m, 30m

export interface PendingValidation {
  transactionId: string;
  productId: string;
  productCode: string;
  platform: 'ios' | 'android';
  jws?: string;
  receipt?: string;
  originalTransactionId?: string;
  createdAt: string;
  attempts: number;
  lastAttempt?: string;
  lastError?: string;
  status: 'pending' | 'retrying' | 'blocked' | 'completed';
}

// In-memory cache for faster access
let queueCache: PendingValidation[] | null = null;
let retryTimers: Map<string, NodeJS.Timeout> = new Map();

/**
 * Load queue from persistent storage (localStorage)
 */
async function loadQueue(): Promise<PendingValidation[]> {
  if (queueCache !== null) return queueCache;
  
  try {
    const value = localStorage.getItem(QUEUE_KEY);
    queueCache = value ? JSON.parse(value) : [];
    console.log('[IAP_QUEUE] 📂 Loaded queue:', queueCache?.length || 0, 'items');
    return queueCache;
  } catch (e) {
    console.error('[IAP_QUEUE] ❌ Failed to load queue:', e);
    queueCache = [];
    return [];
  }
}

/**
 * Save queue to persistent storage (localStorage)
 */
async function saveQueue(queue: PendingValidation[]): Promise<void> {
  queueCache = queue;
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    console.log('[IAP_QUEUE] 💾 Saved queue:', queue.length, 'items');
  } catch (e) {
    console.error('[IAP_QUEUE] ❌ Failed to save queue:', e);
  }
}

/**
 * Add a pending validation to the queue
 */
export async function addPendingValidation(item: Omit<PendingValidation, 'createdAt' | 'attempts' | 'status'>): Promise<void> {
  const queue = await loadQueue();
  
  // Check if already exists
  const existing = queue.find(q => q.transactionId === item.transactionId);
  if (existing) {
    console.log('[IAP_QUEUE] ⚠️ Transaction already in queue:', item.transactionId);
    return;
  }
  
  const pendingItem: PendingValidation = {
    ...item,
    createdAt: new Date().toISOString(),
    attempts: 0,
    status: 'pending',
  };
  
  queue.push(pendingItem);
  await saveQueue(queue);
  
  console.log('[IAP_QUEUE] ➕ Added to queue:', {
    transactionId: item.transactionId,
    productId: item.productId,
    queueSize: queue.length,
  });
}

/**
 * Update a pending validation in the queue
 */
export async function updatePendingValidation(
  transactionId: string, 
  updates: Partial<PendingValidation>
): Promise<void> {
  const queue = await loadQueue();
  const index = queue.findIndex(q => q.transactionId === transactionId);
  
  if (index === -1) {
    console.warn('[IAP_QUEUE] ⚠️ Transaction not found for update:', transactionId);
    return;
  }
  
  queue[index] = { ...queue[index], ...updates };
  await saveQueue(queue);
}

/**
 * Remove a completed validation from the queue
 */
export async function removePendingValidation(transactionId: string): Promise<void> {
  const queue = await loadQueue();
  const filtered = queue.filter(q => q.transactionId !== transactionId);
  
  // Cancel any pending retry timer
  const timer = retryTimers.get(transactionId);
  if (timer) {
    clearTimeout(timer);
    retryTimers.delete(transactionId);
  }
  
  await saveQueue(filtered);
  console.log('[IAP_QUEUE] ✅ Removed from queue:', transactionId);
}

/**
 * Get all pending validations
 */
export async function getPendingValidations(): Promise<PendingValidation[]> {
  return loadQueue();
}

/**
 * Get pending count
 */
export async function getPendingCount(): Promise<number> {
  const queue = await loadQueue();
  return queue.filter(q => q.status === 'pending' || q.status === 'retrying').length;
}

/**
 * Calculate next retry delay using exponential backoff
 */
export function getRetryDelay(attempts: number): number {
  const index = Math.min(attempts, BACKOFF_DELAYS.length - 1);
  return BACKOFF_DELAYS[index];
}

/**
 * Check if should retry based on attempts
 */
export function shouldRetry(attempts: number): boolean {
  return attempts < MAX_ATTEMPTS;
}

/**
 * Schedule a retry for a pending validation
 */
export function scheduleRetry(
  transactionId: string, 
  delayMs: number, 
  retryFn: () => Promise<void>
): void {
  // Cancel existing timer
  const existing = retryTimers.get(transactionId);
  if (existing) {
    clearTimeout(existing);
  }
  
  console.log('[IAP_QUEUE] ⏰ Scheduling retry in', delayMs, 'ms for:', transactionId);
  
  const timer = setTimeout(async () => {
    retryTimers.delete(transactionId);
    try {
      await retryFn();
    } catch (e) {
      console.error('[IAP_QUEUE] ❌ Retry failed:', e);
    }
  }, delayMs);
  
  retryTimers.set(transactionId, timer);
}

/**
 * Cancel all pending retries
 */
export function cancelAllRetries(): void {
  retryTimers.forEach((timer) => clearTimeout(timer));
  retryTimers.clear();
  console.log('[IAP_QUEUE] 🛑 All retries cancelled');
}

/**
 * Mark a validation as blocked (hard error, needs user action)
 */
export async function markAsBlocked(transactionId: string, error: string): Promise<void> {
  await updatePendingValidation(transactionId, {
    status: 'blocked',
    lastError: error,
    lastAttempt: new Date().toISOString(),
  });
  console.log('[IAP_QUEUE] 🚫 Marked as blocked:', transactionId, error);
}

/**
 * Check if error is retriable (network) vs hard (auth/validation)
 */
export function isRetriableError(error: string | undefined): boolean {
  if (!error) return true;
  
  const hardErrors = [
    '401', 'unauthorized', '403', 'forbidden', 
    'invalid', 'expired', 'duplicate', 'already processed'
  ];
  
  const lowerError = error.toLowerCase();
  return !hardErrors.some(h => lowerError.includes(h));
}

/**
 * Clear the entire queue (use with caution)
 */
export async function clearQueue(): Promise<void> {
  cancelAllRetries();
  queueCache = [];
  localStorage.removeItem(QUEUE_KEY);
  console.log('[IAP_QUEUE] 🗑️ Queue cleared');
}

/**
 * Clear stale pending validations older than maxAgeMs (default 24h)
 * This prevents buildup of old failed transactions causing retry storms
 */
export async function clearStalePendingValidations(maxAgeMs: number = 24 * 60 * 60 * 1000): Promise<number> {
  const queue = await loadQueue();
  const now = Date.now();
  
  const freshItems = queue.filter(item => {
    const createdAt = new Date(item.createdAt).getTime();
    const age = now - createdAt;
    const isStale = age > maxAgeMs;
    
    if (isStale) {
      console.log('[IAP_QUEUE] 🗑️ Removing stale item:', item.transactionId, 'age:', Math.round(age / 3600000), 'hours');
      // Cancel any pending timer
      const timer = retryTimers.get(item.transactionId);
      if (timer) {
        clearTimeout(timer);
        retryTimers.delete(item.transactionId);
      }
    }
    
    return !isStale;
  });
  
  const removedCount = queue.length - freshItems.length;
  
  if (removedCount > 0) {
    await saveQueue(freshItems);
    console.log('[IAP_QUEUE] 🧹 Cleared', removedCount, 'stale pending validations');
  }
  
  return removedCount;
}

// Global rate limit tracking
let lastRateLimitTime: number = 0;
const RATE_LIMIT_COOLDOWN_MS = 60000; // 1 minute cooldown after 429

/**
 * Check if we're in rate limit cooldown
 */
export function isRateLimited(): boolean {
  if (lastRateLimitTime === 0) return false;
  const elapsed = Date.now() - lastRateLimitTime;
  return elapsed < RATE_LIMIT_COOLDOWN_MS;
}

/**
 * Mark that we hit a rate limit
 */
export function markRateLimited(): void {
  lastRateLimitTime = Date.now();
  console.log('[IAP_QUEUE] 🚫 Rate limit detected - cooling down for', RATE_LIMIT_COOLDOWN_MS / 1000, 'seconds');
  cancelAllRetries(); // Stop all pending retries
}

/**
 * Get time remaining in rate limit cooldown
 */
export function getRateLimitCooldownRemaining(): number {
  if (!isRateLimited()) return 0;
  return RATE_LIMIT_COOLDOWN_MS - (Date.now() - lastRateLimitTime);
}
