import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const { maker, model, year, updatedAt } = body;
  const { rows } = await getPool().query(
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

const isValidDate = (value: unknown): value is string => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

// Saves or clears sale details only, so editing a guitar never touches them.
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { soldDate, soldPrice, updatedAt } = await request.json();
  const validDate = soldDate === null || isValidDate(soldDate);
  const validPrice = soldPrice === null || (typeof soldPrice === 'number' && soldPrice >= 0 && soldPrice < 100000000);
  if (!validDate || !validPrice || (soldDate === null && soldPrice !== null)) {
    return NextResponse.json({ error: 'Invalid sale details' }, { status: 400 });
  }
  const { rowCount } = await getPool().query(
    'UPDATE guitars SET sold_date=$1, sold_price=$2, updated_at=$3 WHERE id=$4',
    [soldDate, soldPrice, updatedAt, params.id]
  );
  if (rowCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  await getPool().query('DELETE FROM guitars WHERE id=$1', [params.id]);
  return new NextResponse(null, { status: 204 });
}
