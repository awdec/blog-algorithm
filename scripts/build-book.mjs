import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(scriptDir, '..')
const docsDir = path.join(rootDir, 'docs')
const publicDir = path.join(docsDir, 'public')
const bookDir = path.join(rootDir, 'book')
const orderPath = path.join(bookDir, 'book-order.json')
const buildRoot = path.join(rootDir, '.book-build')
const toolsRoot = path.join(rootDir, '.book-tools')
const outputDir = path.join(rootDir, 'output', 'pdf')

const formatSettings = {
  b5: {
    output: 'algorithm-notes-b5',
    paper: ['paperwidth=176mm', 'paperheight=250mm'],
    fontSize: '10.5pt',
    geometry: ['inner=22mm', 'outer=16mm', 'top=18mm', 'bottom=22mm', 'bindingoffset=5mm'],
  },
  a4: {
    output: 'algorithm-notes-a4',
    paper: ['paperwidth=210mm', 'paperheight=297mm'],
    fontSize: '11pt',
    geometry: ['inner=25mm', 'outer=20mm', 'top=22mm', 'bottom=25mm', 'bindingoffset=6mm'],
  },
}

const errors = []
const warnings = []
const stats = {
  chapters: 0,
  parts: 0,
  images: 0,
  gifFrames: 0,
  svgConversions: 0,
  internalLinks: 0,
  externalLinks: 0,
  longCodeLines: 0,
  codeLanguages: new Set(),
}

function resetDerivedStats() {
  stats.images = 0
  stats.gifFrames = 0
  stats.svgConversions = 0
  stats.internalLinks = 0
  stats.externalLinks = 0
  stats.longCodeLines = 0
  stats.codeLanguages.clear()
}

function fail(message) {
  errors.push(message)
}

function warn(message) {
  warnings.push(message)
}

function normalizeSlashes(value) {
  return value.replaceAll('\\', '/')
}

function yamlString(value) {
  return JSON.stringify(String(value))
}

function printableDetailsTitle(value) {
  const title = String(value ?? '').trim().replace(/^点击展开\s*/u, '').trim()
  if (!title || /^(?:代码|内容)$/u.test(title))
    return ''
  return title
}

function assertInside(target, parent, label) {
  const resolved = path.resolve(target)
  const base = path.resolve(parent)
  const relative = path.relative(base, resolved)
  if (relative.startsWith('..') || path.isAbsolute(relative))
    throw new Error(`${label} escaped its allowed directory: ${resolved}`)
  return resolved
}

function resetGeneratedDirectory(target) {
  const resolved = assertInside(target, buildRoot, 'Generated book directory')
  if (resolved === path.resolve(buildRoot))
    throw new Error('Refusing to remove the whole build root')
  if (existsSync(resolved))
    rmSync(resolved, { recursive: true, force: true })
  mkdirSync(resolved, { recursive: true })
}

function exactCasePath(relativeFile) {
  const segments = normalizeSlashes(relativeFile).split('/').filter(Boolean)
  let current = docsDir
  for (const segment of segments) {
    if (!existsSync(current))
      return { exists: false, caseMatches: false }
    const names = readdirSync(current)
    if (names.includes(segment)) {
      current = path.join(current, segment)
      continue
    }
    const insensitive = names.find(name => name.toLocaleLowerCase('en-US') === segment.toLocaleLowerCase('en-US'))
    return { exists: Boolean(insensitive), caseMatches: false, actual: insensitive }
  }
  return { exists: existsSync(current), caseMatches: true, absolute: current }
}

function readOrder() {
  if (!existsSync(orderPath))
    throw new Error(`Missing book order: ${orderPath}`)
  let order
  try {
    order = JSON.parse(readFileSync(orderPath, 'utf8'))
  } catch (error) {
    throw new Error(`Invalid book-order.json: ${error.message}`)
  }
  if (!order.book || !Array.isArray(order.parts))
    throw new Error('book-order.json must contain book metadata and a parts array')
  for (const field of ['title', 'subtitle', 'author', 'language', 'version', 'buildDate']) {
    if (!String(order.book[field] ?? '').trim())
      fail(`book-order.json: book.${field} must not be empty`)
  }
  return order
}

