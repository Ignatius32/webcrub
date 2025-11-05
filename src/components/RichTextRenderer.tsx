import React from 'react'
import type { RichTextNode } from '@/types/items'

// Minimal Slate-like JSON renderer. Extend as needed (headings, links, lists).
export default function RichTextRenderer({ nodes }: { nodes: RichTextNode[] }) {
  if (!nodes || nodes.length === 0) return null
  return (
    <div className="rte">
      {nodes.map((n, idx) => (
        <Node key={idx} node={n} />
      ))}
    </div>
  )
}

function Node({ node }: { node: RichTextNode }) {
  if (typeof (node as any).text === 'string') {
    return <>{(node as any).text}</>
  }
  const el = node as any
  switch (el.type) {
    case 'paragraph':
      return (
        <p>
          {Array.isArray(el.children)
            ? el.children.map((c: any, i: number) => <Node key={i} node={c} />)
            : null}
        </p>
      )
    case 'heading':
      return (
        <h3>
          {Array.isArray(el.children)
            ? el.children.map((c: any, i: number) => <Node key={i} node={c} />)
            : null}
        </h3>
      )
    default:
      return (
        <span>
          {Array.isArray(el.children)
            ? el.children.map((c: any, i: number) => <Node key={i} node={c} />)
            : null}
        </span>
      )
  }
}
