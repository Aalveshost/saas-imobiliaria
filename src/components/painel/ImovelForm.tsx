'use client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { ImageUploader } from './ImageUploader'
import type { ImovelCompleto, Categoria, Comodidade } from '@/types/imovel'

const num = (min = 0, msg?: string) =>
  z.preprocess(v => (v === '' ? undefined : Number(v)), z.number({ invalid_type_error: msg }).min(min, msg))

const schema = z.object({
  titulo: z.string().min(3, 'Mínimo 3 caracteres'),
  descricao: z.string().optional(),
  preco: num(1, 'Informe o preço'),
  tipo: z.enum(['alugar', 'venda', 'permuta']),
  cat: z.string().min(1, 'Selecione a categoria'),
  area: num(1, 'Informe a área'),
  quartos: num(0),
  banheiros: num(0),
  vagas: num(0),
  status: z.enum(['ativo', 'inativo', 'vendido']),
  endereco: z.object({
    rua: z.string().optional(),
    numero: z.string().optional(),
    complemento: z.string().optional(),
    bairro: z.string().min(1, 'Informe o bairro'),
    cidade: z.string().min(1, 'Informe a cidade'),
    estado: z.string().min(2, 'Informe o estado'),
    cep: z.string().optional(),
  }),
  contato: z.object({
    nome: z.string().optional(),
    tel: z.string().optional(),
    email: z.string().optional(),
  }),
})

type FormData = z.infer<typeof schema>

interface Props {
  imovel?: ImovelCompleto
  isNew?: boolean
}

type SaveStatus = 'idle' | 'saving' | 'ok' | 'erro'