function includedChapter(chapter) {
  return chapter?.status === 'published' && chapter.includeInBook !== false
}

function collectBook(order) {
  const seen = new Set()
  const parts = []
  for (const part of order.parts) {
    const resultPart = { id: part.id, title: part.title, chapters: [], groups: [] }
    for (const chapter of part.chapters ?? []) {
      if (includedChapter(chapter))
        resultPart.chapters.push(validateChapter(chapter, part.title, seen))
    }
    for (const group of part.groups ?? []) {
      const chapters = []
      for (const chapter of group.chapters ?? []) {
        if (includedChapter(chapter))
          chapters.push(validateChapter(chapter, `${part.title}/${group.title}`, seen))
      }
      if (chapters.length > 0)
        resultPart.groups.push({ id: group.id, title: group.title, chapters })
    }
    if (resultPart.chapters.length + resultPart.groups.reduce((sum, group) => sum + group.chapters.length, 0) === 0) {
      warn(`书目篇章“${part.title}”没有可收录文章，已跳过`)
      continue
    }
    parts.push(resultPart)
  }
  stats.parts = parts.length
  stats.chapters = seen.size
  return parts
}

function validateChapter(chapter, context, seen) {
  if (!chapter.title || !chapter.file) {
    fail(`书目 ${context} 中存在缺少 title/file 的章节`)
    return chapter
  }
  const relativeFile = normalizeSlashes(chapter.file)
  if (!relativeFile.endsWith('.md'))
    fail(`章节必须是 Markdown 文件：${relativeFile}`)
  if (seen.has(relativeFile))
    fail(`章节重复收录：${relativeFile}`)
  seen.add(relativeFile)
  const checked = exactCasePath(relativeFile)
  if (!checked.exists)
    fail(`章节文件不存在：docs/${relativeFile}`)
  else if (!checked.caseMatches)
    fail(`章节路径大小写不一致：docs/${relativeFile}${checked.actual ? `（实际片段：${checked.actual}）` : ''}`)
  return { ...chapter, file: relativeFile }
}

function chapterRoute(file) {
  return `/${normalizeSlashes(file).replace(/\.md$/i, '')}`
}

function outputChapterPath(file) {
  return `chapters/${normalizeSlashes(file).replace(/\.md$/i, '.qmd')}`
}

function chapterId(file) {
  return `chapter-${normalizeSlashes(file)
    .replace(/\.md$/i, '')
    .toLocaleLowerCase('en-US')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}`
}

function routeAliases(file) {
  const route = chapterRoute(file)
  return [route, `${route}/`, `${route}.html`, `/${normalizeSlashes(file)}`]
}

function buildRouteMap(parts) {
  const map = new Map()
  for (const part of parts) {
    const chapters = [...part.chapters, ...part.groups.flatMap(group => group.chapters)]
    for (const chapter of chapters) {
      for (const route of routeAliases(chapter.file))
        map.set(route, outputChapterPath(chapter.file))
    }
  }
  return map
}

function stripFrontMatter(text) {
  const normalized = text.replace(/^\uFEFF/, '')
  if (!normalized.startsWith('---\n'))
    return normalized
  const end = normalized.indexOf('\n---\n', 4)
  if (end < 0)
    return normalized
  return normalized.slice(end + 5)
}

