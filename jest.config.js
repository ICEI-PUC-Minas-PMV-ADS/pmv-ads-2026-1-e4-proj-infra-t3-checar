export default {
  preset: null,
  testEnvironment: 'node',
  testMatch: ['**/src/tests/**/*.test.js'],
  testPathIgnorePatterns: [
    '/node_modules/',
    'src/test.js',   // corrupted UTF-16 file — kept ignored
  ],
};
