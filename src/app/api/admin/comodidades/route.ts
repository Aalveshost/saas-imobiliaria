import { NextRequest, NextResponse } from 'next/server'
import { storageGet, storagePut } from '@/lib/storage'
import type { Comodidade } from '@/types/imovel'

export async function GET() {
  const raw = await storageGet('meta/comodidades.json')
  return NextResponse.json(raw ? JSON.parse(raw) : [])
}

export async function POST(req: NextRequest) {
  const body: Comodidade = await req.json()
  if (!body.slug || !body.label) {
    return NextResponse.json({ erro: 'slug e label são obrigatórios' }, { status: 400 })
  }

  const raw = await storageGet('meta/comodidades.json')
  const items: Comodidade[] = raw ? JSON.parse(raw) : []

  if (items.find(c => c.slug === body.slug)) {
    return NextResponse.json({ erro: 'Comodidade já existe' }, { status: 409 })
  }

  items.push(body)
  await storagePut('meta/comodidades.json', JSON.stringify(items, null, 2))
  return NextResponse.json({ ok: true }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const { slug } = await req.json()
  const raw = await storageGet('meta/comodidades.json')
  const items: Comodidade[] = raw ? JSON.parse(raw) : []
  const novo = items.filter(c => c.slug !== slug)
  await storagePut('meta/comodidades.json', JSON.stringify(novo, null, 2))
  return NextResponse.json({ ok: true })
}
