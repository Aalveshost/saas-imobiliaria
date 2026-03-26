'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, pass }),
      })
      if (res.ok) {
        router.push('/painel')
      } else {
        setErro('Usuário ou senha incorretos')
      }
    } catch {
      setErro('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-navy-950)] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/30 mb-4">
            <Building2 className="w-6 h-6 text-[var(--color-primary)]" />
          </div>
          <h1 className="font-display font-bold text-white text-2xl">Painel Admin</h1>
          <p className="font-sans text-sm text-slate-400 mt-1">SaaS Imobiliário</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[var(--color-navy-900)] border border-[var(--color-navy-800)] rounded-2xl p-6 shadow-[var(--shadow-lg)]">
          <div className="mb-4">
            <label className="font-sans text-xs uppercase tracking-widest text-slate-400 block mb-2">
              Usuário
            </label>
            <input
              value={user}
              onChange={e => setUser(e.target.value)}
              autoComplete="username"
              required
              className="w-full font-sans text-sm bg-[var(--color-navy-800)] border border-[var(--color-navy-700)] text-white placeholder:text-slate-600 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-colors duration-200"
            />
          </div>

          <div className="mb-6">
            <label className="font-sans text-xs uppercase tracking-widest text-slate-400 block mb-2">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={pass}
                onChange={e => setPass(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full font-sans text-sm bg-[var(--color-navy-800)] border border-[var(--color-navy-700)] text-white placeholder:text-slate-600 px-4 py-3 pr-11 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-colors duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {erro && (
            <p className="font-sans text-xs text-red-400 mb-4 text-center">{erro}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:opacity-60 text-white font-sans font-medium text-sm uppercase tracking-widest py-3 rounded-md transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
