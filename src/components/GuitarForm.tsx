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

export function GuitarForm({ guitarId, onClose }: GuitarFormProps) {
  const { state, dispatch } = useAppState();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    maker: '',
    model: '',
    stringSpecs: '',
  });

  useEffect(() => {
    if (guitarId) {
      const guitar = state.guitars.find(g => g.id === guitarId);
      if (guitar) {
        setFormData({
          maker: guitar.maker,
          model: guitar.model,
          stringSpecs: guitar.stringSpecs,
        });
      }
    }
  }, [guitarId, state.guitars]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.maker.trim() || !formData.model.trim()) {
      showToast('Please fill in maker and model fields', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date();
      let guitarToSync: Guitar;

      if (guitarId) {
        // Update existing guitar
        const existingGuitar = state.guitars.find(g => g.id === guitarId)!;
        const updatedGuitar: Guitar = {
          ...existingGuitar,
          ...formData,
          updatedAt: now,
        };
        guitarToSync = updatedGuitar;

        // Optimistic update to localStorage
        dispatch({ type: 'UPDATE_GUITAR', payload: updatedGuitar });
      } else {
        // Add new guitar
        const newGuitar: Guitar = {
          id: Date.now().toString(),
          ...formData,
          createdAt: now,
          updatedAt: now,
        };
        guitarToSync = newGuitar;

        // Optimistic update to localStorage
        dispatch({ type: 'ADD_GUITAR', payload: newGuitar });
      }

      // Background sync to Supabase with error handling
      const { error } = await syncGuitarToSupabase(guitarToSync);

      if (error) {
        console.error('Supabase sync error:', error);
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
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">
            {guitarId ? 'Edit Guitar' : 'Add New Guitar'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="maker" className="block text-sm font-medium text-gray-700 mb-1">
              Maker *
            </label>
            <input
              type="text"
              id="maker"
              name="maker"
              value={formData.maker}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
              placeholder="e.g., Fender, Gibson, PRS"
              required
            />
          </div>

          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
              Model *
            </label>
            <input
              type="text"
              id="model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
              placeholder="e.g., Stratocaster, Les Paul, Custom 24"
              required
            />
          </div>

          <div>
            <label htmlFor="stringSpecs" className="block text-sm font-medium text-gray-700 mb-1">
              String Specifications
            </label>
            <input
              type="text"
              id="stringSpecs"
              name="stringSpecs"
              value={formData.stringSpecs}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
              placeholder="e.g., 009-046 Daddario (regular)"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (guitarId ? 'Update Guitar' : 'Add Guitar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}