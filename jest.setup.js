// @testing-library/jest-native is deprecated, using built-in matchers

// Mock react-native modules
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  
  return {
    ...RN,
    UIManager: {
      ...RN.UIManager,
      getViewManagerConfig: jest.fn(),
      dispatchViewManagerCommand: jest.fn(),
    },
    findNodeHandle: jest.fn(() => 1),
    processColor: jest.fn((color) => color),
    requireNativeComponent: jest.fn(() => 'RNSignatureView'),
  };
});

// Mock file system operations
jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/documents',
  writeFile: jest.fn(),
  readFile: jest.fn(),
}));

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
