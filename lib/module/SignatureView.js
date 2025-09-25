import * as React from 'react';
import { UIManager, findNodeHandle, processColor, requireNativeComponent, } from 'react-native';
const COMPONENT_NAME = 'RNSignatureView';
const NativeComponent = requireNativeComponent(COMPONENT_NAME);
const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : false;
const debugLog = (...args) => {
    if (isDev) {
        console.log(...args);
    }
};
const getCommandId = (command) => {
    var _a, _b;
    const viewManagerConfig = (_b = (_a = UIManager.getViewManagerConfig) === null || _a === void 0 ? void 0 : _a.call(UIManager, COMPONENT_NAME)) !== null && _b !== void 0 ? _b : UIManager[COMPONENT_NAME];
    // Try Commands first (modern approach)
    const commands = viewManagerConfig === null || viewManagerConfig === void 0 ? void 0 : viewManagerConfig.Commands;
    if (commands && typeof commands[command] !== 'undefined') {
        return commands[command];
    }
    // Try Constants.Commands (iOS constantsToExport approach)
    const constants = viewManagerConfig === null || viewManagerConfig === void 0 ? void 0 : viewManagerConfig.Constants;
    if ((constants === null || constants === void 0 ? void 0 : constants.Commands) && typeof constants.Commands[command] !== 'undefined') {
        return constants.Commands[command];
    }
    // Hardcoded fallback
    const commandMap = {
        save: 0,
        clear: 1,
        setStrokeColor: 2,
        setStrokeWidth: 3,
    };
    if (commandMap[command] !== undefined) {
        return commandMap[command];
    }
    console.warn(`SignatureView: Unknown command '${command}', using fallback`);
    return 0;
};
const dispatchCommand = (viewRef, command, args = []) => {
    debugLog(`SignatureView: Attempting to dispatch '${command}' with args:`, args);
    if (!viewRef.current) {
        console.warn(`SignatureView: Cannot dispatch '${command}' - ref is null`);
        return;
    }
    const node = findNodeHandle(viewRef.current);
    debugLog(`SignatureView: Node handle for '${command}':`, node);
    if (node === null || node === undefined) {
        console.warn(`SignatureView: Cannot dispatch '${command}' - node handle is null`);
        return;
    }
    try {
        const commandId = getCommandId(command);
        debugLog(`SignatureView: Command ID for '${command}':`, commandId);
        UIManager.dispatchViewManagerCommand(node, commandId, args);
        debugLog(`SignatureView: Successfully dispatched '${command}'`);
    }
    catch (error) {
        console.error(`SignatureView: Error dispatching '${command}':`, error);
    }
};
export const SignatureView = React.forwardRef(({ onSave, onStrokeEnd, onStrokeStart, ...rest }, ref) => {
    const nativeRef = React.useRef(null);
    const handleSave = React.useCallback((event) => {
        onSave === null || onSave === void 0 ? void 0 : onSave(event.nativeEvent);
    }, [onSave]);
    const handleStrokeStart = React.useCallback(() => {
        onStrokeStart === null || onStrokeStart === void 0 ? void 0 : onStrokeStart();
    }, [onStrokeStart]);
    const handleStrokeEnd = React.useCallback(() => {
        onStrokeEnd === null || onStrokeEnd === void 0 ? void 0 : onStrokeEnd();
    }, [onStrokeEnd]);
    React.useImperativeHandle(ref, () => ({
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
    }), []);
    return (<NativeComponent ref={nativeRef} {...rest} onSave={handleSave} onStrokeStart={onStrokeStart ? handleStrokeStart : undefined} onStrokeEnd={onStrokeEnd ? handleStrokeEnd : undefined}/>);
});
SignatureView.displayName = 'SignatureView';
export default SignatureView;
