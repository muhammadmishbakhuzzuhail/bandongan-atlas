import { getSheetByTitle } from '../google-sheets';
import { User, Role } from '../../types/database';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_development');

export async function findUserByUsername(username: string): Promise<User | null> {
  const sheet = await getSheetByTitle('USERS');
  const rows = await sheet.getRows();
  
  const userRow = rows.find(row => row.get('username') === username);
  if (!userRow) return null;
  
  return {
    id: userRow.get('id'),
    username: userRow.get('username'),
    password_hash: userRow.get('password_hash'),
    role: userRow.get('role') as Role,
    desa_id: userRow.get('desa_id') || null,
  };
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string, role: string, desaId: string | null) {
  const token = await new SignJWT({ userId, role, desaId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
    
  return token;
}

export { verifySession } from '../auth-edge';
