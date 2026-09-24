import type { CommandManagerState } from '../../core/commands/CommandManager';

interface UndoRedoControlsProps {
  state: CommandManagerState;
  onUndo: () => void;
  onRedo: () => void;
  className?: string;
}

/**
 * UI controls for undo/redo functionality
 */
export function UndoRedoControls({ state, onUndo, onRedo, className = '' }: UndoRedoControlsProps) {
  return (
    <div className={`flex gap-2 ${className}`}>
      <button
        onClick={onUndo}
        disabled={!state.canUndo}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
          state.canUndo 
            ? 'bg-white hover:bg-gray-50 border-gray-300 text-gray-700 hover:border-gray-400 shadow-sm' 
            : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
        }`}
        title={state.undoDescription ? `Undo: ${state.undoDescription}` : 'Nothing to undo'}
        aria-label={state.undoDescription ? `Undo: ${state.undoDescription}` : 'Undo (disabled)'}
      >
        <UndoIcon />
        <span className="hidden sm:inline text-sm font-medium">Undo</span>
        {state.canUndo && (
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-xs bg-gray-200 rounded border">
            Ctrl+Z
          </kbd>
        )}
      </button>

      <button
        onClick={onRedo}
        disabled={!state.canRedo}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
          state.canRedo 
            ? 'bg-white hover:bg-gray-50 border-gray-300 text-gray-700 hover:border-gray-400 shadow-sm' 
            : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
        }`}
        title={state.redoDescription ? `Redo: ${state.redoDescription}` : 'Nothing to redo'}
        aria-label={state.redoDescription ? `Redo: ${state.redoDescription}` : 'Redo (disabled)'}
      >
        <RedoIcon />
        <span className="hidden sm:inline text-sm font-medium">Redo</span>
        {state.canRedo && (
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-xs bg-gray-200 rounded border">
            Ctrl+Y
          </kbd>
        )}
      </button>

      {state.historyLength > 0 && (
        <div className="flex items-center text-sm text-gray-500 ml-2 px-2">
          <span className="hidden md:inline">
            {state.currentIndex + 1} / {state.historyLength}
          </span>
          <span className="md:hidden">
            {state.currentIndex + 1}/{state.historyLength}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Compact version with just icons
 */
export function CompactUndoRedoControls({ state, onUndo, onRedo, className = '' }: UndoRedoControlsProps) {
  return (
    <div className={`flex gap-1 ${className}`}>
      <button
        onClick={onUndo}
        disabled={!state.canUndo}
        className={`p-2 rounded transition-all duration-200 ${
          state.canUndo 
            ? 'hover:bg-gray-100 text-gray-700' 
            : 'text-gray-400 cursor-not-allowed'
        }`}
        title={state.undoDescription ? `Undo: ${state.undoDescription}` : 'Nothing to undo'}
      >
        <UndoIcon size={18} />
      </button>

      <button
        onClick={onRedo}
        disabled={!state.canRedo}
        className={`p-2 rounded transition-all duration-200 ${
          state.canRedo 
            ? 'hover:bg-gray-100 text-gray-700' 
            : 'text-gray-400 cursor-not-allowed'
        }`}
        title={state.redoDescription ? `Redo: ${state.redoDescription}` : 'Nothing to redo'}
      >
        <RedoIcon size={18} />
      </button>
    </div>
  );
}

/**
 * History viewer component
 */
interface HistoryViewerProps {
  history: any[];
  currentIndex: number;
  onJumpTo?: (index: number) => void;
  className?: string;
}

export function HistoryViewer({ history, currentIndex, onJumpTo, className = '' }: HistoryViewerProps) {
  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      <div className="p-3 border-b">
        <h3 className="text-sm font-medium text-gray-900">Command History</h3>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {history.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No commands executed yet
          </div>
        ) : (
          <ul className="py-1">
            {history.map((command, index) => (
              <li key={command.id} className="px-3 py-2 hover:bg-gray-50">
                <button
                  onClick={() => onJumpTo?.(index)}
                  className={`w-full text-left text-sm ${
                    index <= currentIndex 
                      ? 'text-gray-900 font-medium' 
                      : 'text-gray-400'
                  }`}
                  disabled={!onJumpTo}
                >
                  <span className="text-xs text-gray-500 mr-2">
                    {index + 1}.
                  </span>
                  {command.description}
                  {index === currentIndex && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                      Current
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// Icon components
function UndoIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </svg>
  );
}

function RedoIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M21 7v6h-6" />
      <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
    </svg>
  );
}