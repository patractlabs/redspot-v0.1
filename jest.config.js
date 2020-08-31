module.exports = {
  moduleNameMapper: {
    '@redspot/box(.*)$': '<rootDir>/packages/box/src/$1',
    '@redspot/template(.*)$': '<rootDir>/packages/template/src/$1',
    '@redspot/@redspot/api-contract(.*)$': '<rootDir>/packages/@redspot/api-contract/src/$1',
  },
  modulePathIgnorePatterns: [],
};
