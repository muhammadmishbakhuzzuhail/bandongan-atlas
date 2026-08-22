import { unstable_cache } from 'next/cache';
import { getSheetByTitle } from '../google-sheets';
import { DataMonografi } from '../../types/database';
import crypto from 'crypto';

async function fetchAllMonografi(): Promise<DataMonografi[]> {
  const sheet = await getSheetByTitle('DATA_MONOGRAFI');
  const rows = await sheet.getRows();
  
  return rows.map(row => ({
    id: row.get('id'),
    desa_id: row.get('desa_id'),
    indikator_id: row.get('indikator_id'),
    tahun: parseInt(row.get('tahun'), 10),
    bulan: parseInt(row.get('bulan'), 10),
    nilai: parseFloat(row.get('nilai'))
  }));
}

export const getAllMonografi = unstable_cache(
  fetchAllMonografi,
  ['monografi-all-list'],
  { tags: ['monografi'], revalidate: 3600 }
);

export async function getMonografiByDesa(desa_id: string): Promise<DataMonografi[]> {
  const all = await getAllMonografi();
  return all.filter(row => row.desa_id === desa_id);
}

export async function createOrUpdateMonografi(data: Omit<DataMonografi, 'id'>) {
  const sheet = await getSheetByTitle('DATA_MONOGRAFI');
  const rows = await sheet.getRows();
  
  // Check if data already exists for the same desa, indikator, tahun, bulan
  const existingRow = rows.find(row => 
    row.get('desa_id') === data.desa_id &&
    row.get('indikator_id') === data.indikator_id &&
    parseInt(row.get('tahun'), 10) === data.tahun &&
    parseInt(row.get('bulan'), 10) === data.bulan
  );
  
  if (existingRow) {
    existingRow.set('nilai', data.nilai.toString());
    await existingRow.save();
    return { id: existingRow.get('id'), ...data };
  } else {
    const id = crypto.randomUUID(); // secure UUID generation
    await sheet.addRow({
      id,
      ...data,
      tahun: data.tahun.toString(),
      bulan: data.bulan.toString(),
      nilai: data.nilai.toString()
    });
    return { id, ...data };
  }
}
