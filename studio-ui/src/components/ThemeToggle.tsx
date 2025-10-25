import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useThemeContext } from '../context/ThemeProvider';

/**
 * Componente para alternar entre modo claro y oscuro
 */
export const ThemeToggle: React.FC = () => {
  const { mode, toggleMode } = useThemeContext();

  return (
    <Tooltip title={`Cambiar a modo ${mode === 'light' ? 'oscuro' : 'claro'}`}>
      <IconButton
        onClick={toggleMode}
        color="inherit"
        size="small"
        sx={{
          ml: 1,
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.1)',
          },
        }}
      >
        {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;