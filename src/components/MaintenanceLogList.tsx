'use client';

import { MaintenanceLog } from '@/types';
import { Edit, Trash2, CalendarDays, ChevronDown } from 'lucide-react';
import { useAppState, deleteMaintenanceLogFromAPI } from '@/hooks/useAppState';
import { useToast } from '@/contexts/ToastContext';
import { useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';

interface MaintenanceLogListProps {
  logs: MaintenanceLog[];
  onEditClick?: (logId: string) => void;
  readOnly?: boolean;
}

export function MaintenanceLogList({ logs, onEditClick, readOnly = false }: MaintenanceLogListProps) {
  const { dispatch } = useAppState();
  const { showToast } = useToast();
  const [confirmingLogId, setConfirmingLogId] = useState<string | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {logs.map((log, i) => {
          const isLatest = i === 0;
          const isExpanded = expandedLogId === log.id;

          return (
            <div key={log.id} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', position: 'relative' }}>
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

              {/* Maintenance entry */}
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  overflowWrap: 'anywhere',
                  background: '#ffffff',
                  border: `1px solid ${isLatest ? 'rgba(77,124,246,0.33)' : 'rgba(0,20,60,0.08)'}`,
                  borderRadius: 11,
                  padding: '12px 15px',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#f8f9fc'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#ffffff'; }}
              >
                {/* Card header row */}
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
                </div>

                {log.notes && (
                  <p style={{ fontSize: 13, color: '#5c6680', margin: '6px 0 0' }}>{log.notes}</p>
                )}

                {!readOnly && <><button
                  aria-expanded={isExpanded}
                  aria-controls={`log-actions-${log.id}`}
                  aria-label={`Actions for ${log.typeOfWork} on ${formatDate(log.maintenanceDate)}`}
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                  className="inline-flex items-center gap-1 min-h-[44px] mt-2 text-sm font-medium text-[#2853bd]"
                >
                  Actions <ChevronDown size={14} className={isExpanded ? 'rotate-180' : ''} />
                </button>

                {/* Entry actions */}
                  <div
                    id={`log-actions-${log.id}`}
                    hidden={!isExpanded}
                    style={{
                      display: isExpanded ? 'flex' : 'none',
                      gap: 8,
                      marginTop: 4,
                      paddingTop: 10,
                      borderTop: '1px solid rgba(0,20,60,0.08)',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="min-h-[44px]"
                      onClick={() => { setExpandedLogId(null); onEditClick?.(log.id); }}
                      style={{
                        flex: 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        background: '#e8ecf2', border: 'none', borderRadius: 8,
                        padding: '9px 0', fontSize: 13, fontWeight: 500, color: '#5c6680',
                      }}
                    >
                      <Edit size={14} strokeWidth={1.5} />
                      Edit
                    </button>
                    <button
                      className="min-h-[44px]"
                      onClick={() => { setConfirmingLogId(log.id); }}
                      style={{
                        flex: 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        background: 'rgba(212,32,32,0.08)', border: 'none', borderRadius: 8,
                        padding: '9px 0', fontSize: 13, fontWeight: 500, color: '#b91c1c',
                      }}
                    >
                      <Trash2 size={14} strokeWidth={1.5} />
                      Delete
                    </button>
                  </div>
                </>}
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
                  try {
                    await deleteMaintenanceLogFromAPI(logIdToDelete);
                    showToast('Maintenance log deleted successfully!', 'success');
                  } catch {
                    showToast('Maintenance log deleted locally, but failed to sync to cloud', 'warning');
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
