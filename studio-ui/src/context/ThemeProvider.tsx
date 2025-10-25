import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// Extender la interfaz del tema para incluir colores personalizados
declare module "@mui/material/styles" {
  interface Theme {
    customColors: {
      purple: ColorSet;
      pink: ColorSet;
      orange: ColorSet;
      teal: ColorSet;
      indigo: ColorSet;
      cyan: ColorSet;
      emerald: ColorSet;
      rose: ColorSet;
      amber: ColorSet;
      lime: ColorSet;
      violet: ColorSet;
      slate: ColorSet;
      subtle: ColorSet;
      default: ColorSet;
      blue: ColorSet;
      red: ColorSet;
      green: ColorSet;
      surface: ColorSet;
      surfaceSecondary: ColorSet;
    };
  }

  interface ThemeOptions {
    customColors?: {
      purple?: ColorSet;
      pink?: ColorSet;
      orange?: ColorSet;
      teal?: ColorSet;
      indigo?: ColorSet;
      cyan?: ColorSet;
      emerald?: ColorSet;
      rose?: ColorSet;
      amber?: ColorSet;
      lime?: ColorSet;
      violet?: ColorSet;
      slate?: ColorSet;
      subtle?: ColorSet;
      default?: ColorSet;
      blue?: ColorSet;
      red?: ColorSet;
      green?: ColorSet;
      surface?: ColorSet;
      surfaceSecondary?: ColorSet;
    };
  }

  interface ColorSet {
    main: string;
    background: string;
    border: string;
  }
}

// Tipos para el contexto del tema
interface ThemeContextType {
  mode: 'light' | 'dark';
  toggleMode: () => void;
  setMode: (mode: 'light' | 'dark') => void;
}

// Crear el contexto
export const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleMode: () => {},
  setMode: () => {},
});

// Hook personalizado para usar el contexto del tema
export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

// Props del Provider
interface ThemeProviderProps {
  children: ReactNode;
}

// Provider principal que combina el contexto del tema con MUI ThemeProvider
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Estado para el modo del tema (light/dark)
  const [mode, setModeState] = useState<'light' | 'dark'>(() => {
    // Intentar obtener el modo guardado del localStorage
    const savedMode = localStorage.getItem('theme-mode');
    if (savedMode === 'light' || savedMode === 'dark') {
      return savedMode;
    }
    
    // Si no hay modo guardado, usar la preferencia del sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  });

  // Función para alternar entre light y dark mode
  const toggleMode = () => {
    setModeState(prevMode => prevMode === 'light' ? 'dark' : 'light');
  };

  // Función para establecer un modo específico
  const setMode = (newMode: 'light' | 'dark') => {
    setModeState(newMode);
  };

  // Guardar el modo en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
  }, [mode]);

  // Escuchar cambios en la preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Solo cambiar automáticamente si no hay preferencia guardada
      const savedMode = localStorage.getItem('theme-mode');
      if (!savedMode) {
        setModeState(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Crear el tema directamente aquí en lugar de usar el hook
  const theme = useMemo(() => {
    return createTheme({
      typography: {
        fontFamily: "'Roboto', sans-serif",
        h1: { fontSize: "3rem", fontWeight: 700 },
        h2: { fontSize: "2.25rem", fontWeight: 700 },
        h3: { fontSize: "1.75rem", fontWeight: 700 },
        h4: { fontSize: "1.5rem", fontWeight: 600 },
        h5: { fontSize: "1.25rem", fontWeight: 600 },
        h6: { fontSize: "1.125rem", fontWeight: 600 },
        subtitle1: { fontSize: "1rem", fontWeight: 500 },
        subtitle2: { fontSize: "0.875rem", fontWeight: 500 },
        body1: { fontSize: "1rem", fontWeight: 400 },
        body2: { fontSize: "0.875rem", fontWeight: 400 },
        caption: { fontSize: "0.75rem", fontWeight: 400 },
        button: {
          fontSize: "0.875rem",
          fontWeight: 600,
          textTransform: "none",
        },
      },
      palette: {
        mode,
        primary: {
          dark: "#2A9CC2",
          main: "#47B7DF",
          light: "#B9E6F8",
          contrastText: "#ffffff",
        },
        secondary: {
          dark: "#012957",
          main: "#023686",
          light: "#ADC9F0",
        },
        background: {
          default: mode === "light" ? "#fafafa" : "#1f1f1f",
          paper: mode === "light" ? "#fafafa" : "#1f1f1f",
        },
        text: {
          primary: mode === "light" ? "#121212" : "#f5f5f5",
          secondary: mode === "light" ? "#121212" : "#f5f5f5",
        },
        success: {
          main: mode === "light" ? "#059669" : "#4ade80",
          light: mode === "light" ? "#10b981" : "#34d399",
          dark: mode === "light" ? "#047857" : "#059669",
          contrastText: "#ffffff",
        },
        warning: {
          main: mode === "light" ? "#d97706" : "#fbbf24",
          light: mode === "light" ? "#f59e0b" : "#fcd34d",
          dark: mode === "light" ? "#b45309" : "#d97706",
          contrastText: "#ffffff",
        },
        error: {
          main: mode === "light" ? "#dc2626" : "#f87171",
          light: mode === "light" ? "#ef4444" : "#fca5a5",
          dark: mode === "light" ? "#b91c1c" : "#dc2626",
          contrastText: "#ffffff",
        },
      },
      customColors: {
        surface: {
          main: mode === "light" ? "#ffffff" : "#1f1f1f",
          background: mode === "light" ? "#ffffff" : "#1f1f1f",
          border: mode === "light" ? "rgba(0, 0, 0, 0.12)" : "rgba(255, 255, 255, 0.12)",
        },
        surfaceSecondary: {
          main: mode === "light" ? "#f8f9fa" : "#2a2a2a",
          background: mode === "light" ? "#f8f9fa" : "#2a2a2a",
          border: mode === "light" ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.08)",
        },
        // ... otros colores personalizados se pueden agregar aquí
      },
    });
  }, [mode]);

  // Valor del contexto
  const contextValue: ThemeContextType = {
    mode,
    toggleMode,
    setMode,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        {/* CssBaseline normaliza el CSS y aplica estilos base del tema */}
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;