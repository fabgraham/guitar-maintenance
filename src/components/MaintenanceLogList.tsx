'use client';

import { MaintenanceLog } from '@/types';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useAppState, deleteMaintenanceLogFromAPI } from '@/hooks/useAppState';
import { useToast } from '@/contexts/ToastContext';
import { MaintenanceLogForm } from './MaintenanceLogForm';
import { ConfirmDialog } from './ConfirmDialog';

interface MaintenanceLogListProps {
  logs: MaintenanceLog[];
  editingLogId?: string | null;
  onEditClick?: (logId: string) => void;
  onEditClose?: () => void;
  readOnly?: boolean;
}

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);

export function MaintenanceLogList({ logs, editingLogId, onEditClick, onEditClose, readOnly = false }: MaintenanceLogListProps) {
  const { dispatch } = useAppState();
  const { showToast } = useToast();
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [confirmingLogId, setConfirmingLogId] = useState<string | null>(null);

  const handleDelete = async () => {
    const logId = confirmingLogId;
    if (!logId) return;
    setConfirmingLogId(null);
    setExpandedLogId(null);
    dispatch({ type: 'DELETE_MAINTENANCE_LOG', payload: logId });
    try {
      await deleteMaintenanceLogFromAPI(logId);
      showToast('Maintenance log deleted', 'success');
    } catch {
      showToast('Maintenance log deleted locally, but failed to sync to cloud', 'warning');
    }
  };

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
        {!readOnly && <p style={{ fontSize: 13, color: '#5c6680' }}>Add your first maintenance log to start tracking.</p>}
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

      <ol style={{ display: 'flex', flexDirection: 'column', gap: 10, listStyle: 'none', margin: 0, padding: 0 }}>
        {logs.map((log, i) => {
          const isLatest = i === 0;
          const isEditing = !readOnly && editingLogId === log.id;
          const isExpanded = !readOnly && expandedLogId === log.id;
          const actionsId = `log-actions-${log.id}`;

          const content = (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#181e2e', flex: 1, minWidth: 0 }}>
                  {log.typeOfWork}
                </span>
                {isLatest && (
                  <span style={{
                    fontSize: 9, fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase',
                    color: '#2853bd', background: 'rgba(77,124,246,0.10)',
                    borderRadius: 99, padding: '2px 7px', flexShrink: 0,
                  }}>
                    Latest
                  </span>
                )}
                <span style={{ fontSize: 13, color: '#5c6680', flexShrink: 0 }}>
                  {formatDate(log.maintenanceDate)}
                </span>
                {!readOnly && (
                  <ChevronDown
                    size={15}
                    strokeWidth={1.75}
                    aria-hidden="true"
                    className="log-entry-hint"
                    style={{ flexShrink: 0, transform: isExpanded ? 'rotate(180deg)' : undefined }}
                  />
                )}
              </div>
              {log.notes && (
                <p
                  className={!readOnly && !isExpanded ? 'log-entry-notes-clamped' : undefined}
                  style={{ fontSize: 13, color: '#5c6680', margin: '6px 0 0', whiteSpace: 'pre-line' }}
                >
                  {log.notes}
                </p>
              )}
            </>
          );

          return (
            <li key={log.id} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', position: 'relative' }}>
              {/* Timeline node */}
              <div style={{
                width: 33,
                height: 33,
                borderRadius: '50%',
                flexShrink: 0,
                background: isLatest ? '#2853bd' : '#e8ecf2',
                border: `1px solid ${isLatest ? '#2853bd' : 'rgba(0,20,60,0.14)'}`,
                boxShadow: isLatest ? '0 0 0 4px rgba(77,124,246,0.15)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
                marginTop: 2,
              }}>
                <CalendarDays size={14} strokeWidth={1.5} color={isLatest ? '#fff' : '#5c6680'} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                {isEditing ? (
                  <MaintenanceLogForm guitarId={log.guitarId} logId={log.id} onClose={() => onEditClose?.()} />
                ) : readOnly ? (
                  <div className="log-entry" data-latest={isLatest || undefined}>{content}</div>
                ) : (
                  <div className="log-entry log-entry-interactive" data-latest={isLatest || undefined} data-expanded={isExpanded || undefined}>
                    <button
                      type="button"
                      className="log-entry-toggle"
                      aria-expanded={isExpanded}
                      aria-controls={actionsId}
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    >
                      {content}
                    </button>
                    {isExpanded && (
                      <div id={actionsId} className="log-entry-actions">
                        <button type="button" className="log-entry-action" onClick={() => { setExpandedLogId(null); onEditClick?.(log.id); }}>
                          Edit
                        </button>
                        <button type="button" className="log-entry-action log-entry-action-danger" onClick={() => setConfirmingLogId(log.id)}>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <ConfirmDialog
        isOpen={confirmingLogId !== null}
        title="Delete Maintenance Entry"
        description="This will delete this maintenance entry. This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmingLogId(null)}
      />
    </div>
  );
}
