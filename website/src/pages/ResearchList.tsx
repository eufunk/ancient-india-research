import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EVIDENCE, EVIDENCE_IDS, STATUS, areaLabel } from '../content/meta'
import { Badge, Empty, EvidenceList, FilterBar, Select } from '../components/ui'
import type { ResearchDoc } from '../content/types'

export function ResearchList({ docs, emptyHint }: { docs: ResearchDoc[]; emptyHint?: string }) {
  const [area, setArea] = useState('')
  const [ev, setEv] = useState('')
  const [st, setSt] = useState('')
  const areas = useMemo(() => [...new Set(docs.map((d) => d.area))], [docs])
  const list = docs.filter((d) => (!area || d.area === area) && (!ev || d.evidence.includes(ev as never)) && (!st || d.status === st))

  if (!docs.length) return <Empty>{emptyHint ?? 'Noch keine Forschungsdokumente in diesem Bereich.'}</Empty>
  return (
    <div>
      {docs.length > 3 && (
        <FilterBar>
          {areas.length > 1 && <Select label="Bereich" value={area} onChange={setArea} options={areas.map((a) => [a, areaLabel(a)])} />}
          <Select label="Evidenz" value={ev} onChange={setEv} options={EVIDENCE_IDS.map((e) => [e, EVIDENCE[e].label])} />
          <Select label="Status" value={st} onChange={setSt} options={Object.entries(STATUS)} />
        </FilterBar>
      )}
      {list.length === 0 ? <Empty>Keine Treffer für diese Filter.</Empty> : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((d) => (
            <Link key={d.id} to={`/forschung/${d.id}`} className="group rounded-xl border border-stone-200 bg-white p-5 transition-colors hover:border-amber-300">
              <div className="text-xs font-medium uppercase tracking-wide text-stone-500">{areaLabel(d.area)}</div>
              <h3 className="mt-1 font-serif text-xl font-semibold text-stone-900 group-hover:text-amber-900">{d.title}</h3>
              {d.title_iast && <p className="text-sm italic text-stone-500">{d.title_iast}</p>}
              {d.summary && <p className="mt-2 line-clamp-3 text-sm text-stone-600">{d.summary}</p>}
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge>{STATUS[d.status] ?? d.status}</Badge>
                <Badge>{d.sources.length} Quellen</Badge>
                <EvidenceList list={d.evidence} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
