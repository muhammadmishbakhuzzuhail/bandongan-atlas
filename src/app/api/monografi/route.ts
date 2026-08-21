import { NextResponse } from 'next/server';
import { getMonografiByDesa, createOrUpdateMonografi } from '../../../lib/services/monografi.service';
import { createAuditLog } from '../../../lib/services/audit.service';
import { verifySession } from '../../../lib/services/auth.service';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const desa_id = searchParams.get('desa_id');

    if (!desa_id) {
      return NextResponse.json({ error: 'desa_id is required' }, { status: 400 });
    }

    const data = await getMonografiByDesa(desa_id);
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Failed to fetch monografi:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // 1. Verify Authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifySession(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // 2. Parse Body
    const body = await request.json();
    const { desa_id, indikator_id, tahun, bulan, nilai } = body;

    if (!desa_id || !indikator_id || tahun === undefined || bulan === undefined || nilai === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Role check: admin_desa can only edit their own desa
    if (payload.role === 'admin_desa' && payload.desaId !== desa_id) {
      return NextResponse.json({ error: 'Forbidden: Cannot edit other village data' }, { status: 403 });
    }

    // 3. Save Data
    const result = await createOrUpdateMonografi({
      desa_id,
      indikator_id,
      tahun: parseInt(tahun, 10),
      bulan: parseInt(bulan, 10),
      nilai: parseFloat(nilai)
    });

    // 4. Create Audit Log
    await createAuditLog(
      payload.userId as string,
      'UPSERT',
      'DATA_MONOGRAFI',
      `Updated indikator ${indikator_id} for desa ${desa_id} (${bulan}/${tahun}) to ${nilai}`
    );

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Failed to save monografi:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
