
import { renderHook, act } from '@testing-library/react-hooks';
import { useRoleCheck } from '@/hooks/useRoleCheck';
import { useUnifiedAuth } from '@/hooks/use-unified-auth';

// Mock useUnifiedAuth
jest.mock('@/hooks/use-unified-auth', () => ({
  useUnifiedAuth: jest.fn()
}));

describe('useRoleCheck', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.resetAllMocks();
  });

  it('should identify a qa user correctly', () => {
    // Setup the mock to simulate a qa user
    (useUnifiedAuth as jest.Mock).mockReturnValue({
      userRole: 'qa',
      hasRole: (role: string) => role === 'qa',
      isRoleLoading: false
    });

    const { result } = renderHook(() => useRoleCheck());

    expect(result.current.isQaUser).toBe(true);
    expect(result.current.isDeveloper).toBe(false);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isSpecialUser).toBe(true);
  });

  it('should identify a developer user correctly', () => {
    // Setup the mock to simulate a developer user
    (useUnifiedAuth as jest.Mock).mockReturnValue({
      userRole: 'developer',
      hasRole: (role: string) => role === 'developer',
      isRoleLoading: false
    });

    const { result } = renderHook(() => useRoleCheck());

    expect(result.current.isQaUser).toBe(false);
    expect(result.current.isDeveloper).toBe(true);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isSpecialUser).toBe(true);
  });

  it('should identify an admin user correctly', () => {
    // Setup the mock to simulate an admin user
    (useUnifiedAuth as jest.Mock).mockReturnValue({
      userRole: 'admin',
      hasRole: (role: string) => role === 'admin',
      isRoleLoading: false
    });

    const { result } = renderHook(() => useRoleCheck());

    expect(result.current.isQaUser).toBe(false);
    expect(result.current.isDeveloper).toBe(false);
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isSpecialUser).toBe(true);
  });

  it('should filter out QA users from data arrays', () => {
    // Setup the mock
    (useUnifiedAuth as jest.Mock).mockReturnValue({
      userRole: 'user',
      hasRole: () => false,
      isRoleLoading: false
    });

    const { result } = renderHook(() => useRoleCheck());

    const testData = [
      { id: '1', name: 'Regular User', email: 'user@example.com' },
      { id: '11111111-1111-1111-1111-111111111111', name: 'QA User', email: 'qa@mission.dev' },
      { id: '2', name: 'Another User', agent_code: 'AG-123' },
      { id: '3', name: 'QA Test', agent_code: 'AG-QA001' },
      { user_id: '11111111-1111-1111-1111-111111111111', data: 'test' }
    ];

    const filtered = result.current.filterQaUsers(testData);
    
    expect(filtered.length).toBe(2);
    expect(filtered[0].id).toBe('1');
    expect(filtered[1].id).toBe('2');
  });

  it('should return an empty array when filtering non-array data', () => {
    // Setup the mock
    (useUnifiedAuth as jest.Mock).mockReturnValue({
      userRole: 'user',
      hasRole: () => false,
      isRoleLoading: false
    });

    const { result } = renderHook(() => useRoleCheck());
    
    const nonArrayData = null;
    // @ts-ignore
    const filtered = result.current.filterQaUsers(nonArrayData);
    
    expect(filtered).toEqual([]);
  });

  it('should not set roles while loading', () => {
    // Setup the mock to simulate loading state
    (useUnifiedAuth as jest.Mock).mockReturnValue({
      userRole: null,
      hasRole: () => false,
      isRoleLoading: true
    });

    const { result } = renderHook(() => useRoleCheck());
    
    expect(result.current.isQaUser).toBe(false);
    expect(result.current.isDeveloper).toBe(false);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isSpecialUser).toBe(false);
  });
});
