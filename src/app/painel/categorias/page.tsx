'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { Categoria } from '@/types/imovel'

export default function CategoriasPage() {
  const [cats, setCats] = useState<Categoria[]>([])
  const [slug, setSlug] = useState('')
  const [label, setLabel] = useState('')
  const [prefixo, setPrefixo] = useState('')
  const [erro, setErro] = useState('')

  async function carregar() {
    const res = await fetch('/api/admin/categorias')
    setCats(await res.json())
  }

  useEffect(() => { carregar() }, [])

  async function adicionar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    const res = await fetch('/api/admin/categorias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, label, prefixo }),
    })
    const data = await res.json()
    if (data.ok) {
      setSlug(''); setLabel(''); setPrefixo('')
      carregar()
    } else {
      setErro(data.erro || 'Erro ao adicionar')
    }
  }

  async function excluir(slug: string) {
    if (!confirm('Excluir esta categoria?')) return
    await fetch('/api/admin/categorias', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    })
    carregar()
  }

  const inputCls = "font-sans text-sm bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-[var(--color-text)] px-3 py-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-colors duration-200"

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display font-semibold text-[var(--color-text)] text-2xl">Categorias</h1>
        <p className="font-sans text-sm text-[var(--color-text-muted)] mt-1">Tipos de imóvel</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista */}
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl overflow-hidden">
          {cats.length === 0 ? (
            <p className="p-6 font-sans text-sm text-[var(--color-text-muted)]">Nenhuma categoria</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-subtle)]">
                  {['Slug', 'Label', 'Prefixo', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-sans text-xs uppercase tracking-widest text-[var(--color-text-muted)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cats.map(c => (
                  <tr key={c.slug} className="border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-subtle)] transition-colors">
                    <td className="px-4 py-3 font-sans text-xs font-mono text-[var(--color-text-muted)]">{c.slug}</td>
                    <td className="px-4 py-3 font-sans text-sm text-[var(--color-text)]">{c.label}</td>
                    <td className="px-4 py-3 font-sans text-xs font-mono text-[var(--color-accent)]">{c.prefixo}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => excluir(c.slug)} className="text-[var(--color-text-faint)] hover:text-red-500 transition-colors cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Form adicionar */}
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl p-6">
          <h2 className="font-display font-semibold text-[var(--color-text)] text-lg mb-4">Adicionar Categoria</h2>
          <form onSubmit={adicionar} className="space-y-3">
            <div>
              <label className="font-sans text-xs uppercase tracking-widest text-[var(--color-text-muted)] block mb-1.5">Slug</label>
              <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="ex: penthouse" required className={`w-full ${inputCls}`} />
            </div>
            <div>
              <label className="font-sans text-xs uppercase tracking-widest text-[var(--color-text-muted)] block mb-1.5">Label</label>
              <input value={label} onChange={e => setLabel(e.target.value)} placeholder="ex: Penthouse" required className={`w-full ${inputCls}`} />
            </div>
            <div>
              <label className="font-sans text-xs uppercase tracking-widest text-[var(--color-text-muted)] block mb-1.5">Prefixo do ID</label>
              <input value={prefixo} onChange={e => setPrefixo(e.target.value)} placeholder="ex: ph" maxLength={3} required className={`w-full ${inputCls}`} />
            </div>
            {erro && <p className="font-sans text-xs text-red-500">{erro}</p>}
            <button type="submit" className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-sans font-medium text-xs uppercase tracking-widest px-5 py-2.5 rounded-md transition-colors duration-200 cursor-pointer">
              <Plus className="w-4 h-4" /> Adicionar
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
