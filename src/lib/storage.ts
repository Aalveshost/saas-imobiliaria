/**
 * Storage abstraction — local filesystem agora, R2 em producao.
 * Para migrar: implemente o bloco R2 abaixo e set STORAGE_MODE=r2 no .env
 */
import fs from 'fs/promises'
import path from 'path'

const DATA_DIR = path.resolve(process.cwd(), 'data')
const PUBLIC_IMG = path.resolve(process.cwd(), 'public/img')

// ─── JSON (data/) ────────────────────────────────────────────────────────────

export async function storageGet(key: string): Promise<string | null> {
  try {
    return await fs.readFile(path.join(DATA_DIR, key), 'utf-8')
  } catch {
    return null
  }
}

export async function storagePut(key: string, content: string): Promise<void> {
  const fullPath = path.join(DATA_DIR, key)
  await fs.mkdir(path.dirname(fullPath), { recursive: true })
  await fs.writeFile(fullPath, content, 'utf-8')
}

export async function storageDelete(key: string): Promise<void> {
  try {
    await fs.unlink(path.join(DATA_DIR, key))
  } catch {
    // silencioso se nao existir
  }
}

export async function storageCopy(from: string, to: string): Promise<void> {
  const src = path.join(DATA_DIR, from)
  const dst = path.join(DATA_DIR, to)
  await fs.mkdir(path.dirname(dst), { recursive: true })
  await fs.copyFile(src, dst)
}

export async function storageExists(key: string): Promise<boolean> {
  try {
    await fs.access(path.join(DATA_DIR, key))
    return true
  } catch {
    return false
  }
}

// ─── IMAGENS (public/img/) ───────────────────────────────────────────────────

export async function imgPut(key: string, buffer: Buffer): Promise<void> {
  const fullPath = path.join(PUBLIC_IMG, key)
  await fs.mkdir(path.dirname(fullPath), { recursive: true })
  await fs.writeFile(fullPath, buffer)
}

export async function imgDelete(folder: string): Promise<void> {
  try {
    await fs.rm(path.join(PUBLIC_IMG, folder), { recursive: true, force: true })
  } catch {
    // silencioso
  }
}

// ─── PURGE CACHE ─────────────────────────────────────────────────────────────
// Local: no-op. Em producao chama Cloudflare API para invalidar cache.

export async function purgeCache(_paths: string[]): Promise<void> {
  if (process.env.STORAGE_MODE !== 'r2') return

  const zoneId = process.env.CLOUDFLARE_ZONE_ID
  const token = process.env.CLOUDFLARE_API_TOKEN
  if (!zoneId || !token) return

  await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ files: _paths }),
  })
}
