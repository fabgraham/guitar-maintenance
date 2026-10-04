'use client';

import { useState, useEffect } from 'react';
import { useAppState, syncGuitarToAPI, addGuitarToAPI } from '@/hooks/useAppState';
import { useToast } from '@/contexts/ToastContext';
import { Guitar } from '@/types';
import { X } from 'lucide-react';
import { Modal } from '@/components/Modal';

interface GuitarFormProps {
  guitarId?: string | null;
  onClose: () => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#e8ecf2',
  border: '1px solid rgba(0,20,60,0.10)',
  borderRadius: 9,
  padding: '11px 13px',
  fontSize: 16,
  color: '#181e2e',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 14,
  fontWeight: 500,
  color: '#5c6680',
  marginBottom: 6,
};

export function GuitarForm({ guitarId, onClose }: GuitarFormProps) {
  const { state, dispatch } = useAppState();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ maker: '', model: '', year: '' });

  useEffect(() => {
    if (guitarId) {
      const guitar = state.guitars.find(g => g.id === guitarId);
      if (guitar) setFormData({ maker: guitar.maker, model: guitar.model, year: guitar.year });
    }
  }, [guitarId, state.guitars]);

  const canSubmit = formData.maker.trim() && formData.model.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      const now = new Date();
      let guitarToSync: Guitar;

      if (guitarId) {
        const existingGuitar = state.guitars.find(g => g.id === guitarId)!;
        const updatedGuitar: Guitar = { ...existingGuitar, ...formData, updatedAt: now };
        guitarToSync = updatedGuitar;
        dispatch({ type: 'UPDATE_GUITAR', payload: updatedGuitar });
      } else {
        const newGuitar: Guitar = { id: Date.now().toString(), ...formData, createdAt: now, updatedAt: now };
        guitarToSync = newGuitar;
        dispatch({ type: 'ADD_GUITAR', payload: newGuitar });
      }

      try {
        if (guitarId) {
          await syncGuitarToAPI(guitarToSync);
        } else {
          await addGuitarToAPI(guitarToSync);
        }
        showToast(guitarId ? 'Guitar updated successfully!' : 'Guitar added successfully!', 'success');
      } catch {
        showToast('Guitar saved locally, but failed to sync to cloud', 'warning');
      }

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <Modal labelledBy="guitar-form-title" onClose={onClose} initialFocus="input[name=maker]">
        {/* Modal header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h3 id="guitar-form-title" style={{ fontSize: 16, fontWeight: 600, color: '#181e2e', margin: 0 }}>
            {guitarId ? 'Edit Guitar' : 'Add Guitar'}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close guitar form"
            className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-surface-2"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5c6680', padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
            <div>
              <label htmlFor="guitar-maker" style={labelStyle}>Maker *</label>
              <input
                type="text"
                id="guitar-maker"
                name="maker"
                value={formData.maker}
                onChange={handleChange}
                style={inputStyle}
                placeholder="e.g., Fender, Gibson, PRS"
                required
              />
            </div>
            <div>
              <label htmlFor="guitar-model" style={labelStyle}>Model *</label>
              <input
                type="text"
                id="guitar-model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                style={inputStyle}
                placeholder="e.g., Stratocaster, Les Paul"
                required
              />
            </div>
            <div>
              <label htmlFor="guitar-year" style={labelStyle}>Year</label>
              <input
                type="number"
                id="guitar-year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                style={inputStyle}
                placeholder="e.g., 2021"
                min={1900}
                max={new Date().getFullYear()}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px]"
              disabled={isSubmitting}
              style={{
                background: '#e8ecf2',
                color: '#5c6680',
                border: 'none',
                borderRadius: 9,
                padding: '9px 16px',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[44px]"
              disabled={isSubmitting || !canSubmit}
              style={{
                background: canSubmit && !isSubmitting ? '#2853bd' : 'rgba(77,124,246,0.35)',
                color: '#fff',
                border: 'none',
                borderRadius: 9,
                padding: '9px 16px',
                fontSize: 13,
                fontWeight: 600,
                cursor: canSubmit && !isSubmitting ? 'pointer' : 'not-allowed',
                transition: 'background 0.15s',
              }}
            >
              {isSubmitting ? 'Saving…' : (guitarId ? 'Update Guitar' : 'Add Guitar')}
            </button>
          </div>
        </form>
    </Modal>
  );
}
