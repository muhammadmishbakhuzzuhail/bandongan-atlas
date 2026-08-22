import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { getSheetByTitle } from '@/lib/google-sheets';
import { verifySession } from '@/lib/services/auth.service';
import { cookies } from 'next/headers';
import { createAuditLog } from '@/lib/services/audit.service';


async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await requireAuth();
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { nama_desa, slug, nama_kecamatan } = body;

    const sheet = await getSheetByTitle('MASTER_DESA');
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('id') === id);

    if (!row) return NextResponse.json({ error: 'Desa not found' }, { status: 404 });

    if (nama_desa !== undefined) row.set('nama_desa', nama_desa);
    if (slug !== undefined) row.set('slug', slug);
    if (nama_kecamatan !== undefined) row.set('nama_kecamatan', nama_kecamatan);

    await row.save();
    await createAuditLog(payload.userId as string, 'UPDATE', 'MASTER_DESA', `Updated desa ${id}`);
    
    revalidateTag('desa', { expire: 0 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update desa:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await requireAuth();
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const sheet = await getSheetByTitle('MASTER_DESA');
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('id') === id);

    if (!row) return NextResponse.json({ error: 'Desa not found' }, { status: 404 });

    await row.delete();
    await createAuditLog(payload.userId as string, 'DELETE', 'MASTER_DESA', `Deleted desa ${id}`);

    revalidateTag('desa', { expire: 0 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete desa:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
