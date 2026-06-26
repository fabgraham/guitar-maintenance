import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  const { rows } = await pool.query(
    'SELECT id, maker, model, year, created_at, updated_at FROM guitars ORDER BY created_at ASC'
  );
  const guitars = rows.map(r => ({
    id: r.id,
    maker: r.maker,
    model: r.model,
    year: r.year || '',
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
  return NextResponse.json(guitars);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { id, maker, model, year, createdAt, updatedAt } = body;
  const { rows } = await pool.query(
    `INSERT INTO guitars (id, maker, model, year, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, maker, model, year, created_at, updated_at`,
    [id, maker, model, year || '', createdAt, updatedAt]
  );
  const r = rows[0];
  return NextResponse.json({
    id: r.id,
    maker: r.maker,
    model: r.model,
    year: r.year || '',
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }, { status: 201 });
}
