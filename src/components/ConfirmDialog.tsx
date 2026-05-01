'use client';

import { X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ isOpen, title, description, confirmText = 'Delete', cancelText = 'Cancel', onConfirm, onCancel }: ConfirmDialogProps) {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.30)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50 }}>
      <div style={{ background: '#ffffff', borderRadius: 16, boxShadow: '0 8px 40px rgba(0,20,60,0.18)', maxWidth: 400, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(0,20,60,0.08)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#181e2e', margin: 0 }}>{title}</h3>
          <button
            onClick={onCancel}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a0a8bc', padding: 4, display: 'flex', alignItems: 'center', borderRadius: 6 }}
          >
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <p style={{ fontSize: 14, color: '#5c6680', margin: '0 0 24px' }}>{description}</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              onClick={onCancel}
              style={{
                background: 'rgba(77,124,246,0.10)',
                color: '#4d7cf6',
                border: '1px solid rgba(77,124,246,0.25)',
                borderRadius: 10,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              style={{
                background: 'rgba(212,32,32,0.10)',
                color: '#d42020',
                border: '1px solid rgba(212,32,32,0.25)',
                borderRadius: 10,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

