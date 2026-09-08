import fs from "fs";
import path from "path";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  category: string;
  tags: string[];
  description: string;
  draft: boolean;
}

export interface Post extends PostMeta {
  content: string;
}

export const CATEGORIES: Record<string, string> = {
  "ai-tools": "AI 工具",
  "ai-tutorials": "AI 教程",
  building: "建站笔记",
  archive: "旧文档案",
};

/** 日期一律归一化为 YYYY-MM-DD（北京时区），避免 gray-matter 把裸日期解析成 UTC Date */
function normalizeDate(raw: unknown): string {
  if (!raw) return "";
  if (raw instanceof Date) {
    const bj = new Date(raw.getTime() + 8 * 3600 * 1000);
    return bj.toISOString().slice(0, 10);
  }
  return String(raw).slice(0, 10);
}

function parsePost(fileName: string): Post {
  const fullPath = path.join(POSTS_DIR, fileName);
  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);
  return {
    slug: fileName.replace(/\.mdx$/, ""),
    title: data.title ?? "未命名",
    date: normalizeDate(data.date),
    category: data.category ?? "building",
    tags: data.tags ?? [],
    description: data.description ?? "",
    draft: data.draft ?? false,
    content,
  };
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map(parsePost)
    .filter((p) => !p.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

export function getAllCategories(): string[] {
  return Object.keys(CATEGORIES);
}

/**
 * 相关文章推荐：同分类 +2 分，每个共享 tag +1 分，
 * 按得分降序、同分按日期新到旧，取前 limit 篇。
 */
export function getRelatedPosts(slug: string, limit = 3): Post[] {
  const all = getAllPosts();
  const current = all.find((p) => p.slug === slug);
  if (!current) return [];
  return all
    .filter((p) => p.slug !== slug)
    .map((p) => ({
      p,
      score:
        (p.category === current.category ? 2 : 0) +
        p.tags.filter((t) => current.tags.includes(t)).length,
    }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || (a.p.date < b.p.date ? 1 : -1))
    .slice(0, limit)
    .map((s) => s.p);
}
