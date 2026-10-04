'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useAppState } from '@/hooks/useAppState';
import { calculateMaintenanceStatus } from '@/utils/maintenance';
import { StatusBadge } from '@/components/StatusBadge';
import { GuitarRow } from '@/components/GuitarRow';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

interface GuitarListProps { onEditClick: (guitarId: string) => void; }
const statusOrder = { urgent: 0, warning: 1, good: 2 };

export function GuitarList({ onEditClick }: GuitarListProps) {
  const { state } = useAppState();
  const [sortBy, setSortBy] = useState<'name-asc' | 'status'>('name-asc');
  const guitars = useMemo(() => state.guitars
    .map(guitar => calculateMaintenanceStatus(guitar, state.maintenanceLogs))
    .sort((a, b) => (sortBy === 'status' ? statusOrder[a.status] - statusOrder[b.status] : 0)
      || `${a.maker} ${a.model}`.localeCompare(`${b.maker} ${b.model}`)), [state.guitars, state.maintenanceLogs, sortBy]);
  const formatDate = (date: Date) => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);

  if (state.isLoading) return <LoadingSkeleton />;
  if (!guitars.length) return (
    <div className="panel text-center py-10 max-w-lg mx-auto">
      <h2 className="font-semibold mb-2">No guitars in your collection</h2>
      <p className="text-sm text-[#5c6680] mb-5">Start by adding your first guitar to track maintenance.</p>
      <button className="btn btn-primary" onClick={() => onEditClick('')}>Add Your First Guitar</button>
    </div>
  );

  return (
    <>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <p className="section-label">{guitars.length} guitar{guitars.length === 1 ? '' : 's'}</p>
        <div className="relative inline-flex items-center gap-2">
          <label htmlFor="guitar-sort" className="text-sm text-[#5c6680]">Sort by</label>
          <select id="guitar-sort" value={sortBy} onChange={event => setSortBy(event.target.value as typeof sortBy)}
            className="appearance-none rounded-[10px] border bg-white py-2.5 pl-3 pr-8 text-sm min-h-[44px]">
            <option value="name-asc">Name (A–Z)</option><option value="status">Status</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 pointer-events-none text-[#5c6680]" />
        </div>
      </div>
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
    </>
  );
}
