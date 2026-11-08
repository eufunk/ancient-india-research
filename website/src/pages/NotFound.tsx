import { Link, useLocation } from 'react-router-dom'
import { PageHeader } from '../components/ui'
import { search } from '../content'

export default function NotFound() {
  const { pathname } = useLocation()
  const last = decodeURIComponent(pathname.split('/').filter(Boolean).pop() ?? '')
  // Ähnliche Einträge aus dem letzten Pfadteil vorschlagen (z. B. alte oder vertippte IDs)
  const words = last.replace(/^(src|evt|loc|q|kap)-/, '').split('-').filter((w) => w.length > 2 && !/^\d+$/.test(w))
  let hints = words.length ? search(words.join(' '), 6) : []
  if (!hints.length && words.length) hints = search(words[0], 6)
  return (
    <div>
      <PageHeader title="Nicht gefunden" subtitle="Diese Seite oder dieser Eintrag existiert nicht (oder die ID wurde geändert)." />
      <p className="mb-4 text-sm text-stone-600">
        Aufgerufene Adresse: <code className="rounded bg-stone-100 px-1.5 py-0.5">{pathname}</code>
      </p>
      {hints.length > 0 && (
        <div className="mb-6">
          <p className="mb-2 text-sm font-medium text-stone-700">Meinten Sie vielleicht:</p>
          <ul className="space-y-1 text-sm">
            {hints.map((e) => <li key={e.id}><Link to={e.href} className="text-amber-900 hover:underline">{e.title}</Link></li>)}
          </ul>
        </div>
      )}
      <Link to="/" className="text-amber-900 hover:underline">← Zur Übersicht</Link>
    </div>
  )
}
