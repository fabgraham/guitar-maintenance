'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { GuitarWithStatus } from '@/types';

interface GuitarRowProps {
  guitar: GuitarWithStatus;
}

const STATUS_COLORS = {
  good: { text: '#16a34a', bg: 'rgba(22,163,74,0.10)' },
  warning: { text: '#c47a00', bg: 'rgba(196,122,0,0.10)' },
  urgent: { text: '#d42020', bg: 'rgba(212,32,32,0.10)' },
};

const STATUS_LABELS = {
  good: 'Maintained',
  warning: 'Due Soon',
  urgent: 'Needs Service',
};

export function GuitarRow({ guitar }: GuitarRowProps) {
  const colors = STATUS_COLORS[guitar.status];

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);

  return (
    <Link
      href={`/guitar/${guitar.id}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        background: '#ffffff',
        border: '1px solid rgba(0,20,60,0.08)',
        borderRadius: 14,
        padding: '18px 20px',
        gap: 16,
        textDecoration: 'none',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 0.13s, border-color 0.13s',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = '#e8ecf2';
        el.style.borderColor = 'rgba(0,20,60,0.14)';
        const bar = el.querySelector('[data-accent-bar]') as HTMLElement;
        if (bar) bar.style.opacity = '1';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = '#ffffff';
        el.style.borderColor = 'rgba(0,20,60,0.08)';
        const bar = el.querySelector('[data-accent-bar]') as HTMLElement;
        if (bar) bar.style.opacity = '0.4';
      }}
    >
      {/* Left accent bar */}
      <div
        data-accent-bar
        style={{
          position: 'absolute',
          left: 0,
          top: '20%',
          bottom: '20%',
          width: 2,
          background: colors.text,
          borderRadius: '0 2px 2px 0',
          opacity: 0.4,
          transition: 'opacity 0.13s',
        }}
      />

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 15, fontWeight: 500, color: '#181e2e', display: 'block', marginBottom: 4 }}>
          {guitar.maker} {guitar.model}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.02em',
            color: colors.text,
            background: colors.bg,
            borderRadius: 99,
            padding: '2px 8px',
            whiteSpace: 'nowrap',
          }}>
            {STATUS_LABELS[guitar.status]}
          </span>
          <span style={{ fontSize: 12, color: '#a0a8bc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {guitar.lastMaintenanceNotes || guitar.year || ''}
          </span>
        </div>
      </div>

      {/* Right: date + days ago */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
        {guitar.lastMaintenanceDate ? (
          <>
            <span style={{ fontSize: 12, color: '#a0a8bc' }}>{formatDate(guitar.lastMaintenanceDate)}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: colors.text }}>{guitar.daysSinceMaintenance}d ago</span>
          </>
        ) : (
          <span style={{ fontSize: 12, color: '#a0a8bc' }}>No history</span>
        )}
      </div>

      <ChevronRight size={16} style={{ color: '#a0a8bc', flexShrink: 0 }} />
    </Link>
  );
}
