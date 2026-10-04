'use client';

import { useState } from 'react';
import { Trash2, Download, Upload, Database, CheckCircle2 } from 'lucide-react';
import { useAppState } from '@/hooks/useAppState';
import { useToast } from '@/contexts/ToastContext';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { StatusBadge } from '@/components/StatusBadge';
import { seedGuitars, seedMaintenanceLogs } from '@/utils/seedData';
import { createPreviewState, isLocalPreview } from '@/utils/preview';
import { MAINTENANCE_THRESHOLDS } from '@/utils/maintenance';
import { parseBackup } from '@/utils/backup';
import { AppState } from '@/types';

export default function Settings() {
  const { state, dispatch } = useAppState();
  const { showToast } = useToast();
  const [confirmation, setConfirmation] = useState<'clear' | 'import' | 'sample' | null>(null);
  const [pendingImport, setPendingImport] = useState<AppState | null>(null);

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ guitars: state.guitars, maintenanceLogs: state.maintenanceLogs }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `guitar-maintenance-${isLocalPreview ? 'preview-' : ''}${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast('Backup downloaded', 'success');
  };

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const parsed = parseBackup(JSON.parse(await file.text()));
      setPendingImport(parsed);
      setConfirmation('import');
    } catch {
      showToast('Invalid backup. Choose an exported Guitar Maintenance JSON file.', 'error');
    }
  };

  const confirmAction = () => {
    if (confirmation === 'clear') {
      dispatch({ type: 'LOAD_STATE', payload: { guitars: [], maintenanceLogs: [], isLoading: false } });
      showToast(isLocalPreview ? 'Preview data cleared' : 'Browser data cleared', 'success');
    } else if (confirmation === 'sample') {
      dispatch({ type: 'LOAD_STATE', payload: isLocalPreview ? createPreviewState() : { guitars: seedGuitars, maintenanceLogs: seedMaintenanceLogs, isLoading: false } });
      showToast('Sample collection loaded', 'success');
    } else if (confirmation === 'import' && pendingImport) {
      dispatch({ type: 'LOAD_STATE', payload: pendingImport });
      showToast('Backup restored in this browser', 'success');
    }
    setConfirmation(null);
    setPendingImport(null);
  };

  const dialogs = {
    clear: { title: isLocalPreview ? 'Clear Preview Data' : 'Clear Browser Data', description: 'Remove all guitars and maintenance logs from this browser’s copy. Export a backup first if you want to keep them.', confirmText: 'Clear Data' },
    import: { title: 'Restore Backup', description: 'Replace this browser’s collection with the selected backup? Export your current data first if you want to keep it.', confirmText: 'Restore Backup' },
    sample: { title: 'Load Sample Collection', description: 'Replace this browser’s collection with sample guitars and maintenance logs? Export your current data first if you want to keep it.', confirmText: 'Load Samples' },
  };

  return (
    <main className="page-shell">
      <div className="mb-7"><p className="section-label mb-2">Preferences & data</p><h1 className="page-title">Settings</h1><p className="mt-2 text-sm text-[#5c6680]">Back up your collection and understand its maintenance status.</p></div>
      {state.isLoading ? <LoadingSkeleton /> : (
        <div className="max-w-4xl space-y-5">
          <section className="panel" aria-labelledby="data-heading">
            <h2 id="data-heading" className="text-lg font-semibold mb-2">Backup and browser data</h2>
            <p className="text-sm text-[#5c6680] mb-6">{isLocalPreview ? 'You’re using a sample collection. Changes stay in this browser, and your live collection is untouched.' : 'Restore, sample and clear tools update this browser’s copy. Your synced collection is loaded again when you refresh.'}</p>
            <div className="divide-y divide-black/10">
              <div className="pb-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
                <div><h3 className="font-semibold text-sm">Export a backup</h3><p className="text-sm text-[#5c6680] mt-1">Download your guitars and maintenance history as a JSON file.</p></div>
                <button className="btn btn-secondary shrink-0 self-start" onClick={exportData}><Download size={16} />Export Data</button>
              </div>
              <div className="py-5">
                <h3 className="font-semibold text-sm">Restore a backup</h3><p className="text-sm text-[#5c6680] mt-1 mb-3">Choose a previously exported file to replace this browser’s collection.</p>
                <label htmlFor="backup-file" className="flex items-center gap-2 text-sm font-medium mb-2"><Upload size={16} />Backup file</label>
                <input id="backup-file" type="file" accept=".json,application/json" onChange={importData} className="block w-full max-w-full text-sm text-[#5c6680] file:mr-3 file:px-4 file:py-3 file:rounded-[10px] file:border-0 file:font-semibold file:bg-surface-2 file:text-[#181e2e]" />
              </div>
              <div className="pt-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
                <div><h3 className="font-semibold text-sm">Try a sample collection</h3><p className="text-sm text-[#5c6680] mt-1">Explore maintenance tracking with sample guitars.</p></div>
                <button className="btn btn-secondary shrink-0 self-start" onClick={() => setConfirmation('sample')}><Database size={16} />Load Samples</button>
              </div>
            </div>
          </section>

          <section className="panel" aria-labelledby="stats-heading">
            <h2 id="stats-heading" className="text-lg font-semibold mb-5">Your collection</h2>
            <dl className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-surface-2 p-4"><dd className="text-3xl font-bold mb-1" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>{state.guitars.length}</dd><dt className="text-sm text-[#5c6680]">Guitars</dt></div>
              <div className="rounded-xl bg-surface-2 p-4"><dd className="text-3xl font-bold mb-1" style={{ fontFamily: 'var(--font-space-mono), monospace' }}>{state.maintenanceLogs.length}</dd><dt className="text-sm text-[#5c6680]">Maintenance entries</dt></div>
            </dl>
          </section>

          <section className="panel" aria-labelledby="status-heading">
            <h2 id="status-heading" className="text-lg font-semibold mb-2">When is maintenance due?</h2>
            <p className="text-sm text-[#5c6680] mb-5">Status is based on the date of the latest maintenance entry.</p>
            <ul className="space-y-4 text-sm">
              <li className="flex flex-wrap items-center gap-3"><StatusBadge status="good" /><span>Up to {MAINTENANCE_THRESHOLDS.maintained} days since maintenance.</span></li>
              <li className="flex flex-wrap items-center gap-3"><StatusBadge status="warning" /><span>{MAINTENANCE_THRESHOLDS.maintained + 1}–{MAINTENANCE_THRESHOLDS.needsService} days since maintenance.</span></li>
              <li className="flex flex-wrap items-center gap-3"><StatusBadge status="urgent" /><span>More than {MAINTENANCE_THRESHOLDS.needsService} days, or no maintenance history.</span></li>
            </ul>
            <p className="flex items-start gap-2 text-sm text-[#5c6680] mt-5"><CheckCircle2 size={16} className="shrink-0 mt-0.5" />Add an entry after changing strings, completing a setup or making a repair.</p>
          </section>

          <section className="panel border-red-200" aria-labelledby="clear-heading">
            <h2 id="clear-heading" className="text-lg font-semibold text-[#b91c1c] mb-2">Clear {isLocalPreview ? 'preview' : 'browser'} data</h2>
            <p className="text-sm text-[#5c6680] mb-4">Remove this browser’s collection and maintenance history. Export a backup first if you want to keep it.{!isLocalPreview && ' This does not delete your synced collection.'}</p>
            <button className="btn btn-danger" onClick={() => setConfirmation('clear')}><Trash2 size={16} />Clear Data</button>
          </section>
        </div>
      )}
      <ConfirmDialog isOpen={confirmation !== null} {...dialogs[confirmation ?? 'clear']} destructive={confirmation === 'clear'} onConfirm={confirmAction} onCancel={() => { setConfirmation(null); setPendingImport(null); }} />
    </main>
  );
}
