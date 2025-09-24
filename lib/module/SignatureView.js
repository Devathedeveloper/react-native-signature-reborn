import * as React from 'react';
import {
  UIManager,
  findNodeHandle,
  processColor,
  requireNativeComponent,
} from 'react-native';
const COMPONENT_NAME = 'RNSignatureView';
const NativeComponent = requireNativeComponent(COMPONENT_NAME);
const getCommandId = (command) => {
  var _a;
  const viewManagerConfig =
    ((_a = UIManager.getViewManagerConfig)?.(COMPONENT_NAME)) ?? UIManager[COMPONENT_NAME];
  const commands = viewManagerConfig?.Commands;
  if (commands && typeof commands[command] !== 'undefined') {
    return commands[command];
  }
  return command;
};
const dispatchCommand = (viewRef, command, args = []) => {
  const node = findNodeHandle(viewRef.current);
  if (!node) {
    return;
  }
  const commandId = getCommandId(command);
  UIManager.dispatchViewManagerCommand(node, commandId, args);
};
export const SignatureView = React.forwardRef(({ onSave, onStrokeEnd, onStrokeStart, ...rest }, ref) => {
  const nativeRef = React.useRef(null);
  const handleSave = React.useCallback(
    (event) => {
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
    () => ({
      save: () => dispatchCommand(nativeRef, 'save'),
      clear: () => dispatchCommand(nativeRef, 'clear'),
      setStrokeColor: (color) => {
        const processed = processColor(color);
        if (processed == null) {
          throw new Error('Invalid color value provided to SignatureView');
        }
        dispatchCommand(nativeRef, 'setStrokeColor', [processed]);
      },
      setStrokeWidth: (width) => dispatchCommand(nativeRef, 'setStrokeWidth', [width]),
    }),
    [],
  );
  return React.createElement(
    NativeComponent,
    Object.assign(
      { ref: nativeRef },
      rest,
      {
        onSave: handleSave,
        onStrokeStart: onStrokeStart ? handleStrokeStart : undefined,
        onStrokeEnd: onStrokeEnd ? handleStrokeEnd : undefined,
      },
    ),
  );
});
SignatureView.displayName = 'SignatureView';
export default SignatureView;
