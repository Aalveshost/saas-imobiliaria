import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Libera login e APIs publicas
  if (pathname === '/painel/login' || pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // Protege /painel/* e /api/admin/*
  if (pathname.startsWith('/painel') || pathname.startsWith('/api/admin')) {
    const token = req.cookies.get('admin_token')?.value

    if (!token || !(await verifyToken(token))) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/painel/login', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/painel/:path*', '/api/admin/:path*'],
}
