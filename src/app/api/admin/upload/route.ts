import { NextRequest, NextResponse } from 'next/server'
import { processarImagem } from '@/lib/image'
import { imgPut } from '@/lib/storage'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const imovelId = formData.get('imovelId') as string
  const index = formData.get('index') as string // '0', '1', '2'...

  if (!imovelId || index === null) {
    return NextResponse.json({ erro: 'imovelId e index são obrigatórios' }, { status: 400 })
  }

  const file = formData.get('file') as File
  if (!file) return NextResponse.json({ erro: 'Nenhum arquivo enviado' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())

  const { full, thumb } = await processarImagem(buffer)

  await Promise.all([
    imgPut(`${imovelId}/${index}.webp`, full),
    // thumb só salva no index 0 (imagem de destaque)
    ...(index === '0' ? [imgPut(`${imovelId}/thumb.webp`, thumb)] : []),
  ])

  return NextResponse.json({ ok: true, path: `/img/${imovelId}/${index}.webp` })
}
