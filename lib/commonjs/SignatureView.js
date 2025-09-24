"use strict";
var __createBinding = (this && this.__createBinding) ||
  (Object.create
    ? function(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function() {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault = (this && this.__setModuleDefault) ||
  (Object.create
    ? function(o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function(o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignatureView = void 0;
const React = __importStar(require("react"));
const react_native_1 = require("react-native");
const COMPONENT_NAME = "RNSignatureView";
const NativeComponent = (0, react_native_1.requireNativeComponent)(COMPONENT_NAME);
const getCommandId = (command) => {
  var _a, _b;
  const viewManagerConfig =
    ((_a = react_native_1.UIManager.getViewManagerConfig) === null || _a === void 0 ? void 0 : _a.call(react_native_1.UIManager, COMPONENT_NAME)) ||
    react_native_1.UIManager[COMPONENT_NAME];
  const commands = viewManagerConfig === null || viewManagerConfig === void 0 ? void 0 : viewManagerConfig.Commands;
  if (commands && typeof commands[command] !== "undefined") {
    return commands[command];
  }
  return command;
};
const dispatchCommand = (viewRef, command, args = []) => {
  const node = (0, react_native_1.findNodeHandle)(viewRef.current);
  if (!node) {
    return;
  }
  const commandId = getCommandId(command);
  react_native_1.UIManager.dispatchViewManagerCommand(node, commandId, args);
};
exports.SignatureView = React.forwardRef(({ onSave, onStrokeEnd, onStrokeStart, ...rest }, ref) => {
  const nativeRef = React.useRef(null);
  const handleSave = React.useCallback((event) => {
    var _a;
    (_a = onSave) === null || _a === void 0 ? void 0 : _a.call(onSave, event.nativeEvent);
  }, [onSave]);
  const handleStrokeStart = React.useCallback(() => {
    var _a;
    (_a = onStrokeStart) === null || _a === void 0 ? void 0 : _a.call(onStrokeStart);
  }, [onStrokeStart]);
  const handleStrokeEnd = React.useCallback(() => {
    var _a;
    (_a = onStrokeEnd) === null || _a === void 0 ? void 0 : _a.call(onStrokeEnd);
  }, [onStrokeEnd]);
  React.useImperativeHandle(
    ref,
    () => ({
      save: () => dispatchCommand(nativeRef, "save"),
      clear: () => dispatchCommand(nativeRef, "clear"),
      setStrokeColor: (color) => {
        const processed = (0, react_native_1.processColor)(color);
        if (processed == null) {
          throw new Error("Invalid color value provided to SignatureView");
        }
        dispatchCommand(nativeRef, "setStrokeColor", [processed]);
      },
      setStrokeWidth: (width) => dispatchCommand(nativeRef, "setStrokeWidth", [width]),
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
exports.SignatureView.displayName = "SignatureView";
exports.default = exports.SignatureView;
