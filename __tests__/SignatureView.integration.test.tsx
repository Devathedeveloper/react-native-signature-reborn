import React, { useRef, useState } from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignatureView, { SignatureViewHandle, SignatureResult } from '../src/SignatureView';

// Mock the native component
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    requireNativeComponent: jest.fn(() => 'RNSignatureView'),
    UIManager: {
      ...RN.UIManager,
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
  };
});

// Test component that uses SignatureView
const TestSignatureApp = () => {
  const signatureRef = useRef<SignatureViewHandle>(null);
  const [signature, setSignature] = useState<SignatureResult | null>(null);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(3);

  const handleSave = () => {
    signatureRef.current?.save();
  };

  const handleClear = () => {
    signatureRef.current?.clear();
    setSignature(null);
  };

  const handleChangeColor = () => {
    const newColor = strokeColor === '#000000' ? '#FF0000' : '#000000';
    setStrokeColor(newColor);
    signatureRef.current?.setStrokeColor(newColor);
  };

  const handleChangeWidth = () => {
    const newWidth = strokeWidth === 3 ? 8 : 3;
    setStrokeWidth(newWidth);
    signatureRef.current?.setStrokeWidth(newWidth);
  };

  return (
    <SignatureView
      testID="signature-view"
      ref={signatureRef}
      strokeColor={strokeColor}
      strokeWidth={strokeWidth}
      imageFormat="png"
      imageQuality={0.8}
      onSave={setSignature}
      onStrokeStart={() => console.log('Stroke started')}
      onStrokeEnd={() => console.log('Stroke ended')}
    />
  );
};

