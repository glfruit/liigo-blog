import type { NextConfig } from "next";

// EXPORT_STATIC=1 时产出纯静态站点（out/ → dist/），
// 供平台预览与未来 M5 国内镜像使用；默认 standalone 供 OpenNext 部署到 Workers。
const staticExport = process.env.EXPORT_STATIC === "1";

const nextConfig: NextConfig = {
  output: staticExport ? "export" : "standalone",
  images: { unoptimized: true },
};

export default nextConfig;
