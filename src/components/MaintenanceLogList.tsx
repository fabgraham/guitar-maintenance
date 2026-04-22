'use client';

import { MaintenanceLog } from '@/types';
import { Edit, Trash2, CalendarDays } from 'lucide-react';
import { useAppState, deleteMaintenanceLogFromSupabase } from '@/hooks/useAppState';
import { useToast } from '@/contexts/ToastContext';
import { useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';

interface MaintenanceLogListProps {
  logs: MaintenanceLog[];
  onEditClick: (logId: string) => void;
}

export function MaintenanceLogList({ logs, onEditClick }: MaintenanceLogListProps) {
  const { dispatch } = useAppState();
  const { showToast } = useToast();
  const [confirmingLogId, setConfirmingLogId] = useState<string | null>(null);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);

  if (logs.length === 0) {
    return (
      <div style={{
        background: '#ffffff',
        border: '1px solid rgba(0,20,60,0.08)',
        borderRadius: 12,
        padding: '28px 20px',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#181e2e', marginBottom: 6 }}>No maintenance history</p>
        <p style={{ fontSize: 13, color: '#5c6680' }}>Add your first maintenance log to start tracking.</p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Vertical timeline line */}
      <div style={{
        position: 'absolute',
        left: 16,
        top: 16,
        bottom: 16,
        width: 1,
        background: 'rgba(0,20,60,0.14)',
      }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {logs.map((log, i) => {
          const isLatest = i === 0;
          return (
            <div key={log.id} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', position: 'relative' }}>
              {/* Timeline node */}
              <div style={{
                width: 33,
                height: 33,
                borderRadius: '50%',
                flexShrink: 0,
                background: isLatest ? '#4d7cf6' : '#e8ecf2',
                border: `1px solid ${isLatest ? '#4d7cf6' : 'rgba(0,20,60,0.14)'}`,
                boxShadow: isLatest ? '0 0 0 4px rgba(77,124,246,0.15)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
              }}>
                <CalendarDays size={14} strokeWidth={1.5} color={isLatest ? '#fff' : '#a0a8bc'} />
              </div>

              {/* Log card */}
              <div style={{
                flex: 1,
                background: '#ffffff',
                border: `1px solid ${isLatest ? 'rgba(77,124,246,0.33)' : 'rgba(0,20,60,0.08)'}`,
                borderRadius: 11,
                padding: '12px 15px',
              }}>
                {/* Card header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: log.notes ? 6 : 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#181e2e' }}>
                    {log.typeOfWork}
                  </span>
                  {isLatest && (
                    <span style={{
                      fontSize: 9,
                      fontWeight: 600,
                      letterSpacing: '0.09em',
                      textTransform: 'uppercase',
                      color: '#4d7cf6',
                      background: 'rgba(77,124,246,0.10)',
                      borderRadius: 99,
                      padding: '2px 7px',
                    }}>
                      Latest
                    </span>
                  )}
                  <span style={{ fontSize: 12, color: '#a0a8bc', marginLeft: 'auto' }}>
                    {formatDate(log.maintenanceDate)}
                  </span>
                  <button
                    onClick={() => onEditClick(log.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#a0a8bc', display: 'flex' }}
                  >
                    <Edit size={13} />
                  </button>
                  <button
                    onClick={() => setConfirmingLogId(log.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#a0a8bc', display: 'flex' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {log.notes && (
                  <p style={{ fontSize: 13, color: '#5c6680', margin: 0 }}>{log.notes}</p>
                )}
              </div>

              <ConfirmDialog
                isOpen={confirmingLogId === log.id}
                title="Delete Maintenance Entry"
                description="This will delete the selected maintenance entry. This action cannot be undone."
                confirmText="Delete"
                onConfirm={async () => {
                  const logIdToDelete = log.id;
                  setConfirmingLogId(null);
                  dispatch({ type: 'DELETE_MAINTENANCE_LOG', payload: logIdToDelete });
                  const { error } = await deleteMaintenanceLogFromSupabase(logIdToDelete);
                  if (error) {
                    showToast('Maintenance log deleted locally, but failed to sync to cloud', 'warning');
                  } else {
                    showToast('Maintenance log deleted successfully!', 'success');
                  }
                }}
                onCancel={() => setConfirmingLogId(null)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
