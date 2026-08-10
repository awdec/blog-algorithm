import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(scriptDir, '..')
const orderPath = path.join(rootDir, 'book', 'book-order.json')

const formats = {
  b5: {
    label: 'B5',
    file: path.join(rootDir, 'output', 'pdf', 'algorithm-notes-b5.pdf'),
    widthMm: 176,
    heightMm: 250,
  },
  a4: {
    label: 'A4',
    file: path.join(rootDir, 'output', 'pdf', 'algorithm-notes-a4.pdf'),
    widthMm: 210,
    heightMm: 297,
  },
}

const pythonInspector = String.raw`
import json
import math
import os
import re
import sys
import unicodedata
from collections import Counter

import pdfplumber
from pypdf import PdfReader


def resolve(value):
    try:
        return value.get_object()
    except Exception:
        return value


def object_key(reference, value):
    if hasattr(reference, "idnum"):
        return ("ref", reference.idnum, getattr(reference, "generation", 0))
    indirect = getattr(value, "indirect_reference", None)
    if indirect is not None:
        return ("ref", indirect.idnum, getattr(indirect, "generation", 0))
    return ("object", id(value))


def normalize_text(value):
    return re.sub(r"\s+", "", unicodedata.normalize("NFKC", str(value or "")))


def outline_nodes(reader, items):
    nodes = []
    previous = None
    for item in items or []:
        if isinstance(item, list):
            children = outline_nodes(reader, item)
            if previous is None:
                nodes.extend(children)
            else:
                previous["children"].extend(children)
            continue

        try:
            page = reader.get_destination_page_number(item) + 1
        except Exception:
            page = None
        node = {
            "title": str(getattr(item, "title", item)),
            "page": page,
            "children": [],
        }
        nodes.append(node)
        previous = node
    return nodes


def inspect_outline(reader, expected_parts, page_count):
    try:
        roots = outline_nodes(reader, reader.outline)
    except Exception as error:
        return {
            "fatal": str(error),
            "rootEntries": 0,
            "partExpected": len(expected_parts),
            "partMatched": 0,
            "chapterExpected": sum(
                len(part.get("chapters", []))
                + sum(len(group.get("chapters", [])) for group in part.get("groups", []))
                for part in expected_parts
            ),
            "chapterMatched": 0,
        }

    root_titles = [normalize_text(node["title"]) for node in roots]
    missing_parts = []
    part_order_mismatches = []
    missing_groups = []
    missing_chapters = []
    child_order_mismatches = []
    invalid_destinations = []
    part_matched = 0
    group_matched = 0
    chapter_matched = 0
    root_cursor = -1

    def valid_destination(node, context):
        page = node.get("page")
        if not isinstance(page, int) or page < 1 or page > page_count:
            invalid_destinations.append({"title": context, "page": page})

    for part in expected_parts:
        part_title = normalize_text(part["title"])
        candidates = [
            index for index, title in enumerate(root_titles)
            if title.endswith(part_title) and "部分" in title
        ]
        if not candidates:
            missing_parts.append(part["title"])
            continue

        part_matched += 1
        after_cursor = [index for index in candidates if index > root_cursor]
        if after_cursor:
            part_index = after_cursor[0]
        else:
            part_index = candidates[0]
            part_order_mismatches.append(part["title"])
        root_cursor = max(root_cursor, part_index)
        part_node = roots[part_index]
        valid_destination(part_node, part["title"])

        children = part_node["children"]
        child_titles = [normalize_text(node["title"]) for node in children]
        expected_children = []
        for chapter in part.get("chapters", []):
            expected_children.append(("chapter", chapter["title"]))
        for group in part.get("groups", []):
            expected_children.append(("group", group["title"]))
            for chapter in group.get("chapters", []):
                expected_children.append(("chapter", chapter["title"]))

        child_cursor = -1
        for kind, title in expected_children:
            normalized = normalize_text(title)
            candidates = [index for index, child_title in enumerate(child_titles) if child_title == normalized]
            if not candidates:
                target = missing_groups if kind == "group" else missing_chapters
                target.append({"part": part["title"], "title": title})
                continue

            if kind == "group":
                group_matched += 1
            else:
                chapter_matched += 1
            after_cursor = [index for index in candidates if index > child_cursor]
            if after_cursor:
                child_index = after_cursor[0]
            else:
                child_index = candidates[0]
                child_order_mismatches.append({"part": part["title"], "title": title})
            child_cursor = max(child_cursor, child_index)
            valid_destination(children[child_index], f"{part['title']}/{title}")

    chapter_expected = sum(
        len(part.get("chapters", []))
        + sum(len(group.get("chapters", [])) for group in part.get("groups", []))
        for part in expected_parts
    )
    group_expected = sum(len(part.get("groups", [])) for part in expected_parts)
    return {
        "rootEntries": len(roots),
        "partExpected": len(expected_parts),
        "partMatched": part_matched,
        "groupExpected": group_expected,
        "groupMatched": group_matched,
        "chapterExpected": chapter_expected,
        "chapterMatched": chapter_matched,
        "missingParts": missing_parts,
        "partOrderMismatches": part_order_mismatches,
        "missingGroups": missing_groups,
        "missingChapters": missing_chapters,
        "childOrderMismatches": child_order_mismatches,
        "invalidDestinations": invalid_destinations,
    }


def inspect_fonts(reader):
    fonts = {}
    visited_resources = set()

    def visit_resources(reference):
        resources = resolve(reference)
        if not isinstance(resources, dict):
            return
        key = object_key(reference, resources)
        if key in visited_resources:
            return
        visited_resources.add(key)

        font_dictionary = resolve(resources.get("/Font")) or {}
        if isinstance(font_dictionary, dict):
            for font_reference in font_dictionary.values():
                font = resolve(font_reference)
                if isinstance(font, dict):
                    fonts[object_key(font_reference, font)] = font

        xobjects = resolve(resources.get("/XObject")) or {}
        if isinstance(xobjects, dict):
            for xobject_reference in xobjects.values():
                xobject = resolve(xobject_reference)
                if isinstance(xobject, dict) and str(xobject.get("/Subtype")) == "/Form":
                    visit_resources(xobject.get("/Resources"))

    for page in reader.pages:
        visit_resources(page.get("/Resources"))

    details = []
    for font in fonts.values():
        subtype = str(font.get("/Subtype", ""))
        base_name = str(font.get("/BaseFont", "unnamed")).lstrip("/")
        embedded = False
        if subtype == "/Type3":
            embedded = bool(font.get("/CharProcs"))
        else:
            descendants = [font]
            if subtype == "/Type0":
                descendants = list(resolve(font.get("/DescendantFonts")) or [])
            states = []
            for descendant_reference in descendants:
                descendant = resolve(descendant_reference)
                descriptor = resolve(descendant.get("/FontDescriptor")) if isinstance(descendant, dict) else None
                states.append(
                    isinstance(descriptor, dict)
                    and any(descriptor.get(key) is not None for key in ("/FontFile", "/FontFile2", "/FontFile3"))
                )
            embedded = bool(states) and all(states)
        details.append({
            "name": base_name,
            "subtype": subtype.lstrip("/"),
            "embedded": embedded,
            "toUnicode": font.get("/ToUnicode") is not None,
        })

    details.sort(key=lambda item: (item["name"], item["subtype"]))
    return {
        "count": len(details),
        "embeddedCount": sum(1 for font in details if font["embedded"]),
        "toUnicodeCount": sum(1 for font in details if font["toUnicode"]),
        "unembedded": [font for font in details if not font["embedded"]],
        "details": details,
    }


def contains_javascript(value, seen=None, depth=0):
    if value is None or depth > 24:
        return False
    if seen is None:
        seen = set()
    resolved = resolve(value)
    if isinstance(resolved, dict):
        key = object_key(value, resolved)
        if key in seen:
            return False
        seen.add(key)
        if str(resolved.get("/S", "")) == "/JavaScript":
            return True
        return any(contains_javascript(item, seen, depth + 1) for item in resolved.values())
    if isinstance(resolved, (list, tuple)):
        return any(contains_javascript(item, seen, depth + 1) for item in resolved)
    return False


def inspect_security(reader):
    root = resolve(reader.trailer.get("/Root")) or {}
    names = resolve(root.get("/Names")) or {}
    javascript = False
    if isinstance(names, dict) and names.get("/JavaScript") is not None:
        javascript = True
    javascript = javascript or contains_javascript(root.get("/OpenAction"))
    javascript = javascript or contains_javascript(root.get("/AA"))

    acroform_reference = root.get("/AcroForm")
    acroform = resolve(acroform_reference)
    form_fields = 0
    if isinstance(acroform, dict):
        form_fields = len(resolve(acroform.get("/Fields")) or [])

    widget_count = 0
    for page in reader.pages:
        javascript = javascript or contains_javascript(page.get("/AA"))
        annotations = resolve(page.get("/Annots")) or []
        for annotation_reference in annotations:
            annotation = resolve(annotation_reference)
            if not isinstance(annotation, dict):
                continue
            if str(annotation.get("/Subtype", "")) == "/Widget":
                widget_count += 1
            javascript = javascript or contains_javascript(annotation.get("/A"))
            javascript = javascript or contains_javascript(annotation.get("/AA"))

    return {
        "encrypted": bool(reader.is_encrypted),
        "javascript": javascript,
        "acroForm": acroform_reference is not None,
        "formFields": form_fields,
        "widgets": widget_count,
    }


def inspect_pages(reader, pdf_path, expected_width_mm, expected_height_mm, expected_titles):
    expected_width = expected_width_mm * 72.0 / 25.4
    expected_height = expected_height_mm * 72.0 / 25.4
    size_tolerance = 0.75
    overflow_tolerance = 2.0
    size_counts = Counter()
    size_mismatch_pages = []
    rotations = []
    box_issue_pages = set()
    box_issue_samples = []

    for page_number, page in enumerate(reader.pages, 1):
        media = page.mediabox
        crop = page.cropbox
        media_values = [float(media[index]) for index in range(4)]
        crop_values = [float(crop[index]) for index in range(4)]
        width = media_values[2] - media_values[0]
        height = media_values[3] - media_values[1]
        size_counts[(round(width, 3), round(height, 3))] += 1
        if abs(width - expected_width) > size_tolerance or abs(height - expected_height) > size_tolerance:
            size_mismatch_pages.append(page_number)

        rotation = int(page.get("/Rotate", 0) or 0) % 360
        if rotation != 0:
            rotations.append({"page": page_number, "degrees": rotation})
        if (
            crop_values[0] < media_values[0] - size_tolerance
            or crop_values[1] < media_values[1] - size_tolerance
            or crop_values[2] > media_values[2] + size_tolerance
            or crop_values[3] > media_values[3] + size_tolerance
            or crop_values[2] <= crop_values[0]
            or crop_values[3] <= crop_values[1]
        ):
            box_issue_pages.add(page_number)
            if len(box_issue_samples) < 12:
                box_issue_samples.append({
                    "page": page_number,
                    "mediaBox": [round(value, 3) for value in media_values],
                    "cropBox": [round(value, 3) for value in crop_values],
                })

    blank_pages = []
    pages_with_text = 0
    pages_with_cjk = 0
    replacement_characters = 0
    extracted_fragments = []
    overflow_by_page = {}
    invalid_object_pages = set()

    with pdfplumber.open(pdf_path) as pdf:
        for page_number, page in enumerate(pdf.pages, 1):
            page_text = "".join(str(char.get("text", "")) for char in page.chars)
            extracted_fragments.append(page_text)
            if page_text.strip():
                pages_with_text += 1
            if re.search(r"[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]", page_text):
                pages_with_cjk += 1
            replacement_characters += page_text.count("\ufffd")

            visible_count = 0
            for object_type in ("char", "image", "line", "rect", "curve"):
                for item in page.objects.get(object_type, []):
                    visible_count += 1
                    values = (item.get("x0"), item.get("x1"), item.get("top"), item.get("bottom"))
                    if not all(isinstance(value, (int, float)) and math.isfinite(value) for value in values):
                        invalid_object_pages.add(page_number)
                        continue
                    x0, x1, top, bottom = values
                    if x1 < x0 or bottom < top:
                        invalid_object_pages.add(page_number)
                        continue
                    overflow = max(0.0, -x0, x1 - page.width, -top, bottom - page.height)
                    if overflow > overflow_tolerance:
                        summary = overflow_by_page.setdefault(page_number, {
                            "page": page_number,
                            "objects": 0,
                            "maxOverflowPt": 0.0,
                            "types": set(),
                        })
                        summary["objects"] += 1
                        summary["maxOverflowPt"] = max(summary["maxOverflowPt"], overflow)
                        summary["types"].add(object_type)
            if visible_count == 0:
                blank_pages.append(page_number)

    full_text = normalize_text("".join(extracted_fragments))
    missing_titles = [
        entry for entry in expected_titles
        if normalize_text(entry["title"]) not in full_text
    ]
    cjk_characters = len(re.findall(r"[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]", full_text))
    overflow_pages = []
    for page_number in sorted(overflow_by_page):
        item = overflow_by_page[page_number]
        item["maxOverflowPt"] = round(item["maxOverflowPt"], 2)
        item["types"] = sorted(item["types"])
        overflow_pages.append(item)

    return {
        "pageSizes": [
            {"widthPt": size[0], "heightPt": size[1], "pages": count}
            for size, count in sorted(size_counts.items())
        ],
        "expectedWidthPt": round(expected_width, 3),
        "expectedHeightPt": round(expected_height, 3),
        "sizeMismatchPages": size_mismatch_pages,
        "rotations": rotations,
        "pageBoxIssueCount": len(box_issue_pages),
        "pageBoxIssuePages": sorted(box_issue_pages),
        "pageBoxIssueSamples": box_issue_samples,
        "blankPages": blank_pages,
        "oddBlankPages": [page for page in blank_pages if page % 2 == 1],
        "outOfBoundsPages": overflow_pages,
        "invalidObjectPages": sorted(invalid_object_pages),
        "text": {
            "characters": len(full_text),
            "cjkCharacters": cjk_characters,
            "pagesWithText": pages_with_text,
            "pagesWithCjk": pages_with_cjk,
            "replacementCharacters": replacement_characters,
            "missingExpectedTitles": missing_titles,
        },
    }


def inspect_pdf(spec, book, parts, expected_titles):
    result = {
        "format": spec["format"],
        "label": spec["label"],
        "path": spec["path"],
        "exists": os.path.isfile(spec["path"]),
    }
    if not result["exists"]:
        return result
    result["fileSize"] = os.path.getsize(spec["path"])

    try:
        reader = PdfReader(spec["path"], strict=False)
        result["security"] = {"encrypted": bool(reader.is_encrypted)}
        if reader.is_encrypted:
            return result

        result["pageCount"] = len(reader.pages)
        metadata = reader.metadata or {}
        root = resolve(reader.trailer.get("/Root")) or {}
        result["metadata"] = {
            "title": str(metadata.get("/Title", "")),
            "author": str(metadata.get("/Author", "")),
            "subject": str(metadata.get("/Subject", "")),
            "keywords": str(metadata.get("/Keywords", "")),
            "creator": str(metadata.get("/Creator", "")),
            "producer": str(metadata.get("/Producer", "")),
            "language": str(root.get("/Lang", "")),
        }
        result["security"] = inspect_security(reader)
        result["outline"] = inspect_outline(reader, parts, len(reader.pages))
        result["fonts"] = inspect_fonts(reader)
        result["pages"] = inspect_pages(
            reader,
            spec["path"],
            spec["widthMm"],
            spec["heightMm"],
            expected_titles,
        )
    except Exception as error:
        result["fatal"] = f"{type(error).__name__}: {error}"
    return result


payload = json.loads(sys.stdin.read())
output = [
    inspect_pdf(spec, payload["book"], payload["parts"], payload["expectedTitles"])
    for spec in payload["pdfs"]
]
print(json.dumps(output, ensure_ascii=False))
`

