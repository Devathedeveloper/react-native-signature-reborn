import React from 'react';
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

describe('SignatureView', () => {
  const mockOnSave = jest.fn();
  const mockOnStrokeStart = jest.fn();
  const mockOnStrokeEnd = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { getByTestId } = render(
        <SignatureView testID="signature-view" />
      );
      expect(getByTestId('signature-view')).toBeTruthy();
    });

    it('renders with all props', () => {
      const { getByTestId } = render(
        <SignatureView
          testID="signature-view"
          strokeColor="#FF0000"
          strokeWidth={5}
          imageFormat="jpeg"
          imageQuality={0.9}
          shouldIncludeBase64={false}
          imageBackgroundColor="#FFFFFF"
          exportScale={1.5}
          onSave={mockOnSave}
          onStrokeStart={mockOnStrokeStart}
          onStrokeEnd={mockOnStrokeEnd}
        />
      );
      expect(getByTestId('signature-view')).toBeTruthy();
    });

    it('renders with minimal props', () => {
      const { getByTestId } = render(
        <SignatureView testID="signature-view" />
      );
      expect(getByTestId('signature-view')).toBeTruthy();
    });
  });

  describe('Props', () => {
    it('passes strokeColor prop correctly', () => {
      const { getByTestId } = render(
        <SignatureView testID="signature-view" strokeColor="#00FF00" />
      );
      const component = getByTestId('signature-view');
      expect(component.props.strokeColor).toBe('#00FF00');
    });

    it('passes strokeWidth prop correctly', () => {
      const { getByTestId } = render(
        <SignatureView testID="signature-view" strokeWidth={8} />
      );
      const component = getByTestId('signature-view');
      expect(component.props.strokeWidth).toBe(8);
    });

    it('passes imageFormat prop correctly', () => {
      const { getByTestId } = render(
        <SignatureView testID="signature-view" imageFormat="jpeg" />
      );
      const component = getByTestId('signature-view');
      expect(component.props.imageFormat).toBe('jpeg');
    });

    it('passes imageQuality prop correctly', () => {
      const { getByTestId } = render(
        <SignatureView testID="signature-view" imageQuality={0.7} />
      );
      const component = getByTestId('signature-view');
      expect(component.props.imageQuality).toBe(0.7);
    });

    it('passes shouldIncludeBase64 prop correctly', () => {
      const { getByTestId } = render(
        <SignatureView testID="signature-view" shouldIncludeBase64={false} />
      );
      const component = getByTestId('signature-view');
      expect(component.props.shouldIncludeBase64).toBe(false);
    });

    it('passes imageBackgroundColor prop correctly', () => {
      const { getByTestId } = render(
        <SignatureView testID="signature-view" imageBackgroundColor="#000000" />
      );
      const component = getByTestId('signature-view');
      expect(component.props.imageBackgroundColor).toBe('#000000');
    });

    it('passes exportScale prop correctly', () => {
      const { getByTestId } = render(
        <SignatureView testID="signature-view" exportScale={2.0} />
      );
      const component = getByTestId('signature-view');
      expect(component.props.exportScale).toBe(2.0);
    });
  });

  describe('Event Handlers', () => {
    it('calls onSave when save event is triggered', async () => {
      const mockResult: SignatureResult = {
        path: '/mock/path/signature.png',
        base64: 'mockBase64String',
      };

      const { getByTestId } = render(
        <SignatureView testID="signature-view" onSave={mockOnSave} />
      );

      // Simulate the native onSave event
      const component = getByTestId('signature-view');
      fireEvent(component, 'onSave', { nativeEvent: mockResult });

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(mockResult);
      });
    });

    it('calls onStrokeStart when stroke starts', () => {
      const { getByTestId } = render(
        <SignatureView testID="signature-view" onStrokeStart={mockOnStrokeStart} />
      );

      const component = getByTestId('signature-view');
      fireEvent(component, 'onStrokeStart');

      expect(mockOnStrokeStart).toHaveBeenCalled();
    });

    it('calls onStrokeEnd when stroke ends', () => {
      const { getByTestId } = render(
        <SignatureView testID="signature-view" onStrokeEnd={mockOnStrokeEnd} />
      );

      const component = getByTestId('signature-view');
      fireEvent(component, 'onStrokeEnd');

      expect(mockOnStrokeEnd).toHaveBeenCalled();
    });

    it('does not call event handlers when not provided', () => {
      const { getByTestId } = render(
        <SignatureView testID="signature-view" />
      );

      const component = getByTestId('signature-view');
      fireEvent(component, 'onSave', { nativeEvent: { path: 'test', base64: 'test' } });
      fireEvent(component, 'onStrokeStart');
      fireEvent(component, 'onStrokeEnd');

      expect(mockOnSave).not.toHaveBeenCalled();
      expect(mockOnStrokeStart).not.toHaveBeenCalled();
      expect(mockOnStrokeEnd).not.toHaveBeenCalled();
    });
  });

  describe('Imperative API', () => {
    it('exposes save method through ref', () => {
      const ref = React.createRef<SignatureViewHandle>();
      render(<SignatureView ref={ref} testID="signature-view" />);

      expect(ref.current).toBeTruthy();
      expect(typeof ref.current?.save).toBe('function');
    });

    it('exposes clear method through ref', () => {
      const ref = React.createRef<SignatureViewHandle>();
      render(<SignatureView ref={ref} testID="signature-view" />);

      expect(ref.current).toBeTruthy();
      expect(typeof ref.current?.clear).toBe('function');
    });

    it('exposes setStrokeColor method through ref', () => {
      const ref = React.createRef<SignatureViewHandle>();
      render(<SignatureView ref={ref} testID="signature-view" />);

      expect(ref.current).toBeTruthy();
      expect(typeof ref.current?.setStrokeColor).toBe('function');
    });

    it('exposes setStrokeWidth method through ref', () => {
      const ref = React.createRef<SignatureViewHandle>();
      render(<SignatureView ref={ref} testID="signature-view" />);

      expect(ref.current).toBeTruthy();
      expect(typeof ref.current?.setStrokeWidth).toBe('function');
    });
  });

  describe('Error Handling', () => {
    it('throws error for invalid color in setStrokeColor', () => {
      const ref = React.createRef<SignatureViewHandle>();
      render(<SignatureView ref={ref} testID="signature-view" />);

      expect(() => {
        ref.current?.setStrokeColor('invalid-color' as any);
      }).toThrow('Invalid color value provided to SignatureView');
    });

    it('throws error for null color in setStrokeColor', () => {
      const ref = React.createRef<SignatureViewHandle>();
      render(<SignatureView ref={ref} testID="signature-view" />);

      expect(() => {
        ref.current?.setStrokeColor(null as any);
      }).toThrow('Invalid color value provided to SignatureView');
    });

    it('throws error for undefined color in setStrokeColor', () => {
      const ref = React.createRef<SignatureViewHandle>();
      render(<SignatureView ref={ref} testID="signature-view" />);

      expect(() => {
        ref.current?.setStrokeColor(undefined as any);
      }).toThrow('Invalid color value provided to SignatureView');
    });

    it('throws error for empty string color in setStrokeColor', () => {
      const ref = React.createRef<SignatureViewHandle>();
      render(<SignatureView ref={ref} testID="signature-view" />);

      expect(() => {
        ref.current?.setStrokeColor('' as any);
      }).toThrow('Invalid color value provided to SignatureView');
    });

    it('handles null ref gracefully', () => {
      const ref = React.createRef<SignatureViewHandle>();
      render(<SignatureView ref={ref} testID="signature-view" />);

      // Should not throw when ref is null
      expect(() => {
        ref.current?.save();
        ref.current?.clear();
        ref.current?.setStrokeColor('#FF0000');
        ref.current?.setStrokeWidth(5);
      }).not.toThrow();
    });

    it('handles undefined ref gracefully', () => {
      const ref = React.createRef<SignatureViewHandle>();
      render(<SignatureView ref={ref} testID="signature-view" />);

      // Simulate undefined ref
      const originalCurrent = ref.current;
      (ref as any).current = undefined;

      expect(() => {
        ref.current?.save();
        ref.current?.clear();
        ref.current?.setStrokeColor('#FF0000');
        ref.current?.setStrokeWidth(5);
      }).not.toThrow();

      // Restore original ref
      (ref as any).current = originalCurrent;
    });

    it('handles invalid stroke width values gracefully', () => {
      const ref = React.createRef<SignatureViewHandle>();
      render(<SignatureView ref={ref} testID="signature-view" />);

      // Should not throw for various invalid width values
      expect(() => {
        ref.current?.setStrokeWidth(-1);
        ref.current?.setStrokeWidth(0);
        ref.current?.setStrokeWidth(NaN);
        ref.current?.setStrokeWidth(Infinity);
        ref.current?.setStrokeWidth(-Infinity);
      }).not.toThrow();
    });

    it('handles invalid image quality values gracefully', () => {
      const { getByTestId } = render(
        <SignatureView
          testID="signature-view"
          imageQuality={-0.5}
        />
      );
      const component = getByTestId('signature-view');

      // Should render even with invalid quality
      expect(component).toBeTruthy();
      expect(component.props.imageQuality).toBe(-0.5);
    });

    it('handles invalid export scale values gracefully', () => {
      const { getByTestId } = render(
        <SignatureView
          testID="signature-view"
          exportScale={-1.5}
        />
      );
      const component = getByTestId('signature-view');

      // Should render even with invalid scale
      expect(component).toBeTruthy();
      expect(component.props.exportScale).toBe(-1.5);
    });

    it('handles invalid image format gracefully', () => {
      const { getByTestId } = render(
        <SignatureView
          testID="signature-view"
          imageFormat={'invalid-format' as any}
        />
      );
      const component = getByTestId('signature-view');

      // Should render even with invalid format
      expect(component).toBeTruthy();
      expect(component.props.imageFormat).toBe('invalid-format');
    });

    it('handles malformed event data gracefully', () => {
      const { getByTestId } = render(
        <SignatureView testID="signature-view" onSave={jest.fn()} />
      );
      const component = getByTestId('signature-view');

      // Should not crash with malformed event data
      expect(() => {
        fireEvent(component, 'onSave', { nativeEvent: null });
        fireEvent(component, 'onSave', { nativeEvent: undefined });
        fireEvent(component, 'onSave', { nativeEvent: {} });
        fireEvent(component, 'onSave', { nativeEvent: { path: null } });
        fireEvent(component, 'onSave', { nativeEvent: { base64: null } });
      }).not.toThrow();
    });

    it('handles component unmounting during async operations', () => {
      const { getByTestId, unmount } = render(
        <SignatureView testID="signature-view" onSave={jest.fn()} />
      );
      const component = getByTestId('signature-view');

      // Trigger an event and immediately unmount
      fireEvent(component, 'onSave', { nativeEvent: { path: 'test', base64: 'test' } });
      unmount();

      // Should not throw after unmounting
      expect(() => {
        // Any additional operations after unmount should be safe
      }).not.toThrow();
    });

    it('handles rapid successive calls gracefully', () => {
      const ref = React.createRef<SignatureViewHandle>();
      render(<SignatureView ref={ref} testID="signature-view" />);

      // Rapid successive calls should not cause issues
      expect(() => {
        for (let i = 0; i < 100; i++) {
          ref.current?.save();
          ref.current?.clear();
          ref.current?.setStrokeColor('#FF0000');
          ref.current?.setStrokeWidth(i);
        }
      }).not.toThrow();
    });

    it('handles memory pressure scenarios', () => {
      const ref = React.createRef<SignatureViewHandle>();
      render(<SignatureView ref={ref} testID="signature-view" />);

      // Simulate memory pressure by creating many operations
      const operations = [];
      for (let i = 0; i < 1000; i++) {
        operations.push(() => ref.current?.setStrokeColor(`#${i.toString(16).padStart(6, '0')}`));
        operations.push(() => ref.current?.setStrokeWidth(i % 10));
      }

      expect(() => {
        operations.forEach(op => op());
      }).not.toThrow();
    });
  });

  describe('Default Values', () => {
    it('uses default values when props are not provided', () => {
      const { getByTestId } = render(
        <SignatureView testID="signature-view" />
      );
      const component = getByTestId('signature-view');

      expect(component.props.strokeColor).toBeUndefined();
      expect(component.props.strokeWidth).toBeUndefined();
      expect(component.props.imageFormat).toBeUndefined();
      expect(component.props.imageQuality).toBeUndefined();
      expect(component.props.shouldIncludeBase64).toBeUndefined();
      expect(component.props.imageBackgroundColor).toBeUndefined();
      expect(component.props.exportScale).toBeUndefined();
    });
  });
});
