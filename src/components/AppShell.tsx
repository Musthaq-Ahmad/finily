import { Outlet } from 'react-router-dom';
import { BottomTabBar } from './BottomTabBar';

/** Wraps the top-level tab destinations (Trips, Insights) with the persistent bottom tab bar. */
export function AppShell() {
  return (
    <>
      <Outlet />
      <BottomTabBar />
    </>
  );
}
