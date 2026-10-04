'use client';

import Link from 'next/link';
import { GuitarWithStatus } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';

interface GuitarRowProps {
  guitar: GuitarWithStatus;
}

const STATUS_COLORS = {
  good: { text: '#116b33', bg: 'rgba(22,163,74,0.10)' },
  warning: { text: '#916000', bg: 'rgba(196,122,0,0.10)' },
  urgent: { text: '#b91c1c', bg: 'rgba(212,32,32,0.10)' },
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
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: '#181e2e', minWidth: 0, overflowWrap: 'anywhere' }}>
          {guitar.maker} {guitar.model}
        </span>
        <StatusBadge status={guitar.status} />
      </div>

      {/* Line 2: days ago · date */}
      <p style={{ fontSize: 13, color: '#5c6680', margin: '0 0 6px' }}>
        {guitar.lastMaintenanceDate ? (
          <><span style={{ fontWeight: 600, color: colors.text }}>{guitar.daysSinceMaintenance}d ago</span> · {formatDate(guitar.lastMaintenanceDate)}</>
        ) : (
          'No history'
        )}
      </p>

      {/* Line 3: notes */}
      {(guitar.lastMaintenanceNotes || guitar.year) && (
        <p style={{ fontSize: 14, color: '#5c6680', margin: 0, overflowWrap: 'anywhere' }}>
          {guitar.lastMaintenanceNotes || guitar.year}
        </p>
      )}
    </Link>
  );
}
