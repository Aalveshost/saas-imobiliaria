import { NextRequest, NextResponse } from 'next/server'
import { storageGet, storagePut, initStorage } from '@/lib/storage'

/**
 * Endpoint de migração: popula o Postgres com dados do filesystem local
 * POST /api/admin/migrate
 */
export async function POST(req: NextRequest) {
  await initStorage()

  try {
    // Lê imoveis.json
    const listaRaw = await storageGet('imoveis.json')
    if (!listaRaw) {
      return NextResponse.json({
        ok: true,
        msg: 'Nenhum arquivo imoveis.json encontrado para migrar'
      })
    }

    const lista = JSON.parse(listaRaw)

    // Salva na database
    await storagePut('imoveis.json', listaRaw)

    // Migra cada imóvel individual
    let migrados = 0
    for (const resumo of lista.imoveis || []) {
      const caminho = `imoveis/${resumo.tipo}/${resumo.cat}/${resumo.id}.json`
      const conteudo = await storageGet(caminho)
      if (conteudo) {
        await storagePut(caminho, conteudo)
        migrados++
      }
    }

    // Migra metadados
    const cats = await storageGet('meta/categorias.json')
    if (cats) await storagePut('meta/categorias.json', cats)

    const coms = await storageGet('meta/comodidades.json')
    if (coms) await storagePut('meta/comodidades.json', coms)

    return NextResponse.json({
      ok: true,
      msg: `Migração concluída: ${migrados} imóveis + metadados`
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({
      ok: false,
      erro: msg
    }, { status: 500 })
  }
}
