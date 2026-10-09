import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { CircularNav } from './CircularNav';
import { useDemo } from '@/state/demo';

export function AppShell() {
  const { mode } = useDemo();
  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      <TopBar mode={mode} />
      <main className="flex-1 pb-28">
        <Outlet />
      </main>
      <CircularNav />
    </div>
  );
}