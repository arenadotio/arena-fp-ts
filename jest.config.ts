import type { JestConfigWithTsJest } from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
  preset: 'ts-jest',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
      },
    ],
  },
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.ts'],
  setupFilesAfterEnv: ['./src/Jest.ts'],
};

export default jestConfig;
