import { Link, useParams } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { cite, content, getBacklinks, getEntity } from '../content'
import {
  CHRONOLOGY, EVIDENCE, KIND, LOCATION_KIND, QUALITY, QUESTION_KIND, QUESTION_STATUS,
  RELATION, SOURCE_TYPE, STATUS, TEXT_CATEGORY, VERIFICATION, areaLabel, formatYear,
} from '../content/meta'
import { Badge, Card, CrossRefs, EntityCard, EntityLink, EvidenceBadge, EvidenceList, Meta, PageHeader, Section, SourceList } from '../components/ui'
import { Markdown } from '../components/Markdown'
import { Genealogy } from '../components/Genealogy'
import type {
  Character, Dynasty, Entity, Location, Question, ResearchDoc, Source, TextEntry, TimelineEvent,
} from '../content/types'
import NotFound from './NotFound'
import { ChapterBody } from './Courses'
import type { Chapter } from '../content/types'

const links = (ids?: string[]) =>
  ids?.length ? <span className="flex flex-wrap gap-x-3">{ids.map((i) => <EntityLink key={i} id={i} />)}</span> : undefined

function ResearchBody({ d }: { d: ResearchDoc }) {
  return (
    <>
      <Card className="mb-8">
        <Meta items={[
          ['Bereich', areaLabel(d.area)],
          ['Status', STATUS[d.status] ?? d.status],
          ['Prüfstand', d.verification ? VERIFICATION[d.verification] : undefined],
          ['Zeitraum', d.period],
          ['Angelegt', d.created],
          ['Aktualisiert', d.updated],
          ['Datei', <code className="text-xs">{d.path}</code>],
        ]} />
      </Card>
      <article className="mb-10"><Markdown body={d.body} /></article>
    </>
  )
}

function TextBody({ t }: { t: TextEntry }) {
  const docs = getBacklinks(t.id).filter((e) => e.kind === 'research')
  return (
    <>
      <Card className="mb-6">
        <Meta items={[
          ['Kategorie', TEXT_CATEGORY[t.category] ?? t.category],
          ['Devanāgarī', t.devanagari && <span className="deva text-base">{t.devanagari}</span>],
          ['Aufbau', t.structure],
        ]} />
      </Card>
      {t.dating && (
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border-l-4 border-sky-500 bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-sky-800">{CHRONOLOGY.scholarly.label}</div>
            <p className="mt-1 text-sm">{t.dating.scholarly ?? '–'}</p>
          </div>
          <div className="rounded-xl border-l-4 border-dashed border-amber-500 bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-amber-800">{CHRONOLOGY.traditional.label}</div>
            <p className="mt-1 text-sm">{t.dating.traditional ?? '–'}</p>
          </div>
        </div>
      )}
      {docs.length > 0 && (
        <Section title="Forschungsdokumente zu dieser Schrift">
          <div className="grid gap-3 md:grid-cols-2">{docs.map((e) => <EntityCard key={e.id} e={e} />)}</div>
        </Section>
      )}
    </>
  )
}

function CharacterBody({ c }: { c: Character }) {
  const others = content.characters.filter((x) => x.id !== c.id)
  const inverse = others.flatMap((x) => (x.relations ?? []).filter((r) => r.target === c.id).map((r) => ({ from: x, r })))
  const family = new Set<string>([c.id, ...(c.relations ?? []).map((r) => r.target), ...inverse.map((i) => i.from.id)])
  const people = content.characters.filter((x) => family.has(x.id))
  const inverseLabel = (type: string) => (type === 'father' || type === 'mother' ? 'Kind' : type === 'teacher' ? 'Schüler' : type === 'student' ? 'Lehrer' : RELATION[type] ?? type)
  return (
    <>
      <Card className="mb-6">
        <Meta items={[
          ['Name (IAST)', c.name_iast],
          ['Devanāgarī', c.devanagari && <span className="deva text-base">{c.devanagari}</span>],
          ['Dynastie', c.dynasty && <EntityLink id={c.dynasty} />],
          ['Texte', links(c.texts)],
          ['Orte', links(c.locations)],
          ['Ereignisse', links(c.events)],
          ['Historizität', c.historicity && <EvidenceBadge e={c.historicity} />],
        ]} />
      </Card>
      <Section title="Familie & Beziehungen">
        <Card>
          {(c.relations?.length || inverse.length) ? (
            <ul className="mb-6 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              {(c.relations ?? []).map((r, i) => (
                <li key={i}><span className="text-stone-500">{RELATION[r.type] ?? r.type}:</span> <EntityLink id={r.target} />{r.note && <span className="text-stone-500"> – {r.note}</span>}</li>
              ))}
              {inverse.map(({ from, r }, i) => (
                <li key={`i${i}`}><span className="text-stone-500">{inverseLabel(r.type)}:</span> <EntityLink id={from.id} />{r.note && <span className="text-stone-500"> – {r.note}</span>}</li>
              ))}
            </ul>
          ) : <p className="mb-4 text-sm text-stone-500">Keine Beziehungen erfasst.</p>}
          {people.length > 1 && <Genealogy people={people} focus={c.id} />}
        </Card>
      </Section>
    </>
  )
}

function DynastyBody({ d }: { d: Dynasty }) {
  const people = content.characters.filter((c) => d.members?.includes(c.id) || c.dynasty === d.id)
  return (
    <>
      <Card className="mb-6"><Meta items={[['Texte', links(d.texts)], ['Mitglieder', links(people.map((p) => p.id))]]} /></Card>
      {people.length > 0 && <Section title="Genealogie"><Card><Genealogy people={people} /></Card></Section>}
    </>
  )
}

