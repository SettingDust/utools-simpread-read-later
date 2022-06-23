export {}

export interface UtoolsExport {
  mode: 'list' | 'doc' | 'none'
  args: any
}

export interface Action<T> {
  code: string,
  type: string,
  payload: T
}

export interface ListEntry {
  title: string
  description: string
}

export type ListExport<P, D> = UtoolsExport & {
  mode: 'list',
  args: {
    enter: (action: Action<P>, callback: (data: ListEntry & D[]) => void) => void
    search: (action: Action<P>, input: string, callback: (data: ListEntry & D[]) => void) => void
    select: (action: Action<P>, item: ListEntry & D, callback: (data: ListEntry & D[]) => void) => void
  }
}
