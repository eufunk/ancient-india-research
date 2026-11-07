import { Link } from 'react-router-dom'
import { TriangleAlert } from 'lucide-react'
import { content, getEntity } from '../content'
import { AREAS, EVIDENCE, EVIDENCE_IDS, PRIMARY_SOURCE_TYPES, QUESTION_KIND, SECTIONS, STATUS, areaLabel } from '../content/meta'
import { Badge, Card, Empty, EvidenceList, PageHeader, Section } from '../components/ui'
import type { SectionId } from '../content/types'

function Stat({ label, value, hint, to }: { label: string; value: number; hint?: string; to?: string }) {
  const inner = (
    <Card className="h-full transition-colors hover:border-amber-300">
      <div className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</div>
      <div className="mt-1 font-serif text-3xl font-semibold text-stone-900 tabular-nums">{value}</div>
      {hint && <div className="mt-1 text-xs text-stone-500">{hint}</div>}
    </Card>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

export default function Dashboard() {
  const { research, sources, questions, characters, locations, events, texts, problems, entities } = content
  const primary = sources.filter((s) => PRIMARY_SOURCE_TYPES.includes(s.type)).length
  const areasWithContent = new Set(research.map((d) => d.area))
  const recent = [...research].sort((a, b) => (b.updated ?? '').localeCompare(a.updated ?? '')).slice(0, 6)
  const openQ = questions.filter((q) => q.status !== 'answered').slice(0, 6)

  const evCount = EVIDENCE_IDS.map((e) => [e, entities.filter((x) => x.evidence.includes(e)).length] as const)
  const evMax = Math.max(1, ...evCount.map(([, n]) => n))
  const errors = problems.filter((p) => p.level === 'error')

  return (
    <div>
      <PageHeader
        eyebrow="Forschungsarchiv"
        title="Das antike Indien"
        subtitle="Quellenbasierte Recherche zu Veden, Epen, Purāṇas, Kosmologie, Astronomie, Geschichte und Archäologie – mit klarer Trennung von Primärquellenbeleg, wissenschaftlicher Evidenz und traditioneller Überlieferung."
      />

      {problems.length > 0 && (
        <details className={`mb-8 rounded-xl border p-4 text-sm ${errors.length ? 'border-red-200 bg-red-50 text-red-900' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
          <summary className="flex cursor-pointer items-center gap-2 font-medium">
            <TriangleAlert size={16} /> {errors.length} Fehler, {problems.length - errors.length} Warnungen in den Daten
          </summary>
          <ul className="mt-3 list-disc space-y-1 pl-6">
            {problems.map((p, i) => <li key={i}><code>{p.where}</code>: {p.message}</li>)}
          </ul>
        </details>
      )}

      <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
        <Stat label="Kurskapitel" value={content.chapters.length} hint={`in ${content.modules.length} Modulen`} to="/kurse" />
        <Stat label="Themen" value={research.length} hint="Forschungsdokumente" />
        <Stat label="Quellen" value={sources.length} to="/quellen" />
        <Stat label="Primärquellen" value={primary} hint="inkl. Editionen & Übersetzungen" to="/quellen" />
        <Stat label="Bereiche" value={Object.keys(AREAS).length} hint={`${areasWithContent.size} mit Inhalten`} />
        <Stat label="Figuren" value={characters.length} to="/figuren" />
        <Stat label="Orte · Ereignisse" value={locations.length + events.length} hint={`${texts.length} Schriften erfasst`} to="/zeitleiste" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {content.chapters.length > 0 && (
            <Section title="Kurs: Das antike Indien" aside={<Link to="/kurse" className="text-sm text-amber-900">alle Module →</Link>}>
              <ol className="grid gap-3 sm:grid-cols-2">
                {content.chapters.slice(0, 6).map((c) => {
                  const m = content.modules.find((x) => x.id === c.module)
                  return (
                    <li key={c.id}>
                      <Link to={`/kapitel/${c.id}`} className="block h-full rounded-xl border border-stone-200 bg-white p-4 hover:border-amber-300">
                        <span className="text-xs uppercase tracking-wide text-stone-500">Modul {m?.order} · {m?.title}</span>
                        <span className="mt-1 block font-serif text-lg font-semibold text-stone-900">{c.title}</span>
                        {c.summary && <p className="mt-1 line-clamp-2 text-sm text-stone-600">{c.summary}</p>}
                      </Link>
                    </li>
                  )
                })}
              </ol>
            </Section>
          )}
          <Section title="Zuletzt bearbeitete Erkenntnisse">
            {recent.length === 0 ? <Empty>Noch keine Forschungsdokumente vorhanden.</Empty> : (
              <ul className="divide-y divide-stone-100 rounded-xl border border-stone-200 bg-white">
                {recent.map((d) => (
                  <li key={d.id}>
                    <Link to={`/forschung/${d.id}`} className="block p-4 hover:bg-stone-50">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-serif text-lg font-semibold text-stone-900">{d.title}</span>
                        <span className="text-xs text-stone-500">{areaLabel(d.area)} · {d.updated ?? '–'}</span>
                      </div>
                      {d.summary && <p className="mt-1 line-clamp-2 text-sm text-stone-600">{d.summary}</p>}
                      <div className="mt-2 flex flex-wrap gap-1.5"><Badge>{STATUS[d.status]}</Badge><EvidenceList list={d.evidence} /></div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Thematische Übersicht">
            <div className="grid gap-4 sm:grid-cols-2">
              {(Object.entries(SECTIONS) as [SectionId, (typeof SECTIONS)[SectionId]][]).map(([id, s]) => {
                const areas = Object.entries(AREAS).filter(([, a]) => a.section === id)
                return (
                  <Link key={id} to={s.path}>
                    <Card className="h-full transition-colors hover:border-amber-300">
                      <h3 className="font-serif text-lg font-semibold text-stone-900">{s.label}</h3>
                      <p className="mt-1 text-sm text-stone-600">{s.desc}</p>
                      <ul className="mt-3 flex flex-wrap gap-1.5">
                        {areas.map(([a, m]) => {
                          const n = research.filter((d) => d.area === a).length
                          return <Badge key={a} cls={n ? 'bg-amber-50 text-amber-900 ring-amber-200' : undefined}>{m.label} · {n}</Badge>
                        })}
                      </ul>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </Section>
        </div>

        <div>
          <Section title="Aktuelle Forschungsfragen" aside={<Link to="/fragen" className="text-sm text-amber-900">alle →</Link>}>
            {openQ.length === 0 ? <Empty>Keine offenen Fragen erfasst.</Empty> : (
              <ul className="space-y-3">
                {openQ.map((q) => (
                  <li key={q.id}>
                    <Link to={`/fragen/${q.id}`} className="block rounded-xl border border-stone-200 bg-white p-3 hover:border-amber-300">
                      <span className="text-xs text-stone-500">{QUESTION_KIND[q.kind] ?? q.kind}</span>
                      <p className="text-sm text-stone-800">{q.question}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Evidenzkategorien">
            <Card>
              <ul className="space-y-2.5">
                {evCount.map(([e, n]) => (
                  <li key={e} title={EVIDENCE[e].desc}>
                    <div className="flex justify-between text-sm"><span>{EVIDENCE[e].label}</span><span className="tabular-nums text-stone-500">{n}</span></div>
                    <div className="mt-1 h-1.5 rounded-full bg-stone-100">
                      <div className="h-1.5 rounded-full" style={{ width: `${(n / evMax) * 100}%`, background: EVIDENCE[e].color }} />
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-stone-500">Anzahl der Einträge (Dokumente, Texte, Figuren, Orte, Ereignisse), die eine Kategorie tragen.</p>
            </Card>
          </Section>

          {getEntity('yuga-system') && (
            <Section title="Schnellzugriff">
              <Card className="space-y-1 text-sm">
                <Link className="block text-amber-900 hover:underline" to="/kosmologie">Interaktives Yuga-Diagramm →</Link>
                <Link className="block text-amber-900 hover:underline" to="/zeitleiste">Zeitleiste: Tradition vs. Wissenschaft →</Link>
                <Link className="block text-amber-900 hover:underline" to="/figuren">Genealogie der Kuru →</Link>
              </Card>
            </Section>
          )}
        </div>
      </div>
    </div>
  )
}
