import { getSheetByTitle } from '../google-sheets';
import { MasterIndikator } from '../../types/database';

export async function getActiveIndikator(): Promise<MasterIndikator[]> {
  const sheet = await getSheetByTitle('MASTER_INDIKATOR');
  const rows = await sheet.getRows();
  
  return rows
    .filter(row => row.get('is_active') === 'TRUE' || row.get('is_active') === 'true')
    .map(row => ({
      id: row.get('id'),
      nama_indikator: row.get('nama_indikator'),
      satuan: row.get('satuan'),
      is_active: true,
      field_key: row.get('field_key') || undefined,
    }));
}

export async function getAllIndikator(): Promise<MasterIndikator[]> {
  const sheet = await getSheetByTitle('MASTER_INDIKATOR');
  const rows = await sheet.getRows();
  
  return rows.map(row => ({
    id: row.get('id'),
    nama_indikator: row.get('nama_indikator'),
    satuan: row.get('satuan'),
    is_active: row.get('is_active') === 'TRUE' || row.get('is_active') === 'true',
    field_key: row.get('field_key') || undefined,
  }));
}

