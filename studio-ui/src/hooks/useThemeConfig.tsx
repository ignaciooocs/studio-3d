import { createTheme } from "@mui/material";
import { useContext, useMemo } from "react";
import { ThemeContext } from "../context/ThemeProvider";

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

export const usethemeConfig = () => {
  const { mode } = useContext(ThemeContext);
  
  const theme = useMemo(
    () => {
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
          // Colores extendidos para componentes auxiliares
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
          // info: {
          //   main: mode === "light" ? "#2563eb" : "#60a5fa",
          //   light: mode === "light" ? "#3b82f6" : "#93c5fd",
          //   dark: mode === "light" ? "#1d4ed8" : "#2563eb",
          //   contrastText: "#ffffff",
          // },
        },
        // Paleta de colores personalizada para componentes auxiliares
        customColors: {
          purple: {
            main: mode === "light" ? "#7c3aed" : "#a855f7",
            background: mode === "light" ? "rgba(147, 51, 234, 0.1)" : "rgba(147, 51, 234, 0.15)",
            border: mode === "light" ? "rgba(147, 51, 234, 0.2)" : "rgba(147, 51, 234, 0.3)",
          },
          pink: {
            main: mode === "light" ? "#db2777" : "#f472b6",
            background: mode === "light" ? "rgba(236, 72, 153, 0.1)" : "rgba(236, 72, 153, 0.15)",
            border: mode === "light" ? "rgba(236, 72, 153, 0.2)" : "rgba(236, 72, 153, 0.3)",
          },
          orange: {
            main: mode === "light" ? "#ea580c" : "#fb923c",
            background: mode === "light" ? "rgba(249, 115, 22, 0.1)" : "rgba(249, 115, 22, 0.15)",
            border: mode === "light" ? "rgba(249, 115, 22, 0.2)" : "rgba(249, 115, 22, 0.3)",
          },
          teal: {
            main: mode === "light" ? "#0d9488" : "#2dd4bf",
            background: mode === "light" ? "rgba(20, 184, 166, 0.1)" : "rgba(20, 184, 166, 0.15)",
            border: mode === "light" ? "rgba(20, 184, 166, 0.2)" : "rgba(20, 184, 166, 0.3)",
          },
          indigo: {
            main: mode === "light" ? "#4f46e5" : "#818cf8",
            background: mode === "light" ? "rgba(99, 102, 241, 0.1)" : "rgba(99, 102, 241, 0.15)",
            border: mode === "light" ? "rgba(99, 102, 241, 0.2)" : "rgba(99, 102, 241, 0.3)",
          },
          cyan: {
            main: mode === "light" ? "#0891b2" : "#22d3ee",
            background: mode === "light" ? "rgba(6, 182, 212, 0.1)" : "rgba(6, 182, 212, 0.15)",
            border: mode === "light" ? "rgba(6, 182, 212, 0.2)" : "rgba(6, 182, 212, 0.3)",
          },
          emerald: {
            main: mode === "light" ? "#059669" : "#34d399",
            background: mode === "light" ? "rgba(16, 185, 129, 0.1)" : "rgba(16, 185, 129, 0.15)",
            border: mode === "light" ? "rgba(16, 185, 129, 0.2)" : "rgba(16, 185, 129, 0.3)",
          },
          rose: {
            main: mode === "light" ? "#e11d48" : "#fb7185",
            background: mode === "light" ? "rgba(244, 63, 94, 0.1)" : "rgba(244, 63, 94, 0.15)",
            border: mode === "light" ? "rgba(244, 63, 94, 0.2)" : "rgba(244, 63, 94, 0.3)",
          },
          amber: {
            main: mode === "light" ? "#d97706" : "#fbbf24",
            background: mode === "light" ? "rgba(245, 158, 11, 0.1)" : "rgba(245, 158, 11, 0.15)",
            border: mode === "light" ? "rgba(245, 158, 11, 0.2)" : "rgba(245, 158, 11, 0.3)",
          },
          lime: {
            main: mode === "light" ? "#65a30d" : "#a3e635",
            background: mode === "light" ? "rgba(132, 204, 22, 0.1)" : "rgba(132, 204, 22, 0.15)",
            border: mode === "light" ? "rgba(132, 204, 22, 0.2)" : "rgba(132, 204, 22, 0.3)",
          },
          violet: {
            main: mode === "light" ? "#7c3aed" : "#a78bfa",
            background: mode === "light" ? "rgba(139, 92, 246, 0.1)" : "rgba(139, 92, 246, 0.15)",
            border: mode === "light" ? "rgba(139, 92, 246, 0.2)" : "rgba(139, 92, 246, 0.3)",
          },
          slate: {
            main: mode === "light" ? "#475569" : "#cbd5e1",
            background: mode === "light" ? "rgba(148, 163, 184, 0.1)" : "rgba(148, 163, 184, 0.15)",
            border: mode === "light" ? "rgba(148, 163, 184, 0.2)" : "rgba(148, 163, 184, 0.3)",
          },
          subtle: {
            main: mode === "light" ? "#6b7280" : "#d1d5db",
            background: mode === "light" ? "rgba(0, 0, 0, 0.02)" : "rgba(255, 255, 255, 0.03)",
            border: mode === "light" ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.1)",
          },
          default: {
            main: mode === "light" ? "#374151" : "#f3f4f6",
            background: mode === "light" ? "rgba(0, 0, 0, 0.03)" : "rgba(255, 255, 255, 0.05)",
            border: mode === "light" ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.1)",
          },
          blue: {
            main: mode === "light" ? "#0066cc" : "#60a5fa",
            background: mode === "light" ? "rgba(0, 102, 204, 0.1)" : "rgba(59, 130, 246, 0.15)",
            border: mode === "light" ? "rgba(0, 102, 204, 0.2)" : "rgba(59, 130, 246, 0.3)",
          },
          red: {
            main: mode === "light" ? "#dc2626" : "#f87171",
            background: mode === "light" ? "rgba(220, 38, 38, 0.1)" : "rgba(220, 38, 38, 0.15)",
            border: mode === "light" ? "rgba(220, 38, 38, 0.2)" : "rgba(220, 38, 38, 0.3)",
          },
          green: {
            main: mode === "light" ? "#16a34a" : "#4ade80",
            background: mode === "light" ? "rgba(22, 163, 74, 0.1)" : "rgba(22, 163, 74, 0.15)",
            border: mode === "light" ? "rgba(22, 163, 74, 0.2)" : "rgba(22, 163, 74, 0.3)",
          },
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
        },
      });
    },
    [mode]
  );

  return theme;
};
