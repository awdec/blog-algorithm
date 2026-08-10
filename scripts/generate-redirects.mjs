import { mkdir, readdir, writeFile } from 'node:fs/promises'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const workspaceRoot = fileURLToPath(new URL('../', import.meta.url))
const distDir = join(workspaceRoot, 'docs', '.vitepress', 'dist')

// The site currently deploys at the custom-domain root (`base: '/'`).
const siteBase = '/'

const routePrefixRedirects = [
  { from: 'data structure', to: 'data-structure' },
  { from: 'math/number theory', to: 'math/number-theory' },
  { from: 'math/combinatorial mathematics', to: 'math/combinatorics' },
]

const pageRedirects = [
  { from: 'data-structure/dfs', to: 'data-structure/parallel-binary-search' },
  { from: 'data structure/dfs', to: 'data-structure/parallel-binary-search' },
]

async function collectHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const entryPath = join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...await collectHtmlFiles(entryPath))
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(entryPath)
    }
  }

  return files
}

function toUrlPath(path) {
  return path.split(sep).join('/')
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function createRedirectHtml(targetUrl) {
  const escapedTarget = escapeHtml(targetUrl)
  const scriptTarget = JSON.stringify(targetUrl).replaceAll('<', '\\u003c')

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex">
    <meta http-equiv="refresh" content="0; url=${escapedTarget}">
    <link rel="canonical" href="${escapedTarget}">
    <title>页面已迁移</title>
    <script>
      window.location.replace(${scriptTarget} + window.location.search + window.location.hash)
    </script>
  </head>
  <body>
    <p>页面已迁移至 <a href="${escapedTarget}">${escapedTarget}</a>。</p>
  </body>
</html>
`
}

let redirectCount = 0

for (const { from, to } of routePrefixRedirects) {
  const newPrefixDir = join(distDir, ...to.split('/'))
  const newPages = await collectHtmlFiles(newPrefixDir)

  if (newPages.length === 0) {
    throw new Error(`No built pages found for redirect target prefix: ${to}`)
  }

  for (const newPage of newPages) {
    const relativeHtmlPath = relative(newPrefixDir, newPage)
    const routeTail = toUrlPath(relativeHtmlPath)
      .replace(/\.html$/, '')
      .replace(/(^|\/)index$/, '$1')
    const targetUrl = `${siteBase}${to}/${routeTail}`.replace(/\/{2,}/g, '/')
    const oldPage = join(distDir, ...from.split('/'), relativeHtmlPath)

    await mkdir(dirname(oldPage), { recursive: true })
    await writeFile(oldPage, createRedirectHtml(targetUrl), 'utf8')
    redirectCount += 1
  }
}

for (const { from, to } of pageRedirects) {
  const targetUrl = `${siteBase}${to}`.replace(/\/{2,}/g, '/')
  const oldPage = `${join(distDir, ...from.split('/'))}.html`

  await mkdir(dirname(oldPage), { recursive: true })
  await writeFile(oldPage, createRedirectHtml(targetUrl), 'utf8')
  redirectCount += 1
}

console.log(`generated ${redirectCount} legacy URL redirects`)
