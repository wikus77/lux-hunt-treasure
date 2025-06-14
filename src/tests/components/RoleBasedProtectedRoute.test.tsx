
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RoleBasedProtectedRoute } from '@/components/auth/RoleBasedProtectedRoute';
import { useUnifiedAuth } from '@/hooks/use-unified-auth';
import { toast } from 'sonner';

// Mocking dependencies
jest.mock('@/hooks/use-unified-auth');
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    info: jest.fn()
  }
}));

describe('RoleBasedProtectedRoute', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    (useUnifiedAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      isEmailVerified: true,
      getCurrentUser: () => ({ id: '123', email: 'test@example.com' }),
      userRole: 'user',
      hasRole: (role: string) => role === 'user',
      isRoleLoading: false
    });
  });
  
  const renderWithRouter = (ui: React.ReactNode, { route = '/' } = {}) => {
    return render(
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/access-denied" element={<div>Access Denied Page</div>} />
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/admin" element={
            <RoleBasedProtectedRoute allowedRoles={['admin', 'developer']}>
              <div>Admin Content</div>
            </RoleBasedProtectedRoute>
          } />
          <Route path="/protected" element={
            <RoleBasedProtectedRoute>
              <div>Protected Content</div>
            </RoleBasedProtectedRoute>
          } />
          <Route path="/special" element={
            <RoleBasedProtectedRoute allowedRoles={['admin']} bypassCheck={true}>
              <div>Special Content</div>
            </RoleBasedProtectedRoute>
          } />
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  test('shows loading spinner while authentication is loading', () => {
    (useUnifiedAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      getCurrentUser: () => null,
      isRoleLoading: false
    });
    
    renderWithRouter(<RoleBasedProtectedRoute />, { route: '/protected' });
    
    expect(screen.getByText('Caricamento autenticazione...')).toBeInTheDocument();
  });

  test('shows loading spinner while role is loading', () => {
    (useUnifiedAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      isRoleLoading: true,
      getCurrentUser: () => ({ id: '123', email: 'test@example.com' })
    });
    
    renderWithRouter(<RoleBasedProtectedRoute />, { route: '/protected' });
    
    expect(screen.getByText('Caricamento ruolo...')).toBeInTheDocument();
  });

  test('redirects to login when not authenticated', async () => {
    (useUnifiedAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      getCurrentUser: () => null,
      isRoleLoading: false
    });
    
    renderWithRouter(<RoleBasedProtectedRoute />, { route: '/protected' });
    
    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  test('allows access for users with required role', async () => {
    (useUnifiedAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      isEmailVerified: true,
      getCurrentUser: () => ({ id: '123', email: 'test@example.com' }),
      userRole: 'user',
      hasRole: (role: string) => role === 'user',
      isRoleLoading: false
    });
    
    renderWithRouter(<RoleBasedProtectedRoute />, { route: '/protected' });
    
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  test('allows admin access to admin routes', async () => {
    (useUnifiedAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      isEmailVerified: true,
      getCurrentUser: () => ({ id: '123', email: 'admin@example.com' }),
      userRole: 'admin',
      hasRole: (role: string) => role === 'admin',
      isRoleLoading: false
    });
    
    renderWithRouter(<RoleBasedProtectedRoute />, { route: '/admin' });
    
    await waitFor(() => {
      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });
  });

  test('allows developer access to admin routes', async () => {
    (useUnifiedAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      isEmailVerified: true,
      getCurrentUser: () => ({ id: '123', email: 'dev@example.com' }),
      userRole: 'developer',
      hasRole: (role: string) => role === 'developer',
      isRoleLoading: false
    });
    
    renderWithRouter(<RoleBasedProtectedRoute />, { route: '/admin' });
    
    await waitFor(() => {
      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });
  });

  test('denies regular user access to admin routes', async () => {
    (useUnifiedAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      isEmailVerified: true,
      getCurrentUser: () => ({ id: '123', email: 'user@example.com' }),
      userRole: 'user',
      hasRole: (role: string) => role === 'user',
      isRoleLoading: false
    });
    
    renderWithRouter(<RoleBasedProtectedRoute />, { route: '/admin' });
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Accesso riservato agli amministratori");
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  test('allows access with bypassCheck even without required role', async () => {
    (useUnifiedAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      isEmailVerified: true,
      getCurrentUser: () => ({ id: '123', email: 'user@example.com' }),
      userRole: 'user',
      hasRole: (role: string) => role === 'user',
      isRoleLoading: false
    });
    
    renderWithRouter(<RoleBasedProtectedRoute />, { route: '/special' });
    
    await waitFor(() => {
      expect(toast.info).toHaveBeenCalledWith("Accesso consentito in modalità speciale");
      expect(screen.getByText('Special Content')).toBeInTheDocument();
    });
  });
});
