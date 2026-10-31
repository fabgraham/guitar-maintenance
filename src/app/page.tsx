'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, ArrowRight } from 'lucide-react';
import { GuitarRow } from '@/components/GuitarRow';
import { GuitarForm } from '@/components/GuitarForm';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { statusStyles } from '@/components/StatusBadge';
import { useAppState } from '@/hooks/useAppState';
import { calculateMaintenanceStatus, getStatusText, isArchived } from '@/utils/maintenance';
import { MaintenanceStatus } from '@/types';

export default function Dashboard() {
  const { state } = useAppState();
  const [filter, setFilter] = useState<'all' | MaintenanceStatus>('all');
  const [showGuitarForm, setShowGuitarForm] = useState(false);

  useEffect(() => {
    const reset = () => setFilter('all');
    window.addEventListener('reset-dashboard', reset);
    return () => window.removeEventListener('reset-dashboard', reset);
  }, []);

  const guitars = state.guitars.filter(guitar => !isArchived(guitar)).map(guitar => calculateMaintenanceStatus(guitar, state.maintenanceLogs));
  const count = (status: MaintenanceStatus) => guitars.filter(guitar => guitar.status === status).length;
  const urgentCount = count('urgent');
  const warningCount = count('warning');
  const statusOrder = { urgent: 0, warning: 1, good: 2 };
  const sortedGuitars = guitars
    .filter(guitar => filter === 'all' || guitar.status === filter)
    .sort((a, b) => statusOrder[a.status] - statusOrder[b.status]
      || Number(Boolean(a.lastMaintenanceDate)) - Number(Boolean(b.lastMaintenanceDate))
      || b.daysSinceMaintenance - a.daysSinceMaintenance
      || `${a.maker} ${a.model}`.localeCompare(`${b.maker} ${b.model}`));

  const summary = guitars.length === 0 ? 'Add your guitars to start tracking their maintenance.'
    : urgentCount > 0 ? `${urgentCount} guitar${urgentCount === 1 ? '' : 's'} need${urgentCount === 1 ? 's' : ''} service${warningCount ? ` and ${warningCount} ${warningCount === 1 ? 'is' : 'are'} due soon` : ''}.`
    : warningCount > 0 ? `${warningCount} guitar${warningCount === 1 ? ' is' : 's are'} due for maintenance soon.`
    : 'Your collection is up to date. Enjoy playing.';

  const emptyTitles = { all: 'No guitars in your collection', urgent: 'No guitars need service', warning: 'No guitars are due soon', good: 'No guitars are marked maintained' };

  return (
    <main className="page-shell">
      <div className="mb-6">
        <p className="section-label mb-2">Overview</p>
        <h1 className="page-title">Dashboard</h1>
        <p className="text-sm text-[#5c6680] mt-2" aria-live="polite">{state.isLoading ? 'Loading your collection…' : summary}</p>
      </div>

      {state.isLoading ? <LoadingSkeleton /> : <>
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-7" aria-label="Filter by maintenance status">
          {(['good', 'warning', 'urgent'] as const).map(status => {
            const colors = statusStyles[status];
            const active = filter === status;
            return (
              <button key={status} className="stat-card rounded-[14px] border text-center transition-colors hover:brightness-95"
                aria-pressed={active} onClick={() => setFilter(previous => previous === status ? 'all' : status)}
                style={{ background: active ? colors.bg : '#ffffff', borderColor: active ? colors.border : 'rgba(0,20,60,0.08)' }}>
                <p className="stat-label font-semibold text-[#5c6680] mb-2">{getStatusText(status)}</p>
                <p className="stat-number font-bold leading-none" style={{ color: colors.text, fontFamily: 'var(--font-space-mono), monospace' }}>{count(status)}</p>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 className="section-label">{filter === 'all' ? 'Service priorities' : getStatusText(filter)} · {sortedGuitars.length}</h2>
          {filter !== 'all' ? <button className="text-sm font-medium text-[#2853bd] min-h-[44px]" onClick={() => setFilter('all')}>Show all guitars</button>
            : <Link href="/inventory" className="inline-flex items-center gap-1 text-sm font-medium text-[#2853bd] min-h-[44px]">View collection <ArrowRight size={14} /></Link>}
        </div>

        {sortedGuitars.length ? (
          <div className="dashboard-grid">{sortedGuitars.map(guitar => <GuitarRow key={guitar.id} guitar={guitar} />)}</div>
        ) : (
          <div className="panel text-center py-10 max-w-lg mx-auto">
            <h3 className="font-semibold mb-2">{emptyTitles[filter]}</h3>
            <p className="text-sm text-[#5c6680] mb-5">{guitars.length ? 'Try another status or view your whole collection.' : 'Add your first guitar to track string changes, setups and repairs.'}</p>
            {guitars.length ? <button className="btn btn-secondary" onClick={() => setFilter('all')}>Show all guitars</button>
              : <button className="btn btn-primary" onClick={() => setShowGuitarForm(true)}><Plus size={16} />Add Guitar</button>}
          </div>
        )}
      </>}
      {showGuitarForm && <GuitarForm onClose={() => setShowGuitarForm(false)} />}
    </main>
  );
}
