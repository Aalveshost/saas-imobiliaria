import { NextRequest, NextResponse } from 'next/server'
import { checkCredentials, signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { user, pass } = await req.json()

  if (!checkCredentials(user, pass)) {
    return NextResponse.json({ erro: 'Credenciais inválidas' }, { status: 401 })
  }

  const token = await signToken({ user, role: 'admin' })

  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin_token', token, {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 12, // 12h
    secure: process.env.NODE_ENV === 'production',
  })
  return res
}
