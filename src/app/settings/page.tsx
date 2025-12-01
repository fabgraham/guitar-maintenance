'use client';

import { useState } from 'react';
import { useAppState } from '@/hooks/useAppState';
import { useToast } from '@/contexts/ToastContext';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Trash2, Download, Upload, Database } from 'lucide-react';
import { seedGuitars, seedMaintenanceLogs } from '@/utils/seedData';

export default function Settings() {
  const { state, dispatch } = useAppState();
  const { showToast } = useToast();
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmImport, setConfirmImport] = useState(false);
  const [confirmSeed, setConfirmSeed] = useState(false);
  const [pendingImportData, setPendingImportData] = useState<any>(null);

  const handleClearAllData = () => {
    setConfirmClear(true);
  };

  const confirmClearAllData = () => {
    // Clear localStorage
    localStorage.removeItem('guitar-maintenance-app');

    // Reset state
    dispatch({
      type: 'LOAD_STATE',
      payload: { guitars: [], maintenanceLogs: [], isLoading: false }
    });

    showToast('All data has been cleared', 'success');
    setConfirmClear(false);
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `guitar-maintenance-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);

        // Validate the imported data structure
        if (!importedData.guitars || !importedData.maintenanceLogs) {
          showToast('Invalid file format. Please select a valid backup file.', 'error');
          return;
        }

        // Store for confirmation
        setPendingImportData(importedData);
        setConfirmImport(true);
      } catch (error) {
        showToast('Error importing data. Please check the file format.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const confirmImportData = () => {
    // Parse dates from strings
    const parsedData = {
      guitars: pendingImportData.guitars.map((g: any) => ({
        ...g,
        createdAt: new Date(g.createdAt),
        updatedAt: new Date(g.updatedAt)
      })),
      maintenanceLogs: pendingImportData.maintenanceLogs.map((m: any) => ({
        ...m,
        maintenanceDate: new Date(m.maintenanceDate),
        createdAt: new Date(m.createdAt)
      })),
      isLoading: false
    };

    dispatch({ type: 'LOAD_STATE', payload: parsedData });
    showToast('Data imported successfully!', 'success');
    setConfirmImport(false);
    setPendingImportData(null);
  };

  const handleSeedSampleData = () => {
    setConfirmSeed(true);
  };

  const confirmSeedSampleData = () => {
    dispatch({
      type: 'LOAD_STATE',
      payload: { guitars: seedGuitars, maintenanceLogs: seedMaintenanceLogs, isLoading: false }
    });

    showToast('Sample data added successfully!', 'success');
    setConfirmSeed(false);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage your application preferences and data
          </p>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Data Management</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Seed Sample Data</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Add sample guitars and maintenance logs to test the application.
                </p>
                <button
                  onClick={handleSeedSampleData}
                  className="btn btn-secondary inline-flex items-center"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Add Sample Data
                </button>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Export Data</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Download a backup of all your guitars and maintenance logs as a JSON file.
                </p>
                <button
                  onClick={handleExportData}
                  className="btn btn-secondary inline-flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </button>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Import Data</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Restore your data from a previously exported JSON file.
                </p>
                <div className="flex items-center">
                  <Upload className="w-4 h-4 text-gray-400 mr-2" />
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-red-700 mb-2">Clear All Data</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Permanently delete all guitars and maintenance logs. This action cannot be undone.
                </p>
                <button
                  onClick={handleClearAllData}
                  className="btn btn-danger inline-flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Data
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Application Statistics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {state.guitars.length}
                </div>
                <div className="text-sm text-gray-600">Guitars</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {state.maintenanceLogs.length}
                </div>
                <div className="text-sm text-gray-600">Maintenance Logs</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {state.guitars.length > 0 ? Math.round(state.maintenanceLogs.length / state.guitars.length * 10) / 10 : 0}
                </div>
                <div className="text-sm text-gray-600">Avg Logs per Guitar</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">About</h3>
            
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>Guitar Maintenance Dashboard</strong> helps you track the maintenance status of your guitar collection.
              </p>
              <p>
                The application uses color-coded status indicators:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><span className="text-red-600 font-medium">Red</span>: Needs maintenance (&gt;6 months)</li>
                <li><span className="text-yellow-600 font-medium">Yellow</span>: Due soon (3-6 months)</li>
                <li><span className="text-green-600 font-medium">Green</span>: Recently maintained (&lt;3 months)</li>
              </ul>
              <p>
                All data is stored locally in your browser using localStorage.
              </p>
            </div>
          </div>
        </div>

        <ConfirmDialog
          isOpen={confirmClear}
          title="Clear All Data"
          description="Are you sure you want to clear all data? This will delete all guitars and maintenance logs. This action cannot be undone."
          confirmText="Clear All Data"
          onConfirm={confirmClearAllData}
          onCancel={() => setConfirmClear(false)}
        />

        <ConfirmDialog
          isOpen={confirmImport}
          title="Import Data"
          description="This will replace all existing data. Are you sure you want to continue?"
          confirmText="Import Data"
          onConfirm={confirmImportData}
          onCancel={() => {
            setConfirmImport(false);
            setPendingImportData(null);
          }}
        />

        <ConfirmDialog
          isOpen={confirmSeed}
          title="Add Sample Data"
          description="This will add sample guitars and maintenance logs to your collection. Continue?"
          confirmText="Add Sample Data"
          onConfirm={confirmSeedSampleData}
          onCancel={() => setConfirmSeed(false)}
        />
    </main>
  );
}
