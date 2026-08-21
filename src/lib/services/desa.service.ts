import { getSheetByTitle } from '../google-sheets';
import { MasterDesa } from '../../types/database';

export async function getAllDesa(): Promise<MasterDesa[]> {
  const sheet = await getSheetByTitle('MASTER_DESA');
  const rows = await sheet.getRows();

  return rows.map(row => ({
    id: row.get('id'),
    nama_desa: row.get('nama_desa'),
    slug: row.get('slug'),
    nama_kecamatan: row.get('nama_kecamatan'),
  }));
}
