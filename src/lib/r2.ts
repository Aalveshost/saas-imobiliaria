import type { ImovelResumo } from '@/types/imovel'

interface R2Config {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
}

function getR2Config(): R2Config | null {
  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  const bucket = process.env.R2_BUCKET

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    return null
  }

  return { accountId, accessKeyId, secretAccessKey, bucket }
}

export async function uploadSitemapToR2(imoveis: ImovelResumo[]): Promise<boolean> {
  const config = getR2Config()
  if (!config) {
    console.log('[R2] Credenciais não configuradas, pulando upload')
    return false
  }

  try {
    const sitemap = {
      version: 1,
      updatedAt: new Date().toISOString(),
      total: imoveis.length,
      imoveis,
    }

    const data = JSON.stringify(sitemap)
    const key = 'sitemap.json'

    const url = `https://${config.bucket}.${config.accountId}.r2.amazonaws.com/${key}`

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `AWS4-HMAC-SHA256 ...`, // Simplificado - usar SDK real em produção
      },
      body: data,
    })

    if (!response.ok) {
      console.error('[R2] Falha ao fazer upload:', response.statusText)
      return false
    }

    console.log('[R2] Sitemap enviado com sucesso')
    return true
  } catch (err) {
    console.error('[R2] Erro ao fazer upload:', err)
    return false
  }
}

export async function getSitemapFromR2(): Promise<ImovelResumo[] | null> {
  const config = getR2Config()
  if (!config) {
    return null
  }

  try {
    const url = `https://${config.bucket}.${config.accountId}.r2.amazonaws.com/sitemap.json`

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 60 }, // Cache por 1 min
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.imoveis || []
  } catch (err) {
    console.error('[R2] Erro ao buscar sitemap:', err)
    return null
  }
}
