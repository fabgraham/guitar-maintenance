'use client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const dynamicParams = true;

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GuitarForm } from '@/components/GuitarForm';
import { MaintenanceLogForm } from '@/components/MaintenanceLogForm';
import { MaintenanceLogList } from '@/components/MaintenanceLogList';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { SaleDialog } from '@/components/SaleDialog';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { StatusBadge } from '@/components/StatusBadge';
import { useAppState, deleteGuitarFromAPI, saveSaleToAPI } from '@/hooks/useAppState';
import { useToast } from '@/contexts/ToastContext';
import { calculateMaintenanceStatus, formatSoldDate, formatSoldPrice, isArchived } from '@/utils/maintenance';
import { Archive, ArchiveRestore, ArrowLeft, Plus, Trash2, Pencil } from 'lucide-react';
import Link from 'next/link';

const STATUS_COLORS = {
  good: { text: '#116b33', bg: 'rgba(22,163,74,0.10)' },
  warning: { text: '#916000', bg: 'rgba(196,122,0,0.10)' },
  urgent: { text: '#b91c1c', bg: 'rgba(212,32,32,0.10)' },
};

export default function GuitarDetail() {
  const params = useParams();
  const router = useRouter();
  const { state, dispatch } = useAppState();
  const { showToast } = useToast();
  const [showLogForm, setShowLogForm] = useState(false);
  const [editingLog, setEditingLog] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showSaleDialog, setShowSaleDialog] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);

  const guitarId = params.id as string;
  const guitar = state.guitars.find(g => g.id === guitarId);

  if (state.isLoading) {
    return <main className="page-shell"><LoadingSkeleton label="Loading guitar details…" /></main>;
  }

  if (!guitar) {
    return (
      <main className="page-shell text-center">
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#181e2e', marginBottom: 16 }}>Guitar not found</h2>
        <Link href="/" style={{
          background: '#2853bd', color: '#fff', borderRadius: 10,
          padding: '9px 16px', fontSize: 13, fontWeight: 600, textDecoration: 'none',
        }}>
          Back to Dashboard
        </Link>
      </main>
    );
  }

  const guitarWithStatus = calculateMaintenanceStatus(guitar, state.maintenanceLogs);
  const guitarLogs = state.maintenanceLogs
    .filter(log => log.guitarId === guitarId)
    .sort((a, b) => b.maintenanceDate.getTime() - a.maintenanceDate.getTime());

  const colors = STATUS_COLORS[guitarWithStatus.status];
  const archived = isArchived(guitar);

  const restoreGuitar = async () => {
    setShowRestoreConfirm(false);
    const restored = { ...guitar, soldDate: null, soldPrice: null, updatedAt: new Date() };
    try {
      await saveSaleToAPI(restored);
      dispatch({ type: 'UPDATE_GUITAR', payload: restored });
      showToast('Guitar moved back to your collection', 'success');
    } catch {
      showToast('Could not restore this guitar. Please try again.', 'error');
    }
  };

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);

  return (
    <main style={{ minHeight: '100vh' }}>
      {/* Fixed header */}
      <div className="detail-header" style={{
        borderBottom: '1px solid rgba(0,20,60,0.08)',
        background: '#f0f2f5',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        {/* Back button */}
        <button
          aria-label="Back to collection"
          onClick={() => router.push(archived ? '/inventory?view=archive' : '/inventory')}
          style={{
            width: 44, height: 44, borderRadius: 9,
            background: '#e8ecf2', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={16} style={{ color: '#5c6680' }} />
        </button>

        {/* Title area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#5c6680', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 2 }}>
            {guitar.maker}
          </p>
          <h1 className="detail-title" style={{ fontSize: 22, fontWeight: 600, color: '#181e2e', margin: 0 }}>
            {guitar.model}
          </h1>
        </div>

        {/* Action buttons */}
        {!archived && <button
          aria-label="Edit guitar"
          onClick={() => setShowEditForm(true)}
          style={{
            width: 44, height: 44, borderRadius: 9,
            background: 'rgba(77,124,246,0.10)',
            border: '1px solid rgba(77,124,246,0.25)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          <Pencil size={15} style={{ color: '#2853bd' }} />
        </button>}
        <button
          aria-label="Delete guitar"
          onClick={() => setShowDeleteConfirm(true)}
          style={{
            width: 44, height: 44, borderRadius: 9,
            background: 'rgba(212,32,32,0.08)',
            border: '1px solid rgba(212,32,32,0.20)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          <Trash2 size={15} style={{ color: '#b91c1c' }} />
        </button>
      </div>

      {/* Content */}
      <div className="detail-content">
        {archived ? (
          <div className="panel mb-7">
            <p className="section-label mb-3">Sold</p>
            <p className="text-lg font-semibold">{formatSoldDate(guitar.soldDate!)}</p>
            <p className="text-sm text-[#5c6680] mt-1">{guitar.soldPrice != null ? formatSoldPrice(guitar.soldPrice) : 'No price recorded'}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              <button className="btn btn-secondary" onClick={() => setShowSaleDialog(true)}><Pencil size={15} />Edit sale details</button>
              <button className="btn btn-secondary" onClick={() => setShowRestoreConfirm(true)}><ArchiveRestore size={16} />Restore to collection</button>
            </div>
          </div>
        ) : <>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <StatusBadge status={guitarWithStatus.status} />
          <button className="btn btn-secondary" onClick={() => setShowSaleDialog(true)}><Archive size={16} />Move to archive</button>
        </div>
        {/* Last maintenance summary card */}
        <div style={{
          background: '#e8ecf2',
          border: '1px solid rgba(0,20,60,0.14)',
          borderRadius: 12,
          padding: '16px 18px',
          marginBottom: 28,
        }}>
          {guitarWithStatus.lastMaintenanceDate ? (
            <div className="detail-summary">
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#5c6680', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 6 }}>
                  Last Maintenance
                </p>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#181e2e', marginBottom: 2 }}>
                  {formatDate(guitarWithStatus.lastMaintenanceDate)}
                  <span style={{ fontSize: 13, fontWeight: 400, color: '#5c6680' }}> — {guitarWithStatus.daysSinceMaintenance} days ago</span>
                </p>
                {guitarLogs[0]?.typeOfWork && (
                  <p style={{ fontSize: 13, color: '#5c6680', marginTop: 4 }}>
                    <span style={{ fontWeight: 500 }}>Type:</span> {guitarLogs[0].typeOfWork}
                  </p>
                )}
                {guitarWithStatus.lastMaintenanceNotes && (
                  <p style={{ fontSize: 13, color: '#5c6680', marginTop: 2 }}>
                    <span style={{ fontWeight: 500 }}>Notes:</span> {guitarWithStatus.lastMaintenanceNotes}
                  </p>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{
                  fontSize: 34, fontWeight: 700, color: colors.text,
                  fontFamily: 'var(--font-space-mono), monospace',
                  lineHeight: 1, margin: 0,
                }}>
                  {guitarWithStatus.daysSinceMaintenance}
                </p>
                <p style={{ fontSize: 11, color: '#5c6680', marginTop: 4 }}>days</p>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <p style={{ fontSize: 13, color: '#5c6680', marginBottom: 12 }}>No maintenance records yet</p>
              <button
                className="min-h-[44px]"
                onClick={() => setShowLogForm(true)}
                style={{
                  background: '#2853bd', color: '#fff', border: 'none',
                  borderRadius: 9, padding: '8px 14px', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
                }}
              >
                <Plus size={13} />
                Add First Maintenance Log
              </button>
            </div>
          )}
        </div>
        </>}

        {/* History section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#5c6680', letterSpacing: '0.10em', textTransform: 'uppercase' }}>
              History · {guitarLogs.length}
            </p>
            {!archived && <button
              className="min-h-[44px]"
              onClick={() => { setEditingLog(null); setShowLogForm(true); }}
              style={{
                background: '#2853bd', color: '#fff', border: 'none',
                borderRadius: 9, padding: '7px 13px', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5,
              }}
            >
              <Plus size={13} />
              Add Entry
            </button>}
          </div>

          {showLogForm && (
            <div style={{ marginBottom: 16 }}>
              <MaintenanceLogForm
                guitarId={guitarId}
                logId={editingLog}
                onClose={() => { setShowLogForm(false); setEditingLog(null); }}
              />
            </div>
          )}

          <MaintenanceLogList
            logs={guitarLogs}
            readOnly={archived}
            onEditClick={(logId) => {
              setEditingLog(logId);
              setShowLogForm(true);
            }}
          />
        </div>
      </div>

      {/* Modals */}
      {showEditForm && (
        <GuitarForm guitarId={guitarId} onClose={() => setShowEditForm(false)} />
      )}

      {showSaleDialog && (
        <SaleDialog guitar={guitar} onClose={() => setShowSaleDialog(false)} />
      )}

      <ConfirmDialog
        isOpen={showRestoreConfirm}
        title="Restore Guitar"
        description="This moves the guitar back to your collection and removes its sold date and price."
        confirmText="Restore"
        destructive={false}
        onConfirm={restoreGuitar}
        onCancel={() => setShowRestoreConfirm(false)}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Guitar"
        description="This will delete the guitar and all its maintenance logs. This action cannot be undone."
        confirmText="Delete"
        onConfirm={async () => {
          setShowDeleteConfirm(false);
          dispatch({ type: 'DELETE_GUITAR', payload: guitarId });
          router.push('/');
          try {
            await deleteGuitarFromAPI(guitarId);
            showToast('Guitar deleted successfully!', 'success');
          } catch {
            showToast('Guitar deleted locally, but failed to sync to cloud', 'warning');
          }
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </main>
  );
}
