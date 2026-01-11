'use client';

import Link from 'next/link';
import { Clock } from 'lucide-react';
import { GuitarWithStatus } from '@/types';
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
            <div className="flex items-center mb-1 flex-wrap gap-2">
              <Link href={`/guitar/${guitar.id}`} className="text-lg font-semibold text-gray-900 hover:text-primary-600">
                {guitar.maker} {guitar.model}
              </Link>
              {guitar.status === 'urgent' && (
                <>
                  <span className={cn('px-2 py-1 inline-flex text-xs font-medium rounded-full min-w-[60px] justify-center md:hidden', 'text-red-600 bg-red-100')}>Urgent</span>
                  <span className={cn('px-2 py-1 inline-flex text-xs font-medium rounded-full min-w-[120px] justify-center hidden md:inline-flex', 'text-red-600 bg-red-100')}>Needs Maintenance</span>
                </>
              )}
              {guitar.status === 'warning' && (
                <>
                  <span className={cn('px-2 py-1 inline-flex text-xs font-medium rounded-full min-w-[60px] justify-center md:hidden', 'text-orange-600 bg-orange-100')}>Due</span>
                  <span className={cn('px-2 py-1 inline-flex text-xs font-medium rounded-full min-w-[120px] justify-center hidden md:inline-flex', 'text-orange-600 bg-orange-100')}>Due Soon</span>
                </>
              )}
              {guitar.status === 'good' && (
                <>
                  <span className={cn('px-2 py-1 inline-flex text-xs font-medium rounded-full min-w-[60px] justify-center md:hidden', 'text-green-600 bg-green-100')}>Good</span>
                  <span className={cn('px-2 py-1 inline-flex text-xs font-medium rounded-full min-w-[120px] justify-center hidden md:inline-flex', 'text-green-600 bg-green-100')}>Recently Maintained</span>
                </>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3">
              {guitar.lastMaintenanceNotes || guitar.stringSpecs}
            </p>

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


      </div>
    </div>
  );
}
