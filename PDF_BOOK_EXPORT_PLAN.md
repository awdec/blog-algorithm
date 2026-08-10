# 算法笔记博客：PDF 书籍导出方案

> 状态：待实施的设计文档
>
> 最后更新：2026-08-10
>
> 目标方案：共用顺序配置 + Markdown 预处理 + Quarto Book + LuaLaTeX + B5/A4 双面书籍模板

本文档用于项目内容基本完善后实施 PDF 书籍导出。当前阶段仅记录设计，不安装依赖、不改变现有 VitePress 构建，也不生成新的 PDF。

## 1. 目标与原则

### 1.1 目标

- 继续使用现有 `docs/**/*.md` 作为网页和书籍的共同内容源。
- 按人工指定的顺序组织“篇、章、节”，不依赖文件名的字母顺序。
- 输出带封面、目录、章节编号、页码、页眉、PDF 书签和内部链接的完整 PDF。
- 同时支持 B5 书籍版和 A4 阅读/打印版。
- 正确处理中文、数学公式、C++ 代码块、PNG/JPG/SVG/GIF 图片。
- 采用适合双面打印和装订的奇偶页边距及章节起始规则。
- 最终提供可重复执行的一键构建命令，并能在内容或链接不完整时明确报错。

### 1.2 原则

- **内容单一来源**：不长期维护另一套复制出来的 Markdown。
- **顺序单一来源**：网站导航、侧边栏和 PDF 目录尽量由同一份顺序配置生成。
- **不污染原文**：所有 PDF 专用转换只写入临时构建目录。
- **可重复构建**：同一版本内容和依赖应得到稳定、可追踪的输出。
- **先正确、后美化**：先确保内容、公式、代码、图片和链接完整，再调整书籍视觉样式。
- **打印与屏幕兼顾**：纸质版考虑装订和灰度可读性，电子版保留书签和可点击链接。

## 2. 总体架构

```text
docs/**/*.md
       +
book/book-order.json        唯一顺序配置
       |
       v
scripts/build-book.mjs      校验与 Markdown 预处理
       |
       v
.book-build/                临时 Quarto Book 项目
  |- _quarto.yml
  |- chapters/
  |- assets/
  `- latex/
       |
       v
Quarto Book + LuaLaTeX
       |
       v
output/pdf/
  |- algorithm-notes-b5.pdf
  `- algorithm-notes-a4.pdf
       |
       v
Poppler 渲染检查 + PDF 结构检查
```

VitePress 继续负责网站；书籍流水线负责出版级 PDF。二者不要求视觉完全一致，但共享文章内容和呈现顺序。

## 3. 共用顺序配置

### 3.1 推荐文件

后续新增：

```text
book/book-order.json
```

选择 JSON 的原因：VitePress 的 TypeScript 配置和 Node.js 预处理脚本都可以稳定读取，不需要额外的 YAML 解析依赖。

### 3.2 建议结构

文件路径相对于 `docs/`，网页路由可由文件路径自动推导，避免同时维护文件名和路由。

```json
{
  "book": {
    "title": "awdec 算法笔记",
    "subtitle": "算法与理论整理",
    "author": "awdec",
    "language": "zh-CN"
  },
  "parts": [
    {
      "id": "data-structure",
      "title": "数据结构",
      "chapters": [
        {
          "title": "平衡树",
          "file": "data-structure/binary-search-tree.md",
          "status": "published"
        },
        {
          "title": "线段树",
          "file": "data-structure/segment-tree.md",
          "status": "published"
        }
      ]
    },
    {
      "id": "string",
      "title": "字符串",
      "chapters": [
        {
          "title": "字符串处理",
          "file": "string/string.md",
          "status": "published"
        }
      ]
    }
  ]
}
```

### 3.3 状态约定

建议每章支持以下状态：

- `published`：网站和 PDF 均收录。
- `draft`：网站可按需要显示，但正式 PDF 默认不收录。
- `hidden`：保留文件，但网站和 PDF 均不出现在目录中。

还可以按需增加：

- `includeInWeb`：是否进入网站导航。
- `includeInBook`：是否进入 PDF。
- `unnumbered`：前言、致谢等不编号章节。
- `appendix`：作为附录收录。
- `startOnOddPage`：是否从奇数页开始。

### 3.4 网站与 PDF 的使用方式

- VitePress 顶部导航指向每个分类中第一个可发布、真实存在的章节。
- VitePress 侧边栏按 `chapters` 数组顺序生成。
- PDF 按 `parts` 和 `chapters` 的顺序生成篇章目录。
- 分类标题页由构建程序合成，不需要恢复各分类的 `home.md`。
- 配置中的文件不存在、重复或路径大小写不一致时，构建直接失败。

### 3.5 当前项目的特殊情况

