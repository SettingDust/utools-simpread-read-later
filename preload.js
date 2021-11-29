const fs = require("fs")

let readLaterData = {}
let port = 7026
const LOGO_URL = 'https://simpread-1254315611.cos.ap-shanghai.myqcloud.com/mobile/apple-icon-180x180.png'
let watcher

window.exports = {
  "simpread-read-later": {
    mode: "list",
    args: {
      enter: (action, callbackSetList) => {
        console.log(123)
        const {configPath} = utools.db.get("config") ?? {_id: "config"}
        if (!configPath) {
          callbackSetList([{
            title: "请设置配置文件路径",
            description: "使用 src 指令配置"
          }])
        } else {
          callbackSetList(readLaterData)
        }
      },
      search: (action, searchWord, callbackSetList) => {
        if (searchWord.startsWith("#")) {
          const searchTags = searchWord.split(" ").map(it => {
            if (it.startsWith("#")) return it.slice(1); else return it
          })
          let tempList = readLaterData
          searchTags.forEach(keyword => {
            tempList = tempList
              .filter(it =>
                it.tags?.some(tag => tag.includes(keyword)) ||
                it.annotations?.some(annotation => annotation.tags.some(tag => tag.includes(keyword)))
              )
          })
          callbackSetList(tempList)
        } else {
          const searchWords = searchWord.split(" ")
          let tempList = readLaterData
          searchWords.forEach(keyword => {
            tempList = tempList
              .filter(it =>
                it.title.includes(keyword) ||
                it.description?.includes(keyword) ||
                it.note?.includes(keyword) ||
                it.annotations?.some(annotation => annotation.note.includes(keyword))
              )
          })
          callbackSetList(tempList)
        }
      },
      // 用户选择列表中某个条目时被调用
      select: async (action, itemData) => {
        if (itemData.lackConfig) {
          utools.redirect("simpread-config", "")
          return
        }
        utools.hideMainWindow()
        const localUrl = `http://localhost:${port}/reading/${itemData.id}`
        const {openExternal} = require('electron').shell;
        const resp = await fetch(localUrl).then(it => it.json()).catch(() => openExternal(localUrl))
        if (resp) openExternal(itemData.url)
        utools.outPlugin()
      },
      // 子输入框为空时的占位符，默认为字符串"搜索"
      placeholder: "输入搜索内容，# 开头搜索标签"
    }
  },
  "simpread-read-later-config": {
    mode: "list",
    args: {
      enter: (action, callbackSetList) => {
        const config = utools.db.get("config") ?? {_id: "config"}
        callbackSetList([{
          title: config.configPath ? "当前配置文件路径" : "请在搜索栏输入配置文件路径",
          description: config.configPath ?? undefined
        }])
      },
      search: (action, searchWord, callbackSetList) => {
        if (searchWord.length)
          try {
            require(searchWord)
            callbackSetList([{
              title: "设为配置文件路径",
              description: searchWord ?? undefined,
              configPath: searchWord
            }])
          } catch (e) {
            callbackSetList([{
              title: `配置文件无效 ${e.message}`,
              description: searchWord
            }])
          }
        else {
          const config = utools.db.get("config") ?? {_id: "config"}
          callbackSetList([{
            title: config.configPath ? "当前配置文件路径" : "请在搜索栏输入配置文件路径",
            description: config.configPath ?? undefined
          }])
        }
      },
      // 用户选择列表中某个条目时被调用
      select: (action, itemData) => {
        if (itemData.configPath) {
          const config = utools.db.get("config") ?? {_id: "config"}
          config.configPath = itemData.configPath
          utools.db.put(config)
          watcher?.close()
          loadConfig(JSON.parse(fs.readFileSync(itemData.configPath, {encoding: 'utf8'})))
          watcher = fs.watch(itemData.configPath,
            () => loadConfig(JSON.parse(fs.readFileSync(itemData.configPath, {encoding: 'utf8'})))
          )
          utools.redirect("simpread", "")
          return
        }
        utools.redirect("simpread-config", "")
      },
      // 子输入框为空时的占位符，默认为字符串"搜索"
      placeholder: "配置值"
    }
  }
}

function loadConfig(json) {
  const {option, unrdist: articles} = json
  port = option.remote.port
  readLaterData = articles.map(it => {
    let favicon
    if (it.favicon?.length) {
      if (it.favicon.startsWith("//")) {
        favicon = `http:${it.favicon}`
      } else if (it.favicon.startsWith("/")) {
        favicon = LOGO_URL
      } else {
        favicon = it.favicon
      }
    } else {
      favicon = LOGO_URL
    }
    return {
      id: it.idx,
      title: it.title,
      description: it.desc ?? '',
      note: it.note ?? '',
      icon: favicon,
      url: it.url.startsWith("/") ? `http:${it.url}` : it.url,
      tags: it.tags,
      annotations: it.annotations?.map(annotation => ({
        id: annotation.id,
        note: annotation.note,
        tags: annotation.tags
      }))
    }
  })
}

utools.onPluginReady(() => {
  utools.setSubInput()

  const {configPath} = utools.db.get("config") ?? {_id: "config"}
  if (configPath) {
    loadConfig(JSON.parse(fs.readFileSync(configPath, {encoding: 'utf8'})))
    watcher = fs.watch(configPath,
      () => {
        loadConfig(JSON.parse(fs.readFileSync(configPath, {encoding: 'utf8'})))
      }
    )
  }
})
