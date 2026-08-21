import { NextResponse } from 'next/server';
import { getSheetByTitle } from '../../../../lib/google-sheets';

export const dynamic = 'force-dynamic';

/**
 * GET /api/monografi/all — returns all rows from DATA_MONOGRAFI for admin table.
 */
export async function GET() {
  try {
    const sheet = await getSheetByTitle('DATA_MONOGRAFI');
    const rows = await sheet.getRows();

    const data = rows.map(row => ({
      id: row.get('id'),
      desa_id: row.get('desa_id'),
      indikator_id: row.get('indikator_id'),
      tahun: parseInt(row.get('tahun'), 10),
      bulan: parseInt(row.get('bulan'), 10),
      nilai: parseFloat(row.get('nilai')),
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Failed to fetch all monografi:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
