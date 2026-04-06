'use client';

import { useAppState } from '@/hooks/useAppState';
import { calculateMaintenanceStatus } from '@/utils/maintenance';
import { getStatusColor, getStatusText } from '@/utils/maintenance';
import { cn } from '@/utils/cn';
import { Music } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

interface GuitarListProps {
  onEditClick: (guitarId: string) => void;
}

export function GuitarList({ onEditClick }: GuitarListProps) {
  const { state } = useAppState();
  const router = useRouter();

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

  const getLastMaintenanceDate = (guitarId: string) => {
    const guitarLogs = state.maintenanceLogs
      .filter(log => log.guitarId === guitarId)
      .sort((a, b) => b.maintenanceDate.getTime() - a.maintenanceDate.getTime());
    return guitarLogs[0]?.maintenanceDate;
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
      {/* Mobile card view */}
      <div className="md:hidden space-y-4">
        {guitarsWithStatus.map((guitar) => (
          <Link
            key={guitar.id}
            href={`/guitar/${guitar.id}`}
            className="block border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-1">
              <span className="text-base font-medium text-gray-900 mr-2">
                {guitar.maker} {guitar.model}
              </span>
              <span
                className={cn(
                  'px-2 py-1 inline-flex text-xs font-medium rounded-full',
                  getStatusColor(guitar.status)
                )}
              >
                {getStatusText(guitar.status)}
              </span>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {(() => {
                const lastDate = getLastMaintenanceDate(guitar.id);
                return lastDate ? `Last maintenance: ${formatDate(lastDate)}` : 'No maintenance records';
              })()}
            </div>
          </Link>
        ))}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Guitar
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Maintenance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {guitarsWithStatus.map((guitar) => (
              <tr
                key={guitar.id}
                onClick={() => router.push(`/guitar/${guitar.id}`)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {guitar.maker} {guitar.model}
                    </span>
                    <div className="text-sm text-gray-500">
                      Added {formatDate(guitar.createdAt)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {(() => {
                    const lastDate = getLastMaintenanceDate(guitar.id);
                    return lastDate ? formatDate(lastDate) : '—';
                  })()}
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
