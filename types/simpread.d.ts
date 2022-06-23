export namespace Simpread {
  export type Tag = string

  export interface Annotation {
    id: number
    note: string
    tags: Tag[]
  }

  export interface Article {
    idx: number
    title: string
    desc?: string
    note?: string
    favicon: string
    url: string
    tags: Tag[]
    annotations: Annotation[]
  }

  export interface Config {
    unrdist: Article[]
  }
}
