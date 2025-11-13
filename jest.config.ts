import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    rootDir: '.',
    testMatch: ['**/*.spec.ts'],
    moduleFileExtensions: ['ts', 'js'],
    passWithNoTests: true,
    projects: [
        '<rootDir>/apps/backend/jest.config.ts',
        '<rootDir>/packages/shared/jest.config.ts',
    ]
};

export default config;
