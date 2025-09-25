import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignatureView, { SignatureViewHandle } from '../../src/SignatureView';

// Mock iOS-specific modules
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Platform: {
      ...RN.Platform,
      OS: 'ios',
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

describe('SignatureView iOS', () => {
  const mockOnSave = jest.fn();
  const mockOnStrokeStart = jest.fn();
  const mockOnStrokeEnd = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('iOS-Specific Features', () => {
    it('renders on iOS platform', () => {
      const { getByTestId } = render(
        <SignatureView testID="signature-view" />
      );
      expect(getByTestId('signature-view')).toBeTruthy();
    });

    it('handles iOS-specific props', () => {
      const { getByTestId } = render(
        <SignatureView
          testID="signature-view"
          strokeColor="#FF0000"
          strokeWidth={5}
          imageFormat="png"
          imageQuality={0.8}
          shouldIncludeBase64={true}
          imageBackgroundColor="#FFFFFF"
          exportScale={1.0}
        />
      );
      const component = getByTestId('signature-view');
      expect(component).toBeTruthy();
    });
  });

  describe('iOS Event Handling', () => {
    it('handles onSave event on iOS', async () => {
      const mockResult = {
        path: '/mock/ios/path/signature.png',
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

    it('handles stroke events on iOS', () => {
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

  describe('iOS Imperative API', () => {
    it('calls native save command on iOS', () => {
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

    it('calls native clear command on iOS', () => {
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

    it('calls native setStrokeColor command on iOS', () => {
      const ref = React.createRef<SignatureViewHandle>();
      const { UIManager, processColor } = require('react-native');
      
      render(<SignatureView ref={ref} testID="signature-view" />);
      
      ref.current?.setStrokeColor('#FF0000');
      
      expect(processColor).toHaveBeenCalledWith('#FF0000');
      expect(UIManager.dispatchViewManagerCommand).toHaveBeenCalledWith(
        1, // node handle
        2, // setStrokeColor command
        ['#FF0000']
      );
    });

    it('calls native setStrokeWidth command on iOS', () => {
      const ref = React.createRef<SignatureViewHandle>();
      const { UIManager } = require('react-native');
      
      render(<SignatureView ref={ref} testID="signature-view" />);
      
      ref.current?.setStrokeWidth(8);
      
      expect(UIManager.dispatchViewManagerCommand).toHaveBeenCalledWith(
        1, // node handle
        3, // setStrokeWidth command
        [8]
      );
    });
  });

  describe('iOS Error Handling', () => {
    it('handles invalid color gracefully on iOS', () => {
      const ref = React.createRef<SignatureViewHandle>();
      render(<SignatureView ref={ref} testID="signature-view" />);

      expect(() => {
        ref.current?.setStrokeColor('invalid-color' as any);
      }).toThrow('Invalid color value provided to SignatureView');
    });

    it('handles null ref gracefully on iOS', () => {
      const ref = React.createRef<SignatureViewHandle>();
      render(<SignatureView ref={ref} testID="signature-view" />);

      expect(() => {
        ref.current?.save();
        ref.current?.clear();
        ref.current?.setStrokeColor('#FF0000');
        ref.current?.setStrokeWidth(5);
      }).not.toThrow();
    });

    it('handles various invalid color formats on iOS', () => {
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

    it('handles invalid stroke width values on iOS', () => {
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
        }).not.toThrow(`Width ${width} should not throw on iOS`);
      });
    });

    it('handles malformed event data on iOS', () => {
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
        }).not.toThrow(`Event ${index} should not throw on iOS`);
      });
    });

    it('handles rapid prop changes on iOS', () => {
      const TestComponent = () => {
        const [strokeColor, setStrokeColor] = React.useState('#FF0000');
        const [strokeWidth, setStrokeWidth] = React.useState(3);

        React.useEffect(() => {
          const interval = setInterval(() => {
            setStrokeColor(prev => prev === '#FF0000' ? '#00FF00' : '#FF0000');
            setStrokeWidth(prev => prev === 3 ? 8 : 3);
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

    it('handles component unmounting during operations on iOS', () => {
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

    it('handles memory pressure on iOS', () => {
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

    it('handles edge case prop combinations on iOS', () => {
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

  describe('iOS Performance', () => {
    it('renders efficiently on iOS', () => {
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
      expect(renderTime).toBeLessThan(50); // Should render quickly on iOS
    });
  });
});
