import { NextResponse } from 'next/server';
import { getAllMonografi } from '../../../../lib/services/monografi.service';
import { getAllIndikator } from '../../../../lib/services/indikator.service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/monografi/latest
 *
 * Returns the latest monografi value per indicator for ALL villages,
 * mapped to their field_key.
 * Used by the map (DashboardShell) to display live data for all villages
 * without relying on hardcoded dummy data.
 */
export async function GET() {
  try {
    // Fetch all indikators to build the field_key map
    const indikators = await getAllIndikator();
    const indikatorMap = new Map(indikators.map(ind => [ind.id, ind]));

    // Fetch all monografi rows
    const rows = await getAllMonografi();

    // Group by desa_id, then by indikator_id, keeping the latest tahun+bulan
    const latestByDesaAndIndikator = new Map<string, Map<string, { tahun: number; bulan: number; nilai: number }>>();

    for (const row of rows) {
      const desaId = row.desa_id;
      const indikatorId = row.indikator_id;
      const tahun = row.tahun;
      const bulan = row.bulan;
      const nilai = row.nilai;

      if (!latestByDesaAndIndikator.has(desaId)) {
        latestByDesaAndIndikator.set(desaId, new Map());
      }

      const desaMap = latestByDesaAndIndikator.get(desaId)!;
      const existing = desaMap.get(indikatorId);

      if (!existing || tahun > existing.tahun || (tahun === existing.tahun && bulan > existing.bulan)) {
        desaMap.set(indikatorId, { tahun, bulan, nilai });
      }
    }

    // Build result: { [desa_id]: { [field_key]: nilai } }
    const result: Record<string, Record<string, number>> = {};

    for (const [desaId, desaMap] of latestByDesaAndIndikator) {
      const fieldData: Record<string, number> = {};
      for (const [indikatorId, { nilai }] of desaMap) {
        const indikator = indikatorMap.get(indikatorId);
        if (indikator) {
          fieldData[indikator.id] = nilai;
        }
      }
      result[desaId] = fieldData;
    }

    // Return both the mapped data and the list of active indicators
    return NextResponse.json({ 
      data: result,
      indicators: indikators
    });
  } catch (error) {
    console.error('Failed to fetch latest monografi:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
