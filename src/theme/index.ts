import { createTheme } from '@mui/material/styles'
import { tokens } from './designTokens'

export { tokens, WALLET_GRADIENT_STOPS } from './designTokens'

// What the PMS screens read. They live under `tokens.pms` so there is one theme file to maintain.
export const colors = tokens.pms.color
export const gradients = tokens.pms.gradient
export const shadows = tokens.pms.shadow
export const overlays = tokens.pms.overlay
export const fonts = tokens.pms.fontFamily

const c = tokens.color

/** MUI theme built from the design tokens; page baseline uses the PMS values the screens were measured with. */
export const theme = createTheme({
  spacing: tokens.spacing,
  breakpoints: { values: { xs: 0, sm: tokens.breakpoints.sm, md: tokens.breakpoints.md, lg: tokens.breakpoints.lg, xl: tokens.breakpoints.xl } },
  zIndex: { drawer: tokens.zIndex.drawer, modal: tokens.zIndex.modal, snackbar: tokens.zIndex.snackbar },
  palette: {
    primary: { main: c.primary.main, light: c.primary.light, dark: c.primary.dark, contrastText: c.surface.white },
    secondary: { main: c.secondary.main, light: c.secondary.light, dark: c.secondary.dark },
    success: { main: c.success.main, light: c.success.light, dark: c.success.dark },
    error: { main: c.error.main, light: c.error.light, dark: c.error.dark },
    warning: { main: c.warning.main, light: c.warning.light, dark: c.warning.dark },
    info: { main: c.info.main, light: c.info.light, dark: c.info.dark },
    text: { primary: c.neutral.dark, secondary: c.neutral.main },
    background: { default: c.surface.pageBg, paper: c.surface.white },
    divider: c.surface.border200,
  },
  typography: { fontFamily: fonts.base },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        'html, body, #root': { margin: 0, minHeight: '100%' },
        body: { backgroundColor: colors.surface.page, fontFamily: fonts.base, WebkitFontSmoothing: 'antialiased' },
      },
    },
    MuiButtonBase: { styleOverrides: { root: { fontFamily: 'inherit' } } },
  },
})
