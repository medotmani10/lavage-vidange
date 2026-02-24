import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/useAuthStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { LanguageSwitcher } from './LanguageSwitcher';
import { LogOut, Bell, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

const pageTitles: Record<string, string> = {
  '/dashboard': 'navigation.dashboard',
  '/queue': 'navigation.queue',
  '/pos': 'navigation.pos',
  '/customers': 'navigation.customers',
  '/vehicles': 'navigation.vehicles',
  '/inventory': 'navigation.inventory',
  '/suppliers': 'navigation.suppliers',
  '/employees': 'navigation.employees',
  '/finance': 'navigation.finance',
  '/reports': 'navigation.reports',
  '/settings': 'navigation.settings',
};

export function Header() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const pageKey = pageTitles[location.pathname] || 'navigation.dashboard';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 right-0 no-print flex items-center justify-between px-6 bg-[rgba(10,25,41,0.85)] saturate-[150%] backdrop-blur-xl border-b border-[var(--border)] z-40 h-[var(--header-h)] left-[var(--sidebar-w)]">
      {/* Left: Page Title */}
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">
            {t(pageKey)}
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {new Date().toLocaleDateString('fr-DZ', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex flex-row items-center gap-2">
        {/* Language */}
        <LanguageSwitcher />

        {/* Notification button */}
        <button className="relative p-2.5 rounded-xl transition-all duration-200 bg-[var(--bg-panel)] border border-[var(--border)] hover:bg-[var(--bg-hover)]">
          <Bell className="w-4 h-4 text-[var(--text-secondary)]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-500 shadow-[var(--shadow-glow-orange)]"></span>
        </button>

        {/* Divider */}
        <div className="w-px h-8 mx-2 bg-[var(--border)]"></div>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br from-primary-500 to-primary-600 shadow-[var(--shadow-glow-orange)]">
            {user?.full_name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-white leading-tight">{user?.full_name}</p>
            <p className="text-xs text-[var(--text-muted)] capitalize mt-0.5">{user?.role}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="ml-2 p-2.5 rounded-xl transition-all duration-200 border border-[var(--border)] hover:bg-danger-500/15"
          title="Déconnexion"
        >
          <LogOut className="w-4 h-4 text-danger-400" />
        </button>
      </div>
    </header>
  );
}
