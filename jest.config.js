export default {
  preset: null,
  testEnvironment: 'node',
  testMatch: ['**/src/tests/**/*.test.js'],
  // Exclude files that use node:test runner (run via `npm run test:routes` instead)
  testPathIgnorePatterns: [
    '/node_modules/',
    'src/test.js',
    'src/tests/checklist.test.js',
    'src/tests/itemchecklist.test.js',
    'src/tests/modelochecklist.test.js',
    'src/tests/usuarios.test.js',
    'src/tests/inspecoes.test.js',
  ],
  // Only collect coverage for files directly exercised by Jest tests
  collectCoverageFrom: [
    'src/controllers/**/*.js',
    'src/middlewares/**/*.js',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
};
