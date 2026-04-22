'use client';

import { useState, useEffect } from 'react';
import { useAppState, syncMaintenanceLogToSupabase } from '@/hooks/useAppState';
import { useToast } from '@/contexts/ToastContext';
import { MaintenanceLog } from '@/types';

interface MaintenanceLogFormProps {
  guitarId: string;
  logId?: string | null;
  onClose: () => void;
}

const inputStyle: React.CSSProperties = {
  background: '#e8ecf2',
  border: '1px solid rgba(0,20,60,0.10)',
  borderRadius: 9,
  padding: '11px 13px',
  fontSize: 16,
  color: '#181e2e',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

export function MaintenanceLogForm({ guitarId, logId, onClose }: MaintenanceLogFormProps) {
  const { state, dispatch } = useAppState();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    maintenanceDate: new Date().toISOString().split('T')[0],
    typeOfWork: '',
    notes: '',
  });

  useEffect(() => {
    if (logId) {
      const log = state.maintenanceLogs.find(l => l.id === logId);
      if (log) {
        setFormData({
          maintenanceDate: log.maintenanceDate.toISOString().split('T')[0],
          typeOfWork: log.typeOfWork,
          notes: log.notes,
        });
      }
    }
  }, [logId, state.maintenanceLogs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.typeOfWork.trim()) {
      showToast('Please fill in the type of work', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date();
      const maintenanceDate = new Date(formData.maintenanceDate);
      let logToSync: MaintenanceLog;

      if (logId) {
        const existingLog = state.maintenanceLogs.find(l => l.id === logId)!;
        const updatedLog: MaintenanceLog = { ...existingLog, maintenanceDate, typeOfWork: formData.typeOfWork, notes: formData.notes };
        logToSync = updatedLog;
        dispatch({ type: 'UPDATE_MAINTENANCE_LOG', payload: updatedLog });
      } else {
        const newLog: MaintenanceLog = {
          id: Date.now().toString(), guitarId, maintenanceDate,
          typeOfWork: formData.typeOfWork, notes: formData.notes, createdAt: now,
        };
        logToSync = newLog;
        dispatch({ type: 'ADD_MAINTENANCE_LOG', payload: newLog });
      }

      const { error } = await syncMaintenanceLogToSupabase(logToSync);
      if (error) {
        showToast('Maintenance log saved locally, but failed to sync to cloud', 'warning');
      } else {
        showToast(logId ? 'Maintenance log updated!' : 'Maintenance log added!', 'success');
      }

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: '#ffffff',
        border: '1px solid rgba(0,20,60,0.10)',
        borderRadius: 12,
        padding: 18,
      }}
    >
      {/* First row: type + date */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <input
            type="text"
            name="typeOfWork"
            value={formData.typeOfWork}
            onChange={handleChange}
            style={inputStyle}
            placeholder="Type of work (e.g., String replacement)"
            required
          />
        </div>
        <div style={{ width: 150 }}>
          <input
            type="date"
            name="maintenanceDate"
            value={formData.maintenanceDate}
            onChange={handleChange}
            style={inputStyle}
            required
          />
        </div>
      </div>

      {/* Notes */}
      <div style={{ marginBottom: 14 }}>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={2}
          style={{ ...inputStyle, resize: 'vertical' }}
          placeholder="Notes (optional)"
        />
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          style={{
            background: '#e8ecf2', color: '#5c6680', border: 'none',
            borderRadius: 9, padding: '8px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            background: '#4d7cf6', color: '#fff', border: 'none',
            borderRadius: 9, padding: '8px 14px', fontSize: 13, fontWeight: 600,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1,
          }}
        >
          {isSubmitting ? 'Saving…' : (logId ? 'Update' : 'Save')}
        </button>
      </div>
    </form>
  );
}