- 动态规划侧边栏仍有多个指向 `/` 的占位项；在相应文档创建前，不应写入书籍顺序配置。
- `poly/Generating-function.md` 含大写字母，路径校验必须区分大小写，避免部署到 Linux 后失效。
- `docs/index.md` 是网站首页，不应默认作为书籍正文。需要前言时，建议单独创建 `book/front-matter/preface.md`。
- “数学”可以采用两种层级：
  - 将“数论”和“组合数学”分别作为独立的篇；
  - 将“数学”作为篇，再把二者作为章组。实施前需确定最终目录风格。

## 4. Markdown 预处理

预处理只读取 `docs/` 原文，并把转换结果写入 `.book-build/`。不得直接批量改写源文档。

### 4.1 基础处理

1. 读取并校验顺序配置。
2. 检查每个章节文件是否存在且只出现一次。
3. 读取 Markdown front matter，并保留书籍需要的标题、描述、作者等字段。
4. 由顺序配置生成篇标题和章标题。
5. 避免原文一级标题和自动章标题重复：
   - 若第一个一级标题与配置标题相同，则去除重复标题；
   - 若标题不同，则保留为章节副标题或发出人工确认警告。
6. 保持原文二级及以下标题的相对层级。

### 4.2 链接处理

- 外部 `https://` 链接保持不变，并允许在电子 PDF 中点击。
- VitePress 无扩展名路由转换为 PDF 内部章节锚点。
- Markdown 文件链接转换为对应章节锚点。
- 指向未收录章节的链接必须给出警告或转为普通文本。
- `/`、空链接和不存在的路由视为错误，不静默忽略。
- 为篇、章、节生成稳定且唯一的锚点，避免中文标题重复导致链接冲突。

### 4.3 图片与静态资源

- `/xxx.png` 等网站绝对路径映射到 `docs/public/xxx.png`。
- 相对图片路径按当前 Markdown 文件位置解析。
- 构建时将所需资源复制到 `.book-build/assets/`，并检查遗漏。
- PNG/JPG 控制最大宽度和有效分辨率，避免拉伸后模糊。
- SVG 优先矢量嵌入；若 LaTeX 环境不兼容，则转换为 PDF 或高分辨率 PNG。
- GIF 无法在纸面播放，默认提取代表帧；重要动画应人工转换为多张步骤图。
- 图片标题、编号和来源说明应使用统一语法，方便生成图目录和交叉引用。

### 4.4 数学公式

- 统一支持行内 `$...$` 和块级 `$$...$$` 公式。
- 收集项目中使用的 MathJax 宏，并转换为 LuaLaTeX 可识别的宏定义。
- 对只在 MathJax 中存在的命令建立兼容映射或在构建时报告。
- 检查长公式是否超出 B5 页面宽度；必要时人工拆行。

### 4.5 代码块

- 规范语言名，例如将 `c++`、`C++` 统一映射为 `cpp`。
- 保留语法高亮，但颜色必须在灰度打印时仍可辨识。
- B5 版代码字体可从约 8.5pt 起调，A4 版可从约 9pt 起调。
- 长行默认允许视觉换行，并用符号区分“源码换行”和“排版换行”。
- 代码块允许跨页，但避免只剩一行出现在下一页。
- 行号默认关闭；仅在正文明确引用代码行时启用。

### 4.6 VitePress 专属语法和 HTML

需要在实施前扫描并建立转换规则：

- `::: tip`、`::: warning` 等容器转换为书籍提示框。
- `<center>`、`<details>`、自定义 Vue 组件等原始 HTML 需要替代样式。
- 折叠内容在 PDF 中必须展开或明确排除。
- 网页交互组件需要生成静态替代内容。
- 无法安全转换的语法应让构建失败并报告文件与行号。

## 5. Quarto Book 配置

### 5.1 推荐目录

```text
book/
  |- book-order.json
  |- quarto-template.yml
  |- front-matter/
  |   |- title.md
  |   `- preface.md
  |- latex/
  |   |- preamble.tex
  |   |- page-style.tex
  |   `- code-style.tex
  `- assets/
      `- cover.*

.book-build/               # 自动生成，加入 .gitignore
output/pdf/                # 最终输出
```

### 5.2 配置模板示意

实际 `_quarto.yml` 由构建脚本根据顺序配置生成，章节列表不手工重复维护。

