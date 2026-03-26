import { NextRequest, NextResponse } from 'next/server'
import { storageGet, storagePut } from '@/lib/storage'
import type { Categoria } from '@/types/imovel'

export async function GET() {
  const raw = await storageGet('meta/categorias.json')
  return NextResponse.json(raw ? JSON.parse(raw) : [])
}

export async function POST(req: NextRequest) {
  const body: Categoria = await req.json()
  if (!body.slug || !body.label || !body.prefixo) {
    return NextResponse.json({ erro: 'slug, label e prefixo são obrigatórios' }, { status: 400 })
  }

  const raw = await storageGet('meta/categorias.json')
  const cats: Categoria[] = raw ? JSON.parse(raw) : []

  if (cats.find(c => c.slug === body.slug)) {
    return NextResponse.json({ erro: 'Categoria já existe' }, { status: 409 })
  }

  cats.push(body)
  await storagePut('meta/categorias.json', JSON.stringify(cats, null, 2))
  return NextResponse.json({ ok: true }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const { slug } = await req.json()
  const raw = await storageGet('meta/categorias.json')
  const cats: Categoria[] = raw ? JSON.parse(raw) : []
  const novo = cats.filter(c => c.slug !== slug)
  await storagePut('meta/categorias.json', JSON.stringify(novo, null, 2))
  return NextResponse.json({ ok: true })
}
