import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Clock, Drama, GraduationCap, Target } from 'lucide-react'
import { content, getEntity } from '../content'
import { STATUS, VERIFICATION } from '../content/meta'
import { Badge, Card, Empty, EvidenceList, PageHeader, Section } from '../components/ui'
import { Markdown } from '../components/Markdown'
import type { Chapter } from '../content/types'

export function CoursesPage() {
  const { modules, chapters } = content
  const written = new Set(chapters.map((c) => c.id))
  const total = modules.reduce((n, m) => n + m.chapters.length, 0)
  return (
    <div>
      <PageHeader eyebrow="Kurs" title="Das antike Indien – Kurse & Kapitel" subtitle={
        <>Erzählende Kapitel im Stil wissenschaftlicher Essays, gegliedert in Module. Jedes Kapitel beginnt mit einem <strong>Szenario</strong> (illustrative Darstellung), nennt Lernziele, trennt Überlieferung und Forschung und endet mit Reflexionsfragen. {chapters.length} von {total} geplanten Kapiteln sind ausgeschrieben.</>
      } />
      {modules.length === 0 ? <Empty>Noch keine Module in <code>chapters/modules.json</code>.</Empty> : (
        <ol className="space-y-6">
          {modules.map((m) => (
            <li key={m.id}>
              <Card>
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 font-serif text-lg font-semibold text-amber-900">{m.order}</span>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-serif text-xl font-semibold text-stone-900">{m.title}</h2>
                    {m.summary && <p className="mt-1 text-sm text-stone-600">{m.summary}</p>}
                    <ol className="mt-4 space-y-2">
                      {m.chapters.map((c, i) => {
                        const ch = written.has(c.id) ? (getEntity(c.id)?.item as Chapter) : undefined
                        return (
                          <li key={c.id} className="flex items-baseline gap-3 text-sm">
                            <span className="w-10 shrink-0 tabular-nums text-stone-400">{m.order}.{i + 1}</span>
                            {ch ? (
                              <div className="min-w-0">
                                <Link to={`/kapitel/${c.id}`} className="font-medium text-amber-900 hover:underline">{ch.title}</Link>
                                {ch.reading_time && <span className="ml-2 text-xs text-stone-500">{ch.reading_time} Min.</span>}
                                {ch.summary && <p className="text-stone-600">{ch.summary}</p>}
                              </div>
                            ) : (
                              <span className="text-stone-400">{c.title} <span className="text-xs">(geplant)</span></span>
                            )}
                          </li>
                        )
                      })}
                    </ol>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

export function ChapterBody({ c }: { c: Chapter }) {
  const mod = content.modules.find((m) => m.id === c.module)
  const list = content.chapters
  const idx = list.findIndex((x) => x.id === c.id)
  const prev = idx > 0 ? list[idx - 1] : undefined
  const next = idx < list.length - 1 ? list[idx + 1] : undefined
  const pos = mod ? mod.chapters.findIndex((x) => x.id === c.id) + 1 : 0

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-stone-600">
        <GraduationCap size={16} />
        <span>{mod ? `Modul ${mod.order}: ${mod.title}` : c.module}{pos > 0 && ` · Kapitel ${mod!.order}.${pos}`}</span>
        {c.reading_time && <span className="inline-flex items-center gap-1"><Clock size={14} /> {c.reading_time} Min.</span>}
        <Badge>{STATUS[c.status] ?? c.status}</Badge>
        {c.verification && <Badge>{VERIFICATION[c.verification]}</Badge>}
      </div>

      {c.learning_objectives && c.learning_objectives.length > 0 && (
        <Card className="mb-6">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-stone-600"><Target size={16} /> Lernziele</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-stone-700">
            {c.learning_objectives.map((o) => <li key={o}>{o}</li>)}
          </ul>
        </Card>
      )}

      {c.scenario && (
        <aside className="mb-8 rounded-xl border border-amber-200 bg-amber-50/60 p-5">
          <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-amber-900"><Drama size={16} /> Szenario</h2>
          <p className="mb-3 text-xs text-amber-800">Illustrative Darstellung zum Einstieg – keine historische Quelle. Personen und Situation sind erfunden oder verdichtet, der Hintergrund folgt dem Forschungsstand.</p>
          <div className="font-serif text-[1.05rem] leading-relaxed text-stone-800"><Markdown body={c.scenario} /></div>
        </aside>
      )}

      <article className="mb-10 max-w-3xl text-[1.05rem]"><Markdown body={c.body} /></article>

      {c.key_terms && c.key_terms.length > 0 && (
        <Section title="Schlüsselbegriffe">
          <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-stone-100">
                {c.key_terms.map((k) => (
                  <tr key={k.term}>
                    <td className="w-1/4 px-4 py-2.5 align-top font-medium">{k.term}{k.iast && <div className="font-serif italic text-stone-500">{k.iast}</div>}</td>
                    <td className="px-4 py-2.5 text-stone-700">{k.meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {c.reflection && c.reflection.length > 0 && (
        <Section title="Fragen zur Reflexion">
          <Card><ol className="list-decimal space-y-2 pl-5 text-sm text-stone-700">{c.reflection.map((r) => <li key={r}>{r}</li>)}</ol></Card>
        </Section>
      )}

      {c.evidence.length > 0 && (
        <p className="mb-8 flex flex-wrap items-center gap-2 text-xs text-stone-500">Evidenzkategorien in diesem Kapitel: <EvidenceList list={c.evidence} /></p>
      )}

      <nav className="mb-10 grid gap-3 sm:grid-cols-2">
        {prev ? (
          <Link to={`/kapitel/${prev.id}`} className="rounded-xl border border-stone-200 bg-white p-4 text-sm hover:border-amber-300">
            <span className="flex items-center gap-1 text-xs text-stone-500"><ArrowLeft size={12} /> Vorheriges Kapitel</span>
            <span className="font-serif font-semibold">{prev.title}</span>
          </Link>
        ) : <span />}
        {next && (
          <Link to={`/kapitel/${next.id}`} className="rounded-xl border border-stone-200 bg-white p-4 text-right text-sm hover:border-amber-300">
            <span className="flex items-center justify-end gap-1 text-xs text-stone-500">Nächstes Kapitel <ArrowRight size={12} /></span>
            <span className="font-serif font-semibold">{next.title}</span>
          </Link>
        )}
      </nav>
    </>
  )
}
