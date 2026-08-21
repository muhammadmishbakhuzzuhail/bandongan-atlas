import { NextResponse } from 'next/server';
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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await requireAuth();
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const sheet = await getSheetByTitle('DATA_MONOGRAFI');
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('id') === id);

    if (!row) return NextResponse.json({ error: 'Row not found' }, { status: 404 });

    await row.delete();
    await createAuditLog(payload.userId as string, 'DELETE', 'DATA_MONOGRAFI', `Deleted monografi id ${id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete monografi:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
