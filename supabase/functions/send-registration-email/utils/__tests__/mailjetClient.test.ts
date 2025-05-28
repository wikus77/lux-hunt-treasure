
import { initializeMailjetClient } from '../mailjetClient';

// Mock mailjet
jest.mock('npm:node-mailjet@6.0.0', () => ({
  apiConnect: jest.fn()
}));

// Mock Deno.env
const mockEnv = {
  get: jest.fn()
};
global.Deno = { env: mockEnv } as any;

describe('initializeMailjetClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return error when public API key is missing', () => {
    mockEnv.get.mockImplementation((key: string) => {
      if (key === 'MJ_APIKEY_PUBLIC') return null;
      if (key === 'MJ_APIKEY_PRIVATE') return 'private-key';
      return null;
    });

    const result = initializeMailjetClient();
    
    expect(result.client).toBeUndefined();
    expect(result.error).toBe('API keys Mailjet non configurate');
    expect(result.statusCode).toBe(500);
  });

  it('should return error when private API key is missing', () => {
    mockEnv.get.mockImplementation((key: string) => {
      if (key === 'MJ_APIKEY_PUBLIC') return 'public-key';
      if (key === 'MJ_APIKEY_PRIVATE') return null;
      return null;
    });

    const result = initializeMailjetClient();
    
    expect(result.client).toBeUndefined();
    expect(result.error).toBe('API keys Mailjet non configurate');
    expect(result.statusCode).toBe(500);
  });

  it('should return client when both keys are present', () => {
    const mockClient = { post: jest.fn() };
    const mailjet = require('npm:node-mailjet@6.0.0');
    mailjet.apiConnect.mockReturnValue(mockClient);

    mockEnv.get.mockImplementation((key: string) => {
      if (key === 'MJ_APIKEY_PUBLIC') return 'public-key';
      if (key === 'MJ_APIKEY_PRIVATE') return 'private-key';
      return null;
    });

    const result = initializeMailjetClient();
    
    expect(result.client).toBe(mockClient);
    expect(result.error).toBeUndefined();
    expect(mailjet.apiConnect).toHaveBeenCalledWith('public-key', 'private-key');
  });

  it('should handle mailjet initialization error', () => {
    const mailjet = require('npm:node-mailjet@6.0.0');
    mailjet.apiConnect.mockImplementation(() => {
      throw new Error('Mailjet initialization failed');
    });

    mockEnv.get.mockImplementation((key: string) => {
      if (key === 'MJ_APIKEY_PUBLIC') return 'public-key';
      if (key === 'MJ_APIKEY_PRIVATE') return 'private-key';
      return null;
    });

    const result = initializeMailjetClient();
    
    expect(result.client).toBeUndefined();
    expect(result.error).toBe('Errore nell\'inizializzazione del client Mailjet');
    expect(result.statusCode).toBe(500);
  });
});
