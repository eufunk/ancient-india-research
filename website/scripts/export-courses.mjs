#!/usr/bin/env node
/**
 * Exportiert alle Kursmodule und Kapitel als eine JSON-Datei für externe Kurs-Apps.
 * Aufruf: npm run export   →  ../export/courses.json
 *
 * - Interne Verweise [[id|Text]] werden zu reinem Text aufgelöst (body_markdown),
 *   die verlinkten IDs stehen zusätzlich in `related`.
 * - Quellen werden mit fertiger Zitation mitgeliefert.
 * - Geplante (noch nicht geschriebene) Kapitel erscheinen mit status "planned".
 */
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'yaml'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const walk = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f)
  return statSync(p).isDirectory() ? walk(p) : [p]
})
const front = (raw) => {
  const m = raw.match(/^﻿?---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  return m ? { data: parse(m[1]), body: m[2] } : { data: null, body: raw }
}

// Titel aller IDs (für aufgelöste Verweise)
const titles = new Map()
const kinds = { texts: 'text', characters: 'character', dynasties: 'dynasty', locations: 'location', timeline: 'event', references: 'source', questions: 'question' }
const sources = new Map()
for (const f of walk(join(root, 'data')).filter((x) => x.endsWith('.json'))) {
  const folder = f.split(/[\\/]/).at(-2)
  if (!kinds[folder]) continue
  for (const it of [JSON.parse(readFileSync(f, 'utf8'))].flat()) {
    titles.set(it.id, { title: it.title ?? it.name ?? it.question, kind: kinds[folder] })
    if (folder === 'references') sources.set(it.id, it)
  }
}
for (const f of walk(join(root, 'research')).filter((x) => x.endsWith('.md') && !x.endsWith('README.md'))) {
  const { data } = front(readFileSync(f, 'utf8'))
  if (data?.id) titles.set(data.id, { title: data.title, kind: 'research' })
}
const chapters = new Map()
for (const f of walk(join(root, 'chapters')).filter((x) => x.endsWith('.md') && !x.endsWith('README.md'))) {
  const { data, body } = front(readFileSync(f, 'utf8'))
  if (!data?.id) continue
  chapters.set(data.id, { ...data, body })
  titles.set(data.id, { title: data.title, kind: 'chapter' })
}

const resolve = (md) => md.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, id, label) => label ?? titles.get(id.trim())?.title ?? id)
const cite = (s) => {
  const a = s.authors?.length ? s.authors.join(', ') : 'o. A.'
  const pub = [s.series, s.publisher].filter(Boolean).join('. ')
  return `${a}${s.year ? ` (${s.year})` : ''}: ${s.title}${pub ? '. ' + pub : ''}.`
}

const modules = JSON.parse(readFileSync(join(root, 'chapters', 'modules.json'), 'utf8')).sort((a, b) => a.order - b.order)
const out = {
  format: 'ancient-india-research/courses',
  version: 1,
  generated: new Date().toISOString(),
  course: {
    id: 'kurs-antikes-indien',
    title: 'Das antike Indien',
    language: 'de',
    note: 'Szenarien sind illustrative Darstellungen, keine historischen Quellen. Evidenzkategorien: primary, established, hypothesis, tradition, disputed, unresolved.',
  },
  modules: modules.map((m) => ({
    id: m.id,
    order: m.order,
    title: m.title,
    summary: m.summary ?? null,
    chapters: m.chapters.map((c, i) => {
      const ch = chapters.get(c.id)
      if (!ch) return { id: c.id, order: i + 1, title: c.title, status: 'planned' }
      return {
        id: ch.id,
        order: i + 1,
        title: ch.title,
        subtitle: ch.subtitle ?? null,
        status: ch.status,
        verification: ch.verification ?? null,
        summary: ch.summary ?? null,
        reading_time_minutes: ch.reading_time ?? null,
        learning_objectives: ch.learning_objectives ?? [],
        scenario_markdown: ch.scenario ? resolve(ch.scenario) : null,
        body_markdown: resolve(ch.body).trim(),
        key_terms: ch.key_terms ?? [],
        reflection_questions: ch.reflection ?? [],
        evidence: ch.evidence ?? [],
        sources: (ch.sources ?? []).map((id) => {
          const s = sources.get(id)
          return s ? { id, citation: cite(s), type: s.type, quality: s.quality, verified: !!s.verified, url: s.url ?? null } : { id, citation: null }
        }),
        related: (ch.related ?? []).map((id) => ({ id, ...(titles.get(id) ?? { title: id, kind: 'unknown' }) })),
        updated: ch.updated ? String(ch.updated) : null,
      }
    }),
  })),
}

const dir = join(root, 'export')
mkdirSync(dir, { recursive: true })
writeFileSync(join(dir, 'courses.json'), JSON.stringify(out, null, 2) + '\n')
const written = out.modules.flatMap((m) => m.chapters).filter((c) => c.status !== 'planned').length
const total = out.modules.flatMap((m) => m.chapters).length
console.log(`export/courses.json geschrieben: ${out.modules.length} Module, ${written} von ${total} Kapiteln ausgeschrieben.`)
