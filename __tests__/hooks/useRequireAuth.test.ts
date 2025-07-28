import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useRequireAuth } from '@/hooks/useRequireAuth';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn()
}));

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: vi.fn()
}));

describe('useRequireAuth', () => {
  const mockPush = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn()
    });
  });

  it('should return session and status when authenticated', () => {
    const mockSession = {
      user: { email: 'test@example.com', name: 'Test User' },
      expires: '2024-12-31'
    };

    vi.mocked(useSession).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: vi.fn()
    });

    const { result } = renderHook(() => useRequireAuth());

    expect(result.current.data).toEqual(mockSession);
    expect(result.current.status).toBe('authenticated');
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should redirect to sign-in when unauthenticated', () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn()
    });

    const { result } = renderHook(() => useRequireAuth());

    expect(result.current.data).toBeNull();
    expect(result.current.status).toBe('unauthenticated');
    expect(mockPush).toHaveBeenCalledWith('/auth/signin');
  });

  it('should not redirect while loading', () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'loading',
      update: vi.fn()
    });

    const { result } = renderHook(() => useRequireAuth());

    expect(result.current.data).toBeNull();
    expect(result.current.status).toBe('loading');
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should handle session without user', () => {
    vi.mocked(useSession).mockReturnValue({
      data: { expires: '2024-12-31' },
      status: 'authenticated',
      update: vi.fn()
    });

    const { result } = renderHook(() => useRequireAuth());

    expect(result.current.data?.user).toBeUndefined();
    expect(result.current.status).toBe('authenticated');
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should handle session updates', () => {
    const mockUpdate = vi.fn();
    const mockSession = {
      user: { email: 'test@example.com', name: 'Test User' },
      expires: '2024-12-31'
    };

    vi.mocked(useSession).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
      update: mockUpdate
    });

    const { result } = renderHook(() => useRequireAuth());

    expect(result.current.data).toEqual(mockSession);
    expect(result.current.status).toBe('authenticated');
    
    // The hook should expose the update function
    expect(typeof result.current.update).toBe('function');
  });
});
