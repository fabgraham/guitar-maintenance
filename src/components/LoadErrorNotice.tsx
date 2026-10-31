'use client';

import { useAppState } from '@/hooks/useAppState';

export function LoadErrorNotice() {
  const { state } = useAppState();
  if (!state.loadError) return null;
  const hasCopy = state.guitars.length > 0;
  return (
    <div role="alert" className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
      style={{ background: 'rgba(212,32,32,0.08)', borderBottom: '1px solid rgba(212,32,32,0.25)', color: '#b91c1c' }}>
      <p>
        <strong>Can’t reach your collection.</strong>{' '}
        {hasCopy ? 'This is an older copy saved in this browser and may be out of date.' : 'Nothing can be shown right now.'}{' '}
        Changes won’t be saved until this is fixed.
      </p>
      <button className="btn btn-danger" onClick={() => window.location.reload()}>Try again</button>
    </div>
  );
}
