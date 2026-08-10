# PDF 书籍构建

书籍与网站共同读取 `book/book-order.json`。PDF 专用转换只写入
`.book-build/`，最终文件写入 `output/pdf/`，不会批量改写 `docs/` 原文。

```powershell
npm.cmd run book:check
npm.cmd run book:pdf:b5
npm.cmd run book:pdf:a4
npm.cmd run book:pdf
npm.cmd run book:verify
```

`book:pdf` 会依次生成 B5、A4，并在最后执行完整 PDF 验证；任一格式的
尺寸、书签、字体嵌入、文本提取、安全对象或页面边界检查失败时，命令返回失败。

构建程序优先使用项目内 `.book-tools/` 中的便携 Quarto 和 TinyTeX，
也可分别通过 `QUARTO_BIN`、`BOOK_TEX_BIN`、`BOOK_POPPLER_BIN` 和
`BOOK_PYTHON` 指向其他安装位置。

正式输出：

- `output/pdf/algorithm-notes-b5.pdf`
- `output/pdf/algorithm-notes-a4.pdf`

## 当前出版约定

- 版本与构建日期由 `book/book-order.json` 唯一维护，并写入前言和 PDF 元数据。
- GIF `/旋转卡壳1.gif` 在纸面版固定取第一帧；SVG 使用 2 倍尺寸 PNG 静态化，避免依赖额外的 LaTeX SVG 工具。
- 输出是标准 PDF 1.7，不声明 PDF/A、PDF/UA 或 PDF/X；若印刷厂要求特定标准，应在交付前另做预检与转换。
- B5 与 A4 均按双面、右页起章排版。打印时选择“实际大小/100%”，不要启用“适合页面”。

## 已验证工具链

- Node.js 22.17.0、npm 10.9.2
- Quarto 1.10.18、Pandoc 3.10.0
- TinyTeX / TeX Live 2026、LuaHBTeX 1.24.0
- `@resvg/resvg-js` 2.6.2、FFmpeg 8.1.1
- Poppler 26.05.0
- pypdf 6.10.0、pdfplumber 0.11.9

字体采用 FandolSong（中文正文）、Noto Sans SC（标题）、Consolas（代码拉丁字符）
和 Latin Modern Math（数学）。构建后验证器会递归确认所有实际使用字体均已嵌入并带
ToUnicode 映射。
