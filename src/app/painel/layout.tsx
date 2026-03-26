'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Building2, Home, List, Tag, Star, LogOut } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const navItems = [
  { href: '/painel', label: 'Dashboard', icon: Home, exact: true },
  { href: '/painel/imoveis', label: 'Imóveis', icon: List },
  { href: '/painel/categorias', label: 'Categorias', icon: Tag },
  { href: '/painel/comodidades', label: 'Comodidades', icon: Star },
]

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/painel/login')
  }

  if (pathname === '/painel/login') return <>{children}</>

  return (
    <div className="min-h-screen flex bg-[var(--color-bg)]">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-[var(--color-navy-950)] flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-[var(--color-navy-800)]">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[var(--color-primary)]" />
            <span className="font-display font-bold text-white text-base tracking-wide">
              Imobiliária
            </span>
          </div>
          <p className="font-sans text-xs text-slate-500 mt-0.5">Painel Admin</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const ativo = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-sans text-sm transition-colors duration-200 cursor-pointer ${
                  ativo
                    ? 'bg-[var(--color-primary)]/20 text-white border-l-2 border-[var(--color-primary)] pl-[10px]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Footer sidebar */}
        <div className="px-3 py-4 border-t border-[var(--color-navy-800)]">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-sans text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors duration-200 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-[var(--color-border)] bg-[var(--color-bg-card)]">
          <div />
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="font-sans text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors duration-200 cursor-pointer"
            >
              Ver site
            </Link>
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
