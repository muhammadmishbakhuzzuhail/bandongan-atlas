import { NextResponse } from 'next/server';
import { getActiveIndikator, getAllIndikator } from '../../../lib/services/indikator.service';
import { getSheetByTitle } from '../../../lib/google-sheets';
import { verifySession } from '../../../lib/services/auth.service';
import { cookies } from 'next/headers';
import { createAuditLog } from '../../../lib/services/audit.service';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === '1';
    const indikator = all ? await getAllIndikator() : await getActiveIndikator();
    return NextResponse.json({ data: indikator });
  } catch (error) {
    console.error('Failed to fetch indikator:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await requireAuth();
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { nama_indikator, satuan, is_active } = body;

    if (!nama_indikator || !satuan) {
      return NextResponse.json({ error: 'nama_indikator and satuan are required' }, { status: 400 });
    }

    const sheet = await getSheetByTitle('MASTER_INDIKATOR');
    const id = `IND-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    await sheet.addRow({
      id,
      nama_indikator,
      satuan,
      is_active: is_active !== false ? 'TRUE' : 'FALSE',
    });

    await createAuditLog(payload.userId as string, 'CREATE', 'MASTER_INDIKATOR', `Created indikator ${nama_indikator}`);

    return NextResponse.json({ data: { id, nama_indikator, satuan, is_active: is_active !== false } }, { status: 201 });
  } catch (error) {
    console.error('Failed to create indikator:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