function usage() {
  return [
    'Usage: node scripts/verify-book.mjs [--format b5|a4|all] [--json]',
    '',
    'Exit code 0 means all required checks passed; layout overflow is a failure.',
  ].join('\n')
}

function parseArguments(argv) {
  let format = 'all'
  let json = false
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--help' || argument === '-h')
      return { help: true, format, json }
    if (argument === '--json') {
      json = true
      continue
    }
    if (argument === '--format') {
      format = String(argv[index + 1] ?? '').toLocaleLowerCase('en-US')
      index += 1
      continue
    }
    throw new Error(`Unknown argument: ${argument}`)
  }
  if (!['b5', 'a4', 'all'].includes(format))
    throw new Error(`Unknown format: ${format || '(empty)'}`)
  return { help: false, format, json }
}

function readBookOrder() {
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
      throw new Error(`book-order.json: book.${field} must not be empty`)
  }

  const included = chapter => chapter?.status === 'published' && chapter.includeInBook !== false
  const parts = []
  for (const part of order.parts) {
    const chapters = (part.chapters ?? []).filter(included).map(chapter => ({ title: chapter.title }))
    const groups = (part.groups ?? [])
      .map(group => ({
        title: group.title,
        chapters: (group.chapters ?? []).filter(included).map(chapter => ({ title: chapter.title })),
      }))
      .filter(group => group.chapters.length > 0)
    if (chapters.length > 0 || groups.length > 0)
      parts.push({ title: part.title, chapters, groups })
  }

  const expectedTitles = [
    { kind: 'book-title', title: order.book.title },
    { kind: 'book-subtitle', title: order.book.subtitle },
  ]
  for (const part of parts) {
    expectedTitles.push({ kind: 'part', title: part.title })
    for (const chapter of part.chapters)
      expectedTitles.push({ kind: 'chapter', title: chapter.title, part: part.title })
    for (const group of part.groups) {
      expectedTitles.push({ kind: 'group', title: group.title, part: part.title })
      for (const chapter of group.chapters)
        expectedTitles.push({ kind: 'chapter', title: chapter.title, part: part.title, group: group.title })
    }
  }
  return { book: order.book, parts, expectedTitles }
}

