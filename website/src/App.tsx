import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import SectionPage from './pages/SectionPage'
import EntityPage from './pages/EntityPage'
import NotFound from './pages/NotFound'
import { CharactersPage, GeographyPage, QuestionsPage, SearchPage, SourcesPage, TimelinePage } from './pages/ListPages'
import { KIND } from './content/meta'
import { CoursesPage } from './pages/Courses'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="kurse" element={<CoursesPage />} />
          <Route path="schriften" element={<SectionPage section="scriptures" />} />
          <Route path="geschichte" element={<SectionPage section="history" />} />
          <Route path="kosmologie" element={<SectionPage section="cosmology" />} />
          <Route path="philosophie" element={<SectionPage section="philosophy" />} />
          <Route path="figuren" element={<CharactersPage />} />
          <Route path="zeitleiste" element={<TimelinePage />} />
          <Route path="geografie" element={<GeographyPage />} />
          <Route path="quellen" element={<SourcesPage />} />
          <Route path="fragen" element={<QuestionsPage />} />
          <Route path="suche" element={<SearchPage />} />
          {Object.values(KIND).map((k) => <Route key={k.path} path={`${k.path}/:id`} element={<EntityPage />} />)}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
