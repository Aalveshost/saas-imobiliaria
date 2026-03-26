import { NextRequest, NextResponse } from 'next/server'
import { storageGet, initStorage } from '@/lib/storage'
import { gerarId } from '@/lib/imovel-id'
import { salvarImovel } from '@/lib/rollback'
import { gerarSlug } from '@/lib/slug'
import type { ImovelCompleto } from '@/types/imovel'

export async function GET() {
  const raw = await storageGet('imoveis.json')
  const lista = raw ? JSON.parse(raw) : { imoveis: [] }
  return NextResponse.json(lista.imoveis)
}

export async function POST(req: NextRequest) {
  await initStorage()
  const body = await req.json()

  const categorias = await storageGet('meta/categorias.json')
  const cats = categorias ? JSON.parse(categorias) : []
  const cat = cats.find((c: { slug: string; prefixo: string }) => c.slug === body.cat)
  if (!cat) {
    return NextResponse.json({ erro: 'Categoria inválida' }, { status: 400 })
  }

  const id = await gerarId(cat.prefixo)
  const agora = new Date().toISOString()
  const slug = gerarSlug(body.titulo, body.endereco?.bairro || '', id)

  // Lista de imagens disponíveis
  const imagesList = ['ap001.jpg', 'ap002.jpg', 'ap003.jpg', 'ap004.jpg', 'ap005.jpg', 'casa001.jpg', 'casa 002.jpeg', 'casa 003.webp']
  const imagemAleatoria = imagesList[Math.floor(Math.random() * imagesList.length)]

  const imovel: ImovelCompleto = {
    id,
    slug,
    titulo: body.titulo,
    descricao: body.descricao || '',
    preco: Number(body.preco),
    tipo: body.tipo,
    cat: body.cat,
    area: Number(body.area),
    quartos: Number(body.quartos) || 0,
    banheiros: Number(body.banheiros) || 0,
    vagas: Number(body.vagas) || 0,
    img: id,
    imagem: imagemAleatoria,
    cidade: body.endereco?.cidade || '',
    bairro: body.endereco?.bairro || '',
    endereco: body.endereco || {},
    comodidades: body.comodidades || [],
    fotos: [], // fotos serão implementadas depois
    contato: body.contato || {},
    status: 'ativo',
    destaque: false,
    criadoEm: agora,
    atualizadoEm: agora,
  }

  await salvarImovel(imovel)
  return NextResponse.json({ ok: true, id }, { status: 201 })
}
