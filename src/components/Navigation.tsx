'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, List, Settings, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/inventory', label: 'Inventory', icon: List },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('sidebar-collapsed');
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
      localStorage.setItem('sidebar-collapsed', String(next));
    } catch {}
  };

  const Sidebar = (
    <aside className={cn(
      'hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 bg-primary-50 border-r border-primary-200',
      collapsed ? 'md:w-16' : 'md:w-64'
    )}>
      <div className="h-16 flex items-center justify-between px-3 border-b border-primary-200">
        <span className={cn('text-lg font-bold text-primary-900 tracking-wide', collapsed && 'hidden')}>Guitar Maintenance</span>
        <button
          aria-label="Toggle sidebar"
          className="p-2 rounded-md text-primary-700 hover:bg-primary-100 transition-colors"
          onClick={toggleCollapsed}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                isActive 
                  ? 'bg-primary-100 text-primary-900 shadow-sm ring-1 ring-primary-200' 
                  : 'text-primary-700 hover:bg-primary-100 hover:text-primary-900'
              )}
            >
              <Icon className={cn('w-5 h-5', collapsed ? '' : 'mr-3', isActive ? 'text-primary-700' : 'text-primary-500 group-hover:text-primary-700')} />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );

  const MobileHeader = (
    <div className="md:hidden fixed inset-x-0 top-0 h-12 bg-white border-b flex items-center justify-between px-3 z-40">
      <button
        aria-label="Open sidebar"
        className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
        onClick={() => setOpen(true)}
      >
        <Menu className="w-5 h-5" />
      </button>
      <span className="text-base font-semibold text-gray-900">Guitar Maintenance</span>
      <div className="w-5 h-5" />
    </div>
  );

  const MobileSheet = open ? (
    <div className="md:hidden fixed inset-0 z-50">
      <div className="absolute inset-0 bg-primary-900/20 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <aside className="relative w-64 h-full bg-primary-50 shadow-2xl">
        <div className="h-12 flex items-center justify-between px-3 border-b border-primary-200">
          <span className="text-base font-bold text-primary-900">Menu</span>
          <button aria-label="Close sidebar" className="p-2 rounded-md text-primary-700 hover:bg-primary-100" onClick={() => setOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="px-2 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'group flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                  isActive 
                    ? 'bg-primary-100 text-primary-900 shadow-sm ring-1 ring-primary-200' 
                    : 'text-primary-700 hover:bg-primary-100 hover:text-primary-900'
                )}
              >
                <Icon className="w-5 h-5 mr-3 text-primary-500 group-hover:text-primary-700" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </div>
  ) : null;

  return (
    <>
      {Sidebar}
      {MobileHeader}
      {MobileSheet}
    </>
  );
}