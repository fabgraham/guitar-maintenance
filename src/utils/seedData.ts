import { Guitar, MaintenanceLog } from '@/types';

const parseMonthYear = (tag: string): Date => {
  const [rawMonth, rawYear] = tag.split('/');
  const m = rawMonth.trim().toLowerCase();
  const monthMap: Record<string, number> = {
    jan: 0,
    january: 0,
    feb: 1,
    february: 1,
    mar: 2,
    march: 2,
    apr: 3,
    april: 3,
    may: 4,
    jun: 5,
    june: 5,
    jul: 6,
    july: 6,
    aug: 7,
    august: 7,
    sep: 8,
    sept: 8,
    september: 8,
    oct: 9,
    october: 9,
    nov: 10,
    november: 10,
    dec: 11,
    december: 11,
  };
  const month = monthMap[m] ?? 0;
  const year = 2000 + Number(rawYear.trim());
  return new Date(year, month, 1);
};

const makeGuitar = (
  id: string,
  maker: string,
  model: string,
  stringSpecs: string,
  lastTag: string
): Guitar => {
  const last = parseMonthYear(lastTag);
  const created = new Date(last.getTime() - 1000 * 60 * 60 * 24 * 30);
  return {
    id,
    maker,
    model,
    stringSpecs,
    createdAt: created,
    updatedAt: last,
  };
};

const makeLog = (
  id: string,
  guitarId: string,
  maintenanceTag: string,
  typeOfWork: string,
  notes: string
): MaintenanceLog => {
  const date = parseMonthYear(maintenanceTag);
  return {
    id,
    guitarId,
    maintenanceDate: date,
    typeOfWork,
    notes,
    createdAt: date,
  };
};

export const seedGuitars: Guitar[] = [
  makeGuitar('1', 'Fender', 'Strat White', '009-046 Daddario (regular)', 'Sept/25'),
  makeGuitar('2', 'Epiphone', 'Dave Grohl', '009-046 Daddario new (white pack)', 'June/25'),
  makeGuitar('3', 'Fender', 'Strat Mike', '009-046 (Daddario)', 'June/25'),
  makeGuitar('4', 'Fender', 'Telecaster', '009-046 (Daddario)', 'Sept/25'),
  makeGuitar('5', 'Fender', 'Mustang', '009-046 String Joy (blue pack)', 'Nov/25'),
  makeGuitar('6', 'Gibson', 'Les Paul Special', '009-046 String Joy (green pack)', 'Sept/25'),
  makeGuitar('7', 'Fender', 'Jazzmaster', '009-046 Daddario new (white pack)', 'May/25'),
  makeGuitar('8', 'Yamaha', 'Revstar', '009-046 (Daddario)', 'June/25'),
  makeGuitar('9', 'Fender', 'Duo Sonic', '009-046 String Joy (blue pack)', 'Sept/25'),
  makeGuitar('10', 'Faith', 'Neptune', 'Acoustic (012s inferred)', 'Dec/24'),
];

export const seedMaintenanceLogs: MaintenanceLog[] = [
  makeLog('1', '1', 'Sept/25', 'strings', '009-046 Daddario (regular)'),
  makeLog('2', '2', 'June/25', 'Set up - fretboard', '009-046 Daddario new (white pack)'),
  makeLog('3', '3', 'June/25', 'Set up - fretboard', '009-046 (Daddario)'),
  makeLog('4', '4', 'Sept/25', 'Set up - fretboard', '009-046 (Daddario)'),
  makeLog('5', '5', 'Nov/25', 'Set up / fretboard', '009-046 String Joy (blue pack)'),
  makeLog('6', '6', 'Sept/25', 'Set up - fretboard', '009-046 String Joy (green pack)'),
  makeLog('7', '7', 'May/25', 'Set up / fretboard', '009-046 Daddario new (white pack)'),
  makeLog('8', '8', 'June/25', 'Set up - fretboard', '009-046 (Daddario)'),
  makeLog('9', '9', 'Sept/25', 'Set up - fretboard', '009-046 String Joy (blue pack)'),
  makeLog('10', '10', 'Dec/24', 'strings', 'Acoustic (012s inferred)'),
];
