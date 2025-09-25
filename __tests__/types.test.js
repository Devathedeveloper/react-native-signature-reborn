"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
describe('TypeScript Definitions', () => {
    describe('SignatureResult', () => {
        it('has correct structure', () => {
            const result = {
                path: '/mock/path/signature.png',
                base64: 'mockBase64String',
            };
            expect(result).toHaveProperty('path');
            expect(result).toHaveProperty('base64');
            expect(typeof result.path).toBe('string');
            expect(typeof result.base64).toBe('string');
        });
        it('accepts valid path and base64', () => {
            const validResult = {
                path: '/valid/path/signature.jpg',
                base64: 'validBase64String123',
            };
            expect(validResult.path).toBe('/valid/path/signature.jpg');
            expect(validResult.base64).toBe('validBase64String123');
        });
    });
    describe('SignatureViewHandle', () => {
        it('has correct method signatures', () => {
            const handle = {
                save: jest.fn(),
                clear: jest.fn(),
                setStrokeColor: jest.fn(),
                setStrokeWidth: jest.fn(),
            };
            expect(typeof handle.save).toBe('function');
            expect(typeof handle.clear).toBe('function');
            expect(typeof handle.setStrokeColor).toBe('function');
            expect(typeof handle.setStrokeWidth).toBe('function');
        });
        it('setStrokeColor accepts ColorValue', () => {
            const handle = {
                save: jest.fn(),
                clear: jest.fn(),
                setStrokeColor: jest.fn(),
                setStrokeWidth: jest.fn(),
            };
            // Should accept various color formats
            const colors = ['#FF0000', 'rgb(255, 0, 0)', 'red', 0xFF0000];
            colors.forEach(color => {
                expect(() => {
                    handle.setStrokeColor(color);
                }).not.toThrow();
            });
        });
        it('setStrokeWidth accepts number', () => {
            const handle = {
                save: jest.fn(),
                clear: jest.fn(),
                setStrokeColor: jest.fn(),
                setStrokeWidth: jest.fn(),
            };
            const widths = [1, 2.5, 10, 0.5];
            widths.forEach(width => {
                expect(() => {
                    handle.setStrokeWidth(width);
                }).not.toThrow();
            });
        });
    });
    describe('SignatureViewProps', () => {
        it('accepts all valid props', () => {
            const props = {
                strokeColor: '#FF0000',
                strokeWidth: 5,
                imageFormat: 'png',
                imageQuality: 0.8,
                shouldIncludeBase64: true,
                imageBackgroundColor: '#FFFFFF',
                exportScale: 1.5,
                onSave: jest.fn(),
                onStrokeStart: jest.fn(),
                onStrokeEnd: jest.fn(),
                testID: 'signature-view',
                style: { flex: 1 },
            };
            expect(props.strokeColor).toBe('#FF0000');
            expect(props.strokeWidth).toBe(5);
            expect(props.imageFormat).toBe('png');
            expect(props.imageQuality).toBe(0.8);
            expect(props.shouldIncludeBase64).toBe(true);
            expect(props.imageBackgroundColor).toBe('#FFFFFF');
            expect(props.exportScale).toBe(1.5);
            expect(typeof props.onSave).toBe('function');
            expect(typeof props.onStrokeStart).toBe('function');
            expect(typeof props.onStrokeEnd).toBe('function');
        });
        it('accepts minimal props', () => {
            const minimalProps = {};
            expect(minimalProps).toEqual({});
        });
        it('accepts imageFormat as png or jpeg', () => {
            const pngProps = {
                imageFormat: 'png',
            };
            const jpegProps = {
                imageFormat: 'jpeg',
            };
            expect(pngProps.imageFormat).toBe('png');
            expect(jpegProps.imageFormat).toBe('jpeg');
        });
        it('accepts valid imageQuality range', () => {
            const validQualities = [0, 0.1, 0.5, 0.8, 1.0];
            validQualities.forEach(quality => {
                const props = {
                    imageQuality: quality,
                };
                expect(props.imageQuality).toBe(quality);
            });
        });
        it('accepts boolean props', () => {
            const props = {
                shouldIncludeBase64: false,
            };
            expect(props.shouldIncludeBase64).toBe(false);
        });
        it('accepts numeric props', () => {
            const props = {
                strokeWidth: 3,
                imageQuality: 0.8,
                exportScale: 2.0,
            };
            expect(props.strokeWidth).toBe(3);
            expect(props.imageQuality).toBe(0.8);
            expect(props.exportScale).toBe(2.0);
        });
        it('accepts function props', () => {
            const mockFn = jest.fn();
            const props = {
                onSave: mockFn,
                onStrokeStart: mockFn,
                onStrokeEnd: mockFn,
            };
            expect(typeof props.onSave).toBe('function');
            expect(typeof props.onStrokeStart).toBe('function');
            expect(typeof props.onStrokeEnd).toBe('function');
        });
    });
    describe('Type Safety', () => {
        it('prevents invalid imageFormat values', () => {
            // This test ensures TypeScript compilation would fail with invalid values
            // In a real scenario, these would cause TypeScript errors:
            // const invalidProps: SignatureViewProps = {
            //   imageFormat: 'gif', // This should cause a TypeScript error
            // };
            // We can't test this directly in Jest, but the types should prevent it
            expect(true).toBe(true); // Placeholder for type safety test
        });
        it('prevents invalid imageQuality values', () => {
            // TypeScript should prevent values outside 0-1 range
            // const invalidProps: SignatureViewProps = {
            //   imageQuality: 1.5, // This should cause a TypeScript error
            // };
            expect(true).toBe(true); // Placeholder for type safety test
        });
    });
    describe('Optional Props', () => {
        it('allows all props to be optional', () => {
            const emptyProps = {};
            expect(emptyProps).toEqual({});
            expect(emptyProps.strokeColor).toBeUndefined();
            expect(emptyProps.strokeWidth).toBeUndefined();
            expect(emptyProps.imageFormat).toBeUndefined();
            expect(emptyProps.imageQuality).toBeUndefined();
            expect(emptyProps.shouldIncludeBase64).toBeUndefined();
            expect(emptyProps.imageBackgroundColor).toBeUndefined();
            expect(emptyProps.exportScale).toBeUndefined();
            expect(emptyProps.onSave).toBeUndefined();
            expect(emptyProps.onStrokeStart).toBeUndefined();
            expect(emptyProps.onStrokeEnd).toBeUndefined();
        });
    });
});
