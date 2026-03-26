import { NextResponse } from 'next/server'
import { storageGet } from '@/lib/storage'
import { uploadSitemapToR2 } from '@/lib/r2'
import type { ListaImoveis } from '@/types/imovel'

/**
 * POST /api/admin/export-sitemap
 * Gera sitemap.json (lista resumida) e faz upload para R2
 * Protegido por middleware de autenticação
 */
export async function POST() {
  try {
    // Lê imoveis.json com lista resumida
    const raw = await storageGet('imoveis.json')
    if (!raw) {
      return NextResponse.json(
        { erro: 'Nenhum imóvel encontrado' },
        { status: 404 }
      )
    }

    const lista: ListaImoveis = JSON.parse(raw)
    const imoveis = lista.imoveis || []

    // Upload para R2
    const uploadOk = await uploadSitemapToR2(imoveis)

    return NextResponse.json({
      ok: true,
      message: uploadOk
        ? 'Sitemap exportado com sucesso para R2'
        : 'Sitemap gerado mas R2 não configurado (local apenas)',
      total: imoveis.length,
      uploadedToR2: uploadOk,
    })
  } catch (err) {
    console.error('Erro ao exportar sitemap:', err)
    return NextResponse.json(
      { erro: 'Falha ao exportar sitemap', details: String(err) },
      { status: 500 }
    )
  }
}
