// jest.config.cjs
/** @type {import('jest').Config} */
module.exports = {
  preset:          'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],

  moduleNameMapper: {
    '\\.(css|less|scss)$': '<rootDir>/src/__mocks__/styleMock.cjs',
  },

  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{ts,tsx}',
  ],

  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/**/*.stories.tsx',
  ],

  coverageThreshold: {
    global: { lines: 80, functions: 80, branches: 80, statements: 80 },
  },

  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: './tsconfig.test.json',
      jsx:      'react-jsx',
      diagnostics: {
        ignoreCodes: [1343, 2339],
      },
    }],
  },

  // Expone import.meta.env para archivos fuente que usan sintaxis de Vite.
  // ts-jest inyecta este objeto antes de transformar cada módulo CommonJS.
  globals: {
    'import.meta': {
      env: {
        VITE_API_URL: 'http://localhost:8080',
      },
    },
  },

  extensionsToTreatAsEsm: ['.ts', '.tsx'],
}
