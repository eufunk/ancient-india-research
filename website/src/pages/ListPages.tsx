import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { content, getBacklinks, getEntity, search } from '../content'
import {
  CHRONOLOGY, EVIDENCE, EVIDENCE_IDS, KIND, LOCATION_KIND, QUALITY, QUESTION_KIND, QUESTION_STATUS,
  SOURCE_TYPE, AREAS, areaLabel, formatYear,
} from '../content/meta'
import { Badge, Card, Empty, EntityCard, EntityLink, EvidenceList, FilterBar, PageHeader, Section, Select } from '../components/ui'
import { Genealogy } from '../components/Genealogy'
import type { Entity, Kind, TimelineEvent } from '../content/types'

// ---------------- Figuren ----------------
export function CharactersPage() {
  const [text, setText] = useState('')
  const { characters, dynasties } = content
  const texts = [...new Set(characters.flatMap((c) => c.texts ?? []))]
  const list = characters.filter((c) => !text || c.texts?.includes(text))
  return (
    <div>
      <PageHeader eyebrow="Datenbank" title="Figuren & Genealogie"
        subtitle="Figuren aus Veden, Epen und Purāṇas. Die Angaben geben den Inhalt der Texte wieder; die Frage der Historizität wird je Figur gesondert gekennzeichnet." />
      <FilterBar>
        <Select label="Text" value={text} onChange={setText} options={texts.map((t) => [t, getEntity(t)?.title ?? t])} />
        <span className="pb-1.5 text-sm text-stone-500">{list.length} Figuren</span>
      </FilterBar>
      {list.length === 0 ? <Empty>Noch keine Figuren in <code>data/characters/</code>.</Empty> : (
        <div className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => <EntityCard key={c.id} e={getEntity(c.id)!} />)}
        </div>
      )}
      {dynasties.map((d) => {
        const people = characters.filter((c) => d.members?.includes(c.id) || c.dynasty === d.id)
        return (
          <Section key={d.id} title={`Genealogie: ${d.name}`} aside={<Link to={`/dynastien/${d.id}`} className="text-sm text-amber-900">Details →</Link>}>
            <Card>{d.summary && <p className="mb-4 text-sm text-stone-600">{d.summary}</p>}<Genealogy people={people} /></Card>
          </Section>
        )
      })}
    </div>
  )
}

// ---------------- Zeitleiste ----------------
function TimelineOverview({ events }: { events: TimelineEvent[] }) {
  if (!events.length) return null
  const min = Math.min(...events.map((e) => e.start))
  const max = Math.max(...events.map((e) => e.end ?? e.start))
  const pad = Math.max(100, (max - min) * 0.04)
  const lo = Math.floor((min - pad) / 500) * 500
  const hi = Math.ceil((max + pad) / 500) * 500
  const W = 1000, rowH = 18, top = 26
  const x = (y: number) => ((y - lo) / (hi - lo)) * W
  const ticks: number[] = []
  for (let t = lo; t <= hi; t += 500) ticks.push(t)
  const H = top + events.length * rowH + 10
  return (
    <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white p-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="min-w-[640px]" role="img" aria-label="Zeitleiste Übersicht">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={top - 6} y2={H} stroke="#e7e5e4" />
            <text x={x(t)} y={12} textAnchor="middle" fontSize="11" fill="#78716c">{t === 0 ? '0' : formatYear(t)}</text>
          </g>
        ))}
        {events.map((e, i) => {
          const y = top + i * rowH
          const trad = e.chronology === 'traditional'
          const col = trad ? '#d97706' : '#0284c7'
          const x1 = x(e.start), x2 = x(e.end ?? e.start)
          return (
            <a key={e.id} href={`#${e.id}`}>
              <title>{`${e.title} – ${e.display}`}</title>
              {e.end !== undefined && e.end !== e.start
                ? <rect x={x1} y={y} width={Math.max(3, x2 - x1)} height={10} rx={3} fill={trad ? 'none' : col} fillOpacity={0.75} stroke={col} strokeDasharray={trad ? '4 2' : undefined} />
                : <circle cx={x1} cy={y + 5} r={5} fill={trad ? '#fff' : col} stroke={col} strokeWidth={2} strokeDasharray={trad ? '3 2' : undefined} />}
              <text x={Math.min(x2 + 8, W - 4)} y={y + 9} fontSize="11" fill="#44403c" textAnchor={x2 + 8 > W - 150 ? 'end' : 'start'}
                dx={x2 + 8 > W - 150 ? -(x2 - x1 + 16) : 0}>{e.title}</text>
            </a>
          )
        })}
      </svg>
    </div>
  )
}

