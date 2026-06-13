"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { ACCENT_COLORS, type AccentColorId } from "@/lib/constants";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  accent: AccentColorId;
  setAccent: (accent: AccentColorId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", isDark);
}

function applyAccent(accent: AccentColorId) {
  const color = ACCENT_COLORS.find((c) => c.id === accent) ?? ACCENT_COLORS[0];
  const root = document.documentElement;
  root.style.setProperty("--primary", color.value);
  root.style.setProperty("--primary-foreground", color.foreground);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "system";
    return (localStorage.getItem("theme") as ThemeMode | null) ?? "system";
  });

  const [accent, setAccentState] = useState<AccentColorId>(() => {
    if (typeof window === "undefined") return "orange";
    return (localStorage.getItem("accent-color") as AccentColorId | null) ?? "orange";
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    applyAccent(accent);
  }, [accent]);

  const setTheme = (next: ThemeMode) => {
    setThemeState(next);
    localStorage.setItem("theme", next);
    applyTheme(next);
  };

  const setAccent = (next: AccentColorId) => {
    setAccentState(next);
    localStorage.setItem("accent-color", next);
    applyAccent(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, accent, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
