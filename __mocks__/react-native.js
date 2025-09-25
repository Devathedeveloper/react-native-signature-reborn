const React = require('react');
const ReactNative = jest.requireActual('react-native');

module.exports = {
  ...ReactNative,
  UIManager: {
    ...ReactNative.UIManager,
    getViewManagerConfig: jest.fn(() => ({
      Commands: {
        save: 0,
        clear: 1,
        setStrokeColor: 2,
        setStrokeWidth: 3,
      },
    })),
    dispatchViewManagerCommand: jest.fn(),
  },
  findNodeHandle: jest.fn(() => 1),
  processColor: jest.fn((color) => color),
  requireNativeComponent: jest.fn(() => 'RNSignatureView'),
  NativeModules: {
    ...ReactNative.NativeModules,
    RNSignatureReborn: {
      save: jest.fn(),
      clear: jest.fn(),
      setStrokeColor: jest.fn(),
      setStrokeWidth: jest.fn(),
    },
  },
};
