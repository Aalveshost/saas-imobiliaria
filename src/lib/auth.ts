import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'

const SECRET = new TextEncoder().encode(
  process.env.ADMIN_SECRET || 'dev-secret-local'
)

export async function signToken(payload: Record<string, unknown>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(SECRET)
}

export async function verifyToken(token: string): Promise<Record<string, unknown> | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as Record<string, unknown>
  } catch {
    return null
  }
}

export function checkCredentials(user: string, pass: string): boolean {
  const adminUser = process.env.ADMIN_USER || 'admin'
  const adminHash = process.env.ADMIN_PASS_HASH || ''
  if (user !== adminUser) return false
  return bcrypt.compareSync(pass, adminHash)
}