export function TimelinePage() {
  const [chron, setChron] = useState('')
  const [ev, setEv] = useState('')
  const events = content.events.filter((e) => (!chron || e.chronology === chron) && (!ev || e.evidence?.includes(ev as never)))
  return (
    <div>
      <PageHeader eyebrow="Chronologie" title="Zeitleiste" subtitle={
        <>Wissenschaftliche Datierungen (<span className="font-medium text-sky-800">blau, durchgezogen</span>) und traditionelle Chronologien (<span className="font-medium text-amber-800">gold, gestrichelt</span>) werden strikt getrennt dargestellt. Traditionelle Daten sind Bestandteil der Überlieferung, keine historischen Belege.</>
      } />
      <FilterBar>
        <Select label="Chronologie" value={chron} onChange={setChron} options={Object.entries(CHRONOLOGY).map(([k, v]) => [k, v.label])} />
        <Select label="Evidenz" value={ev} onChange={setEv} options={EVIDENCE_IDS.map((e) => [e, EVIDENCE[e].label])} />
      </FilterBar>
      {events.length === 0 ? <Empty>Keine Ereignisse.</Empty> : (
        <>
          <Section title="Übersicht"><TimelineOverview events={events} /></Section>
          <Section title="Ereignisse">
            <ol className="relative space-y-4 border-l border-stone-200 pl-6">
              {events.map((e) => {
                const trad = e.chronology === 'traditional'
                return (
                  <li key={e.id} id={e.id} className="scroll-mt-24">
                    <span className={`absolute -left-[7px] mt-5 h-3.5 w-3.5 rounded-full border-2 ${trad ? 'border-dashed border-amber-500 bg-white' : 'border-sky-500 bg-sky-500'}`} />
                    <div className={`rounded-xl border bg-white p-4 ${trad ? 'border-dashed border-amber-300' : 'border-stone-200'}`}>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <Link to={`/ereignisse/${e.id}`} className="font-serif text-lg font-semibold text-stone-900 hover:text-amber-900">{e.title}</Link>
                        <span className={`text-sm font-medium ${trad ? 'text-amber-800' : 'text-sky-800'}`}>{e.display}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <Badge cls={trad ? 'bg-amber-50 text-amber-800 ring-amber-200' : 'bg-sky-50 text-sky-800 ring-sky-200'}>{CHRONOLOGY[e.chronology].short}</Badge>
                        <EvidenceList list={e.evidence} />
                      </div>
                      {e.summary && <p className="mt-2 text-sm text-stone-600">{e.summary}</p>}
                    </div>
                  </li>
                )
              })}
            </ol>
          </Section>
        </>
      )}
    </div>
  )
}

