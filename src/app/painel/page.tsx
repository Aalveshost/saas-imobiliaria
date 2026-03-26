import { storageGet } from '@/lib/storage'
import { Building2, TrendingUp, Star, Eye } from 'lucide-react'
import Link from 'next/link'

export default async function PainelDashboard() {
  const raw = await storageGet('imoveis.json')
  const lista = raw ? JSON.parse(raw) : { imoveis: [], total: 0 }

  const ativos = lista.imoveis.filter((i: { status: string }) => i.status !== 'inativo').length
  const destaques = lista.imoveis.filter((i: { destaque: boolean }) => i.destaque).length
  const aluguel = lista.imoveis.filter((i: { tipo: string }) => i.tipo === 'alugar').length
  const venda = lista.imoveis.filter((i: { tipo: string }) => i.tipo === 'venda').length

  const cards = [
    { label: 'Total de Imóveis', value: lista.total, icon: Building2, color: 'text-[var(--color-primary)]' },
    { label: 'Ativos', value: ativos, icon: TrendingUp, color: 'text-green-500' },
    { label: 'Destaques', value: destaques, icon: Star, color: 'text-yellow-500' },
    { label: 'Para Alugar', value: aluguel, icon: Eye, color: 'text-[var(--color-accent)]' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-semibold text-[var(--color-text)] text-2xl">Dashboard</h1>
        <p className="font-sans text-sm text-[var(--color-text-muted)] mt-1">
          Visão geral do portfólio
        </p>
      </div>

      {/* Cards métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="font-sans text-xs uppercase tracking-widest text-[var(--color-text-muted)]">{label}</p>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="font-display font-bold text-[var(--color-text)] text-3xl">{value}</p>
          </div>
        ))}
      </div>

      {/* Ações rápidas */}
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl p-6">
        <h2 className="font-display font-semibold text-[var(--color-text)] text-lg mb-4">Ações Rápidas</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/painel/imoveis/novo"
            className="inline-flex items-center bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-sans font-medium text-xs uppercase tracking-widest px-5 py-2.5 rounded-md transition-colors duration-200 cursor-pointer"
          >
            + Novo Imóvel
          </Link>
          <Link
            href="/painel/imoveis"
            className="inline-flex items-center border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] font-sans font-medium text-xs uppercase tracking-widest px-5 py-2.5 rounded-md transition-colors duration-200 cursor-pointer"
          >
            Ver Listagem ({venda} à venda)
          </Link>
        </div>
      </div>
    </div>
  )
}
