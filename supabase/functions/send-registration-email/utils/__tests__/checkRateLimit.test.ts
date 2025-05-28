
import { checkRateLimit } from '../checkRateLimit';

describe('checkRateLimit', () => {
  beforeEach(() => {
    // Clear the in-memory store before each test
    const rateLimitStore = (checkRateLimit as any).__rateLimitStore;
    if (rateLimitStore) {
      rateLimitStore.clear();
    }
  });

  it('should allow first request for user', () => {
    const result = checkRateLimit('user-123');
    
    expect(result.isAllowed).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should deny second request within rate limit window', () => {
    // First request
    checkRateLimit('user-123');
    
    // Second request immediately after
    const result = checkRateLimit('user-123');
    
    expect(result.isAllowed).toBe(false);
    expect(result.error).toBe('Troppi tentativi. Attendi 60 secondi prima di inviare un\'altra email');
    expect(result.statusCode).toBe(429);
  });

  it('should allow request after rate limit window expires', () => {
    // Mock Date.now to control time
    const originalDateNow = Date.now;
    let currentTime = 1000000000;
    Date.now = jest.fn(() => currentTime);

    // First request
    checkRateLimit('user-123');
    
    // Move time forward beyond rate limit window (60 seconds + 1ms)
    currentTime += 60001;
    
    // Second request after window expires
    const result = checkRateLimit('user-123');
    
    expect(result.isAllowed).toBe(true);
    expect(result.error).toBeUndefined();

    // Restore original Date.now
    Date.now = originalDateNow;
  });

  it('should handle different users independently', () => {
    // First user request
    const result1 = checkRateLimit('user-123');
    expect(result1.isAllowed).toBe(true);

    // Different user request should be allowed
    const result2 = checkRateLimit('user-456');
    expect(result2.isAllowed).toBe(true);

    // First user second request should be denied
    const result3 = checkRateLimit('user-123');
    expect(result3.isAllowed).toBe(false);
  });
});
