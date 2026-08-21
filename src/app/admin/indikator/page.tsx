'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Pencil, Trash2, Search, ChevronUp, ChevronDown, ToggleLeft, ToggleRight } from 'lucide-react';
import { Pagination } from '@/components/admin/Pagination';
import { FormModal } from '@/components/admin/FormModal';
import { MasterIndikator } from '@/types/database';
import { AdminHeader, AdminFilterContainer, AdminSearchInput, AdminTableContainer, AdminTableHead, AdminTh, AdminSortIcon, AdminTr, AdminTd, AdminButton, AdminTableSkeleton, AdminEmptyRow } from '@/components/admin/TableLayout';

const PAGE_SIZE = 10;

interface FormState {
  nama_indikator: string;
  satuan: string;
  is_active: boolean;
}

const defaultForm = (): FormState => ({ nama_indikator: '', satuan: '', is_active: true });

type SortColumn = 'nama' | 'satuan' | 'status';

export default function IndikatorPage() {
  const [items, setItems] = useState<MasterIndikator[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  const [sortCol, setSortCol] = useState<SortColumn>('nama');
  const [sortAsc, setSortAsc] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm());
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/indikator?all=1');
      const json = await res.json();
      setItems(json.data || []);
    } catch { /* noop */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filteredAndSorted = useMemo(() => {
    const filtered = items.filter(i => 
      !search || 
      i.nama_indikator.toLowerCase().includes(search.toLowerCase()) || 
      (i.satuan || '').toLowerCase().includes(search.toLowerCase())
    );

    return filtered.sort((a, b) => {
      let cmp = 0;
      if (sortCol === 'nama') {
        cmp = a.nama_indikator.localeCompare(b.nama_indikator);
      } else if (sortCol === 'satuan') {
        cmp = (a.satuan || '').localeCompare(b.satuan || '');
      } else if (sortCol === 'status') {
        cmp = (a.is_active === b.is_active) ? 0 : a.is_active ? -1 : 1;
      }
      return sortAsc ? cmp : -cmp;
    });
  }, [items, search, sortCol, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / PAGE_SIZE));
  const paginated = filteredAndSorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd = () => { setEditId(null); setForm(defaultForm()); setModalOpen(true); };
  const openEdit = (item: MasterIndikator) => {
    setEditId(item.id);
    setForm({ nama_indikator: item.nama_indikator, satuan: item.satuan, is_active: item.is_active });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editId ? `/api/indikator/${editId}` : '/api/indikator';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) { setModalOpen(false); fetchAll(); }
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus indikator ini? Data monografi yang terkait tidak akan terhapus.')) return;
    setDeleteId(id);
    await fetch(`/api/indikator/${id}`, { method: 'DELETE' });
    setDeleteId(null);
    fetchAll();
  };

  const handleToggle = async (item: MasterIndikator) => {
    await fetch(`/api/indikator/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !item.is_active }),
    });
    fetchAll();
  };

  const handleSort = (col: SortColumn) => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else { setSortCol(col); setSortAsc(true); }
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <AdminHeader 
        title="Master Indikator" 
        subtitle={`${filteredAndSorted.length} indikator terdaftar`} 
        action={<AdminButton onClick={openAdd}>Tambah +</AdminButton>}
      />

      <AdminFilterContainer>
        <AdminSearchInput 
          value={search} 
          onChange={val => { setSearch(val); setPage(1); }} 
          placeholder="Cari nama indikator atau satuan..." 
        />
      </AdminFilterContainer>

      <AdminTableContainer currentPage={page} totalPages={totalPages} onPageChange={setPage}>
        <AdminTableHead>
          <AdminTh className="text-left" onClick={() => handleSort('nama')} sortable>Nama Indikator <AdminSortIcon active={sortCol === 'nama'} asc={sortAsc} /></AdminTh>
          <AdminTh className="text-left" onClick={() => handleSort('satuan')} sortable>Satuan <AdminSortIcon active={sortCol === 'satuan'} asc={sortAsc} /></AdminTh>
          <AdminTh className="text-center" onClick={() => handleSort('status')} sortable>Status <AdminSortIcon active={sortCol === 'status'} asc={sortAsc} /></AdminTh>
          <AdminTh className="text-center">Aksi</AdminTh>
        </AdminTableHead>
        <tbody>
          {loading ? (
            <AdminTableSkeleton rows={PAGE_SIZE} cols={4} />
          ) : paginated.length === 0 ? (
            <AdminEmptyRow colSpan={4}>
              Tidak ada indikator. Klik <strong className="text-[#173B39]">Tambah +</strong> untuk memulai.
            </AdminEmptyRow>
          ) : (
            paginated.map(item => (
              <AdminTr key={item.id} className={!item.is_active ? 'opacity-60' : ''}>
                <AdminTd className="font-medium text-[#173B39] text-[0.9rem]">{item.nama_indikator}</AdminTd>
                <AdminTd className="text-[#173B39]/80 text-[0.9rem]">
                  {item.satuan ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#173B39]/5 text-[#173B39] border border-[#173B39]/10">
                      {item.satuan}
                    </span>
                  ) : <span className="text-[#173B39]/40">-</span>}
                </AdminTd>
                <AdminTd className="text-center">
                  <button onClick={() => handleToggle(item)} className="inline-flex items-center justify-center p-1 rounded-full hover:bg-gray-100 transition-colors" title={item.is_active ? 'Nonaktifkan' : 'Aktifkan'}>
                    {item.is_active ? <ToggleRight size={26} className="text-[#1E716A]" /> : <ToggleLeft size={26} className="text-[#173B39]/30" />}
                  </button>
                </AdminTd>
                <AdminTd>
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => openEdit(item)} className="p-2 rounded-lg text-[#1E716A] hover:bg-[#1E716A]/10 transition-colors" aria-label="Edit"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(item.id)} disabled={deleteId === item.id} className="p-2 rounded-lg text-[#a8453f] hover:bg-[#a8453f]/10 transition-colors disabled:opacity-40" aria-label="Hapus"><Trash2 size={16} /></button>
                  </div>
                </AdminTd>
              </AdminTr>
            ))
          )}
        </tbody>
      </AdminTableContainer>

      <FormModal isOpen={modalOpen} title={editId ? 'Edit Indikator' : 'Tambah Indikator'} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSave} className="space-y-4 sm:space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#173B39] uppercase tracking-wider mb-1.5">Nama Indikator</label>
            <input type="text" required value={form.nama_indikator} onChange={e => setForm(f => ({ ...f, nama_indikator: e.target.value }))} className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#173B39]/10 rounded-xl text-base sm:text-[0.9rem] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E716A]/20 focus:border-[#1E716A] text-[#173B39] transition-colors" placeholder="Contoh: Jumlah Penduduk" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#173B39] uppercase tracking-wider mb-1.5">Satuan (Opsional)</label>
            <input type="text" value={form.satuan} onChange={e => setForm(f => ({ ...f, satuan: e.target.value }))} className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#173B39]/10 rounded-xl text-base sm:text-[0.9rem] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E716A]/20 focus:border-[#1E716A] text-[#173B39] transition-colors" placeholder="Contoh: Jiwa, Rp, Ha" />
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 pt-4 border-t border-[#173B39]/5">
            <button type="button" onClick={() => setModalOpen(false)} className="w-full sm:w-auto px-5 py-2.5 text-[0.9rem] font-semibold text-[#173B39]/70 bg-[#F9FAFB] border border-[#173B39]/10 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors">Batal</button>
            <button type="submit" disabled={saving} className="w-full sm:w-auto px-5 py-2.5 text-[0.9rem] font-semibold bg-[#1E716A] text-white rounded-xl hover:bg-[#155A55] active:scale-[0.98] transition-all disabled:opacity-50 shadow-sm">
              {saving ? 'Menyimpan…' : 'Simpan'}
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
