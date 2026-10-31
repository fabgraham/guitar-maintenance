'use client';

import { FormEvent, useState } from 'react';
import { X } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { useAppState, saveSaleToAPI } from '@/hooks/useAppState';
import { useToast } from '@/contexts/ToastContext';
import { Guitar } from '@/types';

const todayIso = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const fieldClass = 'w-full rounded-[9px] border bg-[#e8ecf2] px-3 py-[11px] text-base';

export function SaleDialog({ guitar, onClose }: { guitar: Guitar; onClose: () => void }) {
  const { dispatch } = useAppState();
  const { showToast } = useToast();
  const isEditing = Boolean(guitar.soldDate);
  const [soldDate, setSoldDate] = useState(guitar.soldDate ?? todayIso());
  const [soldPrice, setSoldPrice] = useState(guitar.soldPrice != null ? String(guitar.soldPrice) : '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!soldDate) return;
    setIsSaving(true);
    const updated = { ...guitar, soldDate, soldPrice: soldPrice.trim() === '' ? null : Number(soldPrice), updatedAt: new Date() };
    try {
      await saveSaleToAPI(updated);
      dispatch({ type: 'UPDATE_GUITAR', payload: updated });
      showToast(isEditing ? 'Sale details updated' : 'Guitar moved to archive', 'success');
      onClose();
    } catch {
      showToast('Could not save. Nothing was changed, so please try again.', 'error');
      setIsSaving(false);
    }
  };

  return (
    <Modal labelledBy="sale-dialog-title" onClose={onClose} initialFocus="input[name=soldDate]">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 id="sale-dialog-title" className="text-lg font-semibold">{isEditing ? 'Edit Sale Details' : 'Move to Archive'}</h2>
        <button onClick={onClose} aria-label="Close dialog" className="flex shrink-0 items-center justify-center w-11 h-11 rounded-lg hover:bg-surface-2 text-[#5c6680]"><X size={20} /></button>
      </div>
      {!isEditing && <p className="text-sm text-[#5c6680] mb-4">{guitar.maker} {guitar.model} will leave your dashboard and keep its maintenance history.</p>}
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 mb-6">
          <div>
            <label htmlFor="sold-date" className="block text-sm font-medium text-[#5c6680] mb-1.5">Date sold *</label>
            <input id="sold-date" name="soldDate" type="date" required max={todayIso()} value={soldDate} onChange={event => setSoldDate(event.target.value)} className={fieldClass} />
          </div>
          <div>
            <label htmlFor="sold-price" className="block text-sm font-medium text-[#5c6680] mb-1.5">Price (£)</label>
            <input id="sold-price" name="soldPrice" type="number" inputMode="decimal" min={0} max={99999999} step="0.01" value={soldPrice} onChange={event => setSoldPrice(event.target.value)} className={fieldClass} placeholder="Optional" />
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSaving}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={isSaving || !soldDate}>{isSaving ? 'Saving…' : isEditing ? 'Save Changes' : 'Move to Archive'}</button>
        </div>
      </form>
    </Modal>
  );
}
