'use client';

import { useState } from 'react';
import { GuitarForm } from '@/components/GuitarForm';
import { GuitarList } from '@/components/GuitarList';
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
    <main style={{ padding: 28, minHeight: '100vh' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#181e2e', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          Collection
        </h1>
        <button
          onClick={handleAddClick}
          style={{
            background: '#4d7cf6',
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

      <GuitarList onEditClick={handleEditClick} />

      {showForm && (
        <GuitarForm
          guitarId={editingGuitar}
          onClose={handleFormClose}
        />
      )}
    </main>
  );
}
