'use client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const dynamicParams = true;

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GuitarForm } from '@/components/GuitarForm';
import { MaintenanceLogForm } from '@/components/MaintenanceLogForm';
import { MaintenanceLogList } from '@/components/MaintenanceLogList';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useAppState, deleteGuitarFromSupabase } from '@/hooks/useAppState';
import { useToast } from '@/contexts/ToastContext';
import { calculateMaintenanceStatus } from '@/utils/maintenance';
import { ArrowLeft, Plus, Trash2, Pencil } from 'lucide-react';
import Link from 'next/link';

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

export default function GuitarDetail() {
  const params = useParams();
  const router = useRouter();
  const { state, dispatch } = useAppState();
  const { showToast } = useToast();
  const [showLogForm, setShowLogForm] = useState(false);
  const [editingLog, setEditingLog] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [mounted, setMounted] = useState(false);

  const guitarId = params.id as string;
  const guitar = state.guitars.find(g => g.id === guitarId);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted || state.isLoading || (!guitar && state.guitars.length === 0)) {
    return (
      <main style={{ padding: 28 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 64 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            border: '2px solid rgba(0,20,60,0.08)',
            borderTopColor: '#4d7cf6',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ marginTop: 16, fontSize: 13, color: '#a0a8bc' }}>Loading guitar details…</p>
        </div>
      </main>
    );
  }

  if (!guitar) {
    return (
      <main style={{ padding: 28, textAlign: 'center' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#181e2e', marginBottom: 16 }}>Guitar not found</h2>
        <Link href="/" style={{
          background: '#4d7cf6', color: '#fff', borderRadius: 10,
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

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);

  return (
    <main style={{ minHeight: '100vh' }}>
      {/* Fixed header */}
      <div style={{
        padding: '24px 28px',
        borderBottom: '1px solid rgba(0,20,60,0.08)',
        background: '#f0f2f5',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        {/* Back button */}
        <button
          onClick={() => router.back()}
          style={{
            width: 34, height: 34, borderRadius: 9,
            background: '#e8ecf2', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={16} style={{ color: '#5c6680' }} />
        </button>

        {/* Title area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#a0a8bc', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 2 }}>
            {guitar.maker}
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 500, color: '#181e2e', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {guitar.model}
          </h1>
        </div>

        {/* Action buttons */}
        <button
          onClick={() => setShowEditForm(true)}
          style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'rgba(77,124,246,0.10)',
            border: '1px solid rgba(77,124,246,0.25)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          <Pencil size={15} style={{ color: '#4d7cf6' }} />
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'rgba(212,32,32,0.08)',
            border: '1px solid rgba(212,32,32,0.20)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          <Trash2 size={15} style={{ color: '#d42020' }} />
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: 28 }}>
        {/* Last maintenance summary card */}
        <div style={{
          background: '#e8ecf2',
          border: '1px solid rgba(0,20,60,0.14)',
          borderRadius: 12,
          padding: '16px 18px',
          marginBottom: 28,
        }}>
          {guitarWithStatus.lastMaintenanceDate ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start' }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#a0a8bc', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 6 }}>
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
                <p style={{ fontSize: 11, color: '#a0a8bc', marginTop: 4 }}>days</p>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <p style={{ fontSize: 13, color: '#5c6680', marginBottom: 12 }}>No maintenance records yet</p>
              <button
                onClick={() => setShowLogForm(true)}
                style={{
                  background: '#4d7cf6', color: '#fff', border: 'none',
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

        {/* History section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#a0a8bc', letterSpacing: '0.10em', textTransform: 'uppercase' }}>
              History · {guitarLogs.length}
            </p>
            <button
              onClick={() => { setEditingLog(null); setShowLogForm(true); }}
              style={{
                background: '#4d7cf6', color: '#fff', border: 'none',
                borderRadius: 9, padding: '7px 13px', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5,
              }}
            >
              <Plus size={13} />
              Add Entry
            </button>
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

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Guitar"
        description="This will delete the guitar and all its maintenance logs. This action cannot be undone."
        confirmText="Delete"
        onConfirm={async () => {
          setShowDeleteConfirm(false);
          dispatch({ type: 'DELETE_GUITAR', payload: guitarId });
          router.push('/');
          const { error } = await deleteGuitarFromSupabase(guitarId);
          if (error) {
            showToast('Guitar deleted locally, but failed to sync to cloud', 'warning');
          } else {
            showToast('Guitar deleted successfully!', 'success');
          }
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </main>
  );
}
