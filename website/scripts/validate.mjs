#!/usr/bin/env node
/**
 * Prüft research/ und data/ auf: Syntaxfehler, Pflichtfelder, ID-Format,
 * doppelte IDs, gültige Evidenzkategorien und auflösbare Verweise.
 * Aufruf: npm run validate   (Exit-Code 1 bei Fehlern)
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, dirname, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'yaml'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const EVIDENCE = new Set(['primary', 'established', 'hypothesis', 'tradition', 'disputed', 'unresolved'])
const ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/
const REQUIRED = {
  chapters: ['id', 'module', 'order', 'title', 'summary', 'evidence', 'status', 'sources'],
  research: ['id', 'title', 'area', 'summary', 'evidence', 'status', 'sources'],
  texts: ['id', 'title', 'category'],
  characters: ['id', 'name'],
  dynasties: ['id', 'name'],
  locations: ['id', 'name', 'kind'],
  timeline: ['id', 'title', 'chronology', 'start', 'display'],
  references: ['id', 'type', 'authors', 'title', 'quality'],
  questions: ['id', 'question', 'kind', 'status'],
}

const errors = []
const warnings = []
const walk = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f)
  return statSync(p).isDirectory() ? walk(p) : [p]
})

/** @type {{id:string, group:string, file:string, item:any}[]} */
const entries = []

for (const file of walk(join(root, 'research')).filter((f) => f.endsWith('.md') && !f.endsWith('README.md'))) {
  const rel = relative(root, file).split(sep).join('/')
  const raw = readFileSync(file, 'utf8')
  const m = raw.match(/^﻿?---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) { errors.push(`${rel}: kein YAML-Frontmatter`); continue }
  try {
    const item = parse(m[1])
    entries.push({ id: item?.id, group: 'research', file: rel, item })
    const folder = rel.split('/')[1]
    if (item?.area && item.area !== folder) warnings.push(`${rel}: area „${item.area}“ ≠ Ordner „${folder}“`)
  } catch (e) { errors.push(`${rel}: YAML-Fehler – ${e.message}`) }
}

// Kurskapitel
const modulesFile = join(root, 'chapters', 'modules.json')
let modules = []
try { modules = JSON.parse(readFileSync(modulesFile, 'utf8')) } catch (e) { errors.push(`chapters/modules.json: ${e.message}`) }
const moduleIds = new Set(modules.map((m) => m.id))
for (const file of walk(join(root, 'chapters')).filter((f) => f.endsWith('.md') && !f.endsWith('README.md'))) {
  const rel = relative(root, file).split(sep).join('/')
  const m = readFileSync(file, "utf8").match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) { errors.push(`${rel}: kein YAML-Frontmatter`); continue }
  try {
    const item = parse(m[1])
    entries.push({ id: item?.id, group: 'chapters', file: rel, item })
    if (!moduleIds.has(item?.module)) errors.push(`${rel}: unbekanntes Modul „${item?.module}“`)
    else if (!modules.find((x) => x.id === item.module).chapters.some((c) => c.id === item.id)) warnings.push(`${rel}: Kapitel fehlt in modules.json`)
  } catch (e) { errors.push(`${rel}: YAML-Fehler – ${e.message}`) }
}

for (const file of walk(join(root, 'data')).filter((f) => f.endsWith('.json'))) {
  const rel = relative(root, file).split(sep).join('/')
  const group = rel.split('/')[1]
  let json
  try { json = JSON.parse(readFileSync(file, 'utf8')) } catch (e) { errors.push(`${rel}: JSON-Fehler – ${e.message}`); continue }
  if (group === 'cosmology') continue
  if (!REQUIRED[group]) { warnings.push(`${rel}: unbekannter Datenordner`); continue }
  for (const item of Array.isArray(json) ? json : [json]) entries.push({ id: item?.id, group, file: rel, item })
}

const ids = new Map()
for (const e of entries) {
  for (const f of REQUIRED[e.group]) {
    if (e.item?.[f] === undefined || e.item[f] === null || e.item[f] === '') errors.push(`${e.file} [${e.id ?? '?'}]: Pflichtfeld „${f}“ fehlt`)
  }
  if (!e.id) continue
  if (!ID_RE.test(e.id)) errors.push(`${e.file}: ID „${e.id}“ entspricht nicht kebab-case/ASCII`)
  if (ids.has(e.id)) errors.push(`Doppelte ID „${e.id}“ in ${e.file} und ${ids.get(e.id).file}`)
  else ids.set(e.id, e)
  const ev = [...(e.item.evidence ?? []), ...(e.item.historicity ? [e.item.historicity] : [])]
  for (const x of ev) if (!EVIDENCE.has(x)) errors.push(`${e.file} [${e.id}]: unbekannte Evidenzkategorie „${x}“`)
  if ((e.group === 'research' || e.group === 'chapters') && (!e.item.sources || e.item.sources.length === 0)) errors.push(`${e.file} [${e.id}]: keine Quellen`)
  if (e.group === 'references' && e.item.type !== 'modern-interpretation' && e.item.quality === 'low') warnings.push(`${e.file} [${e.id}]: Quelle mit geringer Qualität`)
}

const refFields = ['related', 'texts', 'locations', 'events', 'members']
for (const e of entries) {
  if (!e.id) continue
  const refs = refFields.flatMap((f) => e.item[f] ?? [])
  if (e.item.dynasty) refs.push(e.item.dynasty)
  for (const r of e.item.relations ?? []) refs.push(r.target)
  for (const r of refs) if (!ids.has(r)) errors.push(`${e.file} [${e.id}]: Verweis auf unbekannte ID „${r}“`)
  for (const s of e.item.sources ?? []) {
    if (!ids.has(s)) errors.push(`${e.file} [${e.id}]: unbekannte Quelle „${s}“`)
    else if (ids.get(s).group !== 'references') errors.push(`${e.file} [${e.id}]: „${s}“ ist keine Quelle`)
  }
}

// Wiki-Links im Markdown-Text
for (const e of entries.filter((x) => x.group === 'research' || x.group === 'chapters')) {
  const body = readFileSync(join(root, e.file), 'utf8')
  for (const m of body.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)) {
    if (!ids.has(m[1].trim())) errors.push(`${e.file}: [[${m[1]}]] verweist auf unbekannte ID`)
  }
}

const used = new Set(entries.flatMap((e) => e.item?.sources ?? []))
for (const e of entries.filter((x) => x.group === 'references')) if (!used.has(e.id)) warnings.push(`Quelle „${e.id}“ wird nirgends verwendet`)

const count = (g) => entries.filter((e) => e.group === g).length
console.log(`Geprüft: ${entries.length} Einträge (${Object.keys(REQUIRED).map((g) => `${g}: ${count(g)}`).join(', ')})`)
for (const w of warnings) console.log(`  Warnung: ${w}`)
for (const e of errors) console.log(`  FEHLER:  ${e}`)
console.log(errors.length ? `\n${errors.length} Fehler gefunden.` : '\nKeine Fehler.')
process.exit(errors.length ? 1 : 0)
