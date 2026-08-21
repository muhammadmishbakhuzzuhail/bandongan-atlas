import { getSheetByTitle } from '../google-sheets';
import crypto from 'crypto';

export async function createAuditLog(
  user_id: string,
  aksi: string,
  tabel_terdampak: string,
  keterangan: string
) {
  try {
    const sheet = await getSheetByTitle('AUDIT_LOGS');
    const id = crypto.randomUUID(); // secure UUID generation
    
    await sheet.addRow({
      id,
      user_id,
      aksi,
      tabel_terdampak,
      keterangan,
      created_at: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    return false;
  }
}
