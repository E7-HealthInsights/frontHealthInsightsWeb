/// <reference types="jest" />
// src/setupTests.ts
// Se ejecuta antes de cada archivo de prueba

import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Polyfill: react-router-dom v7 requiere TextEncoder/TextDecoder
// que jsdom (Jest) no incluye por defecto
if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder as typeof globalThis.TextEncoder
  globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder
}

process.env.VITE_API_URL = 'http://localhost:8080'

Object.defineProperty(window, 'location', {
  writable: true,
  value:    { href: '' },
})

// Mock de window.matchMedia (no existe en jsdom)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches:             false,
    media:               query,
    onchange:            null,
    addListener:         jest.fn(),
    removeListener:      jest.fn(),
    addEventListener:    jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent:       jest.fn(),
  })),
})

// Mock de ResizeObserver (Recharts lo usa)
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe:    jest.fn(),
  unobserve:  jest.fn(),
  disconnect: jest.fn(),
}))