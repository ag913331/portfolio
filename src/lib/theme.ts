import { DEFAULT_THEME, THEMES } from "@/content/themes";

const STORAGE_KEY = "portfolio-theme";

/** Apply a theme by writing its token overrides to :root. Returns false for unknown names. */
export function applyTheme(name: string): boolean {
  const theme = THEMES[name];
  if (!theme) return false;

  const root = document.documentElement;
  for (const [token, value] of Object.entries(theme)) {
    root.style.setProperty(token, value);
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, name);
  } catch {
    // localStorage may be unavailable (private mode); theme still applies for the session.
  }
  return true;
}

export function getStoredTheme(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}
