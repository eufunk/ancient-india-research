import { useState } from 'react'
import { getYugaSystem } from '../content'
import { fmt } from '../content/meta'
import { Card, EntityLink, EvidenceBadge } from './ui'

const COLORS = ['#e3c48a', '#c99a5b', '#a46f3e', '#6e4a30']
type Level = 'mahayuga' | 'manvantara' | 'kalpa' | 'brahma'
const LEVELS: [Level, string][] = [
  ['mahayuga', 'Mahāyuga'],
  ['manvantara', 'Manvantara'],
  ['kalpa', 'Kalpa'],
  ['brahma', 'Leben Brahmās'],
]

export function YugaDiagram() {
  const sys = getYugaSystem()
  const [level, setLevel] = useState<Level>('mahayuga')
  const [sel, setSel] = useState(0)
  if (!sys) return null

  const dy = sys.divine_year_human_years
  const yugas = sys.yugas.map((y) => {
    const divine = y.core + y.sandhya + y.sandhyamsha
    return { ...y, divine, human: divine * dy }
  })
  const mahayuga = yugas.reduce((s, y) => s + y.human, 0)
  const mahayugaDivine = yugas.reduce((s, y) => s + y.divine, 0)
  const manvantara = sys.mahayugas_per_manvantara * mahayuga
  const sandhi = yugas[0].human // Manvantara-Sandhi = Länge eines Kṛta-Yuga
  const kalpa = sys.manvantaras_per_kalpa * manvantara + sys.manvantara_sandhis_per_kalpa * sandhi
  const dayNight = 2 * kalpa
  const brahmaYear = sys.brahma_year_days * dayNight
  const brahmaLife = sys.brahma_life_years * brahmaYear
  const y = yugas[sel]

  const steps: [string, string, number][] = [
    ['Götterjahr', `1 Götterjahr = ${dy} Menschenjahre`, dy],
    ...yugas.map((g): [string, string, number] => [
      g.name_iast,
      `(${fmt(g.sandhya)} + ${fmt(g.core)} + ${fmt(g.sandhyamsha)}) Götterjahre × ${dy}`,
      g.human,
    ]),
    ['Mahāyuga', `${fmt(mahayugaDivine)} Götterjahre × ${dy}`, mahayuga],
    ['Manvantara', `${sys.mahayugas_per_manvantara} × Mahāyuga`, manvantara],
    ['Kalpa', `${sys.manvantaras_per_kalpa} × Manvantara + ${sys.manvantara_sandhis_per_kalpa} × Sandhi (= Kṛta-Länge ${fmt(sandhi)}) = ${fmt(kalpa / mahayuga)} Mahāyugas`, kalpa],
    ['Tag + Nacht Brahmās', '2 × Kalpa', dayNight],
    ['Jahr Brahmās', `${sys.brahma_year_days} × (Tag + Nacht)`, brahmaYear],
    ['Leben Brahmās', `${sys.brahma_life_years} × Jahr Brahmās`, brahmaLife],
  ]

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-lg font-semibold text-stone-900">{sys.title}</h3>
          <p className="text-sm text-stone-500">{sys.basis}</p>
        </div>
        <EvidenceBadge e="tradition" />
      </div>

      <div className="mb-5 flex flex-wrap gap-1 rounded-lg bg-stone-100 p-1 text-sm">
        {LEVELS.map(([l, label]) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className={`rounded-md px-3 py-1.5 ${level === l ? 'bg-white font-medium text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {level === 'mahayuga' && (
        <div>
          <div className="flex h-14 w-full overflow-hidden rounded-lg">
            {yugas.map((g, i) => (
              <button
                key={g.id}
                onClick={() => setSel(i)}
                style={{ width: `${(g.human / mahayuga) * 100}%` }}
                className={`flex h-full ${sel === i ? 'ring-2 ring-inset ring-stone-900' : ''}`}
                title={`${g.name_iast}: ${fmt(g.human)} Jahre`}
              >
                {[g.sandhya, g.core, g.sandhyamsha].map((part, j) => (
                  <span
                    key={j}
                    style={{ width: `${(part / g.divine) * 100}%`, background: COLORS[i], opacity: j === 1 ? 1 : 0.55 }}
                    className="h-full"
                  />
                ))}
              </button>
            ))}
          </div>
          <div className="mt-2 flex w-full text-xs text-stone-600">
            {yugas.map((g) => (
              <span key={g.id} style={{ width: `${(g.human / mahayuga) * 100}%` }} className="truncate px-0.5">{g.name}</span>
            ))}
          </div>
          <p className="mt-2 text-xs text-stone-500">Hellere Randbereiche: Sandhyā (Morgendämmerung) und Sandhyāṃśa (Abenddämmerung). Verhältnis 4 : 3 : 2 : 1.</p>
          <div className="mt-4 grid gap-4 rounded-lg bg-stone-50 p-4 text-sm sm:grid-cols-4">
            <div><div className="text-xs text-stone-500">Yuga</div><div className="font-serif text-lg font-semibold">{y.name_iast}</div></div>
            <div><div className="text-xs text-stone-500">Götterjahre</div><div>{fmt(y.sandhya)} + {fmt(y.core)} + {fmt(y.sandhyamsha)} = {fmt(y.divine)}</div></div>
            <div><div className="text-xs text-stone-500">Menschenjahre</div><div className="font-semibold">{fmt(y.human)}</div></div>
            <div><div className="text-xs text-stone-500">Dharma (Bild des Stiers)</div><div>{y.dharma_feet ? `${y.dharma_feet} von 4 Füßen` : '–'}</div></div>
          </div>
        </div>
      )}

      {level === 'manvantara' && (
        <div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(18px,1fr))] gap-1">
            {Array.from({ length: sys.mahayugas_per_manvantara }, (_, i) => (
              <span key={i} title={`Mahāyuga ${i + 1}`} className="aspect-square rounded-sm bg-amber-700/70" />
            ))}
          </div>
          <p className="mt-3 text-sm text-stone-600">
            1 Manvantara = {sys.mahayugas_per_manvantara} Mahāyugas = <strong>{fmt(manvantara)}</strong> Jahre. Jedes Kästchen ist ein Mahāyuga ({fmt(mahayuga)} Jahre).
          </p>
        </div>
      )}

      {level === 'kalpa' && (
        <div>
          <div className="flex h-14 w-full overflow-hidden rounded-lg bg-stone-100">
            {Array.from({ length: sys.manvantaras_per_kalpa * 2 + 1 }, (_, i) => {
              const isSandhi = i % 2 === 0
              const w = ((isSandhi ? sandhi : manvantara) / kalpa) * 100
              return (
                <span
                  key={i}
                  style={{ width: `${w}%`, minWidth: isSandhi ? 2 : undefined }}
                  className={isSandhi ? 'bg-stone-900' : 'border-r border-white/40 bg-amber-600/70'}
                  title={isSandhi ? `Sandhi: ${fmt(sandhi)} Jahre` : `Manvantara ${(i + 1) / 2 | 0}: ${fmt(manvantara)} Jahre`}
                />
              )
            })}
          </div>
          <p className="mt-3 text-sm text-stone-600">
            1 Kalpa (ein Tag Brahmās) = {sys.manvantaras_per_kalpa} Manvantaras + {sys.manvantara_sandhis_per_kalpa} Sandhis (dunkle Striche) = <strong>{fmt(kalpa)}</strong> Jahre = {fmt(kalpa / mahayuga)} Mahāyugas.
          </p>
        </div>
      )}

      {level === 'brahma' && (
        <div>
          <div className="flex h-14 w-full overflow-hidden rounded-lg">
            <span className="flex w-1/2 items-center justify-center bg-amber-300 text-sm font-medium text-amber-950">Tag (Kalpa) · Schöpfung</span>
            <span className="flex w-1/2 items-center justify-center bg-stone-800 text-sm font-medium text-stone-100">Nacht · Pralaya</span>
          </div>
          <p className="mt-3 text-sm text-stone-600">
            Tag + Nacht = {fmt(dayNight)} Jahre · {sys.brahma_year_days} solcher Tage = ein Jahr Brahmās ({fmt(brahmaYear)}) · {sys.brahma_life_years} Jahre = Lebensdauer Brahmās: <strong>{fmt(brahmaLife)}</strong> Menschenjahre.
          </p>
        </div>
      )}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-left text-xs uppercase tracking-wide text-stone-500">
              <th className="py-2 pr-4">Einheit</th><th className="py-2 pr-4">Berechnung</th><th className="py-2 text-right">Menschenjahre</th>
            </tr>
          </thead>
          <tbody>
            {steps.map(([name, formula, val]) => (
              <tr key={name} className="border-b border-stone-100">
                <td className="py-2 pr-4 font-medium">{name}</td>
                <td className="py-2 pr-4 text-stone-600">{formula}</td>
                <td className="py-2 text-right tabular-nums">{fmt(val)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sys.notes && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{sys.notes}</p>}
      <p className="mt-3 text-xs text-stone-500">
        Quellen: {sys.sources.map((s, i) => <span key={s}>{i > 0 && ' · '}<EntityLink id={s} /></span>)}
        {sys.related.length > 0 && <> · Siehe: {sys.related.map((r, i) => <span key={r}>{i > 0 && ', '}<EntityLink id={r} /></span>)}</>}
      </p>
    </Card>
  )
}
