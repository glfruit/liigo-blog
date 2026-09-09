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
        <p className="border-l-2 border-ink pl-4 text-lg leading-loose">
          充满好奇心，却越来越困惑，心里住着的还是那个年轻人。
        </p>
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
        <figure className="mt-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/about-curiosity.webp"
            alt="一个孩子模样的人站在空旷的原野上，仰望布满问号的天空"
            className="w-full"
          />
        </figure>
        <h2>联系</h2>
        <p>
          最快的方式是邮件：<a href="mailto:hi@liigo.dev">hi@liigo.dev</a>。
          也欢迎通过 RSS 订阅这个博客。
        </p>
      </div>
    </div>
  );
}
