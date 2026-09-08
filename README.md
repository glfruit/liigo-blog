# liigo.dev

个人博客，线上地址：https://liigo.dev

## 技术栈

- Next.js 15 (App Router) + TypeScript + Tailwind CSS 4 + MDX
- 部署：Cloudflare Workers（@opennextjs/cloudflare，全量 SSG + 静态资产增量缓存）
- 内容：`content/posts/*.mdx`，frontmatter 含 `draft` 控制发布

## 常用命令

```bash
npm run dev       # 本地开发
npm run build     # 静态导出到 dist/（预览/未来国内镜像）
npm run build:cf  # OpenNext 构建（next build + opennext 打包）
npm run deploy    # 构建 + 部署到 Workers（需 CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID）
```

## 发布流

push 到 `main` 即自动部署（GitHub Actions → Cloudflare Workers）。

## 文档

- 《个人博客技术方案与架构文档.md》：架构、内容管线、域名规划、里程碑
- 《M2-上线操作手册.md》：部署、域名绑定、SEO 提交操作指南
