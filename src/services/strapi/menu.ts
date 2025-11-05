import { strapiFetch, normalizeUrl } from './client'

export interface MenuItemLink {
  id: number | string
  titulo: string
  enlace: string
}

export interface MenuSection {
  id: number | string
  titulo: string
  items: MenuItemLink[]
}

export interface MenuGroup {
  titulo: string
  sections: MenuSection[]
}

interface StrapiListResponse<T> {
  data: Array<T>
  meta?: unknown
}

export function fetchMenuPpl(): Promise<MenuGroup[]> {
  const q = '/menu-ppls?populate=*'
  
  return strapiFetch<StrapiListResponse<any>>(q).then((json) => {
    // Group by btns_menu.titulo
    const groupsMap: Record<string, MenuSection[]> = {}
    
    const data = json.data || []
    
    for (const item of data) {
      // Extract btns_menu title
      let btnsMenuTitle = 'Sin categoría'
      if (item.btns_menu) {
        if (typeof item.btns_menu === 'string') {
          btnsMenuTitle = item.btns_menu
        } else if (item.btns_menu.titulo) {
          btnsMenuTitle = item.btns_menu.titulo
        } else if (item.btns_menu.data?.titulo) {
          btnsMenuTitle = item.btns_menu.data.titulo
        }
      }
      
      // Create section with its items
      const section: MenuSection = {
        id: item.id ?? item.documentId ?? Math.random().toString(36).slice(2),
        titulo: item.titulo || '',
        items: (item.itemsmenu || []).map((subitem: any): MenuItemLink => ({
          id: subitem.id ?? Math.random().toString(36).slice(2),
          titulo: subitem.titulo || '',
          enlace: normalizeUrl(subitem.enlace || '#'),
        })),
      }
      
      // Add section to the appropriate group
      if (!groupsMap[btnsMenuTitle]) {
        groupsMap[btnsMenuTitle] = []
      }
      groupsMap[btnsMenuTitle].push(section)
    }
    
    // Convert to array of groups
    const result: MenuGroup[] = []
    for (const [titulo, sections] of Object.entries(groupsMap)) {
      result.push({ titulo, sections })
    }
    
    return result
  })
}
