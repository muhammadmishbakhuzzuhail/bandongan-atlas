import { NextResponse } from 'next/server';
import { getAllMonografi } from '../../../../lib/services/monografi.service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/monografi/all — returns all rows from DATA_MONOGRAFI for admin table.
 */
export async function GET() {
  try {
    const data = await getAllMonografi();
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Failed to fetch all monografi:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
