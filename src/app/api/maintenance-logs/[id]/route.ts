import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const { guitarId, maintenanceDate, typeOfWork, notes } = body;
  const { rows } = await getPool().query(
    `UPDATE maintenance_logs SET guitar_id=$1, maintenance_date=$2, type_of_work=$3, notes=$4
     WHERE id=$5
     RETURNING id, guitar_id, maintenance_date, type_of_work, notes, created_at`,
    [guitarId, maintenanceDate, typeOfWork, notes || '', params.id]
  );
  if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const r = rows[0];
  return NextResponse.json({
    id: r.id,
    guitarId: r.guitar_id,
    maintenanceDate: r.maintenance_date,
    typeOfWork: r.type_of_work,
    notes: r.notes || '',
    createdAt: r.created_at,
  });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  await getPool().query('DELETE FROM maintenance_logs WHERE id=$1', [params.id]);
  return new NextResponse(null, { status: 204 });
}
