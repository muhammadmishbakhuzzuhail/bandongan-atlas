import { NextResponse } from 'next/server';
import { findUserByUsername, verifyPassword, createSession } from '../../../../lib/services/auth.service';
import { createAuditLog } from '../../../../lib/services/audit.service';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const user = await findUserByUsername(username);

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await createSession(user.id, user.role, user.desa_id);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    // Log the action
    await createAuditLog(user.id, 'LOGIN', 'USERS', `User ${username} logged in`);

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        desa_id: user.desa_id
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
