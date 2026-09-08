import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getAllPosts, getPostBySlug, CATEGORIES } from "@/lib/posts";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

/** 中文习惯格式：2026 年 9 月 7 日 */
function formatDateZh(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${y} 年 ${Number(m)} 月 ${Number(d)} 日`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Person", name: "liigo", url: "https://liigo.dev" },
    publisher: {
      "@type": "Organization",
      name: "liigo",
      url: "https://liigo.dev",
      logo: { "@type": "ImageObject", url: "https://liigo.dev/icons/icon-512.png" },
    },
    mainEntityOfPage: `https://liigo.dev/posts/${post.slug}`,
    keywords: post.tags.join(", "),
  };

  return (
    <article className="py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* 文章头 */}
      <header className="pb-10">
        <div className="flex items-baseline gap-4 font-mono text-xs uppercase tracking-widest text-ink-3">
          <time dateTime={post.date}>{formatDateZh(post.date)}</time>
          <span>( {CATEGORIES[post.category] ?? post.category} )</span>
        </div>
        <h1 className="font-display mt-5 text-3xl leading-snug font-semibold tracking-tight sm:text-4xl">
          {post.title}
        </h1>
        {post.description && (
          <p className="mt-4 leading-loose text-ink-3">{post.description}</p>
        )}
        <div className="hairline-b mt-8" />
      </header>

      {/* 正文 */}
      <div className="prose-liigo">
        <MDXRemote source={post.content} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
      </div>

      {/* 文章脚 */}
      <footer className="mt-16">
        <div className="hairline-b" />
        <div className="flex items-baseline justify-between pt-6">
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-widest text-ink-3 transition-colors hover:text-ink"
          >
            ← ( 返回目录 )
          </Link>
          <div className="flex gap-3 font-mono text-xs text-ink-3">
            {post.tags.map((t) => (
              <span key={t}>#{t}</span>
            ))}
          </div>
        </div>
      </footer>
    </article>
  );
}
