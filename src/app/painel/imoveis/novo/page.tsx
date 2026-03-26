import { ImovelForm } from '@/components/painel/ImovelForm'

export default function NovoImovelPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display font-semibold text-[var(--color-text)] text-2xl">Novo Imóvel</h1>
        <p className="font-sans text-sm text-[var(--color-text-muted)] mt-1">Preencha os dados do imóvel</p>
      </div>
      <ImovelForm isNew />
    </div>
  )
}
