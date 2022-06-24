import escapeStringRegexp from 'escape-string-regexp'
import * as config from './config'
import * as simpread from './simpread-config'
import { ListExport } from './types/utools'
import open from 'open'
import normalizeUrl from 'normalize-url'
import { filterBlank } from './simpread-config'

const exports: {
  'simpread-read-later': ListExport<undefined, simpread.Article>
  'simpread-read-later-config': ListExport<undefined, { key: config.Keys }>
  'simpread-read-later-config-set': ListExport<config.Keys | undefined, { value: any }>
} = {
  'simpread-read-later': {
    mode: 'list',
    args: {
      enter: (_, callback) => {
        if (!simpread.filterBlank(utools.db.get('config')?.configPath))
          setTimeout(() => utools.redirect('简悦配置设置', 'configPath'))
        else callback(simpread.data)
      },
      search: (_, input: string, callback) => {
        if (input.startsWith('#')) {
          const tags: string[] = input.split(' ').map((it) => (it.startsWith('#') ? it.slice(1) : it))
          let result = simpread.data
          tags
            .map((it) => new RegExp(escapeStringRegexp(it), 'i'))
            .forEach(
              (regex) =>
                (result = result.filter(
                  (article) =>
                    article.tags?.some((it) => regex.test(it)) ||
                    article.annotations?.some(({ tags }) => tags.some((it) => regex.test(it)))
                ))
            )
          callback(result)
        } else {
          const keywords = input.split(' ')
          let result = simpread.data
          keywords
            .map((it) => new RegExp(escapeStringRegexp(it), 'i'))
            .forEach(
              (regex) =>
                (result = result.filter(
                  (it) =>
                    regex.test(it.title) ||
                    regex.test(it.description) ||
                    regex.test(it.note) ||
                    regex.test(it.url) ||
                    it.annotations?.some(({ note }) => regex.test(note))
                ))
            )
          callback(result)
        }
      },
      select: async (action, item) => {
        const pageUrl = `${config.data.prefixUrl}:${simpread.port}/reading/${item.id}`
        const urlScheme = `simpread://open?type=unread&idx=${item.id}`
        const browser = open.apps[config.data.browser] ?? config.data.browser
        fetch(pageUrl)
          .then((it) => it.json())
          .then(async (it) => {
            if (it.code)
              if (config.data.useUrlScheme) await open(urlScheme)
              else {
                await open(item.url, {
                  app: { name: browser }
                })
              }
          })
          .catch(async () => {
            if (config.data.useUrlScheme) await open(urlScheme)
            else {
              await open(pageUrl, {
                app: { name: browser }
              })
            }
          })
      },
      placeholder: '输入搜索内容，# 开头搜索标签'
    }
  },
  'simpread-read-later-config': {
    mode: 'list',
    args: {
      enter: (_, callback) => {
        callback(
          Object.entries(config.data).map(([key, value]) => {
            const translation = config.translations[key]
            return {
              title: translation.title,
              description: filterBlank(value?.toString()) ?? translation.hint,
              key: key
            }
          })
        )
      },
      search: (_, input, callback) => {
        const regex = new RegExp(escapeStringRegexp(input), 'i')
        callback(
          Object.entries(config.data)
            .filter(
              ([key, value]) => regex.test(key) || regex.test(value) || regex.test(config.translations[key].title)
            )
            .map(([key, value]) => {
              const translation = config.translations[key]
              return {
                title: translation.title,
                description: filterBlank(value?.toString()) ?? translation.hint,
                key: key
              }
            })
        )
      },
      // 用户选择列表中某个条目时被调用
      select: (_, item) => utools.redirect('简悦配置设置', item.key),
      placeholder: '点击选择配置项'
    }
  },
  'simpread-read-later-config-set': {
    mode: 'list',
    args: {
      enter: (action, callback) => {
        if (action.payload) {
          const value = config.data[action.payload]
          const translation = config.translations[action.payload]
          if (value !== undefined) setTimeout(() => utools.setSubInputValue(value.toString()))
          callback([
            {
              title: translation.title,
              description: filterBlank(value?.toString()) ?? translation.hint
            }
          ])
        } else
          callback([
            {
              title: '未选择配置项'
            }
          ])
      },
      search: (action, input, callback) => {
        if (action.payload) {
          const value = config.data[action.payload]
          const translation = config.translations[action.payload]
          if (action.payload === 'configPath') {
            try {
              require(input)
              callback([
                {
                  title: translation.title,
                  description: filterBlank(value?.toString()) ?? translation.hint,
                  value: input
                }
              ])
            } catch (e) {
              callback([
                {
                  title: `配置文件无效 ${e.message}`,
                  description: input
                }
              ])
            }
          } else
            callback([
              {
                title: translation.title,
                description: filterBlank(value?.toString()) ?? translation.hint,
                value: input
              }
            ])
        }
      },
      select: (action, item) => {
        if (action.payload) {
          const localConfig = utools.db.get('config') ?? { _id: 'config' }
          if (action.payload === 'prefixUrl') item.value = normalizeUrl(item.value)
          if (action.payload === 'useUrlScheme') item.value = item.value !== 'false'
          localConfig[action.payload] = item.value
          utools.db.put(localConfig)
          if (action.payload === 'configPath') simpread.load(item.value)
          config.load()
          utools.redirect('简悦配置', '')
          return
        }
      },
      placeholder: '配置值'
    }
  }
}

window.exports = exports

config.load()
simpread.load(config.data.configPath)
