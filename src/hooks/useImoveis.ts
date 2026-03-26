'use client'
import { useState, useEffect, useCallback } from 'react'
import type { ListaImoveis, ImovelResumo } from '@/types/imovel'

const STORAGE_KEY = 'saas_imoveis_cache'
const POLL_INTERVAL = 15_000 // 15 seg
const CACHE_MAX_AGE = 30_000 // 30 seg - cache expira rápido

interface Cache {
  etag: string
  data: ListaImoveis
  ts: number
}

function lerCache(): Cache | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const cache = JSON.parse(raw)
    // Validar que o cache tem os campos obrigatórios
    if (!cache.data?.imoveis || !Array.isArray(cache.data.imoveis)) {
      return null
    }
    // Se o primeiro imóvel não tem imagem, cache é inválido (versão antiga)
    if (cache.data.imoveis.length > 0 && !cache.data.imoveis[0].imagem) {
      return null
    }
    // Se cache está muito antigo, invalidar
    if (Date.now() - cache.ts > CACHE_MAX_AGE) {
      return null
    }

    return cache
  } catch {
    return null
  }
}

function salvarCache(cache: Cache) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache))
  } catch {
    // localStorage cheio — silencioso
  }
}

export function useImoveis() {
  const [imoveis, setImoveis] = useState<ImovelResumo[]>([])
  const [loading, setLoading] = useState(true)

  const sync = useCallback(async () => {
    const cache = lerCache()
    const headers: Record<string, string> = {}
    if (cache?.etag) headers['If-None-Match'] = cache.etag

    try {
      const res = await fetch('/api/imoveis', { headers })

      if (res.status === 304) return // nada mudou

      if (res.ok) {
        const data: ListaImoveis = await res.json()
        const etag = res.headers.get('etag') || data.etag
        salvarCache({ etag, data, ts: Date.now() })
        setImoveis(data.imoveis)
      }
    } catch {
      // offline — usa cache se tiver
      if (cache) setImoveis(cache.data.imoveis)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // carrega cache imediatamente sem flickering
    const cache = lerCache()
    if (cache) {
      setImoveis(cache.data.imoveis)
      setLoading(false)
    } else {
      // sem cache válido, não mostra skeletons desnecessários
      setLoading(true)
    }

    // sincronizar imediatamente e depois em intervalo
    sync()
    const timer = setInterval(sync, POLL_INTERVAL)
    return () => clearInterval(timer)
  }, [sync])

  return { imoveis, loading }
}
