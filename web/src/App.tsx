import { Navigate, Route, Routes } from 'react-router-dom';
import { BackgroundLayer } from '@/components/shell/BackgroundLayer';
import { FlowLayout } from '@/components/shell/FlowLayout';
import { AppShell } from '@/components/shell/AppShell';
import { WelcomePage } from '@/pages/WelcomePage';
import { HowItWorksPage } from '@/pages/HowItWorksPage';
import { SetupPage } from '@/pages/SetupPage';
import { TriagePage } from '@/pages/TriagePage';
import { ChatPage } from '@/pages/ChatPage';
import { SystemPage } from '@/pages/SystemPage';
import { DemoProvider, useDemo } from '@/state/demo';
import type { ReactNode } from 'react';

function RequireOnboarded({ children }: { children: ReactNode }) {
  const { onboarded } = useDemo();
  return onboarded ? <>{children}</> : <Navigate to="/setup" replace />;
}

function Shell() {
  return (
    <div className="relative min-h-[100dvh]">
      <BackgroundLayer />
      <Routes>
        <Route element={<FlowLayout />}>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/how" element={<HowItWorksPage />} />
          <Route path="/setup" element={<SetupPage />} />
        </Route>
        <Route
          path="/app"
          element={
            <RequireOnboarded>
              <AppShell />
            </RequireOnboarded>
          }
        >
          <Route index element={<TriagePage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="system" element={<SystemPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <DemoProvider>
      <Shell />
    </DemoProvider>
  );
}