```yaml
project:
  type: book
  output-dir: ../output/pdf

lang: zh-CN

book:
  title: "awdec 算法笔记"
  author: "awdec"
  output-file: "algorithm-notes-b5"
  chapters: [] # 由构建脚本生成

format:
  pdf:
    documentclass: scrbook
    pdf-engine: lualatex
    papersize: b5
    classoption:
      - twoside
      - openright
    toc: true
    toc-title: "目录"
    toc-depth: 3
    number-sections: true
    keep-tex: true
    mainfont: "Noto Serif CJK SC"
    sansfont: "Noto Sans CJK SC"
    monofont: "Sarasa Mono SC"
    geometry:
      - inner=22mm
      - outer=16mm
      - top=18mm
      - bottom=22mm
      - bindingoffset=5mm
    include-in-header:
      - latex/preamble.tex
      - latex/page-style.tex
      - latex/code-style.tex
```

以上参数是初始建议值，正式实施时需用项目中的最长代码、最大表格和复杂公式进行试排后确定。

### 5.3 篇章结构

生成的 Quarto 章节结构应类似：

```yaml
chapters:
  - front-matter/preface.md
  - part: "数据结构"
    chapters:
      - chapters/data-structure/binary-search-tree.md
      - chapters/data-structure/segment-tree.md
  - part: "字符串"
    chapters:
      - chapters/string/string.md
      - chapters/string/border.md
```

## 6. LuaLaTeX 双面书籍模板

### 6.1 文档类别

采用 KOMA-Script 的 `scrbook`：

- `twoside`：启用双面排版和奇偶页样式。
- `openright`：重要篇章从奇数页开始。
- 内侧页边距大于外侧页边距，为胶装或线装预留装订空间。
- 空白页保留正确页码逻辑，但不显示普通页眉。

### 6.2 B5 与 A4 初始参数

| 参数 | B5 书籍版 | A4 阅读/打印版 |
|---|---:|---:|
| 页面尺寸 | 176 × 250 mm | 210 × 297 mm |
| 内侧边距 | 22 mm | 25 mm |
| 外侧边距 | 16 mm | 20 mm |
| 上边距 | 18 mm | 22 mm |
| 下边距 | 22 mm | 25 mm |
| 装订补偿 | 5 mm | 6 mm |
| 建议正文大小 | 10.5–11 pt | 11–11.5 pt |
| 建议代码大小 | 约 8.5 pt | 约 9 pt |

B5 更像正式书籍，但长代码和复杂公式更容易换行；A4 更适合算法代码、屏幕阅读和普通打印机。两个版本应共用内容，只切换页面与字号配置。

### 6.3 字体策略

推荐使用可合法分发或容易安装的字体：

- 正文：Noto Serif CJK SC 或 Source Han Serif SC。
- 标题：Noto Sans CJK SC 或 Source Han Sans SC。
- 代码：Sarasa Mono SC；也可以选用其他同时覆盖中文和 ASCII 的等宽字体。
- 数学：使用与 LuaLaTeX 兼容的 OpenType 数学字体。

构建前必须检查字体是否存在。若用于 CI，应明确字体下载来源、版本和许可证，避免依赖某台电脑独有的字体。

### 6.4 页面元素

- 封面不显示页码。
- 前言和目录可使用小写罗马页码。
- 正文从第 1 页开始使用阿拉伯数字。
- 奇数页页眉显示当前章名，偶数页显示当前篇名或书名。
- 页码放置在页面外侧，便于翻阅。
- 篇标题页尽量简洁，章标题与正文保持足够间距。
- 链接颜色应兼顾彩色屏幕与黑白打印；打印版可以只保留下划线或深灰色。

## 7. 未来构建命令

后续可以在 `package.json` 中增加以下命令，但当前不实施：

```json
{
  "scripts": {
    "book:check": "node scripts/build-book.mjs --check",
    "book:pdf:b5": "node scripts/build-book.mjs --format b5",
    "book:pdf:a4": "node scripts/build-book.mjs --format a4",
    "book:pdf": "node scripts/build-book.mjs --format all"
  }
}
```

建议职责：

- `book:check`：只校验顺序、文件、链接、图片和可转换语法，不调用 LaTeX。
- `book:pdf:b5`：生成 B5 双面书籍版。
- `book:pdf:a4`：生成 A4 阅读/打印版。
- `book:pdf`：依次生成两个版本并执行完整验证。

## 8. 依赖规划

未来实施时预计需要：

- Node.js：执行顺序校验和 Markdown 预处理。
- Quarto：组织多文档书籍项目。
- LuaLaTeX：建议通过 TinyTeX 或 TeX Live 提供。
- 中文及等宽字体：必须明确版本与安装方式。
- Poppler：使用 `pdfinfo`、`pdftoppm` 检查和渲染 PDF。
- `pypdf` 或同类工具：检查页数、书签、元数据和内部链接。
- SVG 转换工具：仅在 LuaLaTeX 不能直接处理相关资源时使用。
- GIF/视频帧提取工具：仅在文档包含必须转为静态图片的动画时使用。

应先检测本机已有工具，再安装缺失的最小集合。

## 9. 验证与质量检查

### 9.1 构建前校验

