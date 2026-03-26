'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react'
import { ImovelCard } from '@/components/site/ImovelCard'
import { useImoveis } from '@/hooks/useImoveis'
import type { Comodidade, TipoNegocio } from '@/types/imovel'

export const dynamic = 'force-dynamic'

const cats = [
  { slug: '', label: 'Todos os tipos' },
  { slug: 'apartamento', label: 'Apartamento' },
  { slug: 'casa', label: 'Casa' },
  { slug: 'kitnet', label: 'Kitnet' },
  { slug: 'terreno', label: 'Terreno' },
  { slug: 'cobertura', label: 'Cobertura' },
  { slug: 'comercial', label: 'Comercial' },
  { slug: 'chacara', label: 'Chácara' },
  { slug: 'fazenda', label: 'Fazenda' },
  { slug: 'galpao', label: 'Galpão' },
  { slug: 'sala', label: 'Sala' },
]

function ListagemContent() {
  const params = useSearchParams()
  const router = useRouter()
  const { imoveis, loading } = useImoveis()
  const [comodidadesList, setComodidadesList] = useState<Comodidade[]>([])

  // Derivar valores dos params
  const tipoFromUrl = (params.get('tipo') as TipoNegocio) || ''
  const catFromUrl = params.get('cat') || ''
  const qFromUrl = params.get('q') || ''

  // Estados locais sincronizados com URL
  const [tipo, setTipo] = useState<TipoNegocio | ''>('')
  const [cat, setCat] = useState('')
  const [q, setQ] = useState('')

  // Sincronizar com URL
  useEffect(() => {
    setTipo(tipoFromUrl)
  }, [tipoFromUrl])

  useEffect(() => {
    setCat(catFromUrl)
  }, [catFromUrl])

  useEffect(() => {
    setQ(qFromUrl)
  }, [qFromUrl])

  // Debounce para atualizar URL ao digitar (300ms de delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (q !== qFromUrl) {
        const newParams = new URLSearchParams(params.toString())
        if (q) newParams.set('q', q)
        else newParams.delete('q')
        router.push(`?${newParams.toString()}`)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [q, qFromUrl, params, router])

  const [precoMin, setPrecoMin] = useState('')
  const [precoMax, setPrecoMax] = useState('')
  const [quartosMin, setQuartosMin] = useState('')
  const [banheirosMin, setBanheirosMin] = useState('')
  const [vagasMin, setVagasMin] = useState('')
  const [areaMin, setAreaMin] = useState('')
  const [areaMax, setAreaMax] = useState('')
  const [selectedComs, setSelectedComs] = useState<string[]>([])
  const [mostrarAvancado, setMostrarAvancado] = useState(false)
  const [mostrarComs, setMostrarComs] = useState(false)

  // Atualizar URL quando tipo ou categoria mudam
  const handleTipoChange = (novoTipo: TipoNegocio | '') => {
    setTipo(novoTipo) // Atualizar local imediatamente
    // Resetar todos os filtros avançados
    setPrecoMin('')
    setPrecoMax('')
    setQuartosMin('')
    setBanheirosMin('')
    setVagasMin('')
    setAreaMin('')
    setAreaMax('')
    setSelectedComs([])

    const newParams = new URLSearchParams()
    if (novoTipo) newParams.set('tipo', novoTipo)
    else newParams.delete('tipo')
    router.push(`?${newParams.toString()}`)
  }

  const handleCatChange = (novoCat: string) => {
    setCat(novoCat)
    const newParams = new URLSearchParams(params.toString())
    if (novoCat) newParams.set('cat', novoCat)
    else newParams.delete('cat')

    const url = `/imoveis?${newParams.toString()}`
    router.push(url)
  }

  // Detectar mudanças nos params via URL (menu clicks)
  useEffect(() => {
    const novoTipo = (params.get('tipo') as TipoNegocio) || ''
    // Se o tipo mudou, resetar filtros avançados
    if (novoTipo !== tipo) {
      setPrecoMin('')
      setPrecoMax('')
      setQuartosMin('')
      setBanheirosMin('')
      setVagasMin('')
      setAreaMin('')
      setAreaMax('')
      setSelectedComs([])
    }
  }, [params.toString()])

  useEffect(() => {
    fetch('/api/comodidades').then(r => r.json()).then(setComodidadesList).catch(() => {})
  }, [])

  // Filtrar tipos para mostrar apenas os que existem nos imóveis
  const tiposExistentes = useMemo(() => {
    if (imoveis.length === 0) return []

    const tiposSet = new Set<string>()
    imoveis.forEach(i => {
      tiposSet.add(i.tipo)
    })

    return Array.from(tiposSet).sort() as TipoNegocio[]
  }, [imoveis])

  // Filtrar categorias para mostrar apenas as que existem nos imóveis (considerando tipo selecionado)
  const catsExistentes = useMemo(() => {
    if (imoveis.length === 0) return cats.filter(c => c.slug === '')

    // Se tem tipo selecionado, filtrar por esse tipo
    const imovelsFiltrados = tipo ? imoveis.filter(i => i.tipo === tipo) : imoveis

    const catsSet = new Set<string>()
    imovelsFiltrados.forEach(i => {
      catsSet.add(i.cat)
    })

    return cats.filter(c => c.slug === '' || catsSet.has(c.slug))
  }, [imoveis, tipo])

  // Filtrar comodidades para mostrar apenas as que existem nos imóveis
  const comodidadesExistentes = useMemo(() => {
    if (comodidadesList.length === 0 || imoveis.length === 0) return comodidadesList

    const comsNoImoveis = new Set<string>()
    imoveis.forEach(i => {
      (i.comodidades || []).forEach(c => comsNoImoveis.add(c))
    })

    return comodidadesList.filter(c => comsNoImoveis.has(c.slug))
  }, [comodidadesList, imoveis])

  const filtrados = useMemo(() => {
    const normalize = (str: string) =>
      str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

    return imoveis.filter(i => {
      if (tipo && i.tipo !== tipo) return false
      if (cat && i.cat !== cat) return false
      if (precoMin && i.preco < Number(precoMin)) return false
      if (precoMax && i.preco > Number(precoMax)) return false
      if (quartosMin && i.quartos < Number(quartosMin)) return false
      if (banheirosMin && i.banheiros < Number(banheirosMin)) return false
      if (vagasMin && i.vagas < Number(vagasMin)) return false
      if (areaMin && i.area < Number(areaMin)) return false
      if (areaMax && i.area > Number(areaMax)) return false
      if (selectedComs.length > 0 && !selectedComs.every(c => i.comodidades?.includes(c))) return false
      if (q) {
        const hay = normalize(`${i.titulo} ${i.cidade} ${i.bairro} ${i.cat}`)
        if (!hay.includes(normalize(q))) return false
      }
      return true
    })
  }, [imoveis, tipo, cat, q, precoMin, precoMax, quartosMin, banheirosMin, vagasMin, areaMin, areaMax, selectedComs])

  const temFiltro = tipo || cat || q || precoMin || precoMax || quartosMin || banheirosMin || vagasMin || areaMin || areaMax || selectedComs.length > 0

  function limpar() {
    router.push('/imoveis')
    setPrecoMin(''); setPrecoMax('')
    setQuartosMin(''); setBanheirosMin(''); setVagasMin(''); setAreaMin(''); setAreaMax('')
    setSelectedComs([])
  }

  function toggleCom(slug: string) {
    setSelectedComs(prev => prev.includes(slug) ? prev.filter(c => c !== slug) : [...prev, slug])
  }

  const fieldCls = "flex flex-col gap-0.5 px-4 py-3 border-r border-[var(--color-border-subtle)] last:border-r-0"
  const labelCls = "font-sans text-[10px] uppercase tracking-widest text-[var(--color-text-faint)]"
  const inputCls = "bg-transparent text-[var(--color-text)] text-sm font-medium focus:outline-none placeholder:text-[var(--color-text-faint)] w-full"

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <p className="font-sans text-[11px] uppercase tracking-[0.35em] text-[var(--color-accent)] mb-2">Catálogo</p>
        <h1 className="font-display font-bold text-[var(--color-text)] text-3xl">Imóveis Disponíveis</h1>
      </div>

      {/* Barra de filtro principal */}
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl shadow-[var(--shadow-md)] mb-3 overflow-hidden">
        {/* Linha principal */}
        <div className="flex items-stretch overflow-x-auto">
          {/* Busca */}
          <div className="flex flex-row items-center gap-2 px-4 py-3 border-r border-[var(--color-border-subtle)] flex-1 min-w-[160px]">
            <Search className="w-4 h-4 text-[var(--color-text-faint)] shrink-0" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Cidade, bairro, título..." className={inputCls} />
          </div>

          {/* Finalidade */}
          <div className={`${fieldCls} w-36 shrink-0`}>
            <label className={labelCls}>Finalidade</label>
            <select value={tipo} onChange={e => handleTipoChange(e.target.value as TipoNegocio | '')} className={`${inputCls} cursor-pointer`}>
              <option value="">Todos</option>
              {tiposExistentes.includes('alugar') && <option value="alugar">Alugar</option>}
              {tiposExistentes.includes('venda') && <option value="venda">Comprar</option>}
              {tiposExistentes.includes('permuta') && <option value="permuta">Permuta</option>}
            </select>
          </div>

          {/* Tipo imóvel */}
          <div className={`${fieldCls} w-44 shrink-0`}>
            <label className={labelCls}>Tipo</label>
            <select value={cat} onChange={e => handleCatChange(e.target.value)} className={`${inputCls} cursor-pointer`}>
              {catsExistentes.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
            </select>
          </div>

          {/* Preço Mín */}
          <div className={`${fieldCls} w-28 shrink-0`}>
            <label className={labelCls}>Preço Mín</label>
            <input type="number" value={precoMin} onChange={e => setPrecoMin(e.target.value)} placeholder="R$" className={inputCls} />
          </div>

          {/* Preço Máx */}
          <div className={`${fieldCls} w-28 shrink-0`}>
            <label className={labelCls}>Preço Máx</label>
            <input type="number" value={precoMax} onChange={e => setPrecoMax(e.target.value)} placeholder="R$" className={inputCls} />
          </div>

          {/* Botão buscar + limpar */}
          <div className="flex items-center gap-1.5 px-3 shrink-0">
            {temFiltro && (
              <button onClick={limpar} title="Limpar filtros" className="p-2 text-[var(--color-text-faint)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)] rounded-lg transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            )}
            <button className="flex items-center justify-center w-10 h-10 bg-[var(--color-accent)] hover:bg-[var(--color-accent-light)] text-white rounded-xl transition-colors cursor-pointer">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toggle filtros avançados */}
        <div className="border-t border-[var(--color-border-subtle)] px-4 py-2 flex items-center justify-between">
          <button
            onClick={() => setMostrarAvancado(!mostrarAvancado)}
            className="flex items-center gap-1.5 font-sans text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filtros avançados
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${mostrarAvancado ? 'rotate-180' : ''}`} />
          </button>
          <span className="font-sans text-xs text-[var(--color-text-faint)]">
            {loading ? '...' : `${filtrados.length} resultado${filtrados.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        {/* Filtros avançados */}
        {mostrarAvancado && (
          <div className="border-t border-[var(--color-border-subtle)] p-4 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Quartos */}
              <div>
                <label className="font-sans text-xs text-[var(--color-text-muted)] block mb-1.5">Quartos</label>
                <div className="flex gap-1">
                  <button onClick={() => setQuartosMin('')}
                    className={`flex-1 text-xs py-1.5 rounded-md border transition-colors cursor-pointer ${quartosMin === '' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]'}`}>
                    Todos
                  </button>
                  {['1', '2', '3'].map(n => (
                    <button key={n} onClick={() => setQuartosMin(n)}
                      className={`flex-1 text-xs py-1.5 rounded-md border transition-colors cursor-pointer ${quartosMin === n ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              {/* Banheiros */}
              <div>
                <label className="font-sans text-xs text-[var(--color-text-muted)] block mb-1.5">Banheiros</label>
                <div className="flex gap-1">
                  <button onClick={() => setBanheirosMin('')}
                    className={`flex-1 text-xs py-1.5 rounded-md border transition-colors cursor-pointer ${banheirosMin === '' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]'}`}>
                    Todos
                  </button>
                  {['1', '2', '3'].map(n => (
                    <button key={n} onClick={() => setBanheirosMin(n)}
                      className={`flex-1 text-xs py-1.5 rounded-md border transition-colors cursor-pointer ${banheirosMin === n ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              {/* Vagas */}
              <div>
                <label className="font-sans text-xs text-[var(--color-text-muted)] block mb-1.5">Vagas</label>
                <div className="flex gap-1">
                  <button onClick={() => setVagasMin('')}
                    className={`flex-1 text-xs py-1.5 rounded-md border transition-colors cursor-pointer ${vagasMin === '' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]'}`}>
                    Todos
                  </button>
                  {['1', '2', '3'].map(n => (
                    <button key={n} onClick={() => setVagasMin(n)}
                      className={`flex-1 text-xs py-1.5 rounded-md border transition-colors cursor-pointer ${vagasMin === n ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              {/* Área */}
              <div>
                <label className="font-sans text-xs text-[var(--color-text-muted)] block mb-1.5">Área (m²)</label>
                <div className="flex items-center gap-1.5">
                  <input type="number" value={areaMin} onChange={e => setAreaMin(e.target.value)} placeholder="Mín"
                    className="w-full text-xs bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-[var(--color-text)] px-2 py-1.5 rounded-md focus:outline-none" />
                  <span className="text-[var(--color-text-faint)] text-xs">–</span>
                  <input type="number" value={areaMax} onChange={e => setAreaMax(e.target.value)} placeholder="Máx"
                    className="w-full text-xs bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-[var(--color-text)] px-2 py-1.5 rounded-md focus:outline-none" />
                </div>
              </div>
            </div>

            {/* Comodidades — sanfona */}
            {comodidadesExistentes.length > 0 && (
              <div className="border border-[var(--color-border-subtle)] rounded-xl overflow-hidden">
                <button
                  onClick={() => setMostrarComs(!mostrarComs)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left bg-[var(--color-bg-subtle)] hover:bg-[var(--color-bg-card)] transition-colors cursor-pointer"
                >
                  <span className="font-sans text-sm font-medium text-[var(--color-text)]">
                    Comodidades
                    {selectedComs.length > 0 && (
                      <span className="ml-2 text-xs bg-[var(--color-primary)] text-white px-2 py-0.5 rounded-full">{selectedComs.length}</span>
                    )}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform duration-200 ${mostrarComs ? 'rotate-180' : ''}`} />
                </button>
                {mostrarComs && (
                  <div className="p-4 flex flex-wrap gap-2">
                    {comodidadesExistentes.map(c => (
                      <button key={c.slug} onClick={() => toggleCom(c.slug)}
                        className={`font-sans text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${selectedComs.includes(c.slug) ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white' : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]'}`}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Grid — 3 colunas */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-[var(--color-bg-subtle)] rounded-2xl aspect-[4/3] animate-pulse" />)}
        </div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-display text-[var(--color-text-muted)] text-xl mb-2">Nenhum imóvel encontrado</p>
          <p className="font-sans text-sm text-[var(--color-text-faint)]">Tente ajustar os filtros</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtrados.map(i => <ImovelCard key={i.id} imovel={i} />)}
        </div>
      )}
    </div>
  )
}

function ListagemWrapper() {
  const params = useSearchParams()
  // Usar params.toString() como chave para forçar re-mount quando mudarem
  return <ListagemContent key={params.toString()} />
}

export default function ListagemPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-6 py-10"><div className="h-8 w-48 bg-[var(--color-bg-subtle)] rounded animate-pulse mb-8" /></div>}>
      <ListagemWrapper />
    </Suspense>
  )
}
