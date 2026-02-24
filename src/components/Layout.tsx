import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useLanguageStore } from '../stores/useLanguageStore';
import { useEffect } from 'react';

export function Layout() {
  const { isRTL } = useLanguageStore();

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [isRTL]);

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Sidebar />
      <div className="ml-[var(--sidebar-w)]">
        <Header />
        <main className="animate-fade-in pt-[calc(var(--header-h)+24px)] px-6 pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
