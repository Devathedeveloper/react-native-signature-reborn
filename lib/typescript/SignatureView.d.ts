import * as React from 'react';
import { ColorValue, ViewProps } from 'react-native';
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
export declare const SignatureView: React.ForwardRefExoticComponent<
  SignatureViewProps & React.RefAttributes<SignatureViewHandle>
>;
declare const _default: typeof SignatureView;
export default _default;
