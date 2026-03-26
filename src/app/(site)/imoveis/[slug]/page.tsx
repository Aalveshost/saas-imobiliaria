'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { BedDouble, Bath, Car, Maximize2, MapPin, Phone, Mail, ChevronLeft, ChevronRight } from 'lucide-react'
import { slugParaId } from '@/lib/slug'
import type { ImovelCompleto } from '@/types/imovel'

export default function DetalheImovel() {
  const { slug } = useParams<{ slug: string }>()
  const [imovel, setImovel] = useState<ImovelCompleto | null>(null)
  const [loading, setLoading] = useState(true)
  const [fotoIdx, setFotoIdx] = useState(0)

  useEffect(() => {
    // Extrai ID do slug (ex: "apartamento-3-quartos-moema-ap0001" → "ap-0001")
    const id = slugParaId(slug)
    fetch(`/api/admin/imoveis/${id}`)
      .then(r => r.json())
      .then(setImovel)
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="aspect-video bg-[var(--color-bg-subtle)] rounded-2xl animate-pulse mb-6" />
        <div className="h-8 bg-[var(--color-bg-subtle)] rounded animate-pulse w-2/3 mb-4" />
        <div className="h-6 bg-[var(--color-bg-subtle)] rounded animate-pulse w-1/3" />
      </div>
    )
  }

  if (!imovel) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <p className="font-display text-2xl text-[var(--color-text-muted)]">Imóvel não encontrado</p>
      </div>
    )
  }

  const fotos = imovel.fotos.length > 0
    ? imovel.fotos.map(f => `/img/${imovel.id}/${f}.webp`)
    : [`/imagem/${imovel.imagem}`]

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Galeria */}
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-[var(--color-bg-subtle)] mb-6 group">
        <Image
          src={fotos[fotoIdx]}
          alt={imovel.titulo}
          fill
          className="object-cover"
          priority
        />
        {fotos.length > 1 && (
          <>
            <button
              onClick={() => setFotoIdx(i => (i - 1 + fotos.length) % fotos.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors duration-200 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setFotoIdx(i => (i + 1) % fotos.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors duration-200 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {fotos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setFotoIdx(i)}
                  className={`w-2 h-2 rounded-full transition-colors duration-200 cursor-pointer ${i === fotoIdx ? 'bg-white' : 'bg-white/40'}`}
                />
              ))}
            </div>
          </>
        )}
        {/* Thumbnails */}
        {fotos.length > 1 && (
          <div className="absolute bottom-3 right-3 flex gap-2">
            {fotos.slice(0, 4).map((f, i) => (
              <button
                key={i}
                onClick={() => setFotoIdx(i)}
                className={`w-12 h-12 rounded overflow-hidden border-2 transition-colors cursor-pointer ${i === fotoIdx ? 'border-white' : 'border-transparent'}`}
              >
                <Image src={f} alt="" width={48} height={48} className="object-cover w-full h-full" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna principal */}
        <div className="lg:col-span-2">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <span className="inline-block font-sans text-xs uppercase tracking-widest px-3 py-1 rounded bg-[var(--color-primary)] text-white mb-3">
                {imovel.tipo === 'alugar' ? 'Aluguel' : imovel.tipo === 'venda' ? 'Venda' : 'Permuta'}
              </span>
              <h1 className="font-display font-bold text-[var(--color-text)] text-3xl leading-tight">
                {imovel.titulo}
              </h1>
            </div>
            <p className="font-display font-bold text-[var(--color-primary)] text-2xl whitespace-nowrap">
              R$ {imovel.preco.toLocaleString('pt-BR')}
              {imovel.tipo === 'alugar' && <span className="font-sans font-normal text-base text-[var(--color-text-muted)]">/mês</span>}
            </p>
          </div>

          <div className="flex items-center gap-2 text-[var(--color-text-muted)] mb-6">
            <MapPin className="w-4 h-4" />
            <span className="font-sans text-sm">
              {imovel.endereco.bairro}, {imovel.endereco.cidade} — {imovel.endereco.estado}
            </span>
          </div>

          {/* Características */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { icon: BedDouble, label: 'Quartos', val: imovel.quartos },
              { icon: Bath, label: 'Banheiros', val: imovel.banheiros },
              { icon: Car, label: 'Vagas', val: imovel.vagas },
              { icon: Maximize2, label: 'Área', val: `${imovel.area} m²` },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl p-4 text-center">
                <Icon className="w-5 h-5 text-[var(--color-primary)] mx-auto mb-1" />
                <p className="font-display font-semibold text-[var(--color-text)] text-lg">{val}</p>
                <p className="font-sans text-xs text-[var(--color-text-muted)]">{label}</p>
              </div>
            ))}
          </div>

          {/* Descrição */}
          {imovel.descricao && (
            <div className="mb-8">
              <h2 className="font-display font-semibold text-[var(--color-text)] text-xl mb-3">Sobre o imóvel</h2>
              <p className="font-sans text-[var(--color-text-muted)] leading-relaxed whitespace-pre-line">
                {imovel.descricao}
              </p>
            </div>
          )}

          {/* Vídeo */}
          {imovel.videoUrl && (() => {
            const match = imovel.videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^&?\s]+)/)
            const vid = match?.[1]
            return vid ? (
              <div className="mb-8">
                <h2 className="font-display font-semibold text-[var(--color-text)] text-xl mb-3">Vídeo</h2>
                <div className="relative aspect-video rounded-xl overflow-hidden bg-[var(--color-bg-subtle)]">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${vid}?rel=0&modestbranding=1`}
                    title="Vídeo do imóvel"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              </div>
            ) : null
          })()}

          {/* Comodidades */}
          {imovel.comodidades.length > 0 && (
            <div>
              <h2 className="font-display font-semibold text-[var(--color-text)] text-xl mb-4">Comodidades</h2>
              <div className="flex flex-wrap gap-2">
                {imovel.comodidades.map(c => (
                  <span key={c} className="font-sans text-sm px-3 py-1.5 rounded-md bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-[var(--color-text-muted)]">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar contato */}
        <div>
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-2xl p-6 sticky top-24 shadow-[var(--shadow-card)]">
            <h3 className="font-display font-semibold text-[var(--color-text)] text-lg mb-5">
              Falar com o corretor
            </h3>
            {imovel.contato?.nome && (
              <p className="font-sans font-medium text-[var(--color-text)] mb-4">{imovel.contato.nome}</p>
            )}
            <div className="flex flex-col gap-3">
              {imovel.contato?.tel && (
                <a
                  href={`tel:${imovel.contato.tel}`}
                  className="flex items-center justify-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-sans font-medium text-sm py-3 rounded-md transition-colors duration-200 cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  {imovel.contato.tel}
                </a>
              )}
              {imovel.contato?.email && (
                <a
                  href={`mailto:${imovel.contato.email}`}
                  className="flex items-center justify-center gap-2 border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] font-sans font-medium text-sm py-3 rounded-md transition-colors duration-200 cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  Enviar e-mail
                </a>
              )}
            </div>
            <p className="font-sans text-xs text-[var(--color-text-faint)] mt-4 text-center">
              Ref: {imovel.id}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
