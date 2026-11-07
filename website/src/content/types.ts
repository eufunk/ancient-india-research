export type Evidence = 'primary' | 'established' | 'hypothesis' | 'tradition' | 'disputed' | 'unresolved'
export type Status = 'draft' | 'review' | 'stable'
export type Verification = 'verified' | 'partial' | 'unverified'
export type Kind = 'chapter' | 'research' | 'text' | 'character' | 'dynasty' | 'location' | 'event' | 'source' | 'question'

export interface KeyTerm {
  term: string
  iast?: string
  meaning: string
}

export interface Chapter {
  id: string
  module: string
  order: number
  title: string
  subtitle?: string
  summary?: string
  scenario?: string
  learning_objectives?: string[]
  key_terms?: KeyTerm[]
  reflection?: string[]
  reading_time?: number
  evidence: Evidence[]
  status: Status
  verification?: Verification
  sources: string[]
  related: string[]
  created?: string
  updated?: string
  body: string
  path: string
}

export interface CourseModule {
  id: string
  order: number
  title: string
  summary?: string
  chapters: { id: string; title: string }[]
}
export type SectionId = 'scriptures' | 'history' | 'cosmology' | 'philosophy'

export interface ResearchDoc {
  id: string
  title: string
  title_iast?: string
  area: string
  summary?: string
  evidence: Evidence[]
  status: Status
  verification?: Verification
  sources: string[]
  related: string[]
  period?: string
  created?: string
  updated?: string
  body: string
  path: string
}

export interface TextEntry {
  id: string
  title: string
  title_iast?: string
  devanagari?: string
  category: string
  summary?: string
  structure?: string
  dating?: { scholarly?: string; traditional?: string }
  evidence?: Evidence[]
  sources?: string[]
  related?: string[]
}

export interface Relation {
  type: string
  target: string
  note?: string
}

export interface Character {
  id: string
  name: string
  name_iast?: string
  devanagari?: string
  summary?: string
  texts?: string[]
  dynasty?: string
  relations?: Relation[]
  locations?: string[]
  events?: string[]
  historicity?: Evidence
  evidence?: Evidence[]
  sources?: string[]
  related?: string[]
}

export interface Dynasty {
  id: string
  name: string
  name_iast?: string
  summary?: string
  texts?: string[]
  members?: string[]
  evidence?: Evidence[]
  sources?: string[]
  related?: string[]
}

export interface Location {
  id: string
  name: string
  name_iast?: string
  kind: string
  coordinates?: [number, number]
  modern?: string
  summary?: string
  texts?: string[]
  evidence?: Evidence[]
  sources?: string[]
  related?: string[]
}

export interface TimelineEvent {
  id: string
  title: string
  chronology: 'scholarly' | 'traditional'
  start: number
  end?: number
  display: string
  summary?: string
  evidence?: Evidence[]
  sources?: string[]
  related?: string[]
}

export interface Source {
  id: string
  type: string
  authors: string[]
  title: string
  year?: number | string
  publisher?: string
  series?: string
  url?: string
  areas?: string[]
  quality: 'high' | 'medium' | 'low'
  verified?: boolean
  notes?: string
}

export interface Question {
  id: string
  question: string
  area?: string
  kind: string
  status: 'open' | 'in-progress' | 'answered'
  summary?: string
  notes?: string
  related?: string[]
  sources?: string[]
}

export type Item = Chapter | ResearchDoc | TextEntry | Character | Dynasty | Location | TimelineEvent | Source | Question

export interface Entity {
  id: string
  kind: Kind
  title: string
  subtitle?: string
  summary?: string
  href: string
  evidence: Evidence[]
  sources: string[]
  /** ausgehende Verweise (ohne Quellen) */
  refs: string[]
  /** normalisierter Suchtext */
  search: string
  titleNorm: string
  item: Item
}

export interface Problem {
  level: 'error' | 'warning'
  message: string
  where: string
}

export interface YugaDef {
  id: string
  name: string
  name_iast: string
  core: number
  sandhya: number
  sandhyamsha: number
  dharma_feet?: number
}

export interface YugaSystem {
  id: string
  title: string
  basis: string
  divine_year_human_years: number
  yugas: YugaDef[]
  mahayugas_per_manvantara: number
  manvantaras_per_kalpa: number
  manvantara_sandhis_per_kalpa: number
  brahma_year_days: number
  brahma_life_years: number
  sources: string[]
  related: string[]
  notes?: string
}
