import { AppState } from '@/types';

export const isLocalPreview = process.env.NEXT_PUBLIC_LOCAL_PREVIEW === '1';

export function createPreviewState(): AppState {
  const now = new Date();
  const daysAgo = (days: number) => new Date(now.getTime() - days * 86400000);
  return {
    isLoading: false,
    guitars: [
      { id: 'demo-strat', maker: 'Fender', model: 'Stratocaster', year: '2021', createdAt: daysAgo(365), updatedAt: daysAgo(21) },
      { id: 'demo-les-paul', maker: 'Gibson', model: 'Les Paul Studio', year: '2018', createdAt: daysAgo(365), updatedAt: daysAgo(150) },
      { id: 'demo-acoustic', maker: 'Yamaha', model: 'FG800 Acoustic', year: '2020', createdAt: daysAgo(365), updatedAt: daysAgo(225) },
      { id: 'demo-gretsch', maker: 'Gretsch', model: 'Electromatic', year: '2023', createdAt: daysAgo(10), updatedAt: daysAgo(10) },
    ],
    maintenanceLogs: [
      { id: 'demo-log-1', guitarId: 'demo-strat', maintenanceDate: daysAgo(21), typeOfWork: 'String change and setup', notes: 'Fresh 10–46 strings, fretboard cleaned and action checked.', createdAt: daysAgo(21) },
      { id: 'demo-log-2', guitarId: 'demo-les-paul', maintenanceDate: daysAgo(150), typeOfWork: 'String change', notes: 'Fitted 10–46 strings. Check intonation at the next service.', createdAt: daysAgo(150) },
      { id: 'demo-log-3', guitarId: 'demo-acoustic', maintenanceDate: daysAgo(225), typeOfWork: 'General maintenance', notes: 'New 12–53 acoustic strings and a fretboard clean.', createdAt: daysAgo(225) },
      { id: 'demo-log-4', guitarId: 'demo-strat', maintenanceDate: daysAgo(200), typeOfWork: 'Fretboard clean', notes: 'Cleaned and conditioned the fretboard.', createdAt: daysAgo(200) },
    ],
  };
}