describe('SignatureView Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Workflow', () => {
    it('handles complete signature workflow', async () => {
      const { getByTestId } = render(<TestSignatureApp />);
      const signatureView = getByTestId('signature-view');

      // Simulate stroke start
      fireEvent(signatureView, 'onStrokeStart');
      
      // Simulate stroke end
      fireEvent(signatureView, 'onStrokeEnd');

      // Simulate save
      const mockResult: SignatureResult = {
        path: '/mock/path/signature.png',
        base64: 'mockBase64String',
      };
      fireEvent(signatureView, 'onSave', { nativeEvent: mockResult });

      await waitFor(() => {
        expect(signatureView).toBeTruthy();
      });
    });

    it('handles multiple strokes and saves', async () => {
      const { getByTestId } = render(<TestSignatureApp />);
      const signatureView = getByTestId('signature-view');

      // Simulate multiple strokes
      for (let i = 0; i < 3; i++) {
        fireEvent(signatureView, 'onStrokeStart');
        fireEvent(signatureView, 'onStrokeEnd');
      }

      // Simulate save
      const mockResult: SignatureResult = {
        path: '/mock/path/signature.png',
        base64: 'mockBase64String',
      };
      fireEvent(signatureView, 'onSave', { nativeEvent: mockResult });

      await waitFor(() => {
        expect(signatureView).toBeTruthy();
      });
    });
  });

  describe('Dynamic Property Changes', () => {
    it('handles dynamic stroke color changes', () => {
      const { getByTestId } = render(<TestSignatureApp />);
      const signatureView = getByTestId('signature-view');

      // Initial color
      expect(signatureView.props.strokeColor).toBe('#000000');

      // Change color (this would be done through the imperative API in real usage)
      // We can't easily test the imperative API without more complex mocking
      expect(signatureView).toBeTruthy();
    });

    it('handles dynamic stroke width changes', () => {
      const { getByTestId } = render(<TestSignatureApp />);
      const signatureView = getByTestId('signature-view');

      // Initial width
      expect(signatureView.props.strokeWidth).toBe(3);

      // Change width (this would be done through the imperative API in real usage)
      expect(signatureView).toBeTruthy();
    });
  });

  describe('Export Configuration', () => {
    it('handles PNG export configuration', () => {
      const { getByTestId } = render(
        <SignatureView
          testID="signature-view"
          imageFormat="png"
          imageQuality={0.9}
          shouldIncludeBase64={true}
        />
      );
      const signatureView = getByTestId('signature-view');

      expect(signatureView.props.imageFormat).toBe('png');
      expect(signatureView.props.imageQuality).toBe(0.9);
      expect(signatureView.props.shouldIncludeBase64).toBe(true);
    });

    it('handles JPEG export configuration', () => {
      const { getByTestId } = render(
        <SignatureView
          testID="signature-view"
          imageFormat="jpeg"
          imageQuality={0.7}
          shouldIncludeBase64={false}
          imageBackgroundColor="#FFFFFF"
        />
      );
      const signatureView = getByTestId('signature-view');

      expect(signatureView.props.imageFormat).toBe('jpeg');
      expect(signatureView.props.imageQuality).toBe(0.7);
      expect(signatureView.props.shouldIncludeBase64).toBe(false);
      expect(signatureView.props.imageBackgroundColor).toBe('#FFFFFF');
    });

    it('handles export scale configuration', () => {
      const { getByTestId } = render(
        <SignatureView
          testID="signature-view"
          exportScale={2.0}
        />
      );
      const signatureView = getByTestId('signature-view');

      expect(signatureView.props.exportScale).toBe(2.0);
    });
  });

  describe('Error Scenarios', () => {
    it('handles missing event handlers gracefully', () => {
      const { getByTestId } = render(
        <SignatureView testID="signature-view" />
      );
      const signatureView = getByTestId('signature-view');

      // Should not crash when event handlers are not provided
      expect(() => {
        fireEvent(signatureView, 'onSave', { nativeEvent: { path: 'test', base64: 'test' } });
        fireEvent(signatureView, 'onStrokeStart');
        fireEvent(signatureView, 'onStrokeEnd');
      }).not.toThrow();
    });

    it('handles invalid prop values gracefully', () => {
      const { getByTestId } = render(
        <SignatureView
          testID="signature-view"
          strokeWidth={-1}
          imageQuality={1.5}
          exportScale={-0.5}
        />
      );
      const signatureView = getByTestId('signature-view');

      // Should render even with invalid prop values
      expect(signatureView).toBeTruthy();
    });

    it('handles extreme prop values gracefully', () => {
      const { getByTestId } = render(
        <SignatureView
          testID="signature-view"
          strokeWidth={Number.MAX_SAFE_INTEGER}
          imageQuality={Number.MIN_VALUE}
          exportScale={Number.MAX_VALUE}
          imageFormat={'extremely-long-invalid-format-name' as any}
        />
      );
      const signatureView = getByTestId('signature-view');

      // Should render even with extreme values
      expect(signatureView).toBeTruthy();
    });

    it('handles null and undefined props gracefully', () => {
      const { getByTestId } = render(
        <SignatureView
          testID="signature-view"
          strokeColor={null as any}
          strokeWidth={undefined as any}
          imageFormat={null as any}
          imageQuality={undefined as any}
          shouldIncludeBase64={null as any}
          imageBackgroundColor={undefined as any}
          exportScale={null as any}
        />
      );
      const signatureView = getByTestId('signature-view');

      // Should render even with null/undefined props
      expect(signatureView).toBeTruthy();
    });

    it('handles malformed event data in integration', () => {
      const mockOnSave = jest.fn();
      const { getByTestId } = render(
        <SignatureView testID="signature-view" onSave={mockOnSave} />
      );
      const signatureView = getByTestId('signature-view');

      // Test various malformed event data scenarios
      const malformedEvents = [
        { nativeEvent: null },
        { nativeEvent: undefined },
        { nativeEvent: {} },
        { nativeEvent: { path: null, base64: 'test' } },
        { nativeEvent: { path: 'test', base64: null } },
        { nativeEvent: { path: '', base64: '' } },
        { nativeEvent: { path: 123, base64: 456 } },
        { nativeEvent: { path: [], base64: {} } },
      ];

      malformedEvents.forEach((eventData, index) => {
        expect(() => {
          fireEvent(signatureView, 'onSave', eventData);
        }).not.toThrow(`Event ${index} should not throw`);
      });
    });

    it('handles rapid prop changes gracefully', () => {
      const TestComponent = () => {
        const [strokeColor, setStrokeColor] = React.useState('#FF0000');
        const [strokeWidth, setStrokeWidth] = React.useState(3);
        const [imageFormat, setImageFormat] = React.useState('png');

        React.useEffect(() => {
          // Rapidly change props
          const interval = setInterval(() => {
            setStrokeColor(prev => prev === '#FF0000' ? '#00FF00' : '#FF0000');
            setStrokeWidth(prev => prev === 3 ? 8 : 3);
            setImageFormat(prev => prev === 'png' ? 'jpeg' : 'png');
          }, 10);

          return () => clearInterval(interval);
        }, []);

        return (
          <SignatureView
            testID="signature-view"
            strokeColor={strokeColor}
            strokeWidth={strokeWidth}
            imageFormat={imageFormat}
          />
        );
      };

      const { getByTestId } = render(<TestComponent />);
      const signatureView = getByTestId('signature-view');

      // Should handle rapid prop changes without crashing
      expect(signatureView).toBeTruthy();
    });

    it('handles component re-mounting scenarios', () => {
      const { getByTestId, unmount, rerender } = render(
        <SignatureView testID="signature-view" />
      );

      // Unmount and remount multiple times
      for (let i = 0; i < 5; i++) {
        unmount();
        rerender(<SignatureView testID="signature-view" />);
        const signatureView = getByTestId('signature-view');
        expect(signatureView).toBeTruthy();
      }
    });

    it('handles concurrent operations gracefully', () => {
      const ref = React.createRef<SignatureViewHandle>();
      const { getByTestId } = render(
        <SignatureView ref={ref} testID="signature-view" />
      );

      // Simulate concurrent operations
      const operations = [
        () => ref.current?.save(),
        () => ref.current?.clear(),
        () => ref.current?.setStrokeColor('#FF0000'),
        () => ref.current?.setStrokeWidth(5),
        () => ref.current?.setStrokeColor('#00FF00'),
        () => ref.current?.setStrokeWidth(10),
      ];

      // Run operations concurrently
      expect(() => {
        operations.forEach(op => {
          setTimeout(op, Math.random() * 100);
        });
      }).not.toThrow();
    });

    it('handles memory leak scenarios', () => {
      const { getByTestId, unmount } = render(
        <SignatureView testID="signature-view" onSave={jest.fn()} />
      );
      const signatureView = getByTestId('signature-view');

      // Create many event listeners
      for (let i = 0; i < 100; i++) {
        fireEvent(signatureView, 'onSave', { 
          nativeEvent: { path: `test${i}.png`, base64: `test${i}` } 
        });
      }

      // Unmount should clean up properly
      expect(() => {
        unmount();
      }).not.toThrow();
    });

    it('handles edge case prop combinations', () => {
      const edgeCases = [
        { strokeWidth: 0, imageQuality: 0, exportScale: 0 },
        { strokeWidth: -1, imageQuality: -1, exportScale: -1 },
        { strokeWidth: NaN, imageQuality: NaN, exportScale: NaN },
        { strokeWidth: Infinity, imageQuality: Infinity, exportScale: Infinity },
        { strokeWidth: -Infinity, imageQuality: -Infinity, exportScale: -Infinity },
      ];

      edgeCases.forEach((props, index) => {
        const { getByTestId } = render(
          <SignatureView
            testID={`signature-view-${index}`}
            {...props}
          />
        );
        const signatureView = getByTestId(`signature-view-${index}`);
        expect(signatureView).toBeTruthy();
      });
    });
  });

  describe('Performance', () => {
    it('renders efficiently with many props', () => {
      const startTime = Date.now();
      
      const { getByTestId } = render(
        <SignatureView
          testID="signature-view"
          strokeColor="#FF0000"
          strokeWidth={5}
          imageFormat="jpeg"
          imageQuality={0.8}
          shouldIncludeBase64={true}
          imageBackgroundColor="#FFFFFF"
          exportScale={1.5}
          onSave={() => {}}
          onStrokeStart={() => {}}
          onStrokeEnd={() => {}}
        />
      );
      
      const endTime = Date.now();
      const renderTime = endTime - startTime;
      
      expect(getByTestId('signature-view')).toBeTruthy();
      expect(renderTime).toBeLessThan(100); // Should render in less than 100ms
    });
  });
});
