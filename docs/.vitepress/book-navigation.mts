import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

interface BookChapter {
  title: string
  file: string
  status?: string
  includeInWeb?: boolean
}

interface BookGroup {
  id: string
  title: string
  chapters?: BookChapter[]
}

interface BookPart {
  id: string
  title: string
  chapters?: BookChapter[]
  groups?: BookGroup[]
}

interface BookOrder {
  parts: BookPart[]
}

interface NavigationItem {
  text: string
  link?: string
  items?: NavigationItem[]
}

const orderFile = resolve(process.cwd(), 'book', 'book-order.json')
const order = JSON.parse(readFileSync(orderFile, 'utf8')) as BookOrder

const isWebChapter = (chapter: BookChapter) =>
  chapter.status === 'published' && chapter.includeInWeb !== false

const routeFromFile = (file: string) => {
  const normalized = file.replaceAll('\\', '/')
  if (!normalized.endsWith('.md'))
    throw new Error(`Book chapter must be a Markdown file: ${file}`)

  const route = `/${normalized.slice(0, -3)}`
  if (route === '/')
    throw new Error(`Book chapter cannot resolve to the site root: ${file}`)
  return route
}

const chapterItem = (chapter: BookChapter): NavigationItem => ({
  text: chapter.title,
  link: routeFromFile(chapter.file),
})

const publishedChapters = (chapters: BookChapter[] | undefined) =>
  (chapters ?? []).filter(isWebChapter)

const publishedGroups = (part: BookPart) =>
  (part.groups ?? [])
    .map(group => ({ ...group, chapters: publishedChapters(group.chapters) }))
    .filter(group => group.chapters.length > 0)

const allPublishedChapters = (part: BookPart) => [
  ...publishedChapters(part.chapters),
  ...publishedGroups(part).flatMap(group => group.chapters),
]

const sidebarPrefix = (part: BookPart) => {
  const firstChapter = allPublishedChapters(part)[0]
  if (!firstChapter)
    throw new Error(`Book part has no published web chapters: ${part.id}`)

  const [directory] = firstChapter.file.replaceAll('\\', '/').split('/')
  return `/${directory}/`
}

export const bookNav: NavigationItem[] = [{ text: '首页', link: '/' }]
export const bookSidebar: Record<string, NavigationItem[]> = {}

for (const part of order.parts) {
  const chapters = publishedChapters(part.chapters)
  const groups = publishedGroups(part)

  if (groups.length > 0) {
    bookNav.push({
      text: part.title,
      items: groups.map(group => ({
        text: group.title,
        link: routeFromFile(group.chapters[0].file),
      })),
    })

    bookSidebar[sidebarPrefix(part)] = [
      {
        text: part.title,
        items: groups.map(group => ({
          text: group.title,
          items: group.chapters.map(chapterItem),
        })),
      },
    ]
    continue
  }

  if (chapters.length === 0)
    continue

  bookNav.push({ text: part.title, link: routeFromFile(chapters[0].file) })
  bookSidebar[sidebarPrefix(part)] = [
    {
      text: part.title,
      items: chapters.map(chapterItem),
    },
  ]
}
