import * as React from 'react';
import { ColorValue, ViewProps } from 'react-native';
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
export declare const SignatureView: React.ForwardRefExoticComponent<
  SignatureViewProps & React.RefAttributes<SignatureViewHandle>
>;
declare const _default: typeof SignatureView;
export default _default;
