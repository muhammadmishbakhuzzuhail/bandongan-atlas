import { NextResponse } from 'next/server';
import { getSheetByTitle } from '../../../lib/google-sheets';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sheet = await getSheetByTitle('AUDIT_LOGS');
    const rows = await sheet.getRows();

    const data = rows.map(row => ({
      id: row.get('id'),
      user_id: row.get('user_id'),
      aksi: row.get('aksi'),
      tabel_terdampak: row.get('tabel_terdampak'),
      keterangan: row.get('keterangan'),
      created_at: row.get('created_at'),
    })).reverse(); // newest first

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
