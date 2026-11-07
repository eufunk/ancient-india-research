import type { Evidence, Kind, SectionId } from './types'

export const EVIDENCE: Record<Evidence, { label: string; desc: string; cls: string; color: string }> = {
  primary: {
    label: 'Primärquellenbeleg',
    desc: 'Direkt in einem historischen Text nachweisbar',
    cls: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    color: '#059669',
  },
  established: {
    label: 'Wissenschaftlich gesichert',
    desc: 'Durch belastbare wissenschaftliche Evidenz gestützt',
    cls: 'bg-sky-50 text-sky-800 ring-sky-200',
    color: '#0284c7',
  },
  hypothesis: {
    label: 'Hypothese',
    desc: 'Plausible, aber nicht abschließend bewiesene Erklärung',
    cls: 'bg-violet-50 text-violet-800 ring-violet-200',
    color: '#7c3aed',
  },
  tradition: {
    label: 'Traditionelle Überlieferung',
    desc: 'Bestandteil einer religiösen oder kulturellen Tradition',
    cls: 'bg-amber-50 text-amber-800 ring-amber-200',
    color: '#d97706',
  },
  disputed: {
    label: 'Umstritten',
    desc: 'Unterschiedliche wissenschaftliche Interpretationen existieren',
    cls: 'bg-rose-50 text-rose-800 ring-rose-200',
    color: '#e11d48',
  },
  unresolved: {
    label: 'Ungeklärt',
    desc: 'Die Quellen reichen für eine belastbare Aussage nicht aus',
    cls: 'bg-stone-100 text-stone-700 ring-stone-300',
    color: '#78716c',
  },
}
export const EVIDENCE_IDS = Object.keys(EVIDENCE) as Evidence[]

export const SECTIONS: Record<SectionId, { label: string; path: string; desc: string }> = {
  scriptures: {
    label: 'Schriften',
    path: '/schriften',
    desc: 'Veden, Brāhmaṇas, Āraṇyakas, Upaniṣaden, Sūtras, Epen und Purāṇas.',
  },
  history: {
    label: 'Geschichte & Archäologie',
    path: '/geschichte',
    desc: 'Indus-Zivilisation, Fundstätten, Chronologie, Dynastien, Migrationen und historische Geografie.',
  },
  cosmology: {
    label: 'Kosmologie & Astronomie',
    path: '/kosmologie',
    desc: 'Yugas, Manvantaras, Kalpas, Pralaya, vedische Astronomie, Nakṣatras und Kalender.',
  },
  philosophy: {
    label: 'Philosophie & Wissen',
    path: '/philosophie',
    desc: 'Vedānta, Sāṃkhya, Yoga, Dharma, Karma, Mokṣa, Sanskrit, Āyurveda und Mathematik.',
  },
}

export const AREAS: Record<string, { label: string; section: SectionId }> = {
  vedas: { label: 'Veden', section: 'scriptures' },
  'brahmanas-aranyakas': { label: 'Brāhmaṇas & Āraṇyakas', section: 'scriptures' },
  upanishads: { label: 'Upaniṣaden', section: 'scriptures' },
  sutras: { label: 'Sūtras', section: 'scriptures' },
  mahabharata: { label: 'Mahābhārata', section: 'scriptures' },
  'bhagavad-gita': { label: 'Bhagavad Gītā', section: 'scriptures' },
  ramayana: { label: 'Rāmāyaṇa', section: 'scriptures' },
  puranas: { label: 'Purāṇas', section: 'scriptures' },
  cosmology: { label: 'Kosmologie & Zeitrechnung', section: 'cosmology' },
  astronomy: { label: 'Astronomie', section: 'cosmology' },
  history: { label: 'Geschichte', section: 'history' },
  archaeology: { label: 'Archäologie', section: 'history' },
  sanskrit: { label: 'Sanskrit & Schriften', section: 'philosophy' },
  philosophy: { label: 'Philosophie', section: 'philosophy' },
  'other-fields': { label: 'Weitere Wissensgebiete', section: 'philosophy' },
}
export const areaLabel = (a?: string) => (a ? AREAS[a]?.label ?? a : '–')

