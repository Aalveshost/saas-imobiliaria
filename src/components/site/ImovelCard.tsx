import Link from 'next/link'
import Image from 'next/image'
import { BedDouble, Bath, Car, Maximize2, MapPin } from 'lucide-react'
import type { ImovelResumo } from '@/types/imovel'

const tipoLabel: Record<string, string> = {
  alugar: 'ALUGUEL', venda: 'VENDA', permuta: 'PERMUTA',
}
const tipoColor: Record<string, string> = {
  alugar: 'bg-[var(--color-primary)] text-white',
  venda: 'bg-[var(--color-accent)] text-white',
  permuta: 'bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)] border border-[var(--color-border)]',
}

function Spec({ icon: Icon, value, label }: { icon: React.ElementType; value: number | string; label: string }) {
  if (!value || value === 0) return null
  return (
    <span className="flex items-center gap-1.5 font-sans text-sm font-medium text-[var(--color-text)]">
      <Icon className="w-4 h-4 shrink-0 text-[var(--color-primary)]" />
      <span title={label}>{value}</span>
    </span>
  )
}

export function ImovelCard({ imovel }: { imovel: ImovelResumo }) {
  // Fallback se imagem não estiver disponível (legacy cache)
  const imageSrc = imovel.imagem || 'ap001.jpg'

  return (
    <Link href={`/imoveis/${imovel.slug}`} className="group block">
      <article className="bg-[var(--color-bg-card)] rounded-2xl overflow-hidden border border-[var(--color-border-subtle)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">

        {/* Imagem */}
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-bg-subtle)] shrink-0">
          <Image
            src={`/imagem/${imageSrc}`}
            alt={imovel.titulo}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            priority
          />
          <span className={`absolute top-2.5 left-2.5 text-[10px] font-sans font-bold tracking-widest px-2.5 py-1 rounded-md ${tipoColor[imovel.tipo]}`}>
            {tipoLabel[imovel.tipo]}
          </span>
          {imovel.destaque && (
            <span className="absolute top-2.5 right-2.5 text-[10px] font-sans font-bold tracking-widest px-2.5 py-1 rounded-md bg-amber-400 text-amber-900">
              DESTAQUE
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-sans font-semibold text-[var(--color-text)] text-sm leading-snug mb-1 line-clamp-2 min-h-[2.5rem]">
            {imovel.titulo}
          </h3>

          <p className="font-sans font-bold text-[var(--color-primary)] text-base mb-3">
            {imovel.tipo === 'alugar'
              ? `R$ ${imovel.preco.toLocaleString('pt-BR')}/mês`
              : `R$ ${imovel.preco.toLocaleString('pt-BR')}`}
          </p>

          {/* Specs — ícones com tooltip */}
          <div className="flex items-center gap-5 flex-wrap mb-3">
            <Spec icon={BedDouble} value={imovel.quartos} label={`${imovel.quartos} quartos`} />
            <Spec icon={Bath} value={imovel.banheiros} label={`${imovel.banheiros} banheiros`} />
            <Spec icon={Car} value={imovel.vagas} label={`${imovel.vagas} vagas`} />
            <Spec icon={Maximize2} value={imovel.area > 0 ? `${imovel.area}m²` : 0} label={`${imovel.area} m²`} />
          </div>

          {/* Rodapé — bairro + ref */}
          <div className="flex items-center justify-between mt-auto pt-2.5 border-t border-[var(--color-border-subtle)]">
            <span className="flex items-center gap-1 font-sans text-xs text-[var(--color-text-faint)] truncate max-w-[70%]">
              <MapPin className="w-3 h-3 shrink-0" />
              {imovel.bairro || imovel.cidade}
            </span>
            <span className="font-mono text-[10px] text-[var(--color-text-faint)] shrink-0">
              #{imovel.id}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
