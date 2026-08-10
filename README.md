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
├── package.json
├── package-lock.json
├── CNAME                    # 域名记录；Actions 部署以 Pages 设置为准
└── README.md
```

## 贡献

欢迎通过 Issue 或 Pull Request 交流、补充内容或修正文档中的问题。

## 开源协议

本项目基于 [MIT License](./LICENSE) 开源。
