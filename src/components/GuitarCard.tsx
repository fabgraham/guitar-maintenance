'use client';

import Link from 'next/link';
import { Calendar, Clock, Music } from 'lucide-react';
import { GuitarWithStatus } from '@/types';
import { getStatusColor, getStatusText } from '@/utils/maintenance';
import { cn } from '@/utils/cn';

interface GuitarCardProps {
  guitar: GuitarWithStatus;
}

export function GuitarCard({ guitar }: GuitarCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const formatDaysAgo = (days: number) => {
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days} days ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  return (
    <Link href={`/guitar/${guitar.id}`}>
      <div className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <Music className="w-5 h-5 text-gray-400 mr-2" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {guitar.maker} {guitar.model}
              </h3>
              <p className="text-sm text-gray-600">{guitar.stringSpecs}</p>
            </div>
          </div>
          <span
            className={cn(
              'px-2 py-1 rounded-full text-xs font-medium',
              getStatusColor(guitar.status)
            )}
          >
            {getStatusText(guitar.status)}
          </span>
        </div>

        <div className="space-y-2">
          {guitar.lastMaintenanceDate ? (
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span>
                Last maintenance: {formatDate(guitar.lastMaintenanceDate)}
              </span>
            </div>
          ) : (
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span>No maintenance history</span>
            </div>
          )}

          {guitar.daysSinceMaintenance > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              <span>{formatDaysAgo(guitar.daysSinceMaintenance)}</span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Added {formatDate(guitar.createdAt)}
            </span>
            <span className="text-primary-600 text-sm font-medium hover:text-primary-700">
              View Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}