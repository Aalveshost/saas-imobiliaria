import { NextResponse } from 'next/server'
import { storageGet } from '@/lib/storage'

export async function GET() {
  const raw = await storageGet('meta/comodidades.json')
  const data = raw ? JSON.parse(raw) : []
  return NextResponse.json(data)
}
