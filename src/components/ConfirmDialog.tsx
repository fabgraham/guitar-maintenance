'use client';

import { useId } from 'react';
import { X } from 'lucide-react';
import { Modal } from '@/components/Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export function ConfirmDialog({ isOpen, title, description, confirmText = 'Delete', cancelText = 'Cancel', onConfirm, onCancel, destructive = true }: ConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  if (!isOpen) return null;
  return (
    <Modal labelledBy={titleId} describedBy={descriptionId} onClose={onCancel} initialFocus="[data-cancel]">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 id={titleId} className="text-lg font-semibold">{title}</h2>
        <button onClick={onCancel} aria-label="Close dialog" className="flex shrink-0 items-center justify-center w-11 h-11 rounded-lg hover:bg-surface-2 text-[#5c6680]"><X size={20} /></button>
      </div>
      <p id={descriptionId} className="text-sm text-[#5c6680] mb-6">{description}</p>
      <div className="flex flex-wrap justify-end gap-2">
        <button data-cancel className="btn btn-secondary" onClick={onCancel}>{cancelText}</button>
        <button className={`btn ${destructive ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>{confirmText}</button>
      </div>
    </Modal>
  );
}
