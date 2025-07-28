import '@testing-library/jest-dom'
import { beforeEach, vi } from 'vitest'

// Set up environment variables for tests
process.env.GITHUB_ID = 'test_github_id';
process.env.GITHUB_SECRET = 'test_github_secret';
process.env.MONGO_URI = 'mongodb://localhost:27017/test';
process.env.NEXTAUTH_SECRET = 'test_secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.NODE_ENV = 'test';

// Global test setup
beforeEach(() => {
  // Reset any mocks between tests
  vi.clearAllMocks()
})

// Mock window.matchMedia for components that use it
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock window dimensions for useWindowSize tests
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