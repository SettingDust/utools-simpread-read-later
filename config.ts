import { AppName } from 'open'

interface Config {
  configPath: string
  useUrlScheme: boolean
  browser: AppName | string
}

export let data: Config

export const readable = {
  configPath: '配置文件路径',
  useUrlScheme: '使用 URL Scheme',
  browser: '浏览器（firefox、edge、chrome 等）'
}

export function load() {
  data = {
    browser: undefined,
    configPath: undefined,
    useUrlScheme: true,
    ...utools.db.get('config')
  }
}
