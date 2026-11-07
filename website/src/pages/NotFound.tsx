import { Link } from 'react-router-dom'
import { PageHeader } from '../components/ui'

export default function NotFound() {
  return (
    <div>
      <PageHeader title="Nicht gefunden" subtitle="Diese Seite oder dieser Eintrag existiert nicht (oder die ID wurde geändert)." />
      <Link to="/" className="text-amber-900 hover:underline">← Zur Übersicht</Link>
    </div>
  )
}
