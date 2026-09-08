import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";

export const dynamic = "force-static";

const SITE = "https://liigo.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts().map((p) => ({
    url: `${SITE}/posts/${p.slug}`,
    lastModified: p.date,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    { url: SITE, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/about`, changeFrequency: "yearly", priority: 0.4 },
    ...posts,
  ];
}
