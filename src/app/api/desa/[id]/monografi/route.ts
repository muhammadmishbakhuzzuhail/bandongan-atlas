import { NextResponse } from 'next/server';
import { getAllMonografi } from '../../../../../lib/services/monografi.service';
import { getAllIndikator } from '../../../../../lib/services/indikator.service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/desa/[id]/monografi
 *
 * Returns the latest monografi value per indicator for a given desa_id,
 * mapped to their field_key (e.g. { population: 7017, households: 1843 }).
 * Used by the map dialog to display live data from Google Sheets.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: desaId } = await params;

    if (!desaId) {
      return NextResponse.json({ error: 'desa id is required' }, { status: 400 });
    }

    // Fetch all indikators to build the field_key map
    const indikators = await getAllIndikator();
    const indikatorMap = new Map(indikators.map(ind => [ind.id, ind]));

    // Fetch all monografi rows for this desa
    const rows = await getAllMonografi();

    const desaRows = rows.filter(row => row.desa_id === desaId);

    // Group by indikator_id, keep only the row with the latest tahun+bulan
    const latestByIndikator = new Map<string, { tahun: number; bulan: number; nilai: number }>();

    for (const row of desaRows) {
      const indikatorId = row.indikator_id;
      const tahun = row.tahun;
      const bulan = row.bulan;
      const nilai = row.nilai;

      const existing = latestByIndikator.get(indikatorId);
      if (!existing || tahun > existing.tahun || (tahun === existing.tahun && bulan > existing.bulan)) {
        latestByIndikator.set(indikatorId, { tahun, bulan, nilai });
      }
    }

    // Build result: { field_key: nilai } and also raw { indikator_id: nilai }
    const fieldData: Record<string, number> = {};
    const rawData: Record<string, number> = {};
    let latestTahun: number | null = null;
    let latestBulan: number | null = null;

    for (const [indikatorId, { tahun, bulan, nilai }] of latestByIndikator) {
      rawData[indikatorId] = nilai;

      const indikator = indikatorMap.get(indikatorId);
      if (indikator) {
        fieldData[indikator.id] = nilai;
      }

      // Track the most recent period overall
      if (latestTahun === null || tahun > latestTahun || (tahun === latestTahun && bulan > (latestBulan ?? 0))) {
        latestTahun = tahun;
        latestBulan = bulan;
      }
    }

    return NextResponse.json({
      desa_id: desaId,
      tahun: latestTahun,
      bulan: latestBulan,
      fields: fieldData,   // keyed by field_key
      raw: rawData,        // keyed by indikator_id
    });
  } catch (error) {
    console.error('Failed to fetch monografi for desa:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
