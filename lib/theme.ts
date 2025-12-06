"use client";

export type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "buck-theme";

export const getTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "dark" || stored === "light") return stored;
  
  // Check system preference
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  
  return "light";
};

export const setTheme = (theme: Theme): void => {
  if (typeof window === "undefined") return;
  
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

export const toggleTheme = (): Theme => {
  const current = getTheme();
  const next = current === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
};

export const initTheme = (): void => {
  const theme = getTheme();
  setTheme(theme);
};
