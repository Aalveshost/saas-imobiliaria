import { NextRequest, NextResponse } from 'next/server'
import { storageGet } from '@/lib/storage'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id

  if (!id) {
    return NextResponse.json({ erro: 'ID obrigatório' }, { status: 400 })
  }

  try {
    // Tenta encontrar o imóvel na lista e localizar seu arquivo
    const lista = JSON.parse(storageGet('imoveis.json') || '{"imoveis":[]}')
    const resumo = lista.imoveis?.find((i: any) => i.id === id)

    if (!resumo) {
      return NextResponse.json({ erro: 'Imóvel não encontrado' }, { status: 404 })
    }

    // Carrega o arquivo completo
    const tipo = resumo.tipo
    const cat = resumo.cat
    const caminho = `imoveis/${tipo}/${cat}/${id}.json`
    const conteudo = storageGet(caminho)

    if (!conteudo) {
      return NextResponse.json({ erro: 'Imóvel não encontrado' }, { status: 404 })
    }

    const imovel = JSON.parse(conteudo)

    // Retorna com cache
    return NextResponse.json(imovel, {
      headers: {
        'Cache-Control': 'public, max-age=300', // Cache de 5 min
      },
    })
  } catch (err) {
    return NextResponse.json({ erro: 'Erro ao buscar imóvel' }, { status: 500 })
  }
}
