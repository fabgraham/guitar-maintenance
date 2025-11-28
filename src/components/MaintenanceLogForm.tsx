'use client';

import { useState, useEffect } from 'react';
import { useAppState } from '@/hooks/useAppState';
import { MaintenanceLog } from '@/types';
import { X } from 'lucide-react';

interface MaintenanceLogFormProps {
  guitarId: string;
  logId?: string | null;
  onClose: () => void;
}

export function MaintenanceLogForm({ guitarId, logId, onClose }: MaintenanceLogFormProps) {
  const { state, dispatch } = useAppState();
  const [formData, setFormData] = useState({
    maintenanceDate: new Date().toISOString().split('T')[0],
    typeOfWork: '',
    notes: '',
  });

  useEffect(() => {
    if (logId) {
      const log = state.maintenanceLogs.find(l => l.id === logId);
      if (log) {
        setFormData({
          maintenanceDate: log.maintenanceDate.toISOString().split('T')[0],
          typeOfWork: log.typeOfWork,
          notes: log.notes,
        });
      }
    }
  }, [logId, state.maintenanceLogs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.typeOfWork.trim()) {
      alert('Please fill in the type of work');
      return;
    }

    const now = new Date();
    const maintenanceDate = new Date(formData.maintenanceDate);
    
    if (logId) {
      // Update existing log
      const existingLog = state.maintenanceLogs.find(l => l.id === logId)!;
      const updatedLog: MaintenanceLog = {
        ...existingLog,
        maintenanceDate,
        typeOfWork: formData.typeOfWork,
        notes: formData.notes,
      };
      dispatch({ type: 'UPDATE_MAINTENANCE_LOG', payload: updatedLog });
    } else {
      // Add new log
      const newLog: MaintenanceLog = {
        id: Date.now().toString(),
        guitarId,
        maintenanceDate,
        typeOfWork: formData.typeOfWork,
        notes: formData.notes,
        createdAt: now,
      };
      dispatch({ type: 'ADD_MAINTENANCE_LOG', payload: newLog });
    }
    
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
            {logId ? 'Edit Maintenance Item' : 'Add Maintenance Item'}
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
            <label htmlFor="maintenanceDate" className="block text-sm font-medium text-gray-700 mb-1">
              Maintenance Date *
            </label>
            <input
              type="date"
              id="maintenanceDate"
              name="maintenanceDate"
              value={formData.maintenanceDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
              required
            />
          </div>

          <div>
            <label htmlFor="typeOfWork" className="block text-sm font-medium text-gray-700 mb-1">
              Type of Work *
            </label>
            <input
              type="text"
              id="typeOfWork"
              name="typeOfWork"
              value={formData.typeOfWork}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
              placeholder="e.g., String replacement, Setup, Cleaning"
              required
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
              placeholder="Additional details about the maintenance..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {logId ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
