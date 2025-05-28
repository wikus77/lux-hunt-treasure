
import { verifyAuthHeader } from '../verifyAuthHeader';

// Mock Supabase client
jest.mock('https://esm.sh/@supabase/supabase-js@2.38.4', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn()
    }
  }))
}));

describe('verifyAuthHeader', () => {
  const mockSupabaseUrl = 'https://test.supabase.co';
  const mockServiceKey = 'test-service-key';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return invalid for missing authorization header', async () => {
    const result = await verifyAuthHeader(null, mockSupabaseUrl, mockServiceKey);
    
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Token di autorizzazione mancante');
    expect(result.statusCode).toBe(401);
  });

  it('should return invalid for invalid authorization format', async () => {
    const result = await verifyAuthHeader('InvalidToken', mockSupabaseUrl, mockServiceKey);
    
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Formato token di autorizzazione non valido');
    expect(result.statusCode).toBe(401);
  });

  it('should return invalid for invalid token', async () => {
    const { createClient } = require('https://esm.sh/@supabase/supabase-js@2.38.4');
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
          error: { message: 'Invalid token' }
        })
      }
    };
    createClient.mockReturnValue(mockSupabase);

    const result = await verifyAuthHeader('Bearer invalid-token', mockSupabaseUrl, mockServiceKey);
    
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Token di autorizzazione non valido');
    expect(result.statusCode).toBe(401);
  });

  it('should return valid for correct token', async () => {
    const { createClient } = require('https://esm.sh/@supabase/supabase-js@2.38.4');
    const mockUser = { id: 'user-123' };
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null
        })
      }
    };
    createClient.mockReturnValue(mockSupabase);

    const result = await verifyAuthHeader('Bearer valid-token', mockSupabaseUrl, mockServiceKey);
    
    expect(result.isValid).toBe(true);
    expect(result.userId).toBe('user-123');
    expect(result.error).toBeUndefined();
  });
});
