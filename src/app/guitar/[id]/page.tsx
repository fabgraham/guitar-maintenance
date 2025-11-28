'use client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const dynamicParams = true;

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MaintenanceLogForm } from '@/components/MaintenanceLogForm';
import { MaintenanceLogList } from '@/components/MaintenanceLogList';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useAppState } from '@/hooks/useAppState';
import { calculateMaintenanceStatus } from '@/utils/maintenance';
import { getStatusColor, getStatusText } from '@/utils/maintenance';
import { ArrowLeft, Calendar, Clock, Music, Plus, Settings, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/utils/cn';

export default function GuitarDetail() {
  const params = useParams();
  const router = useRouter();
  const { state, dispatch } = useAppState();
  const [showLogForm, setShowLogForm] = useState(false);
  const [editingLog, setEditingLog] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const guitarId = params.id as string;
  const guitar = state.guitars.find(g => g.id === guitarId);
  
  if (state.isLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading guitar details...</p>
        </div>
      </main>
    );
  }

  if (!guitar) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Guitar not found</h2>
            <Link href="/" className="btn btn-primary">
              Back to Dashboard
            </Link>
          </div>
      </main>
    );
  }

  const guitarWithStatus = calculateMaintenanceStatus(guitar, state.maintenanceLogs);
  const guitarLogs = state.maintenanceLogs
    .filter(log => log.guitarId === guitarId)
    .sort((a, b) => b.maintenanceDate.getTime() - a.maintenanceDate.getTime());

  const handleDeleteGuitar = () => {
    setShowDeleteConfirm(true);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center space-x-3">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {guitar.maker} {guitar.model}
                  </h2>
                  <p className="text-gray-600">{guitarLogs[0]?.notes || guitar.stringSpecs}</p>
                </div>
                <span
                  className={cn(
                    'px-3 py-1 inline-flex rounded-full text-sm font-medium',
                    getStatusColor(guitarWithStatus.status)
                  )}
                >
                  {getStatusText(guitarWithStatus.status)}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleDeleteGuitar}
                className="bg-red-600 hover:bg-red-700 text-white rounded-full p-2"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <ConfirmDialog
            isOpen={showDeleteConfirm}
            title="Delete Guitar"
            description="This will delete the guitar and all its maintenance logs. This action cannot be undone."
            confirmText="Delete"
            onConfirm={() => {
              setShowDeleteConfirm(false);
              dispatch({ type: 'DELETE_GUITAR', payload: guitarId });
              router.push('/');
            }}
            onCancel={() => setShowDeleteConfirm(false)}
          />

          {guitarWithStatus.lastMaintenanceDate && (
            <div className="card mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    Last Work Date
                  </h3>
                  <p className="text-gray-600">
                    {formatDate(guitarWithStatus.lastMaintenanceDate)}{' '}
                    ({guitarWithStatus.daysSinceMaintenance} days ago)
                  </p>
                </div>
                
              </div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Maintenance History</h3>
            <button
              onClick={() => setShowLogForm(true)}
              className="btn btn-primary inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </button>
          </div>

          {showLogForm && (
            <MaintenanceLogForm
              guitarId={guitarId}
              logId={editingLog}
              onClose={() => {
                setShowLogForm(false);
                setEditingLog(null);
              }}
            />
          )}

          <MaintenanceLogList
            logs={guitarLogs}
            onEditClick={(logId) => {
              setEditingLog(logId);
              setShowLogForm(true);
            }}
          />
        </div>
    </main>
  );
}
