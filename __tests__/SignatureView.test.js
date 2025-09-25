"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
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
describe('SignatureView', () => {
    const mockOnSave = jest.fn();
    const mockOnStrokeStart = jest.fn();
    const mockOnStrokeEnd = jest.fn();
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('Rendering', () => {
        it('renders without crashing', () => {
            const { getByTestId } = (0, react_native_1.render)(<SignatureView_1.default testID="signature-view"/>);
            expect(getByTestId('signature-view')).toBeTruthy();
        });
        it('renders with all props', () => {
            const { getByTestId } = (0, react_native_1.render)(<SignatureView_1.default testID="signature-view" strokeColor="#FF0000" strokeWidth={5} imageFormat="jpeg" imageQuality={0.9} shouldIncludeBase64={false} imageBackgroundColor="#FFFFFF" exportScale={1.5} onSave={mockOnSave} onStrokeStart={mockOnStrokeStart} onStrokeEnd={mockOnStrokeEnd}/>);
            expect(getByTestId('signature-view')).toBeTruthy();
        });
        it('renders with minimal props', () => {
            const { getByTestId } = (0, react_native_1.render)(<SignatureView_1.default testID="signature-view"/>);
            expect(getByTestId('signature-view')).toBeTruthy();
        });
    });
    describe('Props', () => {
        it('passes strokeColor prop correctly', () => {
            const { getByTestId } = (0, react_native_1.render)(<SignatureView_1.default testID="signature-view" strokeColor="#00FF00"/>);
            const component = getByTestId('signature-view');
            expect(component.props.strokeColor).toBe('#00FF00');
        });
        it('passes strokeWidth prop correctly', () => {
            const { getByTestId } = (0, react_native_1.render)(<SignatureView_1.default testID="signature-view" strokeWidth={8}/>);
            const component = getByTestId('signature-view');
            expect(component.props.strokeWidth).toBe(8);
        });
        it('passes imageFormat prop correctly', () => {
            const { getByTestId } = (0, react_native_1.render)(<SignatureView_1.default testID="signature-view" imageFormat="jpeg"/>);
            const component = getByTestId('signature-view');
            expect(component.props.imageFormat).toBe('jpeg');
        });
        it('passes imageQuality prop correctly', () => {
            const { getByTestId } = (0, react_native_1.render)(<SignatureView_1.default testID="signature-view" imageQuality={0.7}/>);
            const component = getByTestId('signature-view');
            expect(component.props.imageQuality).toBe(0.7);
        });
        it('passes shouldIncludeBase64 prop correctly', () => {
            const { getByTestId } = (0, react_native_1.render)(<SignatureView_1.default testID="signature-view" shouldIncludeBase64={false}/>);
            const component = getByTestId('signature-view');
            expect(component.props.shouldIncludeBase64).toBe(false);
        });
        it('passes imageBackgroundColor prop correctly', () => {
            const { getByTestId } = (0, react_native_1.render)(<SignatureView_1.default testID="signature-view" imageBackgroundColor="#000000"/>);
            const component = getByTestId('signature-view');
            expect(component.props.imageBackgroundColor).toBe('#000000');
        });
        it('passes exportScale prop correctly', () => {
            const { getByTestId } = (0, react_native_1.render)(<SignatureView_1.default testID="signature-view" exportScale={2.0}/>);
            const component = getByTestId('signature-view');
            expect(component.props.exportScale).toBe(2.0);
        });
    });
    describe('Event Handlers', () => {
        it('calls onSave when save event is triggered', async () => {
            const mockResult = {
                path: '/mock/path/signature.png',
                base64: 'mockBase64String',
            };
            const { getByTestId } = (0, react_native_1.render)(<SignatureView_1.default testID="signature-view" onSave={mockOnSave}/>);
            // Simulate the native onSave event
            const component = getByTestId('signature-view');
            (0, react_native_1.fireEvent)(component, 'onSave', { nativeEvent: mockResult });
            await (0, react_native_1.waitFor)(() => {
                expect(mockOnSave).toHaveBeenCalledWith(mockResult);
            });
        });
        it('calls onStrokeStart when stroke starts', () => {
            const { getByTestId } = (0, react_native_1.render)(<SignatureView_1.default testID="signature-view" onStrokeStart={mockOnStrokeStart}/>);
            const component = getByTestId('signature-view');
            (0, react_native_1.fireEvent)(component, 'onStrokeStart');
            expect(mockOnStrokeStart).toHaveBeenCalled();
        });
        it('calls onStrokeEnd when stroke ends', () => {
            const { getByTestId } = (0, react_native_1.render)(<SignatureView_1.default testID="signature-view" onStrokeEnd={mockOnStrokeEnd}/>);
            const component = getByTestId('signature-view');
            (0, react_native_1.fireEvent)(component, 'onStrokeEnd');
            expect(mockOnStrokeEnd).toHaveBeenCalled();
        });
        it('does not call event handlers when not provided', () => {
            const { getByTestId } = (0, react_native_1.render)(<SignatureView_1.default testID="signature-view"/>);
            const component = getByTestId('signature-view');
            (0, react_native_1.fireEvent)(component, 'onSave', { nativeEvent: { path: 'test', base64: 'test' } });
            (0, react_native_1.fireEvent)(component, 'onStrokeStart');
            (0, react_native_1.fireEvent)(component, 'onStrokeEnd');
            expect(mockOnSave).not.toHaveBeenCalled();
            expect(mockOnStrokeStart).not.toHaveBeenCalled();
            expect(mockOnStrokeEnd).not.toHaveBeenCalled();
        });
    });
    describe('Imperative API', () => {
        it('exposes save method through ref', () => {
            var _a;
            const ref = react_1.default.createRef();
            (0, react_native_1.render)(<SignatureView_1.default ref={ref} testID="signature-view"/>);
            expect(ref.current).toBeTruthy();
            expect(typeof ((_a = ref.current) === null || _a === void 0 ? void 0 : _a.save)).toBe('function');
        });
        it('exposes clear method through ref', () => {
            var _a;
            const ref = react_1.default.createRef();
            (0, react_native_1.render)(<SignatureView_1.default ref={ref} testID="signature-view"/>);
            expect(ref.current).toBeTruthy();
            expect(typeof ((_a = ref.current) === null || _a === void 0 ? void 0 : _a.clear)).toBe('function');
        });
        it('exposes setStrokeColor method through ref', () => {
            var _a;
            const ref = react_1.default.createRef();
            (0, react_native_1.render)(<SignatureView_1.default ref={ref} testID="signature-view"/>);
            expect(ref.current).toBeTruthy();
            expect(typeof ((_a = ref.current) === null || _a === void 0 ? void 0 : _a.setStrokeColor)).toBe('function');
        });
        it('exposes setStrokeWidth method through ref', () => {
            var _a;
            const ref = react_1.default.createRef();
            (0, react_native_1.render)(<SignatureView_1.default ref={ref} testID="signature-view"/>);
            expect(ref.current).toBeTruthy();
            expect(typeof ((_a = ref.current) === null || _a === void 0 ? void 0 : _a.setStrokeWidth)).toBe('function');
        });
    });
    describe('Error Handling', () => {
        it('throws error for invalid color in setStrokeColor', () => {
            const ref = react_1.default.createRef();
            (0, react_native_1.render)(<SignatureView_1.default ref={ref} testID="signature-view"/>);
            expect(() => {
                var _a;
                (_a = ref.current) === null || _a === void 0 ? void 0 : _a.setStrokeColor('invalid-color');
            }).toThrow('Invalid color value provided to SignatureView');
        });
        it('handles null ref gracefully', () => {
            const ref = react_1.default.createRef();
            (0, react_native_1.render)(<SignatureView_1.default ref={ref} testID="signature-view"/>);
            // Should not throw when ref is null
            expect(() => {
                var _a, _b, _c, _d;
                (_a = ref.current) === null || _a === void 0 ? void 0 : _a.save();
                (_b = ref.current) === null || _b === void 0 ? void 0 : _b.clear();
                (_c = ref.current) === null || _c === void 0 ? void 0 : _c.setStrokeColor('#FF0000');
                (_d = ref.current) === null || _d === void 0 ? void 0 : _d.setStrokeWidth(5);
            }).not.toThrow();
        });
    });
    describe('Default Values', () => {
        it('uses default values when props are not provided', () => {
            const { getByTestId } = (0, react_native_1.render)(<SignatureView_1.default testID="signature-view"/>);
            const component = getByTestId('signature-view');
            expect(component.props.strokeColor).toBeUndefined();
            expect(component.props.strokeWidth).toBeUndefined();
            expect(component.props.imageFormat).toBeUndefined();
            expect(component.props.imageQuality).toBeUndefined();
            expect(component.props.shouldIncludeBase64).toBeUndefined();
            expect(component.props.imageBackgroundColor).toBeUndefined();
            expect(component.props.exportScale).toBeUndefined();
        });
    });
});
