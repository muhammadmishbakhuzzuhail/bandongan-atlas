import { unstable_cache } from 'next/cache';
import { getSheetByTitle } from '../google-sheets';
import { MasterIndikator } from '../../types/database';

async function fetchActiveIndikator(): Promise<MasterIndikator[]> {
  const sheet = await getSheetByTitle('MASTER_INDIKATOR');
  const rows = await sheet.getRows();
  
  return rows
    .filter(row => row.get('is_active') === 'TRUE' || row.get('is_active') === 'true')
    .map(row => ({
      id: row.get('id'),
      nama_indikator: row.get('nama_indikator'),
      satuan: row.get('satuan'),
      is_active: true,
    }));
}

export const getActiveIndikator = unstable_cache(
  fetchActiveIndikator,
  ['indikator-active-list'],
  { tags: ['indikator'], revalidate: 3600 }
);

async function fetchAllIndikator(): Promise<MasterIndikator[]> {
  const sheet = await getSheetByTitle('MASTER_INDIKATOR');
  const rows = await sheet.getRows();
  
  return rows.map(row => ({
    id: row.get('id'),
    nama_indikator: row.get('nama_indikator'),
    satuan: row.get('satuan'),
    is_active: row.get('is_active') === 'TRUE' || row.get('is_active') === 'true',
  }));
}

export const getAllIndikator = unstable_cache(
  fetchAllIndikator,
  ['indikator-all-list'],
  { tags: ['indikator'], revalidate: 3600 }
);
