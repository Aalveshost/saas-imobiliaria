import { storageGet } from '@/lib/storage'
import { ImovelForm } from '@/components/painel/ImovelForm'
import { notFound } from 'next/navigation'
import type { ImovelCompleto, ListaImoveis } from '@/types/imovel'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function EditarImovelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const raw = await storageGet('imoveis.json')
  if (!raw) return notFound()

  const lista: ListaImoveis = JSON.parse(raw)
  const resumo = lista.imoveis.find(i => i.id === id)
  if (!resumo) return notFound()

  const detalheRaw = await storageGet(`imoveis/${resumo.tipo}/${resumo.cat}/${id}.json`)
  if (!detalheRaw) return notFound()

  const imovel: ImovelCompleto = JSON.parse(detalheRaw)

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/painel/imoveis"
          className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-200 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display font-semibold text-[var(--color-text)] text-2xl">Editar Imóvel</h1>
          <p className="font-sans text-xs text-[var(--color-text-faint)] mt-0.5 font-mono">{id}</p>
        </div>
      </div>
      <ImovelForm imovel={imovel} />
    </div>
  )
}
