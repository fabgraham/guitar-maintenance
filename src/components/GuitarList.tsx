'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useAppState } from '@/hooks/useAppState';
import { calculateMaintenanceStatus, isArchived } from '@/utils/maintenance';
import { StatusBadge } from '@/components/StatusBadge';
import { GuitarRow } from '@/components/GuitarRow';
import { ArchivedGuitarList } from '@/components/ArchivedGuitarList';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

interface GuitarListProps { onEditClick: (guitarId: string) => void; }
const statusOrder = { urgent: 0, warning: 1, good: 2 };

export function GuitarList({ onEditClick }: GuitarListProps) {
  const { state } = useAppState();
  const router = useRouter();
  const showArchive = useSearchParams().get('view') === 'archive';
  const [sortBy, setSortBy] = useState<'name-asc' | 'status'>('name-asc');
  const archivedGuitars = useMemo(() => state.guitars.filter(isArchived)
    .sort((a, b) => b.soldDate!.localeCompare(a.soldDate!)), [state.guitars]);
  const guitars = useMemo(() => state.guitars
    .filter(guitar => !isArchived(guitar))
    .map(guitar => calculateMaintenanceStatus(guitar, state.maintenanceLogs))
    .sort((a, b) => (sortBy === 'status' ? statusOrder[a.status] - statusOrder[b.status] : 0)
      || `${a.maker} ${a.model}`.localeCompare(`${b.maker} ${b.model}`)), [state.guitars, state.maintenanceLogs, sortBy]);
  const formatDate = (date: Date) => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);

  if (state.isLoading) return <LoadingSkeleton />;
  if (!state.guitars.length) return (
    <div className="panel text-center py-10 max-w-lg mx-auto">
      <h2 className="font-semibold mb-2">No guitars in your collection</h2>
      <p className="text-sm text-[#5c6680] mb-5">Start by adding your first guitar to track maintenance.</p>
      <button className="btn btn-primary" onClick={() => onEditClick('')}>Add Your First Guitar</button>
    </div>
  );

  const views = [
    { label: 'Current', count: guitars.length, active: !showArchive, href: '/inventory' },
    { label: 'Archive', count: archivedGuitars.length, active: showArchive, href: '/inventory?view=archive' },
  ];

  return (
    <>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <div className="inline-flex rounded-[10px] border bg-white p-1 gap-1" role="group" aria-label="Show guitars">
          {views.map(view => (
            <button key={view.label} aria-pressed={view.active} onClick={() => router.replace(view.href, { scroll: false })}
              className={`min-h-[36px] rounded-lg px-3 text-sm font-semibold transition-colors ${view.active ? 'bg-[#2853bd] text-white' : 'text-[#5c6680] hover:bg-surface-2'}`}>
              {view.label} ({view.count})
            </button>
          ))}
        </div>
        {!showArchive && <div className="relative inline-flex items-center gap-2">
          <label htmlFor="guitar-sort" className="text-sm text-[#5c6680]">Sort by</label>
          <select id="guitar-sort" value={sortBy} onChange={event => setSortBy(event.target.value as typeof sortBy)}
            className="appearance-none rounded-[10px] border bg-white py-2.5 pl-3 pr-8 text-sm min-h-[44px]">
            <option value="name-asc">Name (A–Z)</option><option value="status">Status</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 pointer-events-none text-[#5c6680]" />
        </div>}
      </div>
      {showArchive ? <ArchivedGuitarList guitars={archivedGuitars} /> : !guitars.length ? (
        <div className="panel text-center py-10 max-w-lg mx-auto">
          <h2 className="font-semibold mb-2">No current guitars</h2>
          <p className="text-sm text-[#5c6680]">All your guitars are in the archive.</p>
        </div>
      ) : <>
      <div className="flex min-[1000px]:hidden flex-col gap-2">
        {guitars.map(guitar => <GuitarRow key={guitar.id} guitar={guitar} />)}
      </div>
      <div className="hidden min-[1000px]:block rounded-[14px] border bg-white overflow-hidden">
        <div className="grid grid-cols-[minmax(0,1fr)_170px_140px_24px] gap-4 px-5 py-3 border-b section-label">
          <span>Guitar</span><span>Last maintained</span><span>Status</span><span className="sr-only">Details</span>
        </div>
        {guitars.map(guitar => (
          <Link key={guitar.id} href={`/guitar/${guitar.id}`} className="grid grid-cols-[minmax(0,1fr)_170px_140px_24px] gap-4 items-center px-5 py-4 border-b last:border-b-0 hover:bg-surface-2 transition-colors">
            <div className="min-w-0"><p className="text-sm font-semibold break-words">{guitar.maker} {guitar.model}</p>{guitar.year && <p className="text-sm text-[#5c6680] mt-1">{guitar.year}</p>}</div>
            <div className="text-sm text-[#5c6680]">{guitar.lastMaintenanceDate ? <><p>{formatDate(guitar.lastMaintenanceDate)}</p><p className="text-xs mt-1">{guitar.daysSinceMaintenance} days ago</p></> : 'No history'}</div>
            <div><StatusBadge status={guitar.status} /></div>
            <ChevronRight size={16} className="text-[#5c6680]" />
          </Link>
        ))}
      </div>
      </>}
    </>
  );
}
