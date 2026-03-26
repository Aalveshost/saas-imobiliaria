import { Building2 } from 'lucide-react'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-card)]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-5 h-5 text-[var(--color-primary)]" />
              <span className="font-display font-bold text-[var(--color-primary)] text-lg">
                Imobiliária
              </span>
            </div>
            <p className="font-sans text-sm text-[var(--color-text-muted)] max-w-xs">
              Imóveis de alto padrão com atendimento exclusivo.
            </p>
          </div>
          <div className="flex gap-12">
            <div>
              <p className="font-sans font-semibold text-xs uppercase tracking-widest text-[var(--color-text)] mb-4">
                Buscar
              </p>
              <div className="flex flex-col gap-2">
                {[
                  { href: '/imoveis?tipo=alugar', label: 'Alugar' },
                  { href: '/imoveis?tipo=venda', label: 'Comprar' },
                  { href: '/imoveis?tipo=permuta', label: 'Permuta' },
                ].map(l => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="font-sans text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-200 cursor-pointer"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-[var(--color-border-subtle)]">
          <p className="font-sans text-xs text-[var(--color-text-faint)]">
            &copy; {new Date().getFullYear()} SaaS Imobiliário. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
