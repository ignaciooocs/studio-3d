import { Command } from './Command';

export interface CommandManagerOptions {
  maxHistorySize?: number;
  mergeTimeout?: number;
}

export interface CommandManagerState {
  canUndo: boolean;
  canRedo: boolean;
  undoDescription: string | null;
  redoDescription: string | null;
  historyLength: number;
  currentIndex: number;
}

export type CommandManagerListener = (state: CommandManagerState) => void;
export type CommandListener = (command: Command) => void;
export type ErrorListener = (data: { command: Command; error: Error }) => void;

/**
 * Manages command history for undo/redo functionality
 */
export class CommandManager {
  private history: Command[] = [];
  private currentIndex: number = -1;
  private maxHistorySize: number;
  private mergeTimeout: number;
  private lastExecuteTime: number = 0;
  
  // Event listeners
  private historyChangedListeners: CommandManagerListener[] = [];
  private commandExecutedListeners: CommandListener[] = [];
  private commandUndoneListeners: CommandListener[] = [];
  private commandRedoneListeners: CommandListener[] = [];
  private errorListeners: ErrorListener[] = [];

  constructor(options: CommandManagerOptions = {}) {
    this.maxHistorySize = options.maxHistorySize || 50;
    this.mergeTimeout = options.mergeTimeout || 1000; // 1 second
  }

  /**
   * Add event listeners
   */
  onHistoryChanged(listener: CommandManagerListener): () => void {
    this.historyChangedListeners.push(listener);
    return () => {
      const index = this.historyChangedListeners.indexOf(listener);
      if (index > -1) this.historyChangedListeners.splice(index, 1);
    };
  }

  onCommandExecuted(listener: CommandListener): () => void {
    this.commandExecutedListeners.push(listener);
    return () => {
      const index = this.commandExecutedListeners.indexOf(listener);
      if (index > -1) this.commandExecutedListeners.splice(index, 1);
    };
  }

  onCommandUndone(listener: CommandListener): () => void {
    this.commandUndoneListeners.push(listener);
    return () => {
      const index = this.commandUndoneListeners.indexOf(listener);
      if (index > -1) this.commandUndoneListeners.splice(index, 1);
    };
  }

  onCommandRedone(listener: CommandListener): () => void {
    this.commandRedoneListeners.push(listener);
    return () => {
      const index = this.commandRedoneListeners.indexOf(listener);
      if (index > -1) this.commandRedoneListeners.splice(index, 1);
    };
  }

  onError(listener: ErrorListener): () => void {
    this.errorListeners.push(listener);
    return () => {
      const index = this.errorListeners.indexOf(listener);
      if (index > -1) this.errorListeners.splice(index, 1);
    };
  }

  /**
   * Emit events to listeners
   */
  private emitHistoryChanged(): void {
    const state = this.getState();
    this.historyChangedListeners.forEach(listener => listener(state));
  }

  private emitCommandExecuted(command: Command): void {
    this.commandExecutedListeners.forEach(listener => listener(command));
  }

  private emitCommandUndone(command: Command): void {
    this.commandUndoneListeners.forEach(listener => listener(command));
  }

  private emitCommandRedone(command: Command): void {
    this.commandRedoneListeners.forEach(listener => listener(command));
  }

  private emitError(command: Command, error: Error): void {
    this.errorListeners.forEach(listener => listener({ command, error }));
  }

  /**
   * Execute a command and add it to history
   */
  executeCommand(command: Command): void {
    try {
      // Try to merge with the last command if possible
      if (this.canMergeWithLast(command)) {
        const lastCommand = this.history[this.currentIndex];
        lastCommand.merge(command);
        this.emitHistoryChanged();
        return;
      }

      // Execute the command
      command.execute();

      // Clear future commands if we're in the middle of history
      this.history = this.history.slice(0, this.currentIndex + 1);

      // Add new command
      this.history.push(command);
      this.currentIndex++;

      // Limit history size
      if (this.history.length > this.maxHistorySize) {
        this.history.shift();
        this.currentIndex--;
      }

      this.lastExecuteTime = Date.now();
      this.emitHistoryChanged();
      this.emitCommandExecuted(command);

    } catch (error) {
      console.error('Error executing command:', error);
      this.emitError(command, error as Error);
    }
  }

  /**
   * Undo the last command
   */
  undo(): boolean {
    if (!this.canUndo()) return false;

    try {
      const command = this.history[this.currentIndex];
      command.undo();
      this.currentIndex--;
      
      this.emitHistoryChanged();
      this.emitCommandUndone(command);
      return true;
    } catch (error) {
      console.error('Error undoing command:', error);
      this.emitError(this.history[this.currentIndex], error as Error);
      return false;
    }
  }

  /**
   * Redo the next command
   */
  redo(): boolean {
    if (!this.canRedo()) return false;

    try {
      this.currentIndex++;
      const command = this.history[this.currentIndex];
      command.execute();
      
      this.emitHistoryChanged();
      this.emitCommandRedone(command);
      return true;
    } catch (error) {
      console.error('Error redoing command:', error);
      this.currentIndex--; // Revert index
      this.emitError(this.history[this.currentIndex + 1], error as Error);
      return false;
    }
  }

  /**
   * Check if undo is possible
   */
  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  /**
   * Check if redo is possible
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Check if a command can be merged with the last command
   */
  private canMergeWithLast(command: Command): boolean {
    if (this.currentIndex < 0) return false;
    
    const lastCommand = this.history[this.currentIndex];
    const timeDiff = Date.now() - this.lastExecuteTime;
    
    return timeDiff < this.mergeTimeout && lastCommand.canMerge(command);
  }

  /**
   * Get current state for UI updates
   */
  getState(): CommandManagerState {
    return {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      undoDescription: this.canUndo() ? this.history[this.currentIndex].description : null,
      redoDescription: this.canRedo() ? this.history[this.currentIndex + 1].description : null,
      historyLength: this.history.length,
      currentIndex: this.currentIndex
    };
  }

  /**
   * Clear all command history
   */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
    this.emitHistoryChanged();
  }

  /**
   * Get command history for debugging
   */
  getHistory(): Command[] {
    return [...this.history];
  }

  /**
   * Serialize command history
   */
  serialize(): { history: any[]; currentIndex: number } {
    return {
      history: this.history.map(cmd => cmd.serialize()),
      currentIndex: this.currentIndex
    };
  }
}