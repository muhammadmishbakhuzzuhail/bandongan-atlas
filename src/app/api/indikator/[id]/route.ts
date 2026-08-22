import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { getSheetByTitle } from '../../../../lib/google-sheets';
import { verifySession } from '../../../../lib/services/auth.service';
import { cookies } from 'next/headers';
import { createAuditLog } from '../../../../lib/services/audit.service';

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
    const { nama_indikator, satuan, field_key, is_active } = body;

    const sheet = await getSheetByTitle('MASTER_INDIKATOR');
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('id') === id);

    if (!row) return NextResponse.json({ error: 'Indikator not found' }, { status: 404 });

    if (nama_indikator !== undefined) row.set('nama_indikator', nama_indikator);
    if (satuan !== undefined) row.set('satuan', satuan);
    if (field_key !== undefined) row.set('field_key', field_key);
    if (is_active !== undefined) row.set('is_active', is_active ? 'TRUE' : 'FALSE');

    await row.save();
    await createAuditLog(payload.userId as string, 'UPDATE', 'MASTER_INDIKATOR', `Updated indikator ${id}`);

    revalidateTag('indikator', { expire: 0 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update indikator:', error);
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
    const sheet = await getSheetByTitle('MASTER_INDIKATOR');
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('id') === id);

    if (!row) return NextResponse.json({ error: 'Indikator not found' }, { status: 404 });

    await row.delete();
    await createAuditLog(payload.userId as string, 'DELETE', 'MASTER_INDIKATOR', `Deleted indikator ${id}`);

    revalidateTag('indikator', { expire: 0 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete indikator:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
