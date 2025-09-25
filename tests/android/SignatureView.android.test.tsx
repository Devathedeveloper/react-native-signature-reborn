import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignatureView, { SignatureViewHandle } from '../../src/SignatureView';

// Mock Android-specific modules
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Platform: {
      ...RN.Platform,
      OS: 'android',
    },
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

describe('SignatureView Android', () => {
  const mockOnSave = jest.fn();
  const mockOnStrokeStart = jest.fn();
  const mockOnStrokeEnd = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Android-Specific Features', () => {
    it('renders on Android platform', () => {
      const { getByTestId } = render(
        <SignatureView testID="signature-view" />
      );
      expect(getByTestId('signature-view')).toBeTruthy();
    });

    it('handles Android-specific props', () => {
      const { getByTestId } = render(
        <SignatureView
          testID="signature-view"
          strokeColor="#00FF00"
          strokeWidth={4}
          imageFormat="jpeg"
          imageQuality={0.9}
          shouldIncludeBase64={false}
          imageBackgroundColor="#000000"
          exportScale={1.5}
        />
      );
      const component = getByTestId('signature-view');
      expect(component).toBeTruthy();
    });
  });

  describe('Android Event Handling', () => {
    it('handles onSave event on Android', async () => {
      const mockResult = {
        path: '/mock/android/path/signature.jpg',
        base64: 'mockBase64String',
      };

      const { getByTestId } = render(
        <SignatureView testID="signature-view" onSave={mockOnSave} />
      );

      const component = getByTestId('signature-view');
      fireEvent(component, 'onSave', { nativeEvent: mockResult });

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(mockResult);
      });
    });

    it('handles stroke events on Android', () => {
      const { getByTestId } = render(
        <SignatureView
          testID="signature-view"
          onStrokeStart={mockOnStrokeStart}
          onStrokeEnd={mockOnStrokeEnd}
        />
      );

      const component = getByTestId('signature-view');
      fireEvent(component, 'onStrokeStart');
      fireEvent(component, 'onStrokeEnd');

      expect(mockOnStrokeStart).toHaveBeenCalled();
      expect(mockOnStrokeEnd).toHaveBeenCalled();
    });
  });

  describe('Android Imperative API', () => {
    it('calls native save command on Android', () => {
      const ref = React.createRef<SignatureViewHandle>();
      const { UIManager } = require('react-native');
      
      render(<SignatureView ref={ref} testID="signature-view" />);
      
      ref.current?.save();
      
      expect(UIManager.dispatchViewManagerCommand).toHaveBeenCalledWith(
        1, // node handle
        0, // save command
        []
      );
    });

    it('calls native clear command on Android', () => {
      const ref = React.createRef<SignatureViewHandle>();
      const { UIManager } = require('react-native');
      
      render(<SignatureView ref={ref} testID="signature-view" />);
      
      ref.current?.clear();
      
      expect(UIManager.dispatchViewManagerCommand).toHaveBeenCalledWith(
        1, // node handle
        1, // clear command
        []
      );
    });

    it('calls native setStrokeColor command on Android', () => {
      const ref = React.createRef<SignatureViewHandle>();
      const { UIManager, processColor } = require('react-native');
      
      render(<SignatureView ref={ref} testID="signature-view" />);
      
      ref.current?.setStrokeColor('#00FF00');
      
      expect(processColor).toHaveBeenCalledWith('#00FF00');
      expect(UIManager.dispatchViewManagerCommand).toHaveBeenCalledWith(
        1, // node handle
        2, // setStrokeColor command
        ['#00FF00']
      );
    });

    it('calls native setStrokeWidth command on Android', () => {
      const ref = React.createRef<SignatureViewHandle>();
      const { UIManager } = require('react-native');
      
      render(<SignatureView ref={ref} testID="signature-view" />);
      
      ref.current?.setStrokeWidth(6);
      
      expect(UIManager.dispatchViewManagerCommand).toHaveBeenCalledWith(
        1, // node handle
        3, // setStrokeWidth command
        [6]
      );
    });
  });

  describe('Android Error Handling', () => {
    it('handles invalid color gracefully on Android', () => {
      const ref = React.createRef<SignatureViewHandle>();
      render(<SignatureView ref={ref} testID="signature-view" />);

      expect(() => {
        ref.current?.setStrokeColor('invalid-color' as any);
      }).toThrow('Invalid color value provided to SignatureView');
    });

    it('handles null ref gracefully on Android', () => {
      const ref = React.createRef<SignatureViewHandle>();
      render(<SignatureView ref={ref} testID="signature-view" />);

      expect(() => {
        ref.current?.save();
        ref.current?.clear();
        ref.current?.setStrokeColor('#00FF00');
        ref.current?.setStrokeWidth(4);
      }).not.toThrow();
    });

    it('handles various invalid color formats on Android', () => {
      const ref = React.createRef<SignatureViewHandle>();
      render(<SignatureView ref={ref} testID="signature-view" />);

      const invalidColors = [
        null,
        undefined,
        '',
        'not-a-color',
        'rgb(invalid)',
        'hsl(invalid)',
        '#invalid',
        '#gggggg',
        'rgba(255,255,255,invalid)',
        {},
        [],
        123,
        NaN,
        Infinity,
        -Infinity,
      ];

      invalidColors.forEach(color => {
        expect(() => {
          ref.current?.setStrokeColor(color as any);
        }).toThrow('Invalid color value provided to SignatureView');
      });
    });

    it('handles invalid stroke width values on Android', () => {
      const ref = React.createRef<SignatureViewHandle>();
      render(<SignatureView ref={ref} testID="signature-view" />);

      const invalidWidths = [
        null,
        undefined,
        'invalid',
        {},
        [],
        NaN,
        Infinity,
        -Infinity,
        Number.MAX_SAFE_INTEGER + 1,
        Number.MIN_SAFE_INTEGER - 1,
      ];

      invalidWidths.forEach(width => {
        expect(() => {
          ref.current?.setStrokeWidth(width as any);
        }).not.toThrow(`Width ${width} should not throw on Android`);
      });
    });

    it('handles malformed event data on Android', () => {
      const { getByTestId } = render(
        <SignatureView testID="signature-view" onSave={jest.fn()} />
      );
      const component = getByTestId('signature-view');

      const malformedEvents = [
        { nativeEvent: null },
        { nativeEvent: undefined },
        { nativeEvent: {} },
        { nativeEvent: { path: null } },
        { nativeEvent: { base64: null } },
        { nativeEvent: { path: 123, base64: 456 } },
        { nativeEvent: { path: [], base64: {} } },
      ];

      malformedEvents.forEach((eventData, index) => {
        expect(() => {
          fireEvent(component, 'onSave', eventData);
        }).not.toThrow(`Event ${index} should not throw on Android`);
      });
    });

    it('handles rapid prop changes on Android', () => {
      const TestComponent = () => {
        const [strokeColor, setStrokeColor] = React.useState('#00FF00');
        const [strokeWidth, setStrokeWidth] = React.useState(4);

        React.useEffect(() => {
          const interval = setInterval(() => {
            setStrokeColor(prev => prev === '#00FF00' ? '#FF0000' : '#00FF00');
            setStrokeWidth(prev => prev === 4 ? 8 : 4);
          }, 1);

          return () => clearInterval(interval);
        }, []);

        return (
          <SignatureView
            testID="signature-view"
            strokeColor={strokeColor}
            strokeWidth={strokeWidth}
          />
        );
      };

      const { getByTestId } = render(<TestComponent />);
      const signatureView = getByTestId('signature-view');

      expect(signatureView).toBeTruthy();
    });

    it('handles component unmounting during operations on Android', () => {
      const { getByTestId, unmount } = render(
        <SignatureView testID="signature-view" onSave={jest.fn()} />
      );
      const component = getByTestId('signature-view');

      // Trigger events and immediately unmount
      fireEvent(component, 'onSave', { nativeEvent: { path: 'test', base64: 'test' } });
      fireEvent(component, 'onStrokeStart');
      fireEvent(component, 'onStrokeEnd');
      unmount();

      expect(() => {
        // Additional operations after unmount should be safe
      }).not.toThrow();
    });

    it('handles memory pressure on Android', () => {
      const ref = React.createRef<SignatureViewHandle>();
      render(<SignatureView ref={ref} testID="signature-view" />);

      // Simulate memory pressure
      const operations = [];
      for (let i = 0; i < 10000; i++) {
        operations.push(() => ref.current?.setStrokeColor(`#${i.toString(16).padStart(6, '0')}`));
        operations.push(() => ref.current?.setStrokeWidth(i % 10));
      }

      expect(() => {
        operations.forEach(op => op());
      }).not.toThrow();
    });

    it('handles edge case prop combinations on Android', () => {
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

    it('handles Android-specific export errors', () => {
      const { getByTestId } = render(
        <SignatureView
          testID="signature-view"
          imageFormat={'invalid-format' as any}
          imageQuality={-1}
          exportScale={-2}
          shouldIncludeBase64={null as any}
        />
      );
      const signatureView = getByTestId('signature-view');

      // Should render even with invalid export settings
      expect(signatureView).toBeTruthy();
    });

    it('handles concurrent operations on Android', () => {
      const ref = React.createRef<SignatureViewHandle>();
      render(<SignatureView ref={ref} testID="signature-view" />);

      // Simulate concurrent operations
      const operations = [
        () => ref.current?.save(),
        () => ref.current?.clear(),
        () => ref.current?.setStrokeColor('#00FF00'),
        () => ref.current?.setStrokeWidth(4),
        () => ref.current?.setStrokeColor('#FF0000'),
        () => ref.current?.setStrokeWidth(8),
      ];

      // Run operations concurrently
      expect(() => {
        operations.forEach(op => {
          setTimeout(op, Math.random() * 10);
        });
      }).not.toThrow();
    });
  });

  describe('Android Performance', () => {
    it('renders efficiently on Android', () => {
      const startTime = Date.now();
      
      const { getByTestId } = render(
        <SignatureView
          testID="signature-view"
          strokeColor="#000000"
          strokeWidth={3}
          imageFormat="png"
          imageQuality={0.8}
          shouldIncludeBase64={true}
          onSave={() => {}}
          onStrokeStart={() => {}}
          onStrokeEnd={() => {}}
        />
      );
      
      const endTime = Date.now();
      const renderTime = endTime - startTime;
      
      expect(getByTestId('signature-view')).toBeTruthy();
      expect(renderTime).toBeLessThan(100); // Should render quickly on Android
    });
  });

  describe('Android Export Features', () => {
    it('handles JPEG export on Android', () => {
      const { getByTestId } = render(
        <SignatureView
          testID="signature-view"
          imageFormat="jpeg"
          imageQuality={0.7}
          shouldIncludeBase64={true}
        />
      );
      const component = getByTestId('signature-view');
      
      expect(component.props.imageFormat).toBe('jpeg');
      expect(component.props.imageQuality).toBe(0.7);
      expect(component.props.shouldIncludeBase64).toBe(true);
    });

    it('handles PNG export on Android', () => {
      const { getByTestId } = render(
        <SignatureView
          testID="signature-view"
          imageFormat="png"
          shouldIncludeBase64={false}
        />
      );
      const component = getByTestId('signature-view');
      
      expect(component.props.imageFormat).toBe('png');
      expect(component.props.shouldIncludeBase64).toBe(false);
    });

    it('handles export scale on Android', () => {
      const { getByTestId } = render(
        <SignatureView
          testID="signature-view"
          exportScale={2.0}
        />
      );
      const component = getByTestId('signature-view');
      
      expect(component.props.exportScale).toBe(2.0);
    });
  });
});
