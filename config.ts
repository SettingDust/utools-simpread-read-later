import { AppName } from 'open'

export interface Config {
  configPath?: string
  useUrlScheme: boolean
  browser?: AppName | string
}

export type Keys = keyof Config

export let data: Config

export const translations = {
  configPath: {
    title: '简悦配置文件路径',
    hint: '请输入 simpread.json 文件路径'
  },
  useUrlScheme: {
    title: '是否使用 URL Scheme',
    hint: '请输入 true 或 false（缺省为 true）'
  },
  browser: {
    title: '浏览器',
    hint: '请输入 firefox、edge、chrome、完整路径'
  }
}

export function load() {
  data = {
    browser: undefined,
    configPath: undefined,
    useUrlScheme: true,
    ...utools.db.get('config')
  }
  delete data['_id']
  delete data['_rev']
}
