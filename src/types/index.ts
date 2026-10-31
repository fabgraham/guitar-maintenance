export interface Guitar {
  id: string;
  maker: string;
  model: string;
  year: string;
  createdAt: Date;
  updatedAt: Date;
  /** Sale date as YYYY-MM-DD. A guitar with a sold date is archived. */
  soldDate?: string | null;
  soldPrice?: number | null;
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
  isLoading: boolean;
  /** True when the collection could not be loaded from the server. */
  loadError?: boolean;
}

export type MaintenanceStatus = 'urgent' | 'warning' | 'good';

export interface GuitarWithStatus extends Guitar {
  lastMaintenanceDate?: Date;
  status: MaintenanceStatus;
  daysSinceMaintenance: number;
  lastMaintenanceNotes?: string;
}