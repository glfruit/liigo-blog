import { getAllPosts, CATEGORIES } from "@/lib/posts";

export const dynamic = "force-static";

const SITE = "https://liigo.dev";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function GET() {
  const posts = getAllPosts();
  const lastBuild = new Date().toUTCString();

  const items = posts
    .map(
      (p) => `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${SITE}/posts/${p.slug}</link>
      <guid isPermaLink="true">${SITE}/posts/${p.slug}</guid>
      <pubDate>${new Date(p.date + "T08:00:00+08:00").toUTCString()}</pubDate>
      <category>${escapeXml(CATEGORIES[p.category] ?? p.category)}</category>
      <description>${escapeXml(p.description)}</description>
    </item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>liigo</title>
    <link>${SITE}</link>
    <description>AI 工具评测、深度教程，以及这个博客本身的技术实现记录。</description>
    <language>zh-CN</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
