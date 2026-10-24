import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Orbit, Brain, Archive, History, BarChart3, Globe, Sparkles } from 'lucide-react';
import { useI18n } from '../lib/i18n';

interface NavbarProps {
  onQuickInspire?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onQuickInspire }) => {
  const { t, language, toggleLanguage } = useI18n();
  const location = useLocation();

  const navItems = [
    { path: '/', label: t('nav_generator'), icon: Sparkles },
    { path: '/brain', label: t('nav_brain'), icon: Brain, badge: 'AI' },
    { path: '/vault', label: t('nav_vault'), icon: Archive },
    { path: '/sessions', label: t('nav_sessions'), icon: History },
    { path: '/stats', label: t('nav_stats'), icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07090e]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <Link to="/" className="group flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/20 via-black to-amber-950/40 shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-transform duration-300 group-hover:scale-105">
            <Orbit className="h-5 w-5 text-amber-400 group-hover:rotate-45 transition-transform duration-500" />
            <div className="absolute inset-0 rounded-xl bg-amber-400/10 blur-sm -z-10" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-white sm:text-lg">
                {t('app_title')}
              </span>
              <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-500/30">
                AI CORE
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
              {t('app_subtitle')}
            </span>
          </div>
        </Link>

        {/* Navigation items */}
        <nav className="flex items-center gap-0.5 sm:gap-1.5 overflow-x-auto no-scrollbar py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={item.label}
                className={`relative flex items-center gap-1.5 rounded-lg px-2 py-1.5 sm:px-2.5 text-xs sm:text-sm font-medium transition-all duration-200 shrink-0 ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span className="hidden md:inline">{item.label}</span>
                {item.badge && (
                  <span className="hidden lg:inline-block rounded bg-amber-400/20 px-1 py-0.2 text-[9px] font-bold text-amber-300">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Actions: Quick Inspire + Language toggle */}
        <div className="flex items-center gap-2">
          {onQuickInspire && (
            <button
              onClick={onQuickInspire}
              title={language === 'ar' ? 'فكرة عشوائية ملهمة' : 'Quick Inspiration Spark'}
              className="hidden lg:flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-200 transition-all cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>{language === 'ar' ? 'فكرة ملهمة' : 'Inspire Me'}</span>
            </button>
          )}

          <button
            onClick={toggleLanguage}
            aria-label="toggle language"
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-900/60 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:border-amber-500/40 transition-all cursor-pointer"
          >
            <Globe className="h-3.5 w-3.5 text-amber-400" />
            <span>{language === 'ar' ? 'EN' : 'العربية'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
