export type ISODate = string

export interface RichTextTextNode {
  type?: 'text'
  text: string
}

export interface RichTextElementNode {
  type: string // e.g., 'paragraph', 'heading', 'link', etc.
  children: Array<RichTextTextNode | RichTextElementNode>
  // optional properties like 'url' for link nodes can be added via index signature
  [key: string]: any
}

export type RichTextNode = RichTextTextNode | RichTextElementNode

export interface Seccion {
  id: number
  title: string
  subtitle?: string
  orden: number
  estilo: string
  url?: string | null
  content: RichTextNode[]
}

export interface Item {
  id: number
  documentId: string
  title: string
  subtitle: string
  url: string | null
  orden: number
  estilo: string
  contenido: string
  slug: string
  createdAt: ISODate
  updatedAt: ISODate
  publishedAt: ISODate | null
  secciones: Seccion[]
}

export interface ItemsResponse {
  data: Item[]
  meta?: {
    pagination?: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}
