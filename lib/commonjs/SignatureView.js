"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignatureView = void 0;
const React = __importStar(require("react"));
const react_native_1 = require("react-native");
const COMPONENT_NAME = 'RNSignatureView';
const NativeComponent = (0, react_native_1.requireNativeComponent)(COMPONENT_NAME);
const getCommandId = (command) => {
    var _a, _b;
    const viewManagerConfig = (_b = (_a = react_native_1.UIManager.getViewManagerConfig) === null || _a === void 0 ? void 0 : _a.call(react_native_1.UIManager, COMPONENT_NAME)) !== null && _b !== void 0 ? _b : react_native_1.UIManager[COMPONENT_NAME];
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
    console.log(`SignatureView: Attempting to dispatch '${command}' with args:`, args);
    if (!viewRef.current) {
        console.warn(`SignatureView: Cannot dispatch '${command}' - ref is null`);
        return;
    }
    const node = (0, react_native_1.findNodeHandle)(viewRef.current);
    console.log(`SignatureView: Node handle for '${command}':`, node);
    if (node === null || node === undefined) {
        console.warn(`SignatureView: Cannot dispatch '${command}' - node handle is null`);
        return;
    }
    try {
        const commandId = getCommandId(command);
        console.log(`SignatureView: Command ID for '${command}':`, commandId);
        react_native_1.UIManager.dispatchViewManagerCommand(node, commandId, args);
        console.log(`SignatureView: Successfully dispatched '${command}'`);
    }
    catch (error) {
        console.error(`SignatureView: Error dispatching '${command}':`, error);
    }
};
exports.SignatureView = React.forwardRef(({ onSave, onStrokeEnd, onStrokeStart, ...rest }, ref) => {
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
            const processed = (0, react_native_1.processColor)(color);
            if (processed == null) {
                throw new Error('Invalid color value provided to SignatureView');
            }
            dispatchCommand(nativeRef, 'setStrokeColor', [processed]);
        },
        setStrokeWidth: (width) => dispatchCommand(nativeRef, 'setStrokeWidth', [width]),
    }), []);
    return (<NativeComponent ref={nativeRef} {...rest} onSave={handleSave} onStrokeStart={onStrokeStart ? handleStrokeStart : undefined} onStrokeEnd={onStrokeEnd ? handleStrokeEnd : undefined}/>);
});
exports.SignatureView.displayName = 'SignatureView';
exports.default = exports.SignatureView;
