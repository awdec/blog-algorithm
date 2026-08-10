# awdec's Blog

一个基于 VitePress 搭建的算法与竞赛编程笔记站点，内容涵盖数据结构、字符串、数学、图论、多项式、计算几何、动态规划等专题。

## 内容概览

- 数据结构：线段树、树状数组、并查集、平衡树、动态树、莫队、树链剖分、点分治等
- 字符串：KMP、Hash、Manacher、Trie、AC 自动机、PAM、SAM、SA 等
- 数学：数论、组合数学、生成函数、多项式相关内容
- 图论：最短路、最小生成树、二分图、Tarjan、欧拉路、LCA 等
- 计算几何：凸包、半平面交、旋转卡壳、扫描线、圆、三维几何等
- 动态规划与其他竞赛常用技巧

## 技术栈

- [VitePress](https://vitepress.dev/)
- Markdown
- markdown-it-mathjax3
- [Quarto](https://quarto.org/) + LuaLaTeX（PDF 书籍排版）

## 本地运行

请先安装 Node.js 20 或更高版本。项目根目录已有 `package-lock.json`，首次克隆或需要恢复依赖时使用：

```bash
npm ci
```

如果直接运行 `npm run docs:dev` 时提示“`vitepress` 不是内部或外部命令”，说明本地依赖尚未安装；执行上面的 `npm ci` 即可，无需全局安装 VitePress。

启动开发服务器：

```bash
npm run docs:dev
```

构建静态站点：

```bash
npm run docs:build
```

本地预览构建结果：

```bash
npm run docs:preview
```

## PDF 书籍导出

网站和 PDF 共同使用 `docs/**/*.md` 作为内容源，并共同读取
[`book/book-order.json`](./book/book-order.json) 确定发布状态和章节顺序。
PDF 专用转换只写入临时目录 `.book-build/`，不会批量改写博客原文。

当前支持两种输出：

| 版本 | 页面尺寸 | 用途 |
|---|---:|---|
| B5 书籍版 | 176 × 250 mm | 胶装、成书和长期收藏 |
| A4 打印版 | 210 × 297 mm | 普通打印机、活页装订和宽代码阅读 |

修改现有文档后，一条命令即可重新生成并验证两个版本：

```bash
npm run book:pdf
```

Windows PowerShell 如果受到脚本执行策略限制，可改用：

```powershell
npm.cmd run book:pdf
```

该命令会执行 Markdown 与资源预处理、B5/A4 排版，并检查纸张尺寸、元数据、
书签、字体嵌入、中文文本、安全对象和页面边界。任一检查失败时，命令返回失败，
不会把有问题的文件当作正式成品。

也可以分别执行：

```bash
npm run book:check
npm run book:pdf:b5
npm run book:pdf:a4
npm run book:verify
```

正式输出位于：

```text
output/pdf/algorithm-notes-b5.pdf
output/pdf/algorithm-notes-a4.pdf
```

修改已收录章节会自动进入下一次构建；新增、删除或重命名章节时，需要同步更新
`book/book-order.json`。书目配置会同时驱动 VitePress 导航和 PDF 目录，路径不存在、
大小写不一致、图片缺失或存在不可转换语法时会明确报错。

### PDF 构建环境

当前电脑上的 Quarto 与 TinyTeX 优先从项目内的 `.book-tools/` 使用，npm 转换依赖
安装在项目的 `node_modules/`。`.book-tools/` 和 `.book-build/` 均被 Git 忽略，
因此重新克隆到其他电脑后仍需准备相应工具。

Node.js、FFmpeg、PDF 验证所用的 Python 环境以及 Windows 字体属于系统或用户级环境，
并非全部封装在仓库中。具体工具链版本、资源静态化策略和环境变量说明见
[`book/README.md`](./book/README.md)。

打印时建议选择“双面、长边翻转、实际大小 100%”，不要启用“适合页面”。为保证
篇章从右页开始，成品中会有少量无页眉页码的偶数空白页，这是双面书籍排版的正常留白。

## GitHub Pages 部署

推送到 `main` 分支后，[`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) 会自动构建并部署站点。首次部署前，请在 GitHub 仓库的 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。

当前工作流为每次运行上传唯一命名的 Pages artifact，并把同一个名称显式传给 `deploy-pages`，避免同一次 workflow run 中出现多个同名 `github-pages` artifact。

### 使用自定义域名（当前配置）

当前域名是 `awdec.online`，站点发布在域名根路径，因此 [`docs/.vitepress/config.mts`](./docs/.vitepress/config.mts) 使用：

```ts
base: '/'
```

在 GitHub 仓库的 **Settings → Pages → Custom domain** 中填写 `awdec.online`，并按 GitHub 提示配置 DNS。使用自定义 GitHub Actions 工作流时，仓库中的 `CNAME` 文件不会负责设置域名，Pages 设置中的 Custom domain 才是实际配置。

### 使用 GitHub 仓库项目页

如果不再使用自定义域名，而改为 `https://<用户名>.github.io/blog-algorithm/`，请先清除 Pages 设置中的 Custom domain，再把 VitePress 配置改为：

```ts
base: '/blog-algorithm/'
```

两种模式只能选择一种；否则静态资源和站内链接可能指向错误路径。

## 项目结构

```text
.
├── docs/
│   ├── .vitepress/          # VitePress 配置
│   ├── data-structure/      # 数据结构
│   ├── dp/                  # 动态规划
│   ├── geometry/            # 计算几何
│   ├── graph/               # 图论
│   ├── math/                # 数学专题
│   ├── other/               # 杂项
│   ├── poly/                # 多项式
│   ├── public/              # 静态资源
│   └── string/              # 字符串
├── book/
│   ├── book-order.json      # 网站与 PDF 共用的书目顺序
│   ├── latex/               # LuaLaTeX 书籍模板
│   └── README.md            # PDF 构建与打印说明
├── scripts/
│   ├── build-book.mjs       # 预处理并生成 B5/A4 PDF
│   └── verify-book.mjs      # PDF 结构和页面边界验证
├── output/pdf/              # 最终 PDF 输出
├── package.json
├── package-lock.json
├── CNAME                    # 域名记录；Actions 部署以 Pages 设置为准
└── README.md
```

## 贡献

欢迎通过 Issue 或 Pull Request 交流、补充内容或修正文档中的问题。

## 开源协议

本项目基于 [MIT License](./LICENSE) 开源。
