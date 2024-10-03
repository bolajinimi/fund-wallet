export default {
    clearMocks: true,
    coverageDirectory: 'coverage',
    testEnvironment: 'node',
    roots: ['./src'],
    transform: {
      '^.+\\.ts?$': 'ts-jest',
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.ts?$',
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  };