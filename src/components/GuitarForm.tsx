'use client';

import { useState, useEffect } from 'react';
import { useAppState, syncGuitarToSupabase } from '@/hooks/useAppState';
import { useToast } from '@/contexts/ToastContext';
import { Guitar } from '@/types';
import { X } from 'lucide-react';

interface GuitarFormProps {
  guitarId?: string | null;
  onClose: () => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#e8ecf2',
  border: '1px solid rgba(0,20,60,0.10)',
  borderRadius: 9,
  padding: '9px 13px',
  fontSize: 13,
  color: '#181e2e',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
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

      const { error } = await syncGuitarToSupabase(guitarToSync);
      if (error) {
        showToast('Guitar saved locally, but failed to sync to cloud', 'warning');
      } else {
        showToast(guitarId ? 'Guitar updated successfully!' : 'Guitar added successfully!', 'success');
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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,20,60,0.18)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        zIndex: 50,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#ffffff',
        borderRadius: 16,
        padding: 28,
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 20px 60px rgba(0,20,60,0.15)',
      }}>
        {/* Modal header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#181e2e', margin: 0 }}>
            {guitarId ? 'Edit Guitar' : 'Add Guitar'}
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a0a8bc', padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
            <div>
              <label style={labelStyle}>Maker *</label>
              <input
                type="text"
                name="maker"
                value={formData.maker}
                onChange={handleChange}
                style={inputStyle}
                placeholder="e.g., Fender, Gibson, PRS"
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Model *</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                style={inputStyle}
                placeholder="e.g., Stratocaster, Les Paul"
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Year</label>
              <input
                type="number"
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
              disabled={isSubmitting || !canSubmit}
              style={{
                background: canSubmit && !isSubmitting ? '#4d7cf6' : 'rgba(77,124,246,0.35)',
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
      </div>
    </div>
  );
}
