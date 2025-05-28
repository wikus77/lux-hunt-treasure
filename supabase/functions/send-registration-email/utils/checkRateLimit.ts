
// Rate limiting utility

export interface RateLimitResult {
  isAllowed: boolean;
  error?: string;
  statusCode?: number;
}

// In-memory rate limiting store (simple implementation)
const rateLimitStore = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60000; // 60 seconds

// Rate limiting check
export const checkRateLimit = (identifier: string): RateLimitResult => {
  const now = Date.now();
  const lastRequest = rateLimitStore.get(identifier);
  
  if (lastRequest && (now - lastRequest) < RATE_LIMIT_WINDOW) {
    console.error(`Rate limit exceeded for user: ${identifier}`);
    return {
      isAllowed: false,
      error: "Troppi tentativi. Attendi 60 secondi prima di inviare un'altra email",
      statusCode: 429
    };
  }
  
  rateLimitStore.set(identifier, now);
  return { isAllowed: true };
};
