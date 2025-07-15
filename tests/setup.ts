import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'

// Mock environment variables for tests
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock WebSocket for tests
global.WebSocket = class WebSocket {
  constructor(url: string) {}
  send(data: any) {}
  close() {}
  addEventListener(event: string, callback: Function) {}
  removeEventListener(event: string, callback: Function) {}
} as any

// Mock fetch for API calls
global.fetch = vi.fn()

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
})

// Mock geolocation API
Object.defineProperty(navigator, 'geolocation', {
  value: {
    getCurrentPosition: vi.fn(),
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
  },
  writable: true,
})