// ---------------- Geografie ----------------
function GeoPlot() {
  const navigate = useNavigate()
  const pts = content.locations.filter((l) => l.coordinates)
  const [lng0, lng1, lat0, lat1] = [60, 98, 6, 37]
  const W = 620, H = 500
  const x = (lng: number) => ((lng - lng0) / (lng1 - lng0)) * W
  const y = (lat: number) => ((lat1 - lat) / (lat1 - lat0)) * H
  if (!pts.length) return null
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <svg viewBox={`-30 -10 ${W + 40} ${H + 30}`} className="mx-auto max-h-[520px] w-full">
        <rect x={0} y={0} width={W} height={H} fill="#fafaf9" stroke="#e7e5e4" />
        {[65, 70, 75, 80, 85, 90, 95].map((g) => <g key={g}><line x1={x(g)} x2={x(g)} y1={0} y2={H} stroke="#eeeceb" /><text x={x(g)} y={H + 14} fontSize="10" textAnchor="middle" fill="#a8a29e">{g}° O</text></g>)}
        {[10, 15, 20, 25, 30, 35].map((g) => <g key={g}><line x1={0} x2={W} y1={y(g)} y2={y(g)} stroke="#eeeceb" /><text x={-4} y={y(g) + 3} fontSize="10" textAnchor="end" fill="#a8a29e">{g}° N</text></g>)}
        {pts.map((l) => (
          <g key={l.id} className="cursor-pointer" onClick={() => navigate(`/orte/${l.id}`)}>
            <title>{l.name}</title>
            <circle cx={x(l.coordinates![1])} cy={y(l.coordinates![0])} r={5} fill={LOCATION_KIND[l.kind]?.color ?? '#57534e'} stroke="#fff" strokeWidth={1.5} />
            <text x={x(l.coordinates![1]) + 8} y={y(l.coordinates![0]) + 4} fontSize="12" fill="#292524">{l.name}</text>
          </g>
        ))}
      </svg>
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-stone-600">
        {Object.entries(LOCATION_KIND).filter(([k]) => pts.some((p) => p.kind === k)).map(([k, v]) => (
          <span key={k} className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: v.color }} />{v.label}</span>
        ))}
      </div>
      <p className="mt-2 text-xs text-stone-500">Schematische Lagedarstellung nach Koordinaten (ohne Kartenhintergrund, damit die Seite offline funktioniert).</p>
    </div>
  )
}

export function GeographyPage() {
  const [kind, setKind] = useState('')
  const list = content.locations.filter((l) => !kind || l.kind === kind)
  return (
    <div>
      <PageHeader eyebrow="Wissenssammlung" title="Geografie" subtitle="Historische Orte, Königreiche, Flüsse, Städte, archäologische Fundstätten und heilige Orte – mit Angabe, ob eine Identifikation gesichert oder umstritten ist." />
      <Section title="Lage"><GeoPlot /></Section>
      <FilterBar><Select label="Art" value={kind} onChange={setKind} options={Object.entries(LOCATION_KIND).map(([k, v]) => [k, v.label])} /></FilterBar>
      {list.length === 0 ? <Empty>Keine Orte erfasst.</Empty> : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{list.map((l) => <EntityCard key={l.id} e={getEntity(l.id)!} />)}</div>
      )}
    </div>
  )
}

