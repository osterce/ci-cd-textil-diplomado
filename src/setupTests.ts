import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill TextEncoder/TextDecoder for jsdom
globalThis.TextEncoder = TextEncoder as any;
globalThis.TextDecoder = TextDecoder as any;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
globalThis.IntersectionObserver = class IntersectionObserver {
  constructor() { }
  disconnect() { }
  observe() { }
  takeRecords() {
    return [];
  }
  unobserve() { }
} as any;

// Mock ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
  constructor() { }
  disconnect() { }
  observe() { }
  unobserve() { }
} as any;