export const KIND: Record<Kind, { label: string; plural: string; path: string }> = {
  chapter: { label: 'Kurskapitel', plural: 'Kurskapitel', path: 'kapitel' },
  research: { label: 'Forschung', plural: 'Forschungsdokumente', path: 'forschung' },
  text: { label: 'Schrift', plural: 'Schriften', path: 'texte' },
  character: { label: 'Figur', plural: 'Figuren', path: 'figuren' },
  dynasty: { label: 'Dynastie', plural: 'Dynastien', path: 'dynastien' },
  location: { label: 'Ort', plural: 'Orte', path: 'orte' },
  event: { label: 'Ereignis', plural: 'Ereignisse', path: 'ereignisse' },
  source: { label: 'Quelle', plural: 'Quellen', path: 'quellen' },
  question: { label: 'Forschungsfrage', plural: 'Forschungsfragen', path: 'fragen' },
}

export const TEXT_CATEGORY: Record<string, string> = {
  veda: 'Veda (Saṃhitā)',
  brahmana: 'Brāhmaṇa',
  aranyaka: 'Āraṇyaka',
  upanishad: 'Upaniṣad',
  sutra: 'Sūtra',
  smriti: 'Smṛti / Dharmaśāstra',
  itihasa: 'Itihāsa (Epos)',
  purana: 'Purāṇa',
  shastra: 'Śāstra / Fachtext',
  other: 'Weitere Texte',
}

export const SOURCE_TYPE: Record<string, string> = {
  primary: 'Primärtext',
  'critical-edition': 'Kritische Edition',
  translation: 'Übersetzung',
  inscription: 'Inschrift',
  'excavation-report': 'Grabungsbericht',
  book: 'Fachbuch',
  article: 'Fachartikel',
  institutional: 'Institution',
  online: 'Online-Ressource',
  'modern-interpretation': 'Moderne Deutung (nicht-akademisch)',
}
export const PRIMARY_SOURCE_TYPES = ['primary', 'critical-edition', 'translation', 'inscription', 'excavation-report']

export const QUALITY: Record<string, { label: string; cls: string }> = {
  high: { label: 'Qualität hoch', cls: 'bg-emerald-50 text-emerald-800 ring-emerald-200' },
  medium: { label: 'Qualität mittel', cls: 'bg-amber-50 text-amber-800 ring-amber-200' },
  low: { label: 'Qualität gering', cls: 'bg-rose-50 text-rose-800 ring-rose-200' },
}

export const STATUS: Record<string, string> = { draft: 'Entwurf', review: 'In Prüfung', stable: 'Stabil' }
export const VERIFICATION: Record<string, string> = {
  verified: 'Stellenangaben geprüft',
  partial: 'Teilweise geprüft',
  unverified: 'Stellenangaben ungeprüft',
}

export const LOCATION_KIND: Record<string, { label: string; color: string }> = {
  site: { label: 'Archäologische Fundstätte', color: '#0284c7' },
  city: { label: 'Stadt', color: '#7c3aed' },
  kingdom: { label: 'Königreich', color: '#db2777' },
  river: { label: 'Fluss', color: '#0d9488' },
  sacred: { label: 'Heiliger Ort', color: '#d97706' },
  region: { label: 'Region', color: '#65a30d' },
  mountain: { label: 'Gebirge', color: '#57534e' },
}

export const RELATION: Record<string, string> = {
  father: 'Vater',
  mother: 'Mutter',
  spouse: 'Ehepartner/in',
  sibling: 'Geschwister',
  'half-sibling': 'Halbgeschwister',
  cousin: 'Cousin/Cousine',
  teacher: 'Lehrer',
  student: 'Schüler',
  ally: 'Verbündete/r',
  opponent: 'Gegner/in',
  devotee: 'Verehrer/Diener',
  other: 'Beziehung',
}

export const QUESTION_KIND: Record<string, string> = {
  open: 'Offene Frage',
  contradiction: 'Widersprüchliche Überlieferung',
  'missing-source': 'Fehlende Quelle',
  hypothesis: 'Neue Hypothese',
  todo: 'Weitere Untersuchung',
}
export const QUESTION_STATUS: Record<string, string> = {
  open: 'offen',
  'in-progress': 'in Bearbeitung',
  answered: 'beantwortet',
}

export const CHRONOLOGY = {
  scholarly: { label: 'Wissenschaftliche Datierung', short: 'Wissenschaftlich' },
  traditional: { label: 'Traditionelle Chronologie', short: 'Traditionell' },
}

export const formatYear = (y: number) => (y < 0 ? `${-y} v. Chr.` : `${y} n. Chr.`)
export const fmt = (n: number) => n.toLocaleString('de-DE')
