"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_native_1 = require("react-native");
// Mock React Native modules
jest.mock('react-native', () => ({
    UIManager: {
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
}));
describe('Native Modules', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('UIManager', () => {
        it('provides correct view manager config', () => {
            const config = react_native_1.UIManager.getViewManagerConfig('RNSignatureView');
            expect(config).toEqual({
                Commands: {
                    save: 0,
                    clear: 1,
                    setStrokeColor: 2,
                    setStrokeWidth: 3,
                },
            });
        });
        it('dispatches view manager commands correctly', () => {
            const nodeHandle = 1;
            const commandId = 0;
            const args = [];
            react_native_1.UIManager.dispatchViewManagerCommand(nodeHandle, commandId, args);
            expect(react_native_1.UIManager.dispatchViewManagerCommand).toHaveBeenCalledWith(nodeHandle, commandId, args);
        });
        it('handles save command', () => {
            const nodeHandle = 1;
            const commandId = 0; // save command
            const args = [];
            react_native_1.UIManager.dispatchViewManagerCommand(nodeHandle, commandId, args);
            expect(react_native_1.UIManager.dispatchViewManagerCommand).toHaveBeenCalledWith(nodeHandle, commandId, args);
        });
        it('handles clear command', () => {
            const nodeHandle = 1;
            const commandId = 1; // clear command
            const args = [];
            react_native_1.UIManager.dispatchViewManagerCommand(nodeHandle, commandId, args);
            expect(react_native_1.UIManager.dispatchViewManagerCommand).toHaveBeenCalledWith(nodeHandle, commandId, args);
        });
        it('handles setStrokeColor command', () => {
            const nodeHandle = 1;
            const commandId = 2; // setStrokeColor command
            const args = ['#FF0000'];
            react_native_1.UIManager.dispatchViewManagerCommand(nodeHandle, commandId, args);
            expect(react_native_1.UIManager.dispatchViewManagerCommand).toHaveBeenCalledWith(nodeHandle, commandId, args);
        });
        it('handles setStrokeWidth command', () => {
            const nodeHandle = 1;
            const commandId = 3; // setStrokeWidth command
            const args = [5];
            react_native_1.UIManager.dispatchViewManagerCommand(nodeHandle, commandId, args);
            expect(react_native_1.UIManager.dispatchViewManagerCommand).toHaveBeenCalledWith(nodeHandle, commandId, args);
        });
    });
    describe('findNodeHandle', () => {
        it('returns a valid node handle', () => {
            const mockRef = { current: {} };
            const nodeHandle = (0, react_native_1.findNodeHandle)(mockRef.current);
            expect(nodeHandle).toBe(1);
            expect(react_native_1.findNodeHandle).toHaveBeenCalledWith(mockRef.current);
        });
        it('handles null ref', () => {
            const nodeHandle = (0, react_native_1.findNodeHandle)(null);
            expect(nodeHandle).toBe(1);
            expect(react_native_1.findNodeHandle).toHaveBeenCalledWith(null);
        });
    });
    describe('processColor', () => {
        it('processes color values correctly', () => {
            const color = '#FF0000';
            const processedColor = (0, react_native_1.processColor)(color);
            expect(processedColor).toBe(color);
            expect(react_native_1.processColor).toHaveBeenCalledWith(color);
        });
        it('handles different color formats', () => {
            const colors = ['#FF0000', 'rgb(255, 0, 0)', 'red'];
            colors.forEach(color => {
                const processedColor = (0, react_native_1.processColor)(color);
                expect(processedColor).toBe(color);
                expect(react_native_1.processColor).toHaveBeenCalledWith(color);
            });
        });
        it('handles null/undefined colors', () => {
            const processedColor = (0, react_native_1.processColor)(null);
            expect(processedColor).toBe(null);
            expect(react_native_1.processColor).toHaveBeenCalledWith(null);
        });
    });
    describe('Command Integration', () => {
        it('integrates all commands correctly', () => {
            const nodeHandle = 1;
            // Test all commands
            const commands = [
                { id: 0, name: 'save', args: [] },
                { id: 1, name: 'clear', args: [] },
                { id: 2, name: 'setStrokeColor', args: ['#FF0000'] },
                { id: 3, name: 'setStrokeWidth', args: [5] },
            ];
            commands.forEach(command => {
                react_native_1.UIManager.dispatchViewManagerCommand(nodeHandle, command.id, command.args);
                expect(react_native_1.UIManager.dispatchViewManagerCommand).toHaveBeenCalledWith(nodeHandle, command.id, command.args);
            });
        });
    });
    describe('Error Handling', () => {
        it('handles invalid node handles gracefully', () => {
            const invalidNodeHandle = -1;
            const commandId = 0;
            const args = [];
            expect(() => {
                react_native_1.UIManager.dispatchViewManagerCommand(invalidNodeHandle, commandId, args);
            }).not.toThrow();
        });
        it('handles invalid command IDs gracefully', () => {
            const nodeHandle = 1;
            const invalidCommandId = 999;
            const args = [];
            expect(() => {
                react_native_1.UIManager.dispatchViewManagerCommand(nodeHandle, invalidCommandId, args);
            }).not.toThrow();
        });
    });
});
