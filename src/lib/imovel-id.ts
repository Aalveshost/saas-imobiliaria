import { storageGet, storagePut } from './storage'

const CONTADORES_KEY = 'meta/contadores.json'

type Contadores = Record<string, number>

export async function gerarId(prefixo: string): Promise<string> {
  const raw = await storageGet(CONTADORES_KEY)
  const contadores: Contadores = raw ? JSON.parse(raw) : {}

  const atual = contadores[prefixo] ?? 0
  const proximo = atual + 1

  contadores[prefixo] = proximo
  await storagePut(CONTADORES_KEY, JSON.stringify(contadores, null, 2))

  const digits = proximo >= 10000 ? 5 : 4
  return `${prefixo}-${String(proximo).padStart(digits, '0')}`
}
