import { Outlet, useLocation } from 'react-router-dom'
import AppLayout from './AppLayout'

const activeFor = (path: string) => (path.startsWith('/reports') ? 'reports' : 'dashboard')

/** Root route element: sidebar + header stay mounted while the routed page swaps inside the panel. */
export default function RootLayout() {
  const { pathname } = useLocation()
  return (
    <AppLayout active={activeFor(pathname)} userName="Vikram Nair" scrollKey={pathname}>
      <Outlet />
    </AppLayout>
  )
}
