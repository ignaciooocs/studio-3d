/**
 * Base class for all commands in the editor.
 * Implements the Command Pattern for undo/redo functionality.
 */
export abstract class Command {
  public readonly description: string;
  public readonly timestamp: number;
  public readonly id: string;

  constructor(description: string = 'Unknown Command') {
    this.description = description;
    this.timestamp = Date.now();
    this.id = crypto.randomUUID();
  }

  /**
   * Execute the command
   */
  abstract execute(): void;

  /**
   * Undo the command
   */
  abstract undo(): void;

  /**
   * Check if this command can be merged with another command
   * @param otherCommand - The command to check for merge compatibility
   */
  canMerge(_otherCommand: Command): boolean {
    return false;
  }

  /**
   * Merge this command with another command
   * @param otherCommand - The command to merge with
   */
  merge(_otherCommand: Command): void {
    throw new Error('Merge method must be implemented for mergeable commands');
  }

  /**
   * Serialize command for persistence
   */
  serialize(): CommandData {
    return {
      type: this.constructor.name,
      description: this.description,
      timestamp: this.timestamp,
      id: this.id
    };
  }
}

export interface CommandData {
  type: string;
  description: string;
  timestamp: number;
  id: string;
}