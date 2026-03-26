'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Search, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { ImovelCard } from '@/components/site/ImovelCard'
import { useImoveis } from '@/hooks/useImoveis'

export default function Home() {
  const { imoveis, loading } = useImoveis()
  const [busca, setBusca] = useState('')
  const [tipo, setTipo] = useState('')
  const router = useRouter()

  const recAluguel = imoveis.filter(i => i.tipo === 'alugar').slice(0, 6)
  const recVenda = imoveis.filter(i => i.tipo === 'venda').slice(0, 6)
  const destaques = imoveis.filter(i => i.destaque).slice(0, 6)

  function handleBusca(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (busca) params.set('q', busca)
    if (tipo) params.set('tipo', tipo)
    router.push(`/imoveis?${params.toString()}`)
  }

  return (
    <>
      {/* ─── Hero ─── */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #060C1A 0%, #0F1F3D 45%, #0A0E1A 100%)' }}
      >
        {/* Blobs decorativos */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-[#1E3A8A]/25 blur-[120px]" />
          <div className="absolute bottom-1/3 -left-20 w-[400px] h-[400px] rounded-full bg-[#B45309]/15 blur-[100px]" />
        </div>
        {/* Grade decorativa sutil */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 max-w-4xl w-full text-center">
          <span className="inline-block font-sans text-[11px] uppercase tracking-[0.4em] text-[#D97706] border border-[#D97706]/30 px-5 py-1.5 rounded-full mb-7">
            Imóveis de Alto Padrão
          </span>

          <h1
            className="font-display font-bold text-white leading-[1.05] mb-6"
            style={{ fontSize: 'clamp(2.8rem, 8vw, 6rem)', letterSpacing: '-0.025em' }}
          >
            Encontre o imóvel<br />
            <span style={{ color: '#D97706' }}>dos seus sonhos</span>
          </h1>

          <p className="font-sans text-white/55 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
            Apartamentos, casas e imóveis exclusivos para alugar, comprar ou permutar.
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleBusca}
            className="flex flex-col sm:flex-row gap-2 sm:gap-0 bg-white/8 backdrop-blur-md border border-white/15 rounded-2xl p-2 shadow-2xl"
          >
            <select
              value={tipo}
              onChange={e => setTipo(e.target.value)}
              className="bg-white/10 text-white text-sm px-4 py-3 rounded-xl sm:rounded-none sm:rounded-l-xl focus:outline-none cursor-pointer sm:w-36 border-0 sm:border-r sm:border-white/10"
            >
              <option value="" className="text-black bg-white">Todos</option>
              <option value="alugar" className="text-black bg-white">Alugar</option>
              <option value="venda" className="text-black bg-white">Comprar</option>
              <option value="permuta" className="text-black bg-white">Permuta</option>
            </select>
            <input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Cidade, bairro ou tipo de imóvel..."
              className="flex-1 bg-transparent text-white placeholder:text-white/35 text-sm px-4 py-3 focus:outline-none"
            />
            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-[#B45309] hover:bg-[#D97706] text-white font-sans font-semibold text-xs uppercase tracking-widest px-7 py-3 rounded-xl transition-colors duration-200 cursor-pointer whitespace-nowrap"
            >
              <Search className="w-4 h-4" />
              Buscar
            </button>
          </form>

          {/* Stats */}
          {!loading && imoveis.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mt-12">
              {[
                { n: imoveis.length, label: 'Imóveis' },
                { n: imoveis.filter(i => i.tipo === 'alugar').length, label: 'Para Alugar' },
                { n: imoveis.filter(i => i.tipo === 'venda').length, label: 'Para Venda' },
                { n: imoveis.filter(i => i.destaque).length, label: 'Destaques' },
              ].map((s, i, arr) => (
                <div key={s.label} className="flex items-center gap-6 sm:gap-10">
                  <div className="text-center">
                    <p className="font-display font-bold text-white text-3xl">{s.n}</p>
                    <p className="font-sans text-white/40 text-xs uppercase tracking-widest mt-1">{s.label}</p>
                  </div>
                  {i < arr.length - 1 && <div className="hidden sm:block w-px h-10 bg-white/10" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <div className="w-px h-10 bg-white/40 animate-pulse" />
        </div>
      </section>

      {/* ─── Para Alugar ─── */}
      {(loading || recAluguel.length > 0) && (
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="font-sans text-[11px] uppercase tracking-[0.35em] text-[var(--color-accent)] mb-2">Disponíveis</p>
              <h2 className="font-display font-bold text-[var(--color-text)] text-3xl">Imóveis para Alugar</h2>
            </div>
            <Link href="/imoveis?tipo=alugar" className="flex items-center gap-1.5 font-sans text-sm font-medium text-[var(--color-primary)] hover:opacity-80 transition-opacity">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? [...Array(6)].map((_, i) => <div key={i} className="bg-[var(--color-bg-subtle)] rounded-2xl aspect-[4/5] animate-pulse" />)
              : recAluguel.map(i => <ImovelCard key={i.id} imovel={i} />)
            }
          </div>
        </section>
      )}

      {/* ─── Para Venda ─── */}
      {(loading || recVenda.length > 0) && (
        <section className="py-20 px-6" style={{ background: 'var(--color-bg-subtle)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="font-sans text-[11px] uppercase tracking-[0.35em] text-[var(--color-accent)] mb-2">À Venda</p>
                <h2 className="font-display font-bold text-[var(--color-text)] text-3xl">Imóveis para Comprar</h2>
              </div>
              <Link href="/imoveis?tipo=venda" className="flex items-center gap-1.5 font-sans text-sm font-medium text-[var(--color-primary)] hover:opacity-80 transition-opacity">
                Ver todos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading
                ? [...Array(6)].map((_, i) => <div key={i} className="bg-[var(--color-bg-card)] rounded-2xl aspect-[4/5] animate-pulse" />)
                : recVenda.map(i => <ImovelCard key={i.id} imovel={i} />)
              }
            </div>
          </div>
        </section>
      )}

      {/* ─── Destaques ─── */}
      {(loading || destaques.length > 0) && (
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="font-sans text-[11px] uppercase tracking-[0.35em] text-[var(--color-accent)] mb-2">Selecionados</p>
              <h2 className="font-display font-bold text-[var(--color-text)] text-3xl">Imóveis em Destaque</h2>
            </div>
            <Link href="/imoveis" className="flex items-center gap-1.5 font-sans text-sm font-medium text-[var(--color-primary)] hover:opacity-80 transition-opacity">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? [...Array(6)].map((_, i) => <div key={i} className="bg-[var(--color-bg-subtle)] rounded-2xl aspect-[4/5] animate-pulse" />)
              : destaques.map(i => <ImovelCard key={i.id} imovel={i} />)
            }
          </div>
        </section>
      )}

      {/* ─── CTA ─── */}
      <section
        className="relative py-28 px-6 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #172E6C 100%)' }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-[#D97706]/10 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <p className="font-sans text-[11px] uppercase tracking-[0.4em] text-[#D97706] mb-4">Atendimento exclusivo</p>
          <h2 className="font-display font-bold text-white text-4xl sm:text-5xl mb-5 leading-tight">
            Pronto para encontrar seu lar?
          </h2>
          <p className="font-sans text-white/55 mb-10 text-base leading-relaxed">
            {imoveis.length > 0 ? `${imoveis.length} imóveis disponíveis.` : 'Curadoria de imóveis exclusivos.'} Fale com nossos especialistas.
          </p>
          <Link
            href="/imoveis"
            className="inline-flex items-center gap-2 bg-[#B45309] hover:bg-[#D97706] text-white font-sans font-semibold text-sm uppercase tracking-widest px-10 py-4 rounded-xl transition-colors duration-200"
          >
            Explorar Imóveis
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