function stripLeadingTitle(text) {
  let result = text
  result = result.replace(/^\s*<h1>\s*<center>.*?<\/center>\s*<\/h1>\s*/i, '')
  result = result.replace(/^\s*<center>\s*<h1>.*?<\/h1>\s*<\/center>\s*/i, '')
  result = result.replace(/^\s*#\s+[^\n]+\n+/, '')
  return result
}

function singleDollarPositions(line) {
  const positions = []
  let inInlineCode = false
  for (let index = 0; index < line.length; index += 1) {
    if (line[index] === '`') {
      inInlineCode = !inInlineCode
      continue
    }
    if (inInlineCode)
      continue
    if (line[index] !== '$')
      continue
    let slashCount = 0
    for (let cursor = index - 1; cursor >= 0 && line[cursor] === '\\'; cursor -= 1)
      slashCount += 1
    if (slashCount % 2 === 1)
      continue
    if (line[index - 1] === '$' || line[index + 1] === '$')
      continue
    positions.push(index)
  }
  return positions
}

function normalizeMultilineMath(lines, sourceFile) {
  const output = []
  let inFence = false
  let inMultilineMath = false
  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence
      output.push(line)
      continue
    }
    if (inFence) {
      output.push(line)
      continue
    }
    const positions = singleDollarPositions(line)
    if (positions.length % 2 === 0) {
      output.push(line)
      continue
    }
    if (!inMultilineMath) {
      const position = positions[positions.length - 1]
      const before = line.slice(0, position).trimEnd()
      const after = line.slice(position + 1)
      if (before)
        output.push(before)
      output.push(`$$${after}`)
      inMultilineMath = true
    } else {
      const position = positions[0]
      output.push(`${line.slice(0, position)}$$`)
      const after = line.slice(position + 1).trimStart()
      if (after)
        output.push(after)
      inMultilineMath = false
    }
  }
  if (inMultilineMath)
    fail(`${normalizeSlashes(path.relative(rootDir, sourceFile))} 存在未闭合的跨行单美元公式`)
  return output
}

function applyPrintLayout(file, lines) {
  const normalizedFile = normalizeSlashes(file)
  if (normalizedFile === 'math/combinatorics/sequence.md') {
    const start = lines.findIndex(line => line.trim() === '$$E(n,m)=\\begin{cases}')
    const end = start < 0 ? -1 : lines.findIndex((line, index) => index >= start && line.trim() === '\\end{cases}$$')
    if (start < 0 || end !== start + 4)
      fail('math/combinatorics/sequence.md 的欧拉数递推式结构已变化，请同步更新印刷换行规则')

    lines.splice(start, 5,
      '$$',
      'E(n,m)=\\begin{cases}',
      '    1 & n=0\\land m=0\\\\',
      '    0 & m<0\\lor(n=0\\land m\\ne0)\\\\',
      '    0 & n\\ge1\\land m\\ge n\\\\',
      '    (n-m)E(n-1,m-1)+(m+1)E(n-1,m) & n\\ge1,\\ 0\\le m<n',
      '\\end{cases}',
      '$$')
  }

  if (normalizedFile === 'geometry/tubao.md') {
    const marker = '`std::set::erase(iterator)`'
    const lineIndex = lines.findIndex(line => line.includes(marker))
    if (lineIndex < 0)
      fail('geometry/tubao.md 的 set::erase 说明已变化，请同步更新印刷换行规则')
    const markerIndex = lines[lineIndex].indexOf(marker)
    const before = `${lines[lineIndex].slice(0, markerIndex).trimEnd()}  `
    const after = lines[lineIndex].slice(markerIndex)
    lines.splice(lineIndex, 1, before, after)
  }
  return lines
}

function isExternalTarget(target) {
  return /^(?:https?:|mailto:|tel:|ftp:|data:)/i.test(target)
}

