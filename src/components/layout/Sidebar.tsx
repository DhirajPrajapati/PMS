import { Box, ButtonBase } from '@mui/material'
import { ChevronDown, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useState } from 'react'
import { colors } from '../../theme'
import { EASE } from '../../theme/motion'
import { shellPalette as S } from '../../theme/pms'
import { rem } from '../../utils/format'
import Collapse from '../common/Collapse'
import BrandLogo from './BrandLogo'
import { NAV_FOOTER_ITEM, NAV_ITEMS, type NavItem } from './navItems'

export const SIDEBAR_W = 265
export const SIDEBAR_W_COLLAPSED = 75
export const HEADER_H = 73
const ITEM_H = 41
const NO_MOTION = { '@media (prefers-reduced-motion: reduce)': { transition: 'none' } } as const

type Props = {
  /** id of the highlighted top-level item or leaf */
  active: string
  collapsed?: boolean
  onToggle?: () => void
  onLogout?: () => void
  /** Drawer mode on phones: no collapse button, always expanded. */
  drawer?: boolean
}

function Row({ item, active, collapsed, open, onClick }: { item: NavItem; active: boolean; collapsed: boolean; open?: boolean; onClick?: () => void }) {
  const Icon = item.icon
  const hasChildren = !!item.children
  return (
    <ButtonBase
      component={item.href ? 'a' : 'button'}
      href={item.href}
      onClick={onClick}
      aria-expanded={hasChildren ? open : undefined}
      aria-current={active ? 'page' : undefined}
      title={collapsed ? item.label : undefined}
      sx={{
        width: '100%', height: rem(ITEM_H), flexShrink: 0, justifyContent: 'flex-start', gap: rem(12.3), pl: rem(13), pr: rem(20), borderRadius: rem(10.6),
        fontFamily: 'inherit', fontSize: rem(14.3), fontWeight: active ? 700 : 600, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden',
        color: active ? S.activeText : S.itemText,
        background: active ? S.activeBg : 'transparent',
        boxShadow: active ? S.activeShadow : 'none',
        transition: `background-color .2s ease`,
        '&:hover': active ? undefined : { bgcolor: S.hoverBg },
        '&:focus-visible': { outline: `${rem(2)} solid ${colors.brand.primary}`, outlineOffset: rem(1) },
        ...NO_MOTION,
      }}
    >
      <Icon size={rem(18.8)} strokeWidth={1.7} style={{ flexShrink: 0 }} />
      <Box component="span" sx={{ flex: 1, opacity: collapsed ? 0 : 1, transition: `opacity .15s ease`, ...NO_MOTION }}>{item.label}</Box>
      {hasChildren && !collapsed && <Box component="span" sx={{ display: 'grid', color: colors.text.muted }}><ChevronDown size={rem(15)} style={{ transform: open ? 'none' : 'rotate(-90deg)', transition: `transform .3s ${EASE}` }} /></Box>}
    </ButtonBase>
  )
}

/** Left navigation: brand + collapse button, grouped links, Design System, Logout. Measured from the reference screen. */
export default function Sidebar({ active, collapsed = false, onToggle, onLogout, drawer = false }: Props) {
  const [open, setOpen] = useState<Record<string, boolean>>({ pms: true, aif: true })
  const isActive = (it: NavItem) => it.id === active || !!it.children?.some((c) => c.id === active)
  const Toggle = collapsed ? PanelLeftOpen : PanelLeftClose

  return (
    <Box component="nav" aria-label="Main" sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', bgcolor: colors.base.white, fontFamily: 'inherit', overflow: 'hidden' }}>
      <Box sx={{ height: rem(HEADER_H), flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', pl: collapsed ? 0 : rem(20), pr: collapsed ? 0 : rem(24) }}>
        {!collapsed && <BrandLogo />}
        {!drawer && (
          <ButtonBase aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={onToggle} sx={{ width: rem(33), height: rem(33), borderRadius: rem(9.4), color: colors.text.ink, '&:hover': { bgcolor: S.hoverBg } }}>
            <Toggle size={rem(20)} strokeWidth={1.7} />
          </ButtonBase>
        )}
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', pt: rem(20.5), px: rem(11.75), display: 'flex', flexDirection: 'column', gap: rem(4.7) }}>
        {NAV_ITEMS.map((item) => (
          <Box key={item.id}>
            <Row item={item} active={isActive(item) && (!item.children || collapsed)} collapsed={collapsed} open={!!open[item.id] && !collapsed} onClick={item.children ? () => !collapsed && setOpen((o) => ({ ...o, [item.id]: !o[item.id] })) : undefined} />
            {item.children && !collapsed && (
              <Collapse open={!!open[item.id]}>
                <Box sx={{ ml: rem(36.4), mt: rem(4), mb: rem(1), borderLeft: `${rem(1)} solid ${S.rule}` }}>
                  {item.children.map((c) => (
                    <ButtonBase
                      key={c.id}
                      component="a"
                      href={c.href}
                      aria-current={c.id === active ? 'page' : undefined}
                      sx={{ width: '100%', height: rem(36.4), justifyContent: 'flex-start', pl: rem(25.3), fontFamily: 'inherit', fontSize: rem(13.3), fontWeight: c.id === active ? 700 : 500, color: c.id === active ? colors.brand.primary : S.subText, '&:hover': { color: colors.text.ink, bgcolor: S.hoverBg }, '&:focus-visible': { outline: `${rem(2)} solid ${colors.brand.primary}` } }}
                    >
                      {c.label}
                    </ButtonBase>
                  ))}
                </Box>
              </Collapse>
            )}
          </Box>
        ))}
        <Box role="separator" sx={{ height: rem(1), bgcolor: S.rule, mx: rem(3.5), my: rem(7), flexShrink: 0 }} />
        <Row item={NAV_FOOTER_ITEM} active={isActive(NAV_FOOTER_ITEM)} collapsed={collapsed} />
      </Box>

      <Box sx={{ height: rem(67), flexShrink: 0, borderTop: `${rem(1)} solid ${S.rule}`, display: 'flex', alignItems: 'center', px: rem(11.75) }}>
        <ButtonBase
          onClick={onLogout}
          title={collapsed ? 'Logout' : undefined}
          sx={{ width: '100%', height: rem(ITEM_H), justifyContent: 'flex-start', gap: rem(14), pl: rem(13.5), borderRadius: rem(10.6), fontFamily: 'inherit', fontSize: rem(14.3), fontWeight: 600, color: S.logout, whiteSpace: 'nowrap', '&:hover': { bgcolor: S.hoverBg } }}
        >
          <LogOut size={rem(18.8)} strokeWidth={1.7} style={{ flexShrink: 0 }} />
          <Box component="span" sx={{ opacity: collapsed ? 0 : 1, transition: `opacity .15s ease`, ...NO_MOTION }}>Logout</Box>
        </ButtonBase>
      </Box>
    </Box>
  )
}