// ---------------- Quellen ----------------
export function SourcesPage() {
  const [type, setType] = useState('')
  const [quality, setQuality] = useState('')
  const [area, setArea] = useState('')
  const list = content.sources.filter((s) => (!type || s.type === type) && (!quality || s.quality === quality) && (!area || s.areas?.includes(area)))
  return (
    <div>
      <PageHeader eyebrow="Verzeichnis" title="Quellen & Referenzen" subtitle="Zentrales Quellenverzeichnis. Quellen mit „ungeprüft“ sind bibliografisch noch nicht am Original verifiziert." />
      <FilterBar>
        <Select label="Quellentyp" value={type} onChange={setType} options={Object.entries(SOURCE_TYPE)} />
        <Select label="Qualität" value={quality} onChange={setQuality} options={Object.entries(QUALITY).map(([k, v]) => [k, v.label])} />
        <Select label="Bereich" value={area} onChange={setArea} options={Object.entries(AREAS).map(([k, v]) => [k, v.label])} />
        <span className="pb-1.5 text-sm text-stone-500">{list.length} Quellen</span>
      </FilterBar>
      {list.length === 0 ? <Empty>Keine Quellen gefunden.</Empty> : (
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
              <tr><th className="px-4 py-3">Autor/Hrsg.</th><th className="px-4 py-3">Titel</th><th className="px-4 py-3">Jahr</th><th className="px-4 py-3">Typ</th><th className="px-4 py-3">Bereiche</th><th className="px-4 py-3">Qualität</th><th className="px-4 py-3 text-right">Verwendet</th></tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {list.map((s) => (
                <tr key={s.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3 align-top">{s.authors?.join(', ')}</td>
                  <td className="px-4 py-3 align-top"><Link to={`/quellen/${s.id}`} className="font-medium text-stone-900 hover:text-amber-900">{s.title}</Link>{s.verified === false && <span className="ml-1 text-xs text-stone-400">(ungeprüft)</span>}</td>
                  <td className="px-4 py-3 align-top tabular-nums">{s.year}</td>
                  <td className="px-4 py-3 align-top">{SOURCE_TYPE[s.type] ?? s.type}</td>
                  <td className="px-4 py-3 align-top text-stone-600">{s.areas?.map(areaLabel).join(', ')}</td>
                  <td className="px-4 py-3 align-top">{QUALITY[s.quality] && <Badge cls={QUALITY[s.quality].cls}>{QUALITY[s.quality].label.replace('Qualität ', '')}</Badge>}</td>
                  <td className="px-4 py-3 text-right align-top tabular-nums">{getBacklinks(s.id).length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ---------------- Forschungsfragen ----------------
export function QuestionsPage() {
  const [kind, setKind] = useState('')
  const [status, setStatus] = useState('')
  const list = content.questions.filter((q) => (!kind || q.kind === kind) && (!status || q.status === status))
  return (
    <div>
      <PageHeader eyebrow="Arbeitsstand" title="Forschungsfragen" subtitle="Offene Fragen, widersprüchliche Überlieferungen, fehlende Quellen, neue Hypothesen und notwendige weitere Untersuchungen." />
      <FilterBar>
        <Select label="Art" value={kind} onChange={setKind} options={Object.entries(QUESTION_KIND)} />
        <Select label="Status" value={status} onChange={setStatus} options={Object.entries(QUESTION_STATUS)} />
      </FilterBar>
      {list.length === 0 ? <Empty>Keine Fragen erfasst.</Empty> : (
        <ul className="space-y-3">
          {list.map((q) => (
            <li key={q.id}>
              <Card>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge>{QUESTION_KIND[q.kind] ?? q.kind}</Badge>
                  <Badge cls={q.status === 'answered' ? 'bg-emerald-50 text-emerald-800 ring-emerald-200' : 'bg-amber-50 text-amber-800 ring-amber-200'}>{QUESTION_STATUS[q.status]}</Badge>
                  {q.area && <span className="text-xs text-stone-500">{areaLabel(q.area)}</span>}
                </div>
                <Link to={`/fragen/${q.id}`} className="mt-2 block font-serif text-lg font-semibold text-stone-900 hover:text-amber-900">{q.question}</Link>
                {q.notes && <p className="mt-1 text-sm text-stone-600">{q.notes}</p>}
                {q.related?.length ? <p className="mt-2 flex flex-wrap gap-x-3 text-sm"><span className="text-stone-500">Bezug:</span>{q.related.map((r) => <EntityLink key={r} id={r} />)}</p> : null}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ---------------- Suche ----------------
export function SearchPage() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const results = useMemo(() => search(q, 200), [q])
  const groups = useMemo(() => {
    const g = new Map<Kind, Entity[]>()
    results.forEach((r) => g.set(r.kind, [...(g.get(r.kind) ?? []), r]))
    return [...g.entries()]
  }, [results])
  return (
    <div>
      <PageHeader eyebrow="Globale Suche" title={q ? `„${q}“` : 'Suche'} subtitle={q ? `${results.length} Treffer` : 'Suchbegriff eingeben – Diakritika werden ignoriert (z. B. „rgveda“ findet „Ṛgveda“).'}>
        <input
          defaultValue={q}
          onKeyDown={(e) => { if (e.key === 'Enter') setParams({ q: (e.target as HTMLInputElement).value }) }}
          placeholder="Suchbegriff …"
          className="w-full max-w-xl rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
        />
      </PageHeader>
      {q && results.length === 0 && <Empty>Keine Treffer.</Empty>}
      {groups.map(([k, es]) => (
        <Section key={k} title={`${KIND[k].plural} (${es.length})`}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{es.map((e) => <EntityCard key={e.id} e={e} />)}</div>
        </Section>
      ))}
    </div>
  )
}
