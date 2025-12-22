/**
 * M1SSION™ QR Code Utilities
 * Validatori, builders e helpers per il sistema QR
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

// ============================================
// TYPES
// ============================================

export type MissionQrType = 
  | 'LINK'        // Deep-link a pagine interne
  | 'CLAIM'       // Claim reward con token
  | 'INVITE'      // Agent invite
  | 'CHECKPOINT'  // Checkpoint/Area
  | 'BRIEF'       // Mission Brief
  | 'TIME_LOCKED'; // Come CLAIM/LINK ma con expiry

export interface MissionQrConfig {
  type: MissionQrType;
  label: string;
  description?: string;
  targetPath?: string;      // Per LINK
  token?: string;           // Per CLAIM (auto-generato se non fornito)
  agentCode?: string;       // Per INVITE
  checkpointId?: string;    // Per CHECKPOINT
  briefId?: string;         // Per BRIEF
  expiresAt?: Date;         // Per TIME_LOCKED
  rewardAmount?: number;    // Opzionale: M1U o altro
  meta?: Record<string, any>; // Dati extra
}

export interface GeneratedQr {
  url: string;
  token?: string;
  type: MissionQrType;
  label: string;
  expiresAt?: Date;
}

// ============================================
// CONSTANTS
// ============================================

const M1SSION_DOMAIN = 'https://m1ssion.eu';
const ALLOWED_DOMAINS = [
  'https://m1ssion.eu',
  'https://www.m1ssion.eu',
  'm1ssion://' // Deep link scheme (opzionale)
];

// ============================================
// VALIDATORS
// ============================================

/**
 * Valida che un URL sia solo per il dominio M1SSION
 * SECURITY: Blocca tutti i domini esterni
 */
export function validateMissionUrl(url: string): { valid: boolean; error?: string; normalized?: string } {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL non valido' };
  }

  const trimmed = url.trim();

  // Accetta path relativi (es. /map-3d-tiler)
  if (trimmed.startsWith('/')) {
    return { 
      valid: true, 
      normalized: `${M1SSION_DOMAIN}${trimmed}` 
    };
  }

  // Controlla domini consentiti
  const isAllowed = ALLOWED_DOMAINS.some(domain => 
    trimmed.toLowerCase().startsWith(domain.toLowerCase())
  );

  if (!isAllowed) {
    return { 
      valid: false, 
      error: `Dominio non consentito. Solo ${M1SSION_DOMAIN} è permesso.` 
    };
  }

  return { valid: true, normalized: trimmed };
}

/**
 * Genera un token sicuro per CLAIM QR
 * Usa crypto API per sicurezza
 */
export function generateSecureToken(): string {
  // Usa crypto.randomUUID se disponibile (più sicuro)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback con crypto.getRandomValues
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Ultimo fallback (meno sicuro, solo per dev)
  console.warn('[M1QR] Crypto API non disponibile, usando fallback');
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Genera un codice agente per INVITE
 */
export function generateAgentCode(): string {
  const prefix = 'AG';
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  const random = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `${prefix}${timestamp}${random}`;
}

// ============================================
// URL BUILDERS
// ============================================

/**
 * Costruisce l'URL finale per un QR code
 */
export function buildQrUrl(config: MissionQrConfig): GeneratedQr {
  let url: string;
  let token: string | undefined;

  switch (config.type) {
    case 'LINK': {
      const validation = validateMissionUrl(config.targetPath || '/home');
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      url = validation.normalized!;
      break;
    }

    case 'CLAIM': {
      token = config.token || generateSecureToken();
      url = `${M1SSION_DOMAIN}/qr/claim?code=${token}`;
      break;
    }

    case 'INVITE': {
      const agentCode = config.agentCode || generateAgentCode();
      url = `${M1SSION_DOMAIN}/join?ref=${agentCode}`;
      break;
    }

    case 'CHECKPOINT': {
      const checkpointId = config.checkpointId || generateSecureToken();
      url = `${M1SSION_DOMAIN}/checkpoint?id=${checkpointId}`;
      break;
    }

    case 'BRIEF': {
      const briefId = config.briefId || generateSecureToken();
      url = `${M1SSION_DOMAIN}/brief?id=${briefId}`;
      break;
    }

    case 'TIME_LOCKED': {
      token = config.token || generateSecureToken();
      const targetPath = config.targetPath || '/qr/claim';
      const validation = validateMissionUrl(targetPath);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      
      // Aggiungi expiry timestamp
      const exp = config.expiresAt ? Math.floor(config.expiresAt.getTime() / 1000) : '';
      url = `${validation.normalized}?code=${token}${exp ? `&exp=${exp}` : ''}`;
      break;
    }

    default:
      throw new Error(`Tipo QR non supportato: ${config.type}`);
  }

  return {
    url,
    token,
    type: config.type,
    label: config.label,
    expiresAt: config.expiresAt
  };
}

// ============================================
// BATCH GENERATION
// ============================================

/**
 * Genera batch di QR codes
 */
export function generateBatch(
  baseConfig: Omit<MissionQrConfig, 'token'>,
  count: number
): GeneratedQr[] {
  if (count < 1 || count > 100) {
    throw new Error('Il numero di QR deve essere tra 1 e 100');
  }

  const results: GeneratedQr[] = [];
  
  for (let i = 0; i < count; i++) {
    const config: MissionQrConfig = {
      ...baseConfig,
      label: `${baseConfig.label} #${i + 1}`,
      token: undefined // Forza generazione nuovo token
    };
    
    results.push(buildQrUrl(config));
  }

  return results;
}

// ============================================
// EXPIRY HELPERS
// ============================================

/**
 * Controlla se un QR è scaduto
 */
export function isExpired(expiresAt: Date | string | null | undefined): boolean {
  if (!expiresAt) return false;
  
  const expiry = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  return expiry.getTime() < Date.now();
}

/**
 * Formatta la data di scadenza
 */
export function formatExpiry(expiresAt: Date | string | null | undefined): string {
  if (!expiresAt) return 'Mai';
  
  const expiry = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  
  if (isExpired(expiry)) {
    return 'SCADUTO';
  }
  
  return expiry.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ============================================
// QR TYPE LABELS
// ============================================

export const QR_TYPE_LABELS: Record<MissionQrType, { label: string; icon: string; color: string }> = {
  LINK: { label: 'Link Interno', icon: '🔗', color: 'cyan' },
  CLAIM: { label: 'Claim Reward', icon: '🎁', color: 'green' },
  INVITE: { label: 'Agent Invite', icon: '👤', color: 'purple' },
  CHECKPOINT: { label: 'Checkpoint', icon: '📍', color: 'orange' },
  BRIEF: { label: 'Mission Brief', icon: '📋', color: 'blue' },
  TIME_LOCKED: { label: 'Time-Locked', icon: '⏰', color: 'red' }
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™


