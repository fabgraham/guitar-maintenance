'use client';

import { useAppState } from '@/hooks/useAppState';
import { calculateMaintenanceStatus } from '@/utils/maintenance';
import { getStatusColor, getStatusText } from '@/utils/maintenance';
import { cn } from '@/utils/cn';
import { Edit, Trash2, Music } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';

interface GuitarListProps {
  onEditClick: (guitarId: string) => void;
}

export function GuitarList({ onEditClick }: GuitarListProps) {
  const { state, dispatch } = useAppState();
  const [confirmingGuitarId, setConfirmingGuitarId] = useState<string | null>(null);

  const openDeleteConfirm = (guitarId: string) => {
    setConfirmingGuitarId(guitarId);
  };

  const guitarsWithStatus = state.guitars.map(guitar =>
    calculateMaintenanceStatus(guitar, state.maintenanceLogs)
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  if (guitarsWithStatus.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="card max-w-md mx-auto">
          <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No guitars in your collection
          </h3>
          <p className="text-gray-600 mb-4">
            Start by adding your first guitar to track maintenance.
          </p>
          <button
            onClick={() => onEditClick('')}
            className="btn btn-primary"
          >
            Add Your First Guitar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Guitar
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                String Specs
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Maintenance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {guitarsWithStatus.map((guitar) => (
              <tr key={guitar.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {guitar.maker} {guitar.model}
                    </div>
                    <div className="text-sm text-gray-500">
                      Added {formatDate(guitar.createdAt)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {guitar.stringSpecs}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={cn(
                      'px-2 py-1 inline-flex text-xs font-medium rounded-full',
                      getStatusColor(guitar.status)
                    )}
                  >
                    {getStatusText(guitar.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {guitar.lastMaintenanceDate ? (
                    <div>
                      <div>{formatDate(guitar.lastMaintenanceDate)}</div>
                      <div className="text-gray-500">
                        {guitar.daysSinceMaintenance} days ago
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-500">No history</span>
                  )}
                </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div className="flex items-center space-x-2">
                <Link
                  href={`/guitar/${guitar.id}`}
                  className="text-primary-600 hover:text-primary-900"
                >
                  View
                </Link>
                <button
                  onClick={() => onEditClick(guitar.id)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openDeleteConfirm(guitar.id)}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-full p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        isOpen={!!confirmingGuitarId}
        title="Delete Guitar"
        description="This will delete the guitar and all its maintenance logs. This action cannot be undone."
        confirmText="Delete"
        onConfirm={() => {
          if (confirmingGuitarId) {
            dispatch({ type: 'DELETE_GUITAR', payload: confirmingGuitarId });
          }
          setConfirmingGuitarId(null);
        }}
        onCancel={() => setConfirmingGuitarId(null)}
      />
    </div>
  );
}
