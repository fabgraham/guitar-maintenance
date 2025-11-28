'use client';

import { MaintenanceLog } from '@/types';
import { Edit, Trash2, Calendar, Wrench } from 'lucide-react';
import { useAppState } from '@/hooks/useAppState';
import { useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';

interface MaintenanceLogListProps {
  logs: MaintenanceLog[];
  onEditClick: (logId: string) => void;
}

export function MaintenanceLogList({ logs, onEditClick }: MaintenanceLogListProps) {
  const { dispatch } = useAppState();
  const [confirmingLogId, setConfirmingLogId] = useState<string | null>(null);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  if (logs.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No maintenance history
          </h3>
          <p className="text-gray-600">
            Add your first maintenance log to start tracking this guitar&apos;s maintenance history.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <div key={log.id} className="card">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Calendar className="w-5 h-5 text-gray-400 mt-1" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-lg font-medium text-gray-900">
                    {log.typeOfWork}
                  </h4>
                  <span className="text-sm text-gray-500">
                    {formatDate(log.maintenanceDate)}
                  </span>
                </div>
                {log.notes && (
                  <p className="text-gray-600 mb-2">{log.notes}</p>
                )}
                
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEditClick(log.id)}
                className="text-gray-600 hover:text-gray-900"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => setConfirmingLogId(log.id)}
                className="bg-red-600 hover:bg-red-700 text-white rounded-full p-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <ConfirmDialog
            isOpen={confirmingLogId === log.id}
            title="Delete Maintenance Item"
            description="This will delete the selected maintenance entry. This action cannot be undone."
            confirmText="Delete"
            onConfirm={() => {
              setConfirmingLogId(null);
              dispatch({ type: 'DELETE_MAINTENANCE_LOG', payload: log.id });
            }}
            onCancel={() => setConfirmingLogId(null)}
          />
        </div>
      ))}
    </div>
  );
}
