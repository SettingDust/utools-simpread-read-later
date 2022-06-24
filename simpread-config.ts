import { Simpread } from './types/simpread'
import normalizeUrl, { Options } from 'normalize-url'
import { FSWatcher, watch } from 'fs'

const DEFAULT_ICON = 'https://simpread-1254315611.cos.ap-shanghai.myqcloud.com/mobile/apple-icon-180x180.png'

export const filterBlank = (input: string): string | undefined => {
  const trimmed = input?.trim()
  return trimmed?.length ? trimmed : undefined
}

const normalizeOptions: Options = {
  stripWWW: false
}

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
  config.unrdist.map((it) => {
    let icon
    try {
      icon = filterBlank(it.favicon) ? normalizeUrl(it.favicon, normalizeOptions) : DEFAULT_ICON
    } catch (ignored) {
      icon = DEFAULT_ICON
    }

    let url
    try {
      url = normalizeUrl(it.url, normalizeOptions)
    } catch (ignored) {}
    return {
      id: it.idx,
      title: it.title,
      description: it.desc ?? '',
      note: it.note ?? '',
      icon,
      url,
      tags: it.tags,
      annotations: it.annotations?.map((annotation) => ({
        id: annotation.id,
        note: annotation.note,
        tags: annotation.tags
      }))
    }
  })

let watcher: FSWatcher

const readConfig = (path: string) => {
  try {
    delete require.cache[require.resolve(path)]
    const simpreadConfig: Simpread.Config = require(path)
    data = fetchArticle(simpreadConfig)
    port = simpreadConfig.option.remote.port
    console.log(data)
  } catch (err) {
    console.error(err)
  }
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
