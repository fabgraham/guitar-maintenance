'use client';

import Link from 'next/link';
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
    new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);

  return (
    <Link
      href={`/guitar/${guitar.id}`}
      style={{
        display: 'block',
        background: '#ffffff',
        border: '1px solid rgba(0,20,60,0.08)',
        borderRadius: 14,
        padding: '14px 18px 14px 22px',
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
          width: 3,
          background: colors.text,
          borderRadius: '0 2px 2px 0',
          opacity: 0.4,
          transition: 'opacity 0.13s',
        }}
      />

      {/* Line 1: name (left) + badge (right) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 5 }}>
        <span style={{ fontSize: 16, fontWeight: 500, color: '#181e2e' }}>
          {guitar.maker} {guitar.model}
        </span>
        <span style={{
          fontSize: 11, fontWeight: 600, letterSpacing: '0.02em',
          color: colors.text, background: colors.bg,
          borderRadius: 99, padding: '2px 8px', whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          {STATUS_LABELS[guitar.status]}
        </span>
      </div>

      {/* Line 2: days ago · date */}
      <p style={{ fontSize: 12, color: '#a0a8bc', margin: '0 0 3px' }}>
        {guitar.lastMaintenanceDate ? (
          <><span style={{ fontWeight: 600, color: colors.text }}>{guitar.daysSinceMaintenance}d ago</span> · {formatDate(guitar.lastMaintenanceDate)}</>
        ) : (
          'No history'
        )}
      </p>

      {/* Line 3: notes */}
      {(guitar.lastMaintenanceNotes || guitar.year) && (
        <p style={{ fontSize: 12, color: '#a0a8bc', margin: 0 }}>
          {guitar.lastMaintenanceNotes || guitar.year}
        </p>
      )}
    </Link>
  );
}
