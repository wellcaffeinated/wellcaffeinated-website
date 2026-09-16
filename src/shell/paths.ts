// URL conventions shared by the build (index endpoint, pages) and the browser.

export type Section = 'projects' | 'thoughts' | 'archive' | 'play'

export const SECTIONS: Section[] = ['projects', 'thoughts', 'archive', 'play']

export function sectionHref(section: Section): string {
  return `/${section}/`
}

export function itemHref(section: Section, slug: string): string {
  return `/${section}/${slug}/`
}

export const ABOUT_HREF = '/about/'

export const SHELL_INDEX_HREF = '/shell/index.json'
