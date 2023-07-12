module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.ts'],
  setupFilesAfterEnv: ['./src/Jest.ts'],
};
