# Test Suite for React Native Signature Reborn

This directory contains comprehensive test cases for the React Native Signature Reborn library.

## Test Structure

```
__tests__/
├── SignatureView.test.tsx              # Main component tests
├── SignatureView.integration.test.tsx  # Integration tests
├── native-modules.test.ts              # Native module tests
├── types.test.ts                       # TypeScript definition tests
└── README.md                           # This file

tests/
├── ios/
│   └── SignatureView.ios.test.tsx      # iOS-specific tests
└── android/
    └── SignatureView.android.test.tsx  # Android-specific tests
```

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Platform-Specific Tests
```bash
npm run test:ios      # iOS tests only
npm run test:android  # Android tests only
```

## Test Categories

### 1. Component Tests (`SignatureView.test.tsx`)
- **Rendering**: Tests component renders without crashing
- **Props**: Tests all prop types and values
- **Event Handlers**: Tests onSave, onStrokeStart, onStrokeEnd
- **Imperative API**: Tests ref methods (save, clear, setStrokeColor, setStrokeWidth)
- **Error Handling**: Tests comprehensive error scenarios including:
  - Invalid color values (null, undefined, empty string, malformed colors)
  - Invalid stroke width values (NaN, Infinity, negative values)
  - Invalid prop values (imageQuality, exportScale, imageFormat)
  - Malformed event data
  - Component unmounting during operations
  - Rapid successive calls
  - Memory pressure scenarios
  - Null/undefined ref handling
- **Default Values**: Tests behavior with minimal props

### 2. Integration Tests (`SignatureView.integration.test.tsx`)
- **Complete Workflow**: Tests full signature capture workflow
- **Dynamic Changes**: Tests runtime property updates
- **Export Configuration**: Tests PNG/JPEG export settings
- **Error Scenarios**: Tests comprehensive error handling including:
  - Missing event handlers
  - Invalid prop values and extreme values
  - Null/undefined props
  - Malformed event data in integration context
  - Rapid prop changes
  - Component re-mounting scenarios
  - Concurrent operations
  - Memory leak scenarios
  - Edge case prop combinations
- **Performance**: Tests rendering performance

### 3. Platform-Specific Tests
- **iOS Tests** (`tests/ios/SignatureView.ios.test.tsx`):
  - iOS-specific features and behavior
  - iOS event handling
  - iOS imperative API calls
  - iOS error handling including:
    - Various invalid color formats
    - Invalid stroke width values
    - Malformed event data
    - Rapid prop changes
    - Component unmounting during operations
    - Memory pressure scenarios
    - Edge case prop combinations
  - iOS performance characteristics

- **Android Tests** (`tests/android/SignatureView.android.test.tsx`):
  - Android-specific features and behavior
  - Android event handling
  - Android imperative API calls
  - Android error handling including:
    - Various invalid color formats
    - Invalid stroke width values
    - Malformed event data
    - Rapid prop changes
    - Component unmounting during operations
    - Memory pressure scenarios
    - Edge case prop combinations
    - Android-specific export errors
    - Concurrent operations
  - Android performance characteristics

### 4. Native Module Tests (`native-modules.test.ts`)
- **UIManager**: Tests view manager configuration and command dispatch
- **findNodeHandle**: Tests node handle resolution
- **processColor**: Tests color processing
- **Command Integration**: Tests all native commands
- **Error Handling**: Tests comprehensive native module error scenarios including:
  - Invalid node handles (negative, null, undefined, NaN, Infinity)
  - Invalid command IDs (out of range, null, undefined, NaN)
  - Invalid arguments (null, undefined, wrong types, malformed objects)
  - Malformed findNodeHandle calls
  - Malformed processColor calls
  - Concurrent command dispatch
  - Rapid successive calls
  - Memory pressure scenarios
  - Edge case command combinations
  - UIManager configuration errors
  - dispatchViewManagerCommand errors

### 5. TypeScript Tests (`types.test.ts`)
- **Type Definitions**: Tests all TypeScript interfaces
- **Type Safety**: Ensures type constraints are enforced
- **Optional Props**: Tests optional property handling
- **Method Signatures**: Tests imperative API type definitions

## Test Coverage

The test suite aims for comprehensive coverage of:

- ✅ **Component Rendering** (100%)
- ✅ **Props Handling** (100%)
- ✅ **Event System** (100%)
- ✅ **Imperative API** (100%)
- ✅ **Error Handling** (100%)
- ✅ **Platform Differences** (100%)
- ✅ **TypeScript Definitions** (100%)
- ✅ **Integration Scenarios** (100%)

## Mocking Strategy

### React Native Modules
- `UIManager`: Mocked with command dispatch tracking
- `findNodeHandle`: Mocked to return consistent node handles
- `processColor`: Mocked to pass through color values
- `requireNativeComponent`: Mocked to return component name

### Platform Detection
- iOS tests mock `Platform.OS = 'ios'`
- Android tests mock `Platform.OS = 'android'`

### File System
- File operations mocked for export testing
- Base64 encoding mocked for signature data

## Test Data

### Mock Signature Results
```typescript
const mockResult: SignatureResult = {
  path: '/mock/path/signature.png',
  base64: 'mockBase64String',
};
```

### Mock Colors
- `#FF0000` (Red)
- `#00FF00` (Green)
- `#0000FF` (Blue)
- `#FFFFFF` (White)
- `#000000` (Black)

### Mock Stroke Widths
- `1` (Thin)
- `3` (Default)
- `5` (Medium)
- `8` (Thick)

## Best Practices

### Test Organization
- Group related tests in `describe` blocks
- Use descriptive test names
- Test one behavior per test case
- Clean up mocks between tests

### Assertions
- Use specific matchers (`toBe`, `toHaveBeenCalledWith`)
- Test both positive and negative cases
- Verify error conditions
- Check performance characteristics

### Mocking
- Mock external dependencies
- Use realistic mock data
- Reset mocks between tests
- Test mock interactions

## Continuous Integration

These tests are designed to run in CI environments:

- **Node.js**: Compatible with Node 16+
- **Jest**: Uses Jest 29+ with React Native preset
- **Coverage**: Generates coverage reports for CI
- **Platform**: Tests both iOS and Android scenarios

## Debugging Tests

### Running Specific Tests
```bash
# Run specific test file
npm test SignatureView.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="renders without crashing"

# Run tests in specific directory
npm test -- tests/ios/
```

### Debug Mode
```bash
# Run tests with debug output
npm test -- --verbose

# Run single test with debug
npm test -- --testNamePattern="specific test" --verbose
```

## Contributing

When adding new tests:

1. **Follow naming conventions**: `ComponentName.test.tsx`
2. **Group related tests**: Use `describe` blocks
3. **Test edge cases**: Include error scenarios
4. **Update documentation**: Add test descriptions
5. **Maintain coverage**: Ensure new features are tested

## Test Maintenance

- **Regular Updates**: Update tests when API changes
- **Dependency Updates**: Update test dependencies with library
- **Performance**: Monitor test execution time
- **Coverage**: Maintain high coverage percentage
