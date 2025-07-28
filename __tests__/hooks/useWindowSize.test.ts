import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWindowSize } from '@/hooks/useWindowSize';

// Mock window with default values
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768
});

describe('useWindowSize', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial window size', () => {
    const { result } = renderHook(() => useWindowSize());

    expect(result.current.width).toBe(1024);
    expect(result.current.height).toBe(768);
  });

  it('should update size when window is resized', () => {
    const { result } = renderHook(() => useWindowSize());

    expect(result.current.width).toBe(1024);
    expect(result.current.height).toBe(768);

    // Simulate window resize
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1080
      });

      // Trigger resize event
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.width).toBe(1920);
    expect(result.current.height).toBe(1080);
  });

  it('should clean up event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    
    const { unmount } = renderHook(() => useWindowSize());
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});
