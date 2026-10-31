import { AppState, Guitar, MaintenanceLog } from '@/types';

export function parseBackup(value: unknown): AppState {
  const data = value as AppState;
  if (!data || !Array.isArray(data.guitars) || !Array.isArray(data.maintenanceLogs)) {
    throw new Error('Invalid backup');
  }
  const date = (value: unknown): Date => {
    if (typeof value !== 'string') throw new Error('Invalid date');
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) throw new Error('Invalid date');
    return parsed;
  };
  const text = (value: unknown): string => {
    if (typeof value !== 'string') throw new Error('Invalid field');
    return value;
  };
  const guitars: Guitar[] = data.guitars.map(guitar => ({
    id: text(guitar.id), maker: text(guitar.maker), model: text(guitar.model), year: text(guitar.year ?? ''),
    createdAt: date(guitar.createdAt), updatedAt: date(guitar.updatedAt),
    soldDate: guitar.soldDate ? text(guitar.soldDate) : null,
    soldPrice: typeof guitar.soldPrice === 'number' ? guitar.soldPrice : null,
  }));
  const ids = new Set(guitars.map(guitar => guitar.id));
  if (ids.size !== guitars.length || guitars.some(guitar => !guitar.id || !guitar.maker.trim() || !guitar.model.trim())) throw new Error('Invalid guitars');
  const maintenanceLogs: MaintenanceLog[] = data.maintenanceLogs.map(log => {
    if (!ids.has(log.guitarId)) throw new Error('Missing guitar');
    return {
      id: text(log.id), guitarId: text(log.guitarId), typeOfWork: text(log.typeOfWork), notes: text(log.notes ?? ''),
      maintenanceDate: date(log.maintenanceDate), createdAt: date(log.createdAt),
    };
  });
  if (new Set(maintenanceLogs.map(log => log.id)).size !== maintenanceLogs.length || maintenanceLogs.some(log => !log.id || !log.typeOfWork.trim())) throw new Error('Invalid logs');
  return { guitars, maintenanceLogs, isLoading: false };
}
