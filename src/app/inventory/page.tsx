'use client';

import { Suspense, useState } from 'react';
import { GuitarForm } from '@/components/GuitarForm';
import { GuitarList } from '@/components/GuitarList';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { Plus } from 'lucide-react';

export default function Inventory() {
  const [showForm, setShowForm] = useState(false);
  const [editingGuitar, setEditingGuitar] = useState<string | null>(null);

  const handleAddClick = () => {
    setEditingGuitar(null);
    setShowForm(true);
  };

  const handleEditClick = (guitarId: string) => {
    setEditingGuitar(guitarId);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingGuitar(null);
  };

  return (
    <main className="page-shell">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
        <p className="section-label mb-2">Your instruments</p>
        <h1 className="page-title">
          Collection
        </h1>
        </div>
        <button
          onClick={handleAddClick}
          className="btn btn-primary"
          style={{
            background: '#2853bd',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '9px 16px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 4,
          }}
        >
          <Plus size={14} />
          Add Guitar
        </button>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <GuitarList onEditClick={handleEditClick} />
      </Suspense>

      {showForm && (
        <GuitarForm
          guitarId={editingGuitar}
          onClose={handleFormClose}
        />
      )}
    </main>
  );
}
