// Basic test to verify the library structure and exports
const path = require('path');

describe('React Native Signature Reborn - Basic Tests', () => {
  describe('Package Structure', () => {
    it('has correct package.json', () => {
      const packageJson = require('../package.json');
      
      expect(packageJson.name).toBe('react-native-signature-reborn');
      expect(packageJson.version).toBe('0.2.1');
      expect(packageJson.main).toBe('lib/commonjs/index.js');
      expect(packageJson.module).toBe('lib/module/index.js');
      expect(packageJson.types).toBe('lib/typescript/index.d.ts');
    });

    it('has required files', () => {
      const fs = require('fs');
      
      // Check if main files exist
      expect(fs.existsSync('src/index.ts')).toBe(true);
      expect(fs.existsSync('src/SignatureView.tsx')).toBe(true);
      expect(fs.existsSync('ios/RNSignatureView.swift')).toBe(true);
      expect(fs.existsSync('ios/RNSignatureViewManager.swift')).toBe(true);
      expect(fs.existsSync('android/src/main/java/com/signaturereborn/SignatureView.kt')).toBe(true);
      expect(fs.existsSync('android/src/main/java/com/signaturereborn/SignatureViewManager.kt')).toBe(true);
      expect(fs.existsSync('README.md')).toBe(true);
    });

    it('has test scripts in package.json', () => {
      const packageJson = require('../package.json');
      
      expect(packageJson.scripts.test).toBe('jest');
      expect(packageJson.scripts['test:watch']).toBe('jest --watch');
      expect(packageJson.scripts['test:coverage']).toBe('jest --coverage');
      expect(packageJson.scripts['test:ios']).toBe('jest --testPathPattern=ios');
      expect(packageJson.scripts['test:android']).toBe('jest --testPathPattern=android');
    });
  });

  describe('TypeScript Configuration', () => {
    it('has valid tsconfig files', () => {
      const fs = require('fs');
      
      expect(fs.existsSync('tsconfig.json')).toBe(true);
      expect(fs.existsSync('tsconfig.base.json')).toBe(true);
      expect(fs.existsSync('tsconfig.module.json')).toBe(true);
    });

    it('tsconfig.base.json has correct configuration', () => {
      const tsconfig = require('../tsconfig.base.json');
      
      expect(tsconfig.compilerOptions.target).toBe('es2019');
      expect(tsconfig.compilerOptions.strict).toBe(true);
      expect(tsconfig.compilerOptions.jsx).toBe('react-native');
      expect(tsconfig.compilerOptions.moduleResolution).toBe('node');
    });
  });

  describe('Jest Configuration', () => {
    it('has jest configuration', () => {
      const fs = require('fs');
      
      expect(fs.existsSync('jest.config.js')).toBe(true);
      expect(fs.existsSync('jest.setup.js')).toBe(true);
    });

    it('jest.config.js has correct structure', () => {
      const jestConfig = require('../jest.config.js');
      
      expect(jestConfig.testEnvironment).toBe('node');
      expect(jestConfig.testMatch).toContain('**/__tests__/**/*.test.js');
    });
  });

  describe('Source Code Structure', () => {
    it('src/SignatureView.tsx has correct exports', () => {
      const fs = require('fs');
      const signatureViewContent = fs.readFileSync('src/SignatureView.tsx', 'utf8');
      
      // Check for key exports
      expect(signatureViewContent).toContain('export interface SignatureResult');
      expect(signatureViewContent).toContain('export interface SignatureViewHandle');
      expect(signatureViewContent).toContain('export interface SignatureViewProps');
      expect(signatureViewContent).toContain('export const SignatureView');
      expect(signatureViewContent).toContain('export default SignatureView');
    });

    it('src/index.ts exports correctly', () => {
      const fs = require('fs');
      const indexContent = fs.readFileSync('src/index.ts', 'utf8');
      
      expect(indexContent).toContain('export * from');
    });
  });

  describe('Native Code Structure', () => {
    it('iOS Swift files have correct structure', () => {
      const fs = require('fs');
      const swiftContent = fs.readFileSync('ios/RNSignatureView.swift', 'utf8');
      
      expect(swiftContent).toContain('class RNSignatureView: UIView');
      expect(swiftContent).toContain('imageBackgroundColor');
      expect(swiftContent).toContain('onSave');
      expect(swiftContent).toContain('onStrokeStart');
      expect(swiftContent).toContain('onStrokeEnd');
    });

    it('Android Kotlin files have correct structure', () => {
      const fs = require('fs');
      const kotlinContent = fs.readFileSync('android/src/main/java/com/signaturereborn/SignatureView.kt', 'utf8');
      
      expect(kotlinContent).toContain('class SignatureView');
      expect(kotlinContent).toContain('imageFormat');
      expect(kotlinContent).toContain('imageQuality');
      expect(kotlinContent).toContain('shouldIncludeBase64');
    });
  });

  describe('Documentation', () => {
    it('README.md has testing phase warning', () => {
      const fs = require('fs');
      const readmeContent = fs.readFileSync('README.md', 'utf8');
      
      expect(readmeContent).toContain('Currently in Testing Phase');
      expect(readmeContent).toContain('active development and testing');
    });

    it('README.md has usage examples', () => {
      const fs = require('fs');
      const readmeContent = fs.readFileSync('README.md', 'utf8');
      
      expect(readmeContent).toContain('```tsx');
      expect(readmeContent).toContain('SignatureView');
      expect(readmeContent).toContain('strokeColor');
      expect(readmeContent).toContain('imageFormat');
    });
  });

  describe('Test Files', () => {
    it('has comprehensive test files', () => {
      const fs = require('fs');
      
      expect(fs.existsSync('__tests__/SignatureView.test.tsx')).toBe(true);
      expect(fs.existsSync('__tests__/SignatureView.integration.test.tsx')).toBe(true);
      expect(fs.existsSync('__tests__/native-modules.test.ts')).toBe(true);
      expect(fs.existsSync('__tests__/types.test.ts')).toBe(true);
      expect(fs.existsSync('tests/ios/SignatureView.ios.test.tsx')).toBe(true);
      expect(fs.existsSync('tests/android/SignatureView.android.test.tsx')).toBe(true);
    });

    it('test files have correct structure', () => {
      const fs = require('fs');
      
      // Check main test file
      const mainTestContent = fs.readFileSync('__tests__/SignatureView.test.tsx', 'utf8');
      expect(mainTestContent).toContain('describe(');
      expect(mainTestContent).toContain('it(');
      expect(mainTestContent).toContain('SignatureView');
      
      // Check integration test file
      const integrationTestContent = fs.readFileSync('__tests__/SignatureView.integration.test.tsx', 'utf8');
      expect(integrationTestContent).toContain('Integration Tests');
      expect(integrationTestContent).toContain('Complete Workflow');
    });
  });
});