export function ImovelForm({ imovel, isNew }: Props) {
  const router = useRouter()
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [comodidades, setComodidades] = useState<Comodidade[]>([])
  const [selectedComodidades, setSelectedComodidades] = useState<string[]>(imovel?.comodidades || [])
  const [fotos, setFotos] = useState<string[]>(imovel?.fotos || [])
  const [savedId, setSavedId] = useState(imovel?.id || '')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [erroMsg, setErroMsg] = useState('')
  const [precoCents, setPrecoCents] = useState(() =>
    imovel?.preco ? Math.round(imovel.preco * 100) : 0
  )
  const [videoUrl, setVideoUrl] = useState(imovel?.videoUrl || '')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: imovel ? {
      titulo: imovel.titulo,
      descricao: imovel.descricao,
      preco: imovel.preco,
      tipo: imovel.tipo,
      cat: imovel.cat,
      area: imovel.area,
      quartos: imovel.quartos,
      banheiros: imovel.banheiros,
      vagas: imovel.vagas,
      status: imovel.status,
      endereco: {
        rua: imovel.endereco?.rua || '',
        numero: imovel.endereco?.numero || '',
        complemento: imovel.endereco?.complemento || '',
        bairro: imovel.endereco?.bairro || '',
        cidade: imovel.endereco?.cidade || '',
        estado: imovel.endereco?.estado || '',
        cep: imovel.endereco?.cep || '',
      },
      contato: {
        nome: imovel.contato?.nome || '',
        tel: imovel.contato?.tel || '',
        email: imovel.contato?.email || '',
      },
    } : {
      tipo: 'alugar',
      status: 'ativo',
      quartos: 0,
      banheiros: 0,
      vagas: 0,
      endereco: { rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '' },
      contato: { nome: '', tel: '', email: '' },
    },
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/categorias').then(r => r.json()),
      fetch('/api/admin/comodidades').then(r => r.json()),
    ]).then(([cats, coms]) => {
      setCategorias(cats)
      setComodidades(coms)
      // re-aplica cat após opções carregarem (evita select vazio no editar)
      if (imovel?.cat) setValue('cat', imovel.cat)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function buscarCep(cep: string) {
    const digits = cep.replace(/\D/g, '')
    if (digits.length !== 8) return
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const data = await res.json()
      if (data.erro) return
      setValue('endereco.rua', data.logradouro || '')
      setValue('endereco.bairro', data.bairro || '')
      setValue('endereco.cidade', data.localidade || '')
      setValue('endereco.estado', data.uf || '')
    } catch { /* silencioso */ }
  }

  async function onSubmit(data: FormData) {
    setSaveStatus('saving')
    setErroMsg('')

    const payload = {
      ...imovel,
      titulo: data.titulo,
      descricao: data.descricao || '',
      preco: precoCents / 100,
      tipo: data.tipo,
      cat: data.cat,
      area: data.area,
      quartos: data.quartos,
      banheiros: data.banheiros,
      vagas: data.vagas,
      status: data.status,
      comodidades: selectedComodidades,
      fotos,
      endereco: {
        rua: data.endereco.rua || '',
        numero: data.endereco.numero || '',
        complemento: data.endereco.complemento || '',
        bairro: data.endereco.bairro,
        cidade: data.endereco.cidade,
        estado: data.endereco.estado,
        cep: data.endereco.cep || '',
      },
      contato: {
        nome: data.contato.nome || '',
        tel: data.contato.tel || '',
        email: data.contato.email || '',
      },
      videoUrl: videoUrl.trim() || undefined,
    }

    const url = isNew ? '/api/admin/imoveis' : `/api/admin/imoveis/${imovel!.id}`
    const method = isNew ? 'POST' : 'PUT'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const json = await res.json()

    if (json.ok) {
      setSaveStatus('ok')

      // Exporta sitemap para R2 em background
      fetch('/api/admin/export-sitemap', { method: 'POST' })
        .then(r => r.json())
        .then(result => console.log('[Sitemap]', result.message || result.ok))
        .catch(err => console.error('[Sitemap] Erro:', err))

      if (isNew && json.id) {
        setSavedId(json.id)
        setTimeout(() => router.push(`/painel/imoveis/${json.id}`), 1000)
      }
    } else {
      setSaveStatus('erro')
      setErroMsg(json.revertido ? 'Erro ao salvar. Arquivo revertido automaticamente.' : (json.erro || 'Erro ao salvar'))
    }
  }

  function toggleComodidade(slug: string) {
    setSelectedComodidades(prev =>
      prev.includes(slug) ? prev.filter(c => c !== slug) : [...prev, slug]
    )
  }

  const inputCls = "w-full font-sans text-sm bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] px-3 py-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-colors duration-200"
  const labelCls = "font-sans text-xs uppercase tracking-widest text-[var(--color-text-muted)] block mb-1.5"
  const errCls = "font-sans text-xs text-red-500 mt-1"

  return (
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" className="space-y-6">
      {/* Informações principais */}
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl p-6">
        <h2 className="font-display font-semibold text-[var(--color-text)] text-lg mb-5">Informações Principais</h2>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className={labelCls}>Título *</label>
            <input {...register('titulo')} placeholder="Ex: Apartamento 3 quartos Moema" className={inputCls} />
            {errors.titulo && <p className={errCls}>{errors.titulo.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Descrição</label>
            <textarea {...register('descricao')} rows={4} placeholder="Descreva o imóvel..." className={`${inputCls} resize-none`} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Tipo de Negócio *</label>
              <select {...register('tipo')} className={`${inputCls} cursor-pointer`}>
                <option value="alugar">Alugar</option>
                <option value="venda">Venda</option>
                <option value="permuta">Permuta</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Categoria *</label>
              <select {...register('cat')} className={`${inputCls} cursor-pointer`}>
                <option value="">Selecionar...</option>
                {categorias.map(c => (
                  <option key={c.slug} value={c.slug}>{c.label}</option>
                ))}
              </select>
              {errors.cat && <p className={errCls}>{errors.cat.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select {...register('status')} className={`${inputCls} cursor-pointer`}>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="vendido">Vendido</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Características */}
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl p-6">
        <h2 className="font-display font-semibold text-[var(--color-text)] text-lg mb-5">Características</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div>
            <label className={labelCls}>Preço (R$) *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)] pointer-events-none select-none">R$</span>
              <input
                type="text"
                inputMode="numeric"
                value={precoCents > 0 ? (precoCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}
                onChange={e => {
                  const digits = e.target.value.replace(/\D/g, '')
                  const cents = parseInt(digits || '0', 10)
                  setPrecoCents(cents)
                  setValue('preco', cents / 100)
                }}
                placeholder="0,00"
                className={`${inputCls} pl-9`}
              />
            </div>
            {errors.preco && <p className={errCls}>{errors.preco.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Área (m²) *</label>
            <input type="number" {...register('area')} className={inputCls} />
            {errors.area && <p className={errCls}>{errors.area.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Quartos</label>
            <input type="number" min={0} {...register('quartos')} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Banheiros</label>
            <input type="number" min={0} {...register('banheiros')} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Vagas</label>
            <input type="number" min={0} {...register('vagas')} className={inputCls} />
          </div>
        </div>
      </div>

      {/* Endereço */}
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl p-6">
        <h2 className="font-display font-semibold text-[var(--color-text)] text-lg mb-5">Endereço</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className={labelCls}>Rua</label>
            <input {...register('endereco.rua')} autoComplete="off" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Número</label>
            <input {...register('endereco.numero')} autoComplete="off" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Complemento</label>
            <input {...register('endereco.complemento')} autoComplete="off" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Bairro *</label>
            <input {...register('endereco.bairro')} className={inputCls} />
            {errors.endereco?.bairro && <p className={errCls}>{errors.endereco.bairro.message}</p>}
          </div>
          <div>
            <label className={labelCls}>CEP</label>
            <input
              {...register('endereco.cep')}
              className={inputCls}
              placeholder="00000-000"
              onBlur={e => buscarCep(e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Cidade *</label>
            <input {...register('endereco.cidade')} className={inputCls} />
            {errors.endereco?.cidade && <p className={errCls}>{errors.endereco.cidade.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Estado *</label>
            <input {...register('endereco.estado')} maxLength={2} placeholder="SP" className={inputCls} />
          </div>
        </div>
      </div>

      {/* Comodidades */}
      {comodidades.length > 0 && (
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl p-6">
          <h2 className="font-display font-semibold text-[var(--color-text)] text-lg mb-5">Comodidades</h2>
          <div className="flex flex-wrap gap-2">
            {comodidades.map(c => (
              <button
                key={c.slug}
                type="button"
                onClick={() => toggleComodidade(c.slug)}
                className={`font-sans text-sm px-4 py-2 rounded-md border transition-colors duration-200 cursor-pointer ${
                  selectedComodidades.includes(c.slug)
                    ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                    : 'bg-[var(--color-bg-subtle)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fotos */}
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl p-6">
        <h2 className="font-display font-semibold text-[var(--color-text)] text-lg mb-5">Fotos</h2>
        {savedId ? (
          <ImageUploader imovelId={savedId} fotos={fotos} onChange={setFotos} />
        ) : (
          <p className="font-sans text-sm text-[var(--color-text-muted)]">
            Salve o imóvel primeiro para adicionar fotos.
          </p>
        )}
      </div>

      {/* Vídeo */}
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl p-6">
        <h2 className="font-display font-semibold text-[var(--color-text)] text-lg mb-5">Vídeo</h2>
        <div>
          <label className={labelCls}>Link do YouTube (opcional)</label>
          <input
            type="url"
            value={videoUrl}
            onChange={e => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            autoComplete="off"
            className={inputCls}
          />
          <p className="font-sans text-xs text-[var(--color-text-faint)] mt-1">
            Cole a URL do YouTube. O vídeo aparecerá sem autoplay na página do imóvel.
          </p>
        </div>
      </div>

      {/* Contato */}
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl p-6">
        <h2 className="font-display font-semibold text-[var(--color-text)] text-lg mb-5">Contato</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Nome do Corretor</label>
            <input {...register('contato.nome')} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Telefone</label>
            <input {...register('contato.tel')} placeholder="11999999999" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>E-mail</label>
            <input type="email" {...register('contato.email')} className={inputCls} />
          </div>
        </div>
      </div>

      {/* Botão salvar */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saveStatus === 'saving'}
          className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:opacity-60 text-white font-sans font-medium text-sm uppercase tracking-widest px-8 py-3 rounded-md transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed"
        >
          {saveStatus === 'saving' ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
          ) : (
            <><Save className="w-4 h-4" /> Salvar</>
          )}
        </button>

        {saveStatus === 'ok' && (
          <span className="flex items-center gap-1.5 font-sans text-sm text-green-500">
            <CheckCircle className="w-4 h-4" /> Salvo com sucesso
          </span>
        )}
        {saveStatus === 'erro' && (
          <span className="flex items-center gap-1.5 font-sans text-sm text-red-500">
            <AlertCircle className="w-4 h-4" /> {erroMsg}
          </span>
        )}
      </div>
    </form>
  )
}
