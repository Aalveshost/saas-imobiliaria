'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Building2 } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const links = [
  { href: '/imoveis?tipo=alugar', label: 'Alugar' },
  { href: '/imoveis?tipo=venda', label: 'Comprar' },
  { href: '/imoveis?tipo=permuta', label: 'Permuta' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-4 left-4 right-4 z-50">
      <nav className="max-w-7xl mx-auto bg-white/90 dark:bg-[var(--color-navy-900)]/90 backdrop-blur-md border border-[var(--color-border-subtle)] dark:border-[var(--color-navy-800)] rounded-xl shadow-[var(--shadow-sm)] px-5 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <Building2 className="w-5 h-5 text-[var(--color-primary)]" />
          <span className="font-display font-bold text-[var(--color-primary)] tracking-wide text-lg">
            Imobiliária
          </span>
        </Link>

        {/* Links desktop */}
        <div className="hidden md:flex items-center gap-6">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="font-sans text-sm uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-200 cursor-pointer"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Direita */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/imoveis"
            className="hidden md:inline-flex items-center bg-[var(--color-accent)] hover:bg-[var(--color-accent-light)] text-white font-sans font-medium text-xs uppercase tracking-widest px-4 py-2 rounded-md transition-colors duration-200 cursor-pointer"
          >
            Ver Imóveis
          </Link>
          <button
            className="md:hidden cursor-pointer text-[var(--color-text-muted)]"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden mt-2 max-w-7xl mx-auto bg-white/95 dark:bg-[var(--color-navy-900)]/95 backdrop-blur-md border border-[var(--color-border-subtle)] dark:border-[var(--color-navy-800)] rounded-xl shadow-[var(--shadow-md)] px-5 py-4 flex flex-col gap-4">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="font-sans text-sm uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-200 cursor-pointer"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/imoveis"
            onClick={() => setOpen(false)}
            className="w-full text-center bg-[var(--color-accent)] text-white font-sans font-medium text-xs uppercase tracking-widest px-4 py-2 rounded-md cursor-pointer"
          >
            Ver Imóveis
          </Link>
        </div>
      )}
    </header>
  )
}
