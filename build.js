const {copySync} = require("fs-extra");
const paths = [
  "logo.png",
  "plugin.json",
  "preload.js",
  "node_modules/utools-api-types"
]

paths.forEach(path => {
  copySync(path, `dist/${path}`)
})
