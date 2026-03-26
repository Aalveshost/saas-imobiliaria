'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Pencil, Trash2, Star, StarOff, Plus, Eye } from 'lucide-react'
import type { ImovelResumo } from '@/types/imovel'

const tipoLabel: Record<string, string> = {
  alugar: 'Aluguel', venda: 'Venda', permuta: 'Permuta',
}

export default function ImoveisAdminPage() {
  const [imoveis, setImoveis] = useState<ImovelResumo[]>([])
  const [loading, setLoading] = useState(true)

  async function carregar() {
    const res = await fetch('/api/admin/imoveis')
    setImoveis(await res.json())
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  async function excluir(id: string) {
    if (!confirm('Excluir este imóvel?')) return
    await fetch(`/api/admin/imoveis/${id}`, { method: 'DELETE' })
    setImoveis(prev => prev.filter(i => i.id !== id))
  }

  async function toggleDestaque(id: string) {
    await fetch(`/api/admin/imoveis/${id}`, { method: 'PATCH' })
    setImoveis(prev => prev.map(i => i.id === id ? { ...i, destaque: !i.destaque } : i))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-semibold text-[var(--color-text)] text-2xl">Imóveis</h1>
          <p className="font-sans text-sm text-[var(--color-text-muted)] mt-1">{imoveis.length} cadastrados</p>
        </div>
        <Link
          href="/painel/imoveis/novo"
          className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-sans font-medium text-xs uppercase tracking-widest px-4 py-2.5 rounded-md transition-colors duration-200 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Novo Imóvel
        </Link>
      </div>

      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center font-sans text-sm text-[var(--color-text-muted)]">Carregando...</div>
        ) : imoveis.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-display text-[var(--color-text-muted)] text-lg mb-2">Nenhum imóvel cadastrado</p>
            <Link href="/painel/imoveis/novo" className="font-sans text-sm text-[var(--color-primary)] cursor-pointer hover:underline">
              Cadastrar o primeiro
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)]">
                {['ID', 'Título', 'Tipo', 'Categoria', 'Preço', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-sans text-xs uppercase tracking-widest text-[var(--color-text-muted)]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {imoveis.map((i, idx) => (
                <tr
                  key={i.id}
                  className={`border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-subtle)] transition-colors duration-150 ${idx % 2 === 0 ? '' : 'bg-[var(--color-bg-subtle)]/50'}`}
                >
                  <td className="px-4 py-3 font-sans text-xs text-[var(--color-text-muted)] font-mono">{i.id}</td>
                  <td className="px-4 py-3 font-sans text-sm text-[var(--color-text)] max-w-xs truncate">{i.titulo}</td>
                  <td className="px-4 py-3">
                    <span className="font-sans text-xs px-2 py-0.5 rounded bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                      {tipoLabel[i.tipo]}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-sans text-sm text-[var(--color-text-muted)] capitalize">{i.cat}</td>
                  <td className="px-4 py-3 font-sans text-sm text-[var(--color-text)]">
                    R$ {i.preco.toLocaleString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-sans text-xs px-2 py-0.5 rounded bg-green-500/10 text-green-500">Ativo</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleDestaque(i.id)}
                        title={i.destaque ? 'Remover destaque' : 'Destacar'}
                        className={`cursor-pointer transition-colors duration-200 ${i.destaque ? 'text-yellow-400 hover:text-yellow-500' : 'text-[var(--color-text-faint)] hover:text-yellow-400'}`}
                      >
                        {i.destaque ? <Star className="w-4 h-4" /> : <StarOff className="w-4 h-4" />}
                      </button>
                      <a
                        href={`/imoveis/${i.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Ver no site"
                        className="text-[var(--color-text-faint)] hover:text-[var(--color-accent)] transition-colors duration-200 cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <Link
                        href={`/painel/imoveis/${i.id}`}
                        className="text-[var(--color-text-faint)] hover:text-[var(--color-primary)] transition-colors duration-200 cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => excluir(i.id)}
                        className="text-[var(--color-text-faint)] hover:text-red-500 transition-colors duration-200 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
