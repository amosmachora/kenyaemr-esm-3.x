/**
 * @returns {Promise<import('jest').Config>}
 */

const path = require('path');

module.exports = {
  transform: {
    '^.+\\.(j|t)sx?$': '@swc/jest',
  },
  transformIgnorePatterns: ['/node_modules/(?!@openmrs)'],
  moduleDirectories: ['node_modules', '__mocks__', 'tools', __dirname],
  moduleNameMapper: {
    '\\.(s?css)$': 'identity-obj-proxy',
    '@openmrs/esm-framework': '@openmrs/esm-framework/mock',
    '@openmrs/esm-patient-common-lib': '@openmrs/esm-patient-common-lib',
    '^dexie$': require.resolve('dexie'),
    '^lodash-es/(.*)$': 'lodash/$1',
    'lodash-es': 'lodash',
    '^react-i18next$': path.resolve(__dirname, '__mocks__', 'react-i18next.js'),
    '^uuid$': path.resolve(__dirname, 'node_modules', 'uuid', 'dist', 'index.js'),
  },
  collectCoverageFrom: [
    '**/src/**/*.component.tsx',
    '!**/node_modules/**',
    '!**/vendor/**',
    '!**/src/**/*.test.*',
    '!**/src/declarations.d.ts',
    '!**/e2e/**',
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
  setupFilesAfterEnv: [path.resolve(__dirname, 'tools', 'setupTests.ts')],
  testPathIgnorePatterns: [path.resolve(__dirname, 'e2e')],
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost/',
  },
  testTimeout: 25000,
};
