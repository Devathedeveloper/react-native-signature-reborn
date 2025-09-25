"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("@testing-library/react-native");
const SignatureView_1 = __importDefault(require("../../src/SignatureView"));
// Mock iOS-specific modules
jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native');
    return {
        ...RN,
        Platform: {
            ...RN.Platform,
            OS: 'ios',
        },
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
describe('SignatureView iOS', () => {
    const mockOnSave = jest.fn();
    const mockOnStrokeStart = jest.fn();
    const mockOnStrokeEnd = jest.fn();
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('iOS-Specific Features', () => {
        it('renders on iOS platform', () => {
            const { getByTestId } = (0, react_native_1.render)(<SignatureView_1.default testID="signature-view"/>);
            expect(getByTestId('signature-view')).toBeTruthy();
        });
        it('handles iOS-specific props', () => {
            const { getByTestId } = (0, react_native_1.render)(<SignatureView_1.default testID="signature-view" strokeColor="#FF0000" strokeWidth={5} imageFormat="png" imageQuality={0.8} shouldIncludeBase64={true} imageBackgroundColor="#FFFFFF" exportScale={1.0}/>);
            const component = getByTestId('signature-view');
            expect(component).toBeTruthy();
        });
    });
    describe('iOS Event Handling', () => {
        it('handles onSave event on iOS', async () => {
            const mockResult = {
                path: '/mock/ios/path/signature.png',
                base64: 'mockBase64String',
            };
            const { getByTestId } = (0, react_native_1.render)(<SignatureView_1.default testID="signature-view" onSave={mockOnSave}/>);
            const component = getByTestId('signature-view');
            (0, react_native_1.fireEvent)(component, 'onSave', { nativeEvent: mockResult });
            await (0, react_native_1.waitFor)(() => {
                expect(mockOnSave).toHaveBeenCalledWith(mockResult);
            });
        });
        it('handles stroke events on iOS', () => {
            const { getByTestId } = (0, react_native_1.render)(<SignatureView_1.default testID="signature-view" onStrokeStart={mockOnStrokeStart} onStrokeEnd={mockOnStrokeEnd}/>);
            const component = getByTestId('signature-view');
            (0, react_native_1.fireEvent)(component, 'onStrokeStart');
            (0, react_native_1.fireEvent)(component, 'onStrokeEnd');
            expect(mockOnStrokeStart).toHaveBeenCalled();
            expect(mockOnStrokeEnd).toHaveBeenCalled();
        });
    });
    describe('iOS Imperative API', () => {
        it('calls native save command on iOS', () => {
            var _a;
            const ref = react_1.default.createRef();
            const { UIManager } = require('react-native');
            (0, react_native_1.render)(<SignatureView_1.default ref={ref} testID="signature-view"/>);
            (_a = ref.current) === null || _a === void 0 ? void 0 : _a.save();
            expect(UIManager.dispatchViewManagerCommand).toHaveBeenCalledWith(1, // node handle
            0, // save command
            []);
        });
        it('calls native clear command on iOS', () => {
            var _a;
            const ref = react_1.default.createRef();
            const { UIManager } = require('react-native');
            (0, react_native_1.render)(<SignatureView_1.default ref={ref} testID="signature-view"/>);
            (_a = ref.current) === null || _a === void 0 ? void 0 : _a.clear();
            expect(UIManager.dispatchViewManagerCommand).toHaveBeenCalledWith(1, // node handle
            1, // clear command
            []);
        });
        it('calls native setStrokeColor command on iOS', () => {
            var _a;
            const ref = react_1.default.createRef();
            const { UIManager, processColor } = require('react-native');
            (0, react_native_1.render)(<SignatureView_1.default ref={ref} testID="signature-view"/>);
            (_a = ref.current) === null || _a === void 0 ? void 0 : _a.setStrokeColor('#FF0000');
            expect(processColor).toHaveBeenCalledWith('#FF0000');
            expect(UIManager.dispatchViewManagerCommand).toHaveBeenCalledWith(1, // node handle
            2, // setStrokeColor command
            ['#FF0000']);
        });
        it('calls native setStrokeWidth command on iOS', () => {
            var _a;
            const ref = react_1.default.createRef();
            const { UIManager } = require('react-native');
            (0, react_native_1.render)(<SignatureView_1.default ref={ref} testID="signature-view"/>);
            (_a = ref.current) === null || _a === void 0 ? void 0 : _a.setStrokeWidth(8);
            expect(UIManager.dispatchViewManagerCommand).toHaveBeenCalledWith(1, // node handle
            3, // setStrokeWidth command
            [8]);
        });
    });
    describe('iOS Error Handling', () => {
        it('handles invalid color gracefully on iOS', () => {
            const ref = react_1.default.createRef();
            (0, react_native_1.render)(<SignatureView_1.default ref={ref} testID="signature-view"/>);
            expect(() => {
                var _a;
                (_a = ref.current) === null || _a === void 0 ? void 0 : _a.setStrokeColor('invalid-color');
            }).toThrow('Invalid color value provided to SignatureView');
        });
        it('handles null ref gracefully on iOS', () => {
            const ref = react_1.default.createRef();
            (0, react_native_1.render)(<SignatureView_1.default ref={ref} testID="signature-view"/>);
            expect(() => {
                var _a, _b, _c, _d;
                (_a = ref.current) === null || _a === void 0 ? void 0 : _a.save();
                (_b = ref.current) === null || _b === void 0 ? void 0 : _b.clear();
                (_c = ref.current) === null || _c === void 0 ? void 0 : _c.setStrokeColor('#FF0000');
                (_d = ref.current) === null || _d === void 0 ? void 0 : _d.setStrokeWidth(5);
            }).not.toThrow();
        });
    });
    describe('iOS Performance', () => {
        it('renders efficiently on iOS', () => {
            const startTime = Date.now();
            const { getByTestId } = (0, react_native_1.render)(<SignatureView_1.default testID="signature-view" strokeColor="#000000" strokeWidth={3} imageFormat="png" imageQuality={0.8} shouldIncludeBase64={true} onSave={() => { }} onStrokeStart={() => { }} onStrokeEnd={() => { }}/>);
            const endTime = Date.now();
            const renderTime = endTime - startTime;
            expect(getByTestId('signature-view')).toBeTruthy();
            expect(renderTime).toBeLessThan(50); // Should render quickly on iOS
        });
    });
});