function pythonCandidates() {
  const candidates = []
  if (process.env.BOOK_VERIFY_PYTHON)
    candidates.push({ command: process.env.BOOK_VERIFY_PYTHON, prefix: [], label: 'BOOK_VERIFY_PYTHON' })
  candidates.push(
    { command: 'python3', prefix: [], label: 'python3' },
    { command: 'python', prefix: [], label: 'python' },
    { command: 'py', prefix: ['-3'], label: 'py -3' },
  )

  const runtimeRoot = path.join(
    os.homedir(),
    '.cache',
    'codex-runtimes',
    'codex-primary-runtime',
    'dependencies',
    'python',
  )
  candidates.push(
    { command: path.join(runtimeRoot, 'python.exe'), prefix: [], label: 'Codex bundled Python' },
    { command: path.join(runtimeRoot, 'bin', 'python3'), prefix: [], label: 'Codex bundled Python' },
    { command: path.join(runtimeRoot, 'bin', 'python'), prefix: [], label: 'Codex bundled Python' },
  )
  return candidates
}

function findPython() {
  const probe = 'import pypdf, pdfplumber; print(pypdf.__version__ + "/" + pdfplumber.__version__)'
  const attempts = []
  const seen = new Set()
  for (const candidate of pythonCandidates()) {
    const key = `${candidate.command}\0${candidate.prefix.join('\0')}`
    if (seen.has(key))
      continue
    seen.add(key)
    const result = spawnSync(candidate.command, [...candidate.prefix, '-c', probe], {
      cwd: rootDir,
      encoding: 'utf8',
      windowsHide: true,
      env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' },
      timeout: 15_000,
    })
    if (!result.error && result.status === 0) {
      return {
        ...candidate,
        versions: result.stdout.trim(),
      }
    }
    const reason = result.error?.code
      ?? result.stderr?.trim().split(/\r?\n/).at(-1)
      ?? `exit ${result.status}`
    attempts.push(`${candidate.label}: ${reason}`)
  }
  throw new Error([
    'Python with pypdf and pdfplumber was not found.',
    'Install them with: python -m pip install pypdf pdfplumber',
    ...attempts.map(attempt => `  - ${attempt}`),
  ].join('\n'))
}

