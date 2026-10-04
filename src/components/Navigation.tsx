'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, List, Settings } from 'lucide-react';
import { useAppState } from '@/hooks/useAppState';
import { cn } from '@/utils/cn';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/inventory', label: 'Collection', icon: List },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Navigation() {
  const pathname = usePathname();
  const { state } = useAppState();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem('sb-collapsed');
      const isCollapsed = stored === 'true';
      setCollapsed(isCollapsed);
      document.body.dataset.sidebar = isCollapsed ? 'collapsed' : 'expanded';
    } catch {}
  }, []);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    document.body.dataset.sidebar = next ? 'collapsed' : 'expanded';
    try {
      localStorage.setItem('sb-collapsed', String(next));
    } catch {}
  };

  const guitarCount = state.guitars.length;

  return (
    <>
      {/* ── Mobile top bar (hidden on desktop ≥ 640px) ── */}
      <header
        className="flex min-[640px]:hidden items-center justify-between fixed top-0 inset-x-0 z-40 px-5"
        style={{
          height: 68,
          background: '#e8ecf2',
          borderBottom: '1px solid rgba(0,20,60,0.10)',
        }}
      >
        {/* Centered icon nav */}
        <nav aria-label="Main navigation" className="flex items-center justify-center gap-2 w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === '/inventory' && pathname.startsWith('/guitar/'));
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  minWidth: 84, height: 56,
                  display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center', justifyContent: 'center',
                  borderRadius: 12,
                  color: isActive ? '#2853bd' : '#5c6680',
                  background: isActive ? 'rgba(77,124,246,0.12)' : 'transparent',
                  transition: 'color 0.15s, background 0.15s',
                }}
              >
                <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
                <span style={{ fontSize: 11, fontWeight: 600 }}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </header>

      {/* ── Desktop sidebar (hidden on mobile < 640px) ── */}
      <aside
        style={{
          width: mounted ? (collapsed ? 56 : 200) : 200,
          transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1)',
        }}
        className="hidden min-[640px]:flex flex-col fixed inset-y-0 left-0 z-40 overflow-hidden"
        aria-label="Sidebar"
      >
        <div className="flex flex-col h-full" style={{ background: '#e8ecf2', borderRight: '1px solid rgba(0,20,60,0.10)' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-3 pt-[26px] pb-4">
            {!collapsed && (
              <Link
                href="/"
                onClick={() => window.dispatchEvent(new Event('reset-dashboard'))}
                className="flex flex-col leading-none select-none hover:opacity-75 transition-opacity"
              >
                <span style={{ fontSize: 14, fontWeight: 700, color: '#181e2e', lineHeight: 1.2 }}>Guitar</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#5c6680', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Maintenance</span>
              </Link>
            )}
            <button
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!collapsed}
              onClick={toggleCollapsed}
              className={cn(
                'flex items-center justify-center rounded-lg transition-colors hover:bg-black/5',
                collapsed ? 'mx-auto' : 'ml-auto'
              )}
              style={{
                width: 36, height: 36, flexShrink: 0,
                border: '1px solid rgba(0,20,60,0.10)',
                background: 'rgba(255,255,255,0.5)',
              }}
            >
              {collapsed ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="3" width="12" height="1.2" rx="0.6" fill="#5c6680" />
                  <rect x="1" y="6.4" width="12" height="1.2" rx="0.6" fill="#5c6680" />
                  <rect x="1" y="9.8" width="12" height="1.2" rx="0.6" fill="#5c6680" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5" stroke="#5c6680" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>

          {/* Nav items */}
          <nav aria-label="Main navigation" className="flex-1 px-2 space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href === '/inventory' && pathname.startsWith('/guitar/'));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex items-center rounded-[9px] transition-colors',
                    collapsed ? 'justify-center min-h-[44px]' : 'gap-3 min-h-[44px]',
                    isActive ? 'text-[#2853bd]' : 'text-[#5c6680] hover:text-[#5c6680]'
                  )}
                  style={{
                    padding: collapsed ? '11px 0' : '9px 12px',
                    background: isActive ? 'rgba(77,124,246,0.12)' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.04)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  <Icon size={18} strokeWidth={1.5} style={{ flexShrink: 0 }} />
                  {!collapsed && (
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div
            className="px-3 py-3.5"
            style={{ borderTop: '1px solid rgba(0,20,60,0.10)', fontSize: 11, color: '#5c6680' }}
          >
            {collapsed ? (
              <span style={{ display: 'flex', justifyContent: 'center' }}>
                <List size={13} strokeWidth={1.5} />
              </span>
            ) : (
              <span>{state.isLoading ? 'Loading collection…' : `${guitarCount} guitar${guitarCount !== 1 ? 's' : ''}`}</span>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
