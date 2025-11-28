export interface Guitar {
  id: string;
  maker: string;
  model: string;
  stringSpecs: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenanceLog {
  id: string;
  guitarId: string;
  maintenanceDate: Date;
  typeOfWork: string;
  notes: string;
  createdAt: Date;
}

export interface AppState {
  guitars: Guitar[];
  maintenanceLogs: MaintenanceLog[];
}

export type MaintenanceStatus = 'urgent' | 'warning' | 'good';

export interface GuitarWithStatus extends Guitar {
  lastMaintenanceDate?: Date;
  status: MaintenanceStatus;
  daysSinceMaintenance: number;
}