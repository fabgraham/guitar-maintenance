'use client';
import { GuitarRow } from '@/components/GuitarRow';
import { GuitarForm } from '@/components/GuitarForm';
import { useAppState } from '@/hooks/useAppState';
import { calculateMaintenanceStatus } from '@/utils/maintenance';
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

const STATUS_COLORS = {
  good: { text: '#16a34a', bg: 'rgba(22,163,74,0.10)', border: 'rgba(22,163,74,0.44)' },
  warning: { text: '#c47a00', bg: 'rgba(196,122,0,0.10)', border: 'rgba(196,122,0,0.44)' },
  urgent: { text: '#d42020', bg: 'rgba(212,32,32,0.10)', border: 'rgba(212,32,32,0.44)' },
};

export default function Dashboard() {
  const { state } = useAppState();
  const [sortBy, setSortBy] = useState<'older90' | 'recentlyUpdated' | 'name'>('recentlyUpdated');
  const [filter, setFilter] = useState<'all' | 'urgent' | 'warning' | 'good'>('all');
  const [showGuitarForm, setShowGuitarForm] = useState(false);

  useEffect(() => {
    const reset = () => { setFilter('all'); setSortBy('recentlyUpdated'); };
    window.addEventListener('reset-dashboard', reset);
    return () => window.removeEventListener('reset-dashboard', reset);
  }, []);

  const guitarsWithStatus = state.guitars.map(guitar =>
    calculateMaintenanceStatus(guitar, state.maintenanceLogs)
  );

  const filteredGuitars = guitarsWithStatus.filter(guitar =>
    filter === 'all' ? true : guitar.status === filter
  );

  const sortedGuitars = [...filteredGuitars].sort((a, b) => {
    const aDays = a.lastMaintenanceDate
      ? Math.floor((Date.now() - a.lastMaintenanceDate.getTime()) / (1000 * 60 * 60 * 24))
      : -1;
    const bDays = b.lastMaintenanceDate
      ? Math.floor((Date.now() - b.lastMaintenanceDate.getTime()) / (1000 * 60 * 60 * 24))
      : -1;

    if (sortBy === 'older90') {
      const aNeedsUpdate = aDays > 90 ? 0 : 1;
      const bNeedsUpdate = bDays > 90 ? 0 : 1;
      if (aNeedsUpdate !== bNeedsUpdate) return aNeedsUpdate - bNeedsUpdate;
      if (aDays === -1 && bDays !== -1) return 1;
      if (bDays === -1 && aDays !== -1) return -1;
      return bDays - aDays;
    }

    if (sortBy === 'recentlyUpdated') {
      const aRecent = aDays >= 0 && aDays <= 90 ? 0 : 1;
      const bRecent = bDays >= 0 && bDays <= 90 ? 0 : 1;
      if (aRecent !== bRecent) return aRecent - bRecent;
      if (aDays === -1 && bDays !== -1) return 1;
      if (bDays === -1 && aDays !== -1) return -1;
      return aDays - bDays;
    }

    const aName = `${a.maker} ${a.model}`.toLowerCase();
    const bName = `${b.maker} ${b.model}`.toLowerCase();
    return aName.localeCompare(bName);
  });

  const urgentCount = guitarsWithStatus.filter(g => g.status === 'urgent').length;
  const warningCount = guitarsWithStatus.filter(g => g.status === 'warning').length;
  const goodCount = guitarsWithStatus.filter(g => g.status === 'good').length;

  const statCards = [
    { key: 'good' as const, label: 'Maintained', count: goodCount },
    { key: 'warning' as const, label: 'Due Soon', count: warningCount },
    { key: 'urgent' as const, label: 'Needs Service', count: urgentCount },
  ];

  return (
    <main style={{ padding: 28, minHeight: '100vh' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#181e2e', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          Dashboard
        </h1>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'older90' | 'recentlyUpdated' | 'name')}
          style={{
            background: '#e8ecf2',
            border: '1px solid rgba(0,20,60,0.14)',
            borderRadius: 9,
            padding: '6px 10px',
            fontSize: 13,
            color: '#181e2e',
            cursor: 'pointer',
            outline: 'none',
            marginTop: 4,
          }}
        >
          <option value="recentlyUpdated">Recently updated</option>
          <option value="older90">Older than 90 days</option>
          <option value="name">Name (A–Z)</option>
        </select>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 min-[480px]:grid-cols-3" style={{ gap: 10, marginBottom: 20 }}>
        {statCards.map(({ key, label, count }) => {
          const colors = STATUS_COLORS[key];
          const isActive = filter === key;
          return (
            <button
              key={key}
              onClick={() => setFilter(prev => prev === key ? 'all' : key)}
              style={{
                background: isActive ? colors.bg : '#ffffff',
                border: `1px solid ${isActive ? colors.border : 'rgba(0,20,60,0.08)'}`,
                borderRadius: 14,
                padding: '18px 20px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'background 0.15s, border-color 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = colors.bg;
                  (e.currentTarget as HTMLElement).style.borderColor = colors.border;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = '#ffffff';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,20,60,0.08)';
                }
              }}
            >
              <p style={{ fontSize: 11, fontWeight: 600, color: '#a0a8bc', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 8 }}>
                {label}
              </p>
              <p style={{ fontSize: 38, fontWeight: 700, color: colors.text, fontFamily: 'var(--font-space-mono), monospace', lineHeight: 1 }}>
                {count}
              </p>
            </button>
          );
        })}
      </div>

      {/* Section label row */}
      <div className="flex items-center justify-between mb-3">
        <p style={{ fontSize: 10, fontWeight: 600, color: '#a0a8bc', letterSpacing: '0.10em', textTransform: 'uppercase' }}>
          All guitars · {sortedGuitars.length}
        </p>
        {filter !== 'all' && (
          <button
            onClick={() => setFilter('all')}
            style={{ fontSize: 12, fontWeight: 500, color: '#4d7cf6', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            Show all
          </button>
        )}
      </div>

      {/* Guitar list */}
      {sortedGuitars.length === 0 ? (
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
              onClick={() => setShowGuitarForm(true)}
              style={{
                background: '#4d7cf6',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '9px 16px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Plus size={14} />
              Add Guitar
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sortedGuitars.map((guitar) => (
            <GuitarRow key={guitar.id} guitar={guitar} />
          ))}
        </div>
      )}

      {showGuitarForm && (
        <GuitarForm onClose={() => setShowGuitarForm(false)} />
      )}
    </main>
  );
}
