'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, Guitar, MaintenanceLog } from '@/types';
import { hasStoredState, loadFromStorage, saveToStorage } from '@/utils/storage';
import { createPreviewState, isLocalPreview } from '@/utils/preview';

type AppAction =
  | { type: 'ADD_GUITAR'; payload: Guitar }
  | { type: 'UPDATE_GUITAR'; payload: Guitar }
  | { type: 'DELETE_GUITAR'; payload: string }
  | { type: 'ADD_MAINTENANCE_LOG'; payload: MaintenanceLog }
  | { type: 'UPDATE_MAINTENANCE_LOG'; payload: MaintenanceLog }
  | { type: 'DELETE_MAINTENANCE_LOG'; payload: string }
  | { type: 'LOAD_STATE'; payload: AppState };

const initialState: AppState = {
  guitars: [],
  maintenanceLogs: [],
  isLoading: true
};

function appReducer(state: AppState, action: AppAction): AppState {
  let newState: AppState;

  switch (action.type) {
    case 'ADD_GUITAR':
      newState = {
        ...state,
        guitars: [...state.guitars, action.payload],
        isLoading: false
      };
      break;
    case 'UPDATE_GUITAR':
      newState = {
        ...state,
        guitars: state.guitars.map(guitar =>
          guitar.id === action.payload.id ? action.payload : guitar
        )
      };
      break;
    case 'DELETE_GUITAR':
      newState = {
        ...state,
        guitars: state.guitars.filter(guitar => guitar.id !== action.payload),
        maintenanceLogs: state.maintenanceLogs.filter(log => log.guitarId !== action.payload)
      };
      break;
    case 'ADD_MAINTENANCE_LOG':
      newState = {
        ...state,
        maintenanceLogs: [...state.maintenanceLogs, action.payload]
      };
      break;
    case 'UPDATE_MAINTENANCE_LOG':
      newState = {
        ...state,
        maintenanceLogs: state.maintenanceLogs.map(log =>
          log.id === action.payload.id ? action.payload : log
        )
      };
      break;
    case 'DELETE_MAINTENANCE_LOG':
      newState = {
        ...state,
        maintenanceLogs: state.maintenanceLogs.filter(log => log.id !== action.payload)
      };
      break;
    case 'LOAD_STATE':
      newState = { ...action.payload, isLoading: false };
      break;
    default:
      return state;
  }

  // Save to localStorage
  saveToStorage(newState);
  return newState;
}

function parseGuitar(r: any): Guitar {
  return {
    id: r.id,
    maker: r.maker,
    model: r.model,
    year: r.year || '',
    createdAt: new Date(r.createdAt),
    updatedAt: new Date(r.updatedAt),
    soldDate: r.soldDate ?? null,
    soldPrice: r.soldPrice ?? null,
  };
}

function parseLog(r: any): MaintenanceLog {
  return {
    id: r.id,
    guitarId: r.guitarId,
    maintenanceDate: new Date(r.maintenanceDate),
    typeOfWork: r.typeOfWork,
    notes: r.notes || '',
    createdAt: new Date(r.createdAt),
  };
}

export async function syncGuitarToAPI(guitar: Guitar): Promise<void> {
  if (isLocalPreview) return;
  const response = await fetch(`/api/guitars/${guitar.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      maker: guitar.maker,
      model: guitar.model,
      year: guitar.year,
      updatedAt: guitar.updatedAt.toISOString(),
    }),
  });
  if (!response.ok) throw new Error('Could not update guitar');
}

export async function saveSaleToAPI(guitar: Guitar): Promise<void> {
  if (isLocalPreview) return;
  const response = await fetch(`/api/guitars/${guitar.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      soldDate: guitar.soldDate ?? null,
      soldPrice: guitar.soldPrice ?? null,
      updatedAt: guitar.updatedAt.toISOString(),
    }),
  });
  if (!response.ok) throw new Error('Could not save sale details');
}

export async function addGuitarToAPI(guitar: Guitar): Promise<void> {
  if (isLocalPreview) return;
  const response = await fetch('/api/guitars', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: guitar.id,
      maker: guitar.maker,
      model: guitar.model,
      year: guitar.year,
      createdAt: guitar.createdAt.toISOString(),
      updatedAt: guitar.updatedAt.toISOString(),
    }),
  });
  if (!response.ok) throw new Error('Could not add guitar');
}

export async function deleteGuitarFromAPI(guitarId: string): Promise<void> {
  if (isLocalPreview) return;
  const response = await fetch(`/api/guitars/${guitarId}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Could not delete guitar');
}

export async function syncMaintenanceLogToAPI(log: MaintenanceLog): Promise<void> {
  if (isLocalPreview) return;
  const response = await fetch(`/api/maintenance-logs/${log.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      guitarId: log.guitarId,
      maintenanceDate: log.maintenanceDate.toISOString(),
      typeOfWork: log.typeOfWork,
      notes: log.notes,
    }),
  });
  if (!response.ok) throw new Error('Could not update maintenance log');
}

export async function addMaintenanceLogToAPI(log: MaintenanceLog): Promise<void> {
  if (isLocalPreview) return;
  const response = await fetch('/api/maintenance-logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: log.id,
      guitarId: log.guitarId,
      maintenanceDate: log.maintenanceDate.toISOString(),
      typeOfWork: log.typeOfWork,
      notes: log.notes,
      createdAt: log.createdAt.toISOString(),
    }),
  });
  if (!response.ok) throw new Error('Could not add maintenance log');
}

export async function deleteMaintenanceLogFromAPI(logId: string): Promise<void> {
  if (isLocalPreview) return;
  const response = await fetch(`/api/maintenance-logs/${logId}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Could not delete maintenance log');
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}>({ state: initialState, dispatch: () => null });

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    if (isLocalPreview) {
      dispatch({ type: 'LOAD_STATE', payload: hasStoredState() ? loadFromStorage() : createPreviewState() });
      return;
    }
    const load = async () => {
      try {
        const [gRes, mRes] = await Promise.all([
          fetch('/api/guitars'),
          fetch('/api/maintenance-logs'),
        ]);

        if (!gRes.ok || !mRes.ok) throw new Error('API unavailable');

        const gData = await gRes.json();
        const mData = await mRes.json();

        const guitars: Guitar[] = gData.map(parseGuitar);
        const maintenanceLogs: MaintenanceLog[] = mData.map(parseLog);

        dispatch({ type: 'LOAD_STATE', payload: { guitars, maintenanceLogs, isLoading: false } });
      } catch {
        dispatch({ type: 'LOAD_STATE', payload: { ...loadFromStorage(), isLoading: false, loadError: true } });
      }
    };
    load();
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppState = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within AppProvider');
  }
  return context;
};
