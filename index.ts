import escapeStringRegexp from 'escape-string-regexp'
import * as config from './config'

config.load(utools.db.get('config')?.configPath)

window.exports = {
  'simpread-read-later': {
    mode: 'list',
    args: {
      enter: (_: any, callback: (arg: any[]) => void) => {
        const path = config.filterBlank(utools.db.get('config')?.configPath)
        if (!path)
          callback([
            {
              title: '请设置配置文件路径',
              description: '使用 src 指令配置',
              needConfig: true
            }
          ])
        else {
          console.log(config.data)
          callback(config.data)
        }
      },
      search: (_, input: string, callback: (arg: any[]) => void) => {
        if (input.startsWith('#')) {
          const tags: string[] = input.split(' ').map((it) => (it.startsWith('#') ? it.slice(1) : it))
          let result = config.data
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
          let result = config.data
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
      // 用户选择列表中某个条目时被调用
      select: async (action, item) => {
        if (item.needConfig) {
          utools.redirect('simpread-config', '')
          return
        }
        const url = `simpread://open?type=unread&idx=${item.id}`
        await utools.shellOpenExternal(url)
      },
      // 子输入框为空时的占位符，默认为字符串'搜索'
      placeholder: '输入搜索内容，# 开头搜索标签'
    }
  },
  'simpread-read-later-config': {
    mode: 'list',
    args: {
      enter: (action, callback) => {
        const configPath = utools.db.get('config')?.configPath
        callback([
          {
            title: configPath ? '当前配置文件路径' : '请在搜索栏输入配置文件路径',
            description: configPath
          }
        ])
      },
      search: (action, input, callback) => {
        if (input.length)
          try {
            require(input)
            callback([
              {
                title: '设为配置文件路径',
                description: input,
                configPath: input
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
        else {
          const configPath = utools.db.get('config')?.configPath
          callback([
            {
              title: configPath ? '当前配置文件路径' : '请在搜索栏输入配置文件路径',
              description: configPath
            }
          ])
        }
      },
      // 用户选择列表中某个条目时被调用
      select: (action, item) => {
        if (item.configPath) {
          const localConfig = utools.db.get('config') ?? { _id: 'config' }
          localConfig.configPath = item.configPath
          utools.db.put(localConfig)
          config.load(localConfig.configPath)
          utools.redirect('simpread', '')
          return
        }
        utools.redirect('simpread-config', '')
      },
      // 子输入框为空时的占位符，默认为字符串"搜索"
      placeholder: '配置值'
    }
  }
}
