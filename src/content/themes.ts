// Theme = overrides for the color tokens defined in globals.css :root.
// Values are "R, G, B" triples so existing rgba(var(--x), a) usages keep their alpha.
// --page-bg is derived from --accent/--green/--purple, so it re-themes automatically.

export type Theme = Record<string, string>;

export const DEFAULT_THEME = "default";

export const THEMES: Record<string, Theme> = {
  default: {
    "--accent": "56, 189, 248",
    "--green": "34, 197, 94",
    "--yellow": "254, 188, 46",
    "--red": "239, 68, 68",
    "--purple": "168, 85, 247",
    "--text": "226, 232, 240",
    "--muted": "148, 163, 184",
    "--surface-1": "14, 20, 28",
    "--surface-2": "7, 9, 12",
  },
  matrix: {
    "--accent": "0, 255, 128",
    "--green": "0, 255, 128",
    "--yellow": "120, 255, 120",
    "--red": "255, 90, 90",
    "--purple": "0, 200, 120",
    "--text": "180, 255, 190",
    "--muted": "80, 170, 100",
    "--surface-1": "5, 18, 8",
    "--surface-2": "2, 8, 4",
  },
  amber: {
    "--accent": "255, 176, 0",
    "--green": "255, 208, 64",
    "--yellow": "255, 224, 130",
    "--red": "255, 110, 60",
    "--purple": "255, 150, 50",
    "--text": "255, 214, 150",
    "--muted": "190, 140, 70",
    "--surface-1": "26, 16, 4",
    "--surface-2": "14, 8, 2",
  },
  dracula: {
    "--accent": "189, 147, 249",
    "--green": "80, 250, 123",
    "--yellow": "241, 250, 140",
    "--red": "255, 85, 85",
    "--purple": "255, 121, 198",
    "--text": "248, 248, 242",
    "--muted": "98, 114, 164",
    "--surface-1": "40, 42, 54",
    "--surface-2": "24, 25, 38",
  },
  nord: {
    "--accent": "136, 192, 208",
    "--green": "163, 190, 140",
    "--yellow": "235, 203, 139",
    "--red": "191, 97, 106",
    "--purple": "180, 142, 173",
    "--text": "236, 239, 244",
    "--muted": "136, 146, 176",
    "--surface-1": "46, 52, 64",
    "--surface-2": "33, 38, 48",
  },
};

export const THEME_NAMES = Object.keys(THEMES);