function LocationBody({ l }: { l: Location }) {
  return (
    <Card className="mb-8">
      <Meta items={[
        ['Art', LOCATION_KIND[l.kind]?.label ?? l.kind],
        ['Heutige Lage', l.modern],
        ['Koordinaten (ca.)', l.coordinates && (
          <a className="inline-flex items-center gap-1 text-sky-700 hover:underline" target="_blank" rel="noreferrer"
            href={`https://www.openstreetmap.org/?mlat=${l.coordinates[0]}&mlon=${l.coordinates[1]}#map=10/${l.coordinates[0]}/${l.coordinates[1]}`}>
            {l.coordinates[0].toFixed(2)}° N, {l.coordinates[1].toFixed(2)}° O <ExternalLink size={12} />
          </a>
        )],
        ['Texte', links(l.texts)],
      ]} />
    </Card>
  )
}

function EventBody({ e }: { e: TimelineEvent }) {
  const trad = e.chronology === 'traditional'
  return (
    <div className={`mb-8 rounded-xl border-l-4 bg-white p-5 ${trad ? 'border-dashed border-amber-500' : 'border-sky-500'}`}>
      <div className={`text-xs font-semibold uppercase tracking-wide ${trad ? 'text-amber-800' : 'text-sky-800'}`}>{CHRONOLOGY[e.chronology].label}</div>
      <p className="mt-1 font-serif text-2xl font-semibold">{e.display}</p>
      <p className="mt-1 text-sm text-stone-500">Zahlenwert für die Zeitleiste: {formatYear(e.start)}{e.end !== undefined && ` – ${formatYear(e.end)}`}</p>
    </div>
  )
}

function SourceBody({ s }: { s: Source }) {
  const used = getBacklinks(s.id)
  return (
    <>
      <Card className="mb-6">
        <p className="mb-4 font-serif text-lg">{cite(s)}</p>
        <Meta items={[
          ['Quellentyp', SOURCE_TYPE[s.type] ?? s.type],
          ['Qualität', QUALITY[s.quality] && <Badge cls={QUALITY[s.quality].cls}>{QUALITY[s.quality].label}</Badge>],
          ['Bibliografisch geprüft', s.verified ? 'ja' : 'nein – Angaben vor Zitation prüfen'],
          ['Forschungsbereiche', s.areas?.map(areaLabel).join(', ')],
          ['URL', s.url && <a href={s.url} target="_blank" rel="noreferrer" className="break-all text-sky-700 hover:underline">{s.url}</a>],
        ]} />
        {s.notes && <p className="mt-4 text-sm text-stone-600">{s.notes}</p>}
      </Card>
      <Section title={`Zugehörige Erkenntnisse (${used.length})`}>
        {used.length ? <div className="grid gap-3 md:grid-cols-2">{used.map((e) => <EntityCard key={e.id} e={e} />)}</div>
          : <p className="text-sm text-stone-500">Diese Quelle wird noch von keinem Eintrag verwendet.</p>}
      </Section>
    </>
  )
}

function QuestionBody({ q }: { q: Question }) {
  return (
    <Card className="mb-8">
      <Meta items={[
        ['Art', QUESTION_KIND[q.kind] ?? q.kind],
        ['Status', QUESTION_STATUS[q.status] ?? q.status],
        ['Bereich', q.area && areaLabel(q.area)],
      ]} />
      {q.notes && <p className="mt-4 text-sm text-stone-700">{q.notes}</p>}
    </Card>
  )
}

function Body({ e }: { e: Entity }) {
  switch (e.kind) {
    case 'chapter': return <ChapterBody c={e.item as Chapter} />
    case 'research': return <ResearchBody d={e.item as ResearchDoc} />
    case 'text': return <TextBody t={e.item as TextEntry} />
    case 'character': return <CharacterBody c={e.item as Character} />
    case 'dynasty': return <DynastyBody d={e.item as Dynasty} />
    case 'location': return <LocationBody l={e.item as Location} />
    case 'event': return <EventBody e={e.item as TimelineEvent} />
    case 'source': return <SourceBody s={e.item as Source} />
    case 'question': return <QuestionBody q={e.item as Question} />
  }
}

const BACK: Record<string, [string, string]> = {
  chapter: ['/kurse', 'Kurse & Kapitel'],
  character: ['/figuren', 'Figuren'], dynasty: ['/figuren', 'Figuren'], location: ['/geografie', 'Geografie'],
  event: ['/zeitleiste', 'Zeitleiste'], source: ['/quellen', 'Quellen'], question: ['/fragen', 'Forschungsfragen'],
  text: ['/schriften', 'Schriften'],
}

export default function EntityPage() {
  const { id = '' } = useParams()
  const e = getEntity(id)
  if (!e) return <NotFound />
  const back = BACK[e.kind]
  return (
    <div key={e.id}>
      {back && <Link to={back[0]} className="mb-4 inline-block text-sm text-stone-500 hover:text-amber-900">← {back[1]}</Link>}
      <PageHeader eyebrow={KIND[e.kind].label} title={e.title} subtitle={
        <>
          {e.subtitle && e.kind !== 'source' && <p className="mb-2 font-serif text-lg italic text-stone-500">{e.subtitle}</p>}
          {e.summary && <p>{e.summary}</p>}
        </>
      }>
        {e.evidence.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <EvidenceList list={e.evidence} />
            <span className="text-xs text-stone-400" title={e.evidence.map((x) => `${EVIDENCE[x]?.label}: ${EVIDENCE[x]?.desc}`).join('\n')}>ⓘ</span>
          </div>
        )}
      </PageHeader>
      <Body e={e} />
      {e.kind !== 'source' && <Section title="Quellen"><SourceList ids={e.sources} /></Section>}
      <CrossRefs entity={e} />
    </div>
  )
}
