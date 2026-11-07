import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Character } from '../content/types'

const PARENT = new Set(['father', 'mother'])
const SAME_GEN = new Set(['spouse', 'sibling', 'half-sibling', 'cousin'])

interface Line { x1: number; y1: number; x2: number; y2: number; dashed: boolean }

/**
 * Generationen-Diagramm. Eltern-Beziehungen bestimmen die Generation;
 * Ehepartner, Geschwister und Cousins ohne eigene Eltern im Diagramm werden
 * auf die Generation ihres Gegenübers gesetzt.
 */
export function Genealogy({ people, focus }: { people: Character[]; focus?: string }) {
  const ids = useMemo(() => new Set(people.map((p) => p.id)), [people])

  const { rows, parentEdges, spouseEdges } = useMemo(() => {
    const parents = new Map<string, string[]>()
    const peers = new Map<string, string[]>()
    const spouseEdges: [string, string][] = []
    const addPeer = (a: string, b: string) => {
      peers.set(a, [...(peers.get(a) ?? []), b])
      peers.set(b, [...(peers.get(b) ?? []), a])
    }
    for (const p of people) {
      for (const r of p.relations ?? []) {
        if (!ids.has(r.target)) continue
        if (PARENT.has(r.type)) parents.set(p.id, [...(parents.get(p.id) ?? []), r.target])
        if (SAME_GEN.has(r.type)) addPeer(p.id, r.target)
        if (r.type === 'spouse' && p.id < r.target) spouseEdges.push([p.id, r.target])
      }
    }
    const gen = new Map<string, number>()
    const calc = (id: string, seen: Set<string>): number => {
      if (gen.has(id)) return gen.get(id)!
      if (seen.has(id)) return 0
      seen.add(id)
      const ps = parents.get(id) ?? []
      const g = ps.length ? Math.max(...ps.map((x) => calc(x, seen))) + 1 : 0
      gen.set(id, g)
      return g
    }
    people.forEach((p) => calc(p.id, new Set()))
    // Personen ohne Eltern im Diagramm an Gegenüber angleichen
    for (let pass = 0; pass < 4; pass++) {
      for (const p of people) {
        if (parents.get(p.id)?.length) continue
        const ps = peers.get(p.id) ?? []
        const best = Math.max(gen.get(p.id)!, ...ps.map((x) => gen.get(x) ?? 0))
        gen.set(p.id, best)
      }
    }
    const maxGen = Math.max(0, ...gen.values())
    const rows: Character[][] = Array.from({ length: maxGen + 1 }, () => [])
    people.forEach((p) => rows[gen.get(p.id)!].push(p))
    // Ehepartner nebeneinander, sonst nach erstem Elternteil sortieren
    rows.forEach((row) => row.sort((a, b) => {
      const ka = (parents.get(a.id)?.[0] ?? peers.get(a.id)?.[0] ?? a.id) + a.id
      const kb = (parents.get(b.id)?.[0] ?? peers.get(b.id)?.[0] ?? b.id) + b.id
      return ka.localeCompare(kb)
    }))
    const parentEdges: [string, string][] = []
    parents.forEach((ps, child) => ps.forEach((p) => parentEdges.push([p, child])))
    return { rows, parentEdges, spouseEdges }
  }, [people, ids])

  const box = useRef<HTMLDivElement>(null)
  const nodes = useRef(new Map<string, HTMLElement>())
  const [lines, setLines] = useState<Line[]>([])

  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const compute = () => {
      const c = el.getBoundingClientRect()
      const r = (id: string) => nodes.current.get(id)?.getBoundingClientRect()
      const ls: Line[] = []
      for (const [p, ch] of parentEdges) {
        const a = r(p), b = r(ch)
        if (a && b) ls.push({ x1: a.left + a.width / 2 - c.left, y1: a.bottom - c.top, x2: b.left + b.width / 2 - c.left, y2: b.top - c.top, dashed: false })
      }
      for (const [s1, s2] of spouseEdges) {
        const a = r(s1), b = r(s2)
        if (a && b) {
          const [l, rr] = a.left < b.left ? [a, b] : [b, a]
          ls.push({ x1: l.right - c.left, y1: l.top + l.height / 2 - c.top, x2: rr.left - c.left, y2: rr.top + rr.height / 2 - c.top, dashed: true })
        }
      }
      setLines(ls)
    }
    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    return () => ro.disconnect()
  }, [rows, parentEdges, spouseEdges])

  if (!people.length) return null
  return (
    <div className="overflow-x-auto">
      <div ref={box} className="relative min-w-max px-2 py-2">
        <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
          {lines.map((l, i) => {
            const my = (l.y1 + l.y2) / 2
            return l.dashed
              ? <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#d97706" strokeWidth={1.5} strokeDasharray="4 3" />
              : <path key={i} d={`M${l.x1},${l.y1} C${l.x1},${my} ${l.x2},${my} ${l.x2},${l.y2}`} fill="none" stroke="#a8a29e" strokeWidth={1.25} />
          })}
        </svg>
        {rows.map((row, gi) => (
          <div key={gi} className="relative mb-14 flex justify-center gap-6 last:mb-0">
            {row.map((p) => (
              <Link
                key={p.id}
                to={`/figuren/${p.id}`}
                ref={(n) => { if (n) nodes.current.set(p.id, n); else nodes.current.delete(p.id) }}
                className={`rounded-lg border px-3 py-2 text-center text-sm transition-colors ${p.id === focus ? 'border-amber-500 bg-amber-50 font-semibold text-amber-950' : 'border-stone-200 bg-white text-stone-800 hover:border-amber-300'}`}
              >
                <span className="block font-serif">{p.name_iast ?? p.name}</span>
              </Link>
            ))}
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-stone-500">Linien: Abstammung laut Text · gestrichelt: Ehe. Die Genealogie gibt die Überlieferung wieder, nicht historisch belegte Personen.</p>
    </div>
  )
}
