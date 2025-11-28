import { Guitar, MaintenanceLog, GuitarWithStatus, MaintenanceStatus } from '@/types';

export const calculateMaintenanceStatus = (
  guitar: Guitar,
  maintenanceLogs: MaintenanceLog[]
): GuitarWithStatus => {
  const guitarLogs = maintenanceLogs
    .filter(log => log.guitarId === guitar.id)
    .sort((a, b) => b.maintenanceDate.getTime() - a.maintenanceDate.getTime());

  const lastMaintenanceDate = guitarLogs[0]?.maintenanceDate;
  const today = new Date();
  let daysSinceMaintenance = 0;
  let status: MaintenanceStatus = 'good';

  if (lastMaintenanceDate) {
    daysSinceMaintenance = Math.floor(
      (today.getTime() - lastMaintenanceDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceMaintenance > 180) {
      status = 'urgent';
    } else if (daysSinceMaintenance > 90) {
      status = 'warning';
    } else {
      status = 'good';
    }
  }

  return {
    ...guitar,
    lastMaintenanceDate,
    status,
    daysSinceMaintenance
  };
};

export const getStatusColor = (status: MaintenanceStatus): string => {
  switch (status) {
    case 'urgent':
      return 'text-red-600 bg-red-100';
    case 'warning':
      return 'text-orange-600 bg-orange-100';
    case 'good':
      return 'text-green-600 bg-green-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const getStatusText = (status: MaintenanceStatus): string => {
  switch (status) {
    case 'urgent':
      return 'Needs Maintenance';
    case 'warning':
      return 'Due Soon';
    case 'good':
      return 'Recently Maintained';
    default:
      return 'Unknown';
  }
};
