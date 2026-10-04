import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function GET() {
  const { rows } = await getPool().query(
    'SELECT id, guitar_id, maintenance_date, type_of_work, notes, created_at FROM maintenance_logs ORDER BY maintenance_date ASC'
  );
  const logs = rows.map(r => ({
    id: r.id,
    guitarId: r.guitar_id,
    maintenanceDate: r.maintenance_date,
    typeOfWork: r.type_of_work,
    notes: r.notes || '',
    createdAt: r.created_at,
  }));
  return NextResponse.json(logs);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { id, guitarId, maintenanceDate, typeOfWork, notes, createdAt } = body;
  const { rows } = await getPool().query(
    `INSERT INTO maintenance_logs (id, guitar_id, maintenance_date, type_of_work, notes, created_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, guitar_id, maintenance_date, type_of_work, notes, created_at`,
    [id, guitarId, maintenanceDate, typeOfWork, notes || '', createdAt]
  );
  const r = rows[0];
  return NextResponse.json({
    id: r.id,
    guitarId: r.guitar_id,
    maintenanceDate: r.maintenance_date,
    typeOfWork: r.type_of_work,
    notes: r.notes || '',
    createdAt: r.created_at,
  }, { status: 201 });
}
