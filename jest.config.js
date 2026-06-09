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
  collectCoverageFrom: [
    // Controllers — all functions must be covered
    'src/controllers/**/*.js',
    // Middlewares — validation logic
    'src/middlewares/**/*.js',
    // Utilities — pure functions + PDF generation
    'src/utils/**/*.js',
    // Reports router — CSV and PDF endpoints
    'src/api_reports.js',
    // Exclude the corrupted legacy file
    '!src/test.js',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
};