function runInspector(python, payload) {
  const result = spawnSync(
    python.command,
    [...python.prefix, '-c', pythonInspector],
    {
      cwd: rootDir,
      input: JSON.stringify(payload),
      encoding: 'utf8',
      windowsHide: true,
      env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' },
      maxBuffer: 64 * 1024 * 1024,
      timeout: 10 * 60_000,
    },
  )
  if (result.error)
    throw new Error(`PDF inspector could not start: ${result.error.message}`)
  if (result.status !== 0) {
    const detail = result.stderr.trim() || result.stdout.trim() || `exit ${result.status}`
    throw new Error(`PDF inspector failed:\n${detail}`)
  }
  try {
    return JSON.parse(result.stdout)
  } catch (error) {
    throw new Error(`PDF inspector returned invalid JSON: ${error.message}\n${result.stdout.slice(0, 1000)}`)
  }
}

function formatPages(pages, limit = 28) {
  if (!pages?.length)
    return '无'
  const shown = pages.slice(0, limit).join(', ')
  return pages.length > limit ? `${shown}, …（共 ${pages.length} 页）` : shown
}

function formatSize(pageSizes) {
  return pageSizes
    .map(size => {
      const widthMm = size.widthPt * 25.4 / 72
      const heightMm = size.heightPt * 25.4 / 72
      return `${widthMm.toFixed(2)} × ${heightMm.toFixed(2)} mm（${size.pages} 页）`
    })
    .join('；')
}

