import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  BookOpen, CalendarRange, GraduationCap, CircleHelp, Landmark, LayoutDashboard, Library, Lightbulb,
  MapPin, Menu, Orbit, Search, Users, X,
} from 'lucide-react'
import { search } from '../content'
import { KIND } from '../content/meta'

const NAV = [
  { to: '/', label: 'Übersicht', icon: LayoutDashboard },
  { to: '/kurse', label: 'Kurse & Kapitel', icon: GraduationCap },
  { to: '/schriften', label: 'Schriften', icon: BookOpen },
  { to: '/geschichte', label: 'Geschichte & Archäologie', icon: Landmark },
  { to: '/kosmologie', label: 'Kosmologie & Astronomie', icon: Orbit },
  { to: '/philosophie', label: 'Philosophie & Wissen', icon: Lightbulb },
  { to: '/figuren', label: 'Figuren & Genealogie', icon: Users },
  { to: '/zeitleiste', label: 'Zeitleiste', icon: CalendarRange },
  { to: '/geografie', label: 'Geografie', icon: MapPin },
  { to: '/quellen', label: 'Quellen', icon: Library },
  { to: '/fragen', label: 'Forschungsfragen', icon: CircleHelp },
]

function SearchBox() {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const results = useMemo(() => (q.trim().length >= 2 ? search(q, 8) : []), [q])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
        e.preventDefault()
        ref.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const go = (path: string) => {
    setOpen(false)
    setQ('')
    ref.current?.blur()
    navigate(path)
  }

  return (
    <div className="relative w-full max-w-xl">
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
      <input
        ref={ref}
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && q.trim()) go(`/suche?q=${encodeURIComponent(q.trim())}`)
          if (e.key === 'Escape') { setOpen(false); ref.current?.blur() }
        }}
        placeholder="Suche in Texten, Figuren, Orten, Quellen …  ( / )"
        className="w-full rounded-lg border border-stone-300 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-stone-400 focus:border-amber-500 focus:outline-none"
      />
      {open && q.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-stone-200 bg-white shadow-lg">
          {results.length === 0 ? (
            <p className="p-3 text-sm text-stone-500">Keine Treffer.</p>
          ) : (
            <ul>
              {results.map((r) => (
                <li key={r.id}>
                  <button
                    onMouseDown={(e) => { e.preventDefault(); go(r.href) }}
                    className="flex w-full items-baseline justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-amber-50"
                  >
                    <span className="truncate text-stone-800">{r.title}</span>
                    <span className="shrink-0 text-xs text-stone-500">{KIND[r.kind].label}</span>
                  </button>
                </li>
              ))}
              <li className="border-t border-stone-100">
                <button
                  onMouseDown={(e) => { e.preventDefault(); go(`/suche?q=${encodeURIComponent(q.trim())}`) }}
                  className="w-full px-3 py-2 text-left text-xs text-amber-900 hover:bg-amber-50"
                >
                  Alle Ergebnisse anzeigen →
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default function Layout() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => { setOpen(false); window.scrollTo(0, 0) }, [pathname])

  return (
    <div className="min-h-screen">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-stone-200 bg-white transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Link to="/" className="block">
            <span className="block font-serif text-lg font-semibold leading-tight text-stone-900">Ancient India</span>
            <span className="block text-xs uppercase tracking-widest text-amber-800">Research Archive</span>
          </Link>
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Menü schließen"><X size={20} /></button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 pb-6">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-amber-50 font-medium text-amber-900' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'}`}
            >
              <Icon size={17} strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>
        <p className="border-t border-stone-100 px-5 py-4 text-xs text-stone-400">
          Lokales Forschungsarchiv · Inhalte aus <code>research/</code> und <code>data/</code>
        </p>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-stone-900/20 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-stone-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-8">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Menü öffnen"><Menu size={22} /></button>
          <SearchBox />
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
