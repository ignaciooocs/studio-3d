import { useRef, useEffect, useState, useCallback } from 'react';
import { CommandManager } from '../core/commands/CommandManager';
import type { CommandManagerOptions, CommandManagerState } from '../core/commands/CommandManager';
import type { Command } from '../core/commands/Command';

/**
 * React hook for managing command history with undo/redo functionality
 */
export function useCommandManager(options: CommandManagerOptions = {}) {
  const commandManagerRef = useRef<CommandManager | null>(null);
  const [state, setState] = useState<CommandManagerState>({
    canUndo: false,
    canRedo: false,
    undoDescription: null,
    redoDescription: null,
    historyLength: 0,
    currentIndex: -1
  });

  // Initialize CommandManager
  useEffect(() => {
    commandManagerRef.current = new CommandManager(options);
    
    // Set up event listeners
    const unsubscribeHistory = commandManagerRef.current.onHistoryChanged((newState) => {
      setState(newState);
    });

    const unsubscribeError = commandManagerRef.current.onError(({ command, error }) => {
      console.error(`Command error in ${command.description}:`, error);
    });

    // Set initial state
    setState(commandManagerRef.current.getState());

    return () => {
      unsubscribeHistory();
      unsubscribeError();
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts if not in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (event.ctrlKey && !event.shiftKey && event.key === 'z') {
        event.preventDefault();
        undo();
      } else if ((event.ctrlKey && event.shiftKey && event.key === 'Z') || 
                 (event.ctrlKey && event.key === 'y')) {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const executeCommand = useCallback((command: Command) => {
    commandManagerRef.current?.executeCommand(command);
  }, []);

  const undo = useCallback(() => {
    return commandManagerRef.current?.undo() || false;
  }, []);

  const redo = useCallback(() => {
    return commandManagerRef.current?.redo() || false;
  }, []);

  const clear = useCallback(() => {
    commandManagerRef.current?.clear();
  }, []);

  const getHistory = useCallback(() => {
    return commandManagerRef.current?.getHistory() || [];
  }, []);

  const serialize = useCallback(() => {
    return commandManagerRef.current?.serialize();
  }, []);

  return {
    executeCommand,
    undo,
    redo,
    clear,
    getHistory,
    serialize,
    state,
    commandManager: commandManagerRef.current
  };
}

/**
 * Hook specifically for handling keyboard shortcuts
 */
export function useUndoRedoShortcuts(
  undo: () => boolean,
  redo: () => boolean,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts if not in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (event.ctrlKey && !event.shiftKey && event.key === 'z') {
        event.preventDefault();
        undo();
      } else if ((event.ctrlKey && event.shiftKey && event.key === 'Z') || 
                 (event.ctrlKey && event.key === 'y')) {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, enabled]);
}