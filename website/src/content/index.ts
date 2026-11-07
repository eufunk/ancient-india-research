/**
 * Lädt alle Forschungsinhalte aus ../research (Markdown) und ../data (JSON)
 * und baut daraus ein einheitliches Register mit Querverweisen und Suchindex.
 */
import { parse as parseYaml } from 'yaml'
import { KIND } from './meta'
import type {
  Chapter, CourseModule, Character, Dynasty, Entity, Evidence, Item, Kind, Location, Problem, Question,
  ResearchDoc, Source, TextEntry, TimelineEvent, YugaSystem,
} from './types'

const mdFiles = import.meta.glob('../../../research/**/*.md', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>
const jsonFiles = import.meta.glob('../../../data/**/*.json', {
  import: 'default', eager: true,
}) as Record<string, unknown>

const chapterFiles = import.meta.glob('../../../chapters/**/*.md', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>
const moduleFiles = import.meta.glob('../../../chapters/modules.json', {
  import: 'default', eager: true,
}) as Record<string, unknown>

const problems: Problem[] = []
const rel = (p: string) => p.replace(/^(\.\.\/)+/, '')
const arr = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : v == null ? [] : [String(v)])
export const norm = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

function splitFrontmatter(raw: string): { data: Record<string, unknown> | null; body: string } {
  const m = raw.match(/^﻿?---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!m) return { data: null, body: raw }
  return { data: (parseYaml(m[1]) ?? {}) as Record<string, unknown>, body: m[2] }
}

// ---------- Forschungsdokumente ----------
const research: ResearchDoc[] = []
for (const [p, raw] of Object.entries(mdFiles)) {
  const path = rel(p)
  if (/\/README\.md$/i.test(path)) continue
  try {
    const { data, body } = splitFrontmatter(raw)
    if (!data || !data.id) {
      problems.push({ level: 'error', message: 'Frontmatter mit „id“ fehlt', where: path })
      continue
    }
    research.push({
      ...(data as object),
      id: String(data.id),
      title: String(data.title ?? data.id),
      area: String(data.area ?? path.split('/')[1]),
      evidence: arr(data.evidence) as Evidence[],
      status: (data.status as ResearchDoc['status']) ?? 'draft',
      sources: arr(data.sources),
      related: arr(data.related),
      created: data.created ? String(data.created) : undefined,
      updated: data.updated ? String(data.updated) : undefined,
      body,
      path,
    } as ResearchDoc)
  } catch (e) {
    problems.push({ level: 'error', message: `YAML-Fehler: ${(e as Error).message}`, where: path })
  }
}

// ---------- Kurskapitel ----------
const chapters: Chapter[] = []
for (const [p, raw] of Object.entries(chapterFiles)) {
  const path = rel(p)
  if (/\/README\.md$/i.test(path)) continue
  try {
    const { data, body } = splitFrontmatter(raw)
    if (!data || !data.id) {
      problems.push({ level: 'error', message: 'Frontmatter mit „id“ fehlt', where: path })
      continue
    }
    chapters.push({
      ...(data as object),
      id: String(data.id),
      module: String(data.module ?? path.split('/')[1]),
      order: Number(data.order ?? 99),
      title: String(data.title ?? data.id),
      evidence: arr(data.evidence) as Evidence[],
      status: (data.status as Chapter['status']) ?? 'draft',
      sources: arr(data.sources),
      related: arr(data.related),
      learning_objectives: arr(data.learning_objectives),
      reflection: arr(data.reflection),
      key_terms: (data.key_terms as Chapter['key_terms']) ?? [],
      created: data.created ? String(data.created) : undefined,
      updated: data.updated ? String(data.updated) : undefined,
      body,
      path,
    } as Chapter)
  } catch (e) {
    problems.push({ level: 'error', message: `YAML-Fehler: ${(e as Error).message}`, where: path })
  }
}
const modules: CourseModule[] = (Object.values(moduleFiles)[0] as CourseModule[] | undefined) ?? []
modules.sort((a, b) => a.order - b.order)
for (const c of chapters) {
  const m = modules.find((x) => x.id === c.module)
  if (!m) problems.push({ level: 'error', message: `Unbekanntes Modul „${c.module}“`, where: c.path })
  else if (!m.chapters.some((x) => x.id === c.id)) problems.push({ level: 'warning', message: `Kapitel fehlt in modules.json („${m.id}“)`, where: c.id })
}

// ---------- JSON-Daten ----------
const FOLDER_KIND: Record<string, Kind> = {
  texts: 'text', characters: 'character', dynasties: 'dynasty', locations: 'location',
  timeline: 'event', references: 'source', questions: 'question',
}
const collections: Record<Exclude<Kind, 'research' | 'chapter'>, Item[]> = {
  text: [], character: [], dynasty: [], location: [], event: [], source: [], question: [],
}
const cosmology: Record<string, unknown> = {}

for (const [p, mod] of Object.entries(jsonFiles)) {
  const path = rel(p)
  const folder = path.split('/')[1]
  if (folder === 'cosmology') {
    const o = mod as { id?: string }
    cosmology[o.id ?? path] = o
    continue
  }
  const kind = FOLDER_KIND[folder]
  if (!kind) {
    problems.push({ level: 'warning', message: `Unbekannter Datenordner „${folder}“`, where: path })
    continue
  }
  for (const it of Array.isArray(mod) ? mod : [mod]) {
    if (!it || typeof it !== 'object' || !('id' in it)) {
      problems.push({ level: 'error', message: 'Eintrag ohne „id“', where: path })
      continue
    }
    collections[kind as Exclude<Kind, 'research' | 'chapter'>].push(it as Item)
  }
}

// ---------- Register ----------
function toEntity(kind: Kind, item: Item): Entity {
  const any = item as unknown as Record<string, unknown>
  let title = ''
  let subtitle: string | undefined
  let refs: string[] = arr(any.related)
  let extra = ''
  switch (kind) {
    case 'chapter': {
      const c = item as Chapter
      title = c.title; subtitle = c.subtitle
      extra = [c.body, c.scenario, ...(c.learning_objectives ?? []),
        ...(c.key_terms ?? []).map((k) => `${k.term} ${k.iast ?? ''} ${k.meaning}`)].join(' ')
      break
    }
    case 'research': {
      const d = item as ResearchDoc
      title = d.title; subtitle = d.title_iast; extra = d.body
      break
    }
    case 'text': {
      const t = item as TextEntry
      title = t.title; subtitle = [t.title_iast, t.devanagari].filter(Boolean).join(' · ')
      extra = [t.structure, t.dating?.scholarly, t.dating?.traditional].join(' ')
      break
    }
    case 'character': {
      const c = item as Character
      title = c.name; subtitle = [c.name_iast, c.devanagari].filter(Boolean).join(' · ')
      refs = [...refs, ...arr(c.texts), ...arr(c.dynasty), ...arr(c.locations), ...arr(c.events),
        ...(c.relations ?? []).map((r) => r.target)]
      break
    }
    case 'dynasty': {
      const d = item as Dynasty
      title = d.name; subtitle = d.name_iast
      refs = [...refs, ...arr(d.texts), ...arr(d.members)]
      break
    }
    case 'location': {
      const l = item as Location
      title = l.name; subtitle = [l.name_iast, l.modern].filter(Boolean).join(' · ')
      refs = [...refs, ...arr(l.texts)]
      break
    }
    case 'event': {
      const e = item as TimelineEvent
      title = e.title; subtitle = e.display
      break
    }
    case 'source': {
      const s = item as Source
      title = s.title; subtitle = [s.authors?.join(', '), s.year].filter(Boolean).join(' · ')
      extra = [s.publisher, s.series, s.notes].join(' ')
      break
    }
    case 'question': {
      const q = item as Question
      title = q.question; extra = q.notes ?? ''
      break
    }
  }
  const id = String(any.id)
  const summary = any.summary ? String(any.summary) : undefined
  return {
    id, kind, title, subtitle: subtitle || undefined, summary,
    href: `/${KIND[kind].path}/${id}`,
    evidence: arr(any.evidence) as Evidence[],
    sources: arr(any.sources),
    refs: [...new Set(refs)],
    titleNorm: norm(title + ' ' + (subtitle ?? '')),
    search: norm([id, title, subtitle, summary, extra].filter(Boolean).join(' ')),
    item,
  }
}

const entities: Entity[] = [
  ...chapters.map((c) => toEntity('chapter', c)),
  ...research.map((d) => toEntity('research', d)),
  ...(Object.entries(collections) as [Kind, Item[]][]).flatMap(([k, items]) => items.map((i) => toEntity(k, i))),
]
const byId = new Map<string, Entity>()
for (const e of entities) {
  if (byId.has(e.id)) {
    problems.push({ level: 'error', message: `Doppelte ID „${e.id}“`, where: `${KIND[e.kind].label}` })
    continue
  }
  byId.set(e.id, e)
}

const backlinks = new Map<string, Set<string>>()
for (const e of byId.values()) {
  for (const target of [...e.refs, ...e.sources]) {
    if (!byId.has(target)) {
      problems.push({ level: 'warning', message: `Verweis auf unbekannte ID „${target}“`, where: e.id })
      continue
    }
    if (!backlinks.has(target)) backlinks.set(target, new Set())
    backlinks.get(target)!.add(e.id)
  }
  for (const s of e.sources) {
    const t = byId.get(s)
    if (t && t.kind !== 'source') problems.push({ level: 'warning', message: `„${s}“ steht in sources, ist aber keine Quelle`, where: e.id })
  }
}
for (const d of [...research, ...chapters]) {
  if (d.sources.length === 0) problems.push({ level: 'error', message: 'Forschungsdokument ohne Quellen', where: d.id })
}

// ---------- Exporte ----------
const sortBy = <T,>(xs: T[], f: (x: T) => string) => [...xs].sort((a, b) => f(a).localeCompare(f(b), 'de'))

const moduleOrder = (id: string) => modules.find((m) => m.id === id)?.order ?? 999

export const content = {
  modules,
  chapters: [...chapters].sort((a, b) => moduleOrder(a.module) - moduleOrder(b.module) || a.order - b.order),
  research: sortBy(research, (d) => d.title),
  texts: sortBy(collections.text as TextEntry[], (t) => t.title),
  characters: sortBy(collections.character as Character[], (c) => c.name),
  dynasties: sortBy(collections.dynasty as Dynasty[], (d) => d.name),
  locations: sortBy(collections.location as Location[], (l) => l.name),
  events: [...(collections.event as TimelineEvent[])].sort((a, b) => a.start - b.start),
  sources: sortBy(collections.source as Source[], (s) => (s.authors?.[0] ?? '') + s.year),
  questions: collections.question as Question[],
  cosmology,
  entities: [...byId.values()],
  problems,
}

export const getEntity = (id: string) => byId.get(id)
export const getBacklinks = (id: string): Entity[] =>
  [...(backlinks.get(id) ?? [])].map((i) => byId.get(i)!).filter(Boolean)
export const getYugaSystem = () => cosmology['yuga-system-data'] as YugaSystem | undefined

export function search(query: string, limit = 50): Entity[] {
  const tokens = norm(query).split(/\s+/).filter(Boolean)
  if (!tokens.length) return []
  const scored: { e: Entity; s: number }[] = []
  for (const e of byId.values()) {
    if (!tokens.every((t) => e.search.includes(t))) continue
    let s = 0
    for (const t of tokens) s += e.titleNorm.includes(t) ? 10 : 1
    if (e.titleNorm.startsWith(tokens[0])) s += 5
    if (e.kind === 'research' || e.kind === 'chapter') s += 2
    scored.push({ e, s })
  }
  return scored.sort((a, b) => b.s - a.s).slice(0, limit).map((x) => x.e)
}

export function cite(s: Source): string {
  const authors = s.authors?.length ? s.authors.join(', ') : 'o. A.'
  const year = s.year ? ` (${s.year})` : ''
  const pub = [s.series, s.publisher].filter(Boolean).join('. ')
  return `${authors}${year}: ${s.title}${pub ? '. ' + pub : ''}.`
}
