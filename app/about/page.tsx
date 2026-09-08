import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "关于",
  description: "关于 liigo 和这份刊物。",
};

export default function AboutPage() {
  return (
    <div className="py-14">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-3">
        ( 关于 / About )
      </p>
      <h1 className="font-display mt-6 text-4xl font-semibold tracking-tight">
        liigo
      </h1>

      <div className="prose-liigo mt-10">
        <p>
          我是一名技术开发者，白天写代码，晚上写这个博客。
          liigo 这个名字藏着我的真名，也藏着一句提醒：
          <strong>少说，多做，做完记下来。</strong>
        </p>
        <p>
          这份刊物有三个固定栏目：<strong>AI 工具</strong>（评测与使用技巧）、
          <strong>AI 教程</strong>（经过亲手验证的深度教程）、
          <strong>建站笔记</strong>（这个博客本身的技术实现过程——
          它用 Next.js 构建，部署在 Cloudflare 边缘网络上，
          所有文章在 Obsidian 里写成）。
        </p>
        <p>
          这里没有热点搬运，没有 AI 生成的速食内容。
          每篇文章都从我自己的工作流里长出来，写之前都亲手跑通过。
        </p>
        <h2>联系</h2>
        <p>
          最快的方式是邮件：<a href="mailto:hi@liigo.dev">hi@liigo.dev</a>。
          也欢迎通过 RSS 订阅这份刊物。
        </p>
      </div>
    </div>
  );
}
