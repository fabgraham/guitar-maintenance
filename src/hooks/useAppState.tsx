'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, Guitar, MaintenanceLog } from '@/types';
import { loadFromStorage, saveToStorage } from '@/utils/storage';
import { seedGuitars, seedMaintenanceLogs } from '@/utils/seedData';

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
  maintenanceLogs: []
};

function appReducer(state: AppState, action: AppAction): AppState {
  let newState: AppState;

  switch (action.type) {
    case 'ADD_GUITAR':
      newState = {
        ...state,
        guitars: [...state.guitars, action.payload]
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
      newState = action.payload;
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
    // Load initial state from localStorage
    const loadedState = loadFromStorage();
    if (loadedState.guitars.length > 0 || loadedState.maintenanceLogs.length > 0) {
      dispatch({ type: 'LOAD_STATE', payload: loadedState });
    } else {
      dispatch({
        type: 'LOAD_STATE',
        payload: { guitars: seedGuitars, maintenanceLogs: seedMaintenanceLogs }
      });
    }
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
