// OpenNext Cloudflare 配置
// 文章站全量 SSG：增量缓存直接用 Workers 静态资产（cdn-cgi/_next_cache），
// 不做运行时 revalidate，无需 R2/KV。
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
});
