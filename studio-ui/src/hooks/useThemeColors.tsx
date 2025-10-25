import { useTheme } from "@mui/material";

// Tipo para las variantes de color disponibles
export type ColorVariant = 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'info' 
  | 'purple' 
  | 'pink' 
  | 'orange' 
  | 'teal' 
  | 'indigo' 
  | 'cyan' 
  | 'emerald' 
  | 'rose' 
  | 'amber' 
  | 'lime' 
  | 'violet' 
  | 'slate' 
  | 'subtle' 
  | 'default'
  | 'blue'
  | 'red'
  | 'green'
  | 'surface'
  | 'surfaceSecondary';

// Hook para obtener colores del tema de forma unificada
export const useThemeColors = () => {
  const theme = useTheme();

  const getColor = (variant: ColorVariant) => {
    switch (variant) {
      case 'primary':
        return {
          main: theme.palette.primary.main,
          background: `${theme.palette.primary.main}15`,
          border: `${theme.palette.primary.main}30`,
        };
      case 'secondary':
        return {
          main: theme.palette.secondary.main,
          background: `${theme.palette.secondary.main}15`,
          border: `${theme.palette.secondary.main}30`,
        };
      case 'success':
        return {
          main: theme.palette.success.main,
          background: `${theme.palette.success.main}15`,
          border: `${theme.palette.success.main}30`,
        };
      case 'warning':
        return {
          main: theme.palette.warning.main,
          background: `${theme.palette.warning.main}15`,
          border: `${theme.palette.warning.main}30`,
        };
      case 'error':
        return {
          main: theme.palette.error.main,
          background: `${theme.palette.error.main}15`,
          border: `${theme.palette.error.main}30`,
        };
      case 'info':
        return {
          main: theme.palette.info.main,
          background: `${theme.palette.info.main}15`,
          border: `${theme.palette.info.main}30`,
        };
      default:
        return theme.customColors[variant];
    }
  };

  const getChipColors = (variant: ColorVariant) => {
    const colors = getColor(variant);
    return {
      bg: colors.background,
      color: colors.main,
    };
  };

  const getCardColors = (variant: ColorVariant) => {
    const colors = getColor(variant);
    return {
      bg: colors.background,
      border: colors.border,
      text: colors.main,
    };
  };

  return {
    getColor,
    getChipColors,
    getCardColors,
  };
};
