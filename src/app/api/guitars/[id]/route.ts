import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const { maker, model, year, updatedAt } = body;
  const { rows } = await pool.query(
    `UPDATE guitars SET maker=$1, model=$2, year=$3, updated_at=$4
     WHERE id=$5
     RETURNING id, maker, model, year, created_at, updated_at`,
    [maker, model, year || '', updatedAt, params.id]
  );
  if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const r = rows[0];
  return NextResponse.json({
    id: r.id,
    maker: r.maker,
    model: r.model,
    year: r.year || '',
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  await pool.query('DELETE FROM guitars WHERE id=$1', [params.id]);
  return new NextResponse(null, { status: 204 });
}
