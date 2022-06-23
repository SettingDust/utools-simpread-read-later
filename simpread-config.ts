import { Simpread } from './types/simpread'
import normalizeUrl from 'normalize-url'
import { FSWatcher, readFileSync, watch } from 'fs'

const DEFAULT_ICON = 'https://simpread-1254315611.cos.ap-shanghai.myqcloud.com/mobile/apple-icon-180x180.png'

export const filterBlank = (input: string): string | null => input?.trim() ?? null

export interface Article {
  id: number
  title: string
  description: string
  note: string
  icon: string
  url: string
  tags: Simpread.Tag[]
  annotations: Simpread.Annotation[]
}

const fetchArticle = (config: Simpread.Config): Article[] =>
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

const readConfig = (path: string) => {
  try {
    const simpreadConfig: Simpread.Config = require(path)
    data = fetchArticle(simpreadConfig)
    port = simpreadConfig.option.remote.port
  } catch (ignored) {}
}

export let data: Article[]

export let port: number = 7026

export function load(path?: string) {
  watcher?.close()
  path = filterBlank(path)
  if (!path) return
  readConfig(path)
  watcher = watch(path, () => readConfig(path))
}
