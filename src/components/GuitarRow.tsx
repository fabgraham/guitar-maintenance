'use client';

import Link from 'next/link';
import { Calendar, Clock, ChevronRight } from 'lucide-react';
import { GuitarWithStatus } from '@/types';
import { getStatusColor, getStatusText } from '@/utils/maintenance';
import { cn } from '@/utils/cn';

interface GuitarRowProps {
  guitar: GuitarWithStatus;
}

export function GuitarRow({ guitar }: GuitarRowProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="card w-full">
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div>
            <div className="flex items-center mb-1">
              <h3 className="text-lg font-semibold text-gray-900 mr-3">
                {guitar.maker} {guitar.model}
              </h3>
              {guitar.status === 'urgent' && (
                <span className={cn('px-2 py-1 inline-flex text-xs font-medium rounded-full', 'text-red-600 bg-red-100')}>Needs Maintenance</span>
              )}
              {guitar.status === 'warning' && (
                <span className={cn('px-2 py-1 inline-flex text-xs font-medium rounded-full', 'text-orange-600 bg-orange-100')}>Due Soon</span>
              )}
              {guitar.status === 'good' && (
                <span className={cn('px-2 py-1 inline-flex text-xs font-medium rounded-full', 'text-green-600 bg-green-100')}>Recently Maintained</span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3">{guitar.stringSpecs}</p>

            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                {guitar.lastMaintenanceDate ? (
                  <span><span className="font-medium">Last work date:</span> {formatDate(guitar.lastMaintenanceDate)} ({guitar.daysSinceMaintenance} days)</span>
                ) : (
                  <span>No maintenance history</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <Link href={`/guitar/${guitar.id}`} className="text-primary-600 hover:text-primary-700 inline-flex items-center">
          View Details <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </div>
  );
}