function evaluate(result, expected) {
  const errors = []
  const warnings = []
  if (!result.exists) {
    errors.push(`文件不存在：${result.path}`)
    return { errors, warnings }
  }
  if (result.fatal) {
    errors.push(`无法完成 PDF 检查：${result.fatal}`)
    return { errors, warnings }
  }
  if (result.security?.encrypted) {
    errors.push('PDF 已加密，无法继续验证内容')
    return { errors, warnings }
  }

  if (!Number.isInteger(result.pageCount) || result.pageCount < expected.chapterCount)
    errors.push(`页数异常：${result.pageCount}（少于 ${expected.chapterCount} 章）`)
  if (result.pages.sizeMismatchPages.length > 0)
    errors.push(`纸张尺寸不符页：${formatPages(result.pages.sizeMismatchPages)}`)
  if (result.pages.rotations.length > 0)
    errors.push(`存在旋转页面：${result.pages.rotations.map(item => `${item.page}(${item.degrees}°)`).join(', ')}`)
  if (result.pages.pageBoxIssueCount > 0)
    errors.push(`MediaBox/CropBox 异常页：${formatPages(result.pages.pageBoxIssuePages)}`)

  if (result.metadata.title.trim() !== expected.book.title.trim())
    errors.push(`Title 元数据不符：${JSON.stringify(result.metadata.title)}`)
  if (result.metadata.author.trim() !== expected.book.author.trim())
    errors.push(`Author 元数据不符：${JSON.stringify(result.metadata.author)}`)
  if (result.metadata.language.toLocaleLowerCase('en-US') !== expected.book.language.toLocaleLowerCase('en-US'))
    errors.push(`Language 元数据不符：${JSON.stringify(result.metadata.language)}`)
  const normalizedSubject = result.metadata.subject.normalize('NFKC')
  const normalizedKeywords = result.metadata.keywords.normalize('NFKC')
  const normalizedSubtitle = expected.book.subtitle.normalize('NFKC')
  const normalizedVersion = expected.book.version.normalize('NFKC')
  if (!normalizedSubject.includes(normalizedSubtitle))
    errors.push(`Subject 元数据未包含副标题 ${JSON.stringify(expected.book.subtitle)}：${JSON.stringify(result.metadata.subject)}`)
  if (!normalizedSubject.includes(normalizedVersion))
    errors.push(`Subject 元数据未包含版本 ${JSON.stringify(expected.book.version)}：${JSON.stringify(result.metadata.subject)}`)
  if (!normalizedKeywords.includes(normalizedVersion))
    errors.push(`Keywords 元数据未包含版本 ${JSON.stringify(expected.book.version)}：${JSON.stringify(result.metadata.keywords)}`)
  if (!result.metadata.creator.trim() || !result.metadata.producer.trim())
    errors.push('Creator/Producer 元数据缺失')

  const outline = result.outline
  if (outline.fatal)
    errors.push(`书签读取失败：${outline.fatal}`)
  if (outline.partMatched !== expected.partCount)
    errors.push(`篇书签仅匹配 ${outline.partMatched}/${expected.partCount}`)
  if (outline.groupMatched !== expected.groupCount)
    errors.push(`分组书签仅匹配 ${outline.groupMatched}/${expected.groupCount}`)
  if (outline.chapterMatched !== expected.chapterCount)
    errors.push(`章节书签仅匹配 ${outline.chapterMatched}/${expected.chapterCount}`)
  if (outline.partOrderMismatches?.length)
    errors.push(`篇书签顺序不符：${outline.partOrderMismatches.join('、')}`)
  if (outline.childOrderMismatches?.length)
    errors.push(`章节书签顺序不符：${outline.childOrderMismatches.map(item => `${item.part}/${item.title}`).join('、')}`)
  if (outline.invalidDestinations?.length)
    errors.push(`书签目标页无效：${outline.invalidDestinations.map(item => `${item.title}→${item.page}`).join('、')}`)

  const text = result.pages.text
  if (text.cjkCharacters === 0 || text.pagesWithCjk === 0)
    errors.push('未提取到中文文本')
  if (text.replacementCharacters > 0)
    errors.push(`提取文本含 ${text.replacementCharacters} 个替换字符 U+FFFD`)
  if (text.missingExpectedTitles.length > 0) {
    errors.push(`正文无法提取这些预期标题：${text.missingExpectedTitles
      .map(item => `${item.kind}:${item.title}`)
      .join('、')}`)
  }

  if (result.fonts.count === 0)
    errors.push('未发现字体资源')
  if (result.fonts.unembedded.length > 0)
    errors.push(`存在未嵌入字体：${result.fonts.unembedded.map(font => font.name).join('、')}`)

  if (result.security.javascript)
    errors.push('PDF 含 JavaScript')
  if (result.security.acroForm || result.security.formFields > 0 || result.security.widgets > 0)
    errors.push(`PDF 含表单：AcroForm=${result.security.acroForm}，Fields=${result.security.formFields}，Widgets=${result.security.widgets}`)

  if (result.pages.invalidObjectPages.length > 0)
    errors.push(`存在无效内容边界对象：${formatPages(result.pages.invalidObjectPages)}`)
  if (result.pages.outOfBoundsPages.length > 0) {
    errors.push(`内容超出页面边界：${result.pages.outOfBoundsPages
      .map(item => `${item.page}（${item.objects} 个对象，最大 ${item.maxOverflowPt} pt）`)
      .join('、')}`)
  }
  if (result.pages.oddBlankPages.length > 0)
    warnings.push(`存在奇数页空白，需人工复核：${formatPages(result.pages.oddBlankPages)}`)
  return { errors, warnings }
}

