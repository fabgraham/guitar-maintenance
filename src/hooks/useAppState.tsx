'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, Guitar, MaintenanceLog } from '@/types';
import { loadFromStorage, saveToStorage } from '@/utils/storage';
import { seedGuitars, seedMaintenanceLogs } from '@/utils/seedData';
import { supabase } from '@/utils/supabase';

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
      if (supabase) {
        const g = action.payload;
        supabase.from('guitars').upsert({
          id: g.id,
          maker: g.maker,
          model: g.model,
          string_specs: g.stringSpecs,
          created_at: g.createdAt.toISOString(),
          updated_at: g.updatedAt.toISOString()
        });
      }
      break;
    case 'UPDATE_GUITAR':
      newState = {
        ...state,
        guitars: state.guitars.map(guitar =>
          guitar.id === action.payload.id ? action.payload : guitar
        )
      };
      if (supabase) {
        const g = action.payload;
        supabase.from('guitars').update({
          maker: g.maker,
          model: g.model,
          string_specs: g.stringSpecs,
          updated_at: g.updatedAt.toISOString()
        }).eq('id', g.id);
      }
      break;
    case 'DELETE_GUITAR':
      newState = {
        ...state,
        guitars: state.guitars.filter(guitar => guitar.id !== action.payload),
        maintenanceLogs: state.maintenanceLogs.filter(log => log.guitarId !== action.payload)
      };
      if (supabase) {
        supabase.from('maintenance_logs').delete().eq('guitar_id', action.payload);
        supabase.from('guitars').delete().eq('id', action.payload);
      }
      break;
    case 'ADD_MAINTENANCE_LOG':
      newState = {
        ...state,
        maintenanceLogs: [...state.maintenanceLogs, action.payload]
      };
      if (supabase) {
        const m = action.payload;
        supabase.from('maintenance_logs').upsert({
          id: m.id,
          guitar_id: m.guitarId,
          maintenance_date: m.maintenanceDate.toISOString(),
          type_of_work: m.typeOfWork,
          notes: m.notes,
          created_at: m.createdAt.toISOString()
        });
      }
      break;
    case 'UPDATE_MAINTENANCE_LOG':
      newState = {
        ...state,
        maintenanceLogs: state.maintenanceLogs.map(log =>
          log.id === action.payload.id ? action.payload : log
        )
      };
      if (supabase) {
        const m = action.payload;
        supabase.from('maintenance_logs').update({
          guitar_id: m.guitarId,
          maintenance_date: m.maintenanceDate.toISOString(),
          type_of_work: m.typeOfWork,
          notes: m.notes
        }).eq('id', m.id);
      }
      break;
    case 'DELETE_MAINTENANCE_LOG':
      newState = {
        ...state,
        maintenanceLogs: state.maintenanceLogs.filter(log => log.id !== action.payload)
      };
      if (supabase) {
        supabase.from('maintenance_logs').delete().eq('id', action.payload);
      }
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

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}>({ state: initialState, dispatch: () => null });

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const load = async () => {
      if (supabase) {
        const { data: g } = await supabase.from('guitars').select('*');
        const { data: m } = await supabase.from('maintenance_logs').select('*');
        const guitars: Guitar[] = (g || []).map((row: any) => ({
          id: row.id,
          maker: row.maker,
          model: row.model,
          stringSpecs: row.string_specs || '',
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at)
        }));
        const maintenanceLogs: MaintenanceLog[] = (m || []).map((row: any) => ({
          id: row.id,
          guitarId: row.guitar_id,
          maintenanceDate: new Date(row.maintenance_date),
          typeOfWork: row.type_of_work,
          notes: row.notes || '',
          createdAt: new Date(row.created_at)
        }));
        if (guitars.length === 0 && maintenanceLogs.length === 0) {
          const seedG = seedGuitars.map(g => ({
            id: g.id,
            maker: g.maker,
            model: g.model,
            string_specs: g.stringSpecs,
            created_at: g.createdAt.toISOString(),
            updated_at: g.updatedAt.toISOString()
          }));
          const seedM = seedMaintenanceLogs.map(m => ({
            id: m.id,
            guitar_id: m.guitarId,
            maintenance_date: m.maintenanceDate.toISOString(),
            type_of_work: m.typeOfWork,
            notes: m.notes,
            created_at: m.createdAt.toISOString()
          }));
          await supabase.from('guitars').upsert(seedG);
          await supabase.from('maintenance_logs').upsert(seedM);
          dispatch({ type: 'LOAD_STATE', payload: { guitars: seedGuitars, maintenanceLogs: seedMaintenanceLogs, isLoading: false } });
          return;
        }
        dispatch({ type: 'LOAD_STATE', payload: { guitars, maintenanceLogs, isLoading: false } });
        return;
      }
      const loadedState = loadFromStorage();
      if (loadedState.guitars.length > 0 || loadedState.maintenanceLogs.length > 0) {
        dispatch({ type: 'LOAD_STATE', payload: { ...loadedState, isLoading: false } });
      } else {
        dispatch({ type: 'LOAD_STATE', payload: { guitars: seedGuitars, maintenanceLogs: seedMaintenanceLogs, isLoading: false } });
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
