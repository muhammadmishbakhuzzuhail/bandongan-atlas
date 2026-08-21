export type Role = 'admin_kecamatan' | 'admin_desa';

export interface User {
  id: string; // From Google Sheets it comes as string
  username: string;
  password_hash: string;
  role: Role;
  desa_id: string | null;
}

export interface DataMonografi {
  id: string;
  desa_id: string;
  indikator_id: string;
  tahun: number;
  bulan: number;
  nilai: number;
}

export interface MasterIndikator {
  id: string;
  nama_indikator: string;
  satuan: string;
  is_active: boolean;
}

export interface MasterDesa {
  id: string;
  nama_desa: string;
  slug: string;
  nama_kecamatan: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  aksi: string;
  tabel_terdampak: string;
  keterangan: string;
  created_at: string;
}
