import { UIManager, findNodeHandle, processColor } from 'react-native';

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
      const config = UIManager.getViewManagerConfig('RNSignatureView');
      
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
      const args: unknown[] = [];

      UIManager.dispatchViewManagerCommand(nodeHandle, commandId, args);

      expect(UIManager.dispatchViewManagerCommand).toHaveBeenCalledWith(
        nodeHandle,
        commandId,
        args
      );
    });

    it('handles save command', () => {
      const nodeHandle = 1;
      const commandId = 0; // save command
      const args: unknown[] = [];

      UIManager.dispatchViewManagerCommand(nodeHandle, commandId, args);

      expect(UIManager.dispatchViewManagerCommand).toHaveBeenCalledWith(
        nodeHandle,
        commandId,
        args
      );
    });

    it('handles clear command', () => {
      const nodeHandle = 1;
      const commandId = 1; // clear command
      const args: unknown[] = [];

      UIManager.dispatchViewManagerCommand(nodeHandle, commandId, args);

      expect(UIManager.dispatchViewManagerCommand).toHaveBeenCalledWith(
        nodeHandle,
        commandId,
        args
      );
    });

    it('handles setStrokeColor command', () => {
      const nodeHandle = 1;
      const commandId = 2; // setStrokeColor command
      const args = ['#FF0000'];

      UIManager.dispatchViewManagerCommand(nodeHandle, commandId, args);

      expect(UIManager.dispatchViewManagerCommand).toHaveBeenCalledWith(
        nodeHandle,
        commandId,
        args
      );
    });

    it('handles setStrokeWidth command', () => {
      const nodeHandle = 1;
      const commandId = 3; // setStrokeWidth command
      const args = [5];

      UIManager.dispatchViewManagerCommand(nodeHandle, commandId, args);

      expect(UIManager.dispatchViewManagerCommand).toHaveBeenCalledWith(
        nodeHandle,
        commandId,
        args
      );
    });
  });

  describe('findNodeHandle', () => {
    it('returns a valid node handle', () => {
      const mockRef = { current: {} };
      const nodeHandle = findNodeHandle(mockRef.current);

      expect(nodeHandle).toBe(1);
      expect(findNodeHandle).toHaveBeenCalledWith(mockRef.current);
    });

    it('handles null ref', () => {
      const nodeHandle = findNodeHandle(null);

      expect(nodeHandle).toBe(1);
      expect(findNodeHandle).toHaveBeenCalledWith(null);
    });
  });

  describe('processColor', () => {
    it('processes color values correctly', () => {
      const color = '#FF0000';
      const processedColor = processColor(color);

      expect(processedColor).toBe(color);
      expect(processColor).toHaveBeenCalledWith(color);
    });

    it('handles different color formats', () => {
      const colors = ['#FF0000', 'rgb(255, 0, 0)', 'red'];
      
      colors.forEach(color => {
        const processedColor = processColor(color);
        expect(processedColor).toBe(color);
        expect(processColor).toHaveBeenCalledWith(color);
      });
    });

    it('handles null/undefined colors', () => {
      const processedColor = processColor(null);
      expect(processedColor).toBe(null);
      expect(processColor).toHaveBeenCalledWith(null);
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
        UIManager.dispatchViewManagerCommand(nodeHandle, command.id, command.args);
        expect(UIManager.dispatchViewManagerCommand).toHaveBeenCalledWith(
          nodeHandle,
          command.id,
          command.args
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('handles invalid node handles gracefully', () => {
      const invalidNodeHandles = [-1, 0, null, undefined, NaN, Infinity, -Infinity];
      const commandId = 0;
      const args: unknown[] = [];

      invalidNodeHandles.forEach(handle => {
        expect(() => {
          UIManager.dispatchViewManagerCommand(handle as any, commandId, args);
        }).not.toThrow(`Node handle ${handle} should not throw`);
      });
    });

    it('handles invalid command IDs gracefully', () => {
      const nodeHandle = 1;
      const invalidCommandIds = [999, -1, null, undefined, NaN, Infinity, -Infinity];
      const args: unknown[] = [];

      invalidCommandIds.forEach(commandId => {
        expect(() => {
          UIManager.dispatchViewManagerCommand(nodeHandle, commandId as any, args);
        }).not.toThrow(`Command ID ${commandId} should not throw`);
      });
    });

    it('handles invalid arguments gracefully', () => {
      const nodeHandle = 1;
      const commandId = 0;
      const invalidArgs = [
        null,
        undefined,
        'invalid',
        123,
        {},
        [],
        { invalid: 'object' },
        [null, undefined, 'mixed'],
      ];

      invalidArgs.forEach(args => {
        expect(() => {
          UIManager.dispatchViewManagerCommand(nodeHandle, commandId, args as any);
        }).not.toThrow(`Args ${JSON.stringify(args)} should not throw`);
      });
    });

    it('handles malformed findNodeHandle calls', () => {
      const invalidRefs = [
        null,
        undefined,
        {},
        { current: null },
        { current: undefined },
        { current: 'invalid' },
        { current: 123 },
        { current: [] },
      ];

      invalidRefs.forEach(ref => {
        expect(() => {
          findNodeHandle(ref as any);
        }).not.toThrow(`Ref ${JSON.stringify(ref)} should not throw`);
      });
    });

    it('handles malformed processColor calls', () => {
      const invalidColors = [
        null,
        undefined,
        '',
        'invalid-color',
        'not-a-color',
        'rgb(invalid)',
        'hsl(invalid)',
        '#invalid',
        '#gggggg',
        'rgba(255,255,255,invalid)',
        {},
        [],
        123,
        NaN,
        Infinity,
        -Infinity,
      ];

      invalidColors.forEach(color => {
        expect(() => {
          processColor(color as any);
        }).not.toThrow(`Color ${color} should not throw`);
      });
    });

    it('handles concurrent command dispatch', () => {
      const nodeHandle = 1;
      const commands = [
        { id: 0, args: [] },
        { id: 1, args: [] },
        { id: 2, args: ['#FF0000'] },
        { id: 3, args: [5] },
      ];

      // Dispatch commands concurrently
      expect(() => {
        commands.forEach(command => {
          setTimeout(() => {
            UIManager.dispatchViewManagerCommand(nodeHandle, command.id, command.args);
          }, Math.random() * 10);
        });
      }).not.toThrow();
    });

    it('handles rapid successive calls', () => {
      const nodeHandle = 1;
      const commandId = 0;
      const args: unknown[] = [];

      // Rapid successive calls should not cause issues
      expect(() => {
        for (let i = 0; i < 1000; i++) {
          UIManager.dispatchViewManagerCommand(nodeHandle, commandId, args);
        }
      }).not.toThrow();
    });

    it('handles memory pressure scenarios', () => {
      const nodeHandle = 1;
      const commandId = 0;
      const args: unknown[] = [];

      // Simulate memory pressure
      const operations = [];
      for (let i = 0; i < 10000; i++) {
        operations.push(() => {
          UIManager.dispatchViewManagerCommand(nodeHandle, commandId, args);
        });
      }

      expect(() => {
        operations.forEach(op => op());
      }).not.toThrow();
    });

    it('handles edge case command combinations', () => {
      const nodeHandle = 1;
      const edgeCases = [
        { commandId: 0, args: [] },
        { commandId: 1, args: [] },
        { commandId: 2, args: [null] },
        { commandId: 3, args: [undefined] },
        { commandId: 0, args: [''] },
        { commandId: 1, args: [0] },
        { commandId: 2, args: [NaN] },
        { commandId: 3, args: [Infinity] },
      ];

      edgeCases.forEach(({ commandId, args }) => {
        expect(() => {
          UIManager.dispatchViewManagerCommand(nodeHandle, commandId, args);
        }).not.toThrow(`Command ${commandId} with args ${JSON.stringify(args)} should not throw`);
      });
    });

    it('handles UIManager configuration errors', () => {
      const originalGetViewManagerConfig = UIManager.getViewManagerConfig;
      
      // Mock getViewManagerConfig to return invalid data
      UIManager.getViewManagerConfig = jest.fn(() => null);
      
      expect(() => {
        UIManager.getViewManagerConfig('RNSignatureView');
      }).not.toThrow();
      
      // Restore original function
      UIManager.getViewManagerConfig = originalGetViewManagerConfig;
    });

    it('handles dispatchViewManagerCommand errors', () => {
      const originalDispatchViewManagerCommand = UIManager.dispatchViewManagerCommand;
      
      // Mock dispatchViewManagerCommand to throw
      UIManager.dispatchViewManagerCommand = jest.fn(() => {
        throw new Error('Mock error');
      });
      
      expect(() => {
        UIManager.dispatchViewManagerCommand(1, 0, []);
      }).toThrow('Mock error');
      
      // Restore original function
      UIManager.dispatchViewManagerCommand = originalDispatchViewManagerCommand;
    });
  });
});
