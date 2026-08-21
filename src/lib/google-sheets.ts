import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SHEET_ID) {
  console.warn('Google Sheets credentials are not fully set in environment variables.');
}

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
  ],
});

let docInstance: GoogleSpreadsheet | null = null;

export async function getGoogleSheet() {
  if (!docInstance) {
    if (!process.env.GOOGLE_SHEET_ID) {
      throw new Error('GOOGLE_SHEET_ID is not defined');
    }
    
    docInstance = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
  }
  // Always reload info to pick up new sheets added at runtime
  await docInstance.loadInfo();
  return docInstance;
}

export async function getSheetByTitle(title: string) {
  const doc = await getGoogleSheet();
  let sheet = doc.sheetsByTitle[title];

  // If sheet doesn't exist, create it with default headers
  if (!sheet) {
    console.warn(`Sheet "${title}" not found, creating a new one...`);
    // Default headers based on title
    let headers: string[] = [];
    if (title === 'USERS') headers = ['id', 'username', 'password_hash', 'role', 'desa_id'];
    if (title === 'DATA_MONOGRAFI') headers = ['id', 'desa_id', 'indikator_id', 'tahun', 'bulan', 'nilai'];
    if (title === 'MASTER_INDIKATOR') headers = ['id', 'nama_indikator', 'satuan', 'is_active', 'field_key'];
    if (title === 'MASTER_DESA') headers = ['id', 'nama_desa', 'slug', 'nama_kecamatan'];
    if (title === 'AUDIT_LOGS') headers = ['id', 'user_id', 'aksi', 'tabel_terdampak', 'keterangan', 'created_at'];

    sheet = await doc.addSheet({ title, headerValues: headers });
  } else {
    try {
      await sheet.loadHeaderRow();
    } catch(e) {
      let headers: string[] = [];
      if (title === 'USERS') headers = ['id', 'username', 'password_hash', 'role', 'desa_id'];
      if (title === 'DATA_MONOGRAFI') headers = ['id', 'desa_id', 'indikator_id', 'tahun', 'bulan', 'nilai'];
      if (title === 'MASTER_INDIKATOR') headers = ['id', 'nama_indikator', 'satuan', 'is_active', 'field_key'];
      if (title === 'MASTER_DESA') headers = ['id', 'nama_desa', 'slug', 'nama_kecamatan'];
      if (title === 'AUDIT_LOGS') headers = ['id', 'user_id', 'aksi', 'tabel_terdampak', 'keterangan', 'created_at'];
      if (headers.length > 0) {
        await sheet.setHeaderRow(headers);
      }
    }
  }

  return sheet;
}
