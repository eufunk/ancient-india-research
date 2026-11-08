/**
 * Rendert jede Route serverseitig und meldet Laufzeitfehler.
 * Aufruf: npm run test:smoke
 */
import { createServer } from 'vite'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
let failed = 0
try {
  const { content } = await server.ssrLoadModule('/src/content/index.ts')
  const { KIND } = await server.ssrLoadModule('/src/content/meta.ts')
  const Layout = (await server.ssrLoadModule('/src/components/Layout.tsx')).default
  const Dashboard = (await server.ssrLoadModule('/src/pages/Dashboard.tsx')).default
  const SectionPage = (await server.ssrLoadModule('/src/pages/SectionPage.tsx')).default
  const EntityPage = (await server.ssrLoadModule('/src/pages/EntityPage.tsx')).default
  const L = await server.ssrLoadModule('/src/pages/ListPages.tsx')
  const C = await server.ssrLoadModule('/src/pages/Courses.tsx')
  const h = React.createElement

  const tree = (url) => h(MemoryRouter, { initialEntries: [url] },
    h(Routes, null, h(Route, { element: h(Layout) },
      h(Route, { index: true, element: h(Dashboard) }),
      h(Route, { path: 'kurse', element: h(C.CoursesPage) }),
      h(Route, { path: 'schriften', element: h(SectionPage, { section: 'scriptures' }) }),
      h(Route, { path: 'geschichte', element: h(SectionPage, { section: 'history' }) }),
      h(Route, { path: 'kosmologie', element: h(SectionPage, { section: 'cosmology' }) }),
      h(Route, { path: 'philosophie', element: h(SectionPage, { section: 'philosophy' }) }),
      h(Route, { path: 'figuren', element: h(L.CharactersPage) }),
      h(Route, { path: 'zeitleiste', element: h(L.TimelinePage) }),
      h(Route, { path: 'geografie', element: h(L.GeographyPage) }),
      h(Route, { path: 'quellen', element: h(L.SourcesPage) }),
      h(Route, { path: 'fragen', element: h(L.QuestionsPage) }),
      h(Route, { path: 'suche', element: h(L.SearchPage) }),
      ...Object.values(KIND).map((k) => h(Route, { key: k.path, path: `${k.path}/:id`, element: h(EntityPage) })),
    )))

  const urls = ['/', '/kurse', '/schriften', '/geschichte', '/kosmologie', '/philosophie', '/figuren', '/zeitleiste',
    '/geografie', '/quellen', '/fragen', '/suche?q=rgveda', ...content.entities.map((e) => e.href)]
  const known = new Set(urls.map((u) => u.split('?')[0]))
  const broken = new Map()
  const origError = console.error
  for (const url of urls) {
    const errs = []
    console.error = (...a) => { const m = a.join(' '); if (!/useLayoutEffect/.test(m)) errs.push(m) }
    try {
      const html = renderToString(tree(url))
      if (html.includes('Nicht gefunden')) errs.push('NotFound gerendert')
      for (const [, href] of html.matchAll(/href="(\/[^"#?]*)/g)) {
        const p = decodeURIComponent(href)
        if (!known.has(p)) broken.set(p, [...(broken.get(p) ?? []), url])
      }
    } catch (e) { errs.push(e.stack ?? String(e)) }
    console.error = origError
    if (errs.length) { failed++; console.log(`✗ ${url}\n   ${errs.join('\n   ').slice(0, 800)}`) }
  }
  for (const [p, from] of broken) { failed++; console.log(`✗ Toter Link ${p}  (auf: ${[...new Set(from)].slice(0, 5).join(', ')})`) }
  console.log(`${urls.length - failed}/${urls.length} Seiten ohne Fehler gerendert.`)
  if (content.problems.length) console.log('Datenprobleme:', content.problems)
} finally {
  await server.close()
}
process.exit(failed ? 1 : 0)
