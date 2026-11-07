import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { CircleCheck, CircleDashed, ExternalLink } from 'lucide-react'
import { EVIDENCE, KIND, QUALITY, SOURCE_TYPE } from '../content/meta'
import { cite, getBacklinks, getEntity } from '../content'
import type { Entity, Evidence, Kind, Source } from '../content/types'

export function Badge({ children, cls = 'bg-stone-100 text-stone-700 ring-stone-200', title }: {
  children: ReactNode; cls?: string; title?: string
}) {
  return (
    <span title={title} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}>
      {children}
    </span>
  )
}

export function EvidenceBadge({ e }: { e: Evidence }) {
  const m = EVIDENCE[e]
  if (!m) return <Badge cls="bg-red-50 text-red-700 ring-red-200">? {e}</Badge>
  return <Badge cls={m.cls} title={m.desc}>{m.label}</Badge>
}

export function EvidenceList({ list }: { list?: Evidence[] }) {
  if (!list?.length) return null
  return <div className="flex flex-wrap gap-1.5">{list.map((e) => <EvidenceBadge key={e} e={e} />)}</div>
}

export function PageHeader({ eyebrow, title, subtitle, children }: {
  eyebrow?: string; title: string; subtitle?: ReactNode; children?: ReactNode
}) {
  return (
    <header className="mb-8 border-b border-stone-200 pb-6">
      {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-800">{eyebrow}</p>}
      <h1 className="font-serif text-3xl font-semibold text-stone-900 sm:text-4xl">{title}</h1>
      {subtitle && <div className="mt-3 max-w-3xl text-stone-600">{subtitle}</div>}
      {children && <div className="mt-4">{children}</div>}
    </header>
  )
}

export function Section({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className="font-serif text-xl font-semibold text-stone-900">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-stone-200 bg-white p-5 ${className}`}>{children}</div>
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-dashed border-stone-300 bg-white/50 p-6 text-sm text-stone-500">{children}</div>
}

export function EntityLink({ id, showKind = false }: { id: string; showKind?: boolean }) {
  const e = getEntity(id)
  if (!e) return <span className="text-red-700" title="Unbekannte ID">⚠ {id}</span>
  return (
    <Link to={e.href} className="text-amber-900 underline decoration-amber-300 underline-offset-2 hover:decoration-amber-700">
      {e.title}
      {showKind && <span className="ml-1 text-xs text-stone-500">({KIND[e.kind].label})</span>}
    </Link>
  )
}

export function EntityCard({ e }: { e: Entity }) {
  return (
    <Link to={e.href} className="group flex flex-col rounded-xl border border-stone-200 bg-white p-4 transition-colors hover:border-amber-300">
      <span className="text-xs font-medium uppercase tracking-wide text-stone-500">{KIND[e.kind].label}</span>
      <span className="mt-1 font-serif text-lg font-semibold text-stone-900 group-hover:text-amber-900">{e.title}</span>
      {e.subtitle && <span className="text-sm text-stone-500">{e.subtitle}</span>}
      {e.summary && <p className="mt-2 line-clamp-3 text-sm text-stone-600">{e.summary}</p>}
      {e.evidence.length > 0 && <div className="mt-3"><EvidenceList list={e.evidence} /></div>}
    </Link>
  )
}

export function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: [string, string][]
}) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-stone-500">
      {label}
      <select
        value={value}
        onChange={(ev) => onChange(ev.target.value)}
        className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-800 focus:border-amber-500 focus:outline-none"
      >
        <option value="">Alle</option>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  )
}

export function FilterBar({ children }: { children: ReactNode }) {
  return <div className="mb-5 flex flex-wrap items-end gap-3 rounded-xl border border-stone-200 bg-white p-3">{children}</div>
}

export function SourceCitation({ s, compact = false }: { s: Source; compact?: boolean }) {
  return (
    <div className="text-sm">
      <Link to={`/quellen/${s.id}`} className="text-stone-800 hover:text-amber-900">{cite(s)}</Link>
      <div className="mt-1 flex flex-wrap items-center gap-1.5">
        <Badge>{SOURCE_TYPE[s.type] ?? s.type}</Badge>
        {QUALITY[s.quality] && <Badge cls={QUALITY[s.quality].cls}>{QUALITY[s.quality].label}</Badge>}
        {s.verified
          ? <Badge cls="bg-emerald-50 text-emerald-800 ring-emerald-200"><CircleCheck size={12} /> bibliogr. geprüft</Badge>
          : <Badge cls="bg-stone-50 text-stone-600 ring-stone-200"><CircleDashed size={12} /> ungeprüft</Badge>}
        {s.url && !compact && (
          <a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-sky-700 hover:underline">
            <ExternalLink size={12} /> Link
          </a>
        )}
      </div>
    </div>
  )
}

export function SourceList({ ids }: { ids: string[] }) {
  if (!ids.length) return <Empty>Keine Quellen angegeben.</Empty>
  return (
    <ol className="space-y-3">
      {ids.map((id) => {
        const e = getEntity(id)
        return (
          <li key={id} className="border-l-2 border-stone-200 pl-3">
            {e?.kind === 'source' ? <SourceCitation s={e.item as Source} /> : <span className="text-red-700">⚠ Unbekannte Quelle „{id}“</span>}
          </li>
        )
      })}
    </ol>
  )
}

function groupByKind(list: Entity[]) {
  const g = new Map<Kind, Entity[]>()
  for (const e of list) g.set(e.kind, [...(g.get(e.kind) ?? []), e])
  return [...g.entries()]
}

export function CrossRefs({ entity }: { entity: Entity }) {
  const out = entity.refs.map((id) => getEntity(id)).filter((e): e is Entity => !!e && e.kind !== 'source')
  const missing = entity.refs.filter((id) => !getEntity(id))
  const incoming = getBacklinks(entity.id)
  if (!out.length && !incoming.length && !missing.length) return null
  const Block = ({ title, list }: { title: string; list: Entity[] }) => (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-stone-700">{title}</h3>
      {list.length === 0 ? <p className="text-sm text-stone-400">–</p> : (
        <dl className="space-y-2">
          {groupByKind(list).map(([k, es]) => (
            <div key={k}>
              <dt className="text-xs uppercase tracking-wide text-stone-500">{KIND[k].plural}</dt>
              <dd className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
                {es.map((e) => <EntityLink key={e.id} id={e.id} />)}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
  return (
    <Section title="Querverweise">
      <Card className="grid gap-6 md:grid-cols-2">
        <Block title="Verweist auf" list={out} />
        <Block title="Wird verwiesen von" list={incoming} />
        {missing.length > 0 && (
          <p className="text-sm text-red-700 md:col-span-2">Nicht auflösbare Verweise: {missing.join(', ')}</p>
        )}
      </Card>
    </Section>
  )
}

export function Meta({ items }: { items: [string, ReactNode][] }) {
  const shown = items.filter(([, v]) => v !== undefined && v !== null && v !== '')
  if (!shown.length) return null
  return (
    <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
      {shown.map(([k, v]) => (
        <div key={k}>
          <dt className="text-xs uppercase tracking-wide text-stone-500">{k}</dt>
          <dd className="mt-0.5 text-stone-800">{v}</dd>
        </div>
      ))}
    </dl>
  )
}