function humanReport(results, evaluations, expected, python) {
  const lines = [
    `书籍 PDF 验证：${expected.partCount} 篇 / ${expected.chapterCount} 章`,
    `检查器：Python ${python.versions}`,
  ]
  for (let index = 0; index < results.length; index += 1) {
    const result = results[index]
    const evaluation = evaluations[index]
    lines.push('', `${evaluation.errors.length === 0 ? '✓' : '✗'} ${result.label}  ${result.path}`)
    if (!result.exists || result.fatal || result.security?.encrypted) {
      for (const error of evaluation.errors)
        lines.push(`  错误：${error}`)
      continue
    }
    lines.push(
      `  文件：${(result.fileSize / 1024 / 1024).toFixed(2)} MiB，${result.pageCount} 页`,
      `  纸张：${formatSize(result.pages.pageSizes)}`,
      `  元数据：${result.metadata.title} / ${result.metadata.author} / ${result.metadata.language} / ${expected.book.version}`,
      `  Subject：${result.metadata.subject}；Keywords：${result.metadata.keywords}`,
      `  书签：篇 ${result.outline.partMatched}/${expected.partCount}，分组 ${result.outline.groupMatched}/${expected.groupCount}，章 ${result.outline.chapterMatched}/${expected.chapterCount}`,
      `  文本：${result.pages.text.characters.toLocaleString('zh-CN')} 字符，其中中文 ${result.pages.text.cjkCharacters.toLocaleString('zh-CN')} 字；${result.pages.text.pagesWithText}/${result.pageCount} 页有文本`,
      `  字体：${result.fonts.embeddedCount}/${result.fonts.count} 已嵌入，${result.fonts.toUnicodeCount}/${result.fonts.count} 含 ToUnicode`,
      `  安全：未加密；JavaScript=${result.security.javascript ? '有' : '无'}；表单=${result.security.acroForm || result.security.widgets ? '有' : '无'}`,
      `  空白页：${result.pages.blankPages.length} 页（${formatPages(result.pages.blankPages)}）`,
      `  边界异常：${result.pages.outOfBoundsPages.length} 页（${formatPages(result.pages.outOfBoundsPages.map(item => item.page))}）`,
    )
    for (const error of evaluation.errors)
      lines.push(`  错误：${error}`)
    for (const warning of evaluation.warnings)
      lines.push(`  警告：${warning}`)
  }
  const errorCount = evaluations.reduce((sum, evaluation) => sum + evaluation.errors.length, 0)
  const warningCount = evaluations.reduce((sum, evaluation) => sum + evaluation.warnings.length, 0)
  lines.push('', errorCount === 0
    ? `验证通过${warningCount ? `（${warningCount} 项警告）` : ''}。`
    : `验证失败：${errorCount} 项错误${warningCount ? `，${warningCount} 项警告` : ''}。`)
  return lines.join('\n')
}

