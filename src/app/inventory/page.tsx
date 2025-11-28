'use client';

import { useState } from 'react';
import { GuitarForm } from '@/components/GuitarForm';
import { GuitarList } from '@/components/GuitarList';
import { useAppState } from '@/hooks/useAppState';
import { Plus } from 'lucide-react';

export default function Inventory() {
  const { state } = useAppState();
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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Inventory</h2>
              <p className="mt-1 text-sm text-gray-600">
                My current guitars
              </p>
            </div>
            <button
              onClick={handleAddClick}
              className="btn btn-primary inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Guitar
            </button>
          </div>
        </div>

        {showForm ? (
          <GuitarForm
            guitarId={editingGuitar}
            onClose={handleFormClose}
          />
        ) : (
          <GuitarList onEditClick={handleEditClick} />
        )}
    </main>
  );
}
