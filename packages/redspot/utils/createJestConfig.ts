function createJestConfig(network: string, rootDir: string) {
  const config = {
    rootDir: rootDir,
    testMatch: ['<rootDir>/**/tests/**/*.{js,ts}', '<rootDir>/**/*.{spec,test}.{js,ts}'],
    resetMocks: true,
    testEnvironment: '@redspot/test-env',
    testEnvironmentOptions: {
      network,
    },
    setupFilesAfterEnv: ['redspot/utils/testSetup.js'],
  };

  return config;
}

export { createJestConfig };