- 顺序配置格式正确。
- 每个收录文件真实存在且没有重复。
- 没有 `/`、空字符串或不存在的占位路由。
- 图片、附件和内部链接全部可解析。
- 标题锚点没有冲突。
- 公式和代码围栏完整闭合。
- 不支持的 VitePress/HTML 语法有明确报告。

### 9.2 PDF 结构检查

- PDF 可以重新打开，页数大于零。
- 页面尺寸与 B5/A4 配置一致。
- 目录条目、PDF 书签和实际页码一致。
- 篇、章、节编号连续。
- 内部链接跳转到正确章节。
- 字体已经嵌入，不依赖阅读者本机字体。
- 中文文本可复制和搜索，不是整页位图。
- 文档元数据包含标题、作者、语言和版本信息。

### 9.3 视觉检查

最终 PDF 应逐页渲染为 PNG 进行检查，重点包括：

- 没有黑方块、缺字、乱码或公式错误。
- 没有文字、图片、表格和公式越出页边距。
- 长代码可读，没有被裁切。
- 图片清晰，标题和编号位置一致。
- 章标题确实从指定页面开始。
- 空白页、目录页和正文页的页眉页脚正确。
- 奇偶页内外边距符合双面装订方向。
- 彩色提示框在灰度打印时仍能区分。

### 9.4 最低验收标准

只有同时满足以下条件才交付正式 PDF：

1. 所有收录章节构建成功且顺序正确。
2. 没有失效的图片和内部链接。
3. 所有页面通过视觉检查，不存在裁切和重叠。
4. 中文、公式和代码在目标阅读器中显示正常。
5. 目录、书签、页码和章节编号一致。
6. B5 与 A4 输出均可重复构建。

## 10. 推荐实施阶段

### 阶段一：内容清点和顺序统一

- 等项目章节基本稳定后，建立 `book/book-order.json`。
- 将现有 VitePress 导航和侧边栏顺序迁移到共用配置。
- 处理动态规划等分类中的占位链接。
- 确定草稿、附录和不收录文章。

### 阶段二：最小预处理器

- 完成文件、链接和图片校验。
- 生成临时章节和 Quarto 配置。
- 暂不追求复杂样式，先生成内容完整的 PDF。

### 阶段三：兼容项目语法

- 处理数学宏、VitePress 容器、原始 HTML、SVG 和 GIF。
- 建立明确的“不支持语法”错误报告。
- 修正源文档中确实不规范的内容。

### 阶段四：B5/A4 书籍模板

- 确定字体、字号、行距、页边距、页眉页脚和章标题。
- 用最长代码、最宽表格、最大图片和复杂公式进行压力测试。
- 分别优化 B5 和 A4 配置。

### 阶段五：自动化和发布

- 增加 `npm run book:*` 命令。
- 在需要时加入 CI 构建和 PDF artifact。
- 为正式版本记录内容提交、构建日期和工具版本。
- 可选生成 EPUB，但不影响 PDF 主流程。

## 11. 实施前需要最终确定的事项

- 正式书名、副标题、作者和版本号。
- 是否需要封面、版权页、前言、致谢和更新记录。
- “数学”采用一个篇还是拆分为“数论”“组合数学”两个篇。
- 默认发布 B5、A4，还是同时发布两者。
- 章节编号深度，例如是否编号到三级标题。
- 是否收录尚未完整的文章和空章节。
- 彩色版与黑白打印版是否需要不同配色。
- GIF 应选择代表帧还是改写为多步骤静态图。
- 输出文件命名和版本归档规则。
- 是否需要 PDF/A、PDF/UA 或印刷厂要求的 PDF/X 标准。

## 12. 不推荐作为正式方案的做法

- 直接逐篇使用浏览器“打印为 PDF”后拼接：难以保持连续页码、全书目录、书签和双面页边距。
- 把所有 Markdown 永久复制到另一个目录：后续容易发生网页和书籍内容不一致。
- 仅按文件系统顺序合并：无法表达正式的篇章结构，也容易因重命名改变顺序。
- 忽略最终页面渲染检查：文本提取成功不代表公式、图片和代码没有视觉缺陷。
- 为追求网页像素级还原而牺牲分页可读性：网页和纸质书应共享内容，但允许采用不同排版。

## 13. 官方参考

- Quarto Books：https://quarto.org/docs/books/
- Quarto PDF Basics：https://quarto.org/docs/output-formats/pdf-basics.html
- Quarto Book Options：https://quarto.org/docs/reference/projects/books.html
- Pandoc User's Guide：https://pandoc.org/MANUAL.html
- KOMA-Script：https://ctan.org/pkg/koma-script
- LuaLaTeX：https://www.luatex.org/
- Poppler：https://poppler.freedesktop.org/
