'use client';
import { GuitarRow } from '@/components/GuitarRow';
import { useAppState } from '@/hooks/useAppState';
import { calculateMaintenanceStatus } from '@/utils/maintenance';
import { useState } from 'react';

export default function Dashboard() {
  const { state } = useAppState();
  const [sortBy, setSortBy] = useState<'status' | 'name'>('status');
  
  // Calculate maintenance status for all guitars
  const guitarsWithStatus = state.guitars.map(guitar =>
    calculateMaintenanceStatus(guitar, state.maintenanceLogs)
  );

  // Sort based on selection
  const sortedGuitars = [...guitarsWithStatus].sort((a, b) => {
    if (sortBy === 'status') {
      const statusPriority = { urgent: 0, warning: 1, good: 2 } as const;
      return statusPriority[a.status] - statusPriority[b.status];
    }
    const aName = `${a.maker} ${a.model}`.toLowerCase();
    const bName = `${b.maker} ${b.model}`.toLowerCase();
    return aName.localeCompare(bName);
  });

  const urgentCount = sortedGuitars.filter(g => g.status === 'urgent').length;
  const warningCount = sortedGuitars.filter(g => g.status === 'warning').length;
  const goodCount = sortedGuitars.filter(g => g.status === 'good').length;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
              <p className="mt-1 text-sm text-gray-600">
                Overview of my guitar collection maintenance status
              </p>
            </div>
            <div className="text-sm text-gray-600">
              Sort by:
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'status' | 'name')}
                className="ml-2 border border-gray-300 rounded-md px-2 py-1 text-sm bg-white"
              >
                <option value="status">Status (Urgent first)</option>
                <option value="name">Name (A–Z)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card border-l-4 border-red-600 text-center">
            <h3 className="text-xl font-semibold text-red-700 mb-1">Urgent</h3>
            <div className="text-3xl font-bold text-red-600">{urgentCount}</div>
          </div>
          <div className="card border-l-4 border-orange-500 text-center">
            <h3 className="text-xl font-semibold text-orange-600 mb-1">Due Soon</h3>
            <div className="text-3xl font-bold text-orange-500">{warningCount}</div>
          </div>
          <div className="card border-l-4 border-green-600 text-center">
            <h3 className="text-xl font-semibold text-green-700 mb-1">Good</h3>
            <div className="text-3xl font-bold text-green-600">{goodCount}</div>
          </div>
        </div>

        {sortedGuitars.length === 0 ? (
          <div className="text-center py-12">
            <div className="card max-w-md mx-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No guitars in your collection
              </h3>
              <p className="text-gray-600 mb-4">
                Start by adding your first guitar to track maintenance.
              </p>
              
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedGuitars.map((guitar) => (
              <GuitarRow key={guitar.id} guitar={guitar} />
            ))}
          </div>
        )}
    </main>
  );
}
