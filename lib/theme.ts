export type ThemeTokens = {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
    muted: string;
    accent: string;
  };
  fontHeading: string;
  fontBody: string;
  radius: 'none' | 'sm' | 'md' | 'lg' | 'full';
};

export const DEFAULT_THEME: ThemeTokens = {
  colors: {
    primary: '#0f172a',
    secondary: '#64748b',
    background: '#ffffff',
    foreground: '#171717',
    muted: '#f1f5f9',
    accent: '#d4c4a8',
  },
  fontHeading: 'ui-serif, Georgia, serif',
  fontBody: 'ui-sans-serif, system-ui, sans-serif',
  radius: 'md',
};

const RADIUS_MAP: Record<ThemeTokens['radius'], string> = {
  none: '0',
  sm: '0.25rem',
  md: '0.5rem',
  lg: '1rem',
  full: '9999px',
};

export function resolveTheme(raw: unknown): ThemeTokens {
  const partial = (raw ?? {}) as Partial<ThemeTokens>;
  return {
    ...DEFAULT_THEME,
    ...partial,
    colors: { ...DEFAULT_THEME.colors, ...(partial.colors ?? {}) },
  };
}

export function themeToCss(theme: ThemeTokens): string {
  return `:root {
  --theme-color-primary: ${theme.colors.primary};
  --theme-color-secondary: ${theme.colors.secondary};
  --theme-color-background: ${theme.colors.background};
  --theme-color-foreground: ${theme.colors.foreground};
  --theme-color-muted: ${theme.colors.muted};
  --theme-color-accent: ${theme.colors.accent};
  --theme-font-heading: ${theme.fontHeading};
  --theme-font-body: ${theme.fontBody};
  --theme-radius: ${RADIUS_MAP[theme.radius]};

  /* Bridge to Tailwind's global body tokens */
  --background: ${theme.colors.background};
  --foreground: ${theme.colors.foreground};
}`;
}