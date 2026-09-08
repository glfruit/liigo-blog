import Link from "next/link";
import { getAllPosts, CATEGORIES } from "@/lib/posts";

/** 目录列表用中文习惯格式：2026年9月7日 */
function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${y}年${Number(m)}月${Number(d)}日`;
}

export default function HomePage() {
  const posts = getAllPosts();

  return (
    <div className="py-14">
      {/* 刊头 */}
      <section className="pb-14">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-3">
          ( 一份关于 AI 与构建的独立刊物 )
        </p>
        <h1 className="font-display mt-6 text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
          写作即构建。
        </h1>
        <p className="mt-6 max-w-xl leading-loose text-ink-3">
          这里记录我用 AI 工具解决问题的过程、值得深读的教程，
          以及这个博客本身从 zero 到 one 的技术实现。
          文章不多，但每一篇都经过亲手验证。
        </p>
      </section>

      {/* 文章目录 */}
      <section>
        <div className="hairline-b flex items-baseline justify-between pb-3 font-mono text-xs uppercase tracking-widest text-ink-3">
          <span>( 目录 / Index )</span>
          <span>{posts.length} 篇</span>
        </div>

        <ul>
          {posts.map((post) => (
            <li key={post.slug} className="post-row hairline-b">
              <Link
                href={`/posts/${post.slug}`}
                className="group grid grid-cols-[7.5rem_1fr] items-baseline gap-4 py-5 sm:grid-cols-[8rem_1fr_8rem]"
              >
                <time className="font-mono text-xs text-ink-3">
                  {formatDate(post.date)}
                </time>
                <span className="min-w-0">
                  <span className="row-arrow mr-2 inline-block font-mono text-xs">
                    →
                  </span>
                  <span className="row-title font-display text-lg font-semibold tracking-tight">
                    {post.title}
                  </span>
                  {post.description && (
                    <span className="mt-1 block truncate text-sm leading-relaxed text-ink-3">
                      {post.description}
                    </span>
                  )}
                </span>
                <span className="hidden text-right font-mono text-xs uppercase tracking-widest text-ink-3 sm:block">
                  {CATEGORIES[post.category] ?? post.category}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {posts.length === 0 && (
          <p className="py-16 text-center text-ink-3">
            刊物筹备中，第一期即将付印。
          </p>
        )}
      </section>
    </div>
  );
}
