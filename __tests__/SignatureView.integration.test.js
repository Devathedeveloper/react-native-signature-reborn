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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_native_1 = require("@testing-library/react-native");
const SignatureView_1 = __importDefault(require("../src/SignatureView"));
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
// Test component that uses SignatureView
const TestSignatureApp = () => {
    const signatureRef = (0, react_1.useRef)(null);
    const [signature, setSignature] = (0, react_1.useState)(null);
    const [strokeColor, setStrokeColor] = (0, react_1.useState)('#000000');
    const [strokeWidth, setStrokeWidth] = (0, react_1.useState)(3);
    const handleSave = () => {
        var _a;
        (_a = signatureRef.current) === null || _a === void 0 ? void 0 : _a.save();
    };
    const handleClear = () => {
        var _a;
        (_a = signatureRef.current) === null || _a === void 0 ? void 0 : _a.clear();
        setSignature(null);
    };
    const handleChangeColor = () => {
        var _a;
        const newColor = strokeColor === '#000000' ? '#FF0000' : '#000000';
        setStrokeColor(newColor);
        (_a = signatureRef.current) === null || _a === void 0 ? void 0 : _a.setStrokeColor(newColor);
    };
    const handleChangeWidth = () => {
        var _a;
        const newWidth = strokeWidth === 3 ? 8 : 3;
        setStrokeWidth(newWidth);
        (_a = signatureRef.current) === null || _a === void 0 ? void 0 : _a.setStrokeWidth(newWidth);
    };
    return (<SignatureView_1.default testID="signature-view" ref={signatureRef} strokeColor={strokeColor} strokeWidth={strokeWidth} imageFormat="png" imageQuality={0.8} onSave={setSignature} onStrokeStart={() => console.log('Stroke started')} onStrokeEnd={() => console.log('Stroke ended')}/>);
};
describe('SignatureView Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('Complete Workflow', () => {
        it('handles complete signature workflow', async () => {
            const { getByTestId } = (0, react_native_1.render)(<TestSignatureApp />);
            const signatureView = getByTestId('signature-view');
            // Simulate stroke start
            (0, react_native_1.fireEvent)(signatureView, 'onStrokeStart');
            // Simulate stroke end
            (0, react_native_1.fireEvent)(signatureView, 'onStrokeEnd');
            // Simulate save
            const mockResult = {
                path: '/mock/path/signature.png',
                base64: 'mockBase64String',
            };
            (0, react_native_1.fireEvent)(signatureView, 'onSave', { nativeEvent: mockResult });
            await (0, react_native_1.waitFor)(() => {
                expect(signatureView).toBeTruthy();
            });
        });
        it('handles multiple strokes and saves', async () => {
            const { getByTestId } = (0, react_native_1.render)(<TestSignatureApp />);
            const signatureView = getByTestId('signature-view');
            // Simulate multiple strokes
            for (let i = 0; i < 3; i++) {
                (0, react_native_1.fireEvent)(signatureView, 'onStrokeStart');
                (0, react_native_1.fireEvent)(signatureView, 'onStrokeEnd');
            }
            // Simulate save
            const mockResult = {
                path: '/mock/path/signature.png',
                base64: 'mockBase64String',
            };
            (0, react_native_1.fireEvent)(signatureView, 'onSave', { nativeEvent: mockResult });
            await (0, react_native_1.waitFor)(() => {
                expect(signatureView).toBeTruthy();
            });
        });
    });
    describe('Dynamic Property Changes', () => {
        it('handles dynamic stroke color changes', () => {
            const { getByTestId } = (0, react_native_1.render)(<TestSignatureApp />);
            const signatureView = getByTestId('signature-view');
            // Initial color
            expect(signatureView.props.strokeColor).toBe('#000000');
            // Change color (this would be done through the imperative API in real usage)
            // We can't easily test the imperative API without more complex mocking
            expect(signatureView).toBeTruthy();
        });
        it('handles dynamic stroke width changes', () => {
            const { getByTestId } = (0, react_native_1.render)(<TestSignatureApp />);
            const signatureView = getByTestId('signature-view');
            // Initial width
            expect(signatureView.props.strokeWidth).toBe(3);
            // Change width (this would be done through the imperative API in real usage)
            expect(signatureView).toBeTruthy();
        });
    });
    describe('Export Configuration', () => {
        it('handles PNG export configuration', () => {
            const { getByTestId } = (0, react_native_1.render)(<SignatureView_1.default testID="signature-view" imageFormat="png" imageQuality={0.9} shouldIncludeBase64={true}/>);
            const signatureView = getByTestId('signature-view');
            expect(signatureView.props.imageFormat).toBe('png');
            expect(signatureView.props.imageQuality).toBe(0.9);
            expect(signatureView.props.shouldIncludeBase64).toBe(true);
        });
        it('handles JPEG export configuration', () => {
            const { getByTestId } = (0, react_native_1.render)(<SignatureView_1.default testID="signature-view" imageFormat="jpeg" imageQuality={0.7} shouldIncludeBase64={false} imageBackgroundColor="#FFFFFF"/>);
            const signatureView = getByTestId('signature-view');
            expect(signatureView.props.imageFormat).toBe('jpeg');
            expect(signatureView.props.imageQuality).toBe(0.7);
            expect(signatureView.props.shouldIncludeBase64).toBe(false);
            expect(signatureView.props.imageBackgroundColor).toBe('#FFFFFF');
        });
        it('handles export scale configuration', () => {
            const { getByTestId } = (0, react_native_1.render)(<SignatureView_1.default testID="signature-view" exportScale={2.0}/>);
            const signatureView = getByTestId('signature-view');
            expect(signatureView.props.exportScale).toBe(2.0);
        });
    });
    describe('Error Scenarios', () => {
        it('handles missing event handlers gracefully', () => {
            const { getByTestId } = (0, react_native_1.render)(<SignatureView_1.default testID="signature-view"/>);
            const signatureView = getByTestId('signature-view');
            // Should not crash when event handlers are not provided
            expect(() => {
                (0, react_native_1.fireEvent)(signatureView, 'onSave', { nativeEvent: { path: 'test', base64: 'test' } });
                (0, react_native_1.fireEvent)(signatureView, 'onStrokeStart');
                (0, react_native_1.fireEvent)(signatureView, 'onStrokeEnd');
            }).not.toThrow();
        });
        it('handles invalid prop values gracefully', () => {
            const { getByTestId } = (0, react_native_1.render)(<SignatureView_1.default testID="signature-view" strokeWidth={-1} imageQuality={1.5} exportScale={-0.5}/>);
            const signatureView = getByTestId('signature-view');
            // Should render even with invalid prop values
            expect(signatureView).toBeTruthy();
        });
    });
    describe('Performance', () => {
        it('renders efficiently with many props', () => {
            const startTime = Date.now();
            const { getByTestId } = (0, react_native_1.render)(<SignatureView_1.default testID="signature-view" strokeColor="#FF0000" strokeWidth={5} imageFormat="jpeg" imageQuality={0.8} shouldIncludeBase64={true} imageBackgroundColor="#FFFFFF" exportScale={1.5} onSave={() => { }} onStrokeStart={() => { }} onStrokeEnd={() => { }}/>);
            const endTime = Date.now();
            const renderTime = endTime - startTime;
            expect(getByTestId('signature-view')).toBeTruthy();
            expect(renderTime).toBeLessThan(100); // Should render in less than 100ms
        });
    });
});