function splitTarget(target) {
  const match = target.match(/^([^?#]*)([?#].*)?$/)
  return { pathPart: match?.[1] ?? target, suffix: match?.[2] ?? '' }
}

function assetKey(source) {
  return path.resolve(source).toLocaleLowerCase('en-US')
}

function safeAssetName(source) {
  const relative = normalizeSlashes(path.relative(docsDir, source))
  const extension = path.extname(source).toLocaleLowerCase('en-US')
  const stem = path.basename(source, extension)
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'asset'
  const digest = createHash('sha1').update(relative).digest('hex').slice(0, 10)
  return `${digest}-${stem}${extension}`
}

function commandPath(envName, candidates) {
  const fromEnv = process.env[envName]
  if (fromEnv && existsSync(fromEnv))
    return path.resolve(fromEnv)
  for (const candidate of candidates) {
    if (candidate && existsSync(candidate))
      return path.resolve(candidate)
  }
  return undefined
}

function runProcess(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? rootDir,
    env: options.env ?? process.env,
    encoding: options.capture ? 'utf8' : undefined,
    stdio: options.capture ? 'pipe' : 'inherit',
    windowsHide: true,
  })
  if (result.error)
    throw result.error
  if (result.status !== 0) {
    const detail = options.capture ? `\n${result.stdout ?? ''}\n${result.stderr ?? ''}` : ''
    throw new Error(`${path.basename(command)} exited with code ${result.status}${detail}`)
  }
  return result
}

function createAssetResolver(projectDir, outputFile) {
  const copied = new Map()
  const assetsDir = path.join(projectDir, 'assets')
  mkdirSync(assetsDir, { recursive: true })
  const ffmpeg = commandPath('BOOK_FFMPEG', ['C:\\Tools\\ffmpeg\\bin\\ffmpeg.exe'])

  return function resolveAsset(rawTarget, sourceFile, lineNumber) {
    const decoded = decodeURIComponent(rawTarget.replaceAll('\\', '/'))
    const { pathPart } = splitTarget(decoded)
    let source
    if (pathPart.startsWith('/'))
      source = path.resolve(publicDir, `.${pathPart}`)
    else
      source = path.resolve(path.dirname(sourceFile), pathPart)

    if (!existsSync(source) || !statSync(source).isFile()) {
      fail(`${normalizeSlashes(path.relative(rootDir, sourceFile))}:${lineNumber} 图片不存在：${rawTarget}`)
      return rawTarget
    }
    if (!assertInside(source, docsDir, 'Image source')) {
      fail(`${normalizeSlashes(path.relative(rootDir, sourceFile))}:${lineNumber} 图片越出 docs：${rawTarget}`)
      return rawTarget
    }

    const key = assetKey(source)
    let generatedName = copied.get(key)
    if (!generatedName) {
      const extension = path.extname(source).toLocaleLowerCase('en-US')
      generatedName = safeAssetName(source)
      if (extension === '.gif' || extension === '.svg')
        generatedName = generatedName.replace(/\.(?:gif|svg)$/i, '.png')
      const destination = path.join(assetsDir, generatedName)

      if (extension === '.gif') {
        if (!ffmpeg)
          fail(`缺少 FFmpeg，无法提取 GIF 代表帧：${normalizeSlashes(path.relative(rootDir, source))}`)
        else {
          try {
            runProcess(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-i', source, '-frames:v', '1', destination])
            stats.gifFrames += 1
          } catch (error) {
            fail(`GIF 转换失败：${normalizeSlashes(path.relative(rootDir, source))}：${error.message}`)
          }
        }
      } else if (extension === '.svg') {
        try {
          const svg = readFileSync(source)
          const rendered = new Resvg(svg, {
            background: 'white',
            fitTo: { mode: 'zoom', value: 2 },
            font: { loadSystemFonts: true },
          }).render()
          writeFileSync(destination, rendered.asPng())
          stats.svgConversions += 1
        } catch (error) {
          fail(`SVG 转换失败：${normalizeSlashes(path.relative(rootDir, source))}：${error.message}`)
        }
      } else {
        copyFileSync(source, destination)
      }
      copied.set(key, generatedName)
      stats.images += 1
    }

    const outputAbsolute = path.join(projectDir, outputFile)
    return normalizeSlashes(path.relative(path.dirname(outputAbsolute), path.join(assetsDir, generatedName)))
  }
}

function transformLink(label, rawTarget, sourceFile, outputFile, routeMap, lineNumber) {
  const target = rawTarget.trim()
  if (!target) {
    fail(`${normalizeSlashes(path.relative(rootDir, sourceFile))}:${lineNumber} 存在空链接`)
    return label
  }
  if (target.startsWith('#'))
    return `[${label}](${target})`
  if (isExternalTarget(target)) {
    stats.externalLinks += 1
    return `[${label}](${target})`
  }

  const { pathPart, suffix } = splitTarget(target)
  let destination
  if (pathPart.startsWith('/')) {
    if (pathPart === '/') {
      fail(`${normalizeSlashes(path.relative(rootDir, sourceFile))}:${lineNumber} 书籍正文不能链接到网站根路由 /`)
      return label
    }
    destination = routeMap.get(pathPart) ?? routeMap.get(pathPart.replace(/\/$/, ''))
  } else if (/\.md$/i.test(pathPart)) {
    const sourceRelative = normalizeSlashes(path.relative(docsDir, sourceFile))
    const resolved = normalizeSlashes(path.normalize(path.join(path.dirname(sourceRelative), pathPart)))
    destination = routeMap.get(`/${resolved}`)
  }

  if (!destination) {
    const candidateRoute = pathPart.startsWith('/') ? pathPart : undefined
    if (candidateRoute) {
      const markdownCandidate = path.join(docsDir, `${candidateRoute.replace(/^\//, '').replace(/\/$/, '')}.md`)
      if (existsSync(markdownCandidate)) {
        warn(`${normalizeSlashes(path.relative(rootDir, sourceFile))}:${lineNumber} 链接目标未收录，已转为普通文本：${target}`)
        return label
      }
      fail(`${normalizeSlashes(path.relative(rootDir, sourceFile))}:${lineNumber} 无法解析内部链接：${target}`)
      return label
    }
    return `[${label}](${target})`
  }

  const fromDirectory = path.posix.dirname(outputFile)
  const relative = path.posix.relative(fromDirectory, destination) || path.posix.basename(destination)
  stats.internalLinks += 1
  return `[${label}](${relative}${suffix})`
}

function preprocessChapter(chapter, projectDir, routeMap) {
  const sourceFile = path.join(docsDir, chapter.file)
  const outputFile = outputChapterPath(chapter.file)
  const outputAbsolute = path.join(projectDir, outputFile)
  mkdirSync(path.dirname(outputAbsolute), { recursive: true })

  const resolveAsset = createAssetResolver(projectDir, outputFile)
  const source = stripLeadingTitle(stripFrontMatter(readFileSync(sourceFile, 'utf8')))
    .replaceAll('\u200B', '')
    .replaceAll('\uFEFF', '')
  const lines = applyPrintLayout(chapter.file, normalizeMultilineMath(source.split(/\r?\n/), sourceFile))
  const result = [`# ${chapter.title} {#${chapterId(chapter.file)}}`, '']
  let headingSequence = 0
  let inFence = false
  let detailsDepth = 0

  for (let index = 0; index < lines.length; index += 1) {
    const lineNumber = index + 1
    let line = lines[index]
    const fence = line.match(/^(\s*)```\s*([^\s`]*)\s*$/)
    if (fence) {
      if (!inFence) {
        let language = fence[2].trim()
        if (/^(?:c\+\+|C\+\+|cc|cxx)$/i.test(language))
          language = 'cpp'
        if (language)
          stats.codeLanguages.add(language.toLocaleLowerCase('en-US'))
        line = `${fence[1]}\`\`\`${language}`
      }
      inFence = !inFence
      result.push(line)
      continue
    }

    if (inFence) {
      if (line.length > 100)
        stats.longCodeLines += 1
      result.push(line)
      continue
    }

    const detailsOpen = line.match(/^\s*:::\s*details\s*(.*)$/i)
    if (detailsOpen) {
      const title = printableDetailsTitle(detailsOpen[1])
      if (title)
        result.push('', `**${title}**`, '')
      detailsDepth += 1
      continue
    }
    if (/^\s*<details(?:\s[^>]*)?>\s*$/i.test(line)) {
      detailsDepth += 1
      continue
    }
    const summary = line.match(/^\s*<summary>(.*?)<\/summary>\s*$/i)
    if (summary) {
      const title = printableDetailsTitle(summary[1])
      if (title)
        result.push('', `**${title}**`, '')
      continue
    }
    if (/^\s*<\/details>\s*$/i.test(line)) {
      detailsDepth = Math.max(0, detailsDepth - 1)
      continue
    }
    if (/^\s*:::\s*$/.test(line) && detailsDepth > 0) {
      detailsDepth -= 1
      continue
    }

    line = line.replace(/^\s*:::\s*(tip|warning|danger|info|note)\s*(.*)$/i, (_match, kind, title) => {
      const mapped = kind.toLocaleLowerCase('en-US') === 'danger' ? 'caution' : kind.toLocaleLowerCase('en-US')
      return title.trim()
        ? `::: {.callout-${mapped} title=${yamlString(title.trim())}}`
        : `::: {.callout-${mapped}}`
    })

    line = line
      .replace(/<\/?center>/gi, '')
      .replace(/<br\s*\/?>/gi, '  ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&emsp;/gi, '  ')

    line = line.replace(/<img\s+([^>]*?)\s*\/?>(?:\s*)/gi, (match, attributes) => {
      const src = attributes.match(/\bsrc=["']([^"']+)["']/i)?.[1]
      if (!src) {
        fail(`${normalizeSlashes(path.relative(rootDir, sourceFile))}:${lineNumber} HTML 图片缺少 src`)
        return ''
      }
      const alt = attributes.match(/\balt=["']([^"']*)["']/i)?.[1] ?? ''
      const widthValue = attributes.match(/\bwidth=["']([^"']+)["']/i)?.[1]
      const widthNumber = widthValue?.match(/^(\d+(?:\.\d+)?)%$/)?.[1]
      const width = widthNumber ? `${Math.min(100, Number(widthNumber))}%` : '95%'
      const converted = resolveAsset(src, sourceFile, lineNumber)
      return `![${alt}](${converted}){fig-align="center" width="${width}"}`
    })

    line = line.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)(?!\{)/g, (_match, alt, target) => {
      if (isExternalTarget(target))
        return `![${alt}](${target}){fig-align="center" width="95%"}`
      const converted = resolveAsset(target, sourceFile, lineNumber)
      return `![${alt}](${converted}){fig-align="center" width="95%"}`
    })

    line = line.replace(/(?<!!)\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, target) =>
      transformLink(label, target, sourceFile, outputFile, routeMap, lineNumber))

    const heading = line.match(/^(#{2,6})\s+(.+?)\s*$/)
    if (heading && !/\{#[^}]+\}\s*$/.test(line)) {
      headingSequence += 1
      line = `${heading[1]} ${heading[2]} {#${chapterId(chapter.file)}-section-${headingSequence}}`
    }

    if (/^\s*:::\s*[a-z][\w-]*/i.test(line) && !/^\s*:::\s*\{\.callout-/i.test(line))
      fail(`${normalizeSlashes(path.relative(rootDir, sourceFile))}:${lineNumber} 未支持的 Markdown 容器：${line.trim()}`)

    const unsafeHtml = line.match(/<(script|style|iframe|video|audio|details|summary|img|h[1-6])\b/i)
      ?? line.match(/<([A-Z][A-Za-z0-9-]*)\b[^>]*>/)
    if (unsafeHtml)
      fail(`${normalizeSlashes(path.relative(rootDir, sourceFile))}:${lineNumber} 未转换的 HTML/组件：<${unsafeHtml[1]}>`)

    result.push(line)
  }

  if (inFence)
    fail(`${normalizeSlashes(path.relative(rootDir, sourceFile))} 存在未闭合代码围栏`)
  if (detailsDepth !== 0)
    fail(`${normalizeSlashes(path.relative(rootDir, sourceFile))} 存在未闭合 details 容器`)

  writeFileSync(outputAbsolute, `${result.join('\n').trim()}\n`, 'utf8')
}

function writeGroupPage(projectDir, part, group) {
  const relative = `chapters/${part.id}/${group.id}/_group.qmd`
  const absolute = path.join(projectDir, relative)
  mkdirSync(path.dirname(absolute), { recursive: true })
  writeFileSync(
    absolute,
    `# ${group.title} {.unnumbered}\n\n本章组收录“${part.title}”中的${group.title}专题。\n`,
    'utf8',
  )
  return relative
}

function copyLatexFiles(projectDir) {
  const sourceDir = path.join(bookDir, 'latex')
  const destinationDir = path.join(projectDir, 'latex')
  mkdirSync(destinationDir, { recursive: true })
  for (const name of ['preamble.tex', 'page-style.tex', 'code-style.tex', 'book-template.tex'])
    copyFileSync(path.join(sourceDir, name), path.join(destinationDir, name))
}

function writeIndex(projectDir, order) {
  const text = `# 前言 {.unnumbered}\n\n本书由 awdec 的算法笔记博客自动排版生成，面向 ACM-ICPC/ICPC 与同类算法竞赛训练。全书继续以网站中的 Markdown 为唯一内容源；代码、公式与图示均按纸质阅读重新排版。\n\n电子版保留目录、书签与内部链接；打印时建议启用双面打印，并按实际装订方式保留内侧装订边距。\n\n- 版本：${order.book.version}\n- 构建日期：${order.book.buildDate}\n- 收录章节：${stats.chapters}\n\n\`\`\`{=latex}\n\\mainmatter\n\`\`\`\n`
  writeFileSync(path.join(projectDir, 'index.qmd'), text, 'utf8')
}

function findQuarto() {
  const configured = process.env.QUARTO_BIN
  const candidates = [
    configured,
    path.join(toolsRoot, 'quarto-1.10.18', 'bin', 'quarto.exe'),
    path.join(toolsRoot, 'quarto-1.10.18', 'bin', 'quarto.cmd'),
  ]
  const found = candidates.find(candidate => candidate && existsSync(candidate))
  if (found)
    return path.resolve(found)
  return 'quarto'
}

function findTexBin() {
  const configured = process.env.BOOK_TEX_BIN
  const candidates = [configured, path.join(toolsRoot, 'TinyTeX', 'bin', 'windows')]
  return candidates.find(candidate => candidate && existsSync(path.join(candidate, 'lualatex.exe')))
}

function buildYaml(projectDir, order, parts, format, texBin) {
  const settings = formatSettings[format]
  const chapters = ['    - index.qmd']
  for (const part of parts) {
    chapters.push(`    - part: ${yamlString(part.title)}`)
    chapters.push('      chapters:')
    for (const chapter of part.chapters)
      chapters.push(`        - ${yamlString(outputChapterPath(chapter.file))}`)
    for (const group of part.groups) {
      chapters.push(`        - ${yamlString(writeGroupPage(projectDir, part, group))}`)
      for (const chapter of group.chapters)
        chapters.push(`        - ${yamlString(outputChapterPath(chapter.file))}`)
    }
  }

  const geometry = [...settings.paper, ...settings.geometry]
  return `project:\n  type: book\n  output-dir: ../../output/pdf\n\nlang: ${yamlString(order.book.language)}\nsubject: ${yamlString(`${order.book.subtitle}（版本 ${order.book.version}）`)}\nkeywords:\n  - ACM-ICPC\n  - ICPC\n  - 算法竞赛\n  - ${yamlString(order.book.version)}\nexecute:\n  enabled: false\n\nbook:\n  title: ${yamlString(order.book.title)}\n  subtitle: ${yamlString(order.book.subtitle)}\n  author: ${yamlString(order.book.author)}\n  date: ${yamlString(order.book.buildDate)}\n  output-file: ${yamlString(settings.output)}\n  chapters:\n${chapters.join('\n')}\n\nformat:\n  pdf:\n    documentclass: scrbook\n    template: latex/book-template.tex\n    pdf-engine: lualatex\n    classoption:\n      - twoside\n      - openright\n      - cleardoublepage=empty\n      - headings=normal\n    fontsize: ${settings.fontSize}\n    geometry:\n${geometry.map(item => `      - ${item}`).join('\n')}\n    toc: true\n    toc-title: "目录"\n    toc-depth: 3\n    number-sections: true\n    number-depth: 3\n    top-level-division: chapter\n    keep-tex: true\n    latex-auto-install: true\n    latex-tinytex: false\n    latex-min-runs: 2\n    latex-max-runs: 5\n    colorlinks: false\n    linkcolor: black\n    urlcolor: black\n    citecolor: black\n    highlight-style: pygments\n    code-line-numbers: false\n    fig-pos: "htbp"\n    tbl-pos: "htbp"\n    include-in-header:\n      - latex/preamble.tex\n      - latex/page-style.tex\n      - latex/code-style.tex\n`
}

function prepareProject(order, parts, routeMap, format) {
  const projectDir = path.join(buildRoot, format)
  resetGeneratedDirectory(projectDir)
  copyLatexFiles(projectDir)
  writeIndex(projectDir, order)
  for (const part of parts) {
    for (const chapter of part.chapters)
      preprocessChapter(chapter, projectDir, routeMap)
    for (const group of part.groups) {
      for (const chapter of group.chapters)
        preprocessChapter(chapter, projectDir, routeMap)
    }
  }
  const texBin = findTexBin()
  writeFileSync(path.join(projectDir, '_quarto.yml'), buildYaml(projectDir, order, parts, format, texBin), 'utf8')
  return { projectDir, texBin }
}

function renderProject(projectDir, texBin) {
  const quarto = findQuarto()
  const quartoCache = path.join(toolsRoot, 'quarto-cache')
  mkdirSync(quartoCache, { recursive: true })
  mkdirSync(outputDir, { recursive: true })
  const currentPath = process.env.Path ?? process.env.PATH ?? ''
  const env = {
    ...process.env,
    Path: texBin ? `${texBin}${path.delimiter}${currentPath}` : currentPath,
    PATH: texBin ? `${texBin}${path.delimiter}${currentPath}` : currentPath,
    LOCALAPPDATA: quartoCache,
  }
  runProcess(quarto, ['render', projectDir, '--to', 'pdf'], { cwd: rootDir, env })
}

function reportDiagnostics() {
  for (const message of warnings)
    console.warn(`WARN: ${message}`)
  if (errors.length > 0) {
    for (const message of errors)
      console.error(`ERROR: ${message}`)
    throw new Error(`书籍检查失败：${errors.length} 个错误，${warnings.length} 个警告`)
  }
  console.log(`书籍检查通过：${stats.parts} 篇，${stats.chapters} 章，${stats.images} 张图片`)
  console.log(`资源转换：GIF ${stats.gifFrames}，SVG ${stats.svgConversions}`)
  console.log(`链接：内部 ${stats.internalLinks}，外部 ${stats.externalLinks}`)
  console.log(`代码语言：${[...stats.codeLanguages].sort().join(', ') || '无'}；超过 100 字符的代码行 ${stats.longCodeLines}`)
}

function parseArguments() {
  const args = process.argv.slice(2)
  if (args.includes('--check'))
    return { checkOnly: true, formats: ['b5'] }
  const position = args.indexOf('--format')
  if (position < 0 || !args[position + 1])
    throw new Error('Usage: node scripts/build-book.mjs --check | --format b5|a4|all')
  const selected = args[position + 1].toLocaleLowerCase('en-US')
  if (selected === 'all')
    return { checkOnly: false, formats: ['b5', 'a4'] }
  if (!formatSettings[selected])
    throw new Error(`Unknown book format: ${selected}`)
  return { checkOnly: false, formats: [selected] }
}

function main() {
  const { checkOnly, formats } = parseArguments()
  const order = readOrder()
  const parts = collectBook(order)
  const routeMap = buildRouteMap(parts)
  const prepared = []
  for (const format of formats) {
    resetDerivedStats()
    prepared.push(prepareProject(order, parts, routeMap, format))
  }
  reportDiagnostics()
  if (checkOnly) {
    console.log('仅执行检查，未调用 Quarto/LuaLaTeX。')
    return
  }
  for (const project of prepared)
    renderProject(project.projectDir, project.texBin)
}

try {
  main()
} catch (error) {
  console.error(error.stack ?? error.message)
  process.exitCode = 1
}
