import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "关于",
  description: "关于 liigo 和这个博客。",
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
          我的本职工作是一名高职教师。白天上课，
          处理教学管理和行政方面的事务；这些事情不多的日子，
          就研究研究技术、写写东西。目前初步定下来：
          <strong>每周二、周四晚上写作</strong>，其余时间做其他事情。
        </p>
        <p>
          liigo 这个名字藏着我的真名，也藏着一句提醒：
          <strong>少说，多做，做完记下来。</strong>
        </p>
        <p>这个博客有几个固定栏目：</p>
        <ul>
          <li>
            <strong>AI 工具</strong>：评测与使用技巧
          </li>
          <li>
            <strong>AI 教程</strong>：经过亲手验证的深度教程
          </li>
          <li>
            <strong>思考</strong>：关于 AI、以及更广义的数字技术应用的
            人文与哲学层面的想法
          </li>
          <li>
            <strong>个人知识管理</strong>：我感兴趣也投入了很多时间的领域——
            如何积累、组织和复用知识
          </li>
          <li>
            <strong>建站笔记</strong>：这个博客本身的技术实现过程——
            它用 Next.js 构建，部署在 Cloudflare 边缘网络上，
            所有文章在 Obsidian 里写成
          </li>
        </ul>
        <p>
          这里没有热点搬运，没有 AI 生成的速食内容。
          每篇文章都从我自己的工作流里长出来，写之前都亲手跑通过。
        </p>
        <h2>联系</h2>
        <p>
          最快的方式是邮件：<a href="mailto:hi@liigo.dev">hi@liigo.dev</a>。
          也欢迎通过 RSS 订阅这个博客。
        </p>
      </div>
    </div>
  );
}
