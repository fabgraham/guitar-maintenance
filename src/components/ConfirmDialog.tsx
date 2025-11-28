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
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-500">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-700">{description}</p>
          <div className="flex justify-end space-x-3 pt-6">
            <button className="btn btn-secondary" onClick={onCancel}>{cancelText}</button>
            <button className="btn btn-danger" onClick={onConfirm}>{confirmText}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

