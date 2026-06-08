const shared = {
  space: { xs: 6, sm: 10, md: 18, lg: 28, xl: 44, xxl: 72 },
  radii: { control: 12, card: 28, pill: 999 },
  motion: {
    fast: '160ms cubic-bezier(.2, 0, 0, 1)',
    standard: '320ms cubic-bezier(.2, 0, 0, 1)',
  },
} as const

export const lightTheme = {
  colors: {
    background: '#f5f5f7',
    surface: '#ffffff',
    surfaceMuted: '#e8e8ed',
    text: '#1d1d1f',
    textMuted: '#6e6e73',
    border: '#d2d2d7',
    accent: '#0071e3',
    accentText: '#ffffff',
    danger: '#b42318',
  },
  ...shared,
} as const

export const darkTheme = {
  colors: {
    background: '#000000',
    surface: '#1d1d1f',
    surfaceMuted: '#2c2c2e',
    text: '#f5f5f7',
    textMuted: '#a1a1a6',
    border: '#424245',
    accent: '#2997ff',
    accentText: '#ffffff',
    danger: '#ff6961',
  },
  ...shared,
} as const

export const theme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    ink: lightTheme.colors.text,
    muted: lightTheme.colors.textMuted,
    paper: lightTheme.colors.background,
    line: lightTheme.colors.border,
    white: '#ffffff',
  },
} as const

export type AppTheme = typeof lightTheme
