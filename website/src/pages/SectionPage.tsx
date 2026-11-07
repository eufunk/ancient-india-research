import { Link } from 'react-router-dom'
import { content } from '../content'
import { AREAS, SECTIONS, TEXT_CATEGORY } from '../content/meta'
import { Card, Empty, EvidenceList, PageHeader, Section } from '../components/ui'
import { YugaDiagram } from '../components/YugaDiagram'
import { ResearchList } from './ResearchList'
import type { SectionId } from '../content/types'

function TextsOverview() {
  const { texts } = content
  if (!texts.length) return <Empty>Noch keine Schriften in <code>data/texts/</code> erfasst.</Empty>
  const cats = Object.keys(TEXT_CATEGORY).filter((c) => texts.some((t) => t.category === c))
  const other = texts.filter((t) => !TEXT_CATEGORY[t.category])
  return (
    <div className="space-y-6">
      {cats.map((c) => (
        <div key={c}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500">{TEXT_CATEGORY[c]}</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {texts.filter((t) => t.category === c).map((t) => (
              <Link key={t.id} to={`/texte/${t.id}`} className="rounded-xl border border-stone-200 bg-white p-4 hover:border-amber-300">
                <div className="font-serif text-lg font-semibold text-stone-900">{t.title}</div>
                {(t.title_iast || t.devanagari) && <div className="text-sm text-stone-500">{t.title_iast} {t.devanagari && <span className="deva">{t.devanagari}</span>}</div>}
                {t.dating?.scholarly && <div className="mt-2 text-xs text-sky-800">Wiss. Datierung: {t.dating.scholarly}</div>}
                {t.summary && <p className="mt-1 line-clamp-2 text-sm text-stone-600">{t.summary}</p>}
                <div className="mt-2"><EvidenceList list={t.evidence} /></div>
              </Link>
            ))}
          </div>
        </div>
      ))}
      {other.length > 0 && <p className="text-sm text-red-700">Unbekannte Kategorie bei: {other.map((t) => t.id).join(', ')}</p>}
    </div>
  )
}

function HistoryExtras() {
  const sites = content.locations.filter((l) => l.kind === 'site')
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <h3 className="font-serif text-lg font-semibold">Archäologische Fundstätten</h3>
        {sites.length === 0 ? <p className="mt-2 text-sm text-stone-500">Noch keine erfasst.</p> : (
          <ul className="mt-2 space-y-1 text-sm">
            {sites.map((s) => <li key={s.id}><Link className="text-amber-900 hover:underline" to={`/orte/${s.id}`}>{s.name}</Link>{s.modern && <span className="text-stone-500"> · {s.modern}</span>}</li>)}
          </ul>
        )}
        <Link to="/geografie" className="mt-3 inline-block text-sm text-amber-900">Zur Geografie →</Link>
      </Card>
      <Card>
        <h3 className="font-serif text-lg font-semibold">Chronologie</h3>
        <p className="mt-2 text-sm text-stone-600">
          {content.events.filter((e) => e.chronology === 'scholarly').length} wissenschaftliche und {content.events.filter((e) => e.chronology === 'traditional').length} traditionelle Datierungen erfasst – getrennt dargestellt.
        </p>
        <Link to="/zeitleiste" className="mt-3 inline-block text-sm text-amber-900">Zur Zeitleiste →</Link>
      </Card>
    </div>
  )
}

export default function SectionPage({ section }: { section: SectionId }) {
  const s = SECTIONS[section]
  const areas = Object.entries(AREAS).filter(([, a]) => a.section === section).map(([k]) => k)
  const docs = content.research.filter((d) => areas.includes(d.area))
  return (
    <div>
      <PageHeader eyebrow="Forschungsbereich" title={s.label} subtitle={s.desc} />
      {section === 'scriptures' && <Section title="Schriften"><TextsOverview /></Section>}
      {section === 'cosmology' && <Section title="Kosmische Zeitzyklen"><YugaDiagram /></Section>}
      {section === 'history' && <Section title="Überblick"><HistoryExtras /></Section>}
      <Section title="Forschungsdokumente">
        <ResearchList docs={docs} emptyHint={`Noch keine Dokumente. Neue Dateien in research/${areas.join('/, research/')}/ anlegen.`} />
      </Section>
    </div>
  )
}