function main() {
  let options
  try {
    options = parseArguments(process.argv.slice(2))
  } catch (error) {
    console.error(error.message)
    console.error(usage())
    process.exitCode = 2
    return
  }
  if (options.help) {
    console.log(usage())
    return
  }

  try {
    const order = readBookOrder()
    const selectedFormats = options.format === 'all' ? ['b5', 'a4'] : [options.format]
    const pdfs = selectedFormats.map(format => ({
      format,
      label: formats[format].label,
      path: formats[format].file,
      widthMm: formats[format].widthMm,
      heightMm: formats[format].heightMm,
    }))
    const chapterCount = order.parts.reduce(
      (total, part) => total + part.chapters.length
        + part.groups.reduce((sum, group) => sum + group.chapters.length, 0),
      0,
    )
    const groupCount = order.parts.reduce((total, part) => total + part.groups.length, 0)
    const expected = {
      book: order.book,
      partCount: order.parts.length,
      groupCount,
      chapterCount,
    }
    const python = findPython()
    const results = runInspector(python, {
      book: order.book,
      parts: order.parts,
      expectedTitles: order.expectedTitles,
      pdfs,
    })
    const evaluations = results.map(result => evaluate(result, expected))
    const errorCount = evaluations.reduce((sum, evaluation) => sum + evaluation.errors.length, 0)

    if (options.json) {
      console.log(JSON.stringify({
        expected,
        python: { label: python.label, versions: python.versions },
        results: results.map((result, index) => ({ ...result, evaluation: evaluations[index] })),
        passed: errorCount === 0,
      }, null, 2))
    } else {
      console.log(humanReport(results, evaluations, expected, python))
    }
    if (errorCount > 0)
      process.exitCode = 1
  } catch (error) {
    if (options?.json)
      console.log(JSON.stringify({ passed: false, fatal: error.message }, null, 2))
    else
      console.error(error.message)
    process.exitCode = 2
  }
}

main()
