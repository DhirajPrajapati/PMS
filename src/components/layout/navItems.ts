import { Briefcase, FileBarChart, History, Landmark, LayoutDashboard, Palette, User, type LucideIcon } from 'lucide-react'

export type NavLeaf = { id: string; label: string; href: string }
export type NavItem = { id: string; label: string; icon: LucideIcon; href?: string; children?: NavLeaf[] }

const leaf = (group: string, label: string): NavLeaf => ({ id: `${group}/${label}`, label, href: '#/' })

/** Sidebar structure. `href` is a hash route; items without a built page point at the dashboard. */
export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '#/' },
  { id: 'pms', label: 'PMS', icon: Briefcase, children: ['Additional Purchase', 'SIP', 'STP', 'Switch', 'Redemption', 'Explore Strategies'].map((l) => leaf('pms', l)) },
  { id: 'aif', label: 'AIF', icon: Landmark, children: ['Top-Up', 'Drawdown', 'Redemption', 'Explore Strategies'].map((l) => leaf('aif', l)) },
  { id: 'profile', label: 'My Profile', icon: User, href: '#/' },
  { id: 'reports', label: 'Reports', icon: FileBarChart, href: '#/reports' },
  { id: 'history', label: 'Transaction History', icon: History, href: '#/' },
]

export const NAV_FOOTER_ITEM: NavItem = { id: 'design', label: 'Design System', icon: Palette, href: '#/' }
