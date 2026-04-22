'use client';

import { useAppState } from '@/hooks/useAppState';
import { calculateMaintenanceStatus } from '@/utils/maintenance';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface GuitarListProps {
  onEditClick: (guitarId: string) => void;
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

export function GuitarList({ onEditClick }: GuitarListProps) {
  const { state } = useAppState();
  const router = useRouter();

  const guitarsWithStatus = state.guitars.map(guitar =>
    calculateMaintenanceStatus(guitar, state.maintenanceLogs)
  );

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);

  const getLastMaintenanceDate = (guitarId: string) => {
    return state.maintenanceLogs
      .filter(log => log.guitarId === guitarId)
      .sort((a, b) => b.maintenanceDate.getTime() - a.maintenanceDate.getTime())[0]?.maintenanceDate;
  };

  if (guitarsWithStatus.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <div style={{
          background: '#ffffff',
          border: '1px solid rgba(0,20,60,0.08)',
          borderRadius: 14,
          padding: '28px 20px',
          maxWidth: 360,
          margin: '0 auto',
        }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#181e2e', marginBottom: 8 }}>No guitars in your collection</p>
          <p style={{ fontSize: 13, color: '#5c6680', marginBottom: 20 }}>Start by adding your first guitar to track maintenance.</p>
          <button
            onClick={() => onEditClick('')}
            style={{
              background: '#4d7cf6',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '9px 16px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Add Your First Guitar
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: card list (same style as Dashboard GuitarRow) */}
      <div className="min-[600px]:hidden" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {guitarsWithStatus.map((guitar) => {
          const colors = STATUS_COLORS[guitar.status];
          const lastDate = getLastMaintenanceDate(guitar.id);
          return (
            <div
              key={guitar.id}
              onClick={() => router.push(`/guitar/${guitar.id}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#ffffff',
                border: '1px solid rgba(0,20,60,0.08)',
                borderRadius: 14,
                padding: '16px 18px',
                gap: 12,
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'background 0.13s, border-color 0.13s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = '#e8ecf2';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,20,60,0.14)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = '#ffffff';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,20,60,0.08)';
              }}
            >
              {/* Left accent bar */}
              <div style={{
                position: 'absolute', left: 0, top: '20%', bottom: '20%',
                width: 2, background: colors.text, borderRadius: '0 2px 2px 0', opacity: 0.4,
              }} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 15, fontWeight: 500, color: '#181e2e' }}>
                    {guitar.maker} {guitar.model}
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, letterSpacing: '0.02em',
                    color: colors.text, background: colors.bg,
                    borderRadius: 99, padding: '2px 8px', whiteSpace: 'nowrap',
                  }}>
                    {STATUS_LABELS[guitar.status]}
                  </span>
                </div>
                {guitar.year && (
                  <p style={{ fontSize: 12, color: '#a0a8bc', margin: 0 }}>{guitar.year}</p>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
                {lastDate ? (
                  <span style={{ fontSize: 12, color: '#a0a8bc' }}>{formatDate(lastDate)}</span>
                ) : (
                  <span style={{ fontSize: 12, color: '#a0a8bc' }}>No history</span>
                )}
              </div>

              <ChevronRight size={16} style={{ color: '#a0a8bc', flexShrink: 0 }} />
            </div>
          );
        })}
      </div>

      {/* Desktop: table */}
      <div className="hidden min-[600px]:block" style={{
        background: '#ffffff',
        border: '1px solid rgba(0,20,60,0.08)',
        borderRadius: 14,
        overflow: 'hidden',
      }}>
        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 130px 140px 32px',
          padding: '10px 16px',
          borderBottom: '1px solid rgba(0,20,60,0.08)',
        }}>
          {['Guitar', 'Last Maintenance', 'Status', ''].map((label) => (
            <span key={label} style={{ fontSize: 10, fontWeight: 600, color: '#a0a8bc', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {label}
            </span>
          ))}
        </div>

        {/* Rows */}
        {guitarsWithStatus.map((guitar, i) => {
          const colors = STATUS_COLORS[guitar.status];
          const lastDate = getLastMaintenanceDate(guitar.id);
          const isLast = i === guitarsWithStatus.length - 1;
          return (
            <div
              key={guitar.id}
              onClick={() => router.push(`/guitar/${guitar.id}`)}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 130px 140px 32px',
                alignItems: 'center',
                padding: '14px 16px',
                borderBottom: isLast ? 'none' : '1px solid rgba(0,20,60,0.06)',
                cursor: 'pointer',
                transition: 'background 0.12s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#e8ecf2'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#181e2e', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {guitar.maker} {guitar.model}
                </p>
                {guitar.year && (
                  <p style={{ fontSize: 12, color: '#a0a8bc', margin: 0 }}>{guitar.year}</p>
                )}
              </div>

              <span style={{ fontSize: 13, color: '#5c6680' }}>
                {lastDate ? formatDate(lastDate) : '—'}
              </span>

              <div>
                <span style={{
                  fontSize: 11, fontWeight: 600, letterSpacing: '0.02em',
                  color: colors.text, background: colors.bg,
                  borderRadius: 99, padding: '3px 9px',
                }}>
                  {STATUS_LABELS[guitar.status]}
                </span>
              </div>

              <ChevronRight size={14} style={{ color: '#a0a8bc' }} />
            </div>
          );
        })}
      </div>
    </>
  );
}
