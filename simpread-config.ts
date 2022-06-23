import { Simpread } from './simpread'
import normalizeUrl from 'normalize-url'
import { FSWatcher, readFileSync, watch } from 'fs'

const DEFAULT_ICON = 'https://simpread-1254315611.cos.ap-shanghai.myqcloud.com/mobile/apple-icon-180x180.png'

export const filterBlank = (input: string): string | null => input?.trim() ?? null

interface Article {
  id: number
  title: string
  description: string
  note: string
  icon: string
  url: string
  tags: Simpread.Tag[]
  annotations: Simpread.Annotation[]
}

const transformConfig = (config: Simpread.Config): Article[] =>
  config.unrdist.map((it) => ({
    id: it.idx,
    title: it.title,
    description: it.desc ?? '',
    note: it.note ?? '',
    icon: filterBlank(it.favicon) ? normalizeUrl(it.favicon) : DEFAULT_ICON,
    url: normalizeUrl(it.url),
    tags: it.tags,
    annotations: it.annotations?.map((annotation) => ({
      id: annotation.id,
      note: annotation.note,
      tags: annotation.tags
    }))
  }))

let watcher: FSWatcher

const readConfig = (path: string) => (data = transformConfig(JSON.parse(readFileSync(path, { encoding: 'utf-8' }))))

export let data: Article[]

export function load(path?: string) {
  watcher?.close()
  path = filterBlank(path)
  if (!path) return
  readConfig(path)
  watcher = watch(path, () => readConfig(path))
}
