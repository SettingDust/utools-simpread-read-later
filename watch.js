const { copySync } = require('fs-extra')
const paths = ['logo.png', 'plugin.json']
paths.forEach((path) => copySync(path, `dist/${path}`, {}))

require('esbuild')
  .build({
    entryPoints: ['index.ts'],
    bundle: true,
    outfile: 'dist/index.js',
    platform: 'node',
    target: 'node16',
    sourcemap: 'inline',
    watch: true
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
