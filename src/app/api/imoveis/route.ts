import { NextRequest, NextResponse } from 'next/server'
import { storageGet, initStorage } from '@/lib/storage'

async function getFromR2() {
  const accountId = process.env.R2_ACCOUNT_ID
  const bucket = process.env.R2_BUCKET

  if (!accountId || !bucket) return null

  try {
    const url = `https://${bucket}.${accountId}.r2.amazonaws.com/sitemap.json`
    const res = await fetch(url, {
      next: { revalidate: 60 }, // cache 1min
    })
    if (!res.ok) return null

    const json = await res.json()
    // Transforma sitemap em ListaImoveis
    return {
      etag: `r2-${json.updatedAt}`,
      total: json.total,
      imoveis: json.imoveis,
    }
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  await initStorage()
  // Tenta R2 primeiro em produção
  const fromR2 = await getFromR2()
  const lista = fromR2 || (await (async () => {
    const raw = await storageGet('imoveis.json')
    return raw ? JSON.parse(raw) : { etag: 'empty', total: 0, imoveis: [] }
  })())

  if (!lista || !lista.imoveis) {
    return NextResponse.json({ etag: 'empty', total: 0, imoveis: [] })
  }

  const clientEtag = req.headers.get('if-none-match')

  if (clientEtag && clientEtag === lista.etag) {
    return new NextResponse(null, { status: 304 })
  }

  return NextResponse.json(lista, {
    headers: { ETag: lista.etag, 'Cache-Control': 'public, max-age=60' },
  })
}
