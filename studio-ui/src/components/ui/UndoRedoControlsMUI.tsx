import { IconButton, Tooltip, Chip, Box } from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import type { CommandManagerState } from '../../core/commands/CommandManager';

interface UndoRedoControlsProps {
  state: CommandManagerState;
  onUndo: () => void;
  onRedo: () => void;
  compact?: boolean;
  showHistory?: boolean;
}

/**
 * Material-UI based undo/redo controls
 */
export function UndoRedoControls({ 
  state, 
  onUndo, 
  onRedo, 
  compact = false, 
  showHistory = true 
}: UndoRedoControlsProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Tooltip 
        title={state.undoDescription ? `Undo: ${state.undoDescription}` : 'Nothing to undo'}
        placement="bottom"
      >
        <span>
          <IconButton
            onClick={onUndo}
            disabled={!state.canUndo}
            size={compact ? 'small' : 'medium'}
            sx={{
              color: state.canUndo ? 'primary.main' : 'action.disabled',
              '&:hover': {
                backgroundColor: state.canUndo ? 'action.hover' : 'transparent'
              }
            }}
          >
            <UndoIcon />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip 
        title={state.redoDescription ? `Redo: ${state.redoDescription}` : 'Nothing to redo'}
        placement="bottom"
      >
        <span>
          <IconButton
            onClick={onRedo}
            disabled={!state.canRedo}
            size={compact ? 'small' : 'medium'}
            sx={{
              color: state.canRedo ? 'primary.main' : 'action.disabled',
              '&:hover': {
                backgroundColor: state.canRedo ? 'action.hover' : 'transparent'
              }
            }}
          >
            <RedoIcon />
          </IconButton>
        </span>
      </Tooltip>

      {showHistory && state.historyLength > 0 && (
        <Chip
          label={`${state.currentIndex + 1}/${state.historyLength}`}
          variant="outlined"
          size="small"
          sx={{ 
            fontSize: '0.75rem',
            height: 24,
            color: 'text.secondary',
            borderColor: 'divider'
          }}
        />
      )}
    </Box>
  );
}

/**
 * Compact version with just icons and no history counter
 */
export function CompactUndoRedoControls(props: UndoRedoControlsProps) {
  return <UndoRedoControls {...props} compact showHistory={false} />;
}