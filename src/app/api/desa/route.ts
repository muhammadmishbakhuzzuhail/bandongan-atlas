import { NextResponse } from 'next/server';
import { getAllDesa } from '../../../lib/services/desa.service';
import { getSheetByTitle } from '../../../lib/google-sheets';
import { verifySession } from '../../../lib/services/auth.service';
import { cookies } from 'next/headers';
import { createAuditLog } from '../../../lib/services/audit.service';

export const dynamic = 'force-dynamic';

async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function GET() {
  try {
    const desa = await getAllDesa();
    return NextResponse.json({ data: desa });
  } catch (error) {
    console.error('Failed to fetch desa:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await requireAuth();
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, nama_desa, slug, nama_kecamatan } = body;

    if (!id || !nama_desa || !slug || !nama_kecamatan) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const sheet = await getSheetByTitle('MASTER_DESA');
    await sheet.addRow({ id, nama_desa, slug, nama_kecamatan });

    await createAuditLog(payload.userId as string, 'CREATE', 'MASTER_DESA', `Created desa ${nama_desa}`);

    return NextResponse.json({ data: { id, nama_desa, slug, nama_kecamatan } }, { status: 201 });
  } catch (error) {
    console.error('Failed to create desa:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

