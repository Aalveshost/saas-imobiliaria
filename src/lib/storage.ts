import { sql } from '@vercel/postgres'

/**
 * Storage abstraction — Vercel Postgres em produção, fallback para filesystem localmente.
 */

const USE_POSTGRES = process.env.POSTGRES_URL_NON_POOLING !== undefined

// ─── Inicialização ────────────────────────────────────────────────────────

let initialized = false

export async function initStorage(): Promise<void> {
  if (!USE_POSTGRES || initialized) return

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS kv_store (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    initialized = true
  } catch (err) {
    console.error('Erro ao inicializar storage:', err)
    throw err
  }
}

// ─── JSON (key-value) ─────────────────────────────────────────────────────

export async function storageGet(key: string): Promise<string | null> {
  if (!USE_POSTGRES) {
    // Fallback local (desenvolvimento)
    try {
      const fs = await import('fs/promises')
      const path = await import('path')
      const DATA_DIR = path.resolve(process.cwd(), 'data')
      return await fs.readFile(path.join(DATA_DIR, key), 'utf-8')
    } catch {
      return null
    }
  }

  try {
    const result = await sql`SELECT value FROM kv_store WHERE key = ${key}`
    return result.rows.length > 0 ? result.rows[0].value : null
  } catch (err) {
    console.error(`Erro ao ler ${key}:`, err)
    return null
  }
}

export async function storagePut(key: string, content: string): Promise<void> {
  if (!USE_POSTGRES) {
    // Fallback local (desenvolvimento)
    try {
      const fs = await import('fs/promises')
      const path = await import('path')
      const DATA_DIR = path.resolve(process.cwd(), 'data')
      const fullPath = path.join(DATA_DIR, key)
      await fs.mkdir(path.dirname(fullPath), { recursive: true })
      await fs.writeFile(fullPath, content, 'utf-8')
    } catch (err) {
      throw new Error(`Erro ao salvar ${key}: ${err}`)
    }
    return
  }

  try {
    await sql`
      INSERT INTO kv_store (key, value, updated_at)
      VALUES (${key}, ${content}, CURRENT_TIMESTAMP)
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
    `
  } catch (err) {
    throw new Error(`Erro ao salvar ${key}: ${err}`)
  }
}

export async function storageDelete(key: string): Promise<void> {
  if (!USE_POSTGRES) {
    // Fallback local (desenvolvimento)
    try {
      const fs = await import('fs/promises')
      const path = await import('path')
      const DATA_DIR = path.resolve(process.cwd(), 'data')
      await fs.unlink(path.join(DATA_DIR, key))
    } catch {
      // silencioso se não existir
    }
    return
  }

  try {
    await sql`DELETE FROM kv_store WHERE key = ${key}`
  } catch (err) {
    console.error(`Erro ao deletar ${key}:`, err)
  }
}

export async function storageExists(key: string): Promise<boolean> {
  const value = await storageGet(key)
  return value !== null
}

// ─── IMAGENS (public/img/) ───────────────────────────────────────────────────

export async function imgPut(key: string, buffer: Buffer): Promise<void> {
  if (!USE_POSTGRES) {
    // Fallback local (desenvolvimento)
    try {
      const fs = await import('fs/promises')
      const path = await import('path')
      const PUBLIC_IMG = path.resolve(process.cwd(), 'public/img')
      const fullPath = path.join(PUBLIC_IMG, key)
      await fs.mkdir(path.dirname(fullPath), { recursive: true })
      await fs.writeFile(fullPath, buffer)
    } catch (err) {
      throw new Error(`Erro ao salvar imagem ${key}: ${err}`)
    }
    return
  }

  // Em produção com Postgres, armazenar em R2 ou usar /tmp (não implementado aqui)
  // Por enquanto, lança erro
  throw new Error('Upload de imagens requer R2 configurado em produção')
}

export async function imgDelete(folder: string): Promise<void> {
  if (!USE_POSTGRES) {
    // Fallback local (desenvolvimento)
    try {
      const fs = await import('fs/promises')
      const path = await import('path')
      const PUBLIC_IMG = path.resolve(process.cwd(), 'public/img')
      await fs.rm(path.join(PUBLIC_IMG, folder), { recursive: true, force: true })
    } catch {
      // silencioso
    }
    return
  }

  // Em produção com Postgres, seria R2
  console.warn(`Imagem ${folder} não foi deletada (requer R2)`)
}

// ─── PURGE CACHE ─────────────────────────────────────────────────────────────

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
