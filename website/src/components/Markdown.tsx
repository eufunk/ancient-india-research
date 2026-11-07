import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link } from 'react-router-dom'
import { getEntity } from '../content'

/** Interne Verweise im Text: [[id]] oder [[id|Beschriftung]] */
function resolveWikiLinks(body: string) {
  return body.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, rawId: string, label?: string) => {
    const e = getEntity(rawId.trim())
    return e ? `[${label ?? e.title}](${e.href})` : `**⚠ ${rawId}**`
  })
}

export function Markdown({ body }: { body: string }) {
  const text = useMemo(() => resolveWikiLinks(body), [body])
  return (
    <div className="prose prose-stone max-w-none prose-headings:font-serif prose-headings:font-semibold prose-h2:mt-10 prose-h2:border-b prose-h2:border-stone-200 prose-h2:pb-2 prose-a:text-amber-900 prose-a:decoration-amber-300 prose-blockquote:border-amber-300 prose-blockquote:font-serif prose-table:text-sm prose-th:bg-stone-100 prose-th:px-3 prose-td:px-3">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) =>
            href?.startsWith('/') ? <Link to={href}>{children}</Link>
              : <a href={href} target="_blank" rel="noreferrer">{children}</a>,
          table: ({ children }) => <div className="overflow-x-auto"><table>{children}</table></div>,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  )
}
