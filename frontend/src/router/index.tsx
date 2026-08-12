/* This module wires the router and exports the `router` instance, which is a
   non-component export — expected for a route-tree module, so opt out of the
   Fast Refresh "components-only" lint rule here. */
/* eslint-disable react-refresh/only-export-components */
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from '@tanstack/react-router'
import MainNav from '@/components/MainNav'
import { useThemeEffect } from '@/hooks/useThemeEffect'
import Home from '@/routes/Home'
import Login from '@/routes/Login'
import History from '@/routes/History'

/** App shell: nav + the active route. Also syncs the theme class to <html>. */
function RootLayout() {
  useThemeEffect()
  return (
    <div className="min-h-screen bg-canvas text-content">
      <MainNav />
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}

const rootRoute = createRootRoute({ component: RootLayout })

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
})

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history',
  component: History,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  historyRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
