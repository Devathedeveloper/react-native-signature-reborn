import * as React from 'react';
import {
  ColorValue,
  NativeSyntheticEvent,
  UIManager,
  ViewProps,
  findNodeHandle,
  processColor,
  requireNativeComponent,
} from 'react-native';

const COMPONENT_NAME = 'RNSignatureView';

type NativeSignatureSavedEvent = NativeSyntheticEvent<SignatureResult>;
type NativeStrokeEvent = NativeSyntheticEvent<null>;

interface NativeProps extends ViewProps {
  strokeColor?: ColorValue;
  strokeWidth?: number;
  onSave?: (event: NativeSignatureSavedEvent) => void;
  onStrokeStart?: (event: NativeStrokeEvent) => void;
  onStrokeEnd?: (event: NativeStrokeEvent) => void;
}

const NativeComponent = requireNativeComponent<NativeProps>(COMPONENT_NAME);

const getCommandId = (command: string) => {
  const viewManagerConfig =
    UIManager.getViewManagerConfig?.(COMPONENT_NAME) ??
    (UIManager as any)[COMPONENT_NAME];
  const commands = viewManagerConfig?.Commands;
  if (commands && typeof commands[command] !== 'undefined') {
    return commands[command];
  }
  return command;
};

const dispatchCommand = (
  viewRef: React.RefObject<unknown>,
  command: string,
  args: unknown[] = [],
) => {
  const node = findNodeHandle(viewRef.current);
  if (!node) {
    return;
  }

  const commandId = getCommandId(command);
  UIManager.dispatchViewManagerCommand(node, commandId, args);
};

export interface SignatureResult {
  /** Absolute file path pointing to the saved PNG image. */
  path: string;
  /** Base64 encoded PNG data for quick sharing or uploading. */
  base64: string;
}

export interface SignatureViewHandle {
  /** Saves the current drawing and resolves via the onSave callback. */
  save(): void;
  /** Removes all strokes from the canvas. */
  clear(): void;
  /** Updates the stroke color for subsequent strokes. */
  setStrokeColor(color: ColorValue): void;
  /** Updates the stroke width for subsequent strokes. */
  setStrokeWidth(width: number): void;
}

export interface SignatureViewProps extends ViewProps {
  /**
   * Initial stroke color used when the component is mounted.
   * Can be updated later using the imperative handle.
   */
  strokeColor?: ColorValue;
  /**
   * Initial stroke width used when the component is mounted.
   * Can be updated later using the imperative handle.
   */
  strokeWidth?: number;
  /**
   * Triggered when the native view finishes exporting an image.
   */
  onSave?: (result: SignatureResult) => void;
  /**
   * Fires when the user starts a new stroke.
   */
  onStrokeStart?: () => void;
  /**
   * Fires when the user completes a stroke.
   */
  onStrokeEnd?: () => void;
}

export const SignatureView = React.forwardRef<SignatureViewHandle, SignatureViewProps>(
  ({ onSave, onStrokeEnd, onStrokeStart, ...rest }, ref) => {
    const nativeRef = React.useRef(null);

    const handleSave = React.useCallback(
      (event: NativeSignatureSavedEvent) => {
        onSave?.(event.nativeEvent);
      },
      [onSave],
    );

    const handleStrokeStart = React.useCallback(() => {
      onStrokeStart?.();
    }, [onStrokeStart]);

    const handleStrokeEnd = React.useCallback(() => {
      onStrokeEnd?.();
    }, [onStrokeEnd]);

    React.useImperativeHandle(
      ref,
      (): SignatureViewHandle => ({
        save: () => dispatchCommand(nativeRef, 'save'),
        clear: () => dispatchCommand(nativeRef, 'clear'),
        setStrokeColor: (color: ColorValue) => {
          const processed = processColor(color);
          if (processed == null) {
            throw new Error('Invalid color value provided to SignatureView');
          }
          dispatchCommand(nativeRef, 'setStrokeColor', [processed]);
        },
        setStrokeWidth: (width: number) =>
          dispatchCommand(nativeRef, 'setStrokeWidth', [width]),
      }),
      [],
    );

    return (
      <NativeComponent
        ref={nativeRef}
        {...rest}
        onSave={handleSave}
        onStrokeStart={onStrokeStart ? handleStrokeStart : undefined}
        onStrokeEnd={onStrokeEnd ? handleStrokeEnd : undefined}
      />
    );
  },
);

SignatureView.displayName = 'SignatureView';

export default SignatureView;
