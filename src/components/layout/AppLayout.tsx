import { Box, Drawer, useMediaQuery, useTheme } from '@mui/material'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { colors } from '../../theme'
import { EASE } from '../../theme/motion'
import { shellPalette as S } from '../../theme/pms'
import { rem } from '../../utils/format'
import TopBar from '../common/TopBar'
import AppHeader, { type HeaderPill } from './AppHeader'
import Sidebar, { SIDEBAR_W, SIDEBAR_W_COLLAPSED } from './Sidebar'

const DEFAULT_PILLS: HeaderPill[] = [{ label: '4 Cards', active: true }, { label: '2 + Placeholder' }, { label: '1 + Placeholder' }]

type Props = {
  /** Sidebar item to highlight, e.g. 'dashboard', 'reports' or 'pms/SIP' */
  active: string
  userName: string
  pills?: HeaderPill[]
  /** Changing this (e.g. the route path) scrolls the panel back to the top. */
  scrollKey?: string
  /** Page content: it fills the rounded panel (use `<PageShell embedded>` for a fixed header + scrolling body). */
  children: ReactNode
}

/**
 * App frame shared by every route (rendered once by RootLayout around the router <Outlet/>): sidebar on the left, header on top, content in a white panel with a rounded top-left corner.
 * Phones get the compact TopBar and the sidebar in a drawer.
 */
export default function AppLayout({ active, userName, pills = DEFAULT_PILLS, scrollKey, children }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  useEffect(() => { panelRef.current?.scrollTo({ top: 0 }) }, [scrollKey])
  const theme = useTheme()
  const desktop = useMediaQuery(theme.breakpoints.up('sm'))
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const width = collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W

  const panel = (
    <Box ref={panelRef} data-app-scroll sx={{ flex: 1, minHeight: 0, minWidth: 0, bgcolor: colors.surface.page, overflowX: 'hidden', overflowY: 'auto', border: { sm: `${rem(1)} solid ${S.rule}` }, borderBottom: 'none', borderRight: 'none', borderTopLeftRadius: { sm: rem(40) } }}>
      {children}
    </Box>
  )

  if (!desktop) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: colors.base.white }}>
        <TopBar name={userName} onMenu={() => setDrawerOpen(true)} />
        {panel}
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} slotProps={{ paper: { sx: { width: rem(SIDEBAR_W) } } }}>
          <Sidebar active={active} drawer />
        </Drawer>
      </Box>
    )
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', bgcolor: colors.base.white }}>
      <Box sx={{ width: rem(width), flexShrink: 0, transition: `width .28s ${EASE}`, '@media (prefers-reduced-motion: reduce)': { transition: 'none' } }}>
        <Sidebar active={active} collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <AppHeader pills={pills} userName={userName} />
        {panel}
      </Box>
    </Box>
  )
}
