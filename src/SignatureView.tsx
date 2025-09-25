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
  imageFormat?: 'png' | 'jpeg';
  imageQuality?: number;
  shouldIncludeBase64?: boolean;
  imageBackgroundColor?: ColorValue;
  exportScale?: number;
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
  /** Absolute file path pointing to the saved image. */
  path: string;
  /** Base64 encoded image data matching the exported format, if enabled. */
  base64?: string;
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
   * Preferred export format. PNG keeps sharp edges; JPEG is more size efficient.
   * Defaults to `png`.
   */
  imageFormat?: 'png' | 'jpeg';
  /**
   * JPEG compression quality between 0 and 1. Ignored for PNG exports.
   * Defaults to `0.8` when exporting JPEGs.
   */
  imageQuality?: number;
  /**
   * When disabled, the native layer omits the Base64 string from the payload.
   * Useful to save memory when you only need the file path. Defaults to `true`.
   */
  shouldIncludeBase64?: boolean;
  /**
   * Overrides the background color that is burned into the exported image.
   * Helpful when you keep the on-screen view transparent but want opaque JPEGs.
   */
  imageBackgroundColor?: ColorValue;
  /**
   * Multiplier applied to the rendered pixel dimensions when exporting.
   * Use a value below `1` to downscale the output and shrink the file size.
   */
  exportScale?: number;
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
