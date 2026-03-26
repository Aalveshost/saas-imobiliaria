import { NextRequest, NextResponse } from 'next/server'
import { storageGet } from '@/lib/storage'
import { salvarImovel, removerImovel, toggleDestaque } from '@/lib/rollback'
import { gerarSlug } from '@/lib/slug'
import type { ImovelCompleto } from '@/types/imovel'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lista = await storageGet('imoveis.json')
  if (!lista) return NextResponse.json({ erro: 'Não encontrado' }, { status: 404 })

  const resumo = JSON.parse(lista).imoveis.find((i: { id: string }) => i.id === id)
  if (!resumo) return NextResponse.json({ erro: 'Não encontrado' }, { status: 404 })

  const raw = await storageGet(`imoveis/${resumo.tipo}/${resumo.cat}/${id}.json`)
  if (!raw) return NextResponse.json({ erro: 'Não encontrado' }, { status: 404 })

  return NextResponse.json(JSON.parse(raw))
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  const agora = new Date().toISOString()
  // Slug é imutável: se já existe no body, manter; senão gerar
  const slug = body.slug || gerarSlug(body.titulo, body.endereco?.bairro || '', id)
  const imovel: ImovelCompleto = { ...body, id, slug, atualizadoEm: agora }

  try {
    await salvarImovel(imovel)
    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao salvar'
    return NextResponse.json({ ok: false, erro: msg, revertido: true }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lista = await storageGet('imoveis.json')
  if (!lista) return NextResponse.json({ erro: 'Não encontrado' }, { status: 404 })

  const resumo = JSON.parse(lista).imoveis.find((i: { id: string }) => i.id === id)
  if (!resumo) return NextResponse.json({ erro: 'Não encontrado' }, { status: 404 })

  await removerImovel(id, resumo.tipo, resumo.cat)
  return NextResponse.json({ ok: true })
}

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await toggleDestaque(id)
  return NextResponse.json({ ok: true })
}
