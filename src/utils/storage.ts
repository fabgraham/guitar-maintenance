import { AppState, Guitar, MaintenanceLog } from '@/types';

const STORAGE_KEY = 'guitar-maintenance-app';

export const loadFromStorage = (): AppState => {
  if (typeof window === 'undefined') {
    return { guitars: [], maintenanceLogs: [], isLoading: false };
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        guitars: parsed.guitars?.map((g: any) => ({
          ...g,
          createdAt: new Date(g.createdAt),
          updatedAt: new Date(g.updatedAt)
        })) || [],
        maintenanceLogs: parsed.maintenanceLogs?.map((m: any) => ({
          ...m,
          maintenanceDate: new Date(m.maintenanceDate),
          createdAt: new Date(m.createdAt)
        })) || [],
        isLoading: false
      };
    }
  } catch (error) {
    console.error('Error loading from storage:', error);
  }
  
  return { guitars: [], maintenanceLogs: [], isLoading: false };
};

export const saveToStorage = (state: AppState): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving to storage:', error);
  }
